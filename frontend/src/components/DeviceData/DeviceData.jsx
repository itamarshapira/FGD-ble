import React, { useState, useEffect } from "react";
import "./DeviceData.css";

const DeviceData = () => {
  const [gasLevels, setGasLevels] = useState([]); // Store multiple gas levels

  //* Function to generate random gas levels --> a random number between 50 and 500. (PPM (Parts Per Million))
  const generateGasLevel = () => {
    return Math.floor(Math.random() * (500 - 50 + 1)) + 50; // Random PPM between 50-500
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
      setGasLevels((prevGasLevels) => {
        const newGasLevel = generateGasLevel();
        return [...prevGasLevels, newGasLevel]; // Add new value to the array
      });
    }, 2000);

    return () => {
      console.log("Component Unmounted: Clearing interval...");
      clearInterval(interval);
    }; // Cleanup on unmount
  }, []);

  return (
    <div className="device-data">
      <h2>Gas Level Monitoring (PPM)</h2>
      <p>
        Latest Gas Level:{" "}
        <strong>{gasLevels[gasLevels.length - 1] || 0} PPM</strong>
      </p>
      <p>History: {gasLevels.join(", ")}</p>{" "}
      {/* Display history as text for now */}
    </div>
  );
};

export default DeviceData;
