'use strict';

const fs = require('fs');
const express = require('express');
const app = express();
const bodyParser = require("body-parser");

if (!process.env.DISABLE_XORIGIN) {
  app.use((req, res, next) => {
    const allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    const origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get((req, res, next) => {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get((req, res) => {
		  res.sendFile(process.cwd() + '/views/index.html');
    });

app.route('/:query')
    .get((req, res, next) => {
      const query = req.params.query;
      let date, json;
      if (+query) date = new Date(+query);
      else date = new Date(query);
      if (date == "Invalid Date") {
        json = {
          "unix": null,
          "natural": null
        };
      }
      else {
        json = {
          "unix": Date.parse(date),
          "natural": date.toDateString()
        };
      }
      res.set("Content-Type", "application/json");
      res.json(json);
    });

// Respond not found to all the wrong routes
app.use((req, res, next) => {
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use((err, req, res, next) => {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
});



app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});

