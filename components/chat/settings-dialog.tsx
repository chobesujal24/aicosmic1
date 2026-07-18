"use client";

import {
  SettingsIcon,
  XIcon,
  SunIcon,
  MoonIcon,
  MonitorIcon,
  RotateCcwIcon,
  DownloadIcon,
  Trash2Icon,
  InfoIcon,
  SparklesIcon,
  MessageSquareIcon,
  PaletteIcon,
  ShieldIcon,
  ZapIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings, type ResponseStyle, type FontSize } from "@/hooks/use-settings";
import { chatModels, modelsByProvider } from "@/lib/ai/models";
import { toast } from "sonner";

type SettingsTab = "general" | "chat" | "personalization" | "data" | "about";

export function SettingsDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const { theme, setTheme } = useTheme();
  const { settings, updateSetting, resetSettings } = useSettings();

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <PaletteIcon className="size-4" /> },
    { id: "chat", label: "Chat", icon: <MessageSquareIcon className="size-4" /> },
    { id: "personalization", label: "Personalization", icon: <SparklesIcon className="size-4" /> },
    { id: "data", label: "Data & Privacy", icon: <ShieldIcon className="size-4" /> },
    { id: "about", label: "About", icon: <InfoIcon className="size-4" /> },
  ];

  const handleExportChats = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/history`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `qyvera-ai-chats-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Chats exported successfully");
    } catch {
      toast.error("Failed to export chats");
    }
  }, []);

  const handleReset = useCallback(() => {
    resetSettings();
    toast.success("Settings reset to defaults");
  }, [resetSettings]);

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-2xl border border-border/40 bg-card/95 backdrop-blur-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border/30 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-foreground/5 ring-1 ring-border/40">
                    <SettingsIcon className="size-4 text-foreground/70" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                </div>
                <button
                  onClick={onClose}
                  className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <XIcon className="size-4" />
                </button>
              </div>

              <div className="flex h-[calc(85vh-80px)] min-h-0">
                {/* Sidebar tabs */}
                <div className="w-48 shrink-0 border-r border-border/30 p-3">
                  <nav className="flex flex-col gap-1">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-200 ${
                          activeTab === tab.id
                            ? "bg-foreground/10 text-foreground shadow-sm"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {activeTab === "general" && (
                        <GeneralSettings theme={theme} setTheme={setTheme} settings={settings} updateSetting={updateSetting} />
                      )}
                      {activeTab === "chat" && (
                        <ChatSettings settings={settings} updateSetting={updateSetting} />
                      )}
                      {activeTab === "personalization" && (
                        <PersonalizationSettings settings={settings} updateSetting={updateSetting} />
                      )}
                      {activeTab === "data" && (
                        <DataSettings onExport={handleExportChats} onReset={handleReset} />
                      )}
                      {activeTab === "about" && <AboutSettings />}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-4 text-sm font-semibold text-foreground">{children}</h3>;
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/30 bg-muted/20 px-4 py-3 mb-3">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-[12px] text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${
        enabled ? "bg-foreground" : "bg-muted-foreground/30"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function GeneralSettings({
  theme,
  setTheme,
  settings,
  updateSetting,
}: {
  theme: string | undefined;
  setTheme: (t: string) => void;
  settings: any;
  updateSetting: any;
}) {
  const themes = [
    { id: "light", label: "Light", icon: <SunIcon className="size-4" /> },
    { id: "dark", label: "Dark", icon: <MoonIcon className="size-4" /> },
    { id: "system", label: "System", icon: <MonitorIcon className="size-4" /> },
  ];

  const fontSizes: { id: FontSize; label: string }[] = [
    { id: "small", label: "Small" },
    { id: "medium", label: "Medium" },
    { id: "large", label: "Large" },
  ];

  return (
    <div>
      <SectionTitle>Appearance</SectionTitle>

      <SettingRow label="Theme" description="Choose your preferred color scheme">
        <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                theme === t.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow label="Font Size" description="Adjust the text size">
        <div className="flex gap-1 rounded-lg bg-muted/50 p-1">
          {fontSizes.map((fs) => (
            <button
              key={fs.id}
              onClick={() => updateSetting("fontSize", fs.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                settings.fontSize === fs.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {fs.label}
            </button>
          ))}
        </div>
      </SettingRow>

      <SettingRow label="Send with Enter" description="Press Enter to send messages">
        <ToggleSwitch
          enabled={settings.sendWithEnter}
          onToggle={() => updateSetting("sendWithEnter", !settings.sendWithEnter)}
        />
      </SettingRow>
    </div>
  );
}

function ChatSettings({
  settings,
  updateSetting,
}: {
  settings: any;
  updateSetting: any;
}) {
  const providers = Object.keys(modelsByProvider);

  return (
    <div>
      <SectionTitle>Chat Configuration</SectionTitle>

      <SettingRow label="Default Model" description="Select the AI model for new chats">
        <select
          value={settings.defaultModel}
          onChange={(e) => updateSetting("defaultModel", e.target.value)}
          className="rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
        >
          {providers.map((provider) => (
            <optgroup key={provider} label={provider.charAt(0).toUpperCase() + provider.slice(1)}>
              {modelsByProvider[provider].map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </SettingRow>

      <SettingRow label="Temperature" description={`Controls randomness (${settings.temperature})`}>
        <input
          type="range"
          min="0"
          max="2"
          step="0.1"
          value={settings.temperature}
          onChange={(e) => updateSetting("temperature", parseFloat(e.target.value))}
          className="w-32 accent-zinc-500"
        />
      </SettingRow>

      <SettingRow label="Max Tokens" description={`Maximum response length (${settings.maxTokens})`}>
        <input
          type="range"
          min="256"
          max="16384"
          step="256"
          value={settings.maxTokens}
          onChange={(e) => updateSetting("maxTokens", parseInt(e.target.value))}
          className="w-32 accent-zinc-500"
        />
      </SettingRow>

      <SettingRow label="Streaming" description="Show responses as they generate">
        <ToggleSwitch
          enabled={settings.streamingEnabled}
          onToggle={() => updateSetting("streamingEnabled", !settings.streamingEnabled)}
        />
      </SettingRow>

      <div className="mt-4">
        <label className="mb-2 block text-[13px] font-medium text-foreground">
          System Prompt
        </label>
        <textarea
          value={settings.systemPrompt}
          onChange={(e) => updateSetting("systemPrompt", e.target.value)}
          placeholder="Enter a custom system prompt to guide AI responses..."
          rows={4}
          className="w-full rounded-xl border border-border/30 bg-muted/20 px-4 py-3 text-[13px] text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-foreground/10 resize-none"
        />
      </div>
    </div>
  );
}

function PersonalizationSettings({
  settings,
  updateSetting,
}: {
  settings: any;
  updateSetting: any;
}) {
  const responseStyles: { id: ResponseStyle; label: string; desc: string }[] = [
    { id: "concise", label: "Concise", desc: "Brief, to-the-point answers" },
    { id: "balanced", label: "Balanced", desc: "Standard detail level" },
    { id: "detailed", label: "Detailed", desc: "In-depth explanations" },
  ];

  return (
    <div>
      <SectionTitle>Personalization</SectionTitle>

      <SettingRow label="Your Name" description="How the AI should address you">
        <input
          type="text"
          value={settings.customName}
          onChange={(e) => updateSetting("customName", e.target.value)}
          placeholder="Enter name"
          className="w-40 rounded-lg border border-border/50 bg-background px-3 py-1.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-foreground/20"
        />
      </SettingRow>

      <div className="mt-4">
        <label className="mb-3 block text-[13px] font-medium text-foreground">
          Response Style
        </label>
        <div className="grid grid-cols-3 gap-2">
          {responseStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => updateSetting("responseStyle", style.id)}
              className={`flex flex-col items-center rounded-xl border px-3 py-3 transition-all duration-200 ${
                settings.responseStyle === style.id
                  ? "border-foreground/30 bg-foreground/5 text-foreground shadow-sm"
                  : "border-border/30 bg-muted/20 text-muted-foreground hover:border-border/60 hover:bg-muted/40"
              }`}
            >
              <ZapIcon className={`size-4 mb-1.5 ${settings.responseStyle === style.id ? "text-foreground" : ""}`} />
              <span className="text-xs font-medium">{style.label}</span>
              <span className="mt-0.5 text-[10px] opacity-70">{style.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function DataSettings({
  onExport,
  onReset,
}: {
  onExport: () => void;
  onReset: () => void;
}) {
  return (
    <div>
      <SectionTitle>Data & Privacy</SectionTitle>

      <button
        onClick={onExport}
        className="mb-3 flex w-full items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3 text-[13px] font-medium text-foreground transition-all hover:bg-muted/40"
      >
        <DownloadIcon className="size-4 text-foreground/70" />
        Export All Chats
        <span className="ml-auto text-[11px] text-muted-foreground">JSON format</span>
      </button>

      <button
        onClick={onReset}
        className="mb-3 flex w-full items-center gap-3 rounded-xl border border-border/30 bg-muted/20 px-4 py-3 text-[13px] font-medium text-foreground transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
      >
        <RotateCcwIcon className="size-4" />
        Reset All Settings
        <span className="ml-auto text-[11px] text-muted-foreground">Restore defaults</span>
      </button>

      <button
        className="flex w-full items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-[13px] font-medium text-red-400 transition-all hover:bg-red-500/10 hover:border-red-500/40"
        onClick={() => {
          if (confirm("Are you sure you want to delete all conversations? This cannot be undone.")) {
            fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/api/history`, { method: "DELETE" });
            toast.success("All conversations deleted");
          }
        }}
      >
        <Trash2Icon className="size-4" />
        Delete All Conversations
        <span className="ml-auto text-[11px] text-red-400/60">Cannot be undone</span>
      </button>
    </div>
  );
}

function AboutSettings() {
  return (
    <div>
      <SectionTitle>About Qyvera AI</SectionTitle>

      <div className="rounded-2xl border border-border/30 p-6 text-center">
        <div className="mx-auto mb-4 flex size-16 items-center justify-center">
          <img src="/logo.png" alt="Qyvera AI" className="size-10 invert dark:invert-0 mix-blend-multiply dark:mix-blend-screen" />
        </div>
        <h3 className="text-lg font-bold text-foreground">Qyvera AI</h3>
        <p className="mt-1 text-sm text-muted-foreground">Version 1.0.0</p>
        <p className="mt-3 text-xs text-muted-foreground/70">
          Powered by Puter.com & NVIDIA NIM — Access top AI models including GPT, Claude, Gemini, DeepSeek, and more.
        </p>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px]">
          <span className="text-muted-foreground">AI Provider</span>
          <span className="font-medium text-foreground">Puter.com</span>
        </div>
        <div className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px]">
          <span className="text-muted-foreground">Models Available</span>
          <span className="font-medium text-foreground">30+</span>
        </div>
        <div className="flex items-center justify-between rounded-lg px-3 py-2 text-[13px]">
          <span className="text-muted-foreground">Framework</span>
          <span className="font-medium text-foreground">Next.js</span>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <a
          href="https://puter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-center text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          Puter.com
        </a>
        <a
          href="https://docs.puter.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 rounded-lg border border-border/30 bg-muted/20 px-3 py-2 text-center text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          API Docs
        </a>
      </div>
    </div>
  );
}
