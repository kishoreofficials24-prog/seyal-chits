const express = require("express");
const pool = require("../db");

const router = express.Router();

// =====================================================
// ENSURE PROCEDURES TABLE EXISTS
// =====================================================

async function ensureProceduresTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS procedures (
      id INT AUTO_INCREMENT PRIMARY KEY,

      joined_date DATE NOT NULL,

      branch VARCHAR(150) NOT NULL,

      staff_name VARCHAR(150) NOT NULL,

      customer_name VARCHAR(150) NOT NULL,

      chit_value VARCHAR(100) NOT NULL,

      key_lever VARCHAR(150) NOT NULL,

      follow_up INT NOT NULL,

      due_day VARCHAR(100) NOT NULL,

      pay_mode VARCHAR(100) NOT NULL,

      collection_type VARCHAR(100) NOT NULL,

      remarks TEXT,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// =====================================================
// SAVE PROCEDURE
// POST /api/procedures
// =====================================================

router.post("/", async (req, res) => {
  try {
    await ensureProceduresTable();

    const {
      joinedDate,
      branch,
      staffName,
      customerName,
      chitValue,
      keyLever,
      followUp,
      dueDay,
      payMode,
      collectionType,
      remarks,
    } = req.body;

    // ================= REQUIRED FIELD CHECK =================

    if (
      !joinedDate ||
      !branch ||
      !staffName ||
      !customerName ||
      !chitValue ||
      !keyLever ||
      followUp === "" ||
      followUp === null ||
      followUp === undefined ||
      !dueDay ||
      !payMode ||
      !collectionType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // ================= INSERT =================

    const [result] = await pool.query(
      `
      INSERT INTO procedures
      (
        joined_date,
        branch,
        staff_name,
        customer_name,
        chit_value,
        key_lever,
        follow_up,
        due_day,
        pay_mode,
        collection_type,
        remarks
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        joinedDate,
        branch,
        staffName,
        customerName,
        chitValue,
        keyLever,
        followUp,
        dueDay,
        payMode,
        collectionType,
        remarks || null,
      ]
    );

    // ================= SUCCESS =================

    res.status(201).json({
      success: true,
      message: "Procedure saved successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error(
      "Procedure Save Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to save procedure",
      error: error.message,
    });
  }
});

// =====================================================
// GET ALL PROCEDURES
// GET /api/procedures
// =====================================================

router.get("/", async (req, res) => {
  try {
    await ensureProceduresTable();

    const [rows] = await pool.query(
      `
      SELECT
        id,
        joined_date AS joinedDate,
        branch,
        staff_name AS staffName,
        customer_name AS customerName,
        chit_value AS chitValue,
        key_lever AS keyLever,
        follow_up AS followUp,
        due_day AS dueDay,
        pay_mode AS payMode,
        collection_type AS collectionType,
        remarks,
        created_at AS createdAt
      FROM procedures
      ORDER BY id DESC
      `
    );

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error(
      "Procedure Fetch Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch procedures",
      error: error.message,
    });
  }
});

// =====================================================
// UPDATE PROCEDURE
// PUT /api/procedures/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    await ensureProceduresTable();

    const { id } = req.params;

    const {
      joinedDate,
      branch,
      staffName,
      customerName,
      chitValue,
      keyLever,
      followUp,
      dueDay,
      payMode,
      collectionType,
      remarks,
    } = req.body;

    // ================= REQUIRED FIELD CHECK =================

    if (
      !joinedDate ||
      !branch ||
      !staffName ||
      !customerName ||
      !chitValue ||
      !keyLever ||
      followUp === "" ||
      followUp === null ||
      followUp === undefined ||
      !dueDay ||
      !payMode ||
      !collectionType
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all required fields",
      });
    }

    // ================= UPDATE =================

    const [result] = await pool.query(
      `
      UPDATE procedures
      SET
        joined_date = ?,
        branch = ?,
        staff_name = ?,
        customer_name = ?,
        chit_value = ?,
        key_lever = ?,
        follow_up = ?,
        due_day = ?,
        pay_mode = ?,
        collection_type = ?,
        remarks = ?
      WHERE id = ?
      `,
      [
        joinedDate,
        branch,
        staffName,
        customerName,
        chitValue,
        keyLever,
        followUp,
        dueDay,
        payMode,
        collectionType,
        remarks || null,
        id,
      ]
    );

    // ================= NOT FOUND =================

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Procedure not found",
      });
    }

    // ================= SUCCESS =================

    res.json({
      success: true,
      message: "Procedure updated successfully",
    });
  } catch (error) {
    console.error(
      "Procedure Update Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to update procedure",
      error: error.message,
    });
  }
});

// =====================================================
// DELETE PROCEDURE
// DELETE /api/procedures/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    await ensureProceduresTable();

    const { id } = req.params;

    const [result] = await pool.query(
      "DELETE FROM procedures WHERE id = ?",
      [id]
    );

    // ================= NOT FOUND =================

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Procedure not found",
      });
    }

    // ================= SUCCESS =================

    res.json({
      success: true,
      message: "Procedure deleted successfully",
    });
  } catch (error) {
    console.error(
      "Procedure Delete Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete procedure",
      error: error.message,
    });
  }
});

// =====================================================
// EXPORT
// =====================================================

module.exports = router;