// GPIO Helper for setup and manipulate GPIO pins of Viola Module
// @author Aderbal Nunes <aderbalnunes@gmail.com>
// 27 Jul 2016

// FS module
var fs = require('fs');
// Pin Object
var GpioPin = require('./pin').GPIOPin;
// gpio export path
const GPIO_EXPORT_PATH = '/sys/class/gpio/export';

module.exports = {

  // // pin object
  // GPIOPin: function(_id, _direction, _state){
  //   this.number = _id;
  //   this.direction = _direction;
  //   this.value = _state;
  //   this.path = '/sys/class/gpio/gpio'+_id+'/';
  // },

  // Setup pin
  setupPin: function(pin, callback){
    if(typeof pin !== 'object'){
      // create default
      pin = new GpioPin(pin, 'out', 0);
    }
    // check if pin already exported
    fs.stat(pin.path, function(err, stats){
      if(!err && stats){
        // gpio already exported
        callback(null, pin);
      }else{
        // export it
        fs.writeFile(GPIO_EXPORT_PATH, pin.number, function(err){
          if(err){
            // erro to export
            callback(err, null);
          }else{
            // configure direction
            fs.writeFile(pin.path + 'direction', pin.direction, function(err){
              if(err){
                callback(err, null);
                return;
              }
            });
            // return pin exported
            callback(null, pin);
          }
        });
      }
    });
  },

  // set direction of pin
  setDirection: function(pin, callback){
    // set direction of pin
    fs.writeFile(pin.path + 'direction', pin.direction, function(err){
      if(err){
        callback(err, null);
      }else{
        callback(null, pin);
      }
    });
  },

  // check if pin has installed
  checkPin: function(number, callback){
    fs.stat('/sys/class/gpio/gpio'+number+'/', function(err, stats){
      if(!err){
        // read direction
        fs.readFile('/sys/class/gpio/gpio'+number+'/direction', function(err, data){
          if(!err){
            var direction = data.toString().trim();
            // get value of pin
            fs.readFile('/sys/class/gpio/gpio'+number+'/value', function(err, value){
              if(!err && value){
                callback(null, new GpioPin(number, direction, value.toString().trim()));
              }else{
                callback(err, null);
              }
            });
          }else{
            callback(err, null);
          }
        });
      }else{
        callback(err, null);
      }
    });
  },

  setValue: function(_pin, _value, callback){
    // set value to pin exported
    fs.writeFile(_pin.path + 'value', _value, function(err){
      if(!err){
        _pin.value = _value;
        callback(null, _pin);
      }else{
        callback(err, null);
      }
      // toggle:
      //pin.value = ? pin.value = 0 : pin.value = 1;
    });
  }
};
