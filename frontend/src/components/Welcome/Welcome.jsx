import React from "react";
import Logo from "../Logo/Logo"; // Import the Logo component
import "./Welcome.css"; // Import the styling

function Welcome() {
  return (
    <div className="welcome-container">
      <h2>Welcome to Fire & Gas Detection Technologies Inc.</h2>
      <p>
        We are committed to respond to the market requirements for improved
        performance and more reliable flame & gas detection products.
      </p>
      <ul>
        <p>That includes:</p>
        <li>Fastest speed of response</li>
        <li>Highest immunity to false alarms</li>
        <li>Operation in all weather conditions</li>
        <li>Reduced cost of ownership</li>
        <li>Expert technical & application support</li>
      </ul>
      {/* Logo at the bottom */}
      <Logo />
    </div>
  );
}

export default Welcome;
