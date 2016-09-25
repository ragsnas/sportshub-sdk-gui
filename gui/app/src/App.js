import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {

  constructor() {
    super();
    this.clientId = null;
    this.sessionId = null;
  }

  componentWillMount() {

  }

  render() {
    var p = 7;
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>sporthub stats</h2>
        </div>
        <p className="App-intro">
          To get {p} started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
