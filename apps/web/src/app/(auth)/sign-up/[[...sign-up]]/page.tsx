import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <SignUp
        appearance={{
          elements: {
            card: "bg-white/5 border border-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl",
            headerTitle: "text-white",
            headerSubtitle: "text-slate-400",
            socialButtonsBlockButton:
              "border border-white/10 bg-white/5 text-white hover:bg-white/10",
            formButtonPrimary:
              "bg-emerald-500 text-black hover:bg-emerald-400",
            formFieldInput:
              "bg-black/30 border border-white/10 text-white",
            footerActionLink: "text-emerald-400 hover:text-emerald-300",
            identityPreviewText: "text-white",
            formFieldLabel: "text-slate-300"
          }
        }}
      />
    </div>
  );
}