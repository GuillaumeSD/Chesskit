import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username } = req.query;
  if (!username) return res.status(400).json({ error: "Username required" });

  try {
    const response = await fetch(
      `https://api.chess.com/pub/player/${username}/games/archives`
    );
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch archives" });
  }
}