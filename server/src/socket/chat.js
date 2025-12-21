export const chatSocket = (io, socket, userSocketMap, groupMembersMap) => {
  const user = socket.user;
  // console.log({ socket });
  // PRIVATE MESSAGE
  socket.on("private_message", async (data) => {
    try {
      const receiverSockets = userSocketMap[data.toUserId];

      if (!receiverSockets || receiverSockets.size === 0) {
        console.log("❌ RECEIVER NOT CONNECTED");
        return;
      }

      receiverSockets.forEach((socketId) => {
        io.to(socketId).emit("private_message", {
          ...data.msg, // message payload
          senderId: user.id,
          senderName: user.name,
        });
      });

      console.log("✅ PRIVATE MESSAGE EMITTED TO", [...receiverSockets]);
    } catch (error) {
      console.log("❌ ERROR EMITTING MESSAGE", error);
    }
  });

  // PRIVATE FILE
  socket.on("private_file", (data) => {
    const receiverSockets = userSocketMap[data.toUserId];
    if (!receiverSockets || receiverSockets.size === 0) return;

    receiverSockets.forEach((socketId) => {
      io.to(socketId).emit("private_file", {
        ...data?.msg,
      });
    });
  });

  // GROUP MESSAGE
  socket.on("group_message", ({ groupId, msg }) => {
    try {
      console.log("GROUP MESSAGE:", groupId, msg);

      // send to ALL group members (including sender)
      io.to(groupId).emit("group_message", msg);
    } catch (error) {
      console.error(error);
    }
  });

  // GROUP FILE
  socket.on("group_file", ({ groupId, msg }) => {
    io.to(groupId).emit("group_file", {
      groupId,
      ...msg,
    });
  });
};
