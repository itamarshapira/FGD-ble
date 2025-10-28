//* BLE Service: Handles Bluetooth Low Energy functionality
/**
 *? This service performs:
 ** Discovering BLE devices.
 ** Connecting and disconnecting devices.
 ** Interacting with BLE services and characteristics.
 */
import { mediaControlServiceUUID } from "./mediaControl";
import { authServiceUUID } from "./loginService";
const MOCK_MODE = false; //TEST Change to false when using the real device

//const serviceId = "1b7e8251-2877-41c3-b46e-cf057c562023"; //* UUID for accessing specific BLE service
//const receiveCharId = "8ac32d3f-5cb9-4d44-bec2-ee689169f626"; //* UUID for receiving data from the device
//const devicePrefix = "test"; //* Prefix to filter devices during discovery
const genericAttributeUUID = "00001801-0000-1000-8000-00805f9b34fb"; // 0x1801 for the passkey auth service
// * Device info
const deviceInformationServiceUUID = "0000180a-0000-1000-8000-00805f9b34fb"; //* PRIME UUID
const manufacturerNameUUID = "00002a29-0000-1000-8000-00805f9b34fb";
const modelNumberUUID = "00002a24-0000-1000-8000-00805f9b34fb";
const systemIDUUID = "00002a23-0000-1000-8000-00805f9b34fb";

//*! battery info : after Israel's cahnge didnt have that
const batteryServiceUUID = "0000180f-0000-1000-8000-00805f9b34fb"; //* PRIME UUID 0x180F. This is the standard UUID for the Battery Service Proper lowercase format
const batteryLevelCharacteristicUUID = "00002a19-0000-1000-8000-00805f9b34fb"; //* 0x2A19 - This is the standard UUID for the Battery Level Characteristic. Proper lowercase format

// * Alert Notification Service UUIDs
const alertNotificationServiceUUID = "00001811-0000-1000-8000-00805f9b34fb"; // PRIME
const alertStatusCharacteristicUUID = "00002a3f-0000-1000-8000-00805f9b34fb";

//* Environmental Sensing
const environmentalSensingUUID = "0000181a-0000-1000-8000-00805f9b34fb"; // PRIME 0x181A - PRIME
const methaneConcentrationUUID = "00002bd1-0000-1000-8000-00805f9b34fb"; // 0x2BD1
const temperatureUUID = "00002a6e-0000-1000-8000-00805f9b34fb"; // 0x2A6E
export const measurementIntervalUUID = "00002a21-0000-1000-8000-00805f9b34fb"; // 0x2A21

// * generic Access
const genericAccessServiceUUID = "00001800-0000-1000-8000-00805f9b34fb"; // 0x1800 - PRIME
const deviceNameUUID = "00002a00-0000-1000-8000-00805f9b34fb"; // 0x2A00
const appearanceUUID = "00002a01-0000-1000-8000-00805f9b34fb"; // 0x2A01

//*Device Settings Custom Service
const deviceSettingsServiceUUID = "1b7e8251-2877-41c3-b46e-cf057c562024"; // PRIME

export const fullScaleUUID = "889bf2a8-f93f-4481-a67e-3b2f4a078901";
export const alarmLevelUUID = "889bf2a8-f93f-4481-a67e-3b2f4a078902";
export const warnLevelUUID = "889bf2a8-f93f-4481-a67e-3b2f4a078903";
export const lowestLevelUUID = "889bf2a8-f93f-4481-a67e-3b2f4a078904";
export const responseTimeUUID = "889bf2a8-f93f-4481-a67e-3b2f4a078905";
export const blockDelayUUID = "889bf2a8-f93f-4481-a67e-3b2f4a078906";
export const selectedGasTypeUUID = "889bf2a8-f93f-4481-a67e-3b2f4a078907";

// This is the physical BLE device that you discover via navigator.bluetooth.requestDevice().
export let device = null; //* It represents the Bluetooth hardware object, and it has metadata like: device.name , device.id

//This is created when you connect to the device. -> This is what actually gives you access to Reading, writing, and notifications services characteristics and so on..
export let gattServer = null; //* Variable to store GATT server instance --> (Generic Attribute Profile) is a protocol used in BLE communication. It defines how two BLE devices send and receive data between each other.

// export function console.log(msg) {
//   // * Logs messages to the console for debugging purposes.
//   console.log(msg);
// }

/**
 ** Connects to a BLE device.
 * - Filters devices based on name prefix.
 * - Connects to the device's GATT server.
 */
export async function connectToDevice() {
  // { authOnly = false } = {}
  // console.log("connectToDevice called with authOnly =", authOnly);

  try {
    console.log("Requesting Bluetooth device...");
    device = await navigator.bluetooth.requestDevice({
      //* returns a BluetoothDevice object.
      //acceptAllDevices: true, //* Allow only filtered devices
      filters: [{ namePrefix: "FG" }, { namePrefix: "fg" }],
      optionalServices: [
        batteryServiceUUID,
        deviceInformationServiceUUID,
        alertNotificationServiceUUID,
        environmentalSensingUUID,
        genericAccessServiceUUID,
        deviceSettingsServiceUUID,
        mediaControlServiceUUID,
        authServiceUUID, // still include auth here too
        genericAttributeUUID,
      ],
      //* Filter devices by prefix
      // optionalServices: [serviceId], //* Specify desired service UUID
    });

    console.log(`Connecting to GATT server of device: ${device.name}`);
    gattServer = await device.gatt.connect(); //* Establish GATT connection --> The returning BLE Object from above have a device that has a gatt property that represents the GATT server inside the device
    // gatt.connect() starts a Bluetooth connection.
    console.log("Selected device: " + device.name);
    console.log("Connected to GATT server!");
    await checkServiceChanged();

    await subscribeServiceChanged();

    //Test show services and characteristics :
    // const services = await gattServer.getPrimaryServices();
    // for (const service of services) {
    //   console.log("Service:", service.uuid);

    //   const characteristics = await service.getCharacteristics();
    //   for (const characteristic of characteristics) {
    //     console.log("  Characteristic:", characteristic.uuid);
    //   }
    // }
    // test - end part that show characteristics and service .....
    //LOGIC: Discover and log services and characteristics
    // await readBatteryLevel();
    return true;
  } catch (error) {
    console.log(`Error connecting to device: ${error.message}`);
    return false;
  }
}

/**
 ** Disconnects the connected BLE device.
 */
export function disconnectDevice() {
  if (device && device.gatt.connected) {
    device.gatt.disconnect(); //* Disconnects device
    console.log("Device disconnected.");
  } else {
    console.log("No device is connected.");
  }
}

/**
 ** Reads the battery level from a connected BLE device.
 *
 * @returns {number|null} - The battery level (0-100%) if successful, or null if there's an error or no device is connected.
 */
export async function readBatteryLevel() {
  // test-MOCK_MODE-Start
  if (MOCK_MODE) {
    // Simulate battery updates every time it's called
    const fakeBattery = Math.floor(Math.random() * 100) + 1;
    console.log(`(MOCK) Battery Level: ${fakeBattery}%`);
    return fakeBattery;
  }
  // test-MOCK_MODE-END

  if (!gattServer) {
    // Check if a GATT server is connected
    console.log("No connected device. Connect first.");
    return null; // Return null if no device is connected
  }

  try {
    console.log("Accessing Battery Service...");
    // Access the Battery Service using its UUID
    const service = await gattServer.getPrimaryService(batteryServiceUUID);
    const characteristic = await service.getCharacteristic(
      batteryLevelCharacteristicUUID
    );
    const value = await characteristic.readValue();
    const batteryLevel = value.getUint8(0); // Battery level is usually 0-100%
    console.log(`Battery Level: ${batteryLevel}%`);
    return batteryLevel; // Return the battery level
  } catch (error) {
    console.log(`Error reading characteristic: ${error.message}`);
    return null; // Return null on error
  }
}

//*  readDeviceInformation
export async function readDeviceInformation() {
  if (!gattServer) {
    console.log("No connected device. Connect first.");
    return null;
  }

  try {
    console.log("Accessing Device Information Service...");
    const service = await gattServer.getPrimaryService(
      deviceInformationServiceUUID
    );

    // Read Manufacturer Name
    const manufacturerCharacteristic = await service.getCharacteristic(
      manufacturerNameUUID
    );
    const manufacturerValue = await manufacturerCharacteristic.readValue();
    const decoder = new TextDecoder("utf-8");
    const manufacturerName = decoder
      .decode(manufacturerValue)
      .replace(/\0/g, ""); // Removes Null

    // Read Model Number
    const modelCharacteristic = await service.getCharacteristic(
      modelNumberUUID
    );
    const modelValue = await modelCharacteristic.readValue();
    const modelNumber = decoder.decode(modelValue).replace(/\0/g, ""); // Removes Null

    // Read System ID
    const systemCharacteristic = await service.getCharacteristic(systemIDUUID);
    const systemValue = await systemCharacteristic.readValue();
    const systemID = Array.from(new Uint8Array(systemValue.buffer)) // Convert binary data to string
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join(":");

    console.log(`Manufacturer: ${manufacturerName}`);
    console.log(`Model Number: ${modelNumber}`);
    console.log(`System ID: ${systemID}`);

    return {
      manufacturerName,
      modelNumber,
      systemID,
    };
  } catch (error) {
    console.log(`Error reading device information: ${error.message}`);
    return null;
  }
}

//* read AlertStatus
export async function readAlertStatus() {
  // MOCK version for testing
  if (MOCK_MODE) {
    console.log("(MOCK) Reading Alert Status...");
    return "Mock Alert: 0x00";
  }

  // Check if connected to a device
  if (!gattServer) {
    console.log("No connected device. Connect first.");
    return null;
  }

  try {
    // We'll add the reading logic here in the next step:
    console.log("Accessing Alert Notification Service...");
    // Step 1: Get the Alert Notification Service
    const service = await gattServer.getPrimaryService(
      alertNotificationServiceUUID
    );

    // Step 2: Get the Alert Status characteristic
    const characteristic = await service.getCharacteristic(
      alertStatusCharacteristicUUID
    );

    // Step 3: Read the value
    const value = await characteristic.readValue(); // the value is in HEX! -> cause the value from the device is in HEX
    const alertStatus = value.getUint16(0); // Returns 0–255 value in DEC!
    console.log(alertStatus); // log in DEC!
    console.log(`Alert Status (dec): ${alertStatus}`);
    console.log(
      `Alert Status (hex): 0x${alertStatus.toString(16).padStart(2, "0")}`
    );

    // This loops over all 16 bits of the alertStatus number.
    // (1 << i) shifts the number 1 left by i positions → creates a bitmask for each bit position.
    const activeBits = [];
    for (let i = 0; i < 16; i++) {
      // Loop through each bit from 0 to 15 and check if the number of alert status is active by the bit of i
      const isActive = (alertStatus & (1 << i)) !== 0; // Check if the bit at position i is active
      activeBits.push({ bit: i, status: isActive }); // (isActive is boolean)
    }

    activeBits.forEach(({ bit, status }) => {
      console.log(`→ Bit ${bit}: ${status ? "ON (1)" : "OFF (0)"}`);
    });
    // Example output:
    // Alert Status (hex): 0x04
    // → Bit 0: OFF (0)
    // → Bit 1: OFF (0)
    // → Bit 2: ON (1)

    // Step 6: Return the alert status
    return alertStatus; // decimal number
  } catch (error) {
    console.log(`Error reading Alert Status: ${error.message}`);
    return null;
  }
}

//* ---------------- Alert Notification start ----------------
// Global to keep reference for stopping later
let alertNotifyCharacteristic = null;

/**
 * Toggle Alert Status notifications (start/stop) and handle live updates
 * @param {function} callback - called with new value on each notification
 * @returns {boolean} true = started, false = stopped or failed
 */
export async function toggleAlertStatusNotify(callback) {
  if (!gattServer) {
    console.log("Not connected to a device.");
    return false;
  }

  //  Define FIRST
  const handleValueChanged = (event) => {
    const value = event.target.value.getUint16(0, true); // true = little endian

    console.log(`Notify value Status (dec): ${value}`);
    console.log(
      `Notify value Status (hex): 0x${value.toString(16).padStart(2, "0")}`
    );

    const activeBits = [];
    for (let i = 0; i < 16; i++) {
      const isActive = (value & (1 << i)) !== 0;
      activeBits.push({ bit: i, status: isActive });
    }

    activeBits.forEach(({ bit, status }) => {
      console.log(`→ Bit ${bit}: ${status ? "ON (1)" : "OFF (0)"}`);
    });

    if (callback) callback(value);
  };

  try {
    const service = await gattServer.getPrimaryService(
      alertNotificationServiceUUID
    );
    const characteristic = await service.getCharacteristic(
      alertStatusCharacteristicUUID
    );

    if (alertNotifyCharacteristic) {
      await alertNotifyCharacteristic.stopNotifications();
      alertNotifyCharacteristic.removeEventListener(
        "characteristicvaluechanged",
        handleValueChanged // ✅ Now it's safe to access!
      );
      console.log("🔕 Alert notifications stopped.");
      alertNotifyCharacteristic = null;
      return false;
    }

    await characteristic.startNotifications();
    characteristic.addEventListener(
      "characteristicvaluechanged",
      handleValueChanged
    );
    console.log("🔔 Alert notifications started.");

    alertNotifyCharacteristic = characteristic;
    return true;
  } catch (error) {
    console.log(` Failed to toggle alert notify: ${error.message}`);
    return false;
  }
}

//* ---------------- Alert Notification end ----------------

//* READ Enviromental Sensing Function
export async function readEnvironmentalData() {
  if (MOCK_MODE) {
    console.log("(MOCK) Reading Environmental Data...");
    return {
      methane: 14, // ppm
      lelStatus: "LEL:0000",
    };
  }

  if (!gattServer) {
    console.log("No connected device. Connect first.");
    return null;
  }

  try {
    console.log("Accessing Environmental Sensing Service...");

    const service = await gattServer.getPrimaryService(
      environmentalSensingUUID
    );

    // --- Methane Concentration (0x2BD1) ---
    const methaneChar = await service.getCharacteristic(
      methaneConcentrationUUID
    );
    // Check what are the characteristic is supported
    console.log(
      "Characteristic properties for Methane Concentration:",
      methaneChar.properties
    );

    const methaneValue = await methaneChar.readValue();
    const methane = methaneValue.getUint16(0, false); // big-endian
    console.log(`Methane Concentration: ${methane} lel`);

    // --- Descriptor 0x2901: Characteristic User Description (LEL label) ---
    const descriptors = await methaneChar.getDescriptors();
    const userDescDescriptor = descriptors.find(
      (d) => d.uuid === "00002901-0000-1000-8000-00805f9b34fb"
    );

    let methaneLabel = "Unknown";
    if (userDescDescriptor) {
      const descValue = await userDescDescriptor.readValue();
      const decoder = new TextDecoder("utf-8");
      methaneLabel = decoder.decode(descValue).replace(/\0/g, "");
      console.log(`Methane Descriptor Label: ${methaneLabel}`);

      // --- Temperature (0x2A6E) ---
      const tempChar = await service.getCharacteristic(temperatureUUID);
      const tempValue = await tempChar.readValue();
      const temperatureRaw = tempValue.getUint16(0, true); // spec says little-endian
      const temperature = temperatureRaw / 100; // convert to °C
      console.log(`Temperature: ${temperature.toFixed(2)} °C`);

      // Check what are the characteristic is supported
      console.log(
        "Characteristic properties for Temperature Concentration:",
        tempChar.properties
      );

      // --- Measurement Interval (0x2A21) ---
      const intervalChar = await service.getCharacteristic(
        measurementIntervalUUID
      );
      const intervalValue = await intervalChar.readValue();
      const interval = intervalValue.getUint16(0, true); // seconds
      console.log(`Measurement Interval: ${interval} seconds`);

      return {
        methane,
        methaneLabel, // Return the label from the descriptor
        temperature: temperature.toFixed(2), // Return temperature as a string with 2 decimal places
        measurementInterval: interval, // Return measurement interval in seconds
      };
    }
  } catch (error) {
    console.log(`Error reading environmental data: ${error.message}`);
    return null;
  }
}

// * start notifications for methane concentration ------------------------

// Global variable to track methane characteristic and listener
let methaneChar = null;
let methaneNotifyListener = null;

/**
 * *Start methane concentration notifications
 * @param {(value: number) => void} callback - Callback to update UI with ppm
 * - This function starts notifications for methane concentration changes.
 */
export async function startMethaneNotifications(callback) {
  if (!gattServer) {
    console.log("No connected device. Connect first.");
    return;
  }

  try {
    const service = await gattServer.getPrimaryService(
      environmentalSensingUUID //* Access the Environmental Sensing Service
    );
    methaneChar = await service.getCharacteristic(methaneConcentrationUUID); //* Get the Methane Concentration characteristic

    await methaneChar.startNotifications(); //* Start notifications for the characteristic
    console.log(" Methane notifications started");

    if (methaneNotifyListener) {
      methaneChar.removeEventListener(
        "characteristicvaluechanged",
        methaneNotifyListener
      );
    }

    methaneNotifyListener = (event) => {
      //* Listener for characteristic value changes
      console.log(" Event received:", event);
      const methaneValue = event.target.value; //* Get the value from the event
      const methane = methaneValue.getUint16(0, true); // Read as little-endian
      const time = new Date().toLocaleTimeString();
      console.log(`[${time}] Methane Notify: ${methane} lel`);
      callback(methane); // send value to UI
    };

    methaneChar.addEventListener(
      //* Add event listener for characteristic value changes
      "characteristicvaluechanged",
      methaneNotifyListener // This will be set later
    );
  } catch (error) {
    console.log(` Failed to start methane notifications: ${error.message}`);
  }
}

/**
 * *Stop methane notifications
 */
export async function stopMethaneNotifications() {
  if (!methaneChar) {
    console.log(" Methane notify characteristic not set.");
    return;
  }

  try {
    await methaneChar.stopNotifications();
    console.log(" Methane notifications stopped");

    if (methaneNotifyListener) {
      methaneChar.removeEventListener(
        "characteristicvaluechanged",
        methaneNotifyListener
      );
      methaneNotifyListener = null;
    }

    methaneChar = null;
  } catch (error) {
    console.log(`❌ Failed to stop methane notifications: ${error.message}`);
  }
}
// * end notifications for methane concentration ------------------------

//* startTemperatureNotifications ---------------------------

// Global variables for temperature notification
let temperatureChar = null;
let temperatureNotifyListener = null;

/**
 * Start temperature notifications
 * @param {(value: number) => void} callback - Function to receive updated temperature (°C)
 */
export async function startTemperatureNotifications(callback) {
  if (!gattServer) {
    console.log("No connected device. Connect first.");
    return;
  }

  try {
    const service = await gattServer.getPrimaryService(
      environmentalSensingUUID
    );
    temperatureChar = await service.getCharacteristic(temperatureUUID);

    await temperatureChar.startNotifications();
    console.log(" Temperature notifications started");

    temperatureNotifyListener = (event) => {
      const tempData = event.target.value;
      const raw = tempData.getUint16(0, true); // Read as little-endian
      const temperature = raw / 100; // Convert to Celsius
      console.log(` Temperature Notify: ${temperature.toFixed(2)} °C`);
      callback(temperature); // Send to React state
    };

    temperatureChar.addEventListener(
      "characteristicvaluechanged",
      temperatureNotifyListener
    );
  } catch (error) {
    console.log(` Failed to start temperature notifications: ${error.message}`);
  }
}

/**
 * Stop temperature notifications
 */
export async function stopTemperatureNotifications() {
  if (!temperatureChar) {
    console.log("⚠️ Temperature notify characteristic not set.");
    return;
  }

  try {
    await temperatureChar.stopNotifications();
    console.log(" Temperature notifications stopped");

    if (temperatureNotifyListener) {
      temperatureChar.removeEventListener(
        "characteristicvaluechanged",
        temperatureNotifyListener
      );
      temperatureNotifyListener = null;
    }

    temperatureChar = null;
  } catch (error) {
    console.log(` Failed to stop temperature notifications: ${error.message}`);
  }
}

//* end Temperature Notifications ---------------------------

//* readGenericAccess
export async function readGenericAccess() {
  if (MOCK_MODE) {
    console.log("(MOCK) Reading Generic Access...");
    return {
      deviceName: "FG-DETECTOR",
      appearance: "Generic Tag (512)",
    };
  }

  if (!gattServer) {
    console.log("No connected device. Connect first.");
    return null;
  }

  try {
    console.log("Accessing Generic Access Service...");
    const service = await gattServer.getPrimaryService(
      genericAccessServiceUUID
    );

    // Read Device Name
    const nameChar = await service.getCharacteristic(deviceNameUUID);
    const nameValue = await nameChar.readValue();
    const decoder = new TextDecoder("utf-8");
    const deviceName = decoder.decode(nameValue).replace(/\0/g, "");

    // Read Appearance
    const appearanceChar = await service.getCharacteristic(appearanceUUID);
    const appearanceValue = await appearanceChar.readValue();
    const appearanceCode = appearanceValue.getUint16(0, false); // Read 2 bytes, little-endian

    // Map known appearance codes (expand if needed)
    const appearanceText =
      appearanceCode === 512 ? "Generic Tag" : `Unknown (${appearanceCode})`;

    console.log(`Device Name: ${deviceName}`);
    console.log(`Appearance: ${appearanceText} (${appearanceCode})`);

    return {
      deviceName,
      appearance: `${appearanceText} (${appearanceCode})`,
    };
  } catch (error) {
    console.log(`Error reading Generic Access: ${error.message}`);
    return null;
  }
}

//* readDeviceSettings
export async function readDeviceSettings() {
  if (!gattServer) {
    console.log("No connected device. Connect first.");
    return null;
  }
  try {
    console.log(" Accessing Device Settings Service...");

    const service = await gattServer.getPrimaryService(
      deviceSettingsServiceUUID
    );

    const readCharValue = async (uuid) => {
      const char = await service.getCharacteristic(uuid);
      const value = await char.readValue();
      return value.getUint16(0, false); // Read 2 bytes, little endian
    };

    const fullScale = await readCharValue(fullScaleUUID);
    const alarmLevel = await readCharValue(alarmLevelUUID);
    const warnLevel = await readCharValue(warnLevelUUID);
    const lowestLevel = await readCharValue(lowestLevelUUID);
    const responseTime = await readCharValue(responseTimeUUID);
    const blockDelay = await readCharValue(blockDelayUUID);
    const selectedGasType = await readCharValue(selectedGasTypeUUID);

    console.log("📋 Device Settings:");
    console.log("Full Scale:", fullScale);
    console.log("Alarm Level:", alarmLevel);
    console.log("Warn Level:", warnLevel);
    console.log("Lowest Level:", lowestLevel);
    console.log("Response Time:", responseTime);
    console.log("Block Delay:", blockDelay);
    console.log("Selected Gas Type:", selectedGasType);

    return {
      fullScale,
      alarmLevel,
      warnLevel,
      lowestLevel,
      responseTime,
      blockDelay,
      selectedGasType,
    };
  } catch (error) {
    console.error("❌ Failed to read device settings:", error);
    return null;
  }
}

//* writeDeviceSetting
export async function writeDeviceSetting(uuid, value) {
  // Make sure we are connected
  if (!gattServer) {
    console.log("No connected device. Connect first.");
    return false;
  }

  try {
    console.log(`Writing to Device Setting: ${uuid}`);

    // Step 1: Get the service by its UUID (Device Settings Service)
    const service = await gattServer.getPrimaryService(
      deviceSettingsServiceUUID
    );

    // Step 2: Get the correct characteristic (e.g., alarm level, gas type, etc.)
    const characteristic = await service.getCharacteristic(uuid);

    // Step 3: Convert the value to a binary format (2 bytes, little-endian)
    const buffer = new ArrayBuffer(2); // Allocate 2 bytes
    const view = new DataView(buffer);
    view.setUint16(0, value, false); // Write the value into the buffer, little endian

    // Step 4: Write the value to the BLE device
    await characteristic.writeValue(buffer);

    console.log(` Successfully wrote value ${value} to characteristic ${uuid}`);
    return true;
  } catch (error) {
    console.log(` Failed to write to device setting: ${error.message}`);
    return false;
  }
}

//* writeMeasurementInterval
export async function writeMeasurementInterval(value) {
  if (!gattServer) {
    console.log("No connected device. Connect first.");
    return false;
  }
  try {
    console.log(`Writing Measurement Interval: ${value}`);
    const service = await gattServer.getPrimaryService(
      environmentalSensingUUID
    );
    const characteristic = await service.getCharacteristic(
      measurementIntervalUUID
    );
    const buffer = new ArrayBuffer(2);
    const view = new DataView(buffer);
    view.setUint16(0, value, true); // little endian
    await characteristic.writeValue(buffer);
    console.log(`Successfully wrote measurement interval: ${value}`);
    return true;
  } catch (error) {
    console.log(` Failed to write measurement interval: ${error.message}`);
    return false;
  }
}

// // helper to fully reset connection state
// export function resetConnection() {
//   if (device && device.gatt?.connected) {
//     try {
//       device.gatt.disconnect();
//       console.log("[bleService] Disconnected existing connection.");
//     } catch (e) {
//       console.warn("[bleService] Error while disconnecting:", e);
//     }
//   }
//   device = null;
//   gattServer = null;
//   console.log("[bleService] Connection reset (device and gattServer cleared).");
// }

// * helper: List all services & characteristics currently visible
export async function listAllServices() {
  if (!gattServer) {
    console.log("[bleService] No GATT server connected.");
    return;
  }

  try {
    const services = await gattServer.getPrimaryServices();
    console.log("---- Services after connect/auth ----");
    for (const service of services) {
      console.log("Service:", service.uuid);
      const chars = await service.getCharacteristics();
      for (const char of chars) {
        console.log("  Char:", char.uuid);
      }
    }
    console.log("---- End of service list ----");
  } catch (e) {
    console.error("[bleService] listAllServices failed:", e);
  }
}

//* Subscribe to Service Changed (0x2A05) in Generic Attribute Service (0x1801)
export async function subscribeServiceChanged() {
  console.log("[bleService] Subscribing to Service Changed (0x2A05)...");

  if (!gattServer) {
    console.warn("[bleService] No GATT server connected yet.");
    return;
  }

  try {
    // Get Generic Attribute service (0x1801)
    const service = await gattServer.getPrimaryService(genericAttributeUUID);

    // Get Service Changed characteristic (0x2A05)
    const char = await service.getCharacteristic(
      "00002a05-0000-1000-8000-00805f9b34fb"
    );

    // Start listening for Service Changed indications

    char.addEventListener("characteristicvaluechanged", (event) => {
      console.log(
        "🔔 [bleService] Service Changed indication received!",
        event
      );

      // 👉 when this fires, Chrome should refresh its cache.
      // At this point, call getPrimaryServices() again or trigger your logic to load full services.
    });

    console.log("[bleService] Subscribed to Service Changed (0x2A05).");
  } catch (e) {
    console.error("[bleService] subscribeServiceChanged failed:", e);
  }
}

// *Debug: check Service Changed characteristic properties
export async function checkServiceChanged() {
  if (!gattServer) {
    console.log("[bleService] No GATT server connected.");
    return;
  }

  try {
    const service = await gattServer.getPrimaryService(
      "00001801-0000-1000-8000-00805f9b34fb"
    ); // GATT service
    const char = await service.getCharacteristic(
      "00002a05-0000-1000-8000-00805f9b34fb"
    ); // Service Changed char
    console.log("[bleService] 0x2A05 properties:", char.properties);
  } catch (e) {
    console.error("[bleService] checkServiceChanged failed:", e);
  }
}
