import React, { useState } from "react";
import "./Login.css";

// BLE helpers
import { writePasskey } from "../../services/loginService";

export default function Login({ setIsAuthenticated }) {
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Write passkey to the device
      const ok = await writePasskey(passkey.trim());

      if (!ok) {
        setErrorMsg("Failed to write passkey.");
        return;
      }

      // 2. Success path → just unlock UI
      console.log("[Login] Passkey written. Waiting for Service Changed...");
      await new Promise((resolve) => setTimeout(resolve, 2000)); //* wait a bit before unlocking UI (ideally, wait for Service Changed event)
      setIsAuthenticated(true);

      // ⚠️ Note: actual confirmation of success comes from Service Changed
      // subscription inside bleService. If passkey is wrong, no new services appear.
    } catch (err) {
      console.error("[Login] error:", err);
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-card">
      <h2>Device Login</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="password"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          placeholder="Passkey"
          className="login-input"
          disabled={loading}
          required
        />
        <button type="submit" className="login-btn" disabled={loading}>
          {loading ? "Checking..." : "Sign in"}
        </button>
      </form>

      {errorMsg && <div className="login-error">{errorMsg}</div>}
    </div>
  );
}
