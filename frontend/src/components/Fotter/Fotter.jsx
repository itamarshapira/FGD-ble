import "./Fotter.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faLinkedinIn } from "@fortawesome/free-brands-svg-icons";
import wideLogo from "./wideLogo.png";

function Fotter() {
  return (
    <div className="fotter">
      <img
        src={wideLogo}
        alt="FG Detection Logo"
        style={{ maxWidth: "180px", marginBottom: "12px" }}
      />

      <div className="footer-social">
        <a
          href="https://github.com/itamarshapira/FGD-ble"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faGithub} />
        </a>

        <a
          href="https://www.linkedin.com/in/itamar-shapira-921a72279/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FontAwesomeIcon icon={faLinkedinIn} />
        </a>
      </div>
      <p>© 2025 Itamar Shapira - FG Detection. All rights reserved.</p>
    </div>
  );
}

export default Fotter;
