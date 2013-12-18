function DistanceCalculator(data, callback) {
  return {
  	init: function(){
  		var origins = this.accessDataLayer("origins");
  		var destinations = this.accessDataLayer("destinations");

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
		    unitSystem: google.maps.UnitSystem.METRIC,
		    avoidHighways: false,
		    avoidTolls: false
		  }, this.serviceCallback);
		},

		serviceCallback : function(result){
			callback(result);
		}
	}
}

//Organize a list of POI by distance.

$(document).ready(function(){
	var distanceCalculator = new DistanceCalculator(geodata, callback);
	distanceCalculator.init();
	renderDestinations(geodata.destinations);
});


var callback = function(result){
	var cupInMeters = 0.1016;
	var maxDistance = 0;
	//Add distances to the data object
	var distances = result.rows[0].elements;
	$.each(distances, function(index, value){
		if (value.distance != null){
			distance = value.distance;

			maxDistance = distance.value > maxDistance ? distance.value : maxDistance;
			distance.cups = parseInt(distance.value / cupInMeters);
			geodata.destinations[index].distance = distance;
		}
		// geodata[index].distance = value;
	});  
	sortedDestinations = geodata.destinations.sort(sortDestinationByDistanceValue);

	renderDestinations(sortedDestinations, maxDistance);
}

//Custom Sort Function
var sortDestinationByDistanceValue = function (a,b){  
	if (a.distance == null)
		return 1;
	if (b.distance == null)
		return -1;
  return a.distance.value > b.distance.value ? 1 : -1;  
};


//On destination add
//Find the destination distance
//Add destination to the collection
//Re-Sort the collection
//Re-render the visualization
var renderDestinations = function(destinations, maxDistance){

	console.log(destinations);
	var innerHTML = '';
	var percentage;

	$.each(destinations, function(index, value){
		percentage = (value.distance == null)? 0 : (value.distance.value / maxDistance * 100);
		percentage = percentage + "%";

		cups = (value.distance == null)? "Location not found" : (value.distance.cups) + ' cups';

		console.log("percentage", percentage);
		
		innerHTML += '<div class="destination">' +
				            '<div class="description">'+
				                '<span class="search">' + value.description + '</span>' +
				                '<span class="amount">' + cups + '</span>' +
				            '</div>' +
				            '<div class="bar" style="width:'+ percentage +'"></div>' +
				        '</div>';
	});


	$(".destinations-container").html(innerHTML);
	// console.log("innerHTML", innerHTML);

};


