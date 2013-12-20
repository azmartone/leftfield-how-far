var maxWidth;

function DistanceCalculator(data) {
  return {
  	distances:[],

		init: function(){
	  		this.origins = this.accessDataLayer("origins");
	  		this.destinations = this.accessDataLayer("destinations");
		},

  	calculateTravelingDistances: function(callback){
  		var self = this;
  		this.customCallBack = callback;
  		this.requestTravelingDistance(this.origins, this.destinations, function(result){
  			self.travelingDistancesCallback(result);
  			});
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

			this.customCallBack(data);
		},

  	calculateCrowDistances: function(callback){
  		var self = this;
  		this.requestGeoCode(this.origins[0], function(result){self.originCallback(result)});
  		this.customCallBack = callback;
  	},

  	crowDistancesCallback: function(distances){
			var cupInMeters = 0.1016;
			var maxDistance = 0;

			//Add distances to the data object
			$.each(distances, function(index, value){
				if (value != null){
					var distance = {value:value}

					maxDistance = distance.value > maxDistance ? distance.value : maxDistance;
					distance.cups = parseInt(distance.value / cupInMeters);
					geodata.destinations[index].distance = distance;
				}
			}); 

			this.customCallBack(data);
		},

  	originCallback: function(result){
  		var self = this;
  		this.origin = {lat:result[0].geometry.location.lat(), 
  							lng:result[0].geometry.location.lng()};
  		this.distancesCalculated = 0;

  		$.each(this.destinations, function(index, value){
  			self.requestGeoCode(value, function(result){self.destinationCallback(result)})
  		});
  	},

  	destinationCallback: function(result){

  		var destination = {lat:result[0].geometry.location.lat(), 
  							lng:result[0].geometry.location.lng()};

  		distance = window.calculateDistanceInMeters(this.origin.lat, 
  													this.origin.lng, 
  													destination.lat, 
  													destination.lng);

  		this.distances.push(distance);

  		if (this.distances.length == this.destinations.length){
  			this.crowDistancesCallback(this.distances);
  		}
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

		requestTravelingDistance : function(origins, destinations, callback){
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

		requestGeoCode : function(location, callback){
		  var service = new google.maps.Geocoder();
			
			//Service Request
		  service.geocode(
		  {
		    address:location
		  }, callback);
		}
	}
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


		cups = (value.distance == null)? "Location not found" : (value.distance.cups.toReadable()) + ' cups';

		
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

var onDistancesCallback = function(data){
	var sortedDestinations = data.destinations.sort(sortDestinationByDistanceValue);
	renderDestinations(data)
}

$(document).ready(function(){
	var distanceCalculator = new DistanceCalculator(geodata);
	distanceCalculator.init();
	
	//Google Distance Matrix Service only returns traveling distance. Overseas won't work.
	//distanceCalculator.calculateTravelingDistances(onDistancesCallback);
	
	distanceCalculator.calculateCrowDistances(onDistancesCallback);

	$(window).resize(onWindowResize);
});