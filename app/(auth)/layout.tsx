export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh w-screen bg-background">
      {/* Left panel — form */}
      <div className="flex w-full flex-col p-8 xl:w-[520px] xl:shrink-0 xl:border-r xl:border-border/30 md:p-16">
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-6">
          <div className="flex flex-col gap-2">{children}</div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[11px] text-muted-foreground/50">
          Powered by Puter.com & NVIDIA NIM
        </p>
      </div>

      {/* Right panel — decorative */}
      <div className="relative hidden flex-1 overflow-hidden xl:flex">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-100 via-white to-zinc-200 dark:from-zinc-900 dark:via-neutral-900 dark:to-zinc-950" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-8 p-16">
          <div className="flex size-24 items-center justify-center">
            <img src="/logo.png" alt="Qyvera AI" className="size-24 object-contain invert dark:invert-0" />
          </div>
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white"
              style={{ fontFamily: "'Inter', 'SF Pro Display', system-ui, sans-serif" }}
            >
              Qyvera AI
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Your gateway to top AI models. Chat with GPT, Claude, Gemini,
              Grok, DeepSeek and more — all in one place.
            </p>
          </div>

          {/* Model logos strip */}
          <div className="mt-4 flex items-center gap-3">
            {["openai", "anthropic", "google", "xai", "deepseek", "mistral", "nvidia"].map((p) => (
              <div key={p} className="flex size-10 items-center justify-center rounded-xl bg-black/5 ring-1 ring-black/10 backdrop-blur-sm dark:bg-white/5 dark:ring-white/10">
                <img
                  src={`https://models.dev/logos/${p}.svg`}
                  alt={p}
                  className="size-5 dark:invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
