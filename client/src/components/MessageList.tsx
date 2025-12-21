import { useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Message } from "../types";
import { Download } from "lucide-react";
import { notifyError } from "../utils/CutomizedToast";
import { generateSasUrl } from "../apis/messages";
import { formatDayLabel } from "../utils/helprer";

interface MessageListProps {
  messages: Message[];
}

export const MessageList = ({ messages }: MessageListProps) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const downloadFile = async (fileUrl: string) => {
    try {
      // Extract blobName from full URL
      const fileName = fileUrl.split("/").pop() || "";

      // Generate SAS URL
      const sasUrlRes = await generateSasUrl(fileName); // returns string URL

      if (sasUrlRes?.status !== 200) {
        notifyError({ message: "Failed to generate download URL" });
        return;
      }
      const sasUrl = sasUrlRes?.data?.data.fileUrl;
      const link = document.createElement("a");
      link.href = sasUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      notifyError({ message: "Failed to download file" });
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => {
        const prevMessage = messages[index - 1];

        const showDateSeparator =
          !prevMessage ||
          new Date(message.timestamp).toDateString() !==
            new Date(prevMessage.timestamp).toDateString();

        const isOwnMessage = message.senderId === user?.id;

        return (
          <div key={message.id} className="w-full">
            {/* DATE SEPARATOR */}
            {showDateSeparator && (
              <div className="w-full flex justify-center my-3">
                <div className="text-xs px-3 py-1 rounded-full bg-gray-300 text-gray-700">
                  {formatDayLabel(message.timestamp)}
                </div>
              </div>
            )}

            {/* MESSAGE ROW */}
            <div
              className={`flex w-full ${
                isOwnMessage ? "justify-end" : "justify-start"
              }`}
            >
              <div className="max-w-xs lg:max-w-md">
                {!isOwnMessage && (
                  <p className="text-xs text-gray-600 mb-1 font-medium">
                    {message.senderName}
                  </p>
                )}

                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isOwnMessage
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {message.content && (
                    <p className="text-sm break-words">{message.content}</p>
                  )}

                  {message.fileUrl && (
                    <div
                      className={`flex items-center mt-2 p-2 rounded-lg cursor-pointer ${
                        isOwnMessage ? "bg-blue-700" : "bg-gray-200"
                      }`}
                    >
                      <span className="text-xs truncate flex-1">
                        {message.fileName}
                      </span>
                      <Download
                        className="w-4 h-4 ml-2"
                        onClick={async () => {
                          await downloadFile(message.fileUrl || "");
                        }}
                      />
                    </div>
                  )}

                  <p
                    className={`text-xs mt-1 text-right ${
                      isOwnMessage ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <div ref={messagesEndRef} />
    </div>
  );
};
