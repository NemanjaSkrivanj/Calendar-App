
export default function Login() {
  const backendBase =
    (import.meta.env.VITE_API_URL as string) ?? "http://localhost:4000";
  const startAuth = () => {
    window.location.href = `${backendBase}/auth/google`;
  };

  return (
    <div
      style={{
        maxWidth: 480,
        margin: "64px auto",
        padding: 24,
        border: "1px solid #ddd",
        borderRadius: 8,
      }}
    >
      <h2>Calendar App</h2>
      <p>Sign in to view and manage your Google Calendar events.</p>
      <button onClick={startAuth} style={{ padding: "10px 16px" }}>
        Sign in with Google
      </button>
    </div>
  );
}
