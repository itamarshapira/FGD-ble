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

    const raw = value.getUint8(0); // Usually a small enum
    console.log(`Media Control Point value: ${raw}`);
    console.log("Media Control Point value: ,raw", raw);

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

    const buffer = new ArrayBuffer(1);
    const view = new DataView(buffer);
    view.setUint8(0, value); // value should be 0, 1, or 2

    await characteristic.writeValue(buffer);
    console.log(" Media Control Point value written successfully.");
    return true;
  } catch (error) {
    console.log(` Failed to write Media Control Point: ${error.message}`);
    return false;
  }
}
