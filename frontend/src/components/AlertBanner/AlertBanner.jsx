export const ALERT_PRIORITY = {
  // look up table - dictonary (the same)
  //JavaScript will immediately treat it as a normal number in decimal form internally.
  //0x0200 -> 512
  0x0001: { name: "power_up", priority: 1 },
  0x0002: { name: "alignment", priority: 2 },
  0x0004: { name: "calib_mode", priority: 3 },
  0x0008: { name: "misAlignment", priority: 8 },
  0x0010: { name: "HW_Fault", priority: 4 },
  0x0020: { name: "param_fault", priority: 5 },
  0x0040: { name: "calib_fault", priority: 6 },
  0x0080: { name: "power_fault", priority: 7 },
  0x0100: { name: "warn_level", priority: 10 },
  0x0200: { name: "alarm_level", priority: 9 },
  0x0400: { name: "gas_mixture", priority: 11 },
  0x0800: { name: "safety_delay", priority: 14 },
  0x1000: { name: "no_sync", priority: 13 },
  0x2000: { name: "beam_blocked", priority: 12 },
  0x4000: { name: "peak_detect", priority: 15 },
  0x8000: { name: "fake_peak_detect", priority: 16 },
};

export default function AlertBanner({ alertStatus }) {
  // alertStatus is decimal number here!
  const style = {
    background: "#cc1436ff",
    color: "#fff",
    padding: "4px 12px",
    borderRadius: 8,
    fontWeight: 700,
    margin: "16px 0",
    textAlign: "center",
    opacity: 0.8,
  };

  //  If alertStatus is null or 0 → All clear
  if (alertStatus === 0) {
    return (
      <div style={{ ...style, background: "#20aa29ff" }}>
        All clear - no alerts
      </div>
    );
  } else if (alertStatus === null) {
    return <div></div>;
  }

  // Find all active alerts using bit shifts instead of parsing hex strings
  const activeAlerts = [];

  for (let i = 0; i < 16; i++) {
    const bitMask = 1 << i; // builds 1, 2, 4, 8, ..., 32768
    if ((alertStatus & bitMask) !== 0) {
      // If the bit is active, find its details from ALERT_PRIORITY
      if (ALERT_PRIORITY[bitMask]) {
        activeAlerts.push(ALERT_PRIORITY[bitMask]);
      } else {
        // Optional: handle unknown bit
        activeAlerts.push({ name: `Unknown bit ${i}`, priority: 99 });
      }
    }
  }

  console.log("Active Alerts:", activeAlerts);

  // Pick the highest priority
  const topAlert = activeAlerts.sort((a, b) => a.priority - b.priority)[0];

  return (
    <div style={style}>
      Status: {topAlert?.name || "Unknown alert"}
      {/* (Priority {topAlert?.priority}) */}
    </div>
  );
}
