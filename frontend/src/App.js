
import './App.css';
import Tabs from './components/Tabs/Tabs';
import Navbar from './components/Navbar/Navbar';
import Fotter from './components/Fotter/Fotter'


    
    function App() {
      return (
        <div className='app-container'>
          <Navbar />
          
          <Tabs />
          
          <Fotter/>
        </div>
      );
    }
    
  

export default App;
