import React, { useState } from "react"; //* Import React and useState for managing states
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"; //* Import FontAwesomeIcon for icons
import { faBluetooth } from "@fortawesome/free-brands-svg-icons"; //* Import Bluetooth icon
import { faBatteryFull } from "@fortawesome/free-solid-svg-icons"; //* Import Battery icon
import {
  connectToDevice,
  disconnectDevice,
  //readCharacteristic,
  readBatteryLevel,
} from "../../services/bleService"; //* Import BLE service functions
import "./Navbar.css"; //* Import Navbar-specific CSS for styling

/**
 * The Navbar component handles:
 * - Displaying a Bluetooth icon to connect/disconnect BLE devices.
 * - Showing the battery level of connected BLE devices.
 * - Managing connection state and triggering BLE functions on user actions.
 */
function Navbar() {
  const [isConnected, setIsConnected] = useState(false); //* Track if a BLE device is connected
  const [batteryLevel, setBatteryLevel] = useState("..."); //* Track the battery level of the connected device
  console.log(batteryLevel);

  /**
   * Handles Bluetooth icon clicks:
   * - If connected, it disconnects the device.
   * - If not connected, it attempts to connect and fetch the battery level.
   */
  const handleBluetoothClick = async () => {
    if (isConnected) {
      disconnectDevice(); //* Disconnect BLE device
      setIsConnected(false); //* Update state to reflect disconnection
    } else {
      const success = await connectToDevice(); //* Attempt to connect to a BLE device
      if (success) {
        setIsConnected(true); //* Update state to reflect successful connection

        // Read battery level from the BLE device
        const level = await readBatteryLevel();
        setBatteryLevel(level || "..."); //* Update battery level state
      }
    }
  };

  return (
    <div className="navbar">
      {/* Bluetooth icon with tooltip */}
      <div className="bluetooth-container">
        <FontAwesomeIcon
          icon={faBluetooth} //* Bluetooth icon
          className={`navbar-icon ${isConnected ? "connected" : ""}`} //* Add class when connected
          onClick={handleBluetoothClick} //* Handle clicks on the Bluetooth icon
        />
        <span className="navbar-tooltip">
          {isConnected ? "Touch to Disconnect BLE" : "Touch to Connect BLE"}{" "}
          {/* Dynamic tooltip */}
        </span>
      </div>

      {/* Display battery level */}
      <div className="battery-state">
        <FontAwesomeIcon icon={faBatteryFull} className="battery-icon" />{" "}
        {/* Battery icon */}
        <span className="battery-text">{batteryLevel}%</span>{" "}
        {/* Battery percentage */}
      </div>
    </div>
  );
}

export default Navbar;
