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
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const formatAmount = (value) => {
  return Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const formatDate = (value) => {
  if (!value) return "-";

  const d = new Date(value);

  if (Number.isNaN(d.getTime())) {
    return String(value);
  }

  return d.toLocaleDateString("en-GB");
};

function PaymentPlanReport() {
  const navigate = useNavigate();

  const [data, setData] = useState([]);

  // =========================================================
  // TOP FILTERS
  // =========================================================

  const [nameFilter, setNameFilter] = useState("");
  const [paymentAmountFilter, setPaymentAmountFilter] = useState("");
  const [chitValueFilter, setChitValueFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [planDateFilter, setPlanDateFilter] = useState("");
  const [dueDateFilter, setDueDateFilter] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // LOAD REPORT
  // =========================================================

  const loadReport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API}/reports/payment-plans`
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
      console.error("Payment Plan Report Error:", err);

      setData([]);

      setError(
        err?.response?.data?.message ||
          err?.message ||



          "Unable to load Payment Plan Report"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  // =========================================================
  // TOP FILTER HELPERS
  // =========================================================

  const getName = (row) =>
    String(row.name ?? "").trim();

  const getPaymentAmount = (row) =>
    Number(
      row.payment_amount ||
        row.planned_amount ||
        row.payment_due ||
        0
    );

  const getChitValue = (row) =>
    Number(row.chit_value || 0);

  const getMonth = (row) =>
    String(
      row.payment_month ??
        row.month ??
        ""
    ).trim();

  const getPlanDate = (row) =>
    row.plan_date ||
    row.planDate ||
    "";

  const getDueDate = (row) =>
    row.first_due_date ||
    row.due_date ||
    row.dueDate ||
    "";

  const normalizeDateString = (value) => {
    if (!value) return "";

    const text = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
      return text;
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const filteredData = useMemo(() => {
    const nameText =
      nameFilter.trim().toLowerCase();

    const amountText =
      paymentAmountFilter
        .trim()
        .replace(/,/g, "");

    return data.filter((row) => {
      // NAME
      if (
        nameText &&
        !getName(row)
          .toLowerCase()
          .includes(nameText)
      ) {
        return false;
      }

      // PAYMENT AMOUNT
      if (amountText) {
        const rowAmount =
          getPaymentAmount(row);

        const rowAmountText =
          String(rowAmount);

        if (
          !rowAmountText.includes(
            amountText
          )
        ) {
          return false;
        }
      }

      // CHIT VALUE
      if (chitValueFilter) {
        if (
          String(getChitValue(row)) !==



          String(chitValueFilter)
        ) {
          return false;
        }
      }

      // MONTH
      if (monthFilter) {
        if (
          getMonth(row) !==
          String(monthFilter)
        ) {
          return false;
        }
      }

      // PLAN DATE
      if (planDateFilter) {
        if (
          normalizeDateString(
            getPlanDate(row)
          ) !== planDateFilter
        ) {
          return false;
        }
      }

      // DUE DATE
      if (dueDateFilter) {
        if (
          normalizeDateString(
            getDueDate(row)
          ) !== dueDateFilter
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    data,
    nameFilter,
    paymentAmountFilter,
    chitValueFilter,
    monthFilter,
    planDateFilter,
    dueDateFilter,
  ]);

  // =========================================================
  // FILTER OPTIONS
  // =========================================================

  const nameOptions = useMemo(() => {
    return [
      ...new Set(
        data
          .map((row) => getName(row))
          .filter(Boolean)
      ),
    ].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [data]);

  const chitValueOptions = useMemo(() => {
    return [
      ...new Set(
        data
          .map((row) => getChitValue(row))
          .filter((value) => value > 0)
      ),
    ].sort((a, b) => a - b);
  }, [data]);

  const monthOptions = useMemo(() => {
    return [
      ...new Set(
        data
          .map((row) => getMonth(row))
          .filter(Boolean)
      ),
    ].sort((a, b) => {
      const aNum = Number(a);
      const bNum = Number(b);

      if (
        Number.isFinite(aNum) &&
        Number.isFinite(bNum)
      ) {
        return aNum - bNum;
      }

      return a.localeCompare(b);
    });
  }, [data]);

  // =========================================================
  // RESET
  // =========================================================

  const resetFilters = () => {
    setNameFilter("");
    setPaymentAmountFilter("");
    setChitValueFilter("");
    setMonthFilter("");
    setPlanDateFilter("");
    setDueDateFilter("");
  };

  // =========================================================
  // TOTAL
  // =========================================================



  const totalAmount = filteredData.reduce(
    (total, row) => {
      return (
        total +
        Number(
          row.payment_amount ||
            row.planned_amount ||
            row.payment_due ||
            0
        )
      );
    },
    0
  );

  // =========================================================
  // HEADERS
  // =========================================================

  const headers = [
    "S.No",
    "Plan Date",
    "Name",
    "Staff Name",
    "Village",
    "Chit Value",
    "Month",
    "Payment Amount",
    "Due Date",
    "Remarks",
  ];

  // =========================================================
  // ROW VALUES
  // =========================================================

  const getRowValues = (row, index) => {
    const paymentAmount =
      row.payment_amount ||
      row.planned_amount ||
      row.payment_due ||
      0;

    return [
      index + 1,
      formatDate(row.plan_date),
      row.name || "-",
      row.staff_name || "-",
      row.village || "-",
      `${formatAmount(row.chit_value)}`,
      row.payment_month
        ? `${row.payment_month}th Month`
        : "-",
      `${formatAmount(paymentAmount)}`,
      formatDate(row.first_due_date),
      row.remarks || "-",
    ];
  };

  // =========================================================
  // PRINT
  // =========================================================

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
      alert("Please allow pop-ups to print the report.");
      return;
    }

    const headerHTML = headers
      .map((header) => `<th>${header}</th>`)
      .join("");

    const bodyHTML = filteredData
      .map((row, index) => {
        const values = getRowValues(row, index);

        return `
          <tr>
            ${values
              .map((value) => `<td>${value}</td>`)
              .join("")}
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <meta charset="UTF-8" />

        <title>
          Payment Plan Report
        </title>

        <style>

          body {



            font-family: Arial, sans-serif;
            padding: 25px;
            color: #182d3b;
          }

          h1 {
            text-align: center;
            margin-bottom: 5px;
          }

          .subtitle {
            text-align: center;
            color: #71808c;
            margin-bottom: 20px;
          }

          .summary {
            margin-bottom: 15px;
            font-weight: bold;
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

        </style>

      </head>

      <body>

        <h1>
          Payment Plan Report
        </h1>

        <div class="subtitle">
          SEYAL CHITS
        </div>

        <div class="summary">
          Total Records:
          ${filteredData.length}
          &nbsp;&nbsp;&nbsp;&nbsp;
          Total Amount:
          ${formatAmount(totalAmount)}
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

  // =========================================================
  // EXCEL
  // =========================================================

  const handleExcel = () => {
    if (!filteredData.length) {
      alert("No records available to export.");
      return;
    }

    const escapeHTML = (value) => {
      return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    };

    const headerHTML = headers
      .map(



        (header) =>
          `<th>${escapeHTML(header)}</th>`
      )
      .join("");

    const bodyHTML = filteredData
      .map((row, index) => {
        const values = getRowValues(row, index);

        return `
          <tr>
            ${values
              .map(
                (value) =>
                  `<td>${escapeHTML(value)}</td>`
              )
              .join("")}
          </tr>
        `;
      })
      .join("");

    const excelHTML = `
      <!DOCTYPE html>

      <html>

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
          Payment Plan Report
        </h2>

        <p>
          Total Records:
          ${filteredData.length}
        </p>

        <p>
          Total Amount:
          ${formatAmount(totalAmount)}
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
      "Payment_Plan_Report.xls";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);



    URL.revokeObjectURL(url);
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="report-page">

      {/* SIDEBAR */}

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
            className="menu-item"
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/new-chit"
            className="menu-item"
          >
            <FaClipboardList />
            <span>New Chit</span>
          </NavLink>

          <NavLink
            to="/master"
            className="menu-item"
          >
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

          <strong>
            SEYAL CHITS
          </strong>

          <span>
            ■■■■■■■■ ■■■■■■■!
          </span>

        </div>

      </aside>

      {/* MAIN */}

      <main className="main-content">

        {/* HEADER */}

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
                Payment Plan Report
              </h1>

              <p>
                View all payment plan details
              </p>

            </div>

          </div>

          <button
            className="refresh-btn"
            onClick={loadReport}
            disabled={loading}
          >
            <FaSyncAlt />
            Refresh
          </button>

        </div>

        {/* FILTERS */}

        <div className="filter-card">

          {/* NAME */}

          <div className="filter-group">

            <label>
              Name
            </label>

            <select
              value={nameFilter}
              onChange={(e) =>
                setNameFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Names
              </option>

              {nameOptions.map(
                (name) => (
                  <option
                    key={name}
                    value={name}
                  >
                    {name}
                  </option>
                )
              )}
            </select>

          </div>

          {/* PAYMENT AMOUNT */}

          <div className="filter-group">

            <label>
              Payment Amount
            </label>

            <input
              type="text"
              className="payment-amount-filter"
              placeholder="Enter amount"
              value={
                paymentAmountFilter
              }
              onChange={(e) =>
                setPaymentAmountFilter(
                  e.target.value
                )
              }
              style={{
                width: "220px",
                minWidth: "220px",
                height: "50px",
                padding: "0 14px",
                boxSizing: "border-box",
                border: "1px solid #d7dee5",
                borderRadius: "8px",
                backgroundColor: "#fff",
                color: "#182d3b",
                fontSize: "16px",
                outline: "none"
              }}
            />

          </div>

          {/* CHIT VALUE */}

          <div className="filter-group">



            <label>
              Chit Value
            </label>

            <select
              value={chitValueFilter}
              onChange={(e) =>
                setChitValueFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Chit Values
              </option>

              {chitValueOptions.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {formatAmount(value)}
                  </option>
                )
              )}

            </select>

          </div>

          {/* MONTH */}

          <div className="filter-group">

            <label>
              Month
            </label>

            <select
              value={monthFilter}
              onChange={(e) =>
                setMonthFilter(
                  e.target.value
                )
              }
            >
              <option value="">
                All Months
              </option>

              {monthOptions.map(
                (month) => (
                  <option
                    key={month}
                    value={month}
                  >
                    {month}th Month
                  </option>
                )
              )}

            </select>

          </div>

          {/* PLAN DATE */}

          <div className="filter-group">

            <label>
              Plan Date
            </label>

            <input
              type="date"
              value={planDateFilter}
              onChange={(e) =>
                setPlanDateFilter(
                  e.target.value
                )
              }
            />

          </div>

          {/* DUE DATE */}

          <div className="filter-group">

            <label>
              Due Date
            </label>

            <input
              type="date"
              value={dueDateFilter}
              onChange={(e) =>
                setDueDateFilter(
                  e.target.value
                )
              }
            />

          </div>

          {/* RESET */}

          <button
            className="reset-btn"



            onClick={resetFilters}
          >
            Reset
          </button>

        </div>

        {/* SUMMARY */}

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
              Total Payment Amount
            </span>

            <strong>
              {formatAmount(totalAmount)}
            </strong>

          </div>

          <div className="summary-card">

            <span>
              Report
            </span>

            <strong>
              Payment Plan
            </strong>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="action-row">

          <button
            className="print-btn"
            onClick={handlePrint}
            disabled={!filteredData.length}
          >
            <FaPrint />
            Print
          </button>

          <button
            className="excel-btn"
            onClick={handleExcel}
            disabled={!filteredData.length}
          >
            <FaFileExcel />
            Excel
          </button>

        </div>

        {/* ERROR */}

        {error && (
          <div className="error-box">
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="table-card">

          {loading ? (
            <div className="empty-state">
              Loading Payment Plan Report...
            </div>
          ) : filteredData.length === 0 ? (
            <div className="empty-state">

              <FaChartBar />

              <h3>
                No Records Found
              </h3>

              <p>
                No payment plan records
                match the selected filters.
              </p>

            </div>
          ) : (
            <div className="table-wrapper">
              <table>



                <thead>

                  <tr>

                    {headers.map(
                      (header) => (
                        <th key={header}>
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

export default PaymentPlanReport;