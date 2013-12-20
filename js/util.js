/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toReadable) === "undefined") {
  Number.prototype.toReadable = function() {
  	var stringNumber = this.toString();
  	var newStringNumber = '';

  	for (var x = stringNumber.length-1; x>=0; x--){
  		newStringNumber = stringNumber[x] + newStringNumber;
  		if ((stringNumber.length - x)%3 == 0 && x != 0){
	  		newStringNumber = ',' + newStringNumber;
  		}
  	}

    return newStringNumber;
  }
}

/* Convert Number to Radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}


/* Calculate distance from 2 geocodes */

var calculateDistanceInMeters = function (lat1, lon1, lat2, lon2){   

  var R = 6371000; // m
  var dLat = (lat2-lat1).toRad();
  var dLon = (lon2-lon1).toRad();
  var lat1 = lat1.toRad();
  var lat2 = lat2.toRad();

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
          Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;

  return d;
};