import { createContext, useContext, useRef, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

interface IncomingCall {
  fromUserId: string;
  fromUserName: string;
  callType: "audio" | "video";
  offer: RTCSessionDescriptionInit;
}

interface CallContextType {
  startCall: (toUserId: string, callType: "audio" | "video") => void;
  acceptCall: (data: IncomingCall) => void;
  endCall: (toUserId?: string) => void;
  incomingCall: IncomingCall | null;
  remoteStream: MediaStream | null;
  localStream: MediaStream | null;
  videoKey: string;
  callDuration: number;
  callType: "audio" | "video" | null;
  setCallType: (type: "audio" | "video" | null) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);
export const useCall = () => {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error("useCall must be used within CallProvider");
  return ctx;
};

const iceServers: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const { socket } = useSocket();

  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<IncomingCall | null>(null);
  const [videoKey, setVideoKey] = useState(new Date().getTime().toString());
  const [callType, setCallType] = useState<"audio" | "video" | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startCallTimer = () => {
    if (callTimerRef.current) return;

    callTimerRef.current = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
  };

  const stopCallTimer = () => {
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    setCallDuration(0);
  };

  const createPeer = (toUserId: string) => {
    const peer = new RTCPeerConnection(iceServers);

    peer.addTransceiver("audio", { direction: "sendrecv" });

    peer.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };

    // ✅ ICE connection = call connected
    peer.oniceconnectionstatechange = () => {
      const state = peer.iceConnectionState;

      if (state === "connected" || state === "completed") {
        startCallTimer();
      }

      if (
        state === "disconnected" ||
        state === "failed" ||
        state === "closed"
      ) {
        stopCallTimer();
      }
    };

    peer.onicecandidate = (e) => {
      if (e.candidate) {
        socket?.emit("call:ice", { toUserId, candidate: e.candidate });
      }
    };

    peerRef.current = peer;
    return peer;
  };

  const getMedia = async (callType: "audio" | "video") => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: callType === "video",
    });

    // Ensure audio track is enabled
    stream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });

    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  };

  const startCall = async (toUserId: string, callType: "audio" | "video") => {
    const peer = createPeer(toUserId);
    const stream = await getMedia(callType);
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket?.emit("call:offer", { toUserId, offer, callType });
  };

  const acceptCall = async (data: IncomingCall) => {
    const peer = createPeer(data.fromUserId);
    const stream = await getMedia(data.callType);
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));

    await peer.setRemoteDescription(data.offer);
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);

    socket?.emit("call:answer", { toUserId: data.fromUserId, answer });
    setIncomingCall(null);
  };

  const endCall = (toUserId?: string) => {
    stopCallTimer();
    // Stop local tracks
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;

    // Stop remote tracks
    remoteStream?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);

    // Close peer connection
    peerRef.current?.close();
    peerRef.current = null;
    setVideoKey(new Date().getTime().toString());

    if (toUserId) {
      socket?.emit("call:end", { toUserId });
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on("call:offer", (data: IncomingCall) => {
      setIncomingCall(data);
    });

    socket.on(
      "call:answer",
      async (data: { answer: RTCSessionDescriptionInit }) => {
        if (!peerRef.current?.currentRemoteDescription) {
          await peerRef.current?.setRemoteDescription(data.answer);
        }
      }
    );

    socket.on("call:ice", async (data: { candidate: RTCIceCandidateInit }) => {
      if (peerRef.current)
        await peerRef.current.addIceCandidate(data.candidate);
    });

    // ✅ Stop call when remote ends
    socket.on("call:end", () => {
      stopCallTimer();
      console.log("call end");
      // Stop remote video/audio tracks
      remoteStream?.getTracks().forEach((t) => t.stop());
      remoteStream && setRemoteStream(null);

      // Stop local tracks
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);

      peerRef.current?.close();
      peerRef.current = null;
      setIncomingCall(null);
    });

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice");
      socket.off("call:end");
    };
  }, [socket, remoteStream]);

  useEffect(() => {
    return () => {
      peerRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <CallContext.Provider
      value={{
        startCall,
        acceptCall,
        endCall,
        incomingCall,
        localStream,
        remoteStream,
        videoKey,
        callDuration,
        callType,
        setCallType,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};
