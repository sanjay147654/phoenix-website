import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import Dashboard from './Components/Dashboard.jsx';
import Forecast from './Components/Forecast.jsx';
import Login from './Components/Login.jsx';
import Device from './Components/Device.jsx';
import Map from './Components/Map.jsx';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <div>
            <Route exact path="/" component={Dashboard}/>
            <Route exact path="/forecast" component={Forecast}/>
            <Route exact path="/device" component={Device}/>
            <Route exact path="/login" component={Login}/>
            <Route exact path="/map" component={Map}/>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;