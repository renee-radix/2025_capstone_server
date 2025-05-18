const midi = require('midi'); //means include this library
const osc = require("osc");
const http = require('http');
const express = require('express');
const socket = require('socket.io');

//this variable (empty object) holds our osc message to send
//we will fill it when we are ready to send it
let oscData = {};

//this is the code that gets the sample P5 sketch onto the node server. To access type "localhost::1312" into a web browser. Text is stored in public directory

const PORT = 1312; //port for hosting sketch AND reciving OSC data from, in this case, puredata (idk if we want multiple different ones for multiple types of data). 
const app = express();
app.use(express.static('public'));
app.set('port', PORT);
//(can you have express set up multiple sketches on multiple ports or do you need multiple node servers for that?)


//Setting up the server on port 1312, from the above down to here is all we need to host the sketch (plus the listen code at the end)
const server = http.createServer(app)
server.on('listening', () => {
 console.log('Listening on port '+PORT)
})


console.log("This text means the server is running!") //debug hello world text

//Open midi ports
const input = new midi.Input(); //sets up new input
console.log("Number of available input ports: " + input.getPortCount());

//configures midi callback
//message is array of numbers corresponding to midi bytes: [status, data1, data2]
//for CC we'll likely get something like: B1[controller number][controller value]
input.on('message', (deltaTime, message) =>{
   // console.log(`m: ${message} d: ${deltaTime}`);
    console.log(message);
    let input = message;
    if(input[0] == 176){
	console.log("Controller change: " + input[1] + " " + input[2])
	if(input[1] == 14){ //14 is first knob on my midi keyboard
	    io.sockets.emit('midi_cc', input[2]); //emit this data via web sockets to all the connected clients
	    // try this instead if the above doesn't work: 
	    // socket.broadcast.emit('midi_cc', input[2]);
	     
	    
	    // if you want to send a message to a subset of websocket clients (if, e.g., you have multiple sketches in a single server somehow), you could assign a room to a client using the syntax here: https://socket.io/docs/v4/rooms/
	}
    }
    if(input[0] == 144){
    console.log("MIDI note: " + input[1]) //for midi notes: [0] is type, [1] is note number and [2] is whether it's on or off
    oscData.var1 = input[1];
    oscData.var2 = input[2];
    sendOSC(); //we don't need to pass any data to the function because whenever this code runs we already rewrite the variables for the object
    }
});
input.openPort(1);

/*Console logs for MIDI:
m: 176[number doesn't change],[cc number],[cc value]]
first number changes depending on what kind of data comes in, like 176 for a cc change, 144 for anote on, 128 for noteoff,
244 for pitch bending etc. 
*/

//For reciving OSC/setting up the connection in general
var udpPort = new osc.UDPPort({
	localAddress:"localhost",
	localPort: 1312,
	metadata: true
});

udpPort.open();

udpPort.on("message", function (oscMsg, timeTag, info) {
    //console.log("An OSC message just arrived!", oscMsg);//lets you read raw osc message
    //console.log("Remote info is: ", info);
    //we get a message something like:  { address: '/amp', args: [ { type: 'f', value: 93.71991729736328 } ] }
    
    let value = oscMsg.args[1].value; //parse osc. The different elements of the array can be the different values, so 0 could be a string telling us where the osc data came from (in this case pd) and then, here, [1] is our data, a float 
    if(oscMsg.args[0].value == "pd"){
	console.log("Pure data " + value); //all of our data we get from pd has the "pd" tag so this will print only stuff that comes from pd. 
    }
    //oscData.amp = value;
});


// For sending osc (function needs to be called after an event)
function sendOSC(){
    console.log("sending OSC")

      udpPort.send({
          address: "/stuff", //you can make this address anything
          args: [
              {
                  type: "f", //change to f if you want to send a float
                  value: oscData.var1 //oscData.var1 and var2 are set in the code where sendOSC() is called. these are reset every time the code is called because of the way that this is being handled. 
              },
              {
                  type: "f",
                  value: oscData.var2
              }
          ]
      }, "127.0.0.1", 4202); //needs to be DIFFERENT to the port that node is listening on
}

//Web socket code
//Remember in order to make our public sketch a socket.io client we need to reference sockets.io in the html file (see that file) and the sketch itself (see that file too)

//Establishing a connection and printing to console when a new connection happens:
var io = socket(server);
io.sockets.on('connection', newConnection);

function newConnection(socket){ //This function runs every time there's a new socket connection. Anything to do with reciving code from socket connections needs to go here
    //The socket object has a ton of associated metadata, id being just one of those metadata points. It's unique for each connection. 
    console.log("A new client has connected! ID: " + socket.id); 
}
//the data we want is already coming in via osc and midi so there's no need to put it in the client side code

function sendToSketch(value){
	console.log("P5 sketch picking up " + value);
	//the actual part where it's sent to the sketch is handled in the midi callback since that's what's being sent
    }

server.listen(PORT)

/*
Next steps:
Get this to all work over a network! (at school)
Build a motion detection device and write some code for it
Intergrate midi code more into the visual glitching
Get audio glitching to be automatable
Create more visual glitching
*/
