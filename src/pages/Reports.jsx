import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaChartBar,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaSearch,
  FaTimes,
  FaClipboardList,
  FaPrint,
} from "react-icons/fa";

import "./Reports.css";
import "./Dashboard.css";

const API_URL =
  "https://seyal-chits-backend.onrender.com/api/procedures";

function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getJoinedDate(item) {
  if (!item.joinedDate) return "";
  return String(item.joinedDate).slice(0, 10);
}

function getFirstDayOfMonth() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
}

function getLastDayOfMonth() {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return getLocalDateString(lastDay);
}

function getFirstDayOfYear() {
  return `${new Date().getFullYear()}-01-01`;
}

function getLastDayOfYear() {
  return `${new Date().getFullYear()}-12-31`;
}

function getActiveDateRange(filterData) {
  const todayString = getLocalDateString();

  switch (filterData.dateFilter) {
    case "today":
      return { from: todayString, to: todayString };
    case "thisMonth":
      return { from: getFirstDayOfMonth(), to: getLastDayOfMonth() };
    case "thisYear":
      return { from: getFirstDayOfYear(), to: getLastDayOfYear() };
    case "range":
      return { from: filterData.dateFrom, to: filterData.dateTo };
    default:
      return { from: "", to: "" };
  }
}

function formatDate(value) {
  if (!value) return "-";
  const cleanDate = String(value).slice(0, 10);
  const date = new Date(`${cleanDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
}

function getDateFilterLabel(filterData) {
  switch (filterData.dateFilter) {
    case "today":
      return "Today";
    case "thisMonth":
      return "This Month";
    case "thisYear":
      return "This Year";
    case "range":
      if (filterData.dateFrom && filterData.dateTo) {
        return `${formatDate(filterData.dateFrom)} - ${formatDate(filterData.dateTo)}`;
      }
      if (filterData.dateFrom) return `From ${formatDate(filterData.dateFrom)}`;
      if (filterData.dateTo) return `Up to ${formatDate(filterData.dateTo)}`;
      return "Date Range";
    default:
      return "All Dates";
  }
}

function Reports() {
  // =====================================================
  // DATA
  // =====================================================

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // =====================================================
  // FILTERS
  // =====================================================

  const emptyFilters = {
    dateFilter: "all",
    dateFrom: "",
    dateTo: "",
    branch: "",
    staff: "",
    dueDay: "",
    chitValue: "",
  };

  const [filters, setFilters] = useState(emptyFilters);

  const [appliedFilters, setAppliedFilters] =
    useState(emptyFilters);

  // =====================================================
  // FETCH PROCEDURES
  // =====================================================

  const fetchProcedures = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch procedures"
        );
      }

      setData(
        result.success && Array.isArray(result.data)
          ? result.data
          : []
      );
    } catch (error) {
      console.error("Reports Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProcedures();
  }, []);

  // =====================================================
  // STAFF
  // =====================================================

  const staffNames = [
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

  // =====================================================
  // BRANCHES
  // =====================================================

  const branchNames = useMemo(() => {
    const branches = data
      .map((item) =>
        String(item.branch || "").trim()
      )
      .filter(Boolean);

    return [...new Set(branches)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [data]);

  // =====================================================
  // CHIT VALUES
  // =====================================================

  const chitValues = useMemo(() => {
    const values = data
      .map((item) => Number(item.chitValue))
      .filter(
        (value) =>
          !Number.isNaN(value) && value > 0
      );

    return [...new Set(values)].sort(
      (a, b) => a - b
    );
  }, [data]);

  // =====================================================
  // HANDLE FILTER CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // APPLY FILTERS
  // =====================================================

  const applyFilters = () => {
    setAppliedFilters({
      ...filters,
    });
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
  };

  // =====================================================
  // FILTER DATA
  // =====================================================

  const filteredData = useMemo(() => {
    const dateRange =
      getActiveDateRange(appliedFilters);

    return data.filter((item) => {
      const itemDate = getJoinedDate(item);

      // -----------------------------------------------
      // DATE FILTER
      // -----------------------------------------------

      let dateMatch = true;

      if (
        dateRange.from ||
        dateRange.to
      ) {
        if (!itemDate) {
          dateMatch = false;
        } else {
          if (
            dateRange.from &&
            itemDate < dateRange.from
          ) {
            dateMatch = false;
          }

          if (
            dateRange.to &&
            itemDate > dateRange.to
          ) {
            dateMatch = false;
          }
        }
      }

      // -----------------------------------------------
      // BRANCH
      // -----------------------------------------------

      const branchMatch =
        !appliedFilters.branch ||
        String(item.branch || "").trim() ===
          String(
            appliedFilters.branch
          ).trim();

      // -----------------------------------------------
      // STAFF
      // -----------------------------------------------

      const staffMatch =
        !appliedFilters.staff ||
        String(item.staffName || "").trim() ===
          String(
            appliedFilters.staff
          ).trim();

      // -----------------------------------------------
      // DUE DAY
      // -----------------------------------------------

      const dueDayMatch =
        !appliedFilters.dueDay ||
        Number(item.dueDay) ===
          Number(appliedFilters.dueDay);

      // -----------------------------------------------
      // CHIT VALUE
      // -----------------------------------------------

      const chitValueMatch =
        !appliedFilters.chitValue ||
        Number(item.chitValue) ===
          Number(appliedFilters.chitValue);

      return (
        dateMatch &&
        branchMatch &&
        staffMatch &&
        dueDayMatch &&
        chitValueMatch
      );
    });
  }, [data, appliedFilters]);

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "₹0";
    }

    return `₹${number.toLocaleString("en-IN")}`;
  };

  // =====================================================
  // REPORT PERIOD TEXT
  // =====================================================

  const reportPeriodText = useMemo(() => {
    return `Date: ${getDateFilterLabel(
      appliedFilters
    )}`;
  }, [appliedFilters]);

  // =====================================================
  // PRINT REPORT
  // =====================================================

  const handlePrint = () => {
    if (filteredData.length === 0) {
      alert(
        "No records available to print."
      );

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

    // Actual date when print button is clicked
    const printDate =
      new Date().toLocaleDateString(
        "en-IN"
      );

    const dateFilterText =
      getDateFilterLabel(
        appliedFilters
      );

    const filterBranch =
      appliedFilters.branch ||
      "All Branches";

    const filterStaff =
      appliedFilters.staff ||
      "All Staff";

    const filterDueDay =
      appliedFilters.dueDay ||
      "All Due Days";

    const filterChitValue =
      appliedFilters.chitValue
        ? formatCurrency(
            appliedFilters.chitValue
          )
        : "All Chit Values";

    const tableRows = filteredData
      .map(
        (item, index) => `
          <tr>
            <td>${index + 1}</td>

            <td>
              ${formatDate(
                item.joinedDate
              )}
            </td>

            <td>
              ${item.branch || "-"}
            </td>

            <td>
              ${item.staffName || "-"}
            </td>

            <td>
              ${item.customerName || "-"}
            </td>

            <td>
              ${formatCurrency(
                item.chitValue
              )}
            </td>

            <td>
              ${item.keyLever || "-"}
            </td>

            <td>
              ${item.followUp ?? "-"}
            </td>

            <td>
              ${item.dueDay || "-"}
            </td>

            <td>
              ${item.payMode || "-"}
            </td>

            <td>
              ${
                item.collectionType ||
                "-"
              }
            </td>

            <td>
              ${item.remarks || "-"}
            </td>
          </tr>
        `
      )
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>

      <html>

      <head>

        <title>
          SEYAL CHITS - Procedure Report
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            margin: 0;
            padding: 25px;

            color: #222;

            background: #fff;
          }

          .header {
            text-align: center;

            border-bottom:
              2px solid #222;

            padding-bottom: 14px;

            margin-bottom: 18px;
          }

          .header h1 {
            margin: 0;

            font-size: 26px;
          }

          .header h2 {
            margin: 6px 0 0;

            font-size: 18px;
          }

          .print-date {
            margin-top: 7px;

            font-size: 12px;

            color: #555;
          }

          .period {
            text-align: center;

            margin-bottom: 15px;

            font-size: 15px;

            font-weight: 700;
          }

          .summary {
            display: grid;

            grid-template-columns:
              repeat(5, 1fr);

            gap: 8px;

            margin-bottom: 18px;
          }

          .summary-box {
            border:
              1px solid #ccc;

            padding: 9px;

            border-radius: 4px;

            font-size: 11px;
          }

          .summary-box strong {
            display: block;

            margin-bottom: 4px;

            color: #555;

            font-size: 10px;
          }

          .joined-count {
            margin-bottom: 12px;

            padding: 10px;

            border:
              1px solid #bbb;

            font-size: 14px;

            font-weight: 700;
          }

          table {
            width: 100%;

            border-collapse:
              collapse;

            font-size: 10px;
          }

          th {
            background: #f1f1f1;

            font-weight: 700;
          }

          th,
          td {
            border:
              1px solid #ccc;

            padding: 7px;

            text-align: left;

            vertical-align: top;
          }

          tr {
            page-break-inside:
              avoid;
          }

          @media print {

            body {
              padding: 10px;
            }

          }

        </style>

      </head>

      <body>

        <div class="header">

          <h1>
            SEYAL CHITS
          </h1>

          <h2>
            Procedure Report
          </h2>

          <div class="print-date">
            Report Printed Date:
            ${printDate}
          </div>

        </div>


        <div class="period">
          ${reportPeriodText}
        </div>


        <div class="summary">

          <div class="summary-box">
            <strong>DATE FILTER</strong>
            ${dateFilterText}
          </div>

          <div class="summary-box">
            <strong>BRANCH</strong>
            ${filterBranch}
          </div>

          <div class="summary-box">
            <strong>STAFF</strong>
            ${filterStaff}
          </div>

          <div class="summary-box">
            <strong>DUE DAY</strong>
            ${filterDueDay}
          </div>

          <div class="summary-box">
            <strong>CHIT VALUE</strong>
            ${filterChitValue}
          </div>

        </div>


        <div class="joined-count">

          Total Joined:
          ${filteredData.length}

        </div>


        <table>

          <thead>

            <tr>

              <th>S.No</th>

              <th>Date</th>

              <th>Branch</th>

              <th>Staff Name</th>

              <th>Customer Name</th>

              <th>Chit Value</th>

              <th>Key Lever</th>

              <th>Follow-up</th>

              <th>Due Day</th>

              <th>Pay Mode</th>

              <th>Collection Type</th>

              <th>Remarks</th>

            </tr>

          </thead>

          <tbody>

            ${tableRows}

          </tbody>

        </table>


        <script>

          window.onload = function () {
            window.print();
          };

        </script>

      </body>

      </html>
    `);

    printWindow.document.close();
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo-area">
          <img src="/logo.jpg.jpg" alt="SEYAL CHITS" className="sidebar-logo" />
        </div>
        <nav className="sidebar-menu">
          <NavLink to="/dashboard" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}><FaHome /><span>Dashboard</span></NavLink>
          <NavLink to="/procedure" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}><FaClipboardList /><span>Procedure</span></NavLink>
          <NavLink to="/reports" className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}><FaChartBar /><span>Reports</span></NavLink>
        </nav>
        <div className="sidebar-footer">
          <strong>SEYAL CHITS</strong>
          <span>சேமிப்பே மாற்றம்!</span>
        </div>
      </aside>
      <main className="main-content">
        <div className="reports-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="reports-header">

        <div>

          <h1>
            Reports
          </h1>

          <p>
            View and filter procedure records
          </p>

        </div>


        <div className="reports-header-icon">

          <FaChartBar />

        </div>

      </div>


      {/* =================================================
          FILTER CARD
      ================================================= */}

      <div className="reports-filter-card">

        <div className="filter-title">

          <div className="filter-title-icon">

            <FaSearch />

          </div>


          <div>

            <h2>
              Filter Reports
            </h2>

            <p>
              Choose date period and other filters
            </p>

          </div>

        </div>


        <div className="filters-row">

          {/* =================================================
              DATE FILTER
          ================================================= */}

          <div className="report-filter">

            <label>

              <FaCalendarAlt />

              Date

            </label>


            <select
              name="dateFilter"
              value={
                filters.dateFilter
              }
              onChange={
                handleChange
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

              <option value="range">
                Date Range
              </option>

            </select>

          </div>


          {/* =================================================
              DATE RANGE
          ================================================= */}

          {filters.dateFilter ===
            "range" && (

            <>

              <div className="report-filter">

                <label>

                  <FaCalendarAlt />

                  From Date

                </label>


                <input
                  type="date"
                  name="dateFrom"
                  value={
                    filters.dateFrom
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>


              <div className="report-filter">

                <label>

                  <FaCalendarAlt />

                  To Date

                </label>


                <input
                  type="date"
                  name="dateTo"
                  value={
                    filters.dateTo
                  }
                  onChange={
                    handleChange
                  }
                />

              </div>

            </>

          )}


          {/* =================================================
              BRANCH
          ================================================= */}

          <div className="report-filter">

            <label>

              <FaBuilding />

              Branch

            </label>


            <select
              name="branch"
              value={
                filters.branch
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                All Branches
              </option>


              {branchNames.map(
                (branch) => (

                  <option
                    key={branch}
                    value={branch}
                  >
                    {branch}
                  </option>

                )
              )}

            </select>

          </div>


          {/* =================================================
              STAFF
          ================================================= */}

          <div className="report-filter">

            <label>

              <FaUser />

              Staff Name

            </label>


            <select
              name="staff"
              value={
                filters.staff
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                All Staff
              </option>


              {staffNames.map(
                (staff) => (

                  <option
                    key={staff}
                    value={staff}
                  >
                    {staff}
                  </option>

                )
              )}

            </select>

          </div>


          {/* =================================================
              DUE DAY
          ================================================= */}

          <div className="report-filter">

            <label>

              <FaCalendarAlt />

              Due Day

            </label>


            <select
              name="dueDay"
              value={
                filters.dueDay
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                All Due Days
              </option>


              {Array.from(
                {
                  length: 31,
                },
                (_, index) => {

                  const day =
                    index + 1;

                  return (
                    <option
                      key={day}
                      value={day}
                    >
                      {day}
                    </option>
                  );

                }
              )}

            </select>

          </div>


          {/* =================================================
              CHIT VALUE
          ================================================= */}

          <div className="report-filter">

            <label>

              <FaMoneyBillWave />

              Chit Value

            </label>


            <select
              name="chitValue"
              value={
                filters.chitValue
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                All Chit Values
              </option>


              {chitValues.map(
                (value) => (

                  <option
                    key={value}
                    value={value}
                  >
                    {formatCurrency(
                      value
                    )}
                  </option>

                )
              )}

            </select>

          </div>


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="filter-buttons">

            <button
              type="button"
              className="filter-btn"
              onClick={
                applyFilters
              }
            >

              <FaSearch />

              Filter

            </button>


            <button
              type="button"
              className="clear-filter-btn"
              onClick={
                clearFilters
              }
            >

              <FaTimes />

              Clear

            </button>


            <button
              type="button"
              className="filter-btn"
              onClick={
                handlePrint
              }
            >

              <FaPrint />

              Print

            </button>

          </div>

        </div>

      </div>


      {/* =================================================
          REPORT TABLE
      ================================================= */}

      <div className="reports-table-card">

        <div className="table-header">

          <div>

            <h2>
              Procedure Records
            </h2>

            <p>
              {reportPeriodText}
            </p>

          </div>


          <div className="record-count">

            {filteredData.length}

            {" "}

            {filteredData.length === 1
              ? "Record"
              : "Records"}

          </div>

        </div>


        <div className="table-wrapper">

          <table>

            <thead>

              <tr>

                <th>
                  S.No
                </th>

                <th>
                  Date
                </th>

                <th>
                  Branch
                </th>

                <th>
                  Staff Name
                </th>

                <th>
                  Customer Name
                </th>

                <th>
                  Chit Value
                </th>

                <th>
                  Key Lever
                </th>

                <th>
                  Follow-up
                </th>

                <th>
                  Due Day
                </th>

                <th>
                  Pay Mode
                </th>

                <th>
                  Collection Type
                </th>

                <th>
                  Remarks
                </th>

              </tr>

            </thead>


            <tbody>

              {loading ? (

                <tr>

                  <td
                    colSpan="12"
                    style={{
                      textAlign:
                        "center",
                      padding:
                        "30px",
                    }}
                  >

                    Loading procedures...

                  </td>

                </tr>

              ) : filteredData.length ===
                0 ? (

                <tr>

                  <td colSpan="12">

                    <div className="no-data">

                      <div className="no-data-icon">

                        <FaClipboardList />

                      </div>


                      <h3>
                        No Records Found
                      </h3>


                      <p>
                        No procedure entries
                        match the selected
                        filters.
                      </p>

                    </div>

                  </td>

                </tr>

              ) : (

                filteredData.map(
                  (item, index) => (

                    <tr
                      key={
                        item.id ||
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>


                      <td>
                        {formatDate(
                          item.joinedDate
                        )}
                      </td>


                      <td>
                        {item.branch ||
                          "-"}
                      </td>


                      <td>
                        {item.staffName ||
                          "-"}
                      </td>


                      <td>
                        {item.customerName ||
                          "-"}
                      </td>


                      <td>
                        {formatCurrency(
                          item.chitValue
                        )}
                      </td>


                      <td>
                        {item.keyLever ||
                          "-"}
                      </td>


                      <td>
                        {item.followUp ??
                          "-"}
                      </td>


                      <td>
                        {item.dueDay ||
                          "-"}
                      </td>


                      <td>
                        {item.payMode ||
                          "-"}
                      </td>


                      <td>
                        {item.collectionType ||
                          "-"}
                      </td>


                      <td>
                        {item.remarks ||
                          "-"}
                      </td>

                    </tr>

                  )
                )

              )}

            </tbody>

          </table>

        </div>

      </div>

        </div>
      </main>
    </div>
  );
}

export default Reports;