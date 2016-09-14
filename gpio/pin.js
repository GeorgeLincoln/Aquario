// Pin Object
module.exports = {
  GPIOPin: function(_id, _direction, _state){
    this.number = _id;
    this.direction = _direction;
    this.value = _state;
    this.path = '/sys/class/gpio/gpio'+_id+'/';
  }
}
