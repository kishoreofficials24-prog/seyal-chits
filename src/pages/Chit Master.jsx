import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaClipboardList,
  FaDatabase,
  FaListOl,
  FaMoneyBillWave,
  FaChartBar,
  FaSearch,
  FaEye,
  FaRupeeSign,
  FaCog,
} from "react-icons/fa";

import "./Chit Master.css";

const API =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

function formatMoney(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "₹0";
  }

  return `₹${Number(value).toLocaleString("en-IN")}`;
}

function getMonthLabel(month) {
  const lastTwo = month % 100;

  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${month}th Month`;
  }

  switch (month % 10) {
    case 1:
      return `${month}st Month`;

    case 2:
      return `${month}nd Month`;

    case 3:
      return `${month}rd Month`;

    default:
      return `${month}th Month`;
  }
}

function ChitMaster() {
  const [masters, setMasters] = useState([]);
  const [selectedMaster, setSelectedMaster] =
    useState(null);

  const [schedule, setSchedule] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [scheduleLoading, setScheduleLoading] =
    useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD CHIT MASTERS
  // =====================================================

  const loadMasters = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/chit-masters`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load chit masters"
        );
      }

      const result = await response.json();

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.rows)
        ? result.rows
        : [];

      setMasters(data);

      if (data.length > 0) {
        setSelectedMaster(data[0]);
      } else {
        setSelectedMaster(null);
      }
    } catch (err) {
      console.error(
        "Chit Master loading error:",
        err
      );

      setMasters([]);
      setSelectedMaster(null);

      setError(
        "Unable to load chit master data."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD MONTH-WISE SCHEDULE
  // =====================================================

  const loadSchedule = async (masterId) => {
    if (!masterId) {
      setSchedule([]);
      return;
    }

    try {
      setScheduleLoading(true);
      setError("");

      const response = await fetch(
        `${API}/chit-masters/${masterId}/schedule`
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load schedule"
        );
      }

      const result = await response.json();

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.rows)
        ? result.rows
        : [];

      setSchedule(data);
    } catch (err) {
      console.error(
        "Schedule loading error:",
        err
      );

      setSchedule([]);

      setError(
        "Unable to load month-wise schedule."
      );
    } finally {
      setScheduleLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadMasters();
  }, []);

  // =====================================================
  // LOAD SCHEDULE WHEN MASTER CHANGES
  // =====================================================

  useEffect(() => {
    if (selectedMaster?.id) {
      loadSchedule(selectedMaster.id);
    } else {
      setSchedule([]);
    }
  }, [selectedMaster]);

  // =====================================================
  // SEARCH FILTER
  // =====================================================

  const filteredMasters = masters.filter(
    (master) => {
      const searchText =
        search.trim().toLowerCase();

      if (!searchText) {
        return true;
      }

      return (
        String(
          master.chit_value || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          master.total_months || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    }
  );

  // =====================================================
  // SELECT MASTER
  // =====================================================

  const handleSelectMaster = (master) => {
    setSelectedMaster(master);
  };

  return (
    <div className="chit-master-page">

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

        {/* MENU */}

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

          {/* MASTER */}

          <NavLink
            to="/master"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
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
                isActive ? "active" : ""
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
                isActive ? "active" : ""
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
                isActive ? "active" : ""
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
                isActive ? "active" : ""
              }`
            }
          >
            <FaCog />

            <span>
              Settings
            </span>
          </NavLink>

        </nav>

        {/* FOOTER */}

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

        <div className="page-header">

          <div>

            <h1>
              Chit Master
            </h1>

            <p>
              Manage chit values and
              month-wise payment amounts
            </p>

          </div>

          <div className="page-header-icon">
            <FaDatabase />
          </div>

        </div>

        {/* ERROR */}

        {error && (
          <div className="master-error">
            {error}
          </div>
        )}

        {/* =================================================
            CHIT VALUES
        ================================================= */}

        <section className="master-section">

          <div className="section-title">

            <div>

              <h2>
                Chit Values
              </h2>

              <p>
                Select a chit to view its
                payment schedule
              </p>

            </div>

            <div className="master-count">

              {masters.length}

              <span>
                Chits
              </span>

            </div>

          </div>

          {/* SEARCH */}

          <div className="master-search">

            <FaSearch />

            <input
              type="text"
              placeholder="Search chit value..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          {/* MASTER LIST */}

          {loading ? (

            <div className="master-empty">

              Loading chit masters...

            </div>

          ) : filteredMasters.length === 0 ? (

            <div className="master-empty">

              <FaDatabase />

              <h3>
                No Chit Masters Found
              </h3>

              <p>
                No chit master data is
                available.
              </p>

            </div>

          ) : (

            <div className="master-grid">

              {filteredMasters.map(
                (master) => {

                  const isSelected =
                    selectedMaster?.id ===
                    master.id;

                  return (
                    <button
                      type="button"
                      key={master.id}
                      className={
                        isSelected
                          ? "master-card selected"
                          : "master-card"
                      }
                      onClick={() =>
                        handleSelectMaster(
                          master
                        )
                      }
                    >

                      <div className="master-card-icon">

                        <FaRupeeSign />

                      </div>

                      <div className="master-card-content">

                        <span>
                          Chit Value
                        </span>

                        <strong>
                          {formatMoney(
                            master.chit_value
                          )}
                        </strong>

                        <small>
                          {master.total_months ||
                            0}{" "}
                          Months
                        </small>

                      </div>

                      <div className="master-card-view">

                        <FaEye />

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* =================================================
            SELECTED MASTER
        ================================================= */}

        {selectedMaster && (

          <section className="schedule-section">

            <div className="schedule-header">

              <div>

                <span>
                  Selected Chit
                </span>

                <h2>
                  {formatMoney(
                    selectedMaster.chit_value
                  )}
                </h2>

              </div>

              <div className="schedule-summary">

                <div>

                  <span>
                    Total Months
                  </span>

                  <strong>
                    {
                      selectedMaster.total_months
                    }
                  </strong>

                </div>

                <div>

                  <span>
                    Schedule
                  </span>

                  <strong>
                    {schedule.length}
                  </strong>

                </div>

              </div>

            </div>

            {/* =================================================
                MONTH-WISE SCHEDULE
            ================================================= */}

            {scheduleLoading ? (

              <div className="schedule-empty">

                Loading payment schedule...

              </div>

            ) : schedule.length === 0 ? (

              <div className="schedule-empty">

                <FaDatabase />

                <h3>
                  No Schedule Found
                </h3>

                <p>
                  Month-wise payment schedule
                  is not available.
                </p>

              </div>

            ) : (

              <div className="schedule-table-wrapper">

                <table className="schedule-table">

                  <thead>

                    <tr>

                      <th>
                        S.No
                      </th>

                      <th>
                        Month
                      </th>

                      <th>
                        Payment Amount
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {schedule.map(
                      (item, index) => {

                        const monthNumber =
                          Number(
                            item.month_number
                          );

                        return (
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

                              <span className="month-badge">

                                {getMonthLabel(
                                  monthNumber
                                )}

                              </span>

                            </td>

                            <td className="amount-cell">

                              {formatMoney(
                                item.payment_amount
                              )}

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

        )}

      </main>

    </div>
  );
}

export default ChitMaster;