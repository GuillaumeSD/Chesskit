import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function MyGames() {
  const [username, setUsername] = useState<string | null>(null);
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "wins" | "losses" | "draws">(
    "all"
  );

  useEffect(() => {
    const saved = localStorage.getItem("chessUsername");
    if (saved) {
      setUsername(saved);
      fetchProfile(saved);
      fetchGames(saved);
    }
  }, []);

  async function fetchProfile(user: string) {
    try {
      const res = await fetch(`/api/chesscom/profile?username=${user}`);
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchGames(user: string) {
    setLoading(true);
    try {
      const archivesRes = await fetch(
        `/api/chesscom/archives?username=${user}`
      );
      const archivesData = await archivesRes.json();
      const latest = archivesData.archives.pop(); // last month

      const gamesRes = await fetch(
        `/api/chesscom/games?username=${user}&month=${latest
          .split("/")
          .slice(-2)
          .join("/")}`
      );
      const gamesData = await gamesRes.json();
      setGames(gamesData.games || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  // Count results
  const summary = games.reduce(
    (acc, g) => {
      let result = "";
      if (g.white.username.toLowerCase() === username?.toLowerCase()) {
        result = g.white.result;
      } else if (g.black.username.toLowerCase() === username?.toLowerCase()) {
        result = g.black.result;
      }

      if (result === "win") acc.wins++;
      else if (
        ["checkmated", "resigned", "timeout", "lose", "abandoned"].includes(
          result
        )
      )
        acc.losses++;
      else if (
        [
          "agreed",
          "repetition",
          "stalemate",
          "insufficient",
          "50move",
          "timevsinsufficient",
          "draw",
        ].includes(result)
      )
        acc.draws++;
      return acc;
    },
    { wins: 0, losses: 0, draws: 0 }
  );

  // Apply filter
  const filteredGames = games.filter((g) => {
    if (filter === "all") return true;

    let result = "";
    if (g.white.username.toLowerCase() === username?.toLowerCase()) {
      result = g.white.result;
    } else if (g.black.username.toLowerCase() === username?.toLowerCase()) {
      result = g.black.result;
    }

    if (filter === "wins" && result === "win") return true;
    if (
      filter === "losses" &&
      ["checkmated", "resigned", "timeout", "lose", "abandoned"].includes(
        result
      )
    )
      return true;
    if (
      filter === "draws" &&
      [
        "agreed",
        "repetition",
        "stalemate",
        "insufficient",
        "50move",
        "timevsinsufficient",
        "draw",
      ].includes(result)
    )
      return true;

    return false;
  });

  return (
    <div style={{ padding: "2rem" }}>
      {username && <h2>{username}'s Games</h2>}
      {loading && <p>Loading...</p>}

      {/* Profile Card */}
      {profile && (
        <div
          style={{
            border: "1px solid gray",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          {profile.avatar && (
            <img
              src={profile.avatar}
              alt="avatar"
              width={64}
              height={64}
              style={{ borderRadius: "50%" }}
            />
          )}
          <div>
            <h3>{profile.username}</h3>
            <p>Country: {profile.country?.split("/").pop()}</p>
            <p>Status: {profile.status}</p>
          </div>
        </div>
      )}

      {/* Win/Loss/Draw Summary */}
      <div
        style={{
          border: "1px solid lightgray",
          padding: "0.5rem",
          marginBottom: "1rem",
        }}
      >
        <strong>Summary:</strong> Wins: {summary.wins} | Losses: {summary.losses} | Draws:{" "}
        {summary.draws}
      </div>

      {/* Pie Chart */}
      <Pie
        data={{
          labels: ["Wins", "Losses", "Draws"],
          datasets: [
            {
              label: "Game Results",
              data: [summary.wins, summary.losses, summary.draws],
              backgroundColor: ["#4caf50", "#f44336", "#2196f3"],
            },
          ],
        }}
      />

      {/* Filters */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("wins")}>Wins</button>
        <button onClick={() => setFilter("losses")}>Losses</button>
        <button onClick={() => setFilter("draws")}>Draws</button>
      </div>

      {/* Games List */}
      <ul style={{ marginTop: "1rem" }}>
        {filteredGames.map((g, idx) => (
          <li key={idx}>
            <a href={g.url} target="_blank" rel="noopener noreferrer">
              {g.white.username} vs {g.black.username} ({g.time_class})
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}