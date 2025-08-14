import { useState } from "react";
import './App.css';
import Tabs from './components/Tabs/Tabs';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Fotter/Fotter';
import VideoStream from "./components/VideoStream/VideoStream";
import Welcome from './components/Welcome/Welcome';

function App() {
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="app-container">
      <Navbar isConnected={isConnected} setIsConnected={setIsConnected} />
      {isConnected ? (
        <>
          <VideoStream />
          <Tabs />
        </>
      ) : (
        <div><Welcome /></div>
      )}
      <Footer /> {/* Always visible */}
    </div>
  );
}

export default App;
