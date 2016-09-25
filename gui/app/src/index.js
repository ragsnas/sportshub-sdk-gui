import React from 'react';
import jQuery from 'jquery';
import ReactDOM from 'react-dom';
import './index.css';

var Bar = require("react-chartjs").Bar;
var Line = require("react-chartjs").Line;

var apiUrls = {
    getClient: 'http://127.0.0.1:8081/client',
    getSessionTicks: function(sessionId) {
      return 'http://127.0.0.1:8081/session/'+ sessionId
    },  
    getSessionForClientAndYear: function(clientId, year) {
      return 'http://127.0.0.1:8081/client/'+ clientId + '/session/year/'+ year
    },  
    getSessionForClientAndYearAndMonth: function(clientId, year, month) {
      return 'http://127.0.0.1:8081/client/'+ clientId + '/session/year/'+ year + '/month/' + month
    }  
}

var SportsHubStats = React.createClass({
  getInitialState: function() {
  	var year = new Date();
    return {client: undefined, year: year.getFullYear(), month: undefined};
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
      this.refs.sessionsMonthView.handleClientChange(e.chosenClientId);
  	} else {
  		console.log('No Client selected');
  		this.setState({client: undefined, year: this.state.year, month: this.state.month});
      this.refs.sessionsMonthView.handleClientChange(undefined);
  		if (this.refs.clientYearView) {this.refs.clientYearView.handleClientChange(undefined);}
  	}
  },
  handleMonthSelect: function(e) {
    this.refs.sessionsMonthView.handleMonthChange(e);
  },
  render: function() {
    return (
    	<div>
	      <ClientSelect url={apiUrls.getClient} pollInterval="60000" onClientChange={this.handleClientChange}></ClientSelect>
	      <ClientYearView ref="clientYearView" year={this.state.year} client={this.state.client} onMonthSelect={this.handleMonthSelect}></ClientYearView>
        <SessionsMonthView ref="sessionsMonthView" year={this.state.year} month={this.state.month} clientId={this.state.client}></SessionsMonthView>
    	</div>
	);
  }	
});


var ClientSession = React.createClass({
  getInitialState: function() {
    return {sessionData: undefined};
  },  
  loadSessionTicks: function(sessionId) {
    console.log('loading session #' + sessionId);
    return jQuery.ajax({
      url: apiUrls.getSessionTicks(sessionId),
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log('data received:', data);
      },
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });    
  },
  newSessionDataHandler: function(data) {
    this.setState({sessionData: data});
  },
  getSessionChartData: function() {
    var item = undefined,
        speeds = [],
        labels = [];
    for(var i=0;i <= this.state.sessionData.length;i++) {
      item = this.state.sessionData[i];
      if(item !== undefined) {
        speeds.push(item.speed);
        labels.push(item.seconds);
      }
    }
    /*
    */
    return {
      labels: labels,
      datasets: [{
        label: "speed",
        borderWidth: 1,
        data: speeds
      }]
    };
  },  
  onClickHandler: function(id) {
    console.log('clicked:', id);
    this.loadSessionTicks(id).done(this.newSessionDataHandler);
  },
  render: function() {
    var SessionLine = undefined;
    if(this.state.sessionData) {
      SessionLine = (
        <div>
          <Line ref="barChart" data={this.getSessionChartData()} width="800" height="150"></Line>
        </div>
      );
    }

    return (
        <div onClick={() => this.onClickHandler(this.props.session.id)} data-id={this.props.session.id}>
          #{this.props.session.id}: {this.props.session.start}
          {SessionLine}
        </div>
      );
  }
});

var SessionsMonthView = React.createClass({
  getInitialState: function() {
    return {month: this.props.month, year: this.props.year, clientId: this.props.clientId, sessionData: undefined};
  },
  monthMap: {
    Jan: 1, Feb: 2, Mar: 3, Apr: 4, Mai: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
  },
  handleClientChange: function(clientId) {
    console.log('SessionsMonthView detected new client:', clientId);
    this.setState({month: this.state.month, year: this.state.year, clientId: clientId, sessionData: undefined});
  },
  loadMonthSessionData: function(month) {
    console.log('loading clients (#' + this.state.clientId+") data for month " + month);
    return jQuery.ajax({
      url: apiUrls.getSessionForClientAndYearAndMonth(this.state.clientId, this.state.year, month),
      dataType: 'json',
      cache: false,
      success: function(data) {
        console.log('data received:', data);
      },
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleMonthChange: function(e) {
    var month = this.monthMap[e.label];
    this.setState({month: month, year: this.state.year, clientId: this.state.clientId, sessionData: undefined});
    console.log('Month Change detected (m:'+ month + ') now set to ' + this.state.month);
    console.log('State:', this.state);
    this.loadMonthSessionData(month).done(this.handleNewSessionData);
  },
  handleNewSessionData: function(data) {
    console.log('Setting SessionData for Week:', data);
    this.setState({month: this.state.month, year: this.state.year, clientId: this.state.clientId, sessionData: data});
  },
  getSessionChartData: function() {
    var item = undefined,
        dailyOrdered = {},
        data = [],
        month = new Date(this.state.sessionData[0].start).getMonth(), // January
        monthLabels = [],
        lastDayOfMonth = new Date(2008, month + 1, 0);
    console.log('lastDayOfMonth is:', lastDayOfMonth);
    for(var i=0;i <= this.state.sessionData.length;i++) {
      item = this.state.sessionData[i];
      if(item !== undefined) {
        var itemStart = new Date(item.start),
            itemDate = itemStart.getDate();
        if (!dailyOrdered.hasOwnProperty(itemDate)) {
          dailyOrdered[itemDate] = [];
        }
        dailyOrdered[itemDate].push(1);
      }
    }
    for(var j=1;j<=lastDayOfMonth.getDate();j++) {
      monthLabels.push(j.toString());
      data.push(dailyOrdered.hasOwnProperty(j) ? dailyOrdered[j].length : 0)
    }
    console.log('ordered data for month view:', data);
    /*
    */
    return {
      labels: monthLabels,
      datasets: [{
        label: "count sessions",
        borderWidth: 1,
        data: data
      }]
    };
  },
  onClickFunction: function(e) {

  },
  render: function() {
    if (this.state.sessionData) {
      var chartOptions = {events:['click']};
      var Sessions = this.state.sessionData.map(function(session) {
        return (
          <ClientSession key={session.id} session={session}></ClientSession>
        );
      });
      return (
        <div className="SessionsMonthView">
          <Bar ref="barChart" onClick={this.onClickFunction} data={this.getSessionChartData()} options={chartOptions} width="800" height="150"></Bar>
          {Sessions}
        </div>
      );
    } else {
      return false;
    }
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
  onClickFunction: function (e) {
    let activeBars = this.refs.barChart.getBarsAtEvent(e);
    console.log('activeBars:', activeBars[0].label);
    this.props.onMonthSelect({label: activeBars[0].label});
  },
  getSessionChartData: function() {
    var item = undefined,
        monthlyOrdered = {},
        data = [];
    for(var i=0;i <= this.state.sessionData.length;i++) {
      item = this.state.sessionData[i];
      if (item !== undefined) {
        var itemStart = new Date(item.start),
            itemMonth = itemStart.getMonth();
        if (!monthlyOrdered.hasOwnProperty(itemMonth)) {
          monthlyOrdered[itemMonth] = [];
        }
        monthlyOrdered[itemMonth].push(1);
      }
    }
    for(var j=0;j<=12;j++) {
      data.push(monthlyOrdered.hasOwnProperty(j) ? monthlyOrdered[j].length : 0)
    }
    console.log(data);
    return {
      labels: ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [{
        label: "count sessions",
        borderWidth: 1,
        data: data
      }]
    };
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
		}
	},
	render: function() {
		console.log('rendering client view with client being ', this.state.client);
		if (this.state.client && this.state.client.username !== undefined && this.state.sessionData) {
      var chartOptions = {events:['click']};
			return (
				<div className="clientYearView">
					<h2>Year {this.state.year} / Client {this.state.client.username}</h2>
					<Bar ref="barChart" onClick={this.onClickFunction} data={this.getSessionChartData()} options={chartOptions} width="800" height="150"></Bar>
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
