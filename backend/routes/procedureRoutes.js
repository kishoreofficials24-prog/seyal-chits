const express = require("express");
const pool = require("../db");

const router = express.Router();


// =====================================================
// SAVE PROCEDURE
// POST /api/procedures
// =====================================================

router.post("/", async (req, res) => {
  try {

    console.log("Received Procedure Data:", req.body);

    const {
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


    // =================================================
    // VALIDATION
    // =================================================

    if (!branch) {
      return res.status(400).json({
        success: false,
        message: "Please select Branch",
      });
    }

    if (!staffName) {
      return res.status(400).json({
        success: false,
        message: "Please select Staff Name",
      });
    }

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "Please enter Customer Name",
      });
    }

    if (!chitValue) {
      return res.status(400).json({
        success: false,
        message: "Please select Chit Value",
      });
    }

    if (!keyLever) {
      return res.status(400).json({
        success: false,
        message: "Please select Key Lever",
      });
    }

    if (
      followUp === "" ||
      followUp === null ||
      followUp === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select Follow-up",
      });
    }

    if (
      dueDay === "" ||
      dueDay === null ||
      dueDay === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Please select Due Day",
      });
    }

    if (!payMode) {
      return res.status(400).json({
        success: false,
        message: "Please select Pay Mode",
      });
    }

    if (!collectionType) {
      return res.status(400).json({
        success: false,
        message: "Please select Collection Type",
      });
    }


    // =================================================
    // SAVE TO MYSQL
    // =================================================

    const [result] = await pool.query(
      `
      INSERT INTO procedures
      (
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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
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


    console.log(
      "Procedure Saved Successfully. ID:",
      result.insertId
    );


    res.status(201).json({
      success: true,
      message: "Procedure saved successfully",
      id: result.insertId,
    });


  } catch (error) {

    console.error("=================================");
    console.error("PROCEDURE SAVE ERROR");
    console.error(error);
    console.error("=================================");

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
});



// =====================================================
// GET ALL PROCEDURES
// GET /api/procedures
// =====================================================

router.get("/", async (req, res) => {

  try {

    const [rows] = await pool.query(
      `
      SELECT
        id,
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


    console.log(
      "Procedures Fetched:",
      rows.length
    );


    res.json({
      success: true,
      data: rows,
    });


  } catch (error) {

    console.error("=================================");
    console.error("PROCEDURE FETCH ERROR");
    console.error(error);
    console.error("=================================");

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

});


module.exports = router;