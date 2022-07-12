import clock from "clock";
import * as document from "document";

import { preferences } from "user-settings";

import { today } from 'user-activity';
import { me } from "appbit";
import { display } from "display";

import * as util from "../common/utils.js";

// Update the clock every second
clock.granularity = "seconds";

// Get a handle on the <text> element
let myEnd = document.getElementById("myEnd");
let myTouch = document.getElementById("myTouch");

let mainView = document.getElementById("mainView");

//Big numbers while running
let myLaps = document.getElementById("myLaps");
let lapTime = document.getElementById("lapTime");
let lapCount = document.getElementById("lapCount");

//End of run screen
let summary = document.getElementById("summary");
let summaryView = document.getElementById("summaryView");
let totTime = document.getElementById("totTime");
let totLaps = document.getElementById("totLaps");
let timeMrkr = document.getElementById("timeMrkr");
let lapMrkr = document.getElementById("lapMrkr");
let VTList = document.getElementById("my-list");

let interval;
let running = "Start";
let lapCounter = 0;

let pauseStart = 0;
let pauseEnd = 0;
let pauseLapSum = 0;  //Total pause time per lap
let pauseTot = 0;  //Total pause time per run

var history = new Array();
let actLapTime = new Array();

let NUM_ELEMS = 100;

myEnd.text = "Start";

lapCount.text = "0";
lapTime.text = "00:00";

me.appTimeoutEnabled = false;


//Controls what happens when a new lap is marked
function newLap() {
  if (running !== "Start") {
    
    if (running === "Started") {
      lapCounter = lapCounter + 1;
      lapCount.text = lapCounter;
      //Store then shift the top lap down one
      history[lapCounter] = Date.now();
      actLapTime[lapCounter - 1] = history[lapCounter] - history[lapCounter - 1] - pauseLapSum; 
      pauseLapSum = 0;
      
    } else if (running === "Paused"){
      //End the pause, start the clock and record the differences
      pauseEnd = Date.now();
      pauseLapSum = pauseLapSum + (pauseEnd - pauseStart);
      pauseEnd = 0;
      pauseStart = 0;
      pauseTot = pauseTot + pauseLapSum;
      myEnd.text="Pause"; 
      running = "Running";
      //Start the clock loops subtracting pause times
      interval = setInterval(function() {
        //Display the main clock
        lapTime.text = util.minSec(Date.now() - history[0] - pauseTot);      
      }, 500);    
      
    } else if (running === "Running") {
      //Reset the lap pause time and start a new lap
      //advance the lap counter
      lapCounter = lapCounter + 1;
      lapCount.text = lapCounter;
      //Store then shift the top lap down one
      history[lapCounter] = Date.now();
      actLapTime[lapCounter - 1] = history[lapCounter] - history[lapCounter - 1] - pauseLapSum;
      //Reset the top lap to 0
      pauseLapSum = 0;     
    };
    
  } else {
    console.log("Not yet started");
  }; 
} //End of newLap function


function topLeft() {
  //Check to see if the start time has been recorded
  if (running === "Start") {
    me.appTimeoutEnabled = false;
    history[0] = Date.now();
    actLapTime[0] = 0;
    myEnd.text="Pause";
    running = "Started";
  };
   
  //Check for different states and act on them
  //This only works before a first pause
  if (running === "Started") {
    //Run the clocks with no pauses
    interval = setInterval(function() {
      //Display the main clock
      lapTime.text = util.minSec(Date.now() - history[0]);      
    }, 500);
    running = "Running";
  } else if (running === "Running") {
    //Pauses the clock and record the time
    clearInterval(interval);
    pauseStart = Date.now();
    myEnd.text="End";   
    running = "Paused";
  } else if (running === "Paused") {
    //this ends the running
    clearInterval(interval);     
    //Clear the screen
    mainView.style.display = "none";
    summary.style.display = "inline";
      
    finish();
  };
};   //end function topLeft


//Resets the watch if stopped to new
function finish() {
      
  lapMrkr.text = "Laps";
  timeMrkr.text = "Time";

  let myDiff1 = history[lapCounter] - history[0];
  totTime.text = util.minSec(myDiff1);
  totLaps.text = lapCounter;
  
  
  //Zero out time's of unused slots less than ten for the final screen  
  if (lapCounter < 100) {
    for(var i=lapCounter; i < 100; i++) {
      actLapTime[i] = 0;
    }
  }  
  
  //Create new array to ensure first lap is shown
  let endLapTime = new Array(); 
  var i;
  for (i=0; i < 100; i++) {
    endLapTime[i+1] = actLapTime[i];
  }
  actLapTime = endLapTime;
  actLapTime[0] = actLapTime[1];
  
  //Scroll Display
  VTList.delegate = {
    getTileInfo: function(index) {   
      return {
        type: "my-pool", 
        value: util.minSec(actLapTime[index]),
        index: index 
      };
    },  
    configureTile: function(tile, info) {
      if (info.type == "my-pool") {
        tile.getElementById("text").text = `${info.index}  ${info.value}`;
      }
    }
  }
  
  // VTList.length must be set AFTER VTList.delegate
  VTList.length = NUM_ELEMS; 
};



myEnd.addEventListener("click", (evt) => {
  topLeft();
});

myTouch.addEventListener("click", (evt) => {
  newLap();
});

lapCount.addEventListener("click", (evt) => {
  newLap();
});

lapTime.addEventListener("click", (evt) => {
  newLap();
});
