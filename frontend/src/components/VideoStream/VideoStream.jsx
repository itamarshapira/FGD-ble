// src/components/VideoStream/VideoStream.jsx
import React from "react";
import "./VideoStream.css"; // Optional: for styles
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function VideoStream() {
  return (
    <div className="video-container">
      <h2>Live Video Stream</h2>
      {/* This box will eventually show the video */}
      <div className="video-box">
        {/* MJPEG stream shown here */}
        <img
          src="http://10.0.0.76/live2.mjpeg"
          alt="Live MJPEG Stream"
          className="video-feed"
        />
      </div>
      <div className="video-controls">
        <button>
          <FontAwesomeIcon icon={faCamera} />
        </button>
      </div>
    </div>
  );
}

export default VideoStream;
