// Karten Layer
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

var overlayMaps = {}

var map = L.map('my_map', {
    center: [51.05, 13.75],
    zoom: 4, //Damit man alle Städte gleichzeitig sehen kann
    layers: [osm]
}); 

var baseMaps = {
    "OpenStreetMap": osm,
    "OpenStreetMap.HOT": osmHOT,
    "Esri.WorldImagery": WorldImagery
};

var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);