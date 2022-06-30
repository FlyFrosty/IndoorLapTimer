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
let totLaps = document.getElementById("totLaps");
let totTime = document.getElementById("totTime");
let timeMrkr = document.getElementById("timeMrkr");
let lapMrkr = document.getElementById("lapMrkr");
let VTList = document.getElementById("my-list");

let interval;
let running = 0;
let lapCounter = 0;

let pauseStart = 0;
let pauseEnd = 0;
let pauseLapSum = 0;  //Total pause time per lap
let pauseTot = 0;  //Total pause time per run

var history = new Array();
let actLapTime = new Array();

let NUM_ELEMS = 100;

lapCount.text = "0";
lapTime.text = "00:00";

myEnd.text = "END";



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


//Controls what happens when a new lap is marked
function newLap() {
  if (running === 0) {
    //First press of the Lap Button
    me.appTimeoutEnabled = false;
    history[0] = Date.now();
    actLapTime[0] = 0;
    running = 1;
    interval = setInterval(function() {
      //Display the main clock
      lapTime.text = util.minSec(Date.now() - history[0]);
    }, 500); 
  } else if (running ===1) {
    //Lap buttun pressed while already running

    //advance the lap counter
    lapCounter = lapCounter + 1;
    lapCount.text = lapCounter;
    
    //Store then shift the top lap down one
    history[lapCounter] = Date.now();
    actLapTime[lapCounter - 1] = history[lapCounter] - history[lapCounter - 1];
    interval = setInterval(function() {
    //Display the main clock
      lapTime.text = util.minSec(Date.now() - history[0]);
    }, 500);
  };
};

 
// Top Right button is pressed
function myExit() {
  mainView.style.display = "none";
  summary.style.display = "inline";
  finish();  
}


myEnd.addEventListener("click", (evt) => {
  myExit();
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
