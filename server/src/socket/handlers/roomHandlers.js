import { Room } from "../../models/room.models.js";
export const roomHandlers = (socket, io) => {
  socket.on("join-room", async (roomId) => {
    socket.roomId = roomId;
    await socket.join(roomId);
    const socketsInRoom = await io.in(roomId).fetchSockets();

    const participantIds = socketsInRoom
      .map((s) => s.user?._id?.toString())
      .filter(Boolean);

    io.to(roomId).emit("room-participants", participantIds);
    const room = await Room.findOne({ roomId }).populate(
      "candidate",
      "username email",
    );
    if (
      room?.candidate &&
      String(room.candidate._id) === String(socket.user._id)
    ) {
      socket.to(roomId).emit("candidate-joined", room.candidate);
    }

    if (room?.problem?.length > 0) {
      const activeProblem = room.problem[room.problem.length - 1];
      socket.emit("problem-update", activeProblem);
    }
  });

  socket.on("code-change", ({ roomId, code }) => {
    if (socket.roomId !== roomId) {
      return socket.emit("error", { message: "Room mismatch" });
    }
    socket.to(roomId).emit("code-change", code);
  });

  socket.on("language-change", ({ roomId, language }) => {
    if (socket.roomId !== roomId) {
      return socket.emit("error", { message: "Room mismatch" });
    }
    socket.to(roomId).emit("language-change", language);
  });

  socket.on("problem-update", ({ roomId, problem }) => {
    socket.to(roomId).emit("problem-update", problem);
  });

  socket.on("test-cases-update", ({ roomId, problemId, testCases }) => {
    socket.to(roomId).emit("test-cases-update", { problemId, testCases });
  });

  socket.on("run-result", ({ roomId, result }) => {
    socket.to(roomId).emit("run-result", result);
  });

  socket.on("next-problem", ({ roomId }) => {
    socket.to(roomId).emit("next-problem"); 
  });

  socket.on("interview-ended" ,(roomId) =>{
    io.to(roomId).emit("interview-ended")
  })

  socket.on("leave-room", async (roomId) => {
    socket.leave(roomId);
    socket.roomId = null;
    const socketsInRoom = await io.in(roomId).fetchSockets();
    const participantIds = socketsInRoom
      .map((s) => s.user?._id?.toString())
      .filter(Boolean);
    io.to(roomId).emit("room-participants", participantIds);
  });

  socket.on("disconnect", async () => {
    if (socket.roomId) {
      const roomId = socket.roomId;
      setTimeout(async () => {
        const socketsInRoom = await io.in(roomId).fetchSockets();
        const participantIds = socketsInRoom
          .map((s) => s.user?._id?.toString())
          .filter(Boolean);
        io.to(roomId).emit("room-participants", participantIds);
      }, 100);
    }
  });
};
