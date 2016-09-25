import React from 'react';
import jQuery from 'jquery';
import ReactDOM from 'react-dom';
import vis from 'vis';
import './index.css';

var apiUrls = {
    getClient: 'http://127.0.0.1:8081/client',
    getSessionForClientAndYear: function(clientId, year) {
      return 'http://127.0.0.1:8081/client/'+ clientId + '/session/year/'+ year
    }  
}

var SportsHubStats = React.createClass({
  getInitialState: function() {
  	var year = new Date();
    return {client: undefined, year: year.getFullYear()};
  },
  loadClient: function(clientId) {
    console.log('loading client #' + clientId);
  	return jQuery.ajax({
      url: apiUrls.getClient + '/' + clientId,
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log('Client (#'+clientId+') loaded:', data);
      },
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleClientChange: function(e) {
  	console.log('SportsHubStats detects ClientChange:', e);
  	//@TODO: receive client via api and send to clientYearView
  	if (e.chosenClientId) {
  		this.loadClient(e.chosenClientId).then(this.refs.clientYearView.handleClientChange);
  	} else {
  		console.log('No Client selected');
  		this.setState({client: undefined, year: this.state.year});
  		if (this.refs.clientYearView) {this.refs.clientYearView.handleClientChange(undefined);}
  	}
  },
  render: function() {
    return (
    	<div>
	      <ClientSelect url={apiUrls.getClient} pollInterval="60000" onClientChange={this.handleClientChange}></ClientSelect>
	      <ClientYearView ref="clientYearView" year={this.state.year} client={this.state.client}></ClientYearView>
    	</div>
	);
  }	
});

var ClientYearView = React.createClass({
	getInitialState: function() {
		return {year: this.props.year, client: this.props.client, sessionData: undefined};
	},
  loadSessionForUserAndYear: function() {
    console.log('loading session for user #' + this.state.client.id + ' and year + '+ this.state.year + '.');
    return jQuery.ajax({
      url: apiUrls.getSessionForClientAndYear(this.state.client.id, this.state.year),
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log('Client (#'+this.state.client.id+') session data for '+this.state.year+' loaded:', data);
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  setSessionData: function(sessionData) {
    this.setState({year: this.state.year, client: this.state.client, sessionData: sessionData});
  },
	handleClientChange: function(client) {
    this.setState({year: this.state.year, client: client, sessionData: undefined});
		console.log('ClientYearView has to react to new client:', client);
    // loading sessions for user and year
    this.loadSessionForUserAndYear().done(this.setSessionData);
	},
	getContainerId: function() {
		return 'clientYearView_c' + (this.state.client ? this.state.client.id : '_') + '_y' + (this.state.year);
	},
	componentDidUpdate: function() {
		if(this.state.client) {
			console.log('ClientYearView: this was just rerendered!');
			var container = document.getElementById(this.getContainerId());
      container.innerHTML = '';
			console.log('container is:', container);
			console.log('this.state.client: ', this.state.client);

			// Create a DataSet (allows two way data-binding)
			var items = new vis.DataSet(this.state.sessionData);

      var minDate = new Date(this.state.year + '-01-01 00:00:00'),
          maxDate = new Date(this.state.year + '-12-31 23:59:59');
      //minDate.setFullYear(this.state.year).setMonth(1).setDate()(1).setHours(0).setMinutes(0).setSeconds(0);
      //maxDate.setFullYear(this.state.year).setMonth(12).setDate()(31).setHours(23).setMinutes(59).setSeconds(59);

			// Configuration for the Timeline
			var options = {
        selectable: true,
        multiselect: false,
        min: minDate,
        max: maxDate
      };

			// Create a Timeline
			new vis.Timeline(container, items, options);		
		}
	},
	render: function() {
		console.log('rendering client view with client being ', this.state.client);
		if (this.state.client && this.state.client.username !== undefined) {
			return (
				<div className="clientYearView">
					<h2>Year {this.state.year} / Client {this.state.client.username}</h2>
					<div id={this.getContainerId()}></div>
				</div>
			);
		} else {
			return false;
		}
  }
});

var ClientSelect = React.createClass({
  getInitialState: function() {
    return {clientData: [], chosenClientId: undefined};
  },	
  handleClientChange: function(e) {
  	this.setState({clientData: this.state.clientData, chosenClientId: e.target.value});
  	console.log('e.target.value: ' + e.target.value);
  	this.props.onClientChange({chosenClientId: e.target.value});
  },
  componentDidMount: function() {
    this.updateClients();
    setInterval(this.updateClients, this.props.pollInterval);  	
  },  
  updateClients: function() {
  	console.log('updating clients list');
    return jQuery.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({clientData: data, chosenClientId: data.id});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  render: function() {
    var ClientSelectOptions = this.state.clientData.map(function(client) {
      return (
        <ClientSelectOption key={client.id} client={client}></ClientSelectOption>
      );
    });
    return (
    	<form className="clientSelectForm">
	      <select ref="clientSelect" onChange={this.handleClientChange} className="clientSelect">
	      	<option value="">Please select</option>
	        {ClientSelectOptions}
	      </select>
	    </form>
    );
  }
});

var ClientSelectOption = React.createClass({
  render: function() {
    return (
      <option value={this.props.client.id}>
        {this.props.client.username} / {this.props.client.clientId}
      </option>
    );
  }
});

ReactDOM.render(
  React.createElement(SportsHubStats, null),
  document.getElementById('root')
);
