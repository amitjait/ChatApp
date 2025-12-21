import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { ActiveChat, Message } from "../types";
import { MessageList } from "./MessageList";
import { Send, Paperclip, Video, Phone } from "lucide-react";
import {
  getGroupMessages,
  getPrivateMessages,
  uploadFile,
} from "../apis/messages";
import { useCall } from "../contexts/CallContext";
import { notifyError } from "../utils/CutomizedToast";
import { formatTime } from "../utils/helprer";
import Avatar from "../utils/Avatar";

interface ChatAreaProps {
  activeChat: ActiveChat | null;
}

type CallStatus = "idle" | "calling" | "ringing" | "connected";

const Spinner = ({ size = 8 }) => (
  <div
    className={`w-${size} h-${size} border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin`}
  />
);

export const ChatArea = ({ activeChat }: ChatAreaProps) => {
  const { user } = useAuth();
  const {
    sendPrivateFile,
    sendGroupFile,
    sendPrivateMessage,
    sendGroupMessage,
    messages,
  } = useSocket();

  const {
    startCall,
    acceptCall,
    endCall,
    incomingCall,
    localStream,
    remoteStream,
    callDuration,
    callType,
    setCallType,
  } = useCall();

  const [messageText, setMessageText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fetchedMessages, setFetchedMessages] = useState<Message[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);

  const [callStatus, setCallStatus] = useState<CallStatus>("idle");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isInCall = !!localStream || !!remoteStream;

  /* ----------------- MESSAGES ----------------- */
  const handleSendMessage = () => {
    if (!messageText.trim() || !activeChat) return;

    if (activeChat.type === "user")
      sendPrivateMessage(activeChat.id, messageText);
    else sendGroupMessage(activeChat.id, messageText);

    setMessageText("");
  };

  /* ----------------- FILE UPLOAD ----------------- */
  const sanitizeFileName = (name: string) =>
    name
      .trim()
      .replace(/[\s\(\)]+/g, "_")
      .replace(/[^a-zA-Z0-9_\-\.]/g, "")
      .toLowerCase();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChat) return;

    setUploading(true);
    try {
      const blobName = sanitizeFileName(file.name);
      const uploadRes = await uploadFile(file, blobName);

      if (uploadRes?.status === 200) {
        const data = uploadRes.data.data;
        if (activeChat.type === "user")
          sendPrivateFile(activeChat.id, data.fileUrl, file.name, blobName);
        else sendGroupFile(activeChat.id, data.fileUrl, file.name, blobName);
      }
    } catch {
      notifyError({ message: "File upload failed" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ----------------- FETCH MESSAGES ----------------- */
  const getMessages = async (chat: ActiveChat) => {
    try {
      const res =
        chat.type === "user"
          ? await getPrivateMessages(chat.id)
          : await getGroupMessages(chat.id);

      if (res.status !== 200) throw new Error();
      setFetchedMessages(res.data.data);
    } catch {
      notifyError({ message: "Failed to fetch messages" });
    }
  };

  useEffect(() => {
    if (activeChat) getMessages(activeChat);
  }, [activeChat]);

  useEffect(() => {
    if (!activeChat) return;
    const all = [...fetchedMessages, ...messages].filter((m) =>
      activeChat.type === "user"
        ? (m.senderId === activeChat.id && m.receiverId === user?.id) ||
          (m.senderId === user?.id && m.receiverId === activeChat.id)
        : m.groupId === activeChat.id
    );
    setFilteredMessages([...new Map(all.map((m) => [m.id, m])).values()]);
  }, [fetchedMessages, messages, activeChat, user]);

  useEffect(() => {
    if (incomingCall) {
      setCallStatus("ringing");
    } else if (remoteStream) {
      setCallStatus("connected");
    } else if (callType) {
      setCallStatus("calling");
    } else {
      setCallStatus("idle");
    }
  }, [incomingCall, remoteStream, callType]);

  /* ----------------- EMPTY STATE ----------------- */
  if (!activeChat)
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p>Select a chat to start messaging</p>
      </div>
    );

  /* ======================== UI ======================== */
  return (
    <div className="flex-1 flex flex-col bg-white relative">
      {/* ---------- HEADER ---------- */}
      <div className="p-4 border-b flex justify-between items-center">
        <div>
          <h3 className="font-semibold">{activeChat.name}</h3>
          <p className="text-xs text-gray-500">
            {activeChat.type === "user" ? "Direct Message" : "Group Chat"}
          </p>
        </div>

        {activeChat.type === "user" && (
          <div className="flex gap-2">
            <button
              disabled={isInCall}
              onClick={() => {
                setCallType("audio");
                setCallStatus("calling");
                startCall(activeChat.id, "audio");
              }}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <Phone />
            </button>

            <button
              disabled={isInCall}
              onClick={() => {
                setCallType("video");
                setCallStatus("calling");
                startCall(activeChat.id, "video");
              }}
              className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"
            >
              <Video />
            </button>
          </div>
        )}
      </div>

      {/* ---------- MESSAGES ---------- */}
      <MessageList messages={filteredMessages} />

      {/* ---------- INPUT ---------- */}
      <div className="p-4 border-t flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={handleFileUpload}
        />
        <button onClick={() => fileInputRef.current?.click()}>
          {!uploading ? <Paperclip /> : <Spinner />}
        </button>

        <input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.shiftKey && handleSendMessage()
          }
          className="flex-1 border rounded p-2"
        />

        <button onClick={handleSendMessage}>
          <Send />
        </button>
      </div>

      {/* ---------- INCOMING CALL ---------- */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded">
            <p>{incomingCall.fromUserName} is calling…</p>

            <button
              className="bg-green-500 text-white px-4 py-2 rounded m-2"
              onClick={() => {
                setCallType(incomingCall.callType);
                acceptCall(incomingCall);
              }}
            >
              Accept
            </button>

            <button
              className="bg-red-500 text-white px-4 py-2 rounded m-2"
              onClick={() => {
                endCall(incomingCall.fromUserId);
                setCallStatus("idle");
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}

      {/* ---------- ACTIVE CALL ---------- */}
      {(localStream || remoteStream) && (
        <div className="fixed inset-0 bg-black z-40 flex flex-col items-center justify-center text-white">
          {/* ⏱️ Call timer */}
          <div className="absolute top-6 text-sm opacity-80">
            {callDuration === 0 ? "Calling..." : formatTime(callDuration)}
          </div>

          {/* VIDEO CALL */}
          {callType === "video" && remoteStream && (
            <>
              <video
                autoPlay
                ref={(v) => v && (v.srcObject = remoteStream)}
                className="w-full h-full object-cover"
              />

              {localStream && (
                <video
                  autoPlay
                  muted
                  ref={(v) => v && (v.srcObject = localStream)}
                  className="w-32 h-32 absolute bottom-24 right-6 rounded-lg border"
                />
              )}
            </>
          )}

          {/* AUDIO CALL */}
          {callType === "audio" && (
            <>
              {/* Play remote audio when connected */}
              {remoteStream && (
                <audio
                  autoPlay
                  playsInline
                  ref={(a) => a && (a.srcObject = remoteStream)}
                />
              )}
              <Avatar
                name={
                  callStatus === "connected"
                    ? activeChat.name
                    : user?.name || "You"
                }
                size={120}
              />
            </>
          )}

          {/* END CALL */}
          <button
            onClick={() => {
              endCall(activeChat.id);
              setCallStatus("idle");
            }}
            className="absolute bottom-6 bg-red-600 px-6 py-3 rounded-full"
          >
            End Call
          </button>
        </div>
      )}
    </div>
  );
};
