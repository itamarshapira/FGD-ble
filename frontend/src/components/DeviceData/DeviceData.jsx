// // DeviceData.jsx
// import React, { useState, useEffect } from "react";
// import "./DeviceData.css";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   startMethaneNotifications,
//   stopMethaneNotifications,
//   readEnvironmentalData,
// } from "../../services/bleService";

// const DeviceData = () => {
//   const [gasLevels, setGasLevels] = useState([]); // Store gas levels (array)

//   useEffect(() => {
//     console.log("Component Mounted: Starting methane notifications...");

//     // Subscribe to real methane values from BLE
//     startMethaneNotifications((ppm) => {
//       setGasLevels((current) => {
//         const updated = [...current, ppm];
//         return updated.slice(-50); // Keep only the last 50 readings
//       });
//     });

//     // Cleanup on unmount → stop notifications
//     return () => {
//       console.log("Component Unmounted: Stopping methane notifications...");
//       stopMethaneNotifications();
//     };
//   }, []);

//   // Convert gasLevels into Recharts format
//   const chartData = gasLevels.map((value, index) => ({
//     time: index + 1, // X-axis = reading index
//     gas: value, // Y-axis = gas ppm
//   }));

//   return (
//     <div className="device-data">
//       <h2>Gas Level Monitoring (PPM)</h2>
//       <p>
//         Latest Gas Level:{" "}
//         <strong>{gasLevels[gasLevels.length - 1] || 0} PPM</strong>
//       </p>
//       <p>History: {gasLevels.join(", ")}</p>

//       {/* Line Chart */}
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" />
//           <XAxis
//             dataKey="time"
//             label={{
//               value: "Time (samples)",
//               position: "insideBottom",
//               offset: -5,
//             }}
//           />
//           <YAxis
//             label={{
//               value: "Gas Level (PPM)",
//               angle: -90,
//               position: "insideLeft",
//             }}
//           />
//           <Tooltip
//             contentStyle={{
//               backgroundColor: "#1e1e1e",
//               color: "#ffffff",
//               borderRadius: "8px",
//               border: "1px solid #8884d8",
//               fontSize: "14px",
//             }}
//             labelStyle={{ color: "#ffcc00", fontWeight: "bold" }}
//           />
//           <Line
//             type="monotone"
//             dataKey="gas"
//             stroke="#8884d8"
//             strokeWidth={2}
//             dot={{ r: 4 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default DeviceData;

//DeviceData.jsx
import React, { useState, useEffect } from "react";
import "./DeviceData.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  startMethaneNotifications,
  stopMethaneNotifications,
  readEnvironmentalData,
} from "../../services/bleService";

const DeviceData = ({ environmentalData }) => {
  const [gasLevels, setGasLevels] = useState([]);

  useEffect(() => {
    console.log("📌 device mounted!");

    return () => {
      console.log("🗑️ device unmountedQQQQQQQQQQ!!!!!!!!!!!!!!!!!!!");
    };
  }, []);

  useEffect(() => {
    if (environmentalData?.methane != null) {
      // Check if methane data is available
      setGasLevels((prev) => {
        if (prev.length === 1 && prev[0] === environmentalData.methane) {
          return prev; // if the first number is the same, don't add it again
        }
        // Add new methane value to the array, keeping only the last 30 readings
        const updated = [...prev, environmentalData.methane]; // ...prev = spread operator. It copies all the values from the previous array -> then in addiion to the new number all combine i the new array update witch will be the new state arr
        return updated.slice(-30); //fifo --> become the new state
      });
    }
  }, [environmentalData?.methane]); // Only re-run if methane data changes

  const chartData = gasLevels.map((value, index) => ({
    time: index + 1,
    gas: value,
  }));

  return (
    <div className="device-data">
      <h2>Gas Level Monitoring (LEL)</h2>
      <p>
        Latest Gas Level:{" "}
        <strong>{gasLevels[gasLevels.length - 1] || 0} LEL</strong>
      </p>
      <p>History: {gasLevels.join(", ")}</p>

      {/* Line Chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            label={{
              value: "Time (Units)",
              position: "insideBottom",
              offset: -5,
            }}
          />
          <YAxis
            label={{
              value: "Gas Level (LEL)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e1e",
              color: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #8884d8",
              fontSize: "14px",
            }}
            labelStyle={{ color: "#ffcc00", fontWeight: "bold" }}
          />
          <Line
            type="monotone"
            dataKey="gas"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeviceData;
