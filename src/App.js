// import logo from './logo.svg';
import { useEffect } from 'react';
import './App.css';
import { startTokenRefreshLoop } from './utils/auth';
import Auth from './Pages/Auth.tsx';
import Today from './Pages/Stats/Day/Day.tsx';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Stats from './Pages/Stats/Stats.tsx';
import Login from './Pages/Login/LOgin.tsx';
import AuthLogin from './Pages/Login/AuthLogin.tsx';
import Ottok from './Pages/Stats/Ottok/Ottok.tsx';

function App() {
  useEffect(() => {
    startTokenRefreshLoop();
  }, []);

  return (
    <div className="App">
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
       <Router>
            <Routes>
                <Route path="/" element={<AuthLogin/>} />
                <Route path="/tekhlogin" element={<Login/>} />
                <Route path="/auth" element={<Auth/>} />
                <Route path="/today" element={ <Today/>} />
                <Route path="/stats" element={ <Stats/>} />
                <Route path="/ottok" element={ <Ottok/>} />
            </Routes>
        </Router>
      
     
    </div>
  );
}

export default App;
