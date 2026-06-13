import Navbar from "./navbar.jsx";
import Sidebar from "./sidebar.jsx";

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Navbar />
      <div className="flex pt-16 min-h-screen">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}