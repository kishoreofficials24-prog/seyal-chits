
import React, { useEffect, useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaCog,
  FaUsers,
  FaBuilding,
  FaMoneyBillWave,
  FaPlus,
  FaEdit,
  FaTrash,
  FaSyncAlt,
  FaSave,
  FaTimes,
  FaHome,
  FaClipboardList,
  FaDatabase,
  FaListOl,
  FaChartBar,
} from "react-icons/fa";
import "./Settings.css";

const API = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const emptyForms = {
  staff: { name: "" },
  branch: { name: "" },
  chit: { chitValue: "", totalMonths: 20 },
};

function Settings() {
  const [activeTab, setActiveTab] = useState("staff");
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [chitValues, setChitValues] = useState([]);

  const [forms, setForms] = useState(emptyForms);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    try {
      setLoading(true);

      const [staffRes, branchRes, chitRes] = await Promise.all([
        fetch(`${API}/settings/staff`),
        fetch(`${API}/settings/branches`),
        fetch(`${API}/settings/chit-values`),
      ]);

      const [staffJson, branchJson, chitJson] = await Promise.all([
        staffRes.json(),
        branchRes.json(),
        chitRes.json(),
      ]);

      if (!staffRes.ok) throw new Error(staffJson.message || "Failed to load staff");
      if (!branchRes.ok) throw new Error(branchJson.message || "Failed to load branches");
      if (!chitRes.ok) throw new Error(chitJson.message || "Failed to load chit values");

      setStaff(staffJson.data || []);
      setBranches(branchJson.data || []);
      setChitValues(chitJson.data || []);
    } catch (error) {
      console.error("Settings load error:", error);
      alert(error.message || "Unable to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const resetForm = () => {
    setForms(emptyForms);
    setEditing(null);
  };

  const handleTextChange = (section, field, value) => {
    setForms((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const startEdit = (section, item) => {
    setEditing({ section, id: item.id });

    if (section === "staff") {
      setForms((prev) => ({
        ...prev,
        staff: { name: item.name || item.staff_name || "" },
      }));
    }

    if (section === "branch") {



      setForms((prev) => ({
        ...prev,
        branch: { name: item.name || item.branch_name || "" },
      }));
    }

    if (section === "chit") {
      setForms((prev) => ({
        ...prev,
        chit: {
          chitValue: item.chit_value ?? "",
          totalMonths: item.total_months ?? 20,
        },
      }));
    }

    setActiveTab(section);
  };

  const saveSection = async (section) => {
    try {
      setSaving(true);

      let payload;
      let endpoint;

      if (section === "staff") {
        if (!forms.staff.name.trim()) {
          alert("Enter staff name");
          return;
        }
        payload = { name: forms.staff.name.trim() };
        endpoint = "staff";
      }

      if (section === "branch") {
        if (!forms.branch.name.trim()) {
          alert("Enter branch name");
          return;
        }
        payload = { name: forms.branch.name.trim() };
        endpoint = "branches";
      }

      if (section === "chit") {
        const value = Number(forms.chit.chitValue);
        const months = Number(forms.chit.totalMonths);

        if (!value || value <= 0) {
          alert("Enter a valid chit value");
          return;
        }

        if (!months || months <= 0) {
          alert("Enter valid total months");
          return;
        }

        payload = {
          chitValue: value,
          totalMonths: months,
        };
        endpoint = "chit-values";
      }

      const isEdit = editing?.section === section;
      const url = isEdit
        ? `${API}/settings/${endpoint}/${editing.id}`
        : `${API}/settings/${endpoint}`;

      const response = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save");
      }

      alert(isEdit ? "Updated successfully!" : "Added successfully!");
      resetForm();
      await loadSettings();
    } catch (error) {
      console.error("Settings save error:", error);
      alert(error.message || "Unable to save");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (section, id, label) => {
    if (!window.confirm(`Delete ${label}?`)) return;

    try {
      const endpoint =
        section === "staff"
          ? "staff"
          : section === "branch"
          ? "branches"
          : "chit-values";



      const response = await fetch(`${API}/settings/${endpoint}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Delete failed");
      }

      alert("Deleted successfully!");
      if (editing?.section === section && editing?.id === id) {
        resetForm();
      }
      await loadSettings();
    } catch (error) {
      console.error("Settings delete error:", error);
      alert(error.message || "Unable to delete");
    }
  };

  const currentItems = useMemo(() => {
    if (activeTab === "staff") return staff;
    if (activeTab === "branch") return branches;
    return chitValues;
  }, [activeTab, staff, branches, chitValues]);

  const title =
    activeTab === "staff"
      ? "Staff Management"
      : activeTab === "branch"
      ? "Branch Management"
      : "Chit Value Management";

  return (
    <div className="settings-page">
      <aside className="settings-sidebar">
        <div className="settings-sidebar-logo-area">
          <img
            src="/logo.jpg.jpg"
            alt="SEYAL CHITS"
            className="settings-sidebar-logo"
          />
        </div>

        <nav className="settings-sidebar-menu">
          <NavLink to="/dashboard" className={({ isActive }) => `settings-menu-item ${isActive ? "active" : ""}`}>
            <FaHome />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/procedure" className={({ isActive }) => `settings-menu-item ${isActive ? "active" : ""}`}>
            <FaClipboardList />
            <span>New Chit</span>
          </NavLink>

          <NavLink to="/master" className={({ isActive }) => `settings-menu-item ${isActive ? "active" : ""}`}>
            <FaDatabase />
            <span>Master</span>
          </NavLink>

          <NavLink to="/payment-plan" className={({ isActive }) => `settings-menu-item ${isActive ? "active" : ""}`}>
            <FaListOl />
            <span>Payment Plan</span>
          </NavLink>

          <NavLink to="/payment" className={({ isActive }) => `settings-menu-item ${isActive ? "active" : ""}`}>
            <FaMoneyBillWave />
            <span>Payment</span>
          </NavLink>

          <NavLink to="/reports" className={({ isActive }) => `settings-menu-item ${isActive ? "active" : ""}`}>
            <FaChartBar />
            <span>Reports</span>
          </NavLink>

          <NavLink to="/settings" className={({ isActive }) => `settings-menu-item ${isActive ? "active" : ""}`}>
            <FaCog />
            <span>Settings</span>
          </NavLink>
        </nav>

        <div className="settings-sidebar-footer">
          <strong>SEYAL CHITS</strong>
          <span>■■■■■■■■ ■■■■■■■!</span>
        </div>
      </aside>

      <div className="settings-main-content">
      <div className="settings-header">
        <div className="settings-title">
          <div className="settings-title-icon">
            <FaCog />
          </div>
          <div>
            <h1>Settings</h1>
            <p>Manage the master data used throughout SEYAL CHITS.</p>
          </div>
        </div>

        <button
          type="button"
          className="settings-refresh-btn"
          onClick={loadSettings}
          disabled={loading}



        >
          <FaSyncAlt className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="settings-tabs">
        <button
          className={activeTab === "staff" ? "active" : ""}
          onClick={() => {
            resetForm();
            setActiveTab("staff");
          }}
        >
          <FaUsers />
          Staff
        </button>

        <button
          className={activeTab === "branch" ? "active" : ""}
          onClick={() => {
            resetForm();
            setActiveTab("branch");
          }}
        >
          <FaBuilding />
          Branch
        </button>

        <button
          className={activeTab === "chit" ? "active" : ""}
          onClick={() => {
            resetForm();
            setActiveTab("chit");
          }}
        >
          <FaMoneyBillWave />
          Chit Values
        </button>
      </div>

      <div className="settings-content">
        <div className="settings-form-card">
          <div className="settings-card-heading">
            <div>
              <h2>{editing ? `Edit ${title.replace(" Management", "")}` : `Add ${title.replace(" Management", "")}`}</h2>
              <p>Changes here will be available to the relevant pages automatically.</p>
            </div>
          </div>

          {activeTab === "staff" && (
            <div className="settings-form-row">
              <input
                type="text"
                placeholder="Enter staff name"
                value={forms.staff.name}
                onChange={(e) => handleTextChange("staff", "name", e.target.value)}
              />
            </div>
          )}

          {activeTab === "branch" && (
            <div className="settings-form-row">
              <input
                type="text"
                placeholder="Enter branch name"
                value={forms.branch.name}
                onChange={(e) => handleTextChange("branch", "name", e.target.value)}
              />
            </div>
          )}

          {activeTab === "chit" && (
            <div className="settings-form-grid">
              <input
                type="number"
                min="1"
                placeholder="Chit value"
                value={forms.chit.chitValue}
                onChange={(e) => handleTextChange("chit", "chitValue", e.target.value)}
              />

              <input
                type="number"
                min="1"
                placeholder="Total months"
                value={forms.chit.totalMonths}
                onChange={(e) => handleTextChange("chit", "totalMonths", e.target.value)}
              />
            </div>
          )}

          <div className="settings-form-actions">
            <button
              type="button"
              className="settings-save-btn"
              onClick={() => saveSection(activeTab)}
              disabled={saving}
            >
              <FaSave />
              {saving ? "Saving..." : editing ? "Update" : "Add"}
            </button>

            {editing && (
              <button



                type="button"
                className="settings-cancel-btn"
                onClick={resetForm}
              >
                <FaTimes />
                Cancel
              </button>
            )}
          </div>
        </div>

        <div className="settings-list-card">
          <div className="settings-list-heading">
            <div>
              <h2>{title}</h2>
              <span>{currentItems.length} item{currentItems.length === 1 ? "" : "s"}</span>
            </div>
          </div>

          {loading ? (
            <div className="settings-empty">Loading...</div>
          ) : currentItems.length === 0 ? (
            <div className="settings-empty">No records found.</div>
          ) : (
            <div className="settings-table-wrap">
              <table className="settings-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>
                      {activeTab === "staff"
                        ? "Staff Name"
                        : activeTab === "branch"
                        ? "Branch Name"
                        : "Chit Value"}
                    </th>
                    {activeTab === "chit" && <th>Total Months</th>}
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {currentItems.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>

                      <td>
                        {activeTab === "staff" &&
                          (item.name || item.staff_name)}

                        {activeTab === "branch" &&
                          (item.name || item.branch_name)}

                        {activeTab === "chit" &&
                          `■ ${Number(item.chit_value).toLocaleString("en-IN")}`}
                      </td>

                      {activeTab === "chit" && (
                        <td>{item.total_months}</td>
                      )}

                      <td>
                        <div className="settings-actions">
                          <button
                            type="button"
                            className="edit-btn"
                            onClick={() =>
                              startEdit(
                                activeTab,
                                item
                              )
                            }
                            title="Edit"
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            onClick={() =>
                              deleteItem(
                                activeTab,
                                item.id,
                                activeTab === "staff"
                                  ? item.name || item.staff_name
                                  : activeTab === "branch"
                                  ? item.name || item.branch_name
                                  : `■ ${Number(item.chit_value).toLocaleString("en-IN")}`
                              )
                            }
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>



      </div>
    </div>
  );
}

export default Settings;