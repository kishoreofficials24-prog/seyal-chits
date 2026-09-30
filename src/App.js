import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Procedure from "./pages/Procedure";
import Master from "./pages/Chit Master";
import PaymentPlan from "./pages/Paymentplan";
import Payment from "./pages/Payment";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

/* REPORT PAGES */
import NormalChitReport from "./pages/NormalChitReport";
import PaymentPlanReport from "./pages/PaymentPlanReport";
import PaymentReport from "./pages/PaymentReport";
import CombinedReport from "./pages/CombinedReport";
import FutureChitReport from "./pages/FutureChitReport";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* =================================================
            LOGIN
        ================================================= */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* =================================================
            DASHBOARD
        ================================================= */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* =================================================
            NEW CHIT
        ================================================= */}
        <Route
          path="/procedure"
          element={<Procedure />}
        />

        {/* Keep /new-chit also working */}
        <Route
          path="/new-chit"
          element={<Procedure />}
        />

        {/* =================================================
            MASTER
        ================================================= */}
        <Route
          path="/master"
          element={<Master />}
        />

        {/* =================================================
            PAYMENT PLAN
        ================================================= */}
        <Route
          path="/payment-plan"
          element={<PaymentPlan />}
        />

        {/* =================================================
            PAYMENT
        ================================================= */}
        <Route
          path="/payment"
          element={<Payment />}
        />

        {/* =================================================
            REPORTS HOME
        ================================================= */}
        <Route
          path="/reports"
          element={<Reports />}
        />

        {/* =================================================
            REPORT 1
            NORMAL CHIT REPORT
        ================================================= */}
        <Route
          path="/reports/normal-chit"
          element={<NormalChitReport />}
        />

        {/* =================================================
            REPORT 2
            PAYMENT PLAN REPORT
        ================================================= */}
        <Route
          path="/reports/payment-plan"
          element={<PaymentPlanReport />}
        />

        {/* =================================================
            REPORT 3
            PAYMENT REPORT
        ================================================= */}
        <Route
          path="/reports/payment"
          element={<PaymentReport />}
        />

        {/* =================================================
            REPORT 4
            PLAN + PAYMENT REPORT
        ================================================= */}
        <Route
          path="/reports/combined"
          element={<CombinedReport />}
        />

        {/* =================================================
            REPORT 5
            FUTURE CHIT REPORT
        ================================================= */}
        <Route
          path="/reports/future-chit"
          element={<FutureChitReport />}
        />

        {/* =================================================
            SETTINGS
        ================================================= */}
        <Route
          path="/settings"
          element={<Settings />}
        />

        {/* =================================================
            UNKNOWN URL
        ================================================= */}
        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
