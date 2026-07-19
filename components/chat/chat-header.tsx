"use client";

import { PanelLeftIcon, SparklesIcon } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { VisibilitySelector, type VisibilityType } from "./visibility-selector";
import { SidebarUserNav } from "./sidebar-user-nav";

function PureChatHeader({
  chatId,
  selectedVisibilityType,
  isReadonly,
  title,
}: {
  chatId?: string;
  selectedVisibilityType?: VisibilityType;
  isReadonly?: boolean;
  title?: string;
}) {
  const { state, toggleSidebar, isMobile } = useSidebar();

  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 flex h-14 items-center gap-2 bg-sidebar px-3">
      <Button
        className="md:hidden"
        onClick={toggleSidebar}
        size="icon-sm"
        variant="ghost"
      >
        <PanelLeftIcon className="size-4" />
      </Button>

      <Link
        className="flex items-center gap-2 rounded-lg px-2 py-1 md:hidden"
        href="/"
      >
        <div className="flex size-6 items-center justify-center">
          <img src="/logo.png" alt="Qyvera AI" className="size-5 object-contain invert dark:invert-0" />
        </div>
        <span className="text-sm font-semibold text-foreground tracking-tight" style={{ fontFamily: "'SF Pro Display', 'Inter', system-ui, sans-serif", letterSpacing: '-0.02em' }}>
          Qyvera AI
        </span>
      </Link>

      {!isReadonly && chatId && selectedVisibilityType && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
        />
      )}

      <div className="hidden items-center gap-2 md:ml-auto md:flex">
        <SidebarUserNav />
      </div>
    </header>
  );
}

export const ChatHeader = memo(
  PureChatHeader,
  (prevProps, nextProps) =>
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
);
