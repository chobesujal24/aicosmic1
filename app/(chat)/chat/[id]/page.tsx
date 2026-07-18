import { ActiveChatProvider } from "@/hooks/use-active-chat";
import { ChatShell } from "@/components/chat/shell";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  return (
    <ActiveChatProvider>
      <ChatShell />
    </ActiveChatProvider>
  );
}
