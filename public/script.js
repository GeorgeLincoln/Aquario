//
var apiUrl = 'http://192.168.1.100:3000/api/';
(function(){
  var token, sensor, pin_fan = 17;
  // autenticate on start application
  $.post(apiUrl+'auth', { email: "aderbal", pwd: "123456" }, function(res){
      // cache token
      if(res.eventCode === 100){
        token = 'Bearer '+res.resultData.token;
        init();
      }else{
        alert('Falha na autenticação');
      }
  });

  function init(){
    // get current sensor
    $.ajax({url: apiUrl+'temperature/sensors', headers: {'Authorization' : token}})
      .done(function(sensors){
        if(sensors.resultData.length > 0){
          sensor = sensors.resultData[0];
          pysics();
        }
    });
  }

  function pysics(){
    $.ajax({url: apiUrl+'temperature/'+sensor, headers: {'Authorization' : token}})
      .done(function(res){
        if(res.eventCode === 100){
          $('#temp-dash').text(res.resultData.temperature+'º');
        }
    });

    $.ajax({url: apiUrl+'pin/'+pin_fan, headers: {'Authorization' : token}})
      .done(function(res){
        if(res.eventCode === 100){
          if(res.resultData.value === '1'){
            // set stats on
            $("#switch-1").prop('checked', true);
            document.querySelector("#fan_switch").MaterialSwitch.on();
            $("#fan-dash span").text('Ligada');
            $("#fan-dash i").removeClass('orange600').addClass('green600');
          }else{
            // set stats off
            $("#switch-1").prop('checked', false);
            document.querySelector("#fan_switch").MaterialSwitch.off();
            $("#fan-dash span").text('Desligada');
            $("#fan-dash i").removeClass('green600').addClass('orange600');
          }
          componentHandler.upgradeDom();
        }
    });

    setTimeout(function(){pysics();}, 3000);
  }

}());
