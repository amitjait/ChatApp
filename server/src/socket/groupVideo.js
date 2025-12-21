const emitToGroup = (io, groupId, fromUserId, event, payload) => {
  const clients = io.sockets.adapter.rooms.get(groupId);
  if (!clients) return;

  for (const socketId of clients) {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket || socket.user.id === fromUserId) continue; // skip sender
    socket.emit(event, payload);
  }
};

const emitToUser = (io, userSocketMap, toUserId, event, payload) => {
  if (!userSocketMap || !userSocketMap[toUserId]) return;
  const socketSet = userSocketMap[toUserId];

  for (const socketId of socketSet) {
    io.to(socketId).emit(event, payload);
  }
};

export const groupVideoSocket = (io, socket, userSocketMap) => {
  const user = socket.user;

  /* ---------- JOIN GROUP CALL ---------- */
  socket.on("groupCall:join", ({ groupId }) => {
    if (!groupId) return;
    socket.join({ groupId });
    console.log(`${user.name} joined group call ${groupId}`);

    // Notify existing members to create peer for new user
    emitToGroup(io, groupId, user.id, "groupCall:user-joined", {
      userId: user.id,
    });
  });

  /* ---------- LEAVE GROUP CALL ---------- */
  socket.on("groupCall:leave", ({ groupId }) => {
    if (!groupId) return;
    socket.leave(groupId);
    emitToGroup(io, groupId, user.id, "groupCall:end", { userId: user.id });
  });

  /* ---------- GROUP CALL OFFER ---------- */
  socket.on("groupCall:offer", ({ groupId, offer, callType }) => {
    console.log({ groupId, callType });
    if (!groupId) return;
    emitToGroup(io, groupId, user.id, "groupCall:offer", {
      fromUserId: user.id,
      fromUserName: user.name,
      offer,
      callType,
    });
  });

  /* ---------- GROUP CALL ANSWER ---------- */
  socket.on("groupCall:answer", ({ groupId, answer, toUserId }) => {
    console.log({ groupId, answer, toUserId });
    if (!groupId || !answer || !toUserId) return;

    emitToUser(io, userSocketMap, toUserId, "groupCall:answer", {
      fromUserId: user.id,
      answer,
    });
  });

  /* ---------- GROUP ICE ---------- */
  socket.on("groupCall:ice", ({ groupId, candidate, toUserId }) => {
    if (!groupId || !candidate || !toUserId) return;
    emitToUser(io, userSocketMap, toUserId, "groupCall:ice", {
      fromUserId: user.id,
      candidate,
    });
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", () => {
    // Notify all groups the user is part of
    socket.rooms.forEach((roomId) => {
      if (roomId !== socket.id) {
        emitToGroup(io, roomId, user.id, "groupCall:end", { userId: user.id });
      }
    });

    // Remove from userSocketMap
    if (userSocketMap[user.id]) {
      userSocketMap[user.id].delete(socket.id);
      if (userSocketMap[user.id].size === 0) delete userSocketMap[user.id];
    }
  });
};
