import React, { useEffect, useState } from "react";

import {
  FaClipboardList,
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
} from "react-icons/fa";

import "./Procedure.css";


const API_URL =
  "https://seyal-chits-backend.onrender.com/api/procedures";


function Procedure() {

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState({
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
  // PROCEDURES LIST
  // =====================================================

  const [procedures, setProcedures] = useState([]);

  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(false);


  // =====================================================
  // RESET FORM
  // =====================================================

  const handleReset = () => {

    setFormData({
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

    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =====================================================
  // FETCH ALL PROCEDURES
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

      setProcedures(result.data || []);

    } catch (error) {

      console.error(
        "Procedure Fetch Error:",
        error
      );

      alert(
        "Unable to load procedures. Please check backend."
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOAD PROCEDURES ON PAGE LOAD
  // =====================================================

  useEffect(() => {

    fetchProcedures();

  }, []);


  // =====================================================
  // SAVE / UPDATE PROCEDURE
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


      const response = await fetch(
        url,
        {
          method: method,

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(formData),
        }
      );


      const result = await response.json();


      if (!response.ok) {

        alert(
          result.message ||
          (
            isEditing
              ? "Failed to update procedure"
              : "Failed to save procedure"
          )
        );

        return;
      }


      if (isEditing) {

        alert(
          "Procedure updated successfully!"
        );

      } else {

        alert(
          "Procedure saved successfully!"
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
  // EDIT PROCEDURE
  // =====================================================

  const handleEdit = (procedure) => {

    setEditingId(procedure.id);

    setFormData({
      branch: procedure.branch || "",
      staffName: procedure.staffName || "",
      customerName: procedure.customerName || "",
      chitValue:
        procedure.chitValue !== null &&
        procedure.chitValue !== undefined
          ? String(procedure.chitValue)
          : "",
      keyLever: procedure.keyLever || "",
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
      payMode: procedure.payMode || "",
      collectionType:
        procedure.collectionType || "",
      remarks: procedure.remarks || "",
    });


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  };


  // =====================================================
  // DELETE PROCEDURE
  // =====================================================

  const handleDelete = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this procedure?"
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


      const result = await response.json();


      if (!response.ok) {

        alert(
          result.message ||
          "Failed to delete procedure"
        );

        return;
      }


      alert(
        "Procedure deleted successfully!"
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

    return `₹${Number(value).toLocaleString("en-IN")}`;

  };


  return (

    <div className="procedure-page">


      {/* =================================================
          PAGE HEADER
      ================================================= */}

      <div className="procedure-header">

        <div>

          <h1>
            Procedure
          </h1>

          <p>
            Create and manage procedure entries
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


        {/* CARD HEADING */}

        <div className="card-heading">

          <div className="heading-icon">

            <FaClipboardList />

          </div>


          <div>

            <h2>
              {editingId
                ? "Edit Procedure"
                : "New Procedure"}
            </h2>

            <p>
              {editingId
                ? "Update the customer procedure details below"
                : "Enter the customer procedure details below"}
            </p>

          </div>

        </div>



        {/* =================================================
            FORM
        ================================================= */}

        <form onSubmit={handleSubmit}>


          {/* =================================================
              ROW 1
          ================================================= */}

          <div className="form-grid">


            {/* BRANCH */}

            <div className="form-group">

              <label>

                <FaBuilding />

                Branch

              </label>


              <select
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Branch
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



            {/* STAFF */}

            <div className="form-group">

              <label>

                <FaUser />

                Staff Name

              </label>


              <select
                name="staffName"
                value={formData.staffName}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Staff
                </option>

                <option value="Thiyagarajan">
                  Thiyagarajan
                </option>

                <option value="Renugadevi">
                  Renugadevi
                </option>

                <option value="Prathap">
                  Prathap
                </option>

                <option value="Venkateshan">
                  Venkateshan
                </option>

             <option value="Uma Devi">
                  Uma Devi
                </option>

            <option value="Rathinam">
                  Rathinam
                </option>

           <option value="Bharani">
                  Bharani
                </option>
                
                 <option value="Rani">
                  Rani
                </option>

                 <option value="Loganayaki">
                  Loganayaki
                </option>
                
                 <option value="Chandralekha">
                  Chandralekha
                </option>
                
                 <option value="ChinnaSamy L">
                  Chinnasamy L
                </option>
                 
 <option value="Muthulakshmi A">
                  Muthulakshmi A
                </option>
 <option value="Agalya">
                  Agalya
                </option>

                 <option value="Tamizharasi M">
                  Tamizharasi M
                </option>

                 <option value="Ruckmani">
                  Ruckmani
                </option>

                 <option value="Devika">
                  Devika
                </option>

 <option value="Rajalakshmi K">
                  Rajalakshmi K
                </option>
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
                value={formData.customerName}
                onChange={handleChange}
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
                value={formData.chitValue}
                onChange={handleChange}
                required
              >

                <option value="">
                  Select Chit Value
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

                <option value="1000000">
                  ₹10,00,000
                </option>

         <option value="2git add src/pages/Procedure.jsx src/pages/Reports.jsx000000">
                  ₹20,00,000
                </option>  
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
                value={formData.keyLever}
                onChange={handleChange}
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
                value={formData.followUp}
                onChange={handleChange}
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
                value={formData.dueDay}
                onChange={handleChange}
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
                value={formData.payMode}
                onChange={handleChange}
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
                value={formData.collectionType}
                onChange={handleChange}
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



          {/* =================================================
              REMARKS
          ================================================= */}

          <div className="form-group remarks-group">

            <label>

              <FaCommentAlt />

              Remarks

            </label>


            <textarea
              name="remarks"
              value={formData.remarks}
              onChange={handleChange}
              placeholder="Enter remarks"
              rows="4"
            />

          </div>



          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="form-actions">


            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
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

              {editingId
                ? <FaEdit />
                : <FaSave />}

              {editingId
                ? "Update Procedure"
                : "Save Procedure"}

            </button>


          </div>


        </form>


      </div>



      {/* =====================================================
          SAVED PROCEDURES
      ===================================================== */}

      <div
        className="procedure-card"
        style={{
          marginTop: "24px",
        }}
      >

        <div className="card-heading">

          <div className="heading-icon">

            <FaClipboardList />

          </div>


          <div>

            <h2>
              Saved Procedures
            </h2>

            <p>
              View, edit and delete procedure entries
            </p>

          </div>


          <button
            type="button"
            onClick={fetchProcedures}
            title="Refresh"
            style={{
              marginLeft: "auto",
              border: "none",
              background: "#f5f7fa",
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d9a400",
              fontSize: "17px",
            }}
          >

            <FaSyncAlt />

          </button>

        </div>



        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div
            style={{
              padding: "30px",
              textAlign: "center",
              color: "#718096",
            }}
          >

            Loading procedures...

          </div>

        )}



        {/* =================================================
            NO DATA
        ================================================= */}

        {!loading &&
          procedures.length === 0 && (

            <div
              style={{
                padding: "35px",
                textAlign: "center",
                color: "#718096",
              }}
            >

              No procedures found.

            </div>

          )}



        {/* =================================================
            PROCEDURE TABLE
        ================================================= */}

        {!loading &&
          procedures.length > 0 && (

            <div
              style={{
                width: "100%",
                overflowX: "auto",
                marginTop: "10px",
              }}
            >

              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  minWidth: "1050px",
                }}
              >

                <thead>

                  <tr
                    style={{
                      background: "#f8fafc",
                    }}
                  >

                    <th style={tableHeaderStyle}>
                      S.No
                    </th>

                    <th style={tableHeaderStyle}>
                      Branch
                    </th>

                    <th style={tableHeaderStyle}>
                      Staff
                    </th>

                    <th style={tableHeaderStyle}>
                      Customer
                    </th>

                    <th style={tableHeaderStyle}>
                      Chit Value
                    </th>

                    <th style={tableHeaderStyle}>
                      Follow-up
                    </th>

                    <th style={tableHeaderStyle}>
                      Due Day
                    </th>

                    <th style={tableHeaderStyle}>
                      Pay Mode
                    </th>

                    <th style={tableHeaderStyle}>
                      Collection
                    </th>

                    <th style={tableHeaderStyle}>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {procedures.map(
                    (procedure, index) => (

                      <tr
                        key={procedure.id}
                        style={{
                          borderBottom:
                            "1px solid #edf2f7",
                        }}
                      >

                        <td style={tableCellStyle}>
                          {index + 1}
                        </td>

                        <td style={tableCellStyle}>
                          {procedure.branch}
                        </td>

                        <td style={tableCellStyle}>
                          {procedure.staffName}
                        </td>

                        <td
                          style={{
                            ...tableCellStyle,
                            fontWeight: "600",
                            color: "#17324d",
                          }}
                        >
                          {procedure.customerName}
                        </td>

                        <td style={tableCellStyle}>
                          {formatChitValue(
                            procedure.chitValue
                          )}
                        </td>

                        <td style={tableCellStyle}>
                          {procedure.followUp}
                        </td>

                        <td style={tableCellStyle}>
                          {procedure.dueDay}
                        </td>

                        <td style={tableCellStyle}>
                          {procedure.payMode}
                        </td>

                        <td style={tableCellStyle}>
                          {procedure.collectionType}
                        </td>


                        {/* ACTIONS */}

                        <td
                          style={{
                            ...tableCellStyle,
                            whiteSpace: "nowrap",
                          }}
                        >

                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                procedure
                              )
                            }
                            title="Edit"
                            style={{
                              border: "none",
                              background:
                                "#fff7df",
                              color: "#d9a400",
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              marginRight: "8px",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >

                            <FaEdit />

                          </button>


                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                procedure.id
                              )
                            }
                            title="Delete"
                            style={{
                              border: "none",
                              background:
                                "#fff0f0",
                              color: "#dc3545",
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              cursor: "pointer",
                              display:
                                "inline-flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                            }}
                          >

                            <FaTrash />

                          </button>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>


    </div>

  );

}


// =====================================================
// TABLE STYLES
// =====================================================

const tableHeaderStyle = {
  padding: "14px 12px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: "700",
  color: "#17324d",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};


const tableCellStyle = {
  padding: "14px 12px",
  fontSize: "13px",
  color: "#4a5568",
  whiteSpace: "nowrap",
};


export default Procedure;