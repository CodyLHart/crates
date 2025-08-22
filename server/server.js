import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import records from "./routes/record.js";
import discogsRoutes from "./routes/discogs.js";

// Load environment variables
dotenv.config({ path: "./config.env" });

const PORT = process.env.PORT || 5050;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/record", records);
app.use("/api/discogs", discogsRoutes);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
