import jwt from "jsonwebtoken";

export const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;

    if (!token) return next(new Error("Unauthorized: No token"));

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
};
