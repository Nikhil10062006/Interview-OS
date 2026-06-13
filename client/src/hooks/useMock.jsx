import { useContext } from "react";
import { MockContext } from "../context/mockContext.jsx";

export const useMockRoom = () => useContext(MockContext);