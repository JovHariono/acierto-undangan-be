require("dotenv").config();
const express = require("express");
const { ensureTable } = require("./connection");
const attendanceRoutes = require("./routes/attendance");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["X-Filename", "Content-Disposition"]
}));


app.use(express.json());

app.use("/attendance", attendanceRoutes);

app.get("/", (req, res) => res.send("Hello World!"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await ensureTable();
  console.log(`Server running on port ${PORT}`);
});
