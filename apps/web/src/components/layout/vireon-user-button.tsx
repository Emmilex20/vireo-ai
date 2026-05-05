"use client";

import { UserButton } from "@clerk/nextjs";
import {
  CreditCard,
  History,
  UserRound,
  WalletCards,
} from "lucide-react";

type VireonUserButtonProps = {
  avatarBox?: string;
  trigger?: string;
};

export function VireonUserButton({
  avatarBox = "h-9 w-9",
  trigger = "inline-flex h-full w-full items-center justify-center rounded-full p-0",
}: VireonUserButtonProps) {
  return (
    <UserButton
      appearance={{
        elements: {
          avatarBox,
          userButtonTrigger: trigger,
          userButtonPopoverCard:
            "w-[19rem] rounded-[1.35rem] border border-white/10 bg-[#181b1f] p-0 text-white shadow-[0_24px_70px_rgba(0,0,0,0.45)]",
          userButtonPopoverMain: "bg-transparent p-0",
          userButtonPopoverFooter: "hidden",
          userButtonPopoverUserPreview:
            "border-b border-white/10 px-4 py-4",
          userButtonPopoverUserPreviewAvatarBox: "h-10 w-10",
          userPreviewMainIdentifier: "text-sm font-bold text-white",
          userPreviewSecondaryIdentifier: "text-xs text-slate-400",
          userButtonPopoverActions: "gap-0 p-2",
          userButtonPopoverActionButton:
            "h-11 rounded-xl px-3 text-slate-200 transition hover:bg-white/8 hover:text-white",
          userButtonPopoverActionButtonIcon: "size-4 text-slate-300",
          userButtonPopoverActionButtonText: "text-sm font-semibold",
        },
      }}
    >
      <UserButton.MenuItems>
        <UserButton.Link
          label="View Profile"
          href="/profile"
          labelIcon={<UserRound className="size-4" />}
        />
        <UserButton.Link
          label="Subscriptions"
          href="/billing/subscription"
          labelIcon={<CreditCard className="size-4" />}
        />
        <UserButton.Action label="manageAccount" />
        <UserButton.Link
          label="Credits History"
          href="/billing/credits"
          labelIcon={<WalletCards className="size-4" />}
        />
        <UserButton.Link
          label="Previous version"
          href="/coming-soon?feature=Previous%20version"
          labelIcon={<History className="size-4" />}
        />
        <UserButton.Action label="signOut" />
      </UserButton.MenuItems>
    </UserButton>
  );
}
