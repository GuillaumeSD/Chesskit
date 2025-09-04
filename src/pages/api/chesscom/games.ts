import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, month } = req.query;
  if (!username || !month) return res.status(400).json({ error: "Missing params" });

  try {
    const response = await fetch(
      `https://api.chess.com/pub/player/${username}/games/${month}`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch games" });
  }
}