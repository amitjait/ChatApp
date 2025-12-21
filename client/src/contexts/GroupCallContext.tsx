import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
} from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

interface IncomingCall {
  groupId: string;
  callType: "audio" | "video";
  fromUserId: string;
  fromUserName: string;
  offer: RTCSessionDescriptionInit;
  groupMembers?: { id: string; name: string }[];
}

interface GroupCallContextType {
  startGroupCall: (
    groupId: string,
    callType: "audio" | "video",
    participants: { id: string }[]
  ) => void;
  acceptGroupCall: (incoming: IncomingCall) => void;
  leaveGroupCall: (groupId: string) => void;
  localStream: MediaStream | null;
  remoteStreams: { [userId: string]: MediaStream };
  callType: "audio" | "video" | null;
  callStatus: "idle" | "calling" | "connected" | "ringing";
  callDuration: number;
  incomingGroupCall: IncomingCall | null;
  setIncomingGroupCall: (incoming: IncomingCall | null) => void;
}

const GroupCallContext = createContext<GroupCallContextType | undefined>(
  undefined
);

export const useGroupCall = () => {
  const ctx = useContext(GroupCallContext);
  if (!ctx)
    throw new Error("useGroupCall must be used within GroupCallProvider");
  return ctx;
};

export const GroupCallProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { socket } = useSocket();
  const { user } = useAuth();

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{
    [userId: string]: MediaStream;
  }>({});
  const [callType, setCallType] = useState<"audio" | "video" | null>(null);
  const [callStatus, setCallStatus] = useState<
    "idle" | "calling" | "connected" | "ringing"
  >("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [incomingGroupCall, setIncomingGroupCall] =
    useState<IncomingCall | null>(null);

  const peersRef = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startCallTimer = () => {
    if (callTimerRef.current) return;
    callTimerRef.current = setInterval(
      () => setCallDuration((d) => d + 1),
      1000
    );
  };
  const stopCallTimer = () => {
    if (callTimerRef.current) clearInterval(callTimerRef.current);
    callTimerRef.current = null;
    setCallDuration(0);
  };

  const getMedia = async (type: "audio" | "video") => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video",
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  };

  const createPeer = (remoteUserId: string) => {
    const peer = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // Add local tracks
    if (localStreamRef.current) {
      localStreamRef.current
        .getTracks()
        .forEach((track) => peer.addTrack(track, localStreamRef.current!));
    }

    peer.ontrack = (e) =>
      setRemoteStreams((prev) => ({ ...prev, [remoteUserId]: e.streams[0] }));

    peer.onicecandidate = (e) => {
      if (e.candidate)
        socket?.emit("groupCall:ice", {
          toUserId: remoteUserId,
          candidate: e.candidate,
        });
    };

    peersRef.current[remoteUserId] = peer;
    return peer;
  };

  const startGroupCall = async (
    groupId: string,
    type: "audio" | "video",
    participants: { id: string; name: string }[]
  ) => {
    setCallType(type);
    setCallStatus("calling");

    const stream = await getMedia(type); // 1️⃣ get local media

    // 2️⃣ create peer for each participant
    participants?.forEach(async (user) => {
      if (user.id === user?.id) return; // skip self
      const peer = createPeer(user.id);
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      // 3️⃣ send offer to each user
      socket?.emit("groupCall:offer", {
        toUserId: user.id,
        groupId,
        callType: type,
        offer,
      });
    });
  };

  const acceptGroupCall = async (incoming: IncomingCall) => {
    if (!incoming) return;
    setCallType(incoming.callType);
    setCallStatus("connected");

    // 1️⃣ Get local media
    await getMedia(incoming.callType);

    // 2️⃣ Create peer for caller
    const peer = createPeer(incoming.fromUserId);
    await peer.setRemoteDescription(incoming.offer);

    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket?.emit("groupCall:answer", {
      groupId: incoming.groupId,
      toUserId: incoming.fromUserId,
      answer,
    });

    startCallTimer();
    setIncomingGroupCall(null);
  };

  const leaveGroupCall = (groupId: string) => {
    stopCallTimer();
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    Object.values(peersRef.current).forEach((peer) => peer.close());
    peersRef.current = {};
    setRemoteStreams({});
    setCallStatus("idle");
    setCallType(null);
    setCallDuration(0);
    setIncomingGroupCall(null);

    socket?.emit("groupCall:leave", { groupId });
  };

  useEffect(() => {
    if (!socket) return;

    // 1️⃣ Incoming offer
    socket.on("groupCall:offer", (data: IncomingCall) => {
      console.log("Incoming group call offer:", data);
      setIncomingGroupCall(data);
      setCallStatus("ringing");
    });

    // 2️⃣ Answer from remote
    socket.on("groupCall:answer", async ({ fromUserId, answer }) => {
      const peer = peersRef.current[fromUserId];
      if (peer) await peer.setRemoteDescription(answer);
      setCallStatus("connected");
      startCallTimer();
    });

    // 3️⃣ ICE candidate
    socket.on("groupCall:ice", async ({ fromUserId, candidate }) => {
      const peer = peersRef.current[fromUserId];
      if (peer && candidate) await peer.addIceCandidate(candidate);
    });

    // 4️⃣ New user joined
    socket.on("groupCall:user-joined", async ({ userId, offer }) => {
      const peer = createPeer(userId);
      await peer.setRemoteDescription(offer);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket?.emit("groupCall:answer", { toUserId: userId, answer });
      setCallStatus("connected");
      startCallTimer();
    });

    // 5️⃣ User left
    socket.on("groupCall:user-left", ({ userId }) => {
      peersRef.current[userId]?.close();
      delete peersRef.current[userId];
      setRemoteStreams((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    });

    return () => {
      socket.off("groupCall:offer");
      socket.off("groupCall:answer");
      socket.off("groupCall:ice");
      socket.off("groupCall:user-joined");
      socket.off("groupCall:user-left");
    };
  }, [socket]);

  return (
    <GroupCallContext.Provider
      value={{
        startGroupCall,
        acceptGroupCall,
        leaveGroupCall,
        localStream,
        remoteStreams,
        callType,
        callStatus,
        callDuration,
        incomingGroupCall,
        setIncomingGroupCall,
      }}
    >
      {children}
    </GroupCallContext.Provider>
  );
};
