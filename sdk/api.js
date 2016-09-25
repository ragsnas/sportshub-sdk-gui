var express = require('express');
var app = express();
var mysql = require('mysql');
var mysqlConnection = require('./mysqlConnection.js');

function setDefaultHeaders(res) {
  res.append('Access-Control-Allow-Origin', '*');
  res.append('Content-Type', 'application/json');
}

app.get('/client', function (req, res) {
  setDefaultHeaders(res);
  mysqlConnection.query('SELECT client.id, client.clientId, client.created, client.username FROM client', function(err, rows, fields) {
    if(err) {
      res.status(500);
      res.end();
      console.error('Problems with MySQL. Error:', err);
    }
    else {
      res.status(200);
 	    res.end( JSON.stringify( rows ) );
    }
  });
});

app.get('/client/:id', function (req, res) {
  setDefaultHeaders(res);
  var clientId = parseInt(req.params.id, 10);
  mysqlConnection.query('SELECT client.id, client.clientId, client.created, client.username FROM client WHERE id='+clientId, function(err, rows, fields) {
    if(err) {
      res.status(500);
 	  res.end( JSON.stringify( {errorMsg: 'MySql Error'} ) );
      console.error('Problems with MySQL. Error:', err);
    }
    else if (rows.length === 1) {
      res.status(200);
 	  res.end( JSON.stringify( rows[0] ) );
    }
    else {
      res.status(404);
 	  res.end( JSON.stringify( {errorMsg: 'User not found'} ) );
    }
  });
});

app.get('/session', function (req, res) {
  setDefaultHeaders(res);
  mysqlConnection.query('SELECT * FROM session', function(err, rows, fields) {
    if(err) {
      res.status(500);
 	  res.end( JSON.stringify( {errorMsg: 'MySql Error'} ) );
      console.error('Problems with MySQL. Error:', err);
    }
    else {
      res.status(200);
 	  res.end( JSON.stringify( rows ) );
    }
  });
});

app.get('/client/:id/session/year/:year', function (req, res) {
  setDefaultHeaders(res);
  var clientId = parseInt(req.params.id, 10),
      year = parseInt(req.params.year, 10);
  mysqlConnection.query(
    "SELECT * FROM session WHERE client_id="+clientId+" "
    +"AND YEAR(start)='"+year+"' "
    , function(err, rows, fields) {
    if(err) {
      res.status(500);
    res.end( JSON.stringify( {errorMsg: 'MySql Error', error: err} ) );
      console.error('Problems with MySQL. Error:', err);
    }
    else {
      res.status(200);
    res.end( JSON.stringify( rows ) );
    }
  });
});

app.get('/client/:id/session/year/:year/month/:month', function (req, res) {
  setDefaultHeaders(res);
  var clientId = parseInt(req.params.id, 10),
      year = parseInt(req.params.year, 10),
      month = parseInt(req.params.month, 10);
  mysqlConnection.query(
    "SELECT * FROM session WHERE client_id="+clientId+" "
    +"AND YEAR(start)='"+year+"' AND MONTH(start)='"+month+"'"
    , function(err, rows, fields) {
    if(err) {
      res.status(500);
    res.end( JSON.stringify( {errorMsg: 'MySql Error', error: err} ) );
      console.error('Problems with MySQL. Error:', err);
    }
    else {
      res.status(200);
    res.end( JSON.stringify( rows ) );
    }
  });
});

app.get('/session/:id', function (req, res) {
  setDefaultHeaders(res);
  var sessionId = parseInt(req.params.id, 10);
  mysqlConnection.query(
  	'SELECT * FROM session_message WHERE session_id = '+sessionId, 
  	function(err, rows, fields) {
    if(err) {
      res.status(500);
 	  res.end( JSON.stringify( {errorMsg: 'MySql Error'} ) );
      console.error('Problems with MySQL. Error:', err);
    }
    else if (rows.length > 0) {
      res.status(200);
 	  res.end( JSON.stringify( rows ) );
    }
    else {
      res.status(404);
 	  res.end( JSON.stringify( {errorMsg: 'Session not found'} ) );
    }
  });
});

var server = app.listen(8081, function () {
   var host = server.address().address
   var port = server.address().port
   console.log("Example app listening at http://%s:%s", host, port)
})