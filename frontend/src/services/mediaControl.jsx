import { gattServer } from "./bleService";
// Media Control Point Service UUID
export const mediaControlServiceUUID = "00001848-0000-1000-8000-00805f9b34fb"; // Standard: org.bluetooth.service.media_control -> "00001849-0000-1000-8000-00805f9b34fb"

// Media Control Point Characteristic UUID
export const mediaControlPointUUID = "00002ba4-0000-1000-8000-00805f9b34fb"; // "00002BA4-0000-1000-8000-00805f9b34fb"

// Optional: Descriptor UUID (if needed in future)
export const mediaControlDescriptorUUID =
  "00002901-0000-1000-8000-00805f9b34fb"; // "00002901-0000-1000-8000-00805f9b34fb"

/**
 ** Read the current value of the Media Control Point characteristic
 */
export async function readMediaControlPoint() {
  if (!gattServer) {
    console.log("Not connected to a device.");
    return null;
  }

  try {
    console.log("Reading Media Control Point value...");

    const service = await gattServer.getPrimaryService(mediaControlServiceUUID);
    const characteristic = await service.getCharacteristic(
      mediaControlPointUUID
    );
    const value = await characteristic.readValue();
    console.log(`value byte size: ${value.byteLength}`); // tells you how many bytes came -> then i know how to read it !

    const raw = value.getUint8(0); // Assuming the value is a single byte because it can be 0, 1, or 2
    console.log(`Media Control Point value: ${raw}`);

    return raw;
  } catch (error) {
    console.log(` Failed to read Media Control Point: ${error.message}`);
    return null;
  }
}

/**
 ** Write a value to the Media Control Point characteristic
 * @param {number} value - The value to write (0, 1, or 2)
 * @returns {boolean} - True if successful, false otherwise
 */
export async function writeMediaControlPoint(value) {
  if (!gattServer) {
    console.log("Not connected to a device.");
    return false;
  }

  try {
    console.log(`✍️ Writing Media Control Point value: ${value}`);
    const service = await gattServer.getPrimaryService(mediaControlServiceUUID);
    const characteristic = await service.getCharacteristic(
      mediaControlPointUUID
    );

    //* creating a buffer -> with view we can write inside -> with setUnit8 we can set the value :
    const buffer = new ArrayBuffer(1); // Create a buffer of 1 byte
    const view = new DataView(buffer); // DataView provides methods like .setUint8, .getUint16, etc. to interpret those bytes as real numbers.
    view.setUint8(0, value); // Writes the number into the buffer at position 0

    await characteristic.writeValue(buffer); // Write the buffer to the characteristic
    console.log(" Media Control Point value written successfully.");
    return true;
  } catch (error) {
    console.log(` Failed to write Media Control Point: ${error.message}`);
    return false;
  }
}
