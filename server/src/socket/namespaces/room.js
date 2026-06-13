import { socketAuth } from "../middlewares/socketAuth.js";
import { roomHandlers } from "../handlers/roomHandlers.js";

export const initRoomNamespace = (io) => {
  const roomNamespace = io.of("/room");

  roomNamespace.use(socketAuth);

  roomNamespace.on("connection", (socket) => {
    console.log(`User connected to /room: ${socket.user._id}`);
    roomHandlers(socket, roomNamespace);
  });
};