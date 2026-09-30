
const express = require("express");
const cors = require("cors");

require("dotenv").config();

const db = require("./db");

const procedureRoutes = require("./routes/procedureRoutes");

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "SEYAL CHITS Backend Running",
  });
});

// =====================================================
// NEW CHIT / PROCEDURE API
// =====================================================

app.use(
  "/api/procedures",
  procedureRoutes
);

// =====================================================
// DATABASE INITIALIZATION
// =====================================================

// =====================================================
// BASE CHIT SCHEDULE - ■1,00,000
// =====================================================

const BASE_CHIT_SCHEDULE_1_LAKH = [
  0,
  65000,
  66000,
  67000,
  68000,
  69000,
  70000,
  71000,
  73000,
  75000,

  77000,
  79000,
  81000,
  83000,
  85000,
  87000,
  89000,
  92000,
  95000,
  98000,
];

// =====================================================
// BUILD SCALED CHIT SCHEDULE
// =====================================================

function buildScaledChitSchedule(chitValue) {
  const value = Number(chitValue);

  const multiplier = value / 100000;

  return BASE_CHIT_SCHEDULE_1_LAKH.map(
    (amount) =>
      Math.round(Number(amount) * multiplier * 100) / 100
  );
}

// =====================================================
// ENSURE ONE CHIT MASTER HAS 20 MONTHS
// =====================================================

async function ensureChitMasterSchedule(chitMasterId, chitValue) {
  if (!chitMasterId || !Number(chitValue) || Number(chitValue) <= 0) {



    return;
  }

  const schedule = buildScaledChitSchedule(chitValue);

  const [existingRows] = await db.query(
    `
    SELECT id, month_number, payment_amount
    FROM chit_master_schedule
    WHERE chit_master_id = ?
    ORDER BY month_number ASC
    `,
    [chitMasterId]
  );

  // Complete schedule already exists. Nothing to do.
  if (existingRows.length === 20) {
    return;
  }

  // Repair missing/incomplete schedule.
  await db.query(
    `
    DELETE FROM chit_master_schedule
    WHERE chit_master_id = ?
    `,
    [chitMasterId]
  );

  for (let i = 0; i < 20; i++) {
    await db.query(
      `
      INSERT INTO chit_master_schedule
        (chit_master_id, month_number, payment_amount)
      VALUES (?, ?, ?)
      `,
      [chitMasterId, i + 1, schedule[i]]
    );
  }

  console.log(
    `■ Schedule repaired for chit ■${Number(chitValue).toLocaleString("en-IN")}`
  );
}

// =====================================================
// ENSURE ALL CHIT MASTERS HAVE 20 MONTHS
// =====================================================

async function ensureAllChitMasterSchedules() {
  const [masters] = await db.query(
    `
    SELECT id, chit_value
    FROM chit_master
    ORDER BY chit_value ASC
    `
  );

  for (const master of masters) {
    await ensureChitMasterSchedule(
      master.id,
      master.chit_value
    );
  }

  console.log("■ All chit master schedules checked");
}

async function initializePaymentTables() {
  try {

    // =================================================
    // CHIT MASTER
    // =================================================

    await db.query(`
      CREATE TABLE IF NOT EXISTS chit_master (
        id INT AUTO_INCREMENT PRIMARY KEY,

        chit_value DECIMAL(15,2)
          NOT NULL UNIQUE,

        total_months INT
          NOT NULL DEFAULT 20,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // =================================================
    // CHIT MASTER SCHEDULE
    // =================================================

    await db.query(`
      CREATE TABLE IF NOT EXISTS chit_master_schedule (
        id INT AUTO_INCREMENT PRIMARY KEY,

        chit_master_id INT NOT NULL,

        month_number INT NOT NULL,



        payment_amount DECIMAL(15,2)
          NOT NULL,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_chit_master_schedule_master
          FOREIGN KEY (chit_master_id)
          REFERENCES chit_master(id)
          ON DELETE CASCADE,

        UNIQUE KEY unique_master_month
          (chit_master_id, month_number)
      )
    `);

    // =================================================
    // SETTINGS - STAFF
    // =================================================

    await db.query(`
      CREATE TABLE IF NOT EXISTS settings_staff (
        id INT AUTO_INCREMENT PRIMARY KEY,

        name VARCHAR(150)
          NOT NULL UNIQUE,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // =================================================
    // SEED EXISTING STAFF INTO SETTINGS
    // =================================================
    // These were previously hardcoded in New Chit.
    // Insert only if missing; Settings becomes the source of truth.
    const existingStaffNames = [
      "Thiyagarajan",
      "Renugadevi",
      "Prathap",
      "Venkateshan",
      "Uma Devi",
      "Rathinam",
      "Bharani",
      "Rani",
      "Loganayaki",
      "Chandralekha",
      "Chinnasamy L",
      "Muthulakshmi A",
      "Agalya",
      "Tamizharasi M",
      "Ruckmani",
      "Devika",
      "Rajalakshmi K",
    ];

    for (const staffName of existingStaffNames) {
      await db.query(
        `
        INSERT IGNORE INTO settings_staff (name)
        VALUES (?)
        `,
        [staffName]
      );
    }

    // =================================================
    // SETTINGS - BRANCHES
    // =================================================

    await db.query(`
      CREATE TABLE IF NOT EXISTS settings_branches (
        id INT AUTO_INCREMENT PRIMARY KEY,

        name VARCHAR(150)
          NOT NULL UNIQUE,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // =================================================
    // PAYMENT PLANS

    // =================================================

    await db.query(`
      CREATE TABLE IF NOT EXISTS payment_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,

        name VARCHAR(150) NOT NULL,

        staff_name VARCHAR(150) NOT NULL,

        village VARCHAR(150) NOT NULL,

        chit_master_id INT NOT NULL,
        payment_month INT



          NOT NULL DEFAULT 1,

        first_due_date DATE NOT NULL,

        plan_date DATE NOT NULL,

        remarks TEXT,

        display_order INT
          DEFAULT 0,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_payment_plan_master
          FOREIGN KEY (chit_master_id)
          REFERENCES chit_master(id)
          ON DELETE RESTRICT
      )
    `);

    // =================================================
    // PAYMENT PLANS - PAYMENT MONTH MIGRATION
    // =================================================

    const [paymentMonthColumn] =
      await db.query(`
        SELECT COUNT(*) AS total

        FROM INFORMATION_SCHEMA.COLUMNS

        WHERE TABLE_SCHEMA = DATABASE()

        AND TABLE_NAME = 'payment_plans'

        AND COLUMN_NAME = 'payment_month'
      `);

    if (
      Number(paymentMonthColumn[0].total) === 0
    ) {

      await db.query(`
        ALTER TABLE payment_plans

        ADD COLUMN payment_month INT
        NOT NULL DEFAULT 1

        AFTER chit_master_id
      `);

      console.log(
        "■ payment_month column added"
      );
    }

    // =================================================

    // PAYMENTS
    // =================================================

    await db.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,

        payment_plan_id INT NOT NULL,

        amount DECIMAL(15,2) NOT NULL,

        payment_date DATE NOT NULL,

        place VARCHAR(150) NOT NULL,

        photo ENUM('Yes','No') NOT NULL,

        review ENUM('Yes','No') NOT NULL,

        video ENUM('Yes','No') NOT NULL,

        application ENUM('Yes','No') NOT NULL,

        remarks TEXT,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_payment_payment_plan
          FOREIGN KEY (payment_plan_id)
          REFERENCES payment_plans(id)
          ON DELETE RESTRICT
      )
    `);

    // =================================================
    // FUTURE CHIT REQUIREMENTS
    // =================================================

    await db.query(`
      CREATE TABLE IF NOT EXISTS future_chit_requirements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL,



        staff_name VARCHAR(150) NOT NULL,

        village VARCHAR(150) NOT NULL,

        chit_value DECIMAL(15,2) NOT NULL,

        start_date DATE NOT NULL,

        required_month INT NOT NULL,

        required_amount DECIMAL(15,2) NOT NULL,

        remarks TEXT,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log(
      "■ All database tables checked/created"
    );

    // =================================================
    // DEFAULT CHIT MASTER VALUES
    // =================================================

    const [masterRows] =
      await db.query(`
        SELECT COUNT(*) AS total
        FROM chit_master
      `);

    if (
      Number(masterRows[0].total) === 0
    ) {

      await db.query(`
        INSERT INTO chit_master
          (
            chit_value,
            total_months
          )

        VALUES
          (100000, 20),
          (200000, 20),
          (500000, 20),
          (1000000, 20)
      `);

      console.log(
        "■ Default chit master values inserted"
      );
    }

    // =================================================
    // DEFAULT SCHEDULE
    // =================================================

    const [scheduleRows] =
      await db.query(`
        SELECT COUNT(*) AS total
        FROM chit_master_schedule
      `);

    if (
      Number(scheduleRows[0].total) === 0
    ) {

      const [masters] =
        await db.query(`
          SELECT
            id,
            chit_value

          FROM chit_master

          ORDER BY chit_value ASC

        `);

      const schedules = {

        "100000": [
          0,
          65000,
          66000,
          67000,
          68000,
          69000,
          70000,
          71000,
          73000,
          75000,
          77000,
          79000,
          81000,
          83000,



          85000,
          87000,
          89000,
          92000,
          95000,
          98000,
        ],

        "200000": [
          0,
          130000,
          132000,
          134000,
          136000,
          138000,
          140000,
          142000,
          146000,
          150000,
          154000,
          158000,
          162000,
          166000,
          170000,
          174000,
          178000,
          184000,
          190000,
          196000,
        ],

        "500000": [

          0,
          325000,
          330000,
          335000,
          340000,
          345000,
          350000,
          355000,
          365000,
          375000,
          385000,
          395000,
          405000,
          415000,
          425000,
          435000,
          445000,
          460000,
          475000,
          490000,
        ],

        "1000000": [
          0,
          650000,
          660000,
          670000,
          680000,
          690000,
          700000,
          710000,
          730000,
          750000,
          770000,
          790000,
          810000,
          830000,
          850000,
          870000,
          890000,
          920000,
          950000,
          980000,
        ],
      };

      for (
        const master of masters
      ) {

        const values =
          schedules[
            String(
              Number(
                master.chit_value
              )
            )
          ];

        if (!values) {
          continue;
        }

        for (
          let i = 0;
          i < values.length;
          i++
        ) {



          await db.query(
            `

            INSERT INTO chit_master_schedule
              (
                chit_master_id,
                month_number,
                payment_amount
              )

            VALUES (?, ?, ?)
            `,

            [
              master.id,
              i + 1,
              values[i],
            ]
          );

        }
      }

      console.log(
        "■ Default month-wise schedules inserted"
      );
    }

    // =================================================
    // REPAIR ALL MISSING / INCOMPLETE SCHEDULES
    // =================================================

    await ensureAllChitMasterSchedules();

  } catch (error) {

    console.error(
      "■ Database initialization failed:"
    );

    console.error(
      error.message
    );

  }
}

// =====================================================
// MONTH LABEL HELPER
// =====================================================

function getMonthLabel(month) {

  const lastTwo =

    month % 100;

  if (
    lastTwo >= 11 &&
    lastTwo <= 13
  ) {

    return `${month}th Month`;

  }

  switch (
    month % 10
  ) {

    case 1:
      return `${month}st Month`;

    case 2:
      return `${month}nd Month`;

    case 3:
      return `${month}rd Month`;

    default:
      return `${month}th Month`;

  }
}
// =====================================================
// SETTINGS - STAFF
// =====================================================

app.get(
  "/api/settings/staff",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT
            id,
            name,



            created_at

          FROM settings_staff

          ORDER BY name ASC
        `);

      res.json({
        success: true,
        data: rows,
      });

    } catch (error) {

      console.error(
        "GET settings staff error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load staff",
        error: error.message,
      });
    }

  }
);

// =====================================================
// ADD STAFF
// =====================================================

app.post(
  "/api/settings/staff",
  async (req, res) => {

    try {

      const name =
        String(
          req.body.name || ""
        ).trim();

      if (!name) {

        return res.status(400).json({
          success: false,
          message:
            "Staff name is required",
        });

      }

      const [result] =
        await db.query(
          `
          INSERT INTO settings_staff
            (name)

          VALUES (?)
          `,
          [name]
        );

      res.status(201).json({

        success: true,

        message:
          "Staff added successfully",

        id:
          result.insertId,

      });

    } catch (error) {

      console.error(
        "POST settings staff error:",
        error
      );

      res.status(
        error.code ===
        "ER_DUP_ENTRY"
          ? 409
          : 500
      ).json({

        success: false,

        message:
          error.code ===
          "ER_DUP_ENTRY"

            ? "This staff name already exists"



            : "Unable to add staff",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// UPDATE STAFF
// =====================================================

app.put(
  "/api/settings/staff/:id",
  async (req, res) => {

    try {

      const name =
        String(
          req.body.name || ""
        ).trim();

      if (!name) {

        return res.status(400).json({
          success: false,
          message:
            "Staff name is required",
        });

      }

      const [result] =
        await db.query(
          `
          UPDATE settings_staff

          SET name = ?

          WHERE id = ?
          `,

          [
            name,
            req.params.id,
          ]
        );

      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Staff not found",
        });

      }

      res.json({
        success: true,
        message:
          "Staff updated successfully",
      });

    } catch (error) {

      console.error(
        "PUT settings staff error:",
        error
      );

      res.status(
        error.code ===
        "ER_DUP_ENTRY"
          ? 409
          : 500
      ).json({

        success: false,

        message:
          error.code ===
          "ER_DUP_ENTRY"

            ? "This staff name already exists"

            : "Unable to update staff",

        error:
          error.message,

      });



    }

  }
);

// =====================================================
// DELETE STAFF
// =====================================================

app.delete(
  "/api/settings/staff/:id",
  async (req, res) => {

    try {

      const [result] =
        await db.query(
          `
          DELETE FROM settings_staff

          WHERE id = ?
          `,
          [req.params.id]
        );

      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Staff not found",
        });

      }

      res.json({
        success: true,
        message:
          "Staff deleted successfully",
      });

    } catch (error) {

      console.error(
        "DELETE settings staff error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete staff",
        error:
          error.message,
      });

    }

  }
);

// =====================================================
// SETTINGS - BRANCHES
// =====================================================
app.get(

  "/api/settings/branches",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT
            id,
            name,
            created_at

          FROM settings_branches

          ORDER BY name ASC
        `);

      res.json({
        success: true,
        data: rows,
      });

    } catch (error) {

      console.error(
        "GET settings branches error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load branches",



        error:
          error.message,
      });

    }

  }
);

// =====================================================
// ADD BRANCH
// =====================================================

app.post(
  "/api/settings/branches",
  async (req, res) => {

    try {

      const name =
        String(
          req.body.name || ""
        ).trim();

      if (!name) {

        return res.status(400).json({
          success: false,
          message:
            "Branch name is required",
        });

      }

      const [result] =
        await db.query(
          `
          INSERT INTO settings_branches
            (name)

          VALUES (?)
          `,
          [name]
        );

      res.status(201).json({

        success: true,

        message:
          "Branch added successfully",

        id:
          result.insertId,

      });

    } catch (error) {

      console.error(
        "POST settings branch error:",
        error
      );

      res.status(
        error.code ===
        "ER_DUP_ENTRY"
          ? 409
          : 500
      ).json({

        success: false,

        message:
          error.code ===
          "ER_DUP_ENTRY"

            ? "This branch already exists"

            : "Unable to add branch",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// UPDATE BRANCH
// =====================================================

app.put(
  "/api/settings/branches/:id",
  async (req, res) => {
    try {



      const name =
        String(
          req.body.name || ""
        ).trim();

      if (!name) {

        return res.status(400).json({
          success: false,
          message:
            "Branch name is required",
        });

      }

      const [result] =
        await db.query(
          `
          UPDATE settings_branches

          SET name = ?

          WHERE id = ?
          `,
          [
            name,
            req.params.id,
          ]
        );

      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({
          success: false,
          message:

            "Branch not found",
        });

      }

      res.json({
        success: true,
        message:
          "Branch updated successfully",
      });

    } catch (error) {

      console.error(
        "PUT settings branch error:",
        error
      );

      res.status(
        error.code ===
        "ER_DUP_ENTRY"
          ? 409
          : 500
      ).json({

        success: false,

        message:
          error.code ===
          "ER_DUP_ENTRY"

            ? "This branch already exists"

            : "Unable to update branch",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// DELETE BRANCH
// =====================================================

app.delete(
  "/api/settings/branches/:id",
  async (req, res) => {

    try {

      const [result] =
        await db.query(
          `
          DELETE FROM settings_branches

          WHERE id = ?
          `,
          [req.params.id]



        );

      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({

          success: false,
          message:
            "Branch not found",
        });

      }

      res.json({
        success: true,
        message:
          "Branch deleted successfully",
      });

    } catch (error) {

      console.error(
        "DELETE settings branch error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to delete branch",
        error:
          error.message,
      });

    }

  }
);

// =====================================================
// SETTINGS - CHIT VALUES
// =====================================================
// IMPORTANT:
// Chit values use the existing chit_master table.
// This keeps ONE source of truth for chit values.

app.get(
  "/api/settings/chit-values",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT
            id,

            chit_value,
            total_months,
            created_at

          FROM chit_master

          ORDER BY
            chit_value ASC
        `);

      res.json({
        success: true,
        data: rows,
      });

    } catch (error) {

      console.error(
        "GET settings chit values error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load chit values",
        error:
          error.message,
      });

    }

  }
);

// =====================================================
// ADD CHIT VALUE
// =====================================================

app.post(



  "/api/settings/chit-values",
  async (req, res) => {

    try {

      const chitValue =
        Number(
          req.body.chitValue
        );

      const totalMonths =
        Number(
          req.body.totalMonths
        );

      if (
        !Number.isFinite(
          chitValue
        ) ||
        chitValue <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Enter a valid chit value",
        });

      }
      if (

        !Number.isInteger(
          totalMonths
        ) ||
        totalMonths <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Enter valid total months",
        });

      }

      const [result] =
        await db.query(
          `
          INSERT INTO chit_master
            (
              chit_value,
              total_months
            )

          VALUES (?, ?)
          `,
          [
            chitValue,
            totalMonths,
          ]
        );

      // Automatically create the 20-month schedule.
      await ensureChitMasterSchedule(
        result.insertId,
        chitValue
      );

      res.status(201).json({

        success: true,

        message:
          "Chit value added successfully",

        id:
          result.insertId,

      });

    } catch (error) {

      console.error(
        "POST settings chit value error:",
        error
      );

      res.status(
        error.code ===
        "ER_DUP_ENTRY"
          ? 409
          : 500
      ).json({

        success: false,

        message:
          error.code ===
          "ER_DUP_ENTRY"



            ? "This chit value already exists"

            : "Unable to add chit value",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// UPDATE CHIT VALUE
// =====================================================

app.put(
  "/api/settings/chit-values/:id",
  async (req, res) => {

    try {

      const chitValue =
        Number(
          req.body.chitValue
        );

      const totalMonths =
        Number(
          req.body.totalMonths
        );

      if (
        !Number.isFinite(
          chitValue
        ) ||
        chitValue <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Enter a valid chit value",
        });

      }

      if (
        !Number.isInteger(

          totalMonths
        ) ||
        totalMonths <= 0
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Enter valid total months",
        });

      }

      const [result] =
        await db.query(
          `
          UPDATE chit_master

          SET
            chit_value = ?,
            total_months = ?

          WHERE id = ?
          `,
          [
            chitValue,
            totalMonths,
            req.params.id,
          ]
        );

      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Chit value not found",
        });

      }

      // Rebuild the schedule so it matches the new chit value.
      await ensureChitMasterSchedule(
        req.params.id,
        chitValue
      );
      res.json({



        success: true,

        message:
          "Chit value and schedule updated successfully",
      });

    } catch (error) {

      console.error(
        "PUT settings chit value error:",
        error
      );

      res.status(
        error.code ===
        "ER_DUP_ENTRY"
          ? 409
          : 500
      ).json({

        success: false,

        message:
          error.code ===
          "ER_DUP_ENTRY"

            ? "This chit value already exists"

            : "Unable to update chit value",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// DELETE CHIT VALUE
// =====================================================

app.delete(
  "/api/settings/chit-values/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      // Do not allow deleting a chit
      // already used in a payment plan.

      const [
        paymentPlanRows,
      ] = await db.query(
        `
        SELECT
          id

        FROM payment_plans

        WHERE chit_master_id = ?

        LIMIT 1
        `,
        [id]
      );
      if (
        paymentPlanRows.length > 0

      ) {

        return res.status(400).json({

          success: false,

          message:
            "This chit value is already used by a Payment Plan and cannot be deleted.",

        });

      }

      // Delete schedule first.

      await db.query(
        `
        DELETE FROM
          chit_master_schedule

        WHERE chit_master_id = ?
        `,
        [id]
      );
      const [result] =



        await db.query(
          `
          DELETE FROM
            chit_master

          WHERE id = ?
          `,
          [id]
        );

      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Chit value not found",

        });

      }

      res.json({

        success: true,

        message:
          "Chit value deleted successfully",

      });

    } catch (error) {

      console.error(
        "DELETE settings chit value error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to delete chit value",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// CHIT MASTER - GET ALL
// =====================================================

app.get(
  "/api/chit-masters",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT
            id,
            chit_value,
            total_months,
            created_at

          FROM chit_master

          ORDER BY
            chit_value ASC
        `);

      res.json({
        success: true,
        data: rows,
      });

    } catch (error) {

      console.error(
        "GET chit masters error:",
        error
      );
      res.status(500).json({
        success: false,

        message:
          "Unable to load chit masters",
        error:



          error.message,

      });

    }

  }
);

// =====================================================
// CHIT MASTER - GET ONE
// =====================================================

app.get(
  "/api/chit-masters/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const [rows] =
        await db.query(
          `
          SELECT
            id,
            chit_value,
            total_months,
            created_at

          FROM chit_master

          WHERE id = ?
          `,
          [id]
        );

      if (
        rows.length === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Chit master not found",

        });

      }

      res.json({

        success: true,

        data: rows[0],

      });

    } catch (error) {

      console.error(
        "GET single chit master error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to load chit master",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// CHIT MASTER - CREATE
// =====================================================

app.post(
  "/api/chit-masters",
  async (req, res) => {

    try {

      const {
        chit_value,
        total_months,
      } = req.body;

      if (



        chit_value ===
          undefined ||
        chit_value ===
          null ||
        !total_months
      ) {

        return res.status(400).json({

          success: false,
          message:

            "Chit value and total months are required",

        });

      }

      const [result] =
        await db.query(
          `
          INSERT INTO chit_master
            (
              chit_value,
              total_months
            )

          VALUES (?, ?)
          `,
          [
            chit_value,
            total_months,
          ]
        );

      // Automatically create the 20-month schedule.
      await ensureChitMasterSchedule(
        result.insertId,
        chit_value
      );

      res.status(201).json({

        success: true,

        message:
          "Chit master created successfully",

        id:
          result.insertId,

      });

    } catch (error) {

      console.error(
        "POST chit master error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to create chit master",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// CHIT MASTER - UPDATE
// =====================================================

app.put(
  "/api/chit-masters/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const {
        chit_value,
        total_months,
      } = req.body;

      await db.query(
        `
        UPDATE chit_master
        SET



          chit_value = ?,
          total_months = ?

        WHERE id = ?
        `,
        [
          chit_value,
          total_months,
          id,
        ]
      );

      // Rebuild the schedule so it matches the updated chit value.
      await ensureChitMasterSchedule(
        id,
        chit_value
      );

      res.json({

        success: true,

        message:
          "Chit master updated successfully",

      });

    } catch (error) {

      console.error(
        "PUT chit master error:",

        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to update chit master",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// CHIT MASTER - DELETE
// =====================================================

app.delete(
  "/api/chit-masters/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      await db.query(
        `
        DELETE FROM chit_master

        WHERE id = ?
        `,
        [id]
      );

      res.json({

        success: true,

        message:
          "Chit master deleted successfully",

      });

    } catch (error) {

      console.error(
        "DELETE chit master error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to delete chit master",

        error:
          error.message,



      });

    }

  }
);

// =====================================================
// CHIT MASTER SCHEDULE - GET
// =====================================================

app.get(
  "/api/chit-masters/:id/schedule",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const [masterRows] =
        await db.query(
          `
          SELECT
            id,
            chit_value

          FROM chit_master

          WHERE id = ?
          `,
          [id]
        );

      if (
        masterRows.length === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Chit master not found",
        });

      }

      // Automatically repair a missing/incomplete schedule
      // before returning it to the frontend.
      await ensureChitMasterSchedule(
        masterRows[0].id,
        masterRows[0].chit_value
      );
      const [rows] =

        await db.query(
          `
          SELECT
            id,
            chit_master_id,
            month_number,
            payment_amount,
            created_at

          FROM chit_master_schedule

          WHERE chit_master_id = ?

          ORDER BY
            month_number ASC
          `,
          [id]
        );

      res.json({
        success: true,
        data: rows,
      });

    } catch (error) {

      console.error(
        "GET chit schedule error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to load chit schedule",
        error: error.message,
      });

    }

  }
);

// =====================================================
// PAYMENT PLAN - GET ALL
// =====================================================
app.get(



  "/api/payment-plans",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT

            pp.id,

            pp.name,

            pp.staff_name,

            pp.village,

            pp.chit_master_id,

            pp.payment_month,

            pp.first_due_date,

            pp.plan_date,

            pp.remarks,

            pp.display_order,

            pp.created_at,

            cm.chit_value,

            cm.total_months,

            cms.payment_amount
              AS first_payment_amount

          FROM payment_plans pp

          INNER JOIN chit_master cm
            ON cm.id =
              pp.chit_master_id

          LEFT JOIN
            chit_master_schedule cms

            ON cms.chit_master_id =
              pp.chit_master_id

            AND cms.month_number =
              pp.payment_month

          ORDER BY

            pp.display_order ASC,

            pp.id DESC
        `);

      const result =
        rows.map(
          (row) => ({

            ...row,

            payment_due:
              row.payment_month
                ? getMonthLabel(
                    Number(
                      row.payment_month
                    )
                  )

                : "",

          })
        );

      res.json({

        success: true,

        data: result,

      });

    } catch (error) {

      console.error(
        "GET payment plans error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to load payment plans",
        error:



          error.message,

      });

    }

  }
);

// =====================================================
// PAYMENT PLAN - GET ONE
// =====================================================

app.get(
  "/api/payment-plans/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const [rows] =
        await db.query(
          `
          SELECT

            pp.*,

            cm.chit_value,

            cm.total_months

          FROM payment_plans pp

          INNER JOIN chit_master cm

            ON cm.id =
              pp.chit_master_id

          WHERE pp.id = ?

          `,
          [id]
        );

      if (
        rows.length === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Payment plan not found",

        });

      }

      res.json({

        success: true,

        data: rows[0],

      });

    } catch (error) {

      console.error(
        "GET payment plan error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to load payment plan",

        error:
          error.message,

      });

    }

  }
);
// =====================================================

// PAYMENT PLAN - CREATE
// =====================================================

app.post(
  "/api/payment-plans",



  async (req, res) => {

    try {

      const {

        name,

        staff_name,

        village,

        chit_master_id,

        payment_month,

        first_due_date,

        plan_date,

        remarks,

        display_order,

      } = req.body;

      if (

        !name ||

        !staff_name ||

        !village ||

        !chit_master_id ||

        payment_month ===
          undefined ||

        payment_month ===
          null ||

        !first_due_date ||

        !plan_date

      ) {

        return res.status(400).json({

          success: false,

          message:
            "Required payment plan fields are missing",

        });

      }

      const [result] =
        await db.query(
          `
          INSERT INTO payment_plans
            (
              name,

              staff_name,

              village,

              chit_master_id,

              payment_month,

              first_due_date,

              plan_date,

              remarks,

              display_order
            )

          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)

          `,
          [

            name,

            staff_name,

            village,

            chit_master_id,

            Number(
              payment_month
            ),
            first_due_date,



            plan_date,

            remarks ||
              null,

            display_order ||
              0,

          ]
        );

      res.status(201).json({

        success: true,

        message:
          "Payment Plan saved successfully",
        id:

          result.insertId,

      });

    } catch (error) {

      console.error(
        "POST payment plan error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to save payment plan",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// PAYMENT PLAN - UPDATE
// =====================================================

app.put(
  "/api/payment-plans/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const {

        name,

        staff_name,

        village,

        chit_master_id,

        payment_month,

        first_due_date,

        plan_date,

        remarks,

        display_order,

      } = req.body;

      await db.query(
        `
        UPDATE payment_plans

        SET

          name = ?,

          staff_name = ?,

          village = ?,

          chit_master_id = ?,

          payment_month = ?,

          first_due_date = ?,



          plan_date = ?,

          remarks = ?,

          display_order = ?

        WHERE id = ?

        `,
        [

          name,

          staff_name,

          village,

          chit_master_id,

          Number(
            payment_month
          ),

          first_due_date,

          plan_date,

          remarks ||
            null,

          display_order ||
            0,

          id,

        ]
      );

      res.json({

        success: true,

        message:
          "Payment Plan updated successfully",

      });

    } catch (error) {

      console.error(
        "PUT payment plan error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to update payment plan",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// PAYMENT PLAN - DELETE
// =====================================================

app.delete(
  "/api/payment-plans/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const [
        paymentRows,
      ] = await db.query(
        `
        SELECT id

        FROM payments

        WHERE payment_plan_id = ?

        LIMIT 1

        `,
        [id]
      );



      if (
        paymentRows.length > 0
      ) {

        return res.status(400).json({

          success: false,

          message:
            "This Payment Plan has payments and cannot be deleted.",

        });

      }

      const [result] =
        await db.query(
          `
          DELETE FROM payment_plans

          WHERE id = ?

          `,
          [id]
        );

      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Payment Plan not found",

        });

      }

      res.json({

        success: true,

        message:
          "Payment Plan deleted successfully",

      });

    } catch (error) {

      console.error(
        "DELETE payment plan error:",
        error
      );

      res.status(500).json({

        success: false,
        message:

          "Unable to delete payment plan",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// PAYMENT PLAN - PAYMENT INFO
// =====================================================

app.get(
  "/api/payment-plans/:id/payment-info",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const [rows] =
        await db.query(
          `
          SELECT

            pp.id,

            pp.name,

            pp.chit_master_id,

            pp.payment_month,

            pp.plan_date,



            pp.first_due_date,

            cm.chit_value,

            cm.total_months,

            cms.payment_amount

          FROM payment_plans pp

          INNER JOIN chit_master cm

            ON cm.id =
              pp.chit_master_id

          LEFT JOIN
            chit_master_schedule cms

            ON cms.chit_master_id =
              pp.chit_master_id

            AND cms.month_number =
              pp.payment_month

          WHERE pp.id = ?

          `,
          [id]
        );

      if (
        rows.length === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Payment Plan not found",

        });

      }

      const plan =
        rows[0];

      const monthNumber =
        Number(
          plan.payment_month
        );

      res.json({

        success: true,

        data: {

          payment_plan_id:
            plan.id,

          name:
            plan.name,

          chit_value:
            plan.chit_value,

          month_number:
            monthNumber,

          payment_due:
            getMonthLabel(
              monthNumber
            ),

          amount:
            plan.payment_amount ||
            0,

        },

      });

    } catch (error) {

      console.error(
        "GET payment info error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to load payment information",

        error:



          error.message,

      });

    }

  }
);

// =====================================================
// PAYMENTS - GET ALL
// =====================================================

app.get(
  "/api/payments",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT

            p.id,

            p.payment_plan_id,

            p.amount,

            p.payment_date,

            p.place,

            p.photo,

            p.review,

            p.video,

            p.application,

            p.remarks,

            p.created_at,

            pp.name,

            pp.staff_name,

            pp.village,

            pp.chit_master_id,

            pp.payment_month,

            cm.chit_value

          FROM payments p

          INNER JOIN payment_plans pp

            ON pp.id =
              p.payment_plan_id

          INNER JOIN chit_master cm

            ON cm.id =
              pp.chit_master_id

          ORDER BY
            p.payment_date DESC,
            p.id DESC
        `);

      res.json({

        success: true,

        data: rows,

      });

    } catch (error) {

      console.error(
        "GET payments error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to load payments",

        error:
          error.message,

      });
    }



  }
);

// =====================================================
// PAYMENTS - GET ONE

// =====================================================

app.get(
  "/api/payments/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const [rows] =
        await db.query(
          `
          SELECT

            p.*,

            pp.name,

            pp.staff_name,

            pp.village,

            pp.chit_master_id,

            pp.payment_month,

            cm.chit_value

          FROM payments p

          INNER JOIN payment_plans pp

            ON pp.id =
              p.payment_plan_id

          INNER JOIN chit_master cm

            ON cm.id =
              pp.chit_master_id

          WHERE p.id = ?

          `,
          [id]
        );

      if (
        rows.length === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Payment not found",

        });

      }

      res.json({

        success: true,

        data: rows[0],

      });

    } catch (error) {

      console.error(
        "GET payment error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to load payment",

        error:
          error.message,

      });

    }

  }



);

// =====================================================
// PAYMENTS - CREATE
// =====================================================

app.post(
  "/api/payments",
  async (req, res) => {

    try {

      const {

        payment_plan_id,

        amount,

        payment_date,

        place,

        photo,

        review,

        video,

        application,
        remarks,

      } = req.body;

      if (

        !payment_plan_id ||

        amount ===
          undefined ||

        amount ===
          null ||

        !payment_date ||

        !place ||

        !photo ||

        !review ||

        !video ||

        !application

      ) {

        return res.status(400).json({

          success: false,

          message:
            "Required payment fields are missing",

        });

      }

      const [result] =
        await db.query(
          `
          INSERT INTO payments
            (

              payment_plan_id,

              amount,

              payment_date,

              place,

              photo,

              review,

              video,

              application,

              remarks

            )

          VALUES
            (?, ?, ?, ?, ?, ?, ?, ?, ?)

          `,
          [



            payment_plan_id,

            Number(amount),

            payment_date,

            place,

            photo,

            review,

            video,

            application,

            remarks ||
              null,

          ]
        );

      res.status(201).json({

        success: true,

        message:
          "Payment saved successfully",

        id:
          result.insertId,

      });

    } catch (error) {

      console.error(
        "POST payment error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to save payment",

        error:
          error.message,

      });

    }

  }
);

// =====================================================
// PAYMENTS - UPDATE
// =====================================================

app.put(
  "/api/payments/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const {

        payment_plan_id,

        amount,

        payment_date,

        place,

        photo,

        review,

        video,

        application,

        remarks,

      } = req.body;

      await db.query(
        `
        UPDATE payments

        SET

          payment_plan_id = ?,
          amount = ?,



          payment_date = ?,

          place = ?,

          photo = ?,

          review = ?,

          video = ?,

          application = ?,

          remarks = ?

        WHERE id = ?

        `,
        [

          payment_plan_id,

          Number(amount),

          payment_date,

          place,

          photo,

          review,

          video,

          application,

          remarks ||
            null,

          id,

        ]
      );

      res.json({

        success: true,

        message:
          "Payment updated successfully",

      });

    } catch (error) {

      console.error(
        "PUT payment error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to update payment",

        error:
          error.message,

      });

    }

  }
);
// =====================================================

// PAYMENTS - DELETE
// =====================================================

app.delete(
  "/api/payments/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const [result] =
        await db.query(
          `
          DELETE FROM payments

          WHERE id = ?

          `,
          [id]
        );



      if (
        result.affectedRows === 0
      ) {

        return res.status(404).json({

          success: false,

          message:
            "Payment not found",

        });

      }

      res.json({

        success: true,

        message:
          "Payment deleted successfully",

      });

    } catch (error) {

      console.error(
        "DELETE payment error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to delete payment",

        error:
          error.message,

      });

    }

  }
);
// =====================================================
// REPORTS - PAYMENT PLANS
// =====================================================

app.get(
  "/api/reports/payment-plans",
  async (req, res) => {
    try {

      const [rows] = await db.query(`
        SELECT

          pp.id,

          pp.name,

          pp.staff_name,

          pp.village,

          pp.chit_master_id,

          pp.payment_month,

          pp.first_due_date,

          pp.plan_date,

          pp.remarks,

          pp.display_order,

          pp.created_at,

          cm.chit_value,

          cm.total_months,

          cms.payment_amount
            AS planned_amount

        FROM payment_plans pp

        INNER JOIN chit_master cm
          ON cm.id =
            pp.chit_master_id

        LEFT JOIN chit_master_schedule cms
          ON cms.chit_master_id =
            pp.chit_master_id

          AND cms.month_number =
            pp.payment_month
        ORDER BY



          pp.plan_date DESC,
          pp.id DESC
      `);

      res.json({
        success: true,

        data: rows.map(
          (row) => ({
            ...row,

            payment_due:
              row.payment_month
                ? getMonthLabel(
                    Number(
                      row.payment_month
                    )
                  )
                : "",
          })
        ),
      });

    } catch (error) {

      console.error(
        "Payment plan report error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to load payment plan report",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// REPORTS - PAYMENTS
// =====================================================

app.get(
  "/api/reports/payments",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT

            p.id,

            p.payment_plan_id,

            p.amount,

            p.payment_date,

            p.place,

            p.photo,

            p.review,

            p.video,

            p.application,

            p.remarks,

            pp.name,

            pp.staff_name,

            pp.village,

            pp.payment_month,

            cm.chit_value

          FROM payments p

          INNER JOIN payment_plans pp
            ON pp.id =
              p.payment_plan_id

          INNER JOIN chit_master cm
            ON cm.id =
              pp.chit_master_id

          ORDER BY
            p.payment_date DESC,
            p.id DESC
        `);



      res.json({
        success: true,

        data: rows,
      });

    } catch (error) {

      console.error(
        "Payment report error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to load payment report",

        error:
          error.message,
      });
    }

  }
);

// =====================================================
// REPORTS - PLAN + PAYMENT
// =====================================================

app.get(
  "/api/reports/combined",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT

            pp.id
              AS payment_plan_id,

            pp.name,

            pp.staff_name,

            pp.village,

            pp.payment_month,

            pp.plan_date,

            pp.first_due_date,

            cm.chit_value,

            cms.payment_amount
              AS planned_amount,

            p.id
              AS payment_id,

            p.amount
              AS paid_amount,

            p.payment_date,

            p.place,

            p.photo,

            p.review,

            p.video,

            p.application,

            p.remarks
              AS payment_remarks

          FROM payment_plans pp

          INNER JOIN chit_master cm
            ON cm.id =
              pp.chit_master_id

          LEFT JOIN chit_master_schedule cms
            ON cms.chit_master_id =
              pp.chit_master_id

            AND cms.month_number =
              pp.payment_month

          LEFT JOIN payments p
            ON p.payment_plan_id =
              pp.id
          ORDER BY



            pp.plan_date DESC,
            p.payment_date DESC,
            pp.id DESC
        `);

      res.json({

        success: true,

        data: rows.map(
          (row) => ({
            ...row,

            payment_due:
              row.payment_month
                ? getMonthLabel(
                    Number(
                      row.payment_month
                    )
                  )
                : "",
          })
        ),
      });

    } catch (error) {

      console.error(
        "Combined report error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to load combined report",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// FUTURE CHIT REQUIREMENTS
// =====================================================
app.get(

  "/api/future-requirements",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT

            id,

            name,

            staff_name,

            village,

            chit_value,

            start_date,

            required_month,

            required_amount,

            remarks,

            created_at

          FROM future_chit_requirements

          ORDER BY
            start_date ASC,
            required_month ASC,
            id DESC
        `);

      res.json({

        success: true,

        data: rows,

      });

    } catch (error) {

      console.error(
        "Future requirements GET error:",
        error



      );

      res.status(500).json({

        success: false,

        message:
          "Unable to load future chit requirements",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// FUTURE CHIT - CREATE
// =====================================================

app.post(
  "/api/future-requirements",
  async (req, res) => {

    try {

      const {

        name,

        staff_name,

        village,

        chit_value,

        start_date,

        required_month,

        required_amount,

        remarks,

      } = req.body;

      if (

        !name ||

        !staff_name ||

        !village ||

        !chit_value ||

        !start_date ||

        !required_month ||

        required_amount ===
          undefined

      ) {

        return res.status(400).json({

          success: false,

          message:
            "Required future chit fields are missing",

        });

      }
      if (
        Number(

          required_month
        ) < 1 ||

        Number(
          required_month
        ) > 20

      ) {

        return res.status(400).json({

          success: false,

          message:
            "Required month must be between 1 and 20",

        });

      }

      const [result] =



        await db.query(
          `
          INSERT INTO future_chit_requirements
          (
            name,

            staff_name,

            village,

            chit_value,

            start_date,

            required_month,

            required_amount,

            remarks
          )

          VALUES
          (?, ?, ?, ?, ?, ?, ?, ?)
          `,

          [

            name,

            staff_name,

            village,

            chit_value,

            start_date,

            Number(
              required_month
            ),

            required_amount,

            remarks ||
              null,

          ]
        );

      res.status(201).json({

        success: true,

        message:
          "Future chit requirement saved successfully",

        id:
          result.insertId,

      });

    } catch (error) {

      console.error(
        "Future requirement POST error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to save future chit requirement",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// FUTURE CHIT - UPDATE
// =====================================================

app.put(
  "/api/future-requirements/:id",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const {

        name,

        staff_name,
        village,



        chit_value,

        start_date,

        required_month,

        required_amount,

        remarks,

      } = req.body;

      await db.query(
        `
        UPDATE future_chit_requirements

        SET

          name = ?,

          staff_name = ?,

          village = ?,

          chit_value = ?,

          start_date = ?,

          required_month = ?,

          required_amount = ?,

          remarks = ?

        WHERE id = ?
        `,

        [

          name,

          staff_name,

          village,

          chit_value,

          start_date,

          Number(
            required_month
          ),

          required_amount,

          remarks ||
            null,

          id,

        ]
      );

      res.json({

        success: true,

        message:
          "Future chit requirement updated successfully",

      });

    } catch (error) {

      console.error(
        "Future requirement PUT error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to update future chit requirement",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// FUTURE CHIT - DELETE
// =====================================================

app.delete(
  "/api/future-requirements/:id",
  async (req, res) => {
    try {



      await db.query(
        `
        DELETE FROM
          future_chit_requirements

        WHERE id = ?
        `,
        [req.params.id]
      );

      res.json({

        success: true,

        message:
          "Future chit requirement deleted successfully",

      });

    } catch (error) {

      console.error(

        "Future requirement DELETE error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to delete future chit requirement",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// FUTURE CHIT REPORT
// =====================================================

app.get(
  "/api/reports/future-requirements",
  async (req, res) => {

    try {

      const [rows] =
        await db.query(`
          SELECT

            id,

            name,

            staff_name,

            village,

            chit_value,

            start_date,

            required_month,

            required_amount,

            remarks,

            created_at

          FROM future_chit_requirements

          ORDER BY
            start_date ASC,
            required_month ASC,
            id DESC
        `);

      res.json({

        success: true,

        data: rows,

      });

    } catch (error) {

      console.error(
        "Future requirement report error:",
        error
      );

      res.status(500).json({



        success: false,

        message:
          "Unable to load future requirement report",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// PAYMENT PLAN ORDER
// =====================================================

app.put(
  "/api/payment-plans/:id/order",
  async (req, res) => {

    try {

      const { id } =
        req.params;

      const {
        display_order,
      } = req.body;

      await db.query(
        `
        UPDATE payment_plans

        SET display_order = ?

        WHERE id = ?
        `,

        [

          display_order ||
            0,

          id,

        ]
      );
      res.json({

        success: true,

        message:
          "Payment Plan order updated successfully",

      });

    } catch (error) {

      console.error(
        "Payment Plan order error:",
        error
      );

      res.status(500).json({

        success: false,

        message:
          "Unable to update Payment Plan order",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// START SERVER
// =====================================================

const PORT =
  process.env.PORT ||
  5000;

async function startServer() {

  await initializePaymentTables();

  app.listen(
    PORT,
    () => {

      console.log(
        `■ SEYAL CHITS Backend running on port ${PORT}`
      );

    }
  );



}

startServer();