import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaChartBar,
  FaClipboardList,
  FaDatabase,
  FaListOl,
  FaBuilding,
  FaUser,
  FaUsers,
  FaMoneyBillWave,
  FaKey,
  FaRedo,
  FaCalendarAlt,
  FaCreditCard,
  FaTags,
  FaCommentAlt,
  FaSave,
  FaTimes,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaCog,
} from "react-icons/fa";

import "./Procedure.css";
import "./Dashboard.css";

const API_URL =
  `${process.env.REACT_APP_API_URL || "http://localhost:5000/api"}/procedures`;

function NewChit() {

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
    joinedDate: new Date().toISOString().split("T")[0],
    branch: "",
    staffName: "",
    customerName: "",
    chitValue: "",
    keyLever: "",
    followUp: "",
    dueDay: "",
    payMode: "",
    collectionType: "",
    remarks: "",
  });

  // =====================================================
  // NEW CHITS LIST
  // =====================================================

  const [procedures, setProcedures] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);



  // =====================================================
  // SETTINGS DATA
  // =====================================================

  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [chitValues, setChitValues] = useState([]);

  // =====================================================
  // RESET FORM
  // =====================================================

  const handleReset = () => {
    setFormData({
      joinedDate: new Date().toISOString().split("T")[0],
      branch: "",
      staffName: "",



      customerName: "",
      chitValue: "",
      keyLever: "",
      followUp: "",
      dueDay: "",
      payMode: "",
      collectionType: "",
      remarks: "",
    });

    setEditingId(null);
  };

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // FETCH ALL NEW CHITS
  // =====================================================

  const fetchProcedures = async () => {
    try {
      setLoading(true);

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch new chits"
        );
      }

      setProcedures(result.data || []);
    } catch (error) {
      console.error("New Chit Fetch Error:", error);

      alert(
        "Unable to load new chits. Please check backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH BRANCH / STAFF / CHIT VALUES FROM SETTINGS
  // =====================================================

  const fetchSettingsData = async () => {
    try {
      const baseApi =
        process.env.REACT_APP_API_URL ||
        "http://localhost:5000/api";

      const [staffRes, branchRes, chitRes] =



        await Promise.all([
          fetch(`${baseApi}/settings/staff`),
          fetch(`${baseApi}/settings/branches`),
          fetch(`${baseApi}/settings/chit-values`),
        ]);

      const [staffJson, branchJson, chitJson] =
        await Promise.all([
          staffRes.json(),
          branchRes.json(),
          chitRes.json(),
        ]);



      if (!staffRes.ok) {
        throw new Error(
          staffJson.message ||
            "Failed to fetch staff"
        );
      }

      if (!branchRes.ok) {
        throw new Error(
          branchJson.message ||
            "Failed to fetch branches"
        );
      }

      if (!chitRes.ok) {
        throw new Error(
          chitJson.message ||
            "Failed to fetch chit values"
        );
      }

      // =================================================
      // OLD BRANCHES - KEEP ALWAYS
      // =================================================

      const oldBranches = [
        "Natham",
        "Sendurai",
        "Palakurichi",
      ];

      // =================================================
      // OLD CHIT VALUES - KEEP ALWAYS
      // =================================================

      const oldChitValues = [
        100000,
        200000,
        300000,
        500000,
        1000000,
        2000000,
        3000000,
      ];

      // =================================================
      // SETTINGS DATA
      // =================================================

      const settingsStaff =
        Array.isArray(staffJson.data)
          ? staffJson.data
          : [];

      const settingsBranches =
        Array.isArray(branchJson.data)
          ? branchJson.data
          : [];

      const settingsChits =
        Array.isArray(chitJson.data)
          ? chitJson.data
          : [];

      // =================================================
      // STAFF = SETTINGS ONLY



      // =================================================

      const staffNames = settingsStaff
        .map(
          (item) =>
            item.name ||
            item.staff_name
        )
        .filter(Boolean);

      const uniqueStaff = [



        ...new Set(
          staffNames
            .map((name) =>
              String(name).trim()
            )
            .filter(Boolean)
        ),
      ];

      // =================================================
      // BRANCH = OLD + NEW SETTINGS BRANCHES
      // =================================================

      const branchNames = [
        ...oldBranches,

        ...settingsBranches
          .map(
            (item) =>
              item.name ||
              item.branch_name
          )
          .filter(Boolean),
      ];

      const uniqueBranches = [
        ...new Set(
          branchNames
            .map((name) =>
              String(name).trim()
            )
            .filter(Boolean)
        ),
      ];

      // =================================================
      // CHIT VALUE = OLD + NEW SETTINGS VALUES
      // =================================================

      const chitNumbers = [
        ...oldChitValues,

        ...settingsChits
          .map((item) =>
            Number(item.chit_value)
          )
          .filter(
            (value) =>
              Number.isFinite(value) &&
              value > 0
          ),
      ];

      const uniqueChitNumbers = [
        ...new Set(chitNumbers),
      ].sort((a, b) => a - b);

      setStaff(uniqueStaff);
      setBranches(uniqueBranches);

      setChitValues(
        uniqueChitNumbers.map((value) => ({
          id: `chit-${value}`,
          chit_value: value,
        }))
      );



    } catch (error) {
      console.error(
        "Settings Data Fetch Error:",
        error
      );

      alert(
        "Unable to load Branch / Staff / Chit Values. Please check backend."
      );
    }
  };



  // =====================================================
  // LOAD DATA ON PAGE LOAD
  // =====================================================

  useEffect(() => {
    fetchProcedures();
    fetchSettingsData();
  }, []);

  // =====================================================
  // SAVE / UPDATE NEW CHIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const isEditing = editingId !== null;

      const url = isEditing
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = isEditing
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method: method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            (isEditing
              ? "Failed to update new chit"
              : "Failed to save new chit")
        );

        return;
      }

      if (isEditing) {
        alert(
          "New Chit updated successfully!"
        );
      } else {
        alert(
          "New Chit saved successfully!"
        );
      }

      handleReset();

      await fetchProcedures();
    } catch (error) {
      console.error(
        "Save / Update Error:",



        error
      );

      alert(
        "Unable to connect to server. Please check backend."
      );
    }
  };

  // =====================================================
  // EDIT NEW CHIT
  // =====================================================



  const handleEdit = (procedure) => {
    setEditingId(procedure.id);

    setFormData({
      joinedDate:
        procedure.joinedDate
          ? String(
              procedure.joinedDate
            ).slice(0, 10)
          : "",

      branch:
        procedure.branch || "",

      staffName:
        procedure.staffName || "",

      customerName:
        procedure.customerName || "",

      chitValue:
        procedure.chitValue !== null &&
        procedure.chitValue !== undefined
          ? String(procedure.chitValue)
          : "",

      keyLever:
        procedure.keyLever || "",

      followUp:
        procedure.followUp !== null &&
        procedure.followUp !== undefined
          ? String(procedure.followUp)
          : "",

      dueDay:
        procedure.dueDay !== null &&
        procedure.dueDay !== undefined
          ? String(procedure.dueDay)
          : "",

      payMode:
        procedure.payMode || "",

      collectionType:
        procedure.collectionType || "",

      remarks:
        procedure.remarks || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =====================================================
  // DELETE NEW CHIT
  // =====================================================

  const handleDelete = async (id) => {
    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this new chit?"
      );



    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }



      );

      const result =
        await response.json();

      if (!response.ok) {
        alert(
          result.message ||
            "Failed to delete new chit"
        );

        return;
      }

      alert(
        "New Chit deleted successfully!"
      );

      if (editingId === id) {
        handleReset();
      }

      await fetchProcedures();
    } catch (error) {
      console.error(
        "Delete Error:",
        error
      );

      alert(
        "Unable to connect to server. Please check backend."
      );
    }
  };

  // =====================================================
  // FORMAT CHIT VALUE
  // =====================================================

  const formatChitValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "-";
    }

    return `₹${Number(
      value
    ).toLocaleString("en-IN")}`;
  };

  return (
    <div className="dashboard">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

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
          <span>
                            !
          </span>
        </div>

      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="main-content">

        <div className="procedure-page">

          {/* PAGE HEADER */}

          <div className="procedure-header">

            <div>
              <h1>
                New Chit
              </h1>

              <p>
                Create and manage new chit entries
              </p>
            </div>

            <div className="procedure-title-icon">
              <FaClipboardList />
            </div>

          </div>

          {/* =================================================
              FORM CARD
          ================================================= */}

          <div className="procedure-card">

            <div className="card-heading">

              <div className="heading-icon">
                <FaClipboardList />
              </div>

              <div>

                <h2>
                  {editingId
                    ? "Edit New Chit"
                    : "New Chit"}
                </h2>

                <p>
                  {editingId
                    ? "Update the customer new chit details below"
                    : "Enter the customer new chit details below"}
                </p>

              </div>



            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>

              {/* =================================================
                  ROW 1
              ================================================= */}

              <div className="form-grid">



                {/* DATE */}

                <div className="form-group">

                  <label>
                    <FaCalendarAlt />
                    Date
                  </label>

                  <input
                    type="date"
                    name="joinedDate"
                    value={
                      formData.joinedDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

                {/* BRANCH */}

                <div className="form-group">

                  <label>
                    <FaBuilding />
                    Branch
                  </label>

                  <select
                    name="branch"
                    value={
                      formData.branch
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Branch
                    </option>

                    {branches.map(
                      (
                        branch,
                        index
                      ) => (
                        <option
                          key={`${branch}-${index}`}
                          value={branch}
                        >
                          {branch}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* STAFF */}



                <div className="form-group">

                  <label>
                    <FaUser />
                    Staff Name
                  </label>

                  <select
                    name="staffName"
                    value={



                      formData.staffName
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Staff
                    </option>

                    {staff.map(
                      (
                        name,
                        index
                      ) => (
                        <option
                          key={`${name}-${index}`}
                          value={name}
                        >
                          {name}
                        </option>
                      )
                    )}

                  </select>

                </div>

                {/* CUSTOMER */}

                <div className="form-group">

                  <label>
                    <FaUsers />
                    Customer Name
                  </label>

                  <input
                    type="text"
                    name="customerName"
                    value={
                      formData.customerName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter customer name"
                    required
                  />

                </div>

              </div>

              {/* =================================================
                  ROW 2
              ================================================= */}

              <div className="form-grid">

                {/* CHIT VALUE */}

                <div className="form-group">
                  <label>



                    <FaMoneyBillWave />
                    Chit Value
                  </label>

                  <select
                    name="chitValue"
                    value={
                      formData.chitValue
                    }
                    onChange={
                      handleChange



                    }
                    required
                  >

                    <option value="">
                      Select Chit Value
                    </option>

                    {chitValues.map(
                      (item) => {

                        const value =
                          Number(
                            item.chit_value
                          );

                        return (
                          <option
                            key={
                              item.id ||
                              value
                            }
                            value={value}
                          >
                            {formatChitValue(
                              value
                            )}
                          </option>
                        );
                      }
                    )}

                  </select>

                </div>

                {/* KEY LEVER */}

                <div className="form-group">

                  <label>
                    <FaKey />
                    Key Lever
                  </label>

                  <select
                    name="keyLever"
                    value={
                      formData.keyLever
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Key Lever
                    </option>

                    <option value="Savings">
                      Savings
                    </option>

                    <option value="Comparatively good from others">
                      Comparatively good from others



                    </option>

                    <option value="New">
                      New
                    </option>

                    <option value="Trust in Employess">
                      Trust in Employess
                    </option>

                    <option value="In My Home Town">
                      In My Home Town



                    </option>

                    <option value="Delivery at correct time">
                      Delivery at correct time
                    </option>

                    <option value="Fixed Chit">
                      Fixed Chit
                    </option>

                    <option value="Certified Company">
                      Certified Company
                    </option>

                    <option value="Security for Money">
                      Security for Money
                    </option>

                    <option value="Others">
                      Others
                    </option>

                  </select>

                </div>

                {/* FOLLOW UP */}

                <div className="form-group">

                  <label>
                    <FaRedo />
                    No. of Follow-up
                  </label>

                  <select
                    name="followUp"
                    value={
                      formData.followUp
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Follow-up
                    </option>

                    {Array.from(
                      { length: 11 },
                      (_, index) => (
                        <option
                          key={index}
                          value={index}
                        >
                          {index}
                        </option>
                      )
                    )}

                  </select>

                </div>
              </div>



              {/* =================================================
                  ROW 3
              ================================================= */}

              <div className="form-grid">

                {/* DUE DAY */}

                <div className="form-group">



                  <label>
                    <FaCalendarAlt />
                    Due Day
                  </label>

                  <select
                    name="dueDay"
                    value={
                      formData.dueDay
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Due Day
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

                {/* PAY MODE */}

                <div className="form-group">

                  <label>
                    <FaCreditCard />
                    Pay Mode
                  </label>

                  <select
                    name="payMode"
                    value={
                      formData.payMode
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Pay Mode
                    </option>
                    <option value="Cash">



                      Cash
                    </option>

                    <option value="UPI">
                      UPI
                    </option>

                    <option value="Bank Transfer">
                      Bank Transfer
                    </option>



                    <option value="Cheque">
                      Cheque
                    </option>

                    <option value="Field">
                      Field
                    </option>

                  </select>

                </div>

                {/* COLLECTION TYPE */}

                <div className="form-group">

                  <label>
                    <FaTags />
                    Collection Type
                  </label>

                  <select
                    name="collectionType"
                    value={
                      formData.collectionType
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >

                    <option value="">
                      Select Collection Type
                    </option>

                    <option value="Daily">
                      Daily
                    </option>

                    <option value="Weekly">
                      Weekly
                    </option>

                    <option value="Monthly">
                      Monthly
                    </option>

                    <option value="Other">
                      Other
                    </option>

                  </select>

                </div>

              </div>

              {/* REMARKS */}

              <div className="form-group remarks-group">

                <label>
                  <FaCommentAlt />
                  Remarks
                </label>



                <textarea
                  name="remarks"
                  value={
                    formData.remarks
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Enter remarks"
                  rows="4"
                />



              </div>

              {/* ACTION BUTTONS */}

              <div className="form-actions">

                <button
                  type="button"
                  className="reset-button"
                  onClick={
                    handleReset
                  }
                >

                  <FaTimes />

                  {editingId
                    ? "Cancel Edit"
                    : "Clear"}

                </button>

                <button
                  type="submit"
                  className="save-button"
                >

                  {editingId ? (
                    <FaEdit />
                  ) : (
                    <FaSave />
                  )}

                  {editingId
                    ? "Update New Chit"
                    : "Save New Chit"}

                </button>

              </div>

            </form>

          </div>
                    {/* =================================================
              SAVED NEW CHITS
          ================================================= */}

          <div className="procedure-card">

            <div className="card-heading">

              <div className="heading-icon">
                <FaDatabase />
              </div>

              <div>

                <h2>
                  Saved New Chits
                </h2>

                <p>
                  View and manage all new chit entries
                </p>
              </div>



              <button
                type="button"
                className="refresh-button"
                onClick={
                  fetchProcedures
                }
              >
                <FaSyncAlt />
                Refresh



              </button>

            </div>

            {/* =================================================
                TABLE
            ================================================= */}

            <div className="procedure-table-wrapper">

              {loading ? (

                <div className="loading-message">
                  Loading new chits...
                </div>

              ) : procedures.length === 0 ? (

                <div className="empty-message">
                  No new chit entries found.
                </div>

              ) : (

                <table className="procedure-table">

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



                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {procedures.map(
                      (
                        procedure,
                        index
                      ) => (

                        <tr
                          key={
                            procedure.id
                          }
                        >

                          {/* S.NO */}

                          <td>
                            {index + 1}
                          </td>

                          {/* DATE */}

                          <td>
                            {procedure.joinedDate
                              ? String(
                                  procedure.joinedDate
                                ).slice(
                                  0,
                                  10
                                )
                              : "-"}
                          </td>

                          {/* BRANCH */}

                          <td>
                            {procedure.branch ||
                              "-"}
                          </td>

                          {/* STAFF */}

                          <td>
                            {procedure.staffName ||
                              "-"}
                          </td>

                          {/* CUSTOMER */}

                          <td>
                            {procedure.customerName ||
                              "-"}
                          </td>

                          {/* CHIT VALUE */}

                          <td>
                            {formatChitValue(



                              procedure.chitValue
                            )}
                          </td>

                          {/* KEY LEVER */}

                          <td>
                            {procedure.keyLever ||
                              "-"}
                          </td>

                          {/* FOLLOW UP */}



                          <td>
                            {procedure.followUp !==
                              null &&
                            procedure.followUp !==
                              undefined &&
                            procedure.followUp !==
                              ""
                              ? procedure.followUp
                              : "-"}
                          </td>

                          {/* DUE DAY */}

                          <td>
                            {procedure.dueDay !==
                              null &&
                            procedure.dueDay !==
                              undefined &&
                            procedure.dueDay !==
                              ""
                              ? procedure.dueDay
                              : "-"}
                          </td>

                          {/* PAY MODE */}

                          <td>
                            {procedure.payMode ||
                              "-"}
                          </td>

                          {/* COLLECTION TYPE */}

                          <td>
                            {procedure.collectionType ||
                              "-"}
                          </td>

                          {/* REMARKS */}

                          <td>
                            {procedure.remarks ||
                              "-"}
                          </td>

                          {/* ACTION */}

                          <td>

                            <div className="action-buttons">

                              <button
                                type="button"
                                className="edit-button"
                                onClick={() =>
                                  handleEdit(
                                    procedure
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
                                    procedure.id
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

              )}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default NewChit;