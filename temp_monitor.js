// Monitoring temperature

// constants
const LIMIT_TURN_ON_FAN = 28.8;
const LIMIT_TURN_OFF_FAN = 27.9;
const LIMIT_IGNORE_FAN = 27.5;
const NUM_PIN_FAN1 = 17;
const STATUS_ON = 1;
const STATUS_OFF = 0;

var ds18b20   = require('./gpio/DS18B20Sensor'),
    util      = require('util'),
    sensors   = [],
    fans      = {},
    GpioPin   = require('./gpio/pin').GPIOPin,
    io_helper = require('./gpio/helper');

function changePin(pin_number, value){
  //io_helper.checkPin(pin_number, function(err, pin){
    //if(!err){
    io_helper.setValue(fans[pin_number], value, function(err, pin){
      if(err){
        util.log('Erro ao tentar mudar o valor do pin %d para: %d', pin_number, value);
      }else{
        fans[pin_number].value = value;
        //console.log(fans[pin_number].value);
      }
    });
    //}else{
      //util.log('Pin %d não configurado', pin_number);
    //}
  // });
}

function monitoring(){
  var i = 0, l = sensors.length, current_temp;
  for(;i<l;i++){
    current_temp = ds18b20.getTemperatureSync(sensors[i]);
    util.log('Temperature sensor %d: %s', i+1, current_temp.toString());
    if(current_temp >= LIMIT_TURN_ON_FAN && fans[NUM_PIN_FAN1].value == STATUS_OFF){
      util.log('Turn on fans');
      // turn on fan
      changePin(NUM_PIN_FAN1, STATUS_ON);
    }else if(current_temp <= LIMIT_TURN_OFF_FAN && fans[NUM_PIN_FAN1].value == STATUS_ON){
      util.log('Turn off fans');
      changePin(NUM_PIN_FAN1, STATUS_OFF);
    }
  }
  setTimeout(function(){ monitoring() }, 3000);
}
// create pin fan
fans[NUM_PIN_FAN1] = new GpioPin(NUM_PIN_FAN1, 'out', 0);

// configure pins
var i;
for(i in fans){
  io_helper.setupPin(fans[i], function(err, pin){
    if(err){
      throw err;
    }
  });
}
// get sensors on start
ds18b20.getSensors(function(err,list){
  if(err){
    throw err;
  }else{
    sensors = list;
    monitoring();
  }
});
