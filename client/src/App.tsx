import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SocketProvider } from "./contexts/SocketContext";
import { CallProvider } from "./contexts/CallContext"; // import CallProvider
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Chat } from "./pages/Chat";
import { setAccessToken } from "./apis/configs/axiosConfig";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppContent() {
  const { user, loading } = useAuth();
  const [showRegister, setShowRegister] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    if (token) {
      setAccessToken(token, Date.now(), () => {});
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return showRegister ? (
      <Register onToggle={() => setShowRegister(false)} />
    ) : (
      <Login onToggle={() => setShowRegister(true)} />
    );
  }

  return (
    <SocketProvider>
      <CallProvider>
        <Chat />
      </CallProvider>
    </SocketProvider>
  );
}

function App() {
  return (
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <ToastContainer aria-label="Notifications" position="top-right" />
    </>
  );
}

export default App;
