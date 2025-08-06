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
  startMethaneNotifications,
  stopMethaneNotifications,
  startTemperatureNotifications,
  stopTemperatureNotifications,
  writeMeasurementInterval,
  // measurementIntervalUUID,
  toggleAlertStatusNotify,
} from "../../services/bleService";
import VideoStream from "../VideoStream/VideoStream";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
//import { faCheckDouble } from "@fortawesome/free-solid-svg-icons";
import { faN } from "@fortawesome/free-solid-svg-icons/faN";
import {
  readMediaControlPoint,
  writeMediaControlPoint,
} from "../../services/mediaControl"; // Importing the media control service

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
  const [alertNotifyOn, setAlertNotifyOn] = useState(false); // track ON/OFF state

  const [environmentalData, setEnvironmentalData] = useState(null); // store Enviromental Sensing

  const [genericAccessInfo, setGenericAccessInfo] = useState(null); // store genericAccessInfo

  const [deviceSettings, setDeviceSettings] = useState(null); // store device settings

  const [mediaControlValue, setMediaControlValue] = useState(null); // store Media Control Point value
  const [mediaControlInput, setMediaControlInput] = useState(0); // input to write to Media Control Point

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
      console.log(" Gas type updated!");

      //  re-fetch and sync again
      const updatedSettings = await readDeviceSettings();
      setDeviceSettings(updatedSettings);
    } else {
      console.log(" Failed to update gas type.");
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
  // Reusable fetch function -> fetchAlertStatus():
  // This function reads the alert status from the BLE device and updates the state
  // did it to use refresh btn to re-fetch the alert status.
  const fetchAlertStatus = async () => {
    const status = await readAlertStatus();
    setAlertStatus(status);
    console.log(" Alert Status (test):", status);
  };

  // *Use useEffect to call fetchAlertStatus when the "Alert Status" tab is active
  // or when fetchAlertStatus() is called.
  useEffect(() => {
    if (activeTab === "Alert Status") {
      fetchAlertStatus();
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

  // *Reusable fetch function for environmental data
  // This function reads the environmental data from the BLE device and updates the state
  const fetchEnvSensing = async () => {
    const status = await readEnvironmentalData();
    setEnvironmentalData(status);
    console.log(" Environmental Data (test):", status);
  };

  // *State to track if methane notifications are active
  const [isMethaneStreaming, setIsMethaneStreaming] = useState(false); // State to track if methane notifications are active

  // * Function to toggle methane streaming notifications - This function starts or stops the methane notifications based on the current state
  const toggleMethaneStream = async () => {
    if (isMethaneStreaming) {
      await stopMethaneNotifications();
      setIsMethaneStreaming(false);
    } else {
      await startMethaneNotifications((value) => {
        // Update only methane field in environmentalData state
        setEnvironmentalData((prev) => ({
          ...prev,
          methane: value,
        }));
      });
      setIsMethaneStreaming(true);
    }
  };

  // * State to track if temperature notifications are active
  const [isTemperatureStreaming, setIsTemperatureStreaming] = useState(false);

  // * Function to toggle temperature streaming notifications
  const toggleTemperatureStream = async () => {
    if (isTemperatureStreaming) {
      await stopTemperatureNotifications();
      setIsTemperatureStreaming(false);
    } else {
      await startTemperatureNotifications((value) => {
        setEnvironmentalData((prev) => ({
          ...prev,
          temperature: value.toFixed(2),
        }));
      });
      setIsTemperatureStreaming(true);
    }
  };

  // * State to track the measurement interval
  const [measurementInterval, setMeasurementInterval] = useState(0);

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

  //* media control point
  useEffect(() => {
    if (activeTab === "Media Control Point") {
      // Fetch the current value of the Media Control Point characteristic
      fetchMediaControlPoint();
    }
  }, [activeTab]);

  const fetchMediaControlPoint = async () => {
    const value = await readMediaControlPoint();
    setMediaControlValue(value);
  };

  // *Array of tabs: Each tab has a name and corresponding content
  const tabs = [
    { name: "Device Data (demo)", content: <DeviceData /> },
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
          <button className="refresh-button" onClick={fetchAlertStatus}>
            <FontAwesomeIcon icon={faDownload} />
          </button>
          <button
            onClick={async () => {
              const result = await toggleAlertStatusNotify((newValue) => {
                setAlertStatus(newValue);
              });
              setAlertNotifyOn(result); // true = started, false = stopped
            }}
            className={alertNotifyOn ? "btn-stop" : "btn-start"}
          >
            <FontAwesomeIcon icon={faN} />
          </button>

          {alertStatus === null ? (
            <p>Reading alert status...</p>
          ) : alertStatus === 0 ? (
            <p>All clear — no alerts active.</p>
          ) : (
            <div>
              <p>
                <strong>Status word:</strong> 0x
                {alertStatus.toString(16).padStart(4, "0").toUpperCase()}
              </p>
              <ul>
                {Array.from({ length: 16 }, (_, i) => {
                  const isOn = (alertStatus & (1 << i)) !== 0;
                  return (
                    <li key={i}>
                      Bit {i}: {isOn ? "ON (1)" : "OFF (0)"}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Environmental Sensing",
      content: (
        <div>
          <h2>Environmental Sensing</h2>
          {/* Button to toggle methane notifications */}

          {/*  Button to refresh environmental data */}
          <button className="refresh-button" onClick={fetchEnvSensing}>
            <FontAwesomeIcon icon={faDownload} />
          </button>

          {environmentalData ? (
            <div className="environmental-details">
              <p>
                <strong>
                  Methane Concentration ({environmentalData.methaneLabel}):
                </strong>{" "}
                {environmentalData.methane}
                <button
                  onClick={toggleMethaneStream}
                  className={isMethaneStreaming ? "btn-stop" : "btn-start"}
                >
                  <FontAwesomeIcon icon={faN} />
                </button>
              </p>
              <hr />
              <p>
                <strong>Temperature:</strong> {environmentalData.temperature} °C
                <button
                  onClick={toggleTemperatureStream}
                  className={isTemperatureStreaming ? "btn-stop" : "btn-start"}
                >
                  <FontAwesomeIcon icon={faN} />
                </button>
              </p>
              <hr />
              <div>
                <strong>Measurement Interval:</strong>{" "}
                {environmentalData.measurementInterval} seconds
                <div>
                  <strong>Edit:</strong>
                  <input
                    type="number"
                    id="measurement-interval-input"
                    value={measurementInterval} // Controlled input for measurement interval
                    onChange={
                      (e) => setMeasurementInterval(parseInt(e.target.value)) // Update state on input change
                    }
                    min={1}
                    max={3600}
                    step={1}
                    style={{ marginLeft: "1rem", width: "100px" }}
                  />
                  <button
                    style={{ marginLeft: "1rem" }}
                    onClick={async () => {
                      const success = await writeMeasurementInterval(
                        measurementInterval
                      );
                      if (success) {
                        console.log("Measurement Interval updated!");
                        // Optional: re-fetch to confirm visually
                        const updated = await readEnvironmentalData();
                        setEnvironmentalData(updated); // Update state of environmental sensing (all of it maybe change just to interval in future)
                      } else {
                        console.log("Failed to update Measurement Interval.");
                      }
                    }}
                  >
                    Save
                  </button>
                </div>
              </div>
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
              <div>
                <strong>Full Scale:</strong> {deviceSettings.fullScale}
              </div>
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
              <br />
              <div>
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
              </div>
              <br />
              <div>
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
              </div>

              <br />
              <div>
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
              </div>
              <br />
              <div>
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
              </div>
              <br />
              <div>
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
              </div>
              <br />
              <div>
                <strong>Gas Type:</strong> {deviceSettings.selectedGasType}
                <div style={{ marginTop: "1rem" }}>
                  <label htmlFor="gas-type-select">
                    <strong>Select Gas Type:</strong>
                  </label>
                  <select
                    id="gas-type-select"
                    value={selectedGasType}
                    onChange={(e) =>
                      setSelectedGasType(parseInt(e.target.value))
                    }
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
            </div>
          ) : (
            <p>Loading settings...</p>
          )}
        </div>
      ),
    },
    { name: "New Content", content: "Content for new content" },
    {
      name: "Media Control Point",
      content: (
        <div>
          <h2>Media Control Point</h2>
          <button className="refresh-button" onClick={fetchMediaControlPoint}>
            <FontAwesomeIcon icon={faDownload} />
          </button>

          {mediaControlValue === null ? (
            <p>Click to read the current mode.</p>
          ) : (
            <p>
              <strong>Mode:</strong>{" "}
              {mediaControlValue === 0
                ? "Normal"
                : mediaControlValue === 1
                ? "Alignment"
                : mediaControlValue === 2
                ? "Zero Calibration"
                : `Unknown (${mediaControlValue})`}
            </p>
          )}
          <div>
            <input
              type="number"
              min="0"
              max="2"
              value={mediaControlInput}
              onChange={(e) => setMediaControlInput(parseInt(e.target.value))}
              style={{ width: "4rem", marginRight: "1rem" }}
            />
            <button
              onClick={async () => {
                const success = await writeMediaControlPoint(mediaControlInput);
                if (success) {
                  console.log("✅ Media Control Point updated!");
                  fetchMediaControlPoint(); // Optional: re-read after update
                } else {
                  console.log("❌ Failed to update Media Control Point.");
                }
              }}
            >
              Save
            </button>
          </div>
        </div>
      ),
    },
    {
      name: "Video Stream",
      content: <VideoStream />,
    },

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
      {/*  Collapsible Dropdown for All Screens */}
      <select
        className="tab-dropdown"
        value={activeTab}
        onChange={(e) => handleTabClick(e.target.value)}
      >
        {tabs.map((tab) => (
          <option key={tab.name} value={tab.name}>
            {tab.name}
          </option>
        ))}
      </select>

      {/*  Tab content for the active tab */}
      <div className="tab-content">
        {tabs.map(
          (tab) =>
            activeTab === tab.name && <div key={tab.name}>{tab.content}</div>
        )}
      </div>
    </div>
  );
}

export default Tabs;

// * This is the original code (return part) for the Tabs component before the dropdown was added.
//  return (
//     <div className="tabs">
//       {/* Tab buttons: Dynamically render buttons for each tab */}
//       <div className="tab-buttons">
//         {tabs.map((tab) => (
//           <button
//             key={tab.name} // Unique key for each button (required in lists)
//             className={`tab-button ${activeTab === tab.name ? "active" : ""}`} // * if true : tab-button beacame tab-button.active
//             onClick={() => handleTabClick(tab.name)} // Change active tab
//           >
//             {tab.name}
//           </button>
//         ))}
//       </div>

//       {/* Tab content: Dynamically render content for the active tab */}
//       <div className="tab-content">
//         {tabs.map(
//           (tab) =>
//             activeTab === tab.name && (
//               <div key={tab.name}>{tab.content}</div> // Render content if tab is active
//             )
//         )}
//       </div>
//     </div>
//   );
