import { useContext } from "react";
import { ThemeContext } from "../context/themeContext.jsx";

export const useTheme = () => useContext(ThemeContext);
