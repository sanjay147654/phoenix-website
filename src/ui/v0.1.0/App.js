import React, { Component } from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './App.css';
import Dashboard from './Components/Dashboard.jsx';
import Forecast from './Components/Forecast.jsx';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Router>
          <div>
          <Route exact path="/" component={Dashboard}/>
          <Route exact path="/forecast" component={Forecast}/>
          </div>
        </Router>
      </div>
    );
  }
}

export default App;