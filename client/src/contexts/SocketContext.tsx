import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./AuthContext";
import { Message, Contact, Group } from "../types";
import { fetchGroupsApi, fetchUsersApi } from "../apis/fetchApis";
import { notifyError } from "../utils/CutomizedToast";
import {
  saveGroupFile,
  saveGroupMessage,
  savePrivateFile,
  savePrivateMessage,
} from "../apis/messages";

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  sendPrivateMessage: (receiverId: string, content: string) => void;
  sendPrivateFile: (
    receiverId: string,
    fileUrl: string,
    fileName: string,
    blobName: string
  ) => void;
  sendGroupMessage: (groupId: string, content: string) => void;
  sendGroupFile: (
    groupId: string,
    fileUrl: string,
    fileName: string,
    blobName: string
  ) => void;
  messages: Message[];
  contacts: Contact[];
  groups: Group[];
  onlineUsers: Set<string>;
  setFetchGroupFlag: Dispatch<SetStateAction<boolean>>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within SocketProvider");
  return ctx;
};

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [fetchGroupFlag, setFetchGroupFlag] = useState(false);

  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  const API_URL = import.meta.env.VITE_API_URL;

  const getUsers = async () => {
    try {
      const result = await fetchUsersApi();
      if (result.status !== 200) throw new Error("Failed to fetch users");
      setContacts(result?.data?.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getGroups = async () => {
    try {
      const result = await fetchGroupsApi();
      if (result?.status === 200) {
        setGroups(result?.data?.data);
      } else {
        notifyError({ message: "Failed to fetch groups" });
      }
    } catch (error) {
      console.error(error);
      notifyError({ message: "Failed to fetch groups" });
    }
  };

  /* ---------------- SOCKET INIT ---------------- */
  useEffect(() => {
    if (!token || !user) return;

    const s = io(API_URL, { auth: { token } });

    s.on("connect", () => {
      setConnected(true);
    });
    s.on("disconnect", () => setConnected(false));

    /* ---------- RECEIVE PRIVATE MESSAGE ---------- */
    s.on("private_message", (data: any) => {
      const { id, senderId, senderName, receiverId, content, timestamp } = data;
      const msg: Message = {
        id: id || `${Date.now()}`,
        senderId: senderId,
        senderName: senderName,
        receiverId: receiverId,
        content: content || "",
        timestamp: timestamp || new Date(data.time).getTime(),
      };
      setMessages((prev) => [...prev, msg]);
    });

    /* ---------- RECEIVE PRIVATE FILE ---------- */
    s.on("private_file", (data: any) => {
      const {
        id,
        senderId,
        senderName,
        receiverId,
        content,
        timestamp,
        fileUrl,
        fileName,
      } = data;
      const msg: Message = {
        id: id || `${Date.now()}`,
        senderId: senderId,
        senderName: senderName,
        receiverId: receiverId,
        content: content || "",
        timestamp: timestamp || new Date(data.time).getTime(),
        fileUrl: fileUrl,
        fileName: fileName,
      };
      setMessages((prev) => [...prev, msg]);
    });

    /* ---------- RECEIVE GROUP MESSAGE ---------- */
    s.on("group_message", (data: any) => {
      const { id, senderId, senderName, groupId, content, timestamp } = data;
      const msg: Message = {
        id: id || `${Date.now()}`,
        senderId: senderId,
        senderName: senderName,
        groupId: groupId,
        content: content || "",
        timestamp: timestamp || new Date(data.time).getTime(),
      };

      setMessages((prev) => [...prev, msg]);
    });

    /* ---------- RECEIVE GROUP FILE ---------- */
    s.on("group_file", (data: any) => {
      const {
        id,
        senderId,
        senderName,
        groupId,
        content,
        timestamp,
        fileUrl,
        fileName,
      } = data;
      const msg: Message = {
        id: id || `${Date.now()}`,
        senderId: senderId,
        senderName: senderName,
        groupId: groupId,
        content: content || "",
        timestamp: timestamp || new Date(data.time).getTime(),
        fileUrl: fileUrl,
        fileName: fileName,
      };
      setMessages((prev) => [...prev, msg]);
    });

    s.on("users_online", (data: { count: number; users: string[] }) => {
      const { users } = data;

      setOnlineUsers((prev) => new Set([...prev, ...users]));
    });

    s.on("user_online", (userId: string) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.add(userId);
        return newSet;
      });
    });

    s.on("user_offline", (userId: string) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    s.on("connect_error", (err) => {
      console.error("SOCKET CONNECT ERROR:", err.message);
    });

    setSocket(s);
    return () => {
      s.disconnect(); // ✅ disconnect returns void
    };
  }, [token, user]);

  /* ---------------- FETCH USERS & GROUPS ---------------- */
  useEffect(() => {
    getUsers();
    getGroups();
  }, []);

  useEffect(() => {
    if (fetchGroupFlag) {
      getGroups();
      setFetchGroupFlag(false);
    }
  }, [fetchGroupFlag]);

  /* ---------------- SEND FUNCTIONS ---------------- */
  const sendPrivateMessage = async (receiverId: string, content: string) => {
    try {
      if (!socket || !user) return;

      const res = await savePrivateMessage({
        receiverId,
        content,
      });

      if (res?.status === 200) {
        const data = await res?.data?.data;
        const { id, senderId, senderName, receiverId, content, timestamp } =
          data;
        const msg: Message = {
          id: id || `${Date.now()}`,
          senderId: senderId || user.id,
          senderName: senderName || "",
          receiverId: receiverId,
          content: content || "",
          timestamp: timestamp || new Date(data.time).getTime(),
        };

        socket.emit("private_message", {
          toUserId: receiverId,
          text: content,
          msg,
        });
        setMessages((prev) => [...prev, msg]);
      }
    } catch (error) {
      console.error(error);
      notifyError({ message: "Failed to send message" });
    }
  };

  const sendPrivateFile = async (
    receiverId: string,
    fileUrl: string,
    fileName: string,
    blobName: string
  ) => {
    if (!socket || !user) return;

    const res = await savePrivateFile({
      receiverId,
      fileUrl,
      fileName,
      blobName,
    });

    if (res?.status === 200) {
      const {
        id,
        senderId,
        senderName,
        receiverId,
        content,
        timestamp,
        blobName,
      } = res?.data?.data;

      const msg: Message = {
        id: id || `${Date.now()}`,
        senderId: senderId,
        senderName: senderName,
        receiverId,
        content: content || "",
        timestamp: timestamp || new Date().getTime(),
        fileUrl: fileUrl,
        fileName: fileName,
        blobName,
      };

      socket.emit("private_file", { toUserId: receiverId, msg });
      setMessages((prev) => [...prev, msg]);
    }
  };

  const sendGroupMessage = async (groupId: string, content: string) => {
    try {
      if (!socket || !user) return;

      const res = await saveGroupMessage({
        groupId,
        content,
      });

      if (res?.status === 200) {
        const { id, senderId, senderName, groupId, content, timestamp } =
          res?.data?.data;

        const msg: Message = {
          id: id || `${Date.now()}`,
          senderId: senderId,
          senderName: senderName,
          groupId,
          content,
          timestamp: timestamp,
        };

        socket.emit("group_message", { groupId, msg });

        setMessages((prev) => [...prev, msg]);
      } else {
        notifyError({ message: "Failed to send message" });
      }
    } catch (error) {
      console.error(error);
      notifyError({ message: "Failed to send message" });
    }
  };

  const sendGroupFile = async (
    groupId: string,
    fileUrl: string,
    fileName: string,
    blobName: string
  ) => {
    if (!socket || !user) return;

    const res = await saveGroupFile({
      groupId,
      fileUrl,
      fileName,
      blobName,
    });

    if (res.status === 200) {
      const { id, senderId, senderName, groupId, timestamp } = res?.data?.data;
      const msg: Message = {
        id: id || `${Date.now()}`,
        senderId: senderId,
        senderName: senderName,
        groupId,
        content: "",
        fileUrl,
        fileName,
        timestamp: timestamp || new Date().getTime(),
      };

      socket.emit("group_file", { groupId, msg });
      setMessages((prev) => [...prev, msg]);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        sendPrivateMessage,
        sendPrivateFile,
        sendGroupMessage,
        sendGroupFile,
        messages,
        contacts,
        groups,
        onlineUsers,
        setFetchGroupFlag,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
