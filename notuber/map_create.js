
/* initializing all the required variables */
var map, infoWindow, markers;
var jsondata;
var isVehicle;
/* initMap function that initializes the map, and gets Json data, calling
   all the required functions from it */
function initMap() {
        // placeholder
        var everest = {lat: 27.9878, lng: 86.9250};
        map = new google.maps.Map(document.getElementById('map_canvas'), {
                center: everest,
                zoom: 8
        })
        var marker2 = new google.maps.Marker({
                position: everest,
                map: map,
                icon:{url: 'icon.png', scaledSize: new google.maps.Size(50,65)}
        });
        var Lat, Lng;
        //new XMLHttpRequest, get JSON data
        request = new XMLHttpRequest();
        request.open("POST", " https://jordan-marsh.herokuapp.com/rides", true);
        request.setRequestHeader("Content-type",
                                 "application/x-www-form-urlencoded");
        request.onreadystatechange = function() {
                if (request.readyState == 4 && request.status == 200) {
                        apirequest = request.responseText;
                        data = JSON.parse(apirequest);
                        if (data.vehicles == null) {
                                jsondata = data.passengers;
                                isVehicle = true;
                                marker2.setIcon('car.png');
                        }
                        else {
                                jsondata = data.vehicles;
                                isVehicle = false;
                        }
                        getlocation(map, marker2, jsondata, markers, isVehicle);
                }

        };
        request.send("username=6aeJ1jT9cy&lat=42.3601&lng=71.0589");
}

//a function that gets my current location
function getlocation(map, marker2, jsondata, markers,isVehicle) {
        if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(function(position){
                        pos = {
                                lat: position.coords.latitude,
                                lng: position.coords.longitude
                        };
                        marker2.setPosition(pos);
                        map.setCenter(pos);
                        putMarker(map, jsondata, pos, isVehicle);
                }, function() {
                        alert("geolocation not supported");
                });
        } else {
                alert("geolocation not supported");
        }
}

//Place a marker and infowindow on each of the data you get from parsing
function putMarker(map, jsondata, pos, markers, isVehicle) {
        mylat = pos.lat;
        mylng = pos.lng;
        myloc = [mylat, mylng];
        for (i = 0; i < jsondata.length && jsondata.length > 0 ; i++) {
                marker = new google.maps.Marker({
                        position: {lat: jsondata[i].lat,
                                   lng: jsondata[i].lng},
                        map: map,
                        icon:'car.png'
                });
                if (isVehicle == true) {
                        marker.setIcon({url: 'icon.png', scaledSize:
                                        new google.maps.Size(50,65)});
                }
                latitude =  jsondata[i].lat;
                longitude = jsondata[i].lng;
                //using haversine formulae
                distance = haversineDistance(myloc, [latitude, longitude],
                                             true);

                var contentString = "<p> Username: " + jsondata[i].username +
                                    "</p><p> Distance: " + distance +
                                " miles</p>";
                infowindow = new google.maps.InfoWindow();
                google.maps.event.addListener(marker,'click',
                        (function(marker,contentString,infowindow){
                                return function() {
                                        infowindow.setContent(contentString);
                                        infowindow.open(map,marker);
                                };
                        })(marker,contentString,infowindow));
        }
}


//Using the Haversine formula from stackoverflow
function haversineDistance(coords1, coords2, isMiles) {
  function toRad(x) {
    return x * Math.PI / 180;
  }

  var lon1 = coords1[0];
  var lat1 = coords1[1];

  var lon2 = coords2[0];
  var lat2 = coords2[1];

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2)
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  if(isMiles) d /= 1.60934;
  d = Number.parseFloat(d).toPrecision(4);
  return d;
}
