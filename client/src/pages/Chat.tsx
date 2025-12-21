import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { CreateGroupModal } from "../components/CreateGroupModal";
import { ActiveChat } from "../types";
import { ChatArea } from "../components/ChatArea";

export const Chat = () => {
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        activeChat={activeChat}
        onSelectChat={setActiveChat}
        onCreateGroup={() => setShowCreateGroup(true)}
      />
      <ChatArea activeChat={activeChat} />
      {showCreateGroup && (
        <CreateGroupModal onClose={() => setShowCreateGroup(false)} />
      )}
    </div>
  );
};
