
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
  FaPrint,
  FaFileExcel,
  FaArrowLeft,
  FaSyncAlt,
  FaCog,
} from "react-icons/fa";
import "./ReportPages.css";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const amount = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatDate = (value) => {
  if (!value) return "-";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;

  return d.toLocaleDateString("en-GB");
};

const dateKey = (value) => {
  if (!value) return "";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";

  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
};

function PaymentReport() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Each report field has its own filter.
  const [nameFilter, setNameFilter] = useState("");
  const [amountFilter, setAmountFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [placeFilter, setPlaceFilter] = useState("");
  const [photoFilter, setPhotoFilter] = useState("");
  const [reviewFilter, setReviewFilter] = useState("");
  const [videoFilter, setVideoFilter] = useState("");
  const [applicationFilter, setApplicationFilter] = useState("");
  const [remarksFilter, setRemarksFilter] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(`${API}/reports/payments`);
      const result = response.data;

      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : [];

      setData(
        rows.map((row) => ({
          ...row,
          date:
            row.payment_date ||
            row.date ||
            row.created_at ||
            "",
        }))
      );
    } catch (err) {
      console.error(err);
      setData([]);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load Payment Report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const names = useMemo(



    () =>
      [...new Set(
        data
          .map((row) => String(row.name || "").trim())
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b)),
    [data]
  );

  const places = useMemo(
    () =>
      [...new Set(
        data
          .map((row) => String(row.place || "").trim())
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b)),
    [data]
  );

  const filteredData = useMemo(() => {
    const amountText = amountFilter.trim();
    const remarksText = remarksFilter.trim().toLowerCase();

    return data.filter((row) => {
      // Name - separate filter
      if (
        nameFilter &&
        String(row.name || "") !== nameFilter
      ) {
        return false;
      }

      // Amount - separate filter
      if (amountText) {
        const rowAmount = Number(row.amount || 0);
        const filterAmount = Number(amountText);

        if (
          Number.isNaN(filterAmount) ||
          rowAmount !== filterAmount
        ) {
          return false;
        }
      }

      // Date - separate exact-date filter
      if (dateFilter && dateKey(row.date) !== dateFilter) {
        return false;
      }

      // Place - separate filter
      if (
        placeFilter &&
        String(row.place || "") !== placeFilter
      ) {
        return false;
      }

      // Status fields - separate filters
      if (
        photoFilter &&
        String(row.photo || "") !== photoFilter
      ) {
        return false;
      }

      if (
        reviewFilter &&
        String(row.review || "") !== reviewFilter
      ) {
        return false;
      }

      if (
        videoFilter &&
        String(row.video || "") !== videoFilter
      ) {
        return false;
      }

      if (
        applicationFilter &&
        String(row.application || "") !== applicationFilter
      ) {
        return false;
      }

      // Remarks - separate text filter
      if (
        remarksText &&
        !String(row.remarks || "")
          .toLowerCase()
          .includes(remarksText)
      ) {
        return false;
      }

      return true;
    });
  }, [
    data,
    nameFilter,
    amountFilter,
    dateFilter,
    placeFilter,
    photoFilter,
    reviewFilter,
    videoFilter,
    applicationFilter,
    remarksFilter,
  ]);

  const totalAmount = filteredData.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const resetFilters = () => {



    setNameFilter("");
    setAmountFilter("");
    setDateFilter("");
    setPlaceFilter("");
    setPhotoFilter("");
    setReviewFilter("");
    setVideoFilter("");
    setApplicationFilter("");
    setRemarksFilter("");
  };

  const headers = [
    "S.No",
    "Payment Date",
    "Name",
    "Amount",
    "Place",
    "Photo",
    "Review",
    "Video",
    "Application",
    "Remarks",
  ];

  const rowValues = (row, index) => [
    index + 1,
    formatDate(row.date),
    row.name || "-",
    amount(row.amount),
    row.place || "-",
    row.photo || "-",
    row.review || "-",
    row.video || "-",
    row.application || "-",
    row.remarks || "-",
  ];

  const print = () => {
    if (!filteredData.length) {
      alert("No records available.");
      return;
    }

    const win = window.open(
      "",
      "_blank",
      "width=1400,height=900"
    );

    if (!win) {
      alert("Please allow pop-ups.");
      return;
    }

    win.document.write(`
      <html>
        <head>
          <title>Payment Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 25px;
            }
            h1 {
              text-align: center;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 10px;
            }
            th, td {
              border: 1px solid #999;
              padding: 6px;
            }
            th {
              background: #182d3b;
              color: white;
            }
          </style>
        </head>
        <body>
          <h1>Payment Report</h1>
          <p>
            Total Records: ${filteredData.length}
            &nbsp;&nbsp;
            Total Amount: ${amount(totalAmount)}
          </p>
          <table>
            <thead>
              <tr>
                ${headers.map((h) => `<th>${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map(
                  (row, index) => `
                    <tr>
                      ${rowValues(row, index)
                        .map((value) => `<td>${value}</td>`)
                        .join("")}
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `);

    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 300);
  };

  const excel = () => {



    if (!filteredData.length) {
      alert("No records available.");
      return;
    }

    const html = `
      <html>
        <head>
          <meta charset="UTF-8">
        </head>
        <body>
          <h2>Payment Report</h2>
          <p>Total Records: ${filteredData.length}</p>
          <p>Total Amount: ${amount(totalAmount)}</p>
          <table border="1">
            <thead>
              <tr>
                ${headers.map((h) => `<th>${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${filteredData
                .map(
                  (row, index) => `
                    <tr>
                      ${rowValues(row, index)
                        .map((value) => `<td>${value}</td>`)
                        .join("")}
                    </tr>
                  `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Payment_Report.xls";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-page">
      <aside className="sidebar">
        <div className="logo-area">
          <img
            src="-logo.jpg.jpg"
            alt="SEYAL CHITS"
            className="sidebar-logo"
          />
        </div>

        <nav className="sidebar-menu">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/new-chit"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaClipboardList />
            <span>New Chit</span>
          </NavLink>

          <NavLink
            to="/master"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaDatabase />
            <span>Master</span>
          </NavLink>

          <NavLink
            to="/payment-plan"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaListOl />
            <span>Payment Plan</span>
          </NavLink>

          <NavLink
            to="/payment"
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
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
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <strong>SEYAL CHITS</strong>
          <span>■■■■■■■■ ■■■■■■■!</span>
        </div>
      </aside>

      <main className="main-content">
        <div className="report-header">
          <div className="title-area">
            <button
              className="back-btn"
              onClick={() => navigate("/reports")}
            >
              <FaArrowLeft />
            </button>

            <div>
              <h1>Payment Report</h1>
              <p>View and filter all payment collection details</p>
            </div>
          </div>

          <button className="refresh-btn" onClick={load}>
            <FaSyncAlt />
            Refresh
          </button>
        </div>

        <div className="filter-card">
          <div className="filter-group">
            <label>Name</label>
            <select
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            >
              <option value="">All Names</option>
              {names.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              value={amountFilter}
              onChange={(e) => setAmountFilter(e.target.value)}
              style={{
                width: "100%",
                height: "50px",
                padding: "0 14px",
                boxSizing: "border-box",
                border: "1px solid #d6dee5",
                borderRadius: "8px",
                fontSize: "16px",
                background: "#fff",
              }}
            />
          </div>

          <div className="filter-group">
            <label>Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Place</label>
            <select
              value={placeFilter}
              onChange={(e) => setPlaceFilter(e.target.value)}
            >
              <option value="">All Places</option>
              {places.map((place) => (
                <option key={place} value={place}>
                  {place}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Photo</label>
            <select
              value={photoFilter}
              onChange={(e) => setPhotoFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>



          </div>

          <div className="filter-group">
            <label>Review</label>
            <select
              value={reviewFilter}
              onChange={(e) => setReviewFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Video</label>
            <select
              value={videoFilter}
              onChange={(e) => setVideoFilter(e.target.value)}
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Application</label>
            <select
              value={applicationFilter}
              onChange={(e) =>
                setApplicationFilter(e.target.value)
              }
            >
              <option value="">All</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Remarks</label>
            <input
              type="text"
              placeholder="Search remarks"
              value={remarksFilter}
              onChange={(e) => setRemarksFilter(e.target.value)}
              style={{
                width: "100%",
                height: "50px",
                padding: "0 14px",
                boxSizing: "border-box",
                border: "1px solid #d6dee5",
                borderRadius: "8px",
                fontSize: "16px",
                background: "#fff",
              }}
            />
          </div>

          <button
            className="reset-btn"
            onClick={resetFilters}
          >
            Reset
          </button>
        </div>

        <div className="summary-row">
          <div className="summary-card">
            <span>Total Records</span>
            <strong>{filteredData.length}</strong>
          </div>

          <div className="summary-card">
            <span>Total Paid Amount</span>
            <strong>{amount(totalAmount)}</strong>
          </div>

          <div className="summary-card">
            <span>Report</span>
            <strong>Payment</strong>
          </div>
        </div>

        <div className="action-row">
          <button className="print-btn" onClick={print}>
            <FaPrint />
            Print
          </button>

          <button className="excel-btn" onClick={excel}>
            <FaFileExcel />
            Excel
          </button>
        </div>

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        <div className="table-card">
          {loading ? (
            <div className="empty-state">
              Loading...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">
              <FaChartBar />
              <h3>No Records Found</h3>
              <p>No payment records match the selected filters.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>



                  <tr>
                    {headers.map((header) => (
                      <th key={header}>{header}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map((row, index) => (
                    <tr key={row.id || index}>
                      {rowValues(row, index).map((value, i) => (
                        <td key={i}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default PaymentReport;