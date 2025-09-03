import { useEffect, useMemo, useState } from "react";
import { Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
} from "chart.js";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { format, fromUnixTime } from "date-fns";
import { Chess } from "chess.js";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title
);

type CCGame = any;

function parsePGNTags(pgn: string | undefined) {
  const tags: Record<string, string> = {};
  if (!pgn) return tags;
  const regex = /\[([A-Za-z0-9_]+)\s+"([^"]*)"\]/g;
  let m;
  while ((m = regex.exec(pgn)) !== null) {
    tags[m[1]] = m[2];
  }
  return tags;
}

function whoAmI(g: CCGame, username: string) {
  const me = username.toLowerCase();
  if (g.white?.username?.toLowerCase() === me) return "white" as const;
  if (g.black?.username?.toLowerCase() === me) return "black" as const;
  return null;
}

function resultFromPerspective(g: CCGame, meSide: "white" | "black" | null) {
  if (!meSide) return "-";
  const myRes = (g[meSide] as any)?.result || "";
  const drawish = [
    "agreed",
    "repetition",
    "stalemate",
    "insufficient",
    "50move",
    "timevsinsufficient",
    "draw",
  ];
  if (myRes === "win") return "Win";
  if (
    myRes === "checkmated" ||
    myRes === "resigned" ||
    myRes === "timeout" ||
    myRes === "lose" ||
    myRes === "abandoned"
  )
    return "Loss";
  if (drawish.includes(myRes)) return "Draw";
  return myRes || "-";
}

export default function MyGames() {
  const [username, setUsername] = useState<string | null>(null);
  const [games, setGames] = useState<CCGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [filter, setFilter] = useState<"all" | "wins" | "losses" | "draws">(
    "all"
  );
  const [calMap, setCalMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const saved = localStorage.getItem("chessUsername");
    if (saved) {
      setUsername(saved);
      fetchProfile(saved);
      fetchRecentGames(saved);
    } else {
      // If no user, optionally redirect to /login in your app
    }
  }, []);

  async function fetchProfile(user: string) {
    try {
      const res = await fetch(`https://api.chess.com/pub/player/${user}`);
      if (!res.ok) throw new Error("profile not found");
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      console.error("profile error", err);
    }
  }

  // Fetch last N months of games (safer than only last month)
  async function fetchRecentGames(user: string, months = 3) {
    setLoading(true);
    try {
      const archRes = await fetch(
        `https://api.chess.com/pub/player/${user}/games/archives`
      );
      if (!archRes.ok) throw new Error("archives not found");
      const arch = await archRes.json();
      const archives: string[] = arch.archives || [];
      // take last `months` archives
      const recent = archives.slice(-months);
      const allGames: CCGame[] = [];
      for (const url of recent) {
        try {
          const r = await fetch(url);
          if (!r.ok) continue;
          const data = await r.json();
          if (Array.isArray(data.games)) {
            allGames.push(...data.games);
          }
        } catch (e) {
          console.error("err", e);
        }
      }
      // sort by end_time desc
      allGames.sort((a, b) => (b.end_time || 0) - (a.end_time || 0));
      setGames(allGames);
      buildCalendarMap(allGames);
    } catch (err) {
      console.error("games error", err);
    }
    setLoading(false);
  }

  // Calendar heatmap map: date string (YYYY-MM-DD) => count
  function buildCalendarMap(gs: CCGame[]) {
    const map: Record<string, number> = {};
    for (const g of gs) {
      const ts = g.end_time ? g.end_time : undefined;
      if (!ts) continue;
      const d = format(fromUnixTime(ts), "yyyy-MM-dd");
      map[d] = (map[d] || 0) + 1;
    }
    setCalMap(map);
  }

  // Summary counts (wins/loss/draw)
  const summary = useMemo(() => {
    const acc = { wins: 0, losses: 0, draws: 0 };
    for (const g of games) {
      if (!username) continue;
      const meSide = whoAmI(g, username);
      const res = resultFromPerspective(g, meSide);
      if (res === "Win") acc.wins++;
      else if (res === "Loss") acc.losses++;
      else if (res === "Draw") acc.draws++;
    }
    return acc;
  }, [games, username]);

  // Filtered games
  const filteredGames = useMemo(() => {
    if (filter === "all") return games;
    return games.filter((g) => {
      if (!username) return false;
      const meSide = whoAmI(g, username);
      const r = resultFromPerspective(g, meSide);
      if (filter === "wins") return r === "Win";
      if (filter === "losses") return r === "Loss";
      if (filter === "draws") return r === "Draw";
      return true;
    });
  }, [games, filter, username]);

  // Best win: highest opponent rating among wins
  const bestWin = useMemo(() => {
    if (!username) return null;
    const wins = games.filter((g) => {
      const meSide = whoAmI(g, username);
      return resultFromPerspective(g, meSide) === "Win";
    });
    if (wins.length === 0) return null;
    // choose one with highest opponent rating
    let best = wins[0];
    let bestOppRating = 0;
    for (const g of wins) {
      const meSide = whoAmI(g, username);
      const oppSide = meSide === "white" ? "black" : "white";
      const r = Number((g as any)[oppSide]?.rating || 0);
      if (r > bestOppRating) {
        bestOppRating = r;
        best = g;
      }
    }
    return { game: best, oppRating: bestOppRating };
  }, [games, username]);

  // Streak tracker - current streak from most recent game
  const streak = useMemo(() => {
    if (!username || games.length === 0) return { type: "none", count: 0 };
    // assume games are sorted desc (we sorted earlier)
    let cnt = 0;
    let firstType: string | null = null;
    for (const g of games) {
      const meSide = whoAmI(g, username);
      const r = resultFromPerspective(g, meSide);
      if (firstType === null) {
        if (r === "Win" || r === "Loss" || r === "Draw") {
          firstType = r;
          cnt = 1;
        } else {
          // unknown, skip
        }
      } else {
        if (r === firstType) cnt++;
        else break;
      }
    }
    return { type: firstType || "none", count: cnt };
  }, [games, username]);

  // Openings explorer: build map opening -> stats
  const openings = useMemo(() => {
    const map: Record<
      string,
      { count: number; wins: number; losses: number; draws: number; lastPlayed: number }
    > = {};
    if (!username) return map;
    for (const g of games) {
      const tags = parsePGNTags(g.pgn);
      let opening = tags["Opening"] || tags["ECO"] || "Unknown";
      // if ECO only, prefix
      if (opening && opening.length <= 4 && tags["Opening"]) opening = tags["Opening"];
      const meSide = whoAmI(g, username);
      const res = resultFromPerspective(g, meSide);
      if (!map[opening]) map[opening] = { count: 0, wins: 0, losses: 0, draws: 0, lastPlayed: 0 };
      map[opening].count++;
      if (res === "Win") map[opening].wins++;
      else if (res === "Loss") map[opening].losses++;
      else if (res === "Draw") map[opening].draws++;
      if ((g.end_time || 0) > (map[opening].lastPlayed || 0)) map[opening].lastPlayed = g.end_time || 0;
    }
    return map;
  }, [games, username]);

  // Rating history: collect player's rating from each game by date (we'll do per-game points)
  const ratingHistory = useMemo(() => {
    if (!username) return [];
    const points: { label: string; rating: number }[] = [];
    for (const g of games.slice().reverse()) {
      const meSide = whoAmI(g, username);
      if (!meSide) continue;
      const r = Number((g as any)[meSide]?.rating || 0);
      const ts = g.end_time || null;
      if (!ts || !r) continue;
      const label = format(fromUnixTime(ts), "yyyy-MM-dd");
      points.push({ label, rating: r });
    }
    // compress by label (if multiple per day take last)
    const map: Record<string, number> = {};
    for (const p of points) map[p.label] = p.rating;
    const out = Object.keys(map)
      .sort()
      .map((d) => ({ label: d, rating: map[d] }));
    return out;
  }, [games, username]);

  // Chart data objects
  const pieData = useMemo(
    () => ({
      labels: ["Wins", "Losses", "Draws"],
      datasets: [
        {
          data: [summary.wins, summary.losses, summary.draws],
          backgroundColor: ["#4caf50", "#f44336", "#2196f3"],
        },
      ],
    }),
    [summary]
  );

  const lineData = useMemo(
    () => ({
      labels: ratingHistory.map((p) => p.label),
      datasets: [
        {
          label: "Rating",
          data: ratingHistory.map((p) => p.rating),
          fill: false,
          tension: 0.2,
          borderColor: "#1976d2",
          pointRadius: 3,
        },
      ],
    }),
    [ratingHistory]
  );

  // Top openings list sorted by play count
  const topOpenings = useMemo(() => {
    const arr = Object.entries(openings).map(([name, stat]) => ({ name, ...stat }));
    return arr.sort((a, b) => b.count - a.count).slice(0, 8);
  }, [openings]);

  return (
    <div style={{ padding: 20 }}>
      {!username && <div>Please login first (go to /login)</div>}
      {username && <h2 style={{ marginBottom: 6 }}>{username}'s Dashboard</h2>}

      {loading && <p>Loading games...</p>}

      {/* Profile card */}
      {profile && (
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
            border: "1px solid #ddd",
            padding: 12,
            borderRadius: 8,
          }}
        >
          {profile.avatar && (
            <img src={profile.avatar} alt="avatar" width={64} height={64} style={{ borderRadius: 8 }} />
          )}
          <div>
            <strong style={{ fontSize: 18 }}>{profile.username}</strong>
            <div style={{ fontSize: 13, color: "#555" }}>
              {profile.name ? <div>{profile.name}</div> : null}
              <div>Country: {profile.country?.split("/").pop() || "—"}</div>
              <div>Last Online: {profile.last_online ? format(fromUnixTime(profile.last_online), "PPP") : "—"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Summary + charts area */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 16 }}>
        <div style={{ minWidth: 220, border: "1px solid #eee", padding: 12, borderRadius: 8 }}>
          <div style={{ fontWeight: "bold" }}>Summary</div>
          <div style={{ marginTop: 8 }}>Wins: {summary.wins}</div>
          <div>Losses: {summary.losses}</div>
          <div>Draws: {summary.draws}</div>
          <div style={{ marginTop: 8, color: "#777", fontSize: 13 }}>Current streak: {streak.count} {streak.type !== "none" ? streak.type : ""}</div>
        </div>

        <div style={{ width: 300 }}>
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>Win/Loss/Draw</div>
          <Pie data={pieData} />
        </div>

        <div style={{ minWidth: 300 }}>
          <div style={{ fontWeight: "bold", marginBottom: 6 }}>Rating History</div>
          {ratingHistory.length ? <Line data={lineData} /> : <div style={{ color: "#666" }}>Not enough rating points to show chart</div>}
        </div>
      </div>

      {/* Best win */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: "bold" }}>Best Win</div>
        {bestWin ? (
          <div style={{ border: "1px solid #eee", padding: 10, borderRadius: 8, marginTop: 6 }}>
            <div><strong>Opponent:</strong> {whoAmI(bestWin.game, username as string) === "white" ? bestWin.game.black.username : bestWin.game.white.username} ({bestWin.oppRating})</div>
            <div><strong>When:</strong> {bestWin.game.end_time ? format(fromUnixTime(bestWin.game.end_time), "PPP p") : "—"}</div>
            <div><a href={bestWin.game.url} target="_blank" rel="noreferrer">View Game</a></div>
          </div>
        ) : (
          <div style={{ color: "#666" }}>No wins found yet.</div>
        )}
      </div>

      {/* Openings explorer */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: "bold" }}>Top Openings</div>
          <div style={{ fontSize: 13, color: "#666" }}>Showing most played</div>
        </div>
        <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
          {topOpenings.map((o) => (
            <div key={o.name} style={{ border: "1px solid #eee", padding: 8, borderRadius: 6, display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: "600" }}>{o.name}</div>
                <div style={{ fontSize: 12, color: "#666" }}>{o.count} games — Win%: {o.count ? Math.round((o.wins / o.count) * 100) : 0}%</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 12, color: "#777" }}>{o.lastPlayed ? format(fromUnixTime(o.lastPlayed), "MMM dd") : ""}</div>
            </div>
          ))}
          {topOpenings.length === 0 && <div style={{ color: "#666" }}>No opening data</div>}
        </div>
      </div>

      {/* Calendar heatmap */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>Games Heatmap (last fetched months)</div>
        <CalendarHeatmap
          startDate={new Date(new Date().setMonth(new Date().getMonth() - 3))}
          endDate={new Date()}
          values={Object.entries(calMap).map(([d, count]) => ({ date: d, count }))}
          classForValue={(value: any) => {
            if (!value) return "color-empty";
            if (value.count >= 3) return "color-scale-4";
            if (value.count === 2) return "color-scale-3";
            if (value.count === 1) return "color-scale-2";
            return "color-empty";
          }}
          tooltipDataAttrs={(value: any) => {
            if (!value || !value.date) return {};
            return { "data-tip": `${value.date} — ${value.count} game(s)` };
          }}
        />
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 12 }}>
        <button onClick={() => setFilter("all")} style={{ marginRight: 8 }}>All</button>
        <button onClick={() => setFilter("wins")} style={{ marginRight: 8 }}>Wins</button>
        <button onClick={() => setFilter("losses")} style={{ marginRight: 8 }}>Losses</button>
        <button onClick={() => setFilter("draws")} style={{ marginRight: 8 }}>Draws</button>
      </div>

      {/* Games list */}
      <div>
        <div style={{ fontWeight: "bold", marginBottom: 8 }}>Games ({filteredGames.length})</div>
        <ul style={{ paddingLeft: 18 }}>
          {filteredGames.map((g, i) => {
            const meSide = username ? whoAmI(g, username) : null;
            const pgnTags = parsePGNTags(g.pgn);
            const openingName = pgnTags["Opening"] || pgnTags["ECO"] || "Unknown";
            return (
              <li key={i} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 14 }}>
                  <strong>{g.white.username}</strong> vs <strong>{g.black.username}</strong> — {openingName}
                </div>
                <div style={{ fontSize: 13, color: "#555" }}>
                  {g.end_time ? format(fromUnixTime(g.end_time), "PPP") : "-"} — {resultFromPerspective(g, meSide)}
                  {" • "}
                  <a href={g.url} target="_blank" rel="noreferrer">view</a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}