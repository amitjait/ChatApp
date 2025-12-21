import { useState } from "react";
import { useSocket } from "../contexts/SocketContext";
import { X } from "lucide-react";
import { createGroup } from "../apis/groupApis";

interface CreateGroupModalProps {
  onClose: () => void;
}

export const CreateGroupModal = ({ onClose }: CreateGroupModalProps) => {
  const { contacts, setFetchGroupFlag } = useSocket();
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      setError("Please enter a group name and select at least one member");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await createGroup(groupName, selectedMembers);
      console.log({ response });
      if (response.status != 201) throw new Error("Failed to create group");
      setFetchGroupFlag(true);
      onClose();
    } catch (err) {
      setError("Failed to create group. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            Create New Group
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter group name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Members ({selectedMembers.length})
            </label>
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
              {contacts.map((contact) => (
                <label
                  key={contact.id}
                  className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(contact.id)}
                    onChange={() => toggleMember(contact.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="ml-3 flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-semibold">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-gray-800">{contact.name}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};
