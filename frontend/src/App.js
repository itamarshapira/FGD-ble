
import './App.css';
import Tabs from './components/Tabs/Tabs';
import Navbar from './components/Navbar/Navbar';
import Fotter from './components/Fotter/Fotter'
import VideoStream from "./components/VideoStream/VideoStream";



    
    function App() {
      return (
        <div className='app-container'>
          <Navbar />
          
          <VideoStream />

          
          <Tabs />
          
          <Fotter />
        </div>
      );
    }
    
  

export default App;
