import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { SOCKET_URL } from "../config";
import api from "../api";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

const SocketCtx = createContext({
  socket: null,
  connected: false,
  online: new Set(),
  alerts: 0,
  refreshAlerts: () => {},
});

export const useSocket = () => useContext(SocketCtx);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const { show } = useToast();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [online, setOnline] = useState(new Set());
  const [alerts, setAlerts] = useState(0);

  const refreshAlerts = useCallback(() => {
    api
      .get("/notifications/unread-count")
      .then((r) => setAlerts(r.data.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("hk_token");
    if (!user || !token) {
      setConnected(false);
      setOnline(new Set());
      setAlerts(0);
      return;
    }

    refreshAlerts();
    const s = io(SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      refreshAlerts();
    });
    s.on("disconnect", () => setConnected(false));
    s.on("presence:update", ({ online }) => setOnline(new Set(online)));
    s.on("notification:new", (n) => {
      setAlerts((a) => a + 1);
      show(n?.title ? `🔔 ${n.title}` : "New alert", "info");
    });

    return () => {
      s.disconnect();
      setSocket(null);
      setConnected(false);
    };
  }, [user, refreshAlerts, show]);

  return (
    <SocketCtx.Provider value={{ socket, connected, online, alerts, refreshAlerts }}>
      {children}
    </SocketCtx.Provider>
  );
};
