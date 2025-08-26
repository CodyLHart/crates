import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import collectionRoutes from "./routes/collection.js";
import discogsRoutes from "./routes/discogs.js";
import spotifyRoutes from "./routes/spotify.js";
import authRoutes from "./routes/auth.js";

// Load environment variables
dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT || 5050;
const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: [
      process.env.APP_URL || "http://localhost:5173",
      "http://73.14.175.20:5173",
      "https://73.14.175.20:5173",
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

// Routes
app.use("/auth", authRoutes);
app.use("/collection", collectionRoutes);
app.use("/api/discogs", discogsRoutes);
app.use("/api/spotify", spotifyRoutes);

// start the Express server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT} on all interfaces`);
  console.log(`External access: http://73.14.175.20:${PORT}`);
});
