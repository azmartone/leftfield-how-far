function DistanceCalculator(data, callback) {
  return {
  	init: function(){
  		var origins = this.accessDataLayer("origins");
  		var destinations = this.accessDataLayer("destinations");
  		
  		console.log(origins);
  		console.log(destinations);

  		this.calculateDistances(origins, destinations);
  	},

  	accessDataLayer : function(key){
			var formattedLocations = [];
			//Access Data Object
			var locations = data[key];
			
			$.each(locations, function(index, value){
				formattedLocations.push(value.description)
			});

			return formattedLocations;
		},

		calculateDistances : function(origins, destinations){
		  var service = new google.maps.DistanceMatrixService();
			
			//Service Request
		  service.getDistanceMatrix(
		  {
		    origins: origins,
		    destinations: destinations,
		    travelMode: google.maps.TravelMode.DRIVING,
		    unitSystem: google.maps.UnitSystem.IMPERIAL,
		    avoidHighways: false,
		    avoidTolls: false
		  }, this.serviceCallback);
		},

		serviceCallback : function(result){
			// console.log("result", result);
			callback(result);
		}
	}
}

//Organize a list of POI by distance.

$(document).ready(function(){
	var distanceCalculator = new DistanceCalculator(geodata, callback);
	distanceCalculator.init();
});


var callback = function(result){
	//Add distances to the data object
	var distances = result.rows[0].elements;
	$.each(distances, function(index, value){
		geodata.destinations[index].distance = value.distance;
		// geodata[index].distance = value;
	});  
	sortedDestinations = geodata.destinations.sort(sortDestinationByDistanceValue);
}

//Custom Sort Function
var sortDestinationByDistanceValue = function (a,b){  
	console.log("a", a, "b", b);
	if (a.distance == null)
		return 1;
	if (b.distance == null)
		return -1;
  return a.distance.value > b.distance.value ? 1 : -1;  
};


