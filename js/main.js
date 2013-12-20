var maxWidth;

function DistanceCalculator(data) {
  return {
  	distances:[],

		init: function(){
	  		this.origins = this.accessDataLayer("origins");
	  		this.destinations = this.accessDataLayer("destinations");

  		console.log(this.destinations);
		},

  	calculateTravelingDistances: function(callback){
  		var self = this;
  		this.customCallBack = callback;
  		this.calculateTravelingDistance(this.origins, this.destinations, function(result){self.travelingDistancesCallback(result)});
  	},

  	travelingDistancesCallback: function(result){
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
			});  
			// sortedDestinations = geodata.destinations.sort(sortDestinationByDistanceValue);

			// renderDestinations(sortedDestinations);
			this.customCallBack(data);
			// renderDestinations(geodata.destinations);
		},

  	calculateTheoryDistances: function(callback){
  		var self = this;
  		this.getGeoCode(this.origins[0], function(result){self.originCallback(result)});
  		this.calculateTheoryDistances = callback;
  	},

  	originCallback: function(result){
  		var self = this;
  		this.origin = {lat:result[0].geometry.location.lat(), 
  							lng:result[0].geometry.location.lng()};
  		this.distancesCalculated = 0;

  		$.each(this.destinations, function(index, value){
  			self.getGeoCode(value, function(result){self.destinationCallback(result)})
  		});
  	},

  	destinationCallback: function(result){
  		console.log("destinationCallback", result)
  		var destination = {lat:result[0].geometry.location.lat(), 
  							lng:result[0].geometry.location.lng()};

  		distance = this.calculateDistance(this.origin.lat, 
  													this.origin.lng, 
  													destination.lat, 
  													destination.lng);

  		// data.destination[distancesCalculated].distance
  		this.distances.push(distance);

  		if (this.distances.length == this.destinations.length){
  			// callback
  			alert("Im done");
  		}
  		// console.log(distance);
  		// this.calculateTheoryDistances(data);
  		// console.log(destination);
			//Calculate the distance between 2 geocodes
  		//return the call back when all the distances are done.
  		
  	},

  	calculateDistance: function (lat1, lon1, lat2, lon2){
	  	var R = 6371; // km
			var dLat = (lat2-lat1).toRad();
			var dLon = (lon2-lon1).toRad();
			var lat1 = lat1.toRad();
			var lat2 = lat2.toRad();

			var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
			        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
			var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
			var d = R * c;

			return d;
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

		calculateTravelingDistance : function(origins, destinations, callback){
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
		  }, callback);
		},

		getGeoCode : function(location, callback){
		  var service = new google.maps.Geocoder();
			
			//Service Request
		  service.geocode(
		  {
		    address:location
		  }, callback);
		}
	}
}

/*
1.) Sort by distance
2.) Render destinations
*/
var travelingDistancesCallback = function(result){
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
	});  
	// sortedDestinations = geodata.destinations.sort(sortDestinationByDistanceValue);

	// renderDestinations(sortedDestinations);

	renderDestinations(geodata.destinations);
}

var sortDestinationByDistanceValue = function (a,b){  
	if (a.distance == null)
		return 1;
	if (b.distance == null)
		return -1;
  return a.distance.value > b.distance.value ? 1 : -1;  
};

var renderDestinations = function(geodata){

	var destinations = geodata.destinations;
	var innerHTML = '';
	var barUnitInPixels = 33;
	var cupsPerBarUnit = 1000000;
	var percentage;
	maxWidth = 0;

	$.each(destinations, function(index, value){
		width = (value.distance == null)? 0 : (value.distance.cups / cupsPerBarUnit) * barUnitInPixels;
		maxWidth = (width > maxWidth) ? width : maxWidth;


		cups = (value.distance == null)? "Location not found" : (value.distance.cups) + ' cups';

		console.log("width", width);
		
		innerHTML += '<div class="destination">' +
				            '<div class="description">'+
				                '<span class="search">' + value.description + '</span>' +
				                '<span class="amount">' + cups + '</span>' +
				            '</div>' +
				            '<div class="bar" style="width:'+ width +'px"></div>' +
				        '</div>';
	});


	$(".destinations-container").html(innerHTML);
	onWindowResize();
};

var onWindowResize = function(){
	if (maxWidth > 0){
		var scale = $(window).width() / maxWidth;
		$(".bar").each(function(){
			this.style.webkitTransform = "scale3d(" + scale + "," + scale + ",1)";
		});
	}
}

/** Converts numeric degrees to radians */
if (typeof(Number.prototype.toRad) === "undefined") {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  }
}

$(document).ready(function(){
	var distanceCalculator = new DistanceCalculator(geodata);
	distanceCalculator.init();
	distanceCalculator.calculateTravelingDistances(renderDestinations);
	// distanceCalculator.calculateTravelingDistances(function(ge));
	// distanceCalculator.calculateTheoryDistances(function(){});

	$(window).resize(onWindowResize);
});