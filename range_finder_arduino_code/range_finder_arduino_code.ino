//pins for range finders
#define trigPin1 0
#define echoPin1 1
#define trigPin2 2
#define echoPin2 3
#define trigPin3 4
#define echoPin3 5
#define trigPin4 6
#define echoPin4 7

//window size for averaging code
const int windowSize = 100;

//timing variables 
long cooldown1 = 0; //randomly set each time the note is sent
long cooldown2;
long cooldown3;
long cooldown4;
long cooldownTimer1 = 0;
long cooldownTimer2 = 0;
long cooldownTimer3 = 0;
long cooldownTimer4 = 0;

void setup() {
  Serial.begin (9600);
  pinMode(trigPin1, OUTPUT);
  pinMode(echoPin1, INPUT);
}

void loop() {
  unsigned long time = millis();

  // for sensor 1
  float duration1, distance1;
  digitalWrite(trigPin1, LOW); 
  delayMicroseconds(2);
 
  digitalWrite(trigPin1, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin1, LOW);
  
  duration1 = pulseIn(echoPin1, HIGH);
  distance1 = (duration1 / 2) * 0.0344;

  float distance1a = movingAverage(distance1);
  
  if (distance1a >= 400 || distance1 <= 2){
    Serial.print("Distance sensor 1 = ");
    Serial.println("Out of range");
  }
  else {
    Serial.print("Distance sensor 1 = ");
    Serial.println(distance1);
    Serial.println("Distance sensor 1 average = ");
    Serial.print(distance1a);
    Serial.println(" cm");
    //Next I want to get what the effective range is... 400-2? and scale that to MIDI. This should be tested when I build the thing
    float distance1ac = constrain(distance1a, 3, 100); //These are the numbers that need to be calibrated depending on the space
    float cc14 = map(distance1ac, 3, 100, 127, 0);
    usbMIDI.sendControlChange(14, cc14, 1);

    //sending midi note if cooldown timer is low enough
    if (distance1ac < 50 && time - cooldownTimer1 >= cooldown){ //this is the threshold for the midi note sending
      cooldownTimer1 = time; //resets cooldown timer
      cooldown = random(30000) + 10000; //changes cooldown to something random between 10 and 40 seconds
      usbMIDI.sendNoteOn(24, 127, 1);
      Serial.println("Sending midi note 24!");
    }
  }

  //  // for sensor 2
  // float duration2, distance2;
  // digitalWrite(trigPin2, LOW); 
  // delayMicroseconds(2);
 
  // digitalWrite(trigPin2, HIGH);
  // delayMicroseconds(10);
  // digitalWrite(trigPin2, LOW);
  
  // duration2 = pulseIn(echoPin2, HIGH);
  // distance2 = (duration2 / 2) * 0.0344;

  // float distance2a = movingAverage(distance2);
  
  // if (distance2a >= 400 || distance2 <= 2){
  //   Serial.print("Distance sensor 2 = ");
  //   Serial.println("Out of range");
  // }
  // else {
  //   Serial.print("Distance sensor 2 = ");
  //   Serial.println(distance2);
  //   Serial.println("Distance sensor 2 average = ");
  //   Serial.print(distance2a);
  //   Serial.println(" cm");
  //   //Next I want to get what the effective range is... 400-2? and scale that to MIDI. This should be tested when I build the thing
  //   float distance2ac = constrain(distance2a, 3, 100); //These are the numbers that need to be calibrated depending on the space
  //   float cc15 = map(distance2ac, 3, 100, 127, 0);
  //   usbMIDI.sendControlChange(15, cc15, 1);

  //   //sending midi note if cooldown timer is low enough
  //   if (distance2ac < 50 && time - cooldownTimer2 >= cooldown){ //this is the threshold for the midi note sending
  //     cooldownTimer2 = time; //resets cooldown timer
  //     usbMIDI.sendNoteOn(25, 127, 1);
  //     Serial.println("Sending midi note 25!");
  //   }
  // }
 
  //  // for sensor 3
  // float duration3, distance3;
  // digitalWrite(trigPin3, LOW); 
  // delayMicroseconds(2);
 
  // digitalWrite(trigPin3, HIGH);
  // delayMicroseconds(10);
  // digitalWrite(trigPin3, LOW);
  
  // duration3 = pulseIn(echoPin3, HIGH);
  // distance3 = (duration3 / 2) * 0.0344;

  // float distance3a = movingAverage(distance3);
  
  // if (distance3a >= 400 || distance3 <= 2){
  //   Serial.print("Distance sensor 3 = ");
  //   Serial.println("Out of range");
  // }
  // else {
  //   Serial.print("Distance sensor 3 = ");
  //   Serial.println(distance3);
  //   Serial.println("Distance sensor 3 average = ");
  //   Serial.print(distance3a);
  //   Serial.println(" cm");
  //   //Next I want to get what the effective range is... 400-2? and scale that to MIDI. This should be tested when I build the thing
  //   float distance3ac = constrain(distance3a, 3, 100); //These are the numbers that need to be calibrated depending on the space
  //   float cc16 = map(distance3ac, 3, 100, 127, 0);
  //   usbMIDI.sendControlChange(16, cc16, 1);

  //   //sending midi note if cooldown timer is low enough
  //   if (distance3ac < 50 && time - cooldownTimer3 >= cooldown){ //this is the threshold for the midi note sending
  //     cooldownTimer3 = time; //resets cooldown timer
  //     usbMIDI.sendNoteOn(26, 127, 1);
  //     Serial.println("Sending midi note 26!");
  //   }
  // }
 
  // // for sensor 4
  // float duration4, distance4;
  // digitalWrite(trigPin4, LOW); 
  // delayMicroseconds(2);
 
  // digitalWrite(trigPin4, HIGH);
  // delayMicroseconds(10);
  // digitalWrite(trigPin4, LOW);
  
  // duration3 = pulseIn(echoPin4, HIGH);
  // distance3 = (duration4 / 2) * 0.0344;

  // float distance4a = movingAverage(distance3);
  
  // if (distance4a >= 400 || distance4 <= 2){
  //   Serial.print("Distance sensor 4 = ");
  //   Serial.println("Out of range");
  // }
  // else {
  //   Serial.print("Distance sensor 4 = ");
  //   Serial.println(distance4);
  //   Serial.println("Distance sensor 4 average = ");
  //   Serial.print(distance4a);
  //   Serial.println(" cm");
  //   //Next I want to get what the effective range is... 400-2? and scale that to MIDI. This should be tested when I build the thing
  //   float distance4ac = constrain(distance4a, 3, 100); //These are the numbers that need to be calibrated depending on the space
  //   float cc17 = map(distance4ac, 3, 100, 127, 0);
  //   usbMIDI.sendControlChange(17, cc17, 1);

  //   //sending midi note if cooldown timer is low enough
  //   if (distance4ac < 50 && time - cooldownTimer4 >= cooldown){ //this is the threshold for the midi note sending
  //     cooldownTimer4 = time; //resets cooldown timer
  //     usbMIDI.sendNoteOn(27, 127, 1);
  //     Serial.println("Sending midi note 27!");
  //   }
  // }
  delay(10);
}

float movingAverage(float value){
  //expecting a number between 2 and 200
  int windowIndex = 0; //index for our averaging window
  float readings[windowSize]; //creates an array of ints that is the size of windowSize
  float averaged = 0; //variable to hold our averaged value
  float sum = 0;

  sum = sum - readings[windowIndex];    // Remove the oldest entry from the sum
  readings[windowIndex] = value;        // Add the newest reading to the window
  sum = sum + value;              // Add the newest reading to the sum
  windowIndex = windowIndex + 1;                // Increment the index
  windowIndex = windowIndex % windowSize;     // wrap to 0 if it exceeds the window size
  averaged = sum / windowSize;    // Divide the sum of the window by the window size for the result
  float midiVal = averaged * windowSize;         //use our averaged value for sending as midi
  return midiVal;
}

//Test to see what the effective range is. This will probably depend on the space itself and what else is set up in there. 

/*Sensors send: 
CCs 14-17
MIDI notes (at 127) 24-27

To do: 
Get the rest of the code to look like the code for sensor 1
Figure out why it's so slow



*/