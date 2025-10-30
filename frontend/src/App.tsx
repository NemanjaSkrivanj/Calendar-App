import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "./lib/api";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api
      .get("/auth/me")
      .then((res) => {
        const isAuthed = !!res.user;
        if (!isAuthed && location.pathname !== "/login")
          navigate("/login", { replace: true });
        if (isAuthed && location.pathname === "/login")
          navigate("/", { replace: true });
      })
      .finally(() => setChecking(false));
  }, [location.pathname, navigate]);

  if (checking) return <div style={{ padding: 24 }}>Loading...</div>;
  return <Outlet />;
}
