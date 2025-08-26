// src/components/VideoStream/VideoStream.jsx

import React, { useState } from "react";
import "./VideoStream.css"; // Optional: for styles
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { console.log } from "../../services/bleService";

function VideoStream() {
  const [ipAddress, setIpAddress] = useState("10.0.0.76");
  const [streamIp, setStreamIp] = useState("10.0.0.76"); //  only apply when button clicked

  const streamUrl = `http://${streamIp}/live.mjpeg`;
  console.log("Stream URL:", streamUrl);
  const handleApplyIp = () => {
    setStreamIp(ipAddress); //  use current input only when clicking
    console.log(` IP applied: ${ipAddress}`);
  };

  return (
    <div className="video-container">
      <h2>Live Video Stream</h2>

      {/*  Input and Apply button */}
      <div>
        <input
          type="text"
          value={ipAddress}
          onChange={(e) => setIpAddress(e.target.value)}
          placeholder="Enter Raspberry Pi IP"
        />
        <button onClick={handleApplyIp}>Apply IP</button>
      </div>

      {/*  MJPEG Stream */}
      <div className="video-box">
        <img src={streamUrl} alt="Live MJPEG Stream" className="video-feed" />
      </div>

      <div className="video-controls">
        <button>
          <FontAwesomeIcon icon={faCamera} />
        </button>
      </div>

      <hr />
    </div>
  );
}

export default VideoStream;
