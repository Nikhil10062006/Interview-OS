import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/authContext.jsx";
import { RoomProvider } from "./context/roomContext.jsx";
import { MockProvider } from "./context/mockContext.jsx";
import AppRoutes from "./routes/appRoutes.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <RoomProvider>
          <MockProvider>
            <AppRoutes />
          </MockProvider>
        </RoomProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
