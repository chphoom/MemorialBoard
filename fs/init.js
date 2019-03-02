load('api_config.js');
load('api_gpio.js');
load('api_shadow.js');

load('api_timer.js');
load('api_neopixel.js');

//neopixel example
let pin = 2, numPixels = 400, colorOrder = NeoPixel.RGB;
let strip = NeoPixel.create(pin, numPixels, colorOrder);
let matrixObj = {lightsconfig: []};
let r = 249, g = 112, b = 0;
//let ledtest = true;


/* Timer.set(1000, Timer.REPEAT, function() {
  let pixel = k++ % numPixels;
  let r = 249, g = 112, b = 0;
  strip.clear();
  strip.setPixel(pixel, r, g, b);
  strip.show();

  //GPIO.set_mode(pin, GPIO.MODE_OUTPUT);
  //GPIO.write(pin, ledtest);
  //ledtest = !ledtest;
  print('setting LED to pin ', pin);
}, null);
*/

// Set up Shadow handler to synchronise device state with the shadow state
Shadow.addHandler(function(event, obj) {
  let shadowObj = {};
  if (event === 'CONNECTED') {
    print("Got CONNECTED event");
    Shadow.get();
    //shadowObj = obj;
  } else if (event === 'UPDATE_DELTA') {
    print("Got DELTA event");
    shadowObj = obj;
  } else if (event === 'GET_ACCEPTED') {
    print('Got GET_ACCEPTED');
    shadowObj = obj.reported;
  }

  for (let key in shadowObj) {
    print("found key ", key);
    if (key === 'lightsconfig') {
      matrixObj.lightsconfig = shadowObj.lightsconfig;
      let ledMatrix = matrixObj.lightsconfig;
      print('Found Matrix');
      strip.clear();
      for (let i=0; i < ledMatrix.length; i++) {
        let row = ledMatrix[i];
        for (let j=0; j < row.length; j++) {
          let value = row[j];
          print('row =', i,' column =', j, ' number =', value);

          let lednum = 0;
          if( i & 0x01) {
            // Odd rows run backwards
            let reverseX = (row.length - 1) - j;
            lednum = (i * row.length) + reverseX;
          } else {
            // Even rows run forwards
            lednum = (i * row.length) + j;
          }

          print("setting led number ", lednum);
          if(value) {
            strip.setPixel(lednum, r, g, b);
          } else {
            strip.setPixel(lednum, 0, 0, 0);
          }
        }
     }
     strip.show();
     Shadow.update(0, matrixObj);
    } else {
      print('Dont know how to handle key', key);
    }
  }
});

// Demonstrate how to use shadow to periodically report metrics
//load('api_timer.js');
load('api_sys.js');
Timer.set(5000, Timer.REPEAT, function() {
  Shadow.update(0, {uptime: Sys.uptime()});
}, null);
