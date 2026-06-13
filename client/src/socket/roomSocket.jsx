import { io } from "socket.io-client";
const URL = "http://localhost:5000/room";
export const roomSocket = io(URL, {
  autoConnect: false,
   auth: {},
});

