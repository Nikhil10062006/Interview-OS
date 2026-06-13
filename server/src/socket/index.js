import { Server } from "socket.io";
import { initRoomNamespace } from "./namespaces/room.js";
import { ApiError } from "../utils/ApiError.js";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      credentials: true,
    },
  });

  initRoomNamespace(io);
};

export const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
