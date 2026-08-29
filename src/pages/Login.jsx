import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
  FaShieldAlt,
  FaChartLine,
} from "react-icons/fa";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    setError("");

    if (username === "chits" && password === "1234") {
navigate("/dashboard");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="login-page">

      {/* ================= LEFT BRAND PANEL ================= */}

      <div className="login-brand">

        <div className="brand-glow glow-one"></div>
        <div className="brand-glow glow-two"></div>

        <div className="brand-content">

          {/* Logo */}

          <div className="brand-logo-wrap">
            <img
              src="/logo.jpg.jpg"
              alt="SEYAL CHITS"
              className="brand-logo"
            />
          </div>

          <div className="brand-name">
            SEYAL <span>CHITS</span>
          </div>

          <div className="brand-line"></div>

          <h1>
            சேமிப்பே
            <br />
            <span>மாற்றம்!</span>
          </h1>

          <p className="brand-description">
            Smart. Secure. Simple.
            <br />
            Manage your chit operations with ease.
          </p>


          {/* Brand Features */}

          <div className="brand-features">

            <div className="brand-feature">
              <div className="feature-icon">
                <FaShieldAlt />
              </div>

              <div>
                <strong>Secure Management</strong>
                <span>Reliable & organized records</span>
              </div>
            </div>


            <div className="brand-feature">
              <div className="feature-icon">
                <FaChartLine />
              </div>

              <div>
                <strong>Smart Reports</strong>
                <span>Track your business effortlessly</span>
              </div>
            </div>

          </div>

        </div>


        <div className="brand-bottom">
          © 2025 SEYAL CHITS
        </div>

      </div>


      {/* ================= RIGHT LOGIN PANEL ================= */}

      <div className="login-side">

        <div className="login-box">

          {/* Small logo for mobile */}

          <div className="mobile-logo">
            <img
              src="/logo.jpg"
              alt="SEYAL CHITS"
            />
          </div>


          {/* Heading */}

          <div className="login-heading">

            <span className="welcome-text">
              WELCOME BACK
            </span>

            <h2>
              Sign in to your
              <span> account</span>
            </h2>

            <p>
              Enter your credentials to continue
            </p>

          </div>


          {/* ================= FORM ================= */}

          <form onSubmit={handleLogin}>

            {/* Username */}

            <div className="login-field">

              <label>
                Username
              </label>

              <div className="login-input">

                <FaUser className="field-icon" />

                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />

              </div>

            </div>


            {/* Password */}

            <div className="login-field">

              <div className="password-label">

                <label>
                  Password
                </label>

              </div>

              <div className="login-input">

                <FaLock className="field-icon" />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  required
                />

                <button
                  type="button"
                  className="eye-button"
                  onClick={() =>
                    setShowPassword(!showPassword)
                  }
                >
                  {showPassword ? (
                    <FaEyeSlash />
                  ) : (
                    <FaEye />
                  )}
                </button>

              </div>

            </div>


            {/* Error */}

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}


            {/* Login Button */}

            <button
              type="submit"
              className="login-submit"
            >

              <span>
                Sign In
              </span>

              <div className="button-arrow">
                <FaArrowRight />
              </div>

            </button>

          </form>


          {/* Footer */}

          <div className="login-secure">

            <FaShieldAlt />

            <span>
              Secure access to SEYAL CHITS
            </span>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;