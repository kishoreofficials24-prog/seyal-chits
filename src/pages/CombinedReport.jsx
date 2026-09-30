
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

const money = (v) =>
  Number(v || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const date = (v) => {
  if (!v) return "-";

  const d = new Date(v);

  if (Number.isNaN(d.getTime())) return "-";

  return d.toLocaleDateString("en-GB");
};

const normalize = (v) => {
  if (!v) return null;

  const d = new Date(v);

  if (Number.isNaN(d.getTime())) return null;

  d.setHours(0, 0, 0, 0);

  return d;
};

function CombinedReport() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  // Common filters shared by Payment + Payment Plan data
  const [nameFilter, setNameFilter] = useState("");
  const [staffFilter, setStaffFilter] = useState("");
  const [chitValueFilter, setChitValueFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [planDateFilter, setPlanDateFilter] = useState("");
  const [paymentDateFilter, setPaymentDateFilter] = useState("");

  // Payment-specific filters
  const [paidAmountFilter, setPaidAmountFilter] = useState("");
  const [paymentDueFilter, setPaymentDueFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/reports/combined`
      );

      const result = response.data;

      setData(
        Array.isArray(result)
          ? result
          : Array.isArray(result?.data)
          ? result.data
          : []
      );
    } catch (err) {
      console.error(err);

      setData([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load Combined Report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const nameOptions = useMemo(
    () =>
      [...new Set(
        data
          .map((row) => row.name)
          .filter(
            (v) =>
              v !== undefined &&
              v !== null &&
              String(v).trim() !== ""
          )
          .map((v) => String(v).trim())
      )].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
    [data]
  );

  const staffOptions = useMemo(
    () =>
      [...new Set(
        data
          .map((row) => row.staff_name)
          .filter(
            (v) =>
              v !== undefined &&
              v !== null &&
              String(v).trim() !== ""
          )
          .map((v) => String(v).trim())
      )].sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      ),
    [data]
  );

  const chitValueOptions = useMemo(
    () => [...new Set(data.map((row) => Number(row.chit_value)).filter((v) => Number.isFinite(v) && v > 0))]
      .sort((a, b) => a - b),
    [data]
  );
  const monthOptions = useMemo(
    () => [...new Set(data.map((row) => row.payment_month).filter((v) => v !== undefined && v !== null && String(v).trim() !== ""))]
      .map(Number)
      .filter(Number.isFinite)
      .sort((a, b) => a - b),
    [data]
  );

  const filteredData = useMemo(() => {
    const paidAmount = paidAmountFilter.trim();
    const paymentDue = paymentDueFilter.trim();

    return data.filter((row) => {
      // COMMON FILTERS
      if (nameFilter && String(row.name || "") !== nameFilter) return false;
      if (staffFilter && String(row.staff_name || "") !== staffFilter) return false;

      if (
        chitValueFilter &&
        Number(row.chit_value || 0) !== Number(chitValueFilter)
      ) {
        return false;
      }

      if (
        monthFilter &&
        Number(row.payment_month || 0) !== Number(monthFilter)
      ) {
        return false;
      }

      // Exact Plan Date
      if (planDateFilter) {
        const rowPlanDate = normalize(row.plan_date);
        const selectedPlanDate = normalize(planDateFilter);
        if (
          !rowPlanDate ||
          !selectedPlanDate ||
          rowPlanDate.getTime() !== selectedPlanDate.getTime()
        ) {
          return false;
        }
      }

      // Exact Payment Date
      if (paymentDateFilter) {
        const rowPaymentDate = normalize(row.payment_date);
        const selectedPaymentDate = normalize(paymentDateFilter);
        if (
          !rowPaymentDate ||
          !selectedPaymentDate ||
          rowPaymentDate.getTime() !== selectedPaymentDate.getTime()
        ) {
          return false;
        }
      }

      // PAYMENT-SPECIFIC FILTERS
      if (paidAmount) {
        const target = Number(paidAmount);
        if (!Number.isFinite(target) || Number(row.paid_amount || 0) !== target) {
          return false;
        }
      }

      if (paymentDue) {
        const target = Number(paymentDue);
        const due = Number(row.planned_amount ?? 0);
        if (!Number.isFinite(target) || due !== target) return false;
      }

      return true;
    });
  }, [
    data,
    nameFilter,
    staffFilter,
    chitValueFilter,
    monthFilter,
    planDateFilter,
    paymentDateFilter,
    paidAmountFilter,
    paymentDueFilter,
  ]);

  const totalPaid = filteredData.reduce(
    (sum, row) =>
      sum + Number(row.paid_amount || 0),
    0
  );

  const totalDue = filteredData.reduce(
    (sum, row) =>
      sum +
      Number(
        row.payment_due ||
          row.planned_amount ||
          0
      ),
    0
  );

  const headers = [
    "S.No",
    "Plan Date",
    "Name",
    "Staff Name",
    "Chit Value",
    "Month",
    "Payment Due",
    "Paid Amount",
    "Payment Date",
  ];

  const values = (row, index) => [
    index + 1,
    date(row.plan_date),
    row.name || "-",
    row.staff_name || "-",
    money(row.chit_value),
    row.payment_month
      ? `${row.payment_month}th Month`
      : "-",
    money(row.planned_amount),
    row.paid_amount != null



      ? money(row.paid_amount)
      : "-",
    date(row.payment_date),
  ];

  const reset = () => {
    setNameFilter("");
    setStaffFilter("");
    setChitValueFilter("");
    setMonthFilter("");
    setPlanDateFilter("");
    setPaymentDateFilter("");
    setPaidAmountFilter("");
    setPaymentDueFilter("");
  };

  const print = () => {
    if (!filteredData.length) {
      alert("No records available.");
      return;
    }

    const win = window.open(
      "",
      "_blank",
      "width=1500,height=900"
    );

    if (!win) {
      alert("Please allow pop-ups.");
      return;
    }

    win.document.write(`
      <html>
      <head>

        <title>
          Plan + Payment Report
        </title>

        <style>

          body {
            font-family: Arial;
            padding: 20px;
          }

          h1 {
            text-align: center;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          th,
          td {
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

        <h1>
          Plan + Payment Report
        </h1>

        <p>
          Records: ${filteredData.length}
          &nbsp;&nbsp;
          Total Due: ${money(totalDue)}
          &nbsp;&nbsp;
          Total Paid: ${money(totalPaid)}
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
          Plan + Payment Report
        </h2>

        <p>
          Records: ${filteredData.length}
        </p>

        <p>
          Total Due: ${money(totalDue)}
        </p>

        <p>
          Total Paid: ${money(totalPaid)}
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
      "Plan_Payment_Report.xls";

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
              onClick={() =>
                navigate("/reports")
              }
            >
              <FaArrowLeft />
            </button>

            <div>
              <h1>
                Plan + Payment Report
              </h1>

              <p>
                View payment plan and payment together
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
          <div className="filter-group">
            <label>Name</label>
            <select value={nameFilter} onChange={(e) => setNameFilter(e.target.value)}>
              <option value="">All Names</option>
              {nameOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Staff Name</label>
            <select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
              <option value="">All Staff</option>
              {staffOptions.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Chit Value</label>
            <select value={chitValueFilter} onChange={(e) => setChitValueFilter(e.target.value)}>
              <option value="">All Chit Values</option>
              {chitValueOptions.map((v) => (
                <option key={v} value={v}>{money(v)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Month</label>
            <select value={monthFilter} onChange={(e) => setMonthFilter(e.target.value)}>
              <option value="">All Months</option>
              {monthOptions.map((v) => (
                <option key={v} value={v}>{v}th Month</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Plan Date</label>
            <input
              type="date"
              value={planDateFilter}
              onChange={(e) => setPlanDateFilter(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Payment Date</label>
            <input
              type="date"
              value={paymentDateFilter}
              onChange={(e) => setPaymentDateFilter(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <label>Payment Due</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter due amount"
              value={paymentDueFilter}



              onChange={(e) => setPaymentDueFilter(e.target.value)}
              style={{
                width: "100%",
                height: "50px",
                padding: "0 14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div className="filter-group">
            <label>Paid Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter paid amount"
              value={paidAmountFilter}
              onChange={(e) => setPaidAmountFilter(e.target.value)}
              style={{
                width: "100%",
                height: "50px",
                padding: "0 14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button className="reset-btn" onClick={reset}>
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
            <span>Total Due</span>
            <strong>
              {money(totalDue)}
            </strong>
          </div>

          <div className="summary-card">
            <span>Total Paid</span>
            <strong>
              {money(totalPaid)}
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
              <h3>No Records Found</h3>
              <p>
                No combined records available.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">

              <table>

                <thead>
                  <tr>
                    {headers.map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredData.map(
                    (row, index) => (
                      <tr key={row.payment_plan_id || row.id || index}>
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

export default CombinedReport;