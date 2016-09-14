//Node application to comunicate
// @author Aderbal Nunes <aderbal@zenitetecnologia.com.br>
// 27 Jul 2016

const COD_FAULT   = 105;
const COD_SUCCESS = 100;
const COD_UNAUTHORIZED = 401;

// dependencies
var express   = require('express'),
    http      = require('http'),
    bodyParse = require('body-parser'),
    expressJwt= require('express-jwt'),
    jwt       = require('jsonwebtoken'),
    meOverride= require('method-override'),
    fs        = require('fs'),
    pins      = {},
    io_helper = require('./gpio/helper'),
    GpioPin   = require('./gpio/pin').GPIOPin,
    secret    = "GCKZIKGZ0CWPW7P",
    that      = {version: '1.0.5', id: 0},
    ds18b20   = require('./gpio/DS18B20Sensor'),
    util      = require('util');

// Fetch the computer's mac address
require('getmac').getMac(function(err,macAddress){
    if(!err){
      that.id = macAddress.replace(/\:/g,'');
    }
})
// unless token
var unlessRouter = {path: ['/api/auth', '/api/version']};
// app
var app = module.exports.app = express();
// server
var server = http.createServer(app);
//server.socket = socket;
//var io = require('socket.io').listen(server);
// Configuration
// We are going to protect /api routes with JWT
app.use('/api', expressJwt({secret: secret}).unless( unlessRouter ));
app.set('port', process.env.PORT || 3000);
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParse.urlencoded({'extended':'true'}));
app.use(bodyParse.json());
app.use(bodyParse.json({ type: 'application/vnd.api+json' }));
app.use(meOverride());

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST,GET,PUT,DELETE,OPTIONS,PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Timezone");
  next();
});
// make a response
function makeResponse(code, data){
  return {
    resultData: data,
    eventCode: code
  };
}
// handler error
app.use(function(err,req,res,next){
  res.status(401);
  util.log('IP: '+req.connection.remoteAddress+' try to access');
  res.json(makeResponse(COD_UNAUTHORIZED, that));
});

// get version
app.get('/api/version', function(req,res){
  res.json(that);
});

// autenticate
app.post('/api/auth', function(req,res){
  if(!req.body.email || !req.body.pwd){
     res.json(makeResponse(COD_FAULT, 'Params not valid'));
     return;
  }
  util.log('IP: '+req.connection.remoteAddress+' try to auth');
  // fake login and fake user data
  var u = {email: 'aderbal@aderbalnunes.com', name: 'aderbal'};
  if(req.body.email === u.name && req.body.pwd === '123456'){
   //var u = {email: 'aderbal@zenitetecnologia.com.br', name: 'Aderbas'};
    var token = jwt.sign(u, secret, { expiresIn: 60*2000 });
    // return token
    res.json(makeResponse(COD_SUCCESS, {token: token}));
  }else{
    res.json(makeResponse(COD_FAULT, 'Email or Password not match'));
    return;
  }
});

// setup pin
app.get('/api/configure/:pin/:mode', function(req,res){
  var number_pin = req.params.pin;
  var mode = req.params.mode;
  //if(!pins[number_pin]){
  // create and setup pin
  var gpio_pin = new GpioPin(number_pin, mode, 0);
  io_helper.setupPin(gpio_pin, function(err, pin){
    if(err){
      res.json(makeResponse(COD_FAULT, 'Failed to install pin: '+number_pin));
    }else{
      //pins[number_pin] = gpio_pin;
      res.json(makeResponse(COD_SUCCESS, gpio_pin));
    }
  });
//  }
});

// set value of pin
app.get('/api/pin/:pin/:value', function(req,res){
  var number_pin = req.params.pin;
  var value = req.params.value;
  io_helper.checkPin(number_pin, function(err, pin){
    if(!err){
      io_helper.setValue(pin, value, function(err, pin){
        if(!err){
          res.json(makeResponse(COD_SUCCESS, pin));
        }else{
          res.json(makeResponse(COD_FAULT, 'Error to set value for pin: '+number_pin+'.'));
        }
      });
    }else{
      res.json(makeResponse(COD_FAULT, 'Value not set for pin '+number_pin+'. Use: /configure/pin/mode'));
    }
  });
});

// get value
app.get('/api/pin/:pin', function(req,res){
  var number_pin = req.params.pin;
  io_helper.checkPin(number_pin, function(err, pin){
    if(!err){
      res.json(makeResponse(COD_SUCCESS, pin));
    }else{
      res.json(makeResponse(COD_FAULT, 'Pin: '+number_pin+' not installed. Use: /configure/pin/mode'));
    }
  });
});

// get list sensors
app.get('/api/temperature/sensors', function(req,res){
  ds18b20.getSensors(function(err,sensors){
    if(!err){
      res.json(makeResponse(COD_SUCCESS, sensors));
    }else{
      res.json(makeResponse(COD_FAULT, 'Sensors not found.'));
    }
  });
});

// get temperature of sensor
app.get("/api/temperature/:sensor", function(req,res){
  var sen = req.params.sensor;
  ds18b20.getTemperature(sen, function(err,sensor){
    if(!err){
      res.json(makeResponse(COD_SUCCESS, sensor));
    }else{
      res.json(makeResponse(COD_FAULT, 'Sensor '+sen+' not found.'));
    }
  });
});


// Start server
server.listen(app.get('port'), function(){
  util.log("IOT server listening on port "+ app.get('port'));
});
