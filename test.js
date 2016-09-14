//test

var ds18b20 = require('ds18b20');
var sensor = undefined;

ds18b20.sensors(function(err, ids) {
  // got sensor IDs ...
  //ds18b20.temperature(ids[0], function(err, value) {
    //console.log('Current temperature is', value);
  //});
  console.log(ids);
  //sensor = ids[0];
  //tiker();
});

function tiker(){
 console.log(ds18b20.temperatureSync(sensor));
 setTimeout(function(){ tiker(); }, 3000);
}

