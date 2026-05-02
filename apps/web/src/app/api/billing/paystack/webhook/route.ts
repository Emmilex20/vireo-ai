import crypto from "crypto"
import { NextResponse } from "next/server"
import {
  createPaymentAuditLog,
  db,
  grantCreditsForPayment,
  grantSubscriptionRenewalCredits
} from "@vireon/db"
import { getCreditPackByKey } from "@/lib/billing/credit-packs"
import {
  getNextSubscriptionPeriodEnd,
  getSubscriptionAmountKobo,
  getSubscriptionCreditsForCycle,
  SUBSCRIPTION_PLANS,
  type SubscriptionBillingCycle,
  type SubscriptionPlanKey
} from "@/lib/billing/plans"
import { logError } from "@/lib/monitoring/logger"

function getNextMonthlyPeriodEnd() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
}

export async function POST(req: Request) {
  let paymentReference: string | undefined

  try {
    const secret =
      process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_SECRET_KEY

    if (!secret) {
      return NextResponse.json(
        { error: "Paystack webhook secret is not configured" },
        { status: 500 }
      )
    }

    const rawBody = await req.text()
    const signature = req.headers.get("x-paystack-signature")

    const expected = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex")

    if (!signature || signature !== expected) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    const event = JSON.parse(rawBody)
    const eventType = event.event
    const data = event.data ?? {}
    const metadata = data.metadata ?? {}
    paymentReference = data.reference

    if (eventType === "subscription.create") {
      const userId = metadata.userId
      const planKey = metadata.planKey

      if (!userId || !planKey) {
        return NextResponse.json({ received: true })
      }

      const plan =
        SUBSCRIPTION_PLANS[planKey as keyof typeof SUBSCRIPTION_PLANS]

      if (!plan) {
        return NextResponse.json({ received: true })
      }

      await db.subscription.upsert({
        where: { userId },
        update: {
          plan: planKey,
          status: "active",
          creditsPerMonth: plan.credits,
          currentPeriodEnd: getNextMonthlyPeriodEnd(),
          paystackSubscriptionCode: data.subscription_code,
          paystackEmailToken: data.email_token
        },
        create: {
          userId,
          plan: planKey,
          status: "active",
          creditsPerMonth: plan.credits,
          currentPeriodEnd: getNextMonthlyPeriodEnd(),
          paystackSubscriptionCode: data.subscription_code,
          paystackEmailToken: data.email_token
        }
      })

      return NextResponse.json({ received: true })
    }

    if (eventType === "invoice.payment_success") {
      const subscriptionCode = data.subscription?.subscription_code
      const reference = data.transaction?.reference || data.reference

      if (!reference) {
        return NextResponse.json({ received: true })
      }

      const subscription = await db.subscription.findFirst({
        where: {
          paystackSubscriptionCode: subscriptionCode
        }
      })

      if (!subscription) {
        return NextResponse.json({ received: true })
      }

      await grantSubscriptionRenewalCredits({
        userId: subscription.userId,
        subscriptionId: subscription.id,
        reference,
        plan: subscription.plan,
        credits: subscription.creditsPerMonth,
        rawPayload: event
      })

      await db.subscription.update({
        where: { id: subscription.id },
        data: {
          status: "active",
          currentPeriodEnd: getNextMonthlyPeriodEnd()
        }
      })

      return NextResponse.json({ received: true })
    }

    if (eventType === "subscription.disable") {
      const userId = metadata.userId
      const subscriptionCode = data.subscription_code

      if (userId) {
        await db.subscription.updateMany({
          where: { userId },
          data: { status: "cancelled" }
        })

        return NextResponse.json({ received: true })
      }

      if (subscriptionCode) {
        await db.subscription.updateMany({
          where: { paystackSubscriptionCode: subscriptionCode },
          data: { status: "cancelled" }
        })
      }

      return NextResponse.json({ received: true })
    }

    if (eventType !== "charge.success") {
      return NextResponse.json({ received: true })
    }

    if (metadata.productType === "subscription") {
      const userId = metadata.userId
      const planKey = metadata.planKey as SubscriptionPlanKey | undefined
      const billingCycle: SubscriptionBillingCycle =
        metadata.billingCycle === "annual" ? "annual" : "monthly"

      if (!userId || !planKey) {
        await createPaymentAuditLog({
          reference: data.reference,
          provider: "paystack",
          eventType,
          status: "rejected",
          reason: "Missing subscription metadata",
          rawPayload: event,
        })

        return NextResponse.json({ received: true })
      }

      const plan = SUBSCRIPTION_PLANS[planKey]

      if (!plan) {
        await createPaymentAuditLog({
          reference: data.reference,
          provider: "paystack",
          eventType,
          status: "rejected",
          reason: "Invalid subscription plan metadata",
          rawPayload: event,
        })

        return NextResponse.json({ received: true })
      }

      const metadataRate = Number(metadata.ngnPerUsd)

      if (!metadataRate || !Number.isFinite(metadataRate)) {
        await createPaymentAuditLog({
          reference: data.reference,
          provider: "paystack",
          eventType,
          status: "rejected",
          reason: "Missing subscription exchange rate metadata",
          rawPayload: event,
        })

        return NextResponse.json({ received: true })
      }

      const expectedAmount = getSubscriptionAmountKobo(
        planKey,
        billingCycle,
        metadataRate
      )

      if (
        Number(data.amount) !== expectedAmount ||
        data.currency !== "NGN" ||
        Number(metadata.amountKobo) !== expectedAmount
      ) {
        await createPaymentAuditLog({
          reference: data.reference,
          provider: "paystack",
          eventType,
          status: "rejected",
          reason: "Subscription payment metadata mismatch",
          rawPayload: event,
        })

        return NextResponse.json({ received: true })
      }

      const subscription = await db.subscription.upsert({
        where: { userId },
        update: {
          plan: planKey,
          status: "active",
          creditsPerMonth: plan.credits,
          currentPeriodEnd: getNextSubscriptionPeriodEnd(billingCycle),
          paystackSubscriptionCode: null,
          paystackEmailToken: null
        },
        create: {
          userId,
          plan: planKey,
          status: "active",
          creditsPerMonth: plan.credits,
          currentPeriodEnd: getNextSubscriptionPeriodEnd(billingCycle),
          paystackSubscriptionCode: null,
          paystackEmailToken: null
        }
      })

      await grantSubscriptionRenewalCredits({
        userId,
        subscriptionId: subscription.id,
        reference: data.reference,
        plan: `${plan.name} ${billingCycle}`,
        credits: getSubscriptionCreditsForCycle(planKey, billingCycle),
        rawPayload: event
      })

      await createPaymentAuditLog({
        reference: data.reference,
        provider: "paystack",
        eventType,
        status: "accepted",
        reason: "Subscription payment accepted",
        rawPayload: event,
      })

      return NextResponse.json({ received: true })
    }

    if (metadata.productType !== "credit_pack") {
      return NextResponse.json({ received: true })
    }

    const pack = getCreditPackByKey(metadata.packKey)

    if (!pack) {
    await createPaymentAuditLog({
      reference: data.reference,
      provider: "paystack",
      eventType,
      status: "rejected",
      reason: "Invalid credit pack metadata",
      rawPayload: event,
      })

      return NextResponse.json({ received: true })
    }

    if (
      Number(metadata.credits) !== pack.credits ||
      Number(data.amount) !== pack.amountKobo ||
      data.currency !== pack.currency
    ) {
    await createPaymentAuditLog({
      reference: data.reference,
      provider: "paystack",
      eventType,
      status: "rejected",
      reason: "Payment metadata mismatch",
      rawPayload: event,
      })

      return NextResponse.json({ received: true })
    }

    await grantCreditsForPayment({
      userId: metadata.userId,
      reference: data.reference,
      provider: "paystack",
      amount: pack.amountKobo,
      currency: pack.currency,
      packKey: pack.key,
      credits: pack.credits,
      rawPayload: event,
    })

    await createPaymentAuditLog({
      reference: data.reference,
      provider: "paystack",
      eventType,
      status: "accepted",
      reason: "Credit pack payment accepted",
      rawPayload: event,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    logError(error, {
      route: "paystack_webhook",
      paymentReference
    })

    return NextResponse.json(
      { error: "Failed to process Paystack webhook" },
      { status: 500 }
    )
  }
}
