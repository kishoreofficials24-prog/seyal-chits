import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaClipboardList,
  FaChartBar,
  FaUsers,
  FaMoneyBillWave,
  FaCalendarCheck,
  FaDatabase,
  FaListOl,
  FaCog,
} from "react-icons/fa";

import "./Dashboard.css";

function Dashboard() {
  const [procedures, setProcedures] = useState([]);
  const [paymentPlans, setPaymentPlans] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  // =====================================================
  // API CONFIGURATION
  // Uses the SAME backend configuration as New Chit / Payment Plan.
  // Local: http://localhost:5000/api
  // Production: REACT_APP_API_URL
  // =====================================================

  const API_BASE_URL =
    process.env.REACT_APP_API_URL ||
    "http://localhost:5000/api";

  // =====================================================
  // FETCH ALL LIVE DASHBOARD DATA
  // =====================================================

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setDashboardLoading(true);

        const [
          proceduresResponse,
          combinedResponse,
        ] = await Promise.all([
          fetch(
            `${API_BASE_URL}/procedures`
          ),
          fetch(
            `${API_BASE_URL}/reports/combined`
          ),
        ]);

        if (!proceduresResponse.ok) {
          throw new Error(
            `New Chit API failed: ${proceduresResponse.status}`
          );
        }

        if (!combinedResponse.ok) {
          throw new Error(
            `Combined Report API failed: ${combinedResponse.status}`
          );
        }

        const [
          proceduresResult,
          combinedResult,
        ] = await Promise.all([
          proceduresResponse.json(),
          combinedResponse.json(),
        ]);

        if (!isMounted) {
          return;
        }

        setProcedures(
          proceduresResult.success
            ? proceduresResult.data || []
            : []
        );

        setPaymentPlans(
          combinedResult.success
            ? combinedResult.data || []
            : []
        );

        console.log(
          "Dashboard live data:",
          {
            newChits:
              proceduresResult.data?.length || 0,
            paymentPlanRows:
              combinedResult.data?.length || 0,
            apiBase:
              API_BASE_URL,
          }
        );
      } catch (error) {
        console.error(
          "Dashboard Live Fetch Error:",
          error
        );

        if (isMounted) {
          setProcedures([]);
          setPaymentPlans([]);
        }
      } finally {
        if (isMounted) {
          setDashboardLoading(false);
        }
      }
    };

    // Load immediately.
    fetchDashboardData();

    // Refresh ALL dashboard calculations every 60 seconds.
    const interval = setInterval(
      fetchDashboardData,
      60000
    );

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [API_BASE_URL]);

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
  // LIVE DUE CALCULATIONS
  // =====================================================

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const parseDateOnly = (value) => {
    if (!value) return null;

    const raw = String(value).trim();

    // Handles YYYY-MM-DD and ISO date strings without timezone shifting.
    const match = raw.match(/^(\\d{4})-(\\d{2})-(\\d{2})/);

    if (match) {
      return {
        year: Number(match[1]),
        month: Number(match[2]) - 1,
        day: Number(match[3]),
      };
    }

    // Handles DD/MM/YYYY or DD-MM-YYYY.
    const dmy = raw.match(/^(\\d{1,2})[\\/-](\\d{1,2})[\\/-](\\d{4})/);

    if (dmy) {
      return {
        year: Number(dmy[3]),
        month: Number(dmy[2]) - 1,
        day: Number(dmy[1]),
      };
    }

    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return null;

    return {
      year: parsed.getFullYear(),
      month: parsed.getMonth(),
      day: parsed.getDate(),
    };
  };

  const formatDay = (value) => {
    const parsed = parseDateOnly(value);
    return parsed ? parsed.day : "-";
  };

  const isCurrentMonth = (value) => {
    const parsed = parseDateOnly(value);
    return (
      parsed &&
      parsed.year === currentYear &&
      parsed.month === currentMonth
    );
  };

  const getPlannedAmount = (item) => {
    const amount = Number(item.planned_amount);
    return Number.isFinite(amount) ? amount : 0;
  };

  // Payment Plan due date is the actual due date saved in Payment Plan.
  // Rows already having a payment_id are treated as paid and are excluded.
  const paymentDueRows = paymentPlans
    .filter((item) => {
      const dueDate =
        item.first_due_date ||
        item.due_date ||
        item.payment_plan_due_date;

      return (
        isCurrentMonth(dueDate) &&
        !item.payment_id
      );
    })
    .sort((a, b) => {
      const da = parseDateOnly(
        a.first_due_date ||
        a.due_date ||
        a.payment_plan_due_date
      );
      const db = parseDateOnly(
        b.first_due_date ||
        b.due_date ||
        b.payment_plan_due_date
      );

      if (!da || !db) return 0;

      return (
        new Date(
          da.year,
          da.month,
          da.day
        ) -
        new Date(
          db.year,
          db.month,
          db.day
        )
      );
    });

  const totalPaymentDue = paymentDueRows.reduce(
    (total, item) =>
      total + getPlannedAmount(item),
    0
  );

  // New Chit due is independent from Payment Plan due.
  const newChitDueRows = procedures
    .filter((item) => {
      const dueDay = Number(item.dueDay);

      return (
        Number.isFinite(dueDay) &&
        dueDay >= 1 &&
        dueDay <= 31
      );
    })
    .sort((a, b) => {
      return Number(a.dueDay) - Number(b.dueDay);
    });

  const todayNewChitDueRows =
    newChitDueRows.filter(
      (item) =>
        Number(item.dueDay) ===
        now.getDate()
    );

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
                isActive
                  ? "active"
                  : ""
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
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <FaClipboardList />

            <span>
              New Chit
            </span>
          </NavLink>

          {/* MASTER */}

          <NavLink
            to="/master"
            className={({ isActive }) =>
              `menu-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <FaDatabase />

            <span>
              Master
            </span>
          </NavLink>

          {/* PAYMENT PLAN */}

          <NavLink
            to="/payment-plan"
            className={({ isActive }) =>
              `menu-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <FaListOl />

            <span>
              Payment Plan
            </span>
          </NavLink>

          {/* PAYMENT */}

          <NavLink
            to="/payment"
            className={({ isActive }) =>
              `menu-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <FaMoneyBillWave />

            <span>
              Payment
            </span>
          </NavLink>

          {/* REPORTS */}

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `menu-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <FaChartBar />

            <span>
              Reports
            </span>
          </NavLink>

          {/* SETTINGS */}

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `menu-item ${
                isActive
                  ? "active"
                  : ""
              }`
            }
          >
            <FaCog />

            <span>
              Settings
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
              Manage your new chits,
              payments and reports
              from one place.
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

          {/* NEW CHIT DUE */}

          <div className="stat-card">

            <div className="stat-icon purple">
              <FaCalendarCheck />
            </div>

            <div>

              <span>
                New Chit Due Today
              </span>

              <h2>
                {todayNewChitDueRows.length}
              </h2>

            </div>

          </div>

          {/* PAYMENT DUE */}

          <div className="stat-card">

            <div className="stat-icon purple">
              <FaMoneyBillWave />
            </div>

            <div>

              <span>
                Payment Due This Month
              </span>

              <h2>
                ₹{" "}
                {totalPaymentDue.toLocaleString(
                  "en-IN"
                )}
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

            {/* MASTER */}

            <NavLink
              to="/master"
              className="quick-card"
            >

              <div className="quick-icon">
                <FaDatabase />
              </div>

              <div>

                <h3>
                  Master
                </h3>

                <p>
                  Manage chit master data
                </p>

              </div>

            </NavLink>

            {/* PAYMENT PLAN */}

            <NavLink
              to="/payment-plan"
              className="quick-card"
            >

              <div className="quick-icon">
                <FaListOl />
              </div>

              <div>

                <h3>
                  Payment Plan
                </h3>

                <p>
                  Manage payment plans
                </p>

              </div>

            </NavLink>

            {/* PAYMENT */}

            <NavLink
              to="/payment"
              className="quick-card"
            >

              <div className="quick-icon">
                <FaMoneyBillWave />
              </div>

              <div>

                <h3>
                  Payment
                </h3>

                <p>
                  Record customer payments
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
                  Check reports
                </p>

              </div>

            </NavLink>

          </div>

        </section>

        {/* =================================================
            NEW CHIT DUE
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>
                New Chit Due Today
              </h2>

              <p>
                New Chit entries due on {now.getDate()}
              </p>
            </div>

          </div>

          {todayNewChitDueRows.length === 0 ? (

            <div className="empty-box">

              <div className="empty-icon">
                <FaCalendarCheck />
              </div>

              <h3>
                No New Chit Due Today
              </h3>

              <p>
                No New Chit is scheduled for today's due day.
              </p>

            </div>

          ) : (

            <div className="recent-table-wrapper">

              <table className="recent-table">

                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Day</th>
                    <th>Customer</th>
                    <th>Staff</th>
                    <th>Branch</th>
                    <th>Chit Value</th>
                  </tr>
                </thead>

                <tbody>

                  {todayNewChitDueRows.map(
                    (item, index) => (

                      <tr
                        key={
                          item.id ||
                          `new-chit-${index}`
                        }
                      >

                        <td>{index + 1}</td>
                        <td>{item.dueDay}</td>
                        <td>{item.customerName || "-"}</td>
                        <td>{item.staffName || "-"}</td>
                        <td>{item.branch || "-"}</td>

                        <td>
                          ₹{" "}
                          {Number(
                            item.chitValue || 0
                          ).toLocaleString("en-IN")}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </section>

        {/* =================================================
            PAYMENT PLAN DUE
        ================================================= */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <h2>
                Payment Due This Month
              </h2>

              <p>
                Live unpaid Payment Plan dues for{" "}
                {now.toLocaleDateString("en-IN", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>

          </div>

          {dashboardLoading ? (

            <div className="empty-box">
              <h3>
                Loading live payment dues...
              </h3>
            </div>

          ) : paymentDueRows.length === 0 ? (

            <div className="empty-box">

              <div className="empty-icon">
                <FaMoneyBillWave />
              </div>

              <h3>
                No Payment Due
              </h3>

              <p>
                No unpaid Payment Plan due is available for this month.
              </p>

            </div>

          ) : (

            <div className="recent-table-wrapper">

              <table className="recent-table">

                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Day</th>
                    <th>Name</th>
                    <th>Staff Name</th>
                    <th>Month</th>
                    <th>Chit Value</th>
                    <th>Payment Amount</th>
                  </tr>
                </thead>

                <tbody>

                  {paymentDueRows.map(
                    (item, index) => {

                      const dueDate =
                        item.first_due_date ||
                        item.due_date ||
                        item.payment_plan_due_date;

                      return (
                        <tr
                          key={
                            item.payment_plan_id ||
                            item.id ||
                            `payment-due-${index}`
                          }
                        >

                          <td>{index + 1}</td>
                          <td>{formatDay(dueDate)}</td>
                          <td>{item.name || "-"}</td>
                          <td>{item.staff_name || "-"}</td>
                          <td>
                            {item.payment_month ||
                              item.month ||
                              "-"}
                          </td>
                          <td>
                            ₹{" "}
                            {Number(
                              item.chit_value || 0
                            ).toLocaleString("en-IN")}
                          </td>
                          <td>
                            ₹{" "}
                            {getPlannedAmount(
                              item
                            ).toLocaleString("en-IN")}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

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
                Your latest new chit
                entries will appear here.
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
                            item.chitValue ||
                              0
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