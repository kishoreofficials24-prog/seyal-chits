import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";
import {
  FaHome,
  FaListOl,
  FaMoneyBillWave,
  FaChartBar,
  FaClipboardList,
  FaDatabase,
  FaSave,
  FaTimes,
  FaSearch,
  FaEdit,
  FaTrash,
  FaChevronUp,
  FaChevronDown,
  FaCog,
} from "react-icons/fa";

import "./Paymentplan.css";
import "./Dashboard.css";

const API =
  process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const initialForm = {
  name: "",
  staffName: "",
  village: "",
  chitMasterId: "",
  paymentMonth: "",
  paymentDue: "",
  paymentAmount: "",
  firstDueDate: "",
  planDate: "",
  remarks: "",
};

// =====================================================
// FORMAT AMOUNT
// =====================================================

function formatAmount(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "";
  }

  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(dateString) {
  if (!dateString) return "-";

  if (
    typeof dateString === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(dateString)
  ) {
    const [year, month, day] = dateString.split("-");

    return `${day}-${month}-${year}`;
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// =====================================================
// TODAY
// =====================================================

function getToday() {
  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// =====================================================
// MONTH LABEL
// =====================================================

function getMonthLabel(monthNumber) {
  if (!monthNumber || monthNumber < 1) {
    return "";
  }

  const lastTwo = monthNumber % 100;

  if (lastTwo >= 11 && lastTwo <= 13) {
    return `${monthNumber}th Month`;
  }

  switch (monthNumber % 10) {
    case 1:
      return `${monthNumber}st Month`;

    case 2:
      return `${monthNumber}nd Month`;

    case 3:
      return `${monthNumber}rd Month`;

    default:
      return `${monthNumber}th Month`;
  }
}

export default function PaymentPlan() {
  const [form, setForm] = useState({
    ...initialForm,
    planDate: getToday(),
  });

  const [plans, setPlans] = useState([]);

  const [chitMasters, setChitMasters] =
    useState([]);

  const [editingId, setEditingId] =
    useState(null);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // LOAD CHIT MASTERS
  // =====================================================

  const loadChitMasters = async () => {
    try {
      const response = await axios.get(
        `${API}/chit-masters`
      );

      const result = response.data;

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.rows)
        ? result.rows
        : [];

      setChitMasters(data);

      setError("");
    } catch (err) {
      console.error(
        "Chit master loading error:",
        err
      );

      setChitMasters([]);

      setError(
        "Unable to load chit values."
      );
    }
  };

  // =====================================================
  // LOAD PAYMENT PLANS
  // =====================================================

  const loadPlans = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API}/payment-plans`
      );

      const result = response.data;

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.rows)
        ? result.rows
        : [];

      const sortedData = [...data].sort(
        (a, b) => {
          const orderA = Number(
            a.display_order || 0
          );

          const orderB = Number(
            b.display_order || 0
          );

          if (orderA === orderB) {
            return (
              Number(a.id) -
              Number(b.id)
            );
          }

          return orderA - orderB;
        }
      );

      setPlans(sortedData);
    } catch (err) {
      console.error(
        "Payment plan loading error:",
        err
      );

      setPlans([]);

      setError(
        "Unable to load payment plans."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadChitMasters();
    loadPlans();
  }, []);

  // =====================================================
  // PAYMENT DUE / PAYMENT AMOUNT
  // =====================================================

  const handlePaymentDueChange = async (e) => {
    const monthNumber = Number(e.target.value);

    setError("");

    const monthLabel = monthNumber
      ? getMonthLabel(monthNumber)
      : "";

    setForm((prev) => ({
      ...prev,
      paymentMonth: monthNumber
        ? String(monthNumber)
        : "",
      paymentDue: monthLabel,
      paymentAmount: "",
    }));

    if (!monthNumber || !form.chitMasterId) {
      return;
    }

    try {
      const response = await axios.get(
        `${API}/chit-masters/${form.chitMasterId}/schedule`
      );

      const result = response.data;

      const schedule = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result?.rows)
        ? result.rows
        : [];

      const selectedMonth = schedule.find(
        (item) =>
          Number(item.month_number) ===
          monthNumber
      );

      setForm((prev) => ({
        ...prev,
        paymentDue: monthLabel,
        paymentAmount: selectedMonth
          ? selectedMonth.payment_amount
          : "",
      }));
    } catch (err) {
      console.error(
        "Payment schedule loading error:",
        err
      );

      setError(
        "Unable to load payment amount for selected month."
      );
    }
  };

  // =====================================================
  // CHIT VALUE CHANGE
  // =====================================================

  const handleChitValueChange = (e) => {
    const chitMasterId = e.target.value;

    setForm((prev) => ({
      ...prev,
      chitMasterId,
      paymentMonth: "",
      paymentDue: "",
      paymentAmount: "",
    }));

    setError("");
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setError("");

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.name.trim()) {
      setError(
        "Please enter customer name."
      );
      return;
    }

    if (!form.staffName.trim()) {
      setError(
        "Please enter staff name."
      );
      return;
    }

    if (!form.village.trim()) {
      setError(
        "Please enter village."
      );
      return;
    }

    if (!form.chitMasterId) {
      setError(
        "Please select chit value."
      );
      return;
    }

    if (!form.planDate) {
      setError(
        "Please select plan date."
      );
      return;
    }

    if (!form.firstDueDate) {
      setError(
        "Please select due date."
      );
      return;
    }

    // 0 is a valid amount for 1st Month
    if (
      !form.paymentMonth ||
      form.paymentAmount === "" ||
      form.paymentAmount === null ||
      form.paymentAmount === undefined
    ) {
      setError(
        "Please select a payment due month and chit value."
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name:
          form.name.trim(),

        staff_name:
          form.staffName.trim(),

        village:
          form.village.trim(),

        chit_master_id:
          Number(
            form.chitMasterId
          ),

        payment_month:
          Number(
            form.paymentMonth
          ),

        first_due_date:
          form.firstDueDate,

        plan_date:
          form.planDate,

        remarks:
          form.remarks.trim(),
      };

      if (editingId) {
        await axios.put(
          `${API}/payment-plans/${editingId}`,
          payload
        );

        alert(
          "Payment Plan updated successfully"
        );
      } else {
        await axios.post(
          `${API}/payment-plans`,
          payload
        );

        alert(
          "Payment Plan saved successfully"
        );
      }

      resetForm();

      await loadPlans();

    } catch (err) {
      console.error(
        "Payment plan save error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to save payment plan."
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const resetForm = () => {
    setForm({
      ...initialForm,
      planDate: getToday(),
    });

    setEditingId(null);
  };

  // =====================================================
  // EDIT
  // =====================================================

  const handleEdit = async (plan) => {
    setError("");

    const chitMasterId =
      plan.chit_master_id ||
      plan.chitMasterId ||
      "";

    const planDate =
      plan.plan_date ||
      getToday();

    const dueDate =
      plan.first_due_date ||
      plan.due_date ||
      "";

    setEditingId(plan.id);

    setForm({
      name:
        plan.name || "",

      staffName:
        plan.staff_name ||
        plan.staffName ||
        "",

      village:
        plan.village ||
        "",

      chitMasterId,

      paymentMonth:
        plan.payment_month
          ? String(plan.payment_month)
          : plan.paymentMonth
          ? String(plan.paymentMonth)
          : plan.payment_due
          ? String(
              plan.payment_due
            ).match(/\d+/)?.[0] || ""
          : "",

      paymentDue:
        plan.payment_due ||
        plan.paymentDue ||
        "",

      paymentAmount:
        plan.first_payment_amount ??
        plan.payment_amount ??
        "",

      firstDueDate:
        dueDate,

      planDate,

      remarks:
        plan.remarks ||
        "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE
  // =====================================================

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this payment plan?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await axios.delete(
        `${API}/payment-plans/${id}`
      );

      alert(
        "Payment Plan deleted successfully"
      );

      await loadPlans();

      if (editingId === id) {
        resetForm();
      }

    } catch (err) {
      console.error(
        "Delete error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to delete payment plan."
      );
    }
  };

  // =====================================================
  // ORDER
  // =====================================================

  const updateOrder = async (
    planId,
    newIndex
  ) => {
    if (
      newIndex < 0 ||
      newIndex >= plans.length
    ) {
      return;
    }

    const currentIndex =
      plans.findIndex(
        (item) =>
          item.id === planId
      );

    if (currentIndex === -1) {
      return;
    }

    const newPlans = [
      ...plans,
    ];

    const [selectedPlan] =
      newPlans.splice(
        currentIndex,
        1
      );

    newPlans.splice(
      newIndex,
      0,
      selectedPlan
    );

    setPlans(newPlans);

    try {
      await Promise.all(
        newPlans.map(
          (plan, index) =>
            axios.put(
              `${API}/payment-plans/${plan.id}/order`,
              {
                displayOrder:
                  index + 1,
              }
            )
        )
      );
    } catch (err) {
      console.error(
        "Order update error:",
        err
      );

      setError(
        "Unable to update order."
      );

      await loadPlans();
    }
  };

  const moveUp = (index) => {
    if (index <= 0) return;

    updateOrder(
      plans[index].id,
      index - 1
    );
  };

  const moveDown = (index) => {
    if (
      index >=
      plans.length - 1
    ) {
      return;
    }

    updateOrder(
      plans[index].id,
      index + 1
    );
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredPlans =
    plans.filter((plan) => {
      const searchText =
        search
          .toLowerCase()
          .trim();

      if (!searchText) {
        return true;
      }

      return (
        String(
          plan.name || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          plan.staff_name ||
            plan.staffName ||
            ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          plan.village || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          plan.chit_value || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          plan.remarks || ""
        )
          .toLowerCase()
          .includes(searchText)
      );
    });

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="payment-plan-wrapper">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div className="sidebar-logo-area">
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
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/procedure"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <FaClipboardList />
            <span>New Chit</span>
          </NavLink>

          <NavLink
            to="/master"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <FaDatabase />
            <span>Master</span>
          </NavLink>

          <NavLink
            to="/payment-plan"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <FaListOl />
            <span>Payment Plan</span>
          </NavLink>

          <NavLink
            to="/payment"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <FaMoneyBillWave />
            <span>Payment</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
            }
          >
            <FaChartBar />
            <span>Reports</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `menu-item ${
                isActive ? "active" : ""
              }`
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

      {/* MAIN CONTENT */}

      <main className="payment-plan-content">

        {/* HEADER */}

        <div className="payment-plan-header">

          <div>

            <span className="page-label">
              PAYMENT PLAN MANAGEMENT
            </span>

            <h1>
              Payment Plan
            </h1>

            <p>
              Create and manage customer payment plans
            </p>

          </div>

          <div className="header-date">
            {formatDate(
              getToday()
            )}
          </div>

        </div>

        {/* ALERT */}

        {error && (
          <div className="payment-plan-alert error">
            {error}
          </div>
        )}

        {/* FORM CARD */}

        <div className="plan-form-card">

          <div
            className="form-card-header"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >

            <div>

              <h2>
                {editingId
                  ? "Edit Payment Plan"
                  : "New Payment Plan"}
              </h2>

              <p>
                Enter customer plan details
              </p>

            </div>

            <div
              className="form-header-icon"
              style={{
                width: "56px",
                height: "56px",
                minWidth: "56px",
                borderRadius: "14px",
                background: "#080808",
                color: "#e0b52e",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                marginLeft: "auto",
              }}
            >
              <FaListOl />
            </div>

          </div>

          {/* FORM */}

          <form
            className="payment-plan-form"
            onSubmit={handleSubmit}
          >

            {/* NAME */}

            <div className="form-field">

              <label>
                Name
              </label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter customer name"
              />

            </div>

            {/* STAFF NAME */}

            <div className="form-field">

              <label>
                Staff Name
              </label>

              <input
                type="text"
                name="staffName"
                value={form.staffName}
                onChange={handleChange}
                placeholder="Enter staff name"
              />

            </div>

            {/* VILLAGE */}

            <div className="form-field">

              <label>
                Village
              </label>

              <input
                type="text"
                name="village"
                value={form.village}
                onChange={handleChange}
                placeholder="Enter village"
              />

            </div>

            {/* CHIT VALUE */}

            <div className="form-field">

              <label>
                Chit Value
              </label>

              <select
                name="chitMasterId"
                value={form.chitMasterId}
                onChange={
                  handleChitValueChange
                }
              >

                <option value="">
                  Select Chit Value
                </option>

                {Array.isArray(
                  chitMasters
                ) &&
                  chitMasters.map(
                    (chit) => (
                      <option
                        key={chit.id}
                        value={chit.id}
                      >
                        ₹{" "}
                        {formatAmount(
                          chit.chit_value
                        )}
                      </option>
                    )
                  )}

              </select>

            </div>

            {/* PAYMENT DUE */}

            <div className="form-field">

              <label>
                Payment Due
              </label>

              <select
                name="paymentMonth"
                value={
                  form.paymentMonth || ""
                }
                onChange={
                  handlePaymentDueChange
                }
              >

                <option value="">
                  Select Payment Due
                </option>

                {Array.from(
                  { length: 20 },
                  (_, index) => {

                    const month =
                      index + 1;

                    return (
                      <option
                        key={month}
                        value={month}
                      >
                        {getMonthLabel(
                          month
                        )}
                      </option>
                    );

                  }
                )}

              </select>

            </div>

            {/* PAYMENT AMOUNT */}

            <div className="form-field">

              <label>
                Payment Amount
              </label>

              <input
                type="text"
                value={
                  form.paymentAmount !==
                    "" &&
                  form.paymentAmount !==
                    null &&
                  form.paymentAmount !==
                    undefined
                    ? `₹ ${formatAmount(
                        form.paymentAmount
                      )}`
                    : ""
                }
                placeholder="Auto calculated"
                readOnly
              />

            </div>

            {/* DUE DATE */}

            <div className="form-field">

              <label>
                Due Date
              </label>

              <input
                type="date"
                name="firstDueDate"
                value={
                  form.firstDueDate
                }
                onChange={handleChange}
              />

            </div>

            {/* PLAN DATE */}

            <div className="form-field">

              <label>
                Plan Date
              </label>

              <input
                type="date"
                name="planDate"
                value={form.planDate}
                onChange={handleChange}
              />

            </div>

            {/* REMARKS */}

            <div className="form-field full-width">

              <label>
                Remarks
              </label>

              <textarea
                name="remarks"
                value={form.remarks}
                onChange={handleChange}
                placeholder="Enter remarks"
                rows="3"
              />

            </div>

            {/* ACTIONS */}

            <div className="form-actions">

              <button
                type="button"
                className="cancel-button"
                onClick={resetForm}
              >

                <FaTimes />

                Cancel

              </button>

              <button
                type="submit"
                className="save-plan-button"
                disabled={saving}
              >

                <FaSave />

                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Plan"
                  : "Save Plan"}

              </button>

            </div>

          </form>

        </div>

        {/* TABLE */}

        <div className="plans-table-card">

          <div className="table-header">

            <div>

              <h2>
                Payment Plans
              </h2>

              <p>
                Manage all customer payment plans
              </p>

            </div>

            <div className="search-box">

              <FaSearch />

              <input
                type="text"
                placeholder="Search plans..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          <div className="table-scroll">

            <table className="plans-table">

              <thead>

                <tr>

                  <th>S.No</th>
                  <th>Name</th>
                  <th>Staff Name</th>
                  <th>Village</th>
                  <th>Chit Value</th>
                  <th>Payment Due</th>
                  <th>Payment Amount</th>
                  <th>Due Date</th>
                  <th>Plan Date</th>
                  <th>Remarks</th>
                  <th>Order</th>
                  <th>Action</th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="12"
                      className="empty-plan-state"
                    >
                      Loading payment plans...
                    </td>

                  </tr>

                ) : filteredPlans.length > 0 ? (

                  filteredPlans.map(
                    (plan, index) => {

                      const planDate =
                        plan.plan_date;

                      const dueDate =
                        plan.first_due_date ||
                        plan.due_date;

                      return (

                        <tr
                          key={plan.id}
                        >

                          {/* S.NO */}

                          <td className="serial-number">
                            {index + 1}
                          </td>

                          {/* NAME */}

                          <td className="customer-name">
                            {plan.name ||
                              "-"}
                          </td>

                          {/* STAFF */}

                          <td>
                            {plan.staff_name ||
                              plan.staffName ||
                              "-"}
                          </td>

                          {/* VILLAGE */}

                          <td>
                            {plan.village ||
                              "-"}
                          </td>

                          {/* CHIT VALUE */}

                          <td className="amount-cell">

                            {plan.chit_value
                              ? `₹ ${formatAmount(
                                  plan.chit_value
                                )}`
                              : "-"}

                          </td>

                          {/* PAYMENT DUE */}

                          <td>

                            {plan.payment_due ||
                              plan.paymentDue ||
                              "-"}

                          </td>

                          {/* PAYMENT AMOUNT */}

                          <td className="payment-amount-cell">

                            {plan.first_payment_amount !==
                              null &&
                            plan.first_payment_amount !==
                              undefined &&
                            plan.first_payment_amount !==
                              ""
                              ? `₹ ${formatAmount(
                                  plan.first_payment_amount
                                )}`
                              : "-"}

                          </td>

                          {/* DUE DATE */}

                          <td>
                            {formatDate(
                              dueDate
                            )}
                          </td>

                          {/* PLAN DATE */}

                          <td>
                            {formatDate(
                              planDate
                            )}
                          </td>

                          {/* REMARKS */}

                          <td className="remarks-cell">
                            {plan.remarks ||
                              "-"}
                          </td>

                          {/* ORDER */}

                          <td>

                            <div className="order-controls">

                              <button
                                type="button"
                                className="drag-icon"
                                onClick={() =>
                                  moveUp(
                                    index
                                  )
                                }
                                disabled={
                                  index === 0
                                }
                                title="Move Up"
                              >
                                <FaChevronUp />
                              </button>

                              <button
                                type="button"
                                className="drag-icon"
                                onClick={() =>
                                  moveDown(
                                    index
                                  )
                                }
                                disabled={
                                  index ===
                                  plans.length - 1
                                }
                                title="Move Down"
                              >
                                <FaChevronDown />
                              </button>

                            </div>

                          </td>

                          {/* ACTION */}

                          <td>

                            <div className="action-buttons">

                              <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                  handleEdit(
                                    plan
                                  )
                                }
                                title="Edit"
                              >
                                <FaEdit />
                              </button>

                              <button
                                type="button"
                                className="delete-button"
                                onClick={() =>
                                  handleDelete(
                                    plan.id
                                  )
                                }
                                title="Delete"
                              >
                                <FaTrash />
                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )

                ) : (

                  <tr>

                    <td
                      colSpan="12"
                      className="empty-plan-state"
                    >

                      <div className="empty-plan-icon">
                        <FaListOl />
                      </div>

                      <h3>
                        No Payment Plans Found
                      </h3>

                      <p>
                        Create a payment plan to see
                        customer records here.
                      </p>

                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          </div>

        </div>

      </main>

    </div>
  );
}