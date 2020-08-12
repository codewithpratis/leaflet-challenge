var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
var mapZoomLevel = 5;

d3.json(url, function (data) {
    createFeatures(data.features);

});

function createFeatures(earthquakeData) {


    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup("<h3>" + feature.properties.place +
            "</h3><p>" + new Date(feature.properties.time) + "</p>" +
            "<p><b>Magnitude: </b>" + feature.properties.mag + "</p>");
    }



    // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            var color;
            var r = 225;
            var g = Math.floor(225 - 80 * feature.properties.mag);
            var b = Math.floor(225 - 80 * feature.properties.mag);
            color = "rgb(" + r + " ," + g + "," + b + ")"

            var geojsonMarkerOptions = {
                radius: 4 * feature.properties.mag,
                fillColor: color,
                color: "yellow",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.8
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });


    // Sending our earthquakes layer to the createMap function
    createMap(earthquakes);

}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });
    var dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v10",
        accessToken: API_KEY
    });
    var satelite = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        id: 'mapbox.streets',
        attribution: "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    });

// base maps
    var baseMaps = {
        "Light Map": lightmap,
        "Dark Map": dark,
        "Street Map": streetmap,
        "Satelite": satelite
    };

    // overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes
    };


    var myMap = L.map("map", {
        center: [
            37.77, -122.42
        ],
        zoom: mapZoomLevel,
        layers: [lightmap, dark, earthquakes]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

// for legend

    function getColor(d) {
        return d < 1 ? 'rgb(255,255,255)' :
            d < 2 ? 'rgb(255,225,225)' :
                d < 3 ? 'rgb(255,195,195)' :
                    d < 4 ? 'rgb(255,165,165)' :
                        d < 5 ? 'rgb(255,135,135)' :
                            d < 6 ? 'rgb(255,105,105)' :
                                d < 7 ? 'rgb(255,75,75)' :
                                    d < 8 ? 'rgb(255,45,45)' :
                                        d < 9 ? 'rgb(255,15,15)' :
                                            'rgb(255,0,0)';
    }

    // legend 
    var legend = L.control({
        position: 'bottomright'
    });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5, 6, 7, 8],
            labels = [];

        div.innerHTML += 'Magnitude<br><hr>'

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);

}