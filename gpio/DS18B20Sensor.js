// Helper for sensor DS18B20

var ds18b20 = require('ds18b20');

module.exports = {
  // get list of sensors
  getSensors: function(callback){
    ds18b20.sensors(function(err, ids){
      if(err){
        callback(err, null);
      }else{
        callback(null, ids);
      }
    });
  },

  getTemperature: function(_sensor, callback){
    ds18b20.temperature(_sensor, function(err, value){
      if(err){
        callback(err, null);
      }else{
        callback(null, {sensor: _sensor, temperature: value});
      }
    });
  },

  getTemperatureSync: function(sensor){
    return ds18b20.temperatureSync(sensor);
  }
};
