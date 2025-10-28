import { useState } from "react";
import './App.css';
import Tabs from './components/Tabs/Tabs';
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Fotter/Fotter';
import VideoStream from "./components/VideoStream/VideoStream";
import Welcome from './components/Welcome/Welcome';
import Login from "./components/Login/Login";
// import AuthTest from './components/Login/AuthTest'; // Dev-only auth tester

function App() {
  const [isConnected, setIsConnected] = useState(false);
  
  // NEW: this locks the content until the device authorizes us
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  //* reset auth whenever we disconnect
  if (!isConnected && isAuthenticated) {
    setIsAuthenticated(false);
  }

  return (
    
    <div className="app-container">
      {/* <AuthTest/> */}
      <Navbar isConnected={isConnected} setIsConnected={setIsConnected} />

      {!isConnected ? (
        <Welcome />
      ) : !isAuthenticated ? (
       <Login 
  isAuthenticated={isAuthenticated} 
  setIsAuthenticated={setIsAuthenticated} 
/>

      ) : (
        <>
          <VideoStream />
          <Tabs />
        </>
      )}

      <Footer />
    </div>
  );
}

export default App;
