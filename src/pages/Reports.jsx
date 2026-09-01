import React, { useEffect, useMemo, useState } from "react";

import {
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


// =====================================================
// API URL
// =====================================================

const API_URL =
  "https://seyal-chits-backend.onrender.com/api/procedures";


// =====================================================
// REPORTS
// =====================================================

function Reports() {

  // =====================================================
  // ALL PROCEDURE DATA
  // =====================================================

  const [data, setData] = useState([]);


  // =====================================================
  // SELECTED FILTERS
  // =====================================================

  const [filters, setFilters] = useState({
    branch: "",
    staff: "",
    dueDay: "",
    chitValue: "",
  });


  // =====================================================
  // APPLIED FILTERS
  // =====================================================

  const [appliedFilters, setAppliedFilters] = useState({
    branch: "",
    staff: "",
    dueDay: "",
    chitValue: "",
  });


  // =====================================================
  // LOADING
  // =====================================================

  const [loading, setLoading] = useState(false);


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

      if (result.success) {

        setData(
          Array.isArray(result.data)
            ? result.data
            : []
        );

      } else {

        setData([]);

      }

    } catch (error) {

      console.error(
        "Reports Fetch Error:",
        error
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {

    fetchProcedures();

  }, []);


  // =====================================================
  // DYNAMIC STAFF NAMES
  // =====================================================
  // IMPORTANT:
  // These names come directly from Procedure data.
  // So whenever a new staff is added in Procedure,
  // Reports will automatically show that name.
  // =====================================================

  const staffNames = useMemo(() => {

    const names = data
      .map((item) =>
        String(item.staffName || "").trim()
      )
      .filter(Boolean);

    return [...new Set(names)].sort(
      (a, b) =>
        a.localeCompare(
          b,
          "en",
          {
            sensitivity: "base",
          }
        )
    );

  }, [data]);


  // =====================================================
  // DYNAMIC BRANCH NAMES
  // =====================================================

  const branchNames = useMemo(() => {

    const branches = data
      .map((item) =>
        String(item.branch || "").trim()
      )
      .filter(Boolean);

    return [...new Set(branches)].sort(
      (a, b) =>
        a.localeCompare(
          b,
          "en",
          {
            sensitivity: "base",
          }
        )
    );

  }, [data]);


  // =====================================================
  // DYNAMIC CHIT VALUES
  // =====================================================

  const chitValues = useMemo(() => {

    const values = data
      .map((item) => Number(item.chitValue))
      .filter(
        (value) =>
          !Number.isNaN(value) &&
          value > 0
      );

    return [...new Set(values)].sort(
      (a, b) => a - b
    );

  }, [data]);


  // =====================================================
  // HANDLE FILTER CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFilters((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // =====================================================
  // APPLY FILTER
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

    const emptyFilters = {
      branch: "",
      staff: "",
      dueDay: "",
      chitValue: "",
    };

    setFilters(emptyFilters);

    setAppliedFilters(emptyFilters);

  };


  // =====================================================
  // FILTER DATA
  // =====================================================

  const filteredData = data.filter((item) => {


    // ---------------- BRANCH ----------------

    const branchMatch =
      !appliedFilters.branch ||
      String(item.branch || "").trim() ===
      String(appliedFilters.branch).trim();


    // ---------------- STAFF ----------------

    const staffMatch =
      !appliedFilters.staff ||
      String(item.staffName || "").trim() ===
      String(appliedFilters.staff).trim();


    // ---------------- DUE DAY ----------------

    const dueDayMatch =
      !appliedFilters.dueDay ||
      Number(item.dueDay) ===
      Number(appliedFilters.dueDay);


    // ---------------- CHIT VALUE ----------------

    const chitValueMatch =
      !appliedFilters.chitValue ||
      Number(item.chitValue) ===
      Number(appliedFilters.chitValue);


    return (
      branchMatch &&
      staffMatch &&
      dueDayMatch &&
      chitValueMatch
    );

  });


  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {

    const number = Number(value);

    if (
      Number.isNaN(number) ||
      number === 0
    ) {
      return "₹0";
    }

    return `₹${number.toLocaleString(
      "en-IN"
    )}`;

  };


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


    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1200,height=800"
      );


    if (!printWindow) {

      alert(
        "Please allow pop-ups to print the report."
      );

      return;

    }


    // ===================================================
    // TODAY'S DATE
    // ===================================================

    const today =
      new Date().toLocaleDateString(
        "en-IN"
      );


    // ===================================================
    // FILTER SUMMARY
    // ===================================================

    const branchText =
      appliedFilters.branch ||
      "All Branches";

    const staffText =
      appliedFilters.staff ||
      "All Staff";

    const dueDayText =
      appliedFilters.dueDay ||
      "All Due Days";

    const chitValueText =
      appliedFilters.chitValue
        ? formatCurrency(
            appliedFilters.chitValue
          )
        : "All Chit Values";


    // ===================================================
    // TABLE ROWS
    // ===================================================

    const tableRows =
      filteredData
        .map(
          (item, index) => `

            <tr>

              <td>
                ${index + 1}
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
                ${item.collectionType || "-"}
              </td>

              <td>
                ${item.remarks || "-"}
              </td>

            </tr>

          `
        )
        .join("");


    // ===================================================
    // PRINT HTML
    // ===================================================

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


          .report-header {

            text-align: center;

            margin-bottom: 20px;

            border-bottom:
              2px solid #222;

            padding-bottom: 15px;

          }


          .report-header h1 {

            margin: 0;

            font-size: 24px;

            font-weight: 700;

          }


          .report-header h2 {

            margin: 5px 0 0;

            font-size: 17px;

            font-weight: 600;

          }


          .report-date {

            margin-top: 7px;

            font-size: 13px;

            color: #555;

          }


          .filter-summary {

            display: grid;

            grid-template-columns:
              repeat(4, 1fr);

            gap: 10px;

            margin-bottom: 18px;

          }


          .filter-box {

            border:
              1px solid #ccc;

            padding: 8px 10px;

            border-radius: 4px;

            font-size: 12px;

          }


          .filter-box strong {

            display: block;

            margin-bottom: 3px;

            font-size: 11px;

            color: #555;

          }


          .record-count {

            margin-bottom: 10px;

            font-size: 13px;

            font-weight: 600;

          }


          table {

            width: 100%;

            border-collapse: collapse;

            font-size: 10px;

          }


          th {

            background: #f1f1f1;

            font-weight: 700;

            text-align: left;

          }


          th,
          td {

            border:
              1px solid #999;

            padding: 7px 5px;

            vertical-align: top;

          }


          .footer {

            margin-top: 20px;

            text-align: right;

            font-size: 11px;

            color: #666;

          }


          @page {

            size: landscape;

            margin: 10mm;

          }


          @media print {

            body {

              padding: 0;

            }

          }

        </style>

      </head>


      <body>


        <div class="report-header">

          <h1>
            SEYAL CHITS
          </h1>

          <h2>
            Procedure Report
          </h2>

          <div class="report-date">
            Report Date: ${today}
          </div>

        </div>


        <div class="filter-summary">


          <div class="filter-box">

            <strong>
              BRANCH
            </strong>

            ${branchText}

          </div>


          <div class="filter-box">

            <strong>
              STAFF
            </strong>

            ${staffText}

          </div>


          <div class="filter-box">

            <strong>
              DUE DAY
            </strong>

            ${dueDayText}

          </div>


          <div class="filter-box">

            <strong>
              CHIT VALUE
            </strong>

            ${chitValueText}

          </div>


        </div>


        <div class="record-count">

          Total Records:
          ${filteredData.length}

        </div>


        <table>


          <thead>

            <tr>

              <th>
                S.No
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

            ${tableRows}

          </tbody>


        </table>


        <div class="footer">

          Generated on ${today}

        </div>


      </body>

      </html>

    `);


    printWindow.document.close();

    printWindow.focus();


    setTimeout(() => {

      printWindow.print();

      printWindow.close();

    }, 500);

  };


  // =====================================================
  // RETURN
  // =====================================================

  return (

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
              Choose one or multiple filters
            </p>

          </div>

        </div>



        {/* =================================================
            FILTER ROW
        ================================================= */}

        <div className="filters-row">


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
              value={filters.branch}
              onChange={handleChange}
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
              STAFF - DYNAMIC FROM PROCEDURE
          ================================================= */}

          <div className="report-filter">

            <label>

              <FaUser />

              Staff Name

            </label>


            <select
              name="staff"
              value={filters.staff}
              onChange={handleChange}
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
              value={filters.dueDay}
              onChange={handleChange}
            >

              <option value="">
                All Due Days
              </option>


              {Array.from(
                { length: 31 },
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
              CHIT VALUE - DYNAMIC FROM PROCEDURE
          ================================================= */}

          <div className="report-filter">

            <label>

              <FaMoneyBillWave />

              Chit Value

            </label>


            <select
              name="chitValue"
              value={filters.chitValue}
              onChange={handleChange}
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
                    {formatCurrency(value)}
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
              onClick={applyFilters}
            >

              <FaSearch />

              Filter

            </button>


            <button
              type="button"
              className="clear-filter-btn"
              onClick={clearFilters}
            >

              <FaTimes />

              Clear

            </button>


            <button
              type="button"
              className="filter-btn"
              onClick={handlePrint}
              title="Print Report"
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
              Saved procedure entries
            </p>

          </div>


          <div className="record-count">

            {filteredData.length} Records

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
                    colSpan="11"
                    style={{
                      textAlign: "center",
                      padding: "30px",
                    }}
                  >
                    Loading procedures...

                  </td>

                </tr>

              ) : filteredData.length === 0 ? (

                <tr>

                  <td colSpan="11">

                    <div className="no-data">

                      <div className="no-data-icon">

                        <FaClipboardList />

                      </div>


                      <h3>
                        No Records Found
                      </h3>


                      <p>
                        No procedure entries match
                        the selected filters.
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
                        {item.branch || "-"}
                      </td>

                      <td>
                        {item.staffName || "-"}
                      </td>

                      <td>
                        {item.customerName || "-"}
                      </td>

                      <td>

                        {formatCurrency(
                          item.chitValue
                        )}

                      </td>

                      <td>
                        {item.keyLever || "-"}
                      </td>

                      <td>
                        {item.followUp ?? "-"}
                      </td>

                      <td>
                        {item.dueDay || "-"}
                      </td>

                      <td>
                        {item.payMode || "-"}
                      </td>

                      <td>
                        {item.collectionType || "-"}
                      </td>

                      <td>
                        {item.remarks || "-"}
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

  );

}


export default Reports;