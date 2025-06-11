import SerialBridge from './serialYoinker.js'; // Custom little library Dillon made, don't worry about what's inside there. Use functions below.
import { Client } from 'node-osc';

const client = new Client('192.168.1.48', 1312);


// === Helper functions === //
function parseRFIDMessage(line) { //callback that gets RFID messages and parses them
  // Example line:
  // "[ESP-NOW] From: F0:F5:BD:07:82:F9 | Message: RFIDreader1 95 ac 59 3e"
  const match = line.match(/Message:\s*(\S+)\s+(.+)/);
  if (!match) return null;

  console.log(match);  
  
  //send OSC when RFID message comes in
  client.send('/RFIDBooped', 666, () => {
  client.close();
});
  return {
    device: match[1],
    message: match[2]
  };
}

function glitch(){ //sends "Pong" over the serial port, causing lights to flash
  console.log("glitching LEDs");
  SerialBridge.sendToESP32("Pong!");
}

//If Serial message matches "Ping!", do nothing. This could be error handling in case the master is disconnected. Consider the ping! per 2 seconds as the heartbeat signal.
SerialBridge.onSerialMatch("Ping!", (line, port) => {
  console.log(`[EVENT] ${port}: ${line}`);
});

// Optional: send something manually
setTimeout(() => {
  SerialBridge.sendToESP32("Shrek");
}, 5000); //This triggers each 5 seconds.

SerialBridge.onSerialMatch(/RFID/, (line, port) => {
  const data = parseRFIDMessage(line);
  if (data) {
    console.log(`[RFID] From ${data.device}: ${data.message}`);
  }
  glitch();
});
