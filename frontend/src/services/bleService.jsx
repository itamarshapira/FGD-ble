//* BLE Service: Handles Bluetooth Low Energy functionality
/**
 *? This service performs:
 ** Discovering BLE devices.
 ** Connecting and disconnecting devices.
 ** Interacting with BLE services and characteristics.
 */

const MOCK_MODE = false; //TEST Change to false when using the real device

//const serviceId = "1b7e8251-2877-41c3-b46e-cf057c562023"; //* UUID for accessing specific BLE service
//const receiveCharId = "8ac32d3f-5cb9-4d44-bec2-ee689169f626"; //* UUID for receiving data from the device
//const devicePrefix = "test"; //* Prefix to filter devices during discovery

const deviceInformationServiceUUID = "0000180a-0000-1000-8000-00805f9b34fb"; //* PRIME UUID
const manufacturerNameUUID = "00002a29-0000-1000-8000-00805f9b34fb";
const modelNumberUUID = "00002a24-0000-1000-8000-00805f9b34fb";
const systemIDUUID = "00002a23-0000-1000-8000-00805f9b34fb";

const batteryServiceUUID = "0000180f-0000-1000-8000-00805f9b34fb"; //* PRIME UUID 0x180F. This is the standard UUID for the Battery Service Proper lowercase format
const batteryLevelCharacteristicUUID = "00002a19-0000-1000-8000-00805f9b34fb"; //* 0x2A19 - This is the standard UUID for the Battery Level Characteristic. Proper lowercase format

let device = null; //* Variable to store connected device
let gattServer = null; //* Variable to store GATT server instance --> (Generic Attribute Profile) is a protocol used in BLE communication. It defines how two BLE devices send and receive data between each other.

export function logMessage(msg) {
  // * Logs messages to the console for debugging purposes.
  console.log(msg);
}

/**
 ** Connects to a BLE device.
 * - Filters devices based on name prefix.
 * - Connects to the device's GATT server.
 */
export async function connectToDevice() {
  // test - MOCK_MODE - Start
  if (MOCK_MODE) {
    logMessage("(MOCK) Simulating BLE connection...");

    // Simulate a delay to make it feel real
    await new Promise((resolve) => setTimeout(resolve, 1000));

    logMessage("(MOCK) Connected to fake device!");
    return true; // Indicate successful connection
  }
  // test - MOCK_MODE - END

  try {
    logMessage("Requesting Bluetooth device...");
    device = await navigator.bluetooth.requestDevice({
      //* returns a BluetoothDevice object.
      acceptAllDevices: true, //* Allow only filtered devices
      optionalServices: [batteryServiceUUID, deviceInformationServiceUUID], // Correctly formatted UUID
      // filters: [{ namePrefix: devicePrefix }], //* Filter devices by prefix
      // optionalServices: [serviceId], //* Specify desired service UUID
    });

    logMessage(`Connecting to GATT server of device: ${device.name}`);
    gattServer = await device.gatt.connect(); //* Establish GATT connection --> The returning BLE Object from above have a device that has a gatt property that represents the GATT server inside the device
    // gatt.connect() starts a Bluetooth connection.

    logMessage("Connected to GATT server!");

    //LOGIC: Discover and log services and characteristics
    // await readBatteryLevel();
    return true;
  } catch (error) {
    logMessage(`Error connecting to device: ${error.message}`);
    return false;
  }
}

/**
 ** Disconnects the connected BLE device.
 */
export function disconnectDevice() {
  if (device && device.gatt.connected) {
    device.gatt.disconnect(); //* Disconnects device
    logMessage("Device disconnected.");
  } else {
    logMessage("No device is connected.");
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
    logMessage(`(MOCK) Battery Level: ${fakeBattery}%`);
    return fakeBattery;
  }
  // test-MOCK_MODE-END

  if (!gattServer) {
    // Check if a GATT server is connected
    logMessage("No connected device. Connect first.");
    return null; // Return null if no device is connected
  }

  try {
    logMessage("Accessing Battery Service...");
    // Access the Battery Service using its UUID
    const service = await gattServer.getPrimaryService(batteryServiceUUID);
    const characteristic = await service.getCharacteristic(
      batteryLevelCharacteristicUUID
    );
    const value = await characteristic.readValue();
    const batteryLevel = value.getUint8(0); // Battery level is usually 0-100%
    logMessage(`Battery Level: ${batteryLevel}%`);
    return batteryLevel; // Return the battery level
  } catch (error) {
    logMessage(`Error reading characteristic: ${error.message}`);
    return null; // Return null on error
  }
}

//*  readDeviceInformation
export async function readDeviceInformation() {
  // test-mock-Start
  if (MOCK_MODE) {
    logMessage("Mocking Device Information...");

    return {
      manufacturerName: "FGD Technologies",
      modelNumber: "FGD-1234",
      systemID: "AA:BB:CC:DD:EE:FF",
    };
  }
  // test end

  if (!gattServer) {
    logMessage("No connected device. Connect first.");
    return null;
  }

  try {
    logMessage("Accessing Device Information Service...");
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

    logMessage(`Manufacturer: ${manufacturerName}`);
    logMessage(`Model Number: ${modelNumber}`);
    logMessage(`System ID: ${systemID}`);

    return {
      manufacturerName,
      modelNumber,
      systemID,
    };
  } catch (error) {
    logMessage(`Error reading device information: ${error.message}`);
    return null;
  }
}

// * Discover Available Services and Characteristics

// export async function discoverServicesAndCharacteristics() {
//   if (!gattServer) {
//     logMessage("No connected device. Connect first.");
//     return;
//   }

//   try {
//     // Get all available services
//     const services = await gattServer.getPrimaryServices();

//     for (const service of services) {
//       logMessage(`Service: ${service.uuid}`); // Log the service UUID

//       // Get characteristics of the service
//       const characteristics = await service.getCharacteristics();
//       for (const characteristic of characteristics) {
//         logMessage(
//           `Characteristic: ${characteristic.uuid} - Properties: ${Object.keys(
//             characteristic.properties
//           ).join(", ")}`
//         );
//       }
//     }
//   } catch (error) {
//     logMessage(
//       `Error discovering services and characteristics: ${error.message}`
//     );
//   }
// }

/**
 * Reads data from a BLE characteristic.
 * - Assumes device is connected and GATT server is available.
 */

//export async function readCharacteristic() {
// if (!gattServer) {
//   logMessage("No connected device. Connect first.");
//   return;
// }
// try {
//   // Get the Battery Service
//   const service = await gattServer.getPrimaryService(
//     "0000180F-0000-1000-8000-00805f9b34fb"
//   );
//   // Get the Battery Level Characteristic
//   const characteristic = await service.getCharacteristic(
//     "00002A19-0000-1000-8000-00805f9b34fb"
//   );
//   // Read the characteristic's value
//   const value = await characteristic.readValue();
//   // Decode the value (assuming UTF-8 text)
//   const decoder = new TextDecoder("utf-8");
//   const data = decoder.decode(value);
//   logMessage(`Received Data: ${data}`);
//   return data;
// } catch (error) {
//   logMessage(`Error reading characteristic: ${error.message}`);
// }
//}
