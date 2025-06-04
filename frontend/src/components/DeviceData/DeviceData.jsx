// 🧪 Test deployment trigger for Netlify

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

  // * useEffect to update gas levels every 2 seconds — but only run when the component mounts (no re-renders)
  /**
   * This useEffect runs **once** when the component mounts (thanks to the empty dependency array []).
   * It starts a timer (setInterval) that:
   *   - Calls `generateGasLevel()` every 2 seconds.
   *   - Adds the new gas level to the current array using `setGasLevels`.
   *
   * ⚠️ Because `updateGasLevels` is defined INSIDE the useEffect, it does NOT go in the dependency array.
   *    This prevents ESLint errors and unnecessary re-renders.
   */
  useEffect(() => {
    console.log("Component Mounted: Starting interval...");

    // Define how to update the gas levels: add a new value to the array
    const updateGasLevels = (currentGasLevels) => {
      const newGasLevel = generateGasLevel(); // * Get a new simulated gas reading
      return [...currentGasLevels, newGasLevel]; // * Add it to the existing array
    };

    // Start interval: every 2 seconds, update gas levels
    const interval = setInterval(() => {
      console.log("Gas level updating...");
      setGasLevels(updateGasLevels); // * Use updater function form of setState
    }, 2000);

    // Cleanup function: stops interval when component is removed from screen
    return () => {
      console.log("Component Unmounted: Clearing interval...");
      clearInterval(interval);
    };
  }, []); // ✅ Empty array = run only once on mount

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
