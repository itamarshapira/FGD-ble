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

const DeviceData = () => {
  const [gasLevels, setGasLevels] = useState([]); // Store multiple gas levels (array)

  //* Function to generate random gas levels --> a random number between 50 and 500. (PPM (Parts Per Million))
  const generateGasLevel = () => {
    return Math.floor(Math.random() * (500 - 50 + 1)) + 50; // Random PPM between 50-500
  };

  // * Function to update the gas levels array
  /**
   * @param {Array} currentGasLevels - The latest state of gas levels before the update.
   * @returns {Array} A new array containing the previous gas levels plus the new gas level.
   */
  const updateGasLevels = (currentGasLevels) => {
    const newGasLevel = generateGasLevel(); // * Calls `generateGasLevel()` to get a new random gas reading.
    return [...currentGasLevels, newGasLevel];
  };

  // * useEffect to update gas level every 2 seconds - but render only when component mount
  /**
   * Runs once when the component mounts ([] dependency array).
   * Starts a timer (setInterval) that Calls generateGasLevel(), Updates gasLevel every 2 seconds. without Rendering th component!!
   */
  useEffect(() => {
    console.log("Component Mounted: Starting interval...");
    const interval = setInterval(() => {
      console.log("Gas level updating...");
      setGasLevels(updateGasLevels); //* calls updateGasLevels to update the state
    }, 2000);

    return () => {
      console.log("Component Unmounted: Clearing interval...");
      clearInterval(interval);
    }; // Cleanup on unmount
  }, [updateGasLevels]); //* Now `updateGasLevels` is listed as a dependency

  // * Convert gasLevels into Recharts data format
  /**
   * Recharts requires an array of objects like:
   * [{ time: 1, gas: 100 }, { time: 2, gas: 200 }]
   */
  const chartData = gasLevels.map((value, index) => ({
    //* Map loops through the array and creates a new array
    time: index + 2, // X-axis represents time (in seconds). auto start from 0
    gas: value, // Y-axis represents gas level. auto assigned to gas level
  }));

  console.log("Chart Data for Graph:", chartData); // Debugging - Check if data exists

  return (
    <div className="device-data">
      <h2>Gas Level Monitoring (PPM)</h2>
      <p>
        Latest Gas Level:{" "}
        <strong>{gasLevels[gasLevels.length - 1] || 0} PPM</strong>
      </p>
      <p>History: {gasLevels.join(", ")}</p>{" "}
      {/* 🔹 Converts an array into a readable string */}
      {/* 🔹 Render the line chart */}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />{" "}
          {/* 🔹 Adds a grid for better readability */}
          <XAxis
            dataKey="time"
            label={{ value: "Time (s)", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{
              value: "Gas Level (PPM)",
              angle: -90,
              position: "insideLeft",
            }}
          />
          {/* 🔹 Corrected Tooltip with styling */}
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e1e1e", // Dark background
              color: "#ffffff", // White text
              borderRadius: "8px", // Rounded corners
              border: "1px solid #8884d8", // Purple border
              fontSize: "14px", // Adjust font size
            }}
            labelStyle={{ color: "#ffcc00", fontWeight: "bold" }} // Custom label color
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
