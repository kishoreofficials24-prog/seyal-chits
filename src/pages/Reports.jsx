import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaClipboardList,
  FaDatabase,
  FaListOl,
  FaMoneyBillWave,
  FaChartBar,
  FaFileAlt,
  FaCalendarAlt,
  FaCreditCard,
  FaLayerGroup,
  FaClock,
  FaCog,
} from "react-icons/fa";
import "./Reports.css";

const reportCards = [
  {
    id: 1,
    title: "Normal Chit Report",
    description:
      "View normal chit customer, staff, branch, chit value and collection details.",
    icon: <FaFileAlt />,
    path: "/reports/normal-chit",
  },
  {
    id: 2,
    title: "Payment Plan Report",
    description:
      "View payment plan details, selected month and payment amount.",
    icon: <FaCalendarAlt />,
    path: "/reports/payment-plan",
  },
  {
    id: 3,
    title: "Payment Report",
    description:
      "View payment collection details, amount, date, place and status.",
    icon: <FaCreditCard />,
    path: "/reports/payment",
  },
  {
    id: 4,
    title: "Plan + Payment Report",
    description:
      "View payment plan and actual payment details together in one report.",
    icon: <FaLayerGroup />,
    path: "/reports/combined",
  },
  {
    id: 5,
    title: "Future Chit Report",
    description:
      "View future chit requirements based on the customer's required month.",
    icon: <FaClock />,
    path: "/reports/future-chit",
  },
];

function Reports() {
  const navigate = useNavigate();

  return (
    <div className="reports-home-page">

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
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            <FaChartBar />
            <span>Reports</span>
          </NavLink>

          {/* ================= SETTINGS ================= */}

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
          <span>சேமிப்பே மாற்றம்!</span>
        </div>

      </aside>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">

        <div className="reports-header">

          <div>
            <h1>Reports</h1>
            <p>Select a report to view details</p>
          </div>

        </div>


        {/* ===================================================
            REPORT CARDS
        =================================================== */}

        <div className="report-list">

          {reportCards.map((report) => (
            <div
              className="report-card"
              key={report.id}
              onClick={() => navigate(report.path)}
            >

              <div className="report-icon">
                {report.icon}
              </div>

              <div className="report-content">

                <div className="report-number">
                  Report {report.id}
                </div>

                <h2>{report.title}</h2>

                <p>{report.description}</p>

              </div>

              <div className="report-arrow">
                →
              </div>

            </div>
          ))}

        </div>

      </main>

    </div>
  );
}

export default Reports;