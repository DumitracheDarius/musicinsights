import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Route to handle the scrape request
  app.post("/scrape", async (req, res) => {
    const { song_name, artist } = req.body;

    if (!song_name || !artist) {
      return res.status(400).json({ message: "Song name and artist are required" });
    }

    try {
      const response = await fetch("http://localhost:8000/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ song_name, artist }).toString(),
      });

      const data = await response.json();
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json({ message: "Error forwarding to Java backend", error });
    }
  });
  const httpServer = createServer(app);

  return httpServer;
}
