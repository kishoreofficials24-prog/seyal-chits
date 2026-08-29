import React, { useEffect, useState } from "react";

import {
  FaChartBar,
  FaBuilding,
  FaUser,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaSearch,
  FaTimes,
  FaClipboardList,
} from "react-icons/fa";

import "./Reports.css";


function Reports() {

  // =====================================================
  // ALL PROCEDURE DATA
  // =====================================================

  const [data, setData] = useState([]);


  // =====================================================
  // SELECTED FILTER VALUES
  // =====================================================

  const [filters, setFilters] = useState({
    branch: "",
    staff: "",
    dueDay: "",
    chitValue: "",
  });


  // =====================================================
  // APPLIED FILTER VALUES
  // =====================================================

  const [appliedFilters, setAppliedFilters] = useState({
    branch: "",
    staff: "",
    dueDay: "",
    chitValue: "",
  });


  // =====================================================
  // FETCH PROCEDURES
  // =====================================================

  const fetchProcedures = async () => {

    try {

      const response = await fetch(
        "http://localhost:5000/api/procedures"
      );


      if (!response.ok) {
        throw new Error(
          "Failed to fetch procedures"
        );
      }


      const result = await response.json();


      if (result.success) {

        setData(result.data);

      }

    } catch (error) {

      console.error(
        "Reports Fetch Error:",
        error
      );

    }

  };


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {

    fetchProcedures();

  }, []);


  // =====================================================
  // FILTER CHANGE
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
      String(item.branch).trim() ===
        String(appliedFilters.branch).trim();


    // ---------------- STAFF ----------------

    const staffMatch =
      !appliedFilters.staff ||
      String(item.staffName).trim() ===
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


        {/* FILTER TITLE */}

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


          {/* ================= BRANCH ================= */}

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

              <option value="Natham">
                Natham
              </option>

              <option value="Sendurai">
                Sendurai
              </option>

              <option value="Palakurichi">
                Palakurichi
              </option>

            </select>

          </div>



          {/* ================= STAFF ================= */}

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

              <option value="Kishore">
                Kishore
              </option>

              <option value="Thiyagarajan">
                Thiyagarajan
              </option>

              <option value="Renuga">
                Renuga
              </option>

              <option value="Prathap">
                Prathap
              </option>

            </select>

          </div>



          {/* ================= DUE DAY ================= */}

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

                  const day = index + 1;

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



          {/* ================= CHIT VALUE ================= */}

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

              <option value="50000">
                ₹50,000
              </option>

              <option value="100000">
                ₹1,00,000
              </option>

              <option value="200000">
                ₹2,00,000
              </option>

              <option value="300000">
                ₹3,00,000
              </option>

              <option value="500000">
                ₹5,00,000
              </option>

            </select>

          </div>



          {/* ================= BUTTONS ================= */}

          <div className="filter-buttons">


            {/* FILTER */}

            <button
              type="button"
              className="filter-btn"
              onClick={applyFilters}
            >

              <FaSearch />

              Filter

            </button>



            {/* CLEAR */}

            <button
              type="button"
              className="clear-filter-btn"
              onClick={clearFilters}
            >

              <FaTimes />

              Clear

            </button>


          </div>


        </div>

      </div>



      {/* =================================================
          REPORT TABLE
      ================================================= */}

      <div className="reports-table-card">


        {/* TABLE HEADER */}

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



        {/* =================================================
            TABLE
        ================================================= */}

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


              {filteredData.length === 0 ? (

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
                        No procedure entries
                        match the selected filters.
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

                      {/* S.NO */}

                      <td>
                        {index + 1}
                      </td>


                      {/* BRANCH */}

                      <td>
                        {item.branch}
                      </td>


                      {/* STAFF */}

                      <td>
                        {item.staffName}
                      </td>


                      {/* CUSTOMER */}

                      <td>
                        {item.customerName}
                      </td>


                      {/* CHIT VALUE */}

                      <td>

                        ₹{" "}

                        {Number(
                          item.chitValue || 0
                        ).toLocaleString(
                          "en-IN"
                        )}

                      </td>


                      {/* KEY LEVER */}

                      <td>
                        {item.keyLever}
                      </td>


                      {/* FOLLOW UP */}

                      <td>
                        {item.followUp}
                      </td>


                      {/* DUE DAY */}

                      <td>
                        {item.dueDay}
                      </td>


                      {/* PAY MODE */}

                      <td>
                        {item.payMode}
                      </td>


                      {/* COLLECTION TYPE */}

                      <td>
                        {item.collectionType}
                      </td>


                      {/* REMARKS */}

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