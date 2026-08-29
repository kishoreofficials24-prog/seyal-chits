const express = require("express");
const cors = require("cors");

require("dotenv").config();

require("./db");

const procedureRoutes = require("./routes/procedureRoutes");

const app = express();


// ================= MIDDLEWARE =================

app.use(cors());

app.use(express.json());


// ================= HOME =================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SEYAL CHITS Backend Running",
  });
});


// ================= PROCEDURE API =================

app.use("/api/procedures", procedureRoutes);


// ================= SERVER =================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 SEYAL CHITS Backend running on port ${PORT}`
  );
});