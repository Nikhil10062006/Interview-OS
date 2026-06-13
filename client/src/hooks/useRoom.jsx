import { useContext } from "react";
import { RoomContext } from "../context/roomContext.jsx";

export const useRoom = () => useContext(RoomContext);