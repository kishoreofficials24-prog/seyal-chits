

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
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

const money = (v) =>
  Number(v || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const date = (v) => {
  if (!v) return "-";

  const d = new Date(v);

  if (Number.isNaN(d.getTime())) {
    return "-";
  }

  return d.toLocaleDateString("en-GB");
};

const normalize = (v) => {
  if (!v) return null;

  const d = new Date(v);

  if (Number.isNaN(d.getTime())) return null;

  d.setHours(0, 0, 0, 0);

  return d;
};

const getRequiredDate = (
  startDate,
  requiredMonth
) => {
  if (!startDate || !requiredMonth) {
    return null;
  }

  const start = new Date(startDate);

  if (Number.isNaN(start.getTime())) {
    return null;
  }

  const originalDay = start.getDate();

  const result = new Date(



    start.getFullYear(),
    start.getMonth() +
      Number(requiredMonth) -
      1,
    1
  );

  const lastDay = new Date(
    result.getFullYear(),
    result.getMonth() + 1,
    0
  ).getDate();

  result.setDate(
    Math.min(
      originalDay,
      lastDay
    )
  );

  result.setHours(0, 0, 0, 0);

  return result;
};

function FutureChitReport() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [nameFilter, setNameFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      // Upcoming Settlement Report is based on Payment Plan records.
      // first_due_date is the actual Due Date saved in Payment Plan.
      const response = await axios.get(`${API}/reports/combined`);

      const result = response.data;

      const rows = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : [];

      const today = normalize(new Date());

      const upcoming = rows
        .filter((row) => {
          const dueDate = normalize(row.first_due_date);
          return dueDate && dueDate >= today;
        })
        .map((row) => ({
          ...row,
          due_date: row.first_due_date,
          required_amount:
            row.planned_amount ?? row.payment_amount ?? 0,
        }))
        .sort((a, b) => {
          const da = normalize(a.due_date);
          const db = normalize(b.due_date);
          return da - db;
        });

      setData(upcoming);
    } catch (err) {
      console.error(err);

      setData([]);
      setError(



        err?.response?.data?.message ||
          err?.message ||
          "Unable to load Upcoming Settlement Report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredData = useMemo(() => {
    const nameText = nameFilter.trim().toLowerCase();
    const staffText = staffFilter.trim().toLowerCase();

    return data.filter((row) => {
      const dueDate = normalize(row.due_date);

      if (!dueDate) return false;

      if (dateFilter !== "all") {
        const today = normalize(new Date());

        if (
          dateFilter === "today" &&
          dueDate.getTime() !== today.getTime()
        ) {
          return false;
        }

        if (
          dateFilter === "thisMonth" &&
          (
            dueDate.getFullYear() !== today.getFullYear() ||
            dueDate.getMonth() !== today.getMonth()
          )
        ) {
          return false;
        }

        if (
          dateFilter === "thisYear" &&
          dueDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }

        if (dateFilter === "custom") {
          const start = from ? normalize(from) : null;
          const end = to ? normalize(to) : null;

          if (start && dueDate < start) return false;
          if (end && dueDate > end) return false;
        }
      }

      if (
        nameText &&
        !String(row.name || "")
          .toLowerCase()
          .includes(nameText)
      ) {
        return false;
      }

      if (
        staffText &&
        !String(row.staff_name || "")
          .toLowerCase()
          .includes(staffText)
      ) {
        return false;
      }

      return true;
    });
  }, [



    data,
    nameFilter,
    staffFilter,
    dateFilter,
    from,
    to,
  ]);

  const totalAmount = filteredData.reduce(
    (sum, row) =>
      sum + Number(row.required_amount || 0),
    0
  );

  const headers = [
    "S.No",
    "Due Date",
    "Name",
    "Staff Name",
    "Chit Value",
    "Month",
    "Required Amount",
    "Remarks",
  ];

  const values = (row, index) => [
    index + 1,
    date(row.due_date),
    row.name || "-",
    row.staff_name || "-",
    money(row.chit_value),
    row.payment_month
      ? `${row.payment_month}th Month`
      : "-",
    money(row.required_amount),
    row.remarks || row.payment_remarks || "-",
  ];

  const reset = () => {
    setNameFilter("");
    setStaffFilter("");
    setDateFilter("all");
    setFrom("");
    setTo("");
  };

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

        <title>
          Upcoming Settlement Report
        </title>

        <style>

          body {
            font-family: Arial;
            padding: 25px;
          }

          h1 {



            text-align: center;
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
          }

          th {
            background: #182d3b;
            color: white;
          }

        </style>

      </head>

      <body>

        <h1>
          Upcoming Settlement Report
        </h1>

        <p>
          Total Records:
          ${filteredData.length}
          &nbsp;&nbsp;
          Total Required Amount:
          ${money(totalAmount)}
        </p>

        <table>

          <thead>
            <tr>
              ${headers
                .map((h) => `<th>${h}</th>`)
                .join("")}
            </tr>
          </thead>

          <tbody>
            ${filteredData
              .map(
                (row, index) =>
                  `<tr>
                    ${values(row, index)
                      .map(
                        (v) =>
                          `<td>${v}</td>`
                      )
                      .join("")}
                  </tr>`
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

        <h2>
          Upcoming Settlement Report
        </h2>

        <p>
          Total Records:
          ${filteredData.length}
        </p>

        <p>
          Total Required Amount:
          ${money(totalAmount)}
        </p>

        <table border="1">

          <thead>
            <tr>
              ${headers
                .map((h) => `<th>${h}</th>`)
                .join("")}
            </tr>
          </thead>

          <tbody>
            ${filteredData
              .map(
                (row, index) =>
                  `<tr>
                    ${values(row, index)
                      .map(
                        (v) =>
                          `<td>${v}</td>`
                      )
                      .join("")}
                  </tr>`
              )
              .join("")}
          </tbody>

        </table>

      </body>
      </html>
    `;

    const blob = new Blob(
      [html],
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
      "Future_Chit_Report.xls";

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
            src="/logo.jpg.jpg"
            alt="SEYAL CHITS"
            className="sidebar-logo"
          />
        </div>

        <nav className="sidebar-menu">

          <NavLink to="/dashboard" className="menu-item">
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/new-chit" className="menu-item">
            <FaClipboardList />
            <span>New Chit</span>
          </NavLink>

          <NavLink to="/master" className="menu-item">
            <FaDatabase />
            <span>Master</span>
          </NavLink>

          <NavLink
            to="/payment-plan"
            className="menu-item"
          >
            <FaListOl />
            <span>Payment Plan</span>
          </NavLink>

          <NavLink
            to="/payment"
            className="menu-item"
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
          <strong>SEYAL CHITS</strong>
          <span>■■■■■■■■ ■■■■■■■!</span>
        </div>

      </aside>



      <main className="main-content">

        <div className="report-header">

          <div className="title-area">

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
                Upcoming Settlement Report
              </h1>

              <p>
                View upcoming payment plan settlements
              </p>

            </div>

          </div>

          <button
            className="refresh-btn"
            onClick={load}
          >
            <FaSyncAlt />
            Refresh
          </button>

        </div>

        <div className="filter-card">

          <div className="filter-group search-group">

            <label>Name</label>

            <div className="search-box">

              <FaSearch />

              <input
                placeholder="Search name..."
                value={nameFilter}
                onChange={(e) =>
                  setNameFilter(e.target.value)
                }
              />

            </div>

          </div>

          <div className="filter-group search-group">

            <label>Staff Name</label>

            <div className="search-box">

              <FaSearch />

              <input
                placeholder="Search staff name..."
                value={staffFilter}
                onChange={(e) =>
                  setStaffFilter(e.target.value)
                }
              />

            </div>
          </div>



          <div className="filter-group">

            <label>Due Date</label>

            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
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
                <label>From</label>

                <input
                  type="date"
                  value={from}
                  onChange={(e) =>
                    setFrom(e.target.value)
                  }
                />
              </div>

              <div className="filter-group">
                <label>To</label>

                <input
                  type="date"
                  value={to}
                  onChange={(e) =>
                    setTo(e.target.value)
                  }
                />
              </div>
            </>
          )}

          <button
            className="reset-btn"
            onClick={reset}
          >
            Reset
          </button>

        </div>

        <div className="summary-row">

          <div className="summary-card">
            <span>Total Records</span>
            <strong>
              {filteredData.length}
            </strong>
          </div>
          <div className="summary-card">



            <span>Total Required Amount</span>
            <strong>
              {money(totalAmount)}
            </strong>
          </div>

          <div className="summary-card">
            <span>Report</span>
            <strong>
              Future Chit
            </strong>
          </div>

        </div>

        <div className="action-row">

          <button
            className="print-btn"
            onClick={print}
          >
            <FaPrint />
            Print
          </button>

          <button
            className="excel-btn"
            onClick={excel}
          >
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

              <h3>
                No Records Found
              </h3>

              <p>
                No upcoming settlements available.
              </p>

            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>

                  <tr>
                    {headers.map((h) => (
                      <th key={h}>
                        {h}
                      </th>
                    ))}
                  </tr>

                </thead>

                <tbody>



                  {filteredData.map(
                    (row, index) => (
                      <tr key={row.id || index}>

                        {values(
                          row,
                          index
                        ).map(
                          (v, i) => (
                            <td key={i}>
                              {v}
                            </td>
                          )
                        )}

                      </tr>
                    )
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

export default FutureChitReport;