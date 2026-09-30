

import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaClipboardList,
  FaDatabase,
  FaListOl,
  FaMoneyBillWave,
  FaChartBar,
  FaSearch,
  FaPrint,
  FaFileExcel,
  FaArrowLeft,
  FaSyncAlt,
  FaCog,
} from "react-icons/fa";
import "./ReportPages.css";

const API =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Keep these options exactly in sync with the New Chit dropdowns.
const NEW_CHIT_BRANCHES = [
  "Natham",
  "Sendurai",
  "Palakurichi",
];

const NEW_CHIT_STAFF_NAMES = [
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
  "ChinnaSamy L",
  "Muthulakshmi A",
  "Agalya",
  "Tamizharasi M",
  "Ruckmani",
  "Devika",
  "Rajalakshmi K",
];

const formatAmount = (value) => {
  const amount = Number(value || 0);

  return amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) return "-";



  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB");
};

const normalizeDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }



  date.setHours(0, 0, 0, 0);

  return date;
};

function NormalChitReport() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [staffFilter, setStaffFilter] = useState("");

  const [branchFilter, setBranchFilter] = useState("");

  const [dateFilter, setDateFilter] = useState("all");

  const [customFrom, setCustomFrom] = useState("");

  const [customTo, setCustomTo] = useState("");

  /*
    =========================================================
    LOAD NORMAL CHIT REPORT
    =========================================================
  */

  const loadReport = async () => {
    try {
      setLoading(true);

      setError("");

      const response = await axios.get(
        `${API}/procedures`
      );

      const result = response.data;

      let rows = [];

      if (Array.isArray(result)) {
        rows = result;
      } else if (Array.isArray(result?.data)) {
        rows = result.data;
      }

      setData(rows);
    } catch (err) {
      console.error(
        "Normal Chit Report Error:",
        err
      );

      setData([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load Normal Chit Report"
      );



    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  /*
    =========================================================



    GET DATE
    =========================================================
  */

  const getRowDate = (row) => {
    return (
      row.date ||
      row.joinedDate ||
      row.joined_date ||
      row.created_at
    );
  };

  /*
    =========================================================
    DATE FILTER
    =========================================================
  */

  const dateMatches = (row) => {
    if (dateFilter === "all") {
      return true;
    }

    const rowDate = normalizeDate(
      getRowDate(row)
    );

    if (!rowDate) {
      return false;
    }

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    /*
      TODAY
    */

    if (dateFilter === "today") {
      return (
        rowDate.getTime() ===
        today.getTime()
      );
    }

    /*
      THIS MONTH
    */

    if (dateFilter === "thisMonth") {
      return (
        rowDate.getFullYear() ===
          today.getFullYear() &&
        rowDate.getMonth() ===
          today.getMonth()
      );
    }

    /*
      THIS YEAR
    */

    if (dateFilter === "thisYear") {
      return (



        rowDate.getFullYear() ===
        today.getFullYear()
      );
    }

    /*
      CUSTOM RANGE
    */

    if (dateFilter === "custom") {
      const fromDate = customFrom
        ? normalizeDate(customFrom)



        : null;

      const toDate = customTo
        ? normalizeDate(customTo)
        : null;

      if (
        fromDate &&
        rowDate < fromDate
      ) {
        return false;
      }

      if (
        toDate &&
        rowDate > toDate
      ) {
        return false;
      }

      return true;
    }

    return true;
  };

  /*
    =========================================================
    SEARCH
    =========================================================
  */

  const searchMatches = (row) => {
    const text = search
      .trim()
      .toLowerCase();

    if (!text) {
      return true;
    }

    return Object.values(row || {})
      .map((value) =>
        String(value ?? "")
      )
      .join(" ")
      .toLowerCase()
      .includes(text);
  };

  /*
    =========================================================
    STAFF / BRANCH FILTER
    =========================================================
  */

  const staffMatches = (row) => {
    if (!staffFilter) {
      return true;
    }

    return String(
      row.staff_name ?? row.staffName ?? ""
    ).trim() === staffFilter;
  };
  const branchMatches = (row) => {



    if (!branchFilter) {
      return true;
    }

    return String(
      row.branch ?? ""
    ).trim() === branchFilter;
  };

  /*
    =========================================================



    FILTERED DATA
    =========================================================
  */

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      return (
        dateMatches(row) &&
        staffMatches(row) &&
        branchMatches(row) &&
        searchMatches(row)
      );
    });
  }, [
    data,
    search,
    staffFilter,
    branchFilter,
    dateFilter,
    customFrom,
    customTo,
    dateMatches,
    staffMatches,
    branchMatches,
    searchMatches,
  ]);

  /*
    =========================================================
    TOTAL CHIT VALUE
    =========================================================
  */

  const totalChitValue = useMemo(() => {
    return filteredData.reduce(
      (total, row) => {
        return (
          total +
          Number(
            row.chit_value ||
              row.chitValue ||
              row.amount ||
              0
          )
        );
      },
      0
    );
  }, [filteredData]);

  /*
    =========================================================
    RESET
    =========================================================
  */

  const resetFilters = () => {
    setSearch("");

    setStaffFilter("");

    setBranchFilter("");

    setDateFilter("all");

    setCustomFrom("");

    setCustomTo("");
  };
  /*



    =========================================================
    TABLE HEADERS
    =========================================================
  */

  const headers = [
    "S.No",
    "Date",
    "Branch",
    "Staff Name",
    "Customer Name",



    "Chit Value",
    "Key Lever",
    "Follow-up",
    "Due Day",
    "Pay Mode",
    "Collection Type",
    "Remarks",
  ];

  /*
    =========================================================
    GET ROW VALUES
    =========================================================
  */

  const getRowValues = (row, index) => {
    return [
      index + 1,

      formatDate(
        row.date ||
          row.joinedDate ||
          row.joined_date ||
          row.created_at
      ),

      row.branch || "-",

      row.staff_name ||
        row.staffName ||
        "-",

      row.customer_name ||
        row.customerName ||
        row.cust_name ||
        row.custName ||
        "-",

      formatAmount(
        row.chit_value ||
          row.chitValue ||
          row.amount ||
          0
      ),

      row.key_lever ||
        row.keyLever ||
        "-",

      row.follow_up ||
        row.followup ||
        row.no_of_followup ||
        row.noOfFollowup ||
        "-",

      row.due_day ||
        row.dueDay ||
        row.due_date ||
        "-",

      row.pay_mode ||
        row.payMode ||
        "-",

      row.collection_type ||
        row.collectionType ||



        "-",

      row.remarks || "-",
    ];
  };

  /*
    =========================================================
    PRINT
    =========================================================
  */



  const handlePrint = () => {
    if (!filteredData.length) {
      alert("No records available to print.");
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=1400,height=900"
    );

    if (!printWindow) {
      alert(
        "Please allow pop-ups to print the report."
      );

      return;
    }

    const headerHTML = headers
      .map(
        (header) =>
          `<th>${header}</th>`
      )
      .join("");

    const bodyHTML = filteredData
      .map((row, index) => {
        const values = getRowValues(
          row,
          index
        );

        return `
          <tr>
            ${values
              .map(
                (value) =>
                  `<td>${String(
                    value ?? "-"
                  )
                    .replace(/</g, "&lt;")
                    .replace(
                      />/g,
                      "&gt;"
                    )}</td>`
              )
              .join("")}
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          Normal Chit Report
        </title>

        <meta charset="UTF-8" />



        <style>

          body {
            font-family: Arial, sans-serif;
            padding: 25px;
            color: #182d3b;
          }

          h1 {
            text-align: center;
            margin: 0 0 6px;



          }

          .subtitle {
            text-align: center;
            color: #71808c;
            margin-bottom: 20px;
          }

          .summary {
            font-weight: bold;
            margin-bottom: 15px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
          }

          th,
          td {
            border: 1px solid #999;
            padding: 7px;
            text-align: left;
          }

          th {
            background: #182d3b;
            color: white;
          }

          tr:nth-child(even) {
            background: #f6f6f6;
          }

          @media print {

            body {
              padding: 10px;
            }

            table {
              page-break-inside: auto;
            }

            tr {
              page-break-inside: avoid;
            }

          }

        </style>

      </head>

      <body>

        <h1>
          Normal Chit Report
        </h1>

        <div class="subtitle">
          SEYAL CHITS
        </div>

        <div class="summary">



          Total Records:
          ${filteredData.length}
          &nbsp;&nbsp;&nbsp;&nbsp;
          Total Chit Value:
          ₹${formatAmount(
            totalChitValue
          )}
        </div>

        <table>

          <thead>



            <tr>
              ${headerHTML}
            </tr>

          </thead>

          <tbody>
            ${bodyHTML}
          </tbody>

        </table>

      </body>

      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  /*
    =========================================================
    EXCEL
    =========================================================
  */

  const handleExcel = () => {
    if (!filteredData.length) {
      alert("No records available to export.");
      return;
    }

    const escapeHTML = (value) => {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(
          /</g,
          "&lt;"
        )
        .replace(
          />/g,
          "&gt;"
        )
        .replace(
          /"/g,
          "&quot;"
        );
    };

    const headerHTML = headers
      .map(
        (header) =>
          `<th>${escapeHTML(
            header
          )}</th>`
      )
      .join("");

    const bodyHTML = filteredData
      .map((row, index) => {



        const values = getRowValues(
          row,
          index
        );

        return `
          <tr>
            ${values
              .map(
                (value) =>
                  `<td>${escapeHTML(



                    value
                  )}</td>`
              )
              .join("")}
          </tr>
        `;
      })
      .join("");

    const excelHTML = `
      <html
        xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:x="urn:schemas-microsoft-com:office:excel"
        xmlns="http://www.w3.org/TR/REC-html40"
      >

      <head>

        <meta charset="UTF-8" />

        <style>

          table {
            border-collapse: collapse;
          }

          th {
            background: #182d3b;
            color: white;
            font-weight: bold;
          }

          th,
          td {
            border: 1px solid #999;
            padding: 7px;
          }

        </style>

      </head>

      <body>

        <h2>
          Normal Chit Report
        </h2>

        <p>
          Total Records:
          ${filteredData.length}
        </p>

        <p>
          Total Chit Value:
          ₹${formatAmount(
            totalChitValue
          )}
        </p>

        <table>

          <thead>

            <tr>
              ${headerHTML}



            </tr>

          </thead>

          <tbody>
            ${bodyHTML}
          </tbody>

        </table>

      </body>



      </html>
    `;

    const blob = new Blob(
      [excelHTML],
      {
        type:
          "application/vnd.ms-excel;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `Normal_Chit_Report_${new Date()
        .toISOString()
        .slice(0, 10)}.xls`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="sidebar">

        <div className="logo-area">

          <img
            src="/logo.jpg.jpg"
            alt="SEYAL CHITS"
            className="sidebar-logo"
          />

        </div>

        <nav className="sidebar-menu">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>
          <NavLink



            to="/new-chit"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaClipboardList />
            <span>New Chit</span>
          </NavLink>



          <NavLink
            to="/master"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaDatabase />
            <span>Master</span>
          </NavLink>

          <NavLink
            to="/payment-plan"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaListOl />
            <span>Payment Plan</span>
          </NavLink>

          <NavLink
            to="/payment"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaMoneyBillWave />
            <span>Payment</span>
          </NavLink>

          <NavLink
            to="/reports"
            className="menu-item active"
          >
            <FaChartBar />
            <span>Reports</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              isActive
                ? "menu-item active"
                : "menu-item"
            }
          >
            <FaCog />
            <span>Settings</span>
          </NavLink>

        </nav>

        <div className="sidebar-footer">

          <strong>
            SEYAL CHITS
          </strong>

          <span>
                            !



          </span>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="main-content">



        {/* HEADER */}

        <div className="report-header">

          <div className="header-left">

            <button
              className="back-btn"
              onClick={() =>
                navigate("/reports")
              }
            >
              <FaArrowLeft />
            </button>

            <div>

              <h1>
                Normal Chit Report
              </h1>

              <p>
                View normal chit details
              </p>

            </div>

          </div>

          <button
            className="refresh-btn"
            onClick={loadReport}
            disabled={loading}
          >
            <FaSyncAlt
              className={
                loading
                  ? "refresh-spin"
                  : ""
              }
            />

            Refresh
          </button>

        </div>

        {/* ===================================================
            FILTER
        =================================================== */}

        <div className="filter-card">

          <div className="filter-group search-group">

            <label>
              Search
            </label>

            <div className="search-box">

              <FaSearch />

              <input



                type="text"
                placeholder="Search customer, branch..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>



          </div>

          <div className="filter-group">

            <label>
              Staff Name
            </label>

            <select
              value={staffFilter}
              onChange={(e) =>
                setStaffFilter(e.target.value)
              }
            >
              <option value="">
                All Staff
              </option>

              {NEW_CHIT_STAFF_NAMES.map((staff) => (
                <option key={staff} value={staff}>
                  {staff}
                </option>
              ))}
            </select>

          </div>

          <div className="filter-group">

            <label>
              Branch
            </label>

            <select
              value={branchFilter}
              onChange={(e) =>
                setBranchFilter(e.target.value)
              }
            >
              <option value="">
                All Branches
              </option>

              {NEW_CHIT_BRANCHES.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>

          </div>

          <div className="filter-group">

            <label>
              Date Filter
            </label>

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value



                )
              }
            >

              <option value="all">
                All Dates
              </option>

              <option value="today">
                Today
              </option>



              <option value="thisMonth">
                This Month
              </option>

              <option value="thisYear">
                This Year
              </option>

              <option value="custom">
                Custom Range
              </option>

            </select>

          </div>

          {dateFilter === "custom" && (
            <>

              <div className="filter-group">

                <label>
                  From Date
                </label>

                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) =>
                    setCustomFrom(
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="filter-group">

                <label>
                  To Date
                </label>

                <input
                  type="date"
                  value={customTo}
                  onChange={(e) =>
                    setCustomTo(
                      e.target.value
                    )
                  }
                />

              </div>

            </>
          )}

          <button
            className="reset-btn"
            onClick={resetFilters}
          >
            Reset



          </button>

        </div>

        {/* ===================================================
            SUMMARY
        =================================================== */}

        <div className="summary-row">



          <div className="summary-card">

            <span>
              Total Records
            </span>

            <strong>
              {filteredData.length}
            </strong>

          </div>

          <div className="summary-card">

            <span>
              Total Chit Value
            </span>

            <strong>
              ₹
              {formatAmount(
                totalChitValue
              )}
            </strong>

          </div>

          <div className="summary-card">

            <span>
              Report
            </span>

            <strong>
              Normal Chit Report
            </strong>

          </div>

        </div>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="action-row">

          <button
            className="print-btn"
            onClick={handlePrint}
            disabled={
              !filteredData.length
            }
          >
            <FaPrint />
            Print
          </button>

          <button
            className="excel-btn"
            onClick={handleExcel}
            disabled={



              !filteredData.length
            }
          >
            <FaFileExcel />
            Excel
          </button>

        </div>

        {/* ===================================================
            ERROR



        =================================================== */}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* ===================================================
            TABLE
        =================================================== */}

        <div className="table-card">

          {loading ? (
            <div className="empty-state">
              Loading report...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">

              <FaChartBar />

              <h3>
                No Records Found
              </h3>

              <p>
                No normal chit records
                match the selected
                filters.
              </p>

            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>

                    {headers.map(
                      (header) => (
                        <th
                          key={header}
                        >
                          {header}
                        </th>
                      )
                    )}

                  </tr>

                </thead>

                <tbody>

                  {filteredData.map(
                    (row, index) => {

                      const values =
                        getRowValues(
                          row,



                          index
                        );

                      return (
                        <tr
                          key={
                            row.id ||
                            index
                          }
                        >

                          {values.map(



                            (
                              value,
                              cellIndex
                            ) => (
                              <td
                                key={
                                  cellIndex
                                }
                              >
                                {value}
                              </td>
                            )
                          )}

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default NormalChitReport;