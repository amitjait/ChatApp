export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  fileUrl?: string;
  fileName?: string;
  timestamp: number;
  blobName?: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
}

export interface Contact {
  id: string;
  name: string;
  email: string;
  online?: boolean;
}

export interface ActiveChat {
  type: "user" | "group";
  id: string;
  name: string;
}

export interface VideoCallData {
  callerId: string;
  callerName: string;
  receiverId?: string;
  groupId?: string;
  signal?: any;
}

export interface CallOffer {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  offer: RTCSessionDescriptionInit;
  callType: "audio" | "video";
}

export interface CallAnswer {
  fromUserId: string;
  toUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceCandidatePayload {
  fromUserId: string;
  toUserId: string;
  candidate: RTCIceCandidateInit;
}

export interface CallEndPayload {
  fromUserId: string;
  toUserId: string;
}
