import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("chessUsername");
    if (saved) setUsername(saved);
  }, []);

  const handleLogin = () => {
    if (!username.trim()) {
      setError("Please enter a Chess.com username");
      return;
    }
    localStorage.setItem("chessUsername", username.trim().toLowerCase());
    router.push("/mygames");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Login with Chess.com Username</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter Chess.com username"
      />
      <button onClick={handleLogin}>Continue</button>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}