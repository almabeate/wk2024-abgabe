"use strict"
// Variablen initialisieren
let cities = {}   
let allCities = {}           
let citiesWithin = {} 
var overlayMaps = {} 

// Karte
    // ->  Layer
    var osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors, Tiles style by <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    var osmHOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> '
    });
    var WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '© Esri'
    });
    var baseMaps = {
        "OpenStreetMap": osm,
        "OpenStreetMap.HOT": osmHOT,
        "Esri.WorldImagery": WorldImagery
    };

// Karte initialisieren
    var map = L.map('my_map', {
        center: [51.05, 13.75],
        zoom: 4, //Damit man alle Städte gleichzeitig sehen kann
        layers: [osm]
    }); 

    var markers = L.layerGroup() 
    var drawnItem = new L.FeatureGroup()

    var drawControl = new L.Control.Draw({
        draw: {
            polyline: false,
            polygon: false,
            circle: false,
            circlemarker: false,
            marker: false,
            rectangle: true // only allow rectangles
        },
        edit: {
            featureGroup: drawnItem,
            edit: true
        },
    });

// Eventlistener
document.getElementById("json").addEventListener("change", file2text); //somit haben wir die ausgelesene Datei der Variable cities zugeordnet
document.getElementById("checkBox").addEventListener("change", onlySix); // remove six cities

map.on("draw:created", function(e){e.layer.addTo(drawnItem); withinBox()}) //Draw-Aufrufe durch eine Funktion verkürzt
map.on("draw:edited", withinBox)
map.on("draw:deleted", withinBox)

// Layer hinzufügen
drawControl.addTo(map)
drawnItem.addTo(map)

// Layer control
markers.addTo(map)
overlayMaps = {"Cities":markers, "Bounding Box": drawnItem}
L.control.layers(baseMaps,overlayMaps,{collapsed:false}).addTo(map) // Hier habe ich die Layer direkt sichtbar gemacht, da die Eingabe Daten einer weiteren Stadt ja nicht erforderlich ist.

// Input-Form für deinen Dresden-Marker
document.getElementById('inputForm').addEventListener('submit', function(e) { //Wird beim klick auf submit aktibiert
    e.preventDefault(); 
    
    //Die eingegebenen Werte werden zu einer Konstanten mit der man noch weitere Berechnungen anstellen kann
    const fname = document.getElementById('fname').value; 
    const l_b = parseFloat(document.getElementById('l_b').value);
    const l_l = parseFloat(document.getElementById('l_l').value);
    const pic_url = document.getElementById('pic_url').value;

    // Dresden als Marker
    var markerDD = L.marker([l_b, l_l]);
     if (pic_url !== undefined && pic_url !== ""){ // Falls es ein Bild gibt
        markerDD.bindPopup('<h4>'+ fname +'</h4><a href="'+pic_url+'" target="_blank"><img src= "'+ pic_url+ '" alt="Popup Image" style="width:150px;height:auto;"></a>');
     } else {
         markerDD.bindPopup('<h4>'+ fname +'</h4>');
     }
     markerDD.addTo(markers)
})
