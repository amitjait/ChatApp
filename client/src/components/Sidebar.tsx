import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { Users, MessageSquare, LogOut, UserPlus } from "lucide-react";
import { ActiveChat } from "../types";

interface SidebarProps {
  activeChat: ActiveChat | null;
  onSelectChat: (chat: ActiveChat) => void;
  onCreateGroup: () => void;
}

export const Sidebar = ({
  activeChat,
  onSelectChat,
  onCreateGroup,
}: SidebarProps) => {
  const { user, logout } = useAuth();
  const { contacts, groups, onlineUsers, connected } = useSocket();
  const [activeTab, setActiveTab] = useState<"contacts" | "groups">("contacts");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            <h2 className="text-lg font-semibold">ChatApp</h2>
          </div>
          <button
            onClick={() => setShowLogoutModal(true)}
            // onClick={logout}
            className="p-2 hover:bg-blue-500 rounded-lg transition"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-lg font-semibold">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="font-medium">{user?.name}</p>
            <p className="text-xs text-blue-100 flex items-center">
              <span
                className={`w-2 h-2 rounded-full mr-2 ${
                  connected ? "bg-green-400" : "bg-red-400"
                }`}
              ></span>
              {connected ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("contacts")}
          className={`flex-1 py-3 text-sm font-medium transition ${
            activeTab === "contacts"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Contacts
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          className={`flex-1 py-3 text-sm font-medium transition ${
            activeTab === "groups"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Groups
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "contacts" && contacts ? (
          <div>
            {contacts
              ?.filter((u) => u.id !== user?.id)
              .map((contact) => (
                <button
                  key={contact.id}
                  onClick={() =>
                    onSelectChat({
                      type: "user",
                      id: contact.id,
                      name: contact.name,
                    })
                  }
                  className={`w-full p-4 flex items-center hover:bg-gray-50 transition border-b border-gray-100 ${
                    activeChat?.type === "user" && activeChat?.id === contact.id
                      ? "bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    {onlineUsers.has(contact.id) && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="ml-3 text-left">
                    <p className="font-medium text-gray-800">{contact.name}</p>
                    <p className="text-xs text-gray-500">
                      {onlineUsers.has(contact.id) ? "Online" : "Offline"}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        ) : (
          <div>
            <button
              onClick={onCreateGroup}
              className="w-full p-4 flex items-center justify-center bg-blue-50 hover:bg-blue-100 transition border-b border-gray-100"
            >
              <UserPlus className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-blue-600 font-medium">
                Create New Group
              </span>
            </button>
            {groups.map((group) => (
              <button
                key={group.id}
                onClick={() =>
                  onSelectChat({
                    type: "group",
                    id: group.id,
                    name: group.name,
                  })
                }
                className={`w-full p-4 flex items-center hover:bg-gray-50 transition border-b border-gray-100 ${
                  activeChat?.type === "group" && activeChat?.id === group.id
                    ? "bg-blue-50"
                    : ""
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white">
                  <Users className="w-6 h-6" />
                </div>
                <div className="ml-3 text-left">
                  <p className="font-medium text-gray-800">{group.name}</p>
                  <p className="text-xs text-gray-500">
                    {group.members.length} members
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-scaleIn">
            <h3 className="text-lg font-semibold text-gray-800">
              Confirm Logout
            </h3>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to logout?
            </p>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  logout();
                }}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
