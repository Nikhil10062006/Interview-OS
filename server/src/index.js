import dotenv from "dotenv";
dotenv.config({
  path: "./.env",
});
import app from "./app.js";
import connectDB from "./db/index.js";
import { initSocket } from "./socket/index.js";
import http from "http";

const port = process.env.PORT || 3000;

const server = http.createServer(app);

connectDB()
  .then((res) => {
    app.on("error", (error) => {
      console.log(error);
      throw error;
    });
    initSocket(server);
    server.listen(port, () => {
      console.log(`Server is running on port ${port}.`);
    });
  })
  .catch((err) => {
    console.log("Mongo DB connection failed.");
  });
