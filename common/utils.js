//Function that returns a configure "00:00"
export function minSec(numTime) {
  let totDifSec = 0;
  let totDifMin = 0;  
  let totDif = Math.round(numTime/1000);
  if (totDif < 10) {
    totDifSec = "0" + totDif;
    totDifMin = "00";
  } else if (totDif > 59) {
    totDifMin = Math.floor(totDif / 60);
    if (totDifMin < 10) {
      totDifMin = "0" + totDifMin;
    }
    totDifSec = totDif - (60 * totDifMin);
    if (totDifSec < 10) {
      totDifSec = "0" + totDifSec;
    }
  } else {
    totDifMin = "00";
    totDifSec = totDif;
  }    
  return totDifMin + ":" + totDifSec;  
};
 

