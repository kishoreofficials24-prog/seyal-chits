

import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import axios from "axios";

import {
  FaHome,
  FaListOl,
  FaMoneyBillWave,
  FaChartBar,
  FaCalendarAlt,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaDatabase,
  FaClipboardList,
  FaCog,
} from "react-icons/fa";

import "./Payment.css";

const API_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:5000/api";

function Payment() {
  const [payments, setPayments] = useState([]);

  const [paymentPlans, setPaymentPlans] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [loadingPayments, setLoadingPayments] =
    useState(true);

  const [form, setForm] = useState({
    paymentPlanId: "",
    name: "",
    amount: "",
    date: "",
    place: "",
    photo: "",
    review: "",
    video: "",
    application: "",
    remarks: "",
  });

  /* =====================================================
     RESET FORM
     ===================================================== */

  const resetForm = () => {
    setForm({
      paymentPlanId: "",
      name: "",
      amount: "",
      date: "",
      place: "",
      photo: "",
      review: "",
      video: "",
      application: "",
      remarks: "",
    });

    setEditingId(null);
  };

  /* =====================================================
     LOAD PAYMENT PLANS
     ===================================================== */

  const loadPaymentPlans = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/payment-plans`
      );

      const result = response.data;

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : [];

      setPaymentPlans(data);
    } catch (error) {
      console.error(
        "Payment Plans Load Error:",
        error
      );

      setPaymentPlans([]);
    }
  };

  /* =====================================================
     LOAD PAYMENTS
     ===================================================== */
  const loadPayments = async () => {



    try {
      setLoadingPayments(true);

      const response = await axios.get(
        `${API_URL}/payments`
      );

      const result = response.data;

      const data = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
        ? result.data
        : [];

      const formattedData = data.map(
        (payment) => ({
          ...payment,

          paymentPlanId:
            payment.payment_plan_id,

          date:
            payment.payment_date ||
            payment.date ||
            "",
        })
      );

      setPayments(formattedData);
    } catch (error) {
      console.error(
        "Payment Records Load Error:",
        error
      );

      setPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  /* =====================================================
     INITIAL LOAD
     ===================================================== */

  useEffect(() => {
    loadPaymentPlans();
    loadPayments();
  }, []);

  /* =====================================================
     PAYMENT PLAN CHANGE
     ===================================================== */

  const handleNameChange = async (e) => {
    const selectedId = e.target.value;

    const selectedPlan = paymentPlans.find(
      (plan) =>
        String(plan.id) ===
        String(selectedId)



    );

    if (!selectedPlan) {
      setForm((prev) => ({
        ...prev,
        paymentPlanId: "",
        name: "",
        amount: "",
      }));
      return;
    }

    // Payment Plan-la irukkura same month-wise amount
    // Payment page-la automatic-ah varum.
    let paymentAmount =
      selectedPlan.first_payment_amount ??
      selectedPlan.payment_amount ??
      selectedPlan.planned_amount ??
      "";

    // Amount list response-la illa na backend-la irundhu exact amount fetch pannum.
    if (paymentAmount === "") {
      try {
        const response = await axios.get(
          `${API_URL}/payment-plans/${selectedId}/payment-info`
        );

        const result = response.data;
        const data = result?.data || result;

        paymentAmount =
          data?.amount ??
          data?.paymentAmount ??
          data?.payment_amount ??
          "";
      } catch (error) {
        console.error(
          "Payment Plan Amount Load Error:",
          error
        );
      }
    }

    setForm((prev) => ({
      ...prev,
      paymentPlanId: selectedId,
      name: selectedPlan.name,
      amount: paymentAmount,
    }));
  };

  /* =====================================================
     FORM CHANGE
     ===================================================== */

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Date change pannumbodhu amount change aagakoodadhu.
    // Amount always comes from the selected Payment Plan.
  };

  /* =====================================================
     SUBMIT PAYMENT
     ===================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.paymentPlanId ||
      !form.name ||
      form.amount === "" ||
      !form.date ||
      !form.place ||
      !form.photo ||
      !form.review ||
      !form.video ||
      !form.application
    ) {
      alert(
        "Please fill all required fields."
      );

      return;
    }

    try {
      // Backend API expects snake_case field names.
      // Keep frontend form state camelCase, map it here before POST/PUT.
      const payload = {
        payment_plan_id:
          Number(
            form.paymentPlanId
          ),

        amount:
          Number(form.amount),

        payment_date:
          form.date,

        place:
          form.place,

        photo:
          form.photo,

        review:
          form.review,



        video:
          form.video,

        application:
          form.application,

        remarks:
          form.remarks || "",
      };

      if (editingId) {
        await axios.put(
          `${API_URL}/payments/${editingId}`,
          payload
        );

        alert(
          "Payment updated successfully"
        );
      } else {
        await axios.post(
          `${API_URL}/payments`,
          payload
        );

        alert(
          "Payment saved successfully"
        );
      }

      await loadPayments();

      resetForm();
    } catch (error) {
      console.error(
        "Payment Save Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to save payment"
      );
    }
  };

  /* =====================================================
     EDIT
     ===================================================== */

  const handleEdit = (payment) => {
    setForm({
      paymentPlanId:
        payment.payment_plan_id ||
        payment.paymentPlanId ||
        "",

      name:
        payment.name || "",

      amount:
        payment.amount ?? "",

      date:
        payment.payment_date ||
        payment.date ||
        "",

      place:
        payment.place || "",

      photo:
        payment.photo || "",

      review:
        payment.review || "",

      video:
        payment.video || "",

      application:
        payment.application || "",

      remarks:
        payment.remarks || "",
    });

    setEditingId(payment.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =====================================================
     DELETE
     ===================================================== */

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this payment?"
      );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `${API_URL}/payments/${id}`
      );

      await loadPayments();

      alert(
        "Payment deleted successfully"



      );

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error(
        "Payment Delete Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete payment"
      );
    }
  };

  /* =====================================================
     SEARCH
     ===================================================== */

  const filteredPayments =
    payments.filter((payment) => {
      const keyword =
        search
          .toLowerCase()
          .trim();

      if (!keyword) {
        return true;
      }

      return (
        String(
          payment.name || ""
        )
          .toLowerCase()
          .includes(keyword) ||

        String(
          payment.place || ""
        )
          .toLowerCase()
          .includes(keyword)
      );
    });

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="payment-wrapper">

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

        
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `menu-item ${isActive ? "active" : ""}`
            }
          >
            <FaCog />
            <span>Settings</span>
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

      <main className="payment-content">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="payment-header">

          <div>

            <span className="page-label">
              COLLECTION



            </span>

            <h1>
              Payment
            </h1>

            <p>
              Record and manage customer payments.
            </p>

          </div>

          <div className="header-date">

            <FaCalendarAlt />

            <span>
              {new Date().toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                }
              )}
            </span>

          </div>

        </div>

        {/* =================================================
            FORM CARD
            ================================================= */}

        <div className="payment-form-card">

          {/* FORM HEADER */}

          <div className="form-card-header">

            <div>

              <h2>
                {editingId
                  ? "Edit Payment"
                  : "Add Payment"}
              </h2>

              <p>
                Enter payment collection details below.
              </p>

            </div>

            <div className="payment-form-icon">

              <FaMoneyBillWave />

            </div>

          </div>

          {/* FORM */}

          <form
            className="payment-form"
            onSubmit={
              handleSubmit
            }
          >

            {/* NAME */}

            <div className="payment-field">

              <label>
                Name <span>*</span>
              </label>

              <select
                name="paymentPlanId"
                value={
                  form.paymentPlanId
                }
                onChange={
                  handleNameChange
                }
              >

                <option value="">
                  Select Name
                </option>

                {paymentPlans.map(
                  (plan) => (
                    <option
                      key={
                        plan.id
                      }
                      value={
                        plan.id
                      }
                    >
                      {plan.name}
                    </option>
                  )
                )}

              </select>

            </div>

            {/* AMOUNT */}

            <div className="payment-field">

              <label>



                Amount <span>*</span>
              </label>

              <input
                type="text"
                name="amount"
                value={
                  form.amount !== ""
                    ? `■ ${Number(
                        form.amount
                      ).toLocaleString(
                        "en-IN"
                      )}`
                    : ""
                }
                placeholder="Auto filled"
                readOnly
              />

              <small className="field-note">
                Auto-filled from Payment Plan
              </small>

            </div>

            {/* DATE */}

            <div className="payment-field">

              <label>
                Date <span>*</span>
              </label>

              <input
                type="date"
                name="date"
                value={
                  form.date
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* PLACE */}

            <div className="payment-field">

              <label>
                Place <span>*</span>
              </label>

              <input
                type="text"
                name="place"
                placeholder="Enter payment place"
                value={
                  form.place
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* PHOTO */}

            <div className="payment-field">

              <label>
                Photo <span>*</span>
              </label>

              <select
                name="photo"
                value={
                  form.photo
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select
                </option>

                <option value="Yes">
                  Yes
                </option>

                <option value="No">
                  No
                </option>

              </select>

            </div>

            {/* REVIEW */}

            <div className="payment-field">

              <label>
                Review <span>*</span>
              </label>

              <select
                name="review"
                value={
                  form.review
                }
                onChange={
                  handleChange
                }



              >

                <option value="">
                  Select
                </option>

                <option value="Yes">
                  Yes
                </option>

                <option value="No">
                  No
                </option>

              </select>

            </div>

            {/* VIDEO */}

            <div className="payment-field">

              <label>
                Video <span>*</span>
              </label>

              <select
                name="video"
                value={
                  form.video
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select
                </option>

                <option value="Yes">
                  Yes
                </option>

                <option value="No">
                  No
                </option>

              </select>

            </div>

            {/* APPLICATION */}

            <div className="payment-field">

              <label>
                Application <span>*</span>
              </label>

              <select
                name="application"
                value={
                  form.application
                }
                onChange={
                  handleChange
                }
              >

                <option value="">
                  Select
                </option>

                <option value="Yes">
                  Yes
                </option>

                <option value="No">
                  No
                </option>

              </select>

            </div>

            {/* REMARKS */}

            <div className="payment-field payment-full-width">

              <label>
                Remarks
              </label>

              <textarea
                name="remarks"
                rows="3"
                placeholder="Enter remarks..."
                value={
                  form.remarks
                }
                onChange={
                  handleChange
                }
              />

            </div>

            {/* BUTTONS */}

            <div className="payment-form-actions">

              {editingId && (
                <button
                  type="button"
                  className="payment-cancel-button"
                  onClick={
                    resetForm



                  }
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                className="payment-save-button"
              >

                <FaPlus />

                {editingId
                  ? "Update Payment"
                  : "Save Payment"}

              </button>

            </div>

          </form>

        </div>

        {/* =================================================
            PAYMENT TABLE
            ================================================= */}

        <div className="payment-table-card">

          {/* TABLE HEADER */}

          <div className="payment-table-header">

            <div>

              <h2>
                Payment Records
              </h2>

              <p>
                {payments.length} payment
                {payments.length !== 1
                  ? "s"
                  : ""} recorded
              </p>

            </div>

            {/* SEARCH */}

            <div className="payment-search-box">

              <FaSearch />

              <input
                type="text"
                placeholder="Search customer or place..."
                value={
                  search
                }
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>

          </div>

          {/* LOADING */}

          {loadingPayments ? (

            <div className="payment-empty-state">

              <div className="payment-empty-icon">

                <FaMoneyBillWave />

              </div>

              <h3>
                Loading payments...
              </h3>

              <p>
                Please wait while payment records are loaded.
              </p>

            </div>

          ) : filteredPayments.length === 0 ? (

            /* EMPTY */

            <div className="payment-empty-state">

              <div className="payment-empty-icon">

                <FaMoneyBillWave />

              </div>

              <h3>
                No payments recorded yet
              </h3>

              <p>
                Add your first payment using the form above.
              </p>

            </div>

          ) : (



            /* TABLE */

            <div className="payment-table-scroll">

              <table className="payment-table">

                <thead>

                  <tr>

                    <th>
                      S.No
                    </th>

                    <th>
                      Name
                    </th>

                    <th>
                      Amount
                    </th>

                    <th>
                      Date
                    </th>

                    <th>
                      Place
                    </th>

                    <th>
                      Photo
                    </th>

                    <th>
                      Review
                    </th>

                    <th>
                      Video
                    </th>

                    <th>
                      Application
                    </th>

                    <th>
                      Remarks
                    </th>

                    <th>
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredPayments.map(
                    (
                      payment,
                      index
                    ) => (

                      <tr
                        key={
                          payment.id
                        }
                      >

                        <td className="payment-serial">

                          {index + 1}

                        </td>

                        <td className="payment-name">

                          {payment.name ||
                            "-"}

                        </td>

                        <td className="payment-amount">

                          ■
                          {Number(
                            payment.amount ||
                              0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        <td>

                          {payment.date ||
                            "-"}

                        </td>

                        <td>

                          {payment.place ||
                            "-"}

                        </td>

                        <td>

                          <StatusBadge
                            value={
                              payment.photo
                            }
                          />



                        </td>

                        <td>

                          <StatusBadge
                            value={
                              payment.review
                            }
                          />

                        </td>

                        <td>

                          <StatusBadge
                            value={
                              payment.video
                            }
                          />

                        </td>

                        <td>

                          <StatusBadge
                            value={
                              payment.application
                            }
                          />

                        </td>

                        <td className="payment-remarks">

                          {payment.remarks ||
                            "-"}

                        </td>

                        <td>

                          <div className="payment-actions">

                            <button
                              type="button"
                              className="payment-edit"
                              onClick={() =>
                                handleEdit(
                                  payment
                                )
                              }
                              title="Edit"
                            >

                              <FaEdit />

                            </button>

                            <button
                              type="button"
                              className="payment-delete"
                              onClick={() =>
                                handleDelete(
                                  payment.id
                                )
                              }
                              title="Delete"
                            >

                              <FaTrash />

                            </button>

                          </div>

                        </td>

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

/* =========================================================
   STATUS BADGE
   ========================================================= */

function StatusBadge({ value }) {
  if (value === "Yes") {
    return (
      <span className="status-badge status-yes">

        <FaCheckCircle />

        Yes

      </span>
    );
  }

  return (
    <span className="status-badge status-no">
      <FaTimesCircle />



      No

    </span>
  );
}

export default Payment;