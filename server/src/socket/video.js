const emitToUser = (io, userSocketMap, toUserId, event, payload) => {
  const socketSet = userSocketMap[toUserId];
  if (!socketSet) return;

  for (const socketId of socketSet) {
    io.to(socketId).emit(event, payload);
  }
};

export const videoSocket = (io, socket, userSocketMap) => {
  const user = socket.user;

  /* ---------- CALL OFFER ---------- */
  socket.on("call:offer", ({ toUserId, offer, callType }) => {
    if (!toUserId || !offer) return;

    emitToUser(io, userSocketMap, toUserId, "call:offer", {
      fromUserId: user.id,
      fromUserName: user.name,
      offer,
      callType,
    });
  });

  /* ---------- CALL ANSWER ---------- */
  socket.on("call:answer", ({ toUserId, answer }) => {
    if (!toUserId || !answer) return;

    emitToUser(io, userSocketMap, toUserId, "call:answer", {
      fromUserId: user.id,
      answer,
    });
  });

  /* ---------- ICE CANDIDATE ---------- */
  socket.on("call:ice", ({ toUserId, candidate }) => {
    if (!toUserId || !candidate) return;

    emitToUser(io, userSocketMap, toUserId, "call:ice", {
      fromUserId: user.id,
      candidate,
    });
  });

  /* ---------- END CALL ---------- */
  socket.on("call:end", ({ toUserId }) => {
    console.log({ toUserId });
    if (!toUserId) return;
    emitToUser(io, userSocketMap, toUserId, "call:end", {
      fromUserId: user.id,
    });
  });

  /* ---------- DISCONNECT ---------- */
  socket.on("disconnect", () => {
    // Notify only connected peers, not everyone
    for (const [userId, socketSet] of Object.entries(userSocketMap)) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          delete userSocketMap[userId];
        }
      }
    }
  });
};
