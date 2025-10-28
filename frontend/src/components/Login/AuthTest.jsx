import React from "react";
// Dev-only helper to manually poke the login service from the UI.
// Remove this file after testing.
import {
  writePasskey,
  readAuthorizationStatus,
  readRemainingAttempts,
} from "../../services/loginService";

export default function AuthTest() {
  // Runs a quick sequence: read -> write -> read -> attempts
  const handleTest = async () => {
    try {
      console.log("Status BEFORE:", await readAuthorizationStatus());
      console.log("Write passkey:", await writePasskey("123456")); // <-- change to your test key
      console.log("Status AFTER:", await readAuthorizationStatus());
      console.log("Attempts left:", await readRemainingAttempts());
    } catch (e) {
      console.error("Auth test failed:", e);
    }
  };

  return (
    <div style={{ padding: 12, border: "1px dashed #888", margin: 12 }}>
      <button onClick={handleTest}>Run Auth Test</button>
      <span style={{ marginLeft: 8, opacity: 0.8 }}>
        (Dev-only — remove after testing)
      </span>
    </div>
  );
}
