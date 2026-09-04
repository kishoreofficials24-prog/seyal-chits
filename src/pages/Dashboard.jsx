import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaClipboardList,
  FaChartBar,
  FaUsers,
  FaMoneyBillWave,
  FaCalendarCheck,
} from "react-icons/fa";

import "./Dashboard.css";


function Dashboard() {

  const [procedures, setProcedures] = useState([]);


  // =====================================================
  // FETCH PROCEDURES FROM PRODUCTION BACKEND
  // =====================================================

  useEffect(() => {

    fetch(
      "https://seyal-chits-backend.onrender.com/api/procedures"
    )

      .then((response) => {

        if (!response.ok) {

          throw new Error(
            "Failed to fetch procedures"
          );

        }

        return response.json();

      })

      .then((result) => {

        if (result.success) {

          setProcedures(result.data);

        }

      })

      .catch((error) => {

        console.error(
          "Dashboard Fetch Error:",
          error
        );

      });

  }, []);


  // =====================================================
  // DASHBOARD CALCULATIONS
  // =====================================================

  const totalProcedures =
    procedures.length;


  const totalCustomers =
    new Set(
      procedures.map(
        (item) =>
          item.customerName
      )
    ).size;


  const totalChitValue =
    procedures.reduce(
      (total, item) =>
        total +
        Number(
          item.chitValue || 0
        ),
      0
    );


  // =====================================================
  // TODAY'S DUE
  // Due Day = current day of month
  // =====================================================

  const currentDay =
    new Date().getDate();


  const todaysDue =
    procedures.filter(
      (item) =>
        Number(item.dueDay) ===
        currentDay
    ).length;


  // =====================================================
  // RECENT NEW CHITS
  // =====================================================

  const recentProcedures =
    procedures.slice(0, 5);


  return (

    <div className="dashboard">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside className="sidebar">


        {/* LOGO */}

        <div className="sidebar-logo-area">

          <img
            src="/logo.jpg.jpg"
            alt="SEYAL CHITS"
            className="sidebar-logo"
          />

        </div>



        {/* NAVIGATION */}

        <nav className="sidebar-menu">


          {/* DASHBOARD */}

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >

            <FaHome />

            <span>
              Dashboard
            </span>

          </NavLink>



          {/* NEW CHIT */}

          <NavLink
            to="/procedure"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >

            <FaClipboardList />

            <span>
              New Chit
            </span>

          </NavLink>



          {/* REPORTS */}

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >

            <FaChartBar />

            <span>
              Reports
            </span>

          </NavLink>


        </nav>



        {/* SIDEBAR FOOTER */}

        <div className="sidebar-footer">

          <strong>
            SEYAL CHITS
          </strong>

          <span>
            சேமிப்பே மாற்றம்!
          </span>

        </div>


      </aside>



      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main-content">


        {/* PAGE HEADER */}

        <div className="dashboard-page-header">

          <div>

            <h1>
              Dashboard
            </h1>

            <p>
              SEYAL CHITS overview
            </p>

          </div>


          <div className="today-box">

            <span>
              Today
            </span>

            <strong>
              {new Date().toLocaleDateString(
                "en-IN"
              )}
            </strong>

          </div>

        </div>



        {/* =================================================
            WELCOME CARD
        ================================================= */}

        <section className="welcome-card">

          <div>

            <span className="welcome-small">
              SEYAL CHITS
            </span>

            <h2>
              Welcome Back 👋
            </h2>

            <p>
              Manage your new chits and
              reports from one place.
            </p>

          </div>


          <div className="welcome-icon">

            <FaClipboardList />

          </div>

        </section>



        {/* =================================================
            STATISTICS
        ================================================= */}

        <section className="stats-grid">


          {/* TOTAL NEW CHITS */}

          <div className="stat-card">

            <div className="stat-icon blue">

              <FaClipboardList />

            </div>


            <div>

              <span>
                Total New Chits
              </span>

              <h2>
                {totalProcedures}
              </h2>

            </div>

          </div>



          {/* TOTAL CUSTOMERS */}

          <div className="stat-card">

            <div className="stat-icon green">

              <FaUsers />

            </div>


            <div>

              <span>
                Total Customers
              </span>

              <h2>
                {totalCustomers}
              </h2>

            </div>

          </div>



          {/* TOTAL CHIT VALUE */}

          <div className="stat-card">

            <div className="stat-icon orange">

              <FaMoneyBillWave />

            </div>


            <div>

              <span>
                Total Chit Value
              </span>

              <h2>

                ₹{" "}

                {totalChitValue.toLocaleString(
                  "en-IN"
                )}

              </h2>

            </div>

          </div>



          {/* TODAY'S DUE */}

          <div className="stat-card">

            <div className="stat-icon purple">

              <FaCalendarCheck />

            </div>


            <div>

              <span>
                Today's Due
              </span>

              <h2>
                {todaysDue}
              </h2>

            </div>

          </div>


        </section>



        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="dashboard-section">


          <div className="section-heading">

            <div>

              <h2>
                Quick Actions
              </h2>

              <p>
                Frequently used options
              </p>

            </div>

          </div>



          <div className="quick-actions">


            {/* NEW CHIT */}

            <NavLink
              to="/procedure"
              className="quick-card"
            >

              <div className="quick-icon">

                <FaClipboardList />

              </div>


              <div>

                <h3>
                  New Chit
                </h3>

                <p>
                  Add a new chit entry
                </p>

              </div>

            </NavLink>



            {/* REPORTS */}

            <NavLink
              to="/reports"
              className="quick-card"
            >

              <div className="quick-icon">

                <FaChartBar />

              </div>


              <div>

                <h3>
                  View Reports
                </h3>

                <p>
                  Check new chit records
                </p>

              </div>

            </NavLink>


          </div>

        </section>



        {/* =================================================
            RECENT NEW CHITS
        ================================================= */}

        <section className="dashboard-section">


          <div className="section-heading">

            <div>

              <h2>
                Recent New Chits
              </h2>

              <p>
                Latest new chit entries
              </p>

            </div>

          </div>



          {recentProcedures.length === 0 ? (

            <div className="empty-box">

              <div className="empty-icon">

                <FaClipboardList />

              </div>


              <h3>
                No New Chits Yet
              </h3>


              <p>
                Your latest new chit entries
                will appear here.
              </p>

            </div>

          ) : (

            <div className="recent-table-wrapper">

              <table className="recent-table">

                <thead>

                  <tr>

                    <th>
                      S.No
                    </th>

                    <th>
                      Customer
                    </th>

                    <th>
                      Branch
                    </th>

                    <th>
                      Staff
                    </th>

                    <th>
                      Chit Value
                    </th>

                    <th>
                      Due Day
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {recentProcedures.map(
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
                          {item.customerName}
                        </td>

                        <td>
                          {item.branch}
                        </td>

                        <td>
                          {item.staffName}
                        </td>

                        <td>

                          ₹{" "}

                          {Number(
                            item.chitValue || 0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        <td>
                          {item.dueDay}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}


        </section>


      </main>

    </div>

  );

}


export default Dashboard;