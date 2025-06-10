const midi = require('midi'); //means include this library
const osc = require("osc");

//IP addresses: This will need to be set up when we get to testing
//Alternatively we can use mDNS but we'd need Jesse to help with that
const cabinetIP;
const ctrlRmIP;
const chladniIP;
const audioIP;
const p5IP1;
//may or may not use this
const p5IP2;

//For each IP we will send on 1312. Since this sketch isn't hosting P5 anymore we don't need to have a seperate port for that



//this variable (empty object) holds our osc message to send
//we will fill it when we are ready to send it
let oscData = {};

//this is the code that gets the sample P5 sketch onto the node server. To access type "localhost::1312" into a web browser. Text is stored in public directory

const PORT = 1312; //port for hosting sketch AND reciving OSC data from, in this case, puredata (idk if we want multiple different ones for multiple types of data). 

console.log("This text means the server is running!") //debug hello world text

//Open midi ports
const input = new midi.Input(); //sets up new input
console.log("Number of available input ports: " + input.getPortCount());

//configures midi callback for range finders. Need to work on this in conjunction with range finder code. 
//message is array of numbers corresponding to midi bytes: [status, data1, data2]
//for CC we'll likely get something like: B1[controller number][controller value]
input.on('message', (deltaTime, message) =>{
   // console.log(`m: ${message} d: ${deltaTime}`);
    console.log(message);
    let input = message;
    if(input[0] == 176){
	console.log("Controller change: " + input[1] + " " + input[2]);
        oscData.var1=input[1]; //CC number
        oscData.var2=input[2]; //value
        sendOsc(audioIP, "/ccChange"); //Sending to max, idk if getting it to send too many osc messages will cause it to bug out but we can see. Currently this doesn't do anything on the max end but I can change that if I want to.
    }
    if(input[0] == 144){ //i.e. if the incoming midi signal is a midi note
        console.log("MIDI note: " + input[1]); //for midi notes: [0] is type, [1] is note number and [2] is whether it's on or off
        if(input[1] == 24){ //if we get a message from range finder 1
            //Send OSC to both max and garbage sketch
            oscData.var1 = 54;
            sendOsc(audioIP, "/glitch1");
            sendOsc(p5IP1, "/sketch1");
        }
        //If range finder 2 gets booped send message to robot sketch and glitch2 message
        if(input[1] == 25){
            oscData.var1 = 55;
            sendOsc(audioIP, "/glitch2");
            sendOsc(p5IP2, "/sketch2");
        }
        // If range finder 3 gets booped I'm not sure what to do but maybe that's good incentive to not have it present or just make it hook directly up to sine tone generation
    }
});
input.openPort(0);


//For reciving OSC: the only thing sending OSC to this server is the RFIDs that are using a different protocol so this may not be necessary
var udpPort = new osc.UDPPort({
	localAddress:"0.0.0.0", //I'm not sure why but putting this at 0.0.0.0 fixed it somehow. This should probably stay as it is. 
	localPort: 1312, //port we're reciving on
	metadata: true
});

udpPort.open();

//This may also be unnecessary now: for reciving osc via IP
udpPort.on("message", function (oscMsg, timeTag, info) {
    //console.log("An OSC message just arrived!", oscMsg);//lets you read raw osc message
    //console.log("Remote info is: ", info);
    //we get a message something like:  { address: '/amp', args: [ { type: 'f', value: 93.71991729736328 } ] }
    
    let value = oscMsg.args[0].value; //parse osc. The different elements of the array can be the different values, so 0 could be a string telling us where the osc data came from (in this case pd) and then, here, [1] is our data, a float 
    console.log(value);
  //  if(oscMsg.args[0].value == "pd"){
//	console.log("Pure data " + value); //all of our data we get from pd has the "pd" tag so this will print only stuff that comes from pd. 
  //  }
    //oscData.amp = value;
});

// I don't think we need this function anymore but I want to double check when we get access to the space
// It's meant to be a test message I think to ensure the connection works
//udpPort.on("ready", function () {
//    udpPort.send({
//        address: "/s_new",
//        args: [
//            {
//                type: "s",
//                value: "default"
//            },
//            {
//                type: "i",
//                value: 100
//            }
//        ]
//    }, "192.168.1.64", 4202);
//});

//Function that runs when we get a message that RFID tag got booped
//I would write glitch() in here, I think
function RFIDBooped(location){ //If there only ends up being one reader then the location isn't necessary, I should just cut that out. As it stands both cabinet and drucilla's thing will get the location information, and can choose to use that if they want or not.
    oscData.var1 = location;
    sendOsc(cabinetIP, "/cabinet")
    sendOsc(ctrlRmIP, "/controlRoom")
}

// Generic function for sending osc 
//Function gets passed IP (should be one of the constants at the top), address (gets passed a string beginning with "/") and anything else I want (in the oscData object, needs to be integers)
function sendOSC(ip, addr){
    console.log("sending OSC")

      udpPort.send({
          address: addr, //you can make this address anything as long as it begins with /, e.g. /stuff
          args: [
              {
                  type: "i", //change to f if you want to send a float
                  value: oscData.var1 //oscData.var1 and var2 are set in the code where sendOSC() is called. these are reset every time the code is called because of the way that this is being handled. 
              },
              {
                  type: "i",
                  value: oscData.var2
              }
          ]
      }, ip, 4202); //needs to be DIFFERENT to the port that node is listening on if set up to work locally 
}


/*
Next steps:
Build a motion detection device and write some code for it
Intergrate midi code more into the visual glitching
Get audio glitching to be automatable
Create more visual glitching
*/
