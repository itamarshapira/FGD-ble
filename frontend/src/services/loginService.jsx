/**
 ** services/loginService.jsx
 *
 * Purpose:
 *  - Handle device login/auth over BLE.
 *  - Write a *string* passkey to a WRITE characteristic.
 *  - Read "Authorization Status" (01 = Authorized, 02 = Blocked, 00 = Not authorized).
 *  - Read "Remaining Attempts".
 *
 * Usage pattern:
 *  - Same as mediaControl.jsx: get an existing connected GATT server and call these helpers.

 */
import { gattServer } from "./bleService"; // <-- adjust if your project uses a getter

// ---------- 1) UUIDs from your screenshot ----------
export const authServiceUUID = "ab896745-2310-cdab-8947-6f5e4d3c2b1a"; //Prime UUID
export const passkeyWriteCharUUID = "ab896745-2311-cdab-8947-6f5e4d3c2b1a"; // WRITE (string)
export const authStatusCharUUID = "ab896745-2321-cdab-8947-6f5e4d3c2b1a"; // READ  (00/01/02)
export const remainingAttemptsCharUUID = "ab896745-2331-cdab-8947-6f5e4d3c2b1a"; // READ  (e.g., 03)

/* ---------- 2) Access the connected GATT server ----------
 *     import { getConnectedServer } from "./bleService";
 *     const getServer = getConnectedServer;
 */

const getServer = () => gattServer; // <-- keep identical to mediaControl.jsx

// Small helper: fetch the auth service once per call
async function getAuthService() {
  const server = getServer();
  if (!server) {
    console.log("[loginService] No connected device. Connect first.");
    return null;
  }
  try {
    return await server.getPrimaryService(authServiceUUID);
  } catch (e) {
    console.error("[loginService] Cannot get auth service:", e);
    return null;
  }
}

/**
 ** writePasskey(passkey: string): Promise<boolean>
 *
 * - Encodes the passkey string to bytes (UTF-8) and writes it to the Passkey characteristic.
 * - Firmware notes:
 *   * If the device expects fixed length or specific encoding, adjust here (pad/trim/ASCII).
 */
export async function writePasskey(passkey) {
  const service = await getAuthService();
  if (!service) return false;

  try {
    const char = await service.getCharacteristic(passkeyWriteCharUUID);

    // Encode string → Uint8Array
    // If your firmware expects ASCII only, TextEncoder is still fine for ASCII.
    const encoder = new TextEncoder(); // UTF-8
    const data = encoder.encode(passkey);

    // WRITE (your char shows "Properties: WRITE")
    await char.writeValue(data);

    console.log("[loginService] Passkey written (length:", data.length, ")");
    return true;
  } catch (e) {
    console.error("[loginService] writePasskey failed:", e);
    return false;
  }
}

/**
 ** readAuthorizationStatus(): Promise<{ code:number, authorized:boolean, blocked:boolean }>
 *
 * Returns a structured result so the UI can show precise messages.
 *  - code: 0x00 = Not authorized, 0x01 = Authorized, 0x02 = Blocked
 */
export async function readAuthorizationStatus() {
  const service = await getAuthService();
  if (!service) return { code: 0, authorized: false, blocked: false };

  try {
    const char = await service.getCharacteristic(authStatusCharUUID);
    const value = await char.readValue();

    // Single byte flag
    const code = value.getUint8(0); // 0x00/0x01/0x02
    console.log("[loginService] Raw auth status code:", code);

    const result = {
      code,
      authorized: code === 0x01,
      blocked: code === 0x02,
    };

    console.log("[loginService] Authorization status:", result);
    return result;
  } catch (e) {
    console.error("[loginService] readAuthorizationStatus failed:", e);
    return { code: 0, authorized: false, blocked: false };
  }
}

/**
 ** readRemainingAttempts(): Promise<number>
 *
 * Reads the counter so we can display "X attempts left" on the Login UI.
 */
export async function readRemainingAttempts() {
  const service = await getAuthService();
  if (!service) return 0;

  try {
    const char = await service.getCharacteristic(remainingAttemptsCharUUID);
    const value = await char.readValue();
    const attempts = value.getUint8(0);
    console.log("[loginService] Remaining attempts:", attempts);
    return attempts;
  } catch (e) {
    console.error("[loginService] readRemainingAttempts failed:", e);
    return 0;
  }
}

// Dev-only global handle so we can test from the browser console without import().
// Remove or guard behind NODE_ENV when you're done.
if (typeof window !== "undefined") {
  window.loginService = {
    writePasskey,
    readAuthorizationStatus,
    readRemainingAttempts,
  };
  // Now in the console you can do:
  // await window.loginService.readAuthorizationStatus()
  // await window.loginService.writePasskey("123456")
  // await window.loginService.readAuthorizationStatus()
  // await window.loginService.readRemainingAttempts()
}
