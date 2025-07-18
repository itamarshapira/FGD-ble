import React, { useState, useEffect } from "react";
import "./Tabs.css";
import Logo from "../Logo/Logo"; // Importing the Logo component
import { readDeviceInformation } from "../../services/bleService"; //* Import BLE service functions
import DeviceData from "../DeviceData/DeviceData";
import { readAlertStatus } from "../../services/bleService";
import { readEnvironmentalData } from "../../services/bleService";
import { readGenericAccess } from "../../services/bleService";
import { readDeviceSettings } from "../../services/bleService";
import { writeDeviceSetting } from "../../services/bleService";
import { selectedGasTypeUUID } from "../../services/bleService";
import {
  fullScaleUUID,
  alarmLevelUUID,
  warnLevelUUID,
  lowestLevelUUID,
  responseTimeUUID,
  blockDelayUUID,
} from "../../services/bleService";

/**
 * Tabs Component:
 * Dynamically renders tab buttons and their corresponding content
 * based on a predefined list of tabs.
 */
function Tabs() {
  // State to keep track of the currently active tab (default: "Wellcome")
  const [activeTab, setActiveTab] = useState("Welcome");

  const [deviceInfo, setDeviceInfo] = useState(null); // Store device information

  const [alertStatus, setAlertStatus] = useState(null); // store alert status

  const [environmentalData, setEnvironmentalData] = useState(null); // store Enviromental Sensing

  const [genericAccessInfo, setGenericAccessInfo] = useState(null); // store genericAccessInfo

  const [deviceSettings, setDeviceSettings] = useState(null); // store device settings

  const [selectedGasType, setSelectedGasType] = useState(0); // default to Methane
  const gasTypeLabel = (value) => {
    switch (value) {
      case 0:
        return "Methane";
      case 1:
        return "Propane";
      case 2:
        return "Butane";
      case 3:
        return "Hydrogen";
      default:
        return `Unknown (${value})`;
    }
  };

  // Handle writing selected gas type to the BLE device
  const handleWriteGasType = async () => {
    const success = await writeDeviceSetting(
      selectedGasTypeUUID,
      selectedGasType
    );
    if (success) {
      console.log("✅ Gas type updated!");

      //  re-fetch and sync again
      const updatedSettings = await readDeviceSettings();
      setDeviceSettings(updatedSettings);
    } else {
      console.log("❌ Failed to update gas type.");
    }
  };

  const [fullScale, setFullScale] = useState(0);
  const [alarmLevel, setAlarmLevel] = useState(0);
  const [warnLevel, setWarnLevel] = useState(0);
  const [lowestLevel, setLowestLevel] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [blockDelay, setBlockDelay] = useState(0);

  // *Fetch device information automatically when "Device Info" is selected
  useEffect(() => {
    if (activeTab === "Device Info") {
      async function fetchData() {
        // We can't use await directly inside useEffect. React requires us to put async code inside another function and then call it.
        const info = await readDeviceInformation(); // Read from BLE
        setDeviceInfo(info); // update deviceInfo
      }
      fetchData();
    }
  }, [activeTab]); // Runs every time activeTab changes

  // *fetch Alert Status
  useEffect(() => {
    if (activeTab === "Alert Status") {
      async function fetchAlert() {
        const status = await readAlertStatus();
        setAlertStatus(status);
        console.log(" Alert Status (test):", status);
      }
      fetchAlert();
    }
  }, [activeTab]);

  // *fetch environmentalData Status
  useEffect(() => {
    if (activeTab === "Environmental Sensing") {
      async function fetchEnvironmentalData() {
        const data = await readEnvironmentalData();
        setEnvironmentalData(data);
      }
      fetchEnvironmentalData();
    }
  }, [activeTab]);

  // *fetch generic acsses
  useEffect(() => {
    if (activeTab === "Generic Access") {
      readGenericAccess().then(setGenericAccessInfo);
    }
  }, [activeTab]);

  // *fetch Device settings
  useEffect(() => {
    if (activeTab === "Device Settings") {
      async function fetchSettings() {
        const settings = await readDeviceSettings(); // Read from BLE device
        setDeviceSettings(settings); // Store settings (all fields)
      }
      fetchSettings();
    }
  }, [activeTab]);

  // *Array of tabs: Each tab has a name and corresponding content
  const tabs = [
    { name: "Device Data", content: <DeviceData /> },
    {
      name: "Device Info",
      content: (
        <div>
          <h2>Device Information</h2>
          {deviceInfo ? ( //  Show device info if available
            <div className="device-details">
              <p>
                <strong>Manufacturer:</strong> {deviceInfo.manufacturerName}
              </p>
              <p>
                <strong>Model:</strong> {deviceInfo.modelNumber}
              </p>
              <p>
                <strong>System ID:</strong> {deviceInfo.systemID}
              </p>
            </div>
          ) : (
            // Else
            <p>Loading device info...</p> //  Show loading until data arrives
          )}
        </div>
      ),
    },
    {
      name: "Alert Status",
      content: (
        <div>
          <h2>Alert Notification Status</h2>
          {alertStatus === null ? (
            <p>Reading alert status...</p>
          ) : (
            <p>
              <strong>Status:</strong>{" "}
              {alertStatus === 0
                ? "All clear"
                : `Raw: 0x${alertStatus.toString(16).padStart(2, "0")}`}
            </p>
          )}
        </div>
      ),
    },
    {
      name: "Environmental Sensing",
      content: (
        <div>
          <h2>Environmental Sensing</h2>
          {environmentalData ? (
            <div className="environmental-details">
              <p>
                <strong>Methane Concentration:</strong>{" "}
                {environmentalData.methane} ppm
              </p>
              <p>
                <strong>LEL Status:</strong> {environmentalData.lelStatus}
              </p>
            </div>
          ) : (
            <p>Loading environmental data...</p>
          )}
        </div>
      ),
    },
    {
      name: "Generic Access",
      content: (
        <div>
          <h2>Generic Access</h2>
          {genericAccessInfo ? (
            <div>
              <p>
                <strong>Device Name:</strong> {genericAccessInfo.deviceName}
              </p>
              <p>
                <strong>Appearance:</strong> {genericAccessInfo.appearance}
              </p>
            </div>
          ) : (
            <p>Loading generic access info...</p>
          )}
        </div>
      ),
    },
    {
      name: "Device Settings",
      content: (
        <div>
          <h2>Device Settings</h2>
          {deviceSettings ? (
            <div className="device-settings">
              <p>
                <strong>Full Scale:</strong> {deviceSettings.fullScale}
                <div>
                  <label htmlFor="full-scale-input">
                    <strong>Edit:</strong>
                  </label>
                  <input
                    type="number"
                    id="full-scale-input"
                    value={fullScale}
                    onChange={(e) => setFullScale(parseInt(e.target.value))}
                    min={0}
                    max={100000}
                    step={1}
                    style={{ marginLeft: "1rem", width: "100px" }}
                  />
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={async () => {
                      const success = await writeDeviceSetting(
                        fullScaleUUID,
                        fullScale
                      );
                      if (success) {
                        console.log(" Full Scale updated!");

                        // Optional: re-fetch to confirm visually
                        const updated = await readDeviceSettings();
                        setDeviceSettings(updated);
                      } else {
                        console.log(" Failed to update Full Scale.");
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </p>
              <p>
                <strong>Alarm Level:</strong> {deviceSettings.alarmLevel}
                <div>
                  <label htmlFor="alarmLevel-input">
                    <strong>Edit:</strong>
                  </label>
                  <input
                    type="number"
                    id="alarmLevel-input"
                    value={alarmLevel}
                    onChange={(e) => setAlarmLevel(parseInt(e.target.value))}
                    min={0}
                    max={100000}
                    step={1}
                    style={{ marginLeft: "1rem", width: "100px" }}
                  />
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={async () => {
                      const success = await writeDeviceSetting(
                        alarmLevelUUID,
                        alarmLevel
                      );
                      if (success) {
                        console.log(" alarmLevel updated!");

                        // Optional: re-fetch to confirm visually
                        const updated = await readDeviceSettings();
                        setDeviceSettings(updated);
                      } else {
                        console.log(" Failed to update alarmLevel.");
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </p>
              <p>
                <strong>Warn Level:</strong> {deviceSettings.warnLevel}
                <div>
                  <label htmlFor="warn-level-input">
                    <strong>Edit:</strong>
                  </label>
                  <input
                    type="number"
                    id="warn-level-input"
                    value={warnLevel}
                    onChange={(e) => setWarnLevel(parseInt(e.target.value))}
                    min={0}
                    max={100000}
                    step={1}
                    style={{ marginLeft: "1rem", width: "100px" }}
                  />
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={async () => {
                      const success = await writeDeviceSetting(
                        warnLevelUUID,
                        warnLevel
                      );
                      if (success) {
                        console.log("Warn Level updated!");

                        // Optional: re-fetch to confirm visually
                        const updated = await readDeviceSettings();
                        setDeviceSettings(updated);
                      } else {
                        console.log(" Failed to update Warn Level.");
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </p>
              <p>
                <strong>Lowest Level:</strong> {deviceSettings.lowestLevel}
                <div>
                  <label htmlFor="lowest-lavel-input">
                    <strong>Edit:</strong>
                  </label>
                  <input
                    type="number"
                    id="lowest-lavel-input"
                    value={lowestLevel}
                    onChange={(e) => setLowestLevel(parseInt(e.target.value))}
                    min={0}
                    max={100000}
                    step={1}
                    style={{ marginLeft: "1rem", width: "100px" }}
                  />
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={async () => {
                      const success = await writeDeviceSetting(
                        lowestLevelUUID,
                        lowestLevel
                      );
                      if (success) {
                        console.log("Lowest Level updated!");

                        // Optional: re-fetch to confirm visually
                        const updated = await readDeviceSettings();
                        setDeviceSettings(updated);
                      } else {
                        console.log("❌ Failed to update Lowest Level.");
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </p>
              <p>
                <strong>Response Time:</strong> {deviceSettings.responseTime}
                <div>
                  <label htmlFor="response-time-input">
                    <strong>Edit:</strong>
                  </label>
                  <input
                    type="number"
                    id="response-time-input"
                    value={responseTime}
                    onChange={(e) => setResponseTime(parseInt(e.target.value))}
                    min={0}
                    max={100000}
                    step={1}
                    style={{ marginLeft: "1rem", width: "100px" }}
                  />
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={async () => {
                      const success = await writeDeviceSetting(
                        responseTimeUUID,
                        responseTime
                      );
                      if (success) {
                        console.log("Response Time updated!");

                        // Optional: re-fetch to confirm visually
                        const updated = await readDeviceSettings();
                        setDeviceSettings(updated);
                      } else {
                        console.log("❌ Failed to update Response Time.");
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </p>
              <p>
                <strong>Block Delay:</strong> {deviceSettings.blockDelay}
                <div>
                  <label htmlFor="block-delay-input">
                    <strong>Edit:</strong>
                  </label>
                  <input
                    type="number"
                    id="block-delay-input"
                    value={blockDelay}
                    onChange={(e) => setBlockDelay(parseInt(e.target.value))}
                    min={0}
                    max={100000}
                    step={1}
                    style={{ marginLeft: "1rem", width: "100px" }}
                  />
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={async () => {
                      const success = await writeDeviceSetting(
                        blockDelayUUID,
                        blockDelay
                      );
                      if (success) {
                        console.log("Block Delay updated!");

                        // Optional: re-fetch to confirm visually
                        const updated = await readDeviceSettings();
                        setDeviceSettings(updated);
                      } else {
                        console.log("❌ Failed to update Block Delay.");
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </p>

              <p>
                <strong>Gas Type:</strong> {deviceSettings.selectedGasType}
              </p>

              <div style={{ marginTop: "1rem" }}>
                <label htmlFor="gas-type-select">
                  <strong>Select Gas Type:</strong>
                </label>
                <select
                  id="gas-type-select"
                  value={selectedGasType}
                  onChange={(e) => setSelectedGasType(parseInt(e.target.value))}
                >
                  <option value={0}>Methane</option>
                  <option value={1}>Propane</option>
                  <option value={2}>Butane</option>
                  <option value={3}>Hydrogen</option>
                </select>

                <button
                  onClick={handleWriteGasType}
                  style={{ marginLeft: "1rem" }}
                >
                  Save
                </button>

                {/*  Optional: Show current gas type label */}
                <p style={{ marginTop: "0.5rem", color: "green" }}>
                  Current Gas Type:{" "}
                  <strong>
                    {gasTypeLabel(deviceSettings.selectedGasType)}
                  </strong>
                </p>
              </div>
            </div>
          ) : (
            <p>Loading settings...</p>
          )}
        </div>
      ),
    },
    { name: "params3", content: "Content for Params_3" },
    {
      name: "Welcome",
      content: (
        <div>
          <h2>Welcome to Fire & Gas Detection Technologies Inc.</h2>

          <p>
            We are committed to respond to the market requirements for improved
            performance and more reliable flame & gas detection products.
          </p>
          <p>
            That includes:
            <br /> <br />
            <li>Fastest speed of response</li>
            <li>Highest immunity to false alarms</li>
            <li>Operation in all weather conditions</li>
            <li>Reduced cost of ownership</li>
            <li>Expert technical & application support</li>
          </p>

          {/* Include the Logo component */}
          <Logo />
        </div>
      ),
    },
  ];

  const handleTabClick = (tabName) => {
    setActiveTab(tabName); // Set the clicked tab as the active tab
  };

  return (
    <div className="tabs">
      {/* Tab buttons: Dynamically render buttons for each tab */}
      <div className="tab-buttons">
        {tabs.map((tab) => (
          <button
            key={tab.name} // Unique key for each button (required in lists)
            className={`tab-button ${activeTab === tab.name ? "active" : ""}`} // * if true : tab-button beacame tab-button.active
            onClick={() => handleTabClick(tab.name)} // Change active tab
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab content: Dynamically render content for the active tab */}
      <div className="tab-content">
        {tabs.map(
          (tab) =>
            activeTab === tab.name && (
              <div key={tab.name}>{tab.content}</div> // Render content if tab is active
            )
        )}
      </div>
    </div>
  );
}

export default Tabs;

//* The regular code (less dynmic):
/////////////////////////////////////////////////////////////////////////////////////////////////////

// import React, { useState } from "react";
// import "./Tabs.css";
// import Logo from "../Logo/Logo"; // Importing the Logo component

// /**
//  * Tabs Component:
//  * Manages dynamic content switching between different tabs.
//  * Each tab has a button that displays specific content when clicked.
//  */

// function Tabs() {

//   const [activeTab, setActiveTab] = useState("Wellcome");

//   const handleTabClick = (tabName) => {
//     setActiveTab(tabName); // Set the clicked tab as the active tab
//   };

//   return (
//     <div className="tabs">
//       {/* Tab buttons: Render one button per tab */}
//       <div className="tab-buttons">
//         {/* Tab button for Params_1 */}
//         <button
//           className={`tab-button ${activeTab === "params1" ? "active" : ""}`} // Highlight active tab
//           onClick={() => handleTabClick("params1")} // Change active tab to Params_1
//         >
//           Params_1
//         </button>

//         {/* Tab button for Params_2 */}
//         <button
//           className={`tab-button ${activeTab === "params2" ? "active" : ""}`} // Highlight active tab
//           onClick={() => handleTabClick("params2")} // Change active tab to Params_2
//         >
//           Params_2
//         </button>

//         {/* Tab button for Params_3 */}
//         <button
//           className={`tab-button ${activeTab === "params3" ? "active" : ""}`} // Highlight active tab
//           onClick={() => handleTabClick("params3")} // Change active tab to Params_3
//         >
//           Params_3
//         </button>

//         {/* Tab button for Wellcome */}
//         <button
//           className={`tab-button ${activeTab === "Wellcome" ? "active" : ""}`} // Highlight active tab
//           onClick={() => handleTabClick("Wellcome")} // Change active tab to Wellcome
//         >
//           Wellcome
//         </button>
//       </div>

//       {/* Tab content: Render the content based on the active tab */}
//       <div className="tab-content">
//         {/* Content for Params_1 */}
//         {activeTab === "params1" && <div>Content for Params_1</div>}

//         {/* Content for Params_2 */}
//         {activeTab === "params2" && <div>Content for Params_2</div>}

//         {/* Content for Params_3 */}
//         {activeTab === "params3" && <div>Content for Params_3</div>}

//         {/* Content for Wellcome */}
//         {activeTab === "Wellcome" && (
//           <div>
//             {/* Welcome message */}
//             Welcome Lorem ipsum dolor sit amet consectetur adipisicing elit.
//             Vero ipsam voluptate non cumque amet corporis repellat. Similique
//             alias, vel eaque, ut, soluta earum eius voluptatem quis commodi quam
//             fuga excepturi?
//             {/* Include the Logo component */}
//             <Logo />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default Tabs;
