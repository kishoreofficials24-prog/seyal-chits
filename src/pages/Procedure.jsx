import React, { useState } from "react";
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
} from "react-icons/fa";

import "./Procedure.css";


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

  };


  // =====================================================
  // SAVE PROCEDURE
  // =====================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const response = await fetch(
        "http://localhost:5000/api/procedures",
        {
          method: "POST",

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
          "Failed to save procedure"
        );

        return;
      }


      alert(
        "Procedure saved successfully!"
      );


      handleReset();


    } catch (error) {

      console.error(
        "Save Error:",
        error
      );

      alert(
        "Unable to connect to server. Please check backend."
      );

    }

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
              New Procedure
            </h2>

            <p>
              Enter the customer procedure details below
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

               < option value="Delivery at correct time">
                  Delivery at correct time
                </option>
                
                <option value="Fixed Chit">
                  Fixed Chit
                </option>
                
                <option value="Certified Company">
                  Certified Company
                </option>

                <option value="Fixed Chit">
                  Fixed Chit
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


            {/* =================================================
                DUE DAY
            ================================================= */}

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


            {/* CLEAR */}

            <button
              type="button"
              className="reset-button"
              onClick={handleReset}
            >

              <FaTimes />

              Clear

            </button>



            {/* SAVE */}

            <button
              type="submit"
              className="save-button"
            >

              <FaSave />

              Save Procedure

            </button>


          </div>


        </form>

      </div>

    </div>

  );

}


export default Procedure;