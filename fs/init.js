load('api_config.js');
load('api_gpio.js');
load('api_shadow.js');

let led = Cfg.get('board.led1.pin');  // Built-in LED GPIO number
let state = {on: false};              // Device state - LED on/off status
let matrixObj = {matrix: []};

// Set up Shadow handler to synchronise device state with the shadow state
Shadow.addHandler(function(event, obj) {
  if (event === 'CONNECTED') {
    print("Got CONNECTED event");
    Shadow.update(0, state);
  } else if (event === 'UPDATE_DELTA') {
    print("Got DELTA event");
    // Got delta. Iterate over the delta keys, handle those we know about
    for (let key in obj) {
      print("found key ", key);
      if (key === 'matrix') {
        matrixObj.matrix = obj.matrix;
        Shadow.update(0, matrixObj);
        print('Found Matrix');
        for (let i=0; i < matrixObj.matrix.length; i++) {
          let row = matrixObj.matrix[i];
         for (let j=0; j < row.length; j++) {
           let value = row[j];
           print('row =', i,' column =', j, ' number =', value);
         }
       }
      } else {
        print('Dont know how to handle key', key);
      }
    }
    // Once we've done synchronising with the shadow, report our state.
    Shadow.update(0, state);
  }
});

// Demonstrate how to use shadow to periodically report metrics
load('api_timer.js');
load('api_sys.js');
Timer.set(5000, Timer.REPEAT, function() {
  Shadow.update(0, {uptime: Sys.uptime()});
}, null);
