import { ChatHeader } from "@/components/chat/chat-header";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "lucide-react";
import Link from "next/link";

export default function PlansPage() {
  return (
    <>
      <ChatHeader title="Plans & Pricing" />
      <div className="flex h-full w-full flex-col overflow-y-auto px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold tracking-tight mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              Choose your plan
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Unlock the full potential of Qyvera AI with premium models, faster response times, and higher limits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="relative flex flex-col rounded-3xl border border-border/40 bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Basic</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground font-medium">/ forever</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Perfect for everyday queries and testing out open-source AI models.
                </p>
              </div>

              <div className="flex flex-col gap-3 flex-1 mb-8">
                {[
                  "Access to standard open-source models",
                  "Fast AI inference",
                  "Basic canvas rendering",
                  "Standard message limits apply",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                      <CheckIcon size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full rounded-xl" asChild>
                <Link href="/">Current Plan</Link>
              </Button>
            </div>

            {/* Pro Plan */}
            <div className="relative flex flex-col rounded-3xl border border-purple-500/30 bg-card p-8 shadow-lg shadow-purple-500/5 transition-shadow hover:shadow-xl">
              <div className="absolute -top-3 right-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                Most Popular
              </div>
              
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Pro</h2>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">$15</span>
                  <span className="text-muted-foreground font-medium">/ month</span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  For power users who need access to frontier models like Claude Opus and GPT-5.6.
                </p>
              </div>

              <div className="flex flex-col gap-3 flex-1 mb-8">
                {[
                  "Extended Access to 30+ premium models (GPT-5.6, Claude 4.8)",
                  "Advanced Canvas live-rendering",
                  "Extended messaging limits",
                  "Early access to new features",
                  "Priority API routing",
                ].map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-500">
                      <CheckIcon size={12} strokeWidth={3} />
                    </div>
                    <span className="text-sm font-medium">{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md">
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
