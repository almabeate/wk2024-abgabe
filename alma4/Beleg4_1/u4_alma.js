"use strict"
class Point{ // Konstruktor mit 3 Eigenschaften
    constructor(lat, lon, name) 
    {
        this.lat = lat
        this.lon = lon
        this.name = name
    }
}

let convert_distance_to_kilometers = distance_in_m => distance_in_m/1000

function compute_geographic_distance(point1, point2, unit) //Input-Werte
        {
            const lat1 = point1.lat // die Input-Werte werden in der Funktion nutzbar gemacht
            const lat2 = point2.lat
            const lon1 = point1.lon
            const lon2 = point2.lon

                const R = 6371e3; // Meter
                const d1 = lat1 * Math.PI/180; // φ, λ in Radiant
                const d2 = lat2 * Math.PI/180;
                const deltaD = (lat2-lat1) * Math.PI/180;
                const deltaL = (lon2-lon1) * Math.PI/180;

                const a = Math.sin(deltaD/2) * Math.sin(deltaD/2) +
                        Math.cos(d1) * Math.cos(d2) *
                        Math.sin(deltaL/2) * Math.sin(deltaL/2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

            let d = 0 //Default-value
            if (unit === "m")  {
                 d = R * c; // in m
            }
            if (unit === "km")  {
                 d = convert_distance_to_kilometers(R * c) // in km, Funktion wird aufgerufen
            }
            return d // man erhält die geographic_distance wenn man die Funktion aufruft
        }

function farest2nearest(cities, new_point)
    {
        let city = cities
        const num_elem = city.features.length
        let x = 0;                          //Default Werte
        var dist = []                       //Default Werte
        var geg_city = new Point(0, 0, "")  //Default Werte
        var citynamelist = []               //Default Werte
        for (let i = 0; i < num_elem; i++) { 
            citynamelist[i] = city.features[i].properties.cityname; //der Stadtname wird abgefragt und in eine eigene Liste geschrieben
            geg_city = new Point(city.features[i].geometry.coordinates[1], city.features[i].geometry.coordinates[0], citynamelist[i]) //aus der Cities-Datei werden die wichtigen Daten extrahiert (Koordinaten und Name)
            dist[i] = Math.round([compute_geographic_distance(geg_city, new_point, "km")*1000])/1000; //Für die bessere Lesbarkeit habe ich den Wert auf drei Stellen nach dem Komma gekürzt    
        }
        var indices_dist = [...dist.keys()] //Dist wird von klein nach groß sortiert, dabei merke ich mir hier die neue Reihnfolge der alten Indizes
        indices_dist.sort((a, b) => dist[a] - dist[b]);
        var dist_sorted = dist.sort((a, b) => a - b) //Neue Variable mit der sortierten Distanz
        var city_sorted = []
        for (let i = 0; i < num_elem; i++) {
            city_sorted[i] = citynamelist[indices_dist[i]] //Die Stadtnamen werden passend zu der nun sortierten Distanz zugeordnet
        }
    var dist_name_list = [city_sorted, dist_sorted]  
    return dist_name_list
    }

// Karte erstellen
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
        zoom: 13,
        layers: [osm]
    }); 
    var baseMaps = {
        "OpenStreetMap": osm,
        "OpenStreetMap.HOT": osmHOT,
        "Esri.WorldImagery": WorldImagery
    };
    
    var layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);

//Datei einlesen:
function type(finput) { //Mit der Hilfe von Tom erstellt
    let fname = (finput.name).split('.'); //Teile den Datei-Namen am Punkt
    let ftype = fname[fname.length - 1]; //fileName ist ein Array, man nimmt hier den ersten Eintrag des Arrays, was dem Dateityp entspricht
    return ftype;
}

let cities = null;

function file2text() {
    let file = document.getElementById("json").files[0]; //File aufrufen
    let ftype = type(file); //Typ von der Datei mit der Funktion ermitteln

    if (ftype == "json" || ftype == "geojson") {
        let testFehlermeldung =document.getElementById('jsonErr')         // Check ob aktuell die Fehlermeldung angezeigt wird:
        if (testFehlermeldung.classList.contains != "d-none"){ //Falls jsonErr nicht die Klasse d-none enthält wird sie hinzugefügt, damit der Fehler nicht mehr angezeigt wird
            document.getElementById("jsonErr").classList.add('d-none')
        }
        if (overlayMaps != {}){ //Alle Marker entfernen
            map.removeControl(layerControl) // Alte Layer entfernen
             overlayMaps = {};
             layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
        }

        console.log('Der Dateityp ist '+ftype+'. Und somit kann die Datei verwendet werden werden.')
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
            cities = JSON.parse(reader.result);
            console.log("Stadt-Liste: "+cities)
        };

        reader.onerror = function () {
            console.error(reader.error); // Wenn es nicht funktioniert, gibt es eine Fehlermeldung
        };
    } else {
        console.log("Die Datei ist entspricht nicht dem richtigen Format.");
        document.getElementById("jsonErr").classList.remove('d-none')     
    }
}

document.getElementById("json").addEventListener("change", file2text); //somit haben wir die ausgelesene Datei der Variable cities zugeordnet
  
//Verarbeitung der hochgeladenen Daten und Werte:
document.getElementById('inputForm').addEventListener('submit', function(e) { //Wird beim klick auf submit aktibiert
    e.preventDefault(); 

    const fname = document.getElementById('fname').value; //Die eingegebenen Werte werden zu einer Konstanten mit der man noch weitere Berechnungen anstellen kann
    const l_b = parseFloat(document.getElementById('l_b').value);
    const l_l = parseFloat(document.getElementById('l_l').value);
    
    var newCity = new Point(l_b, l_l, fname) //neuer Punkt aus den eingegebenen Werten
    var listCityClosenes = farest2nearest(cities, newCity) 
    var name = listCityClosenes[0] // name ist der erste Array des Elements
    var dist = listCityClosenes[1]

// Marker für die eingegebene Stadt
    var marker = L.marker([l_b, l_l]);
    marker.bindPopup('<h4>'+ fname +'</h4>');
    var markers = [marker]
// Marker für alle Städte hinzufügen
    var num_elem = cities.features.length
    for (let i = 0; i < num_elem; i++) {
        var marker = L.marker([cities.features[i].geometry.coordinates[1], cities.features[i].geometry.coordinates[0]]);
        var iName = cities.features[i].properties.cityname;
        var iLand = cities.features[i].properties.country;
        var iEinw = cities.features[i].properties.population;
        var iWeb = cities.features[i].properties.picture;
        if (iWeb !== undefined && iWeb !== ""){
            marker.bindPopup('<h4>'+ iName + '</h4><p>Land: '+ iLand + '<br>Einwohnerzahl: '+ iEinw + '</p><a href="'+iWeb+'" target="_blank"><img src= "'+ iWeb+ '" alt="Popup Image" style="width:150px;height:auto;"></a>');
        } else {
            marker.bindPopup('<h4>'+ iName + '</h4><p>Land: '+ iLand + '<br>Einwohnerzahl: '+ iEinw + '</p>'); 
        }
        markers.push(marker);
    }

    map.removeControl(layerControl) // Alte Layer entfernen

// Layer mit den Markern
    var markerLayer = L.layerGroup(markers); //overlay
    overlayMaps = {
        "Städte": markerLayer};
    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
    
// Tabelle
    document.getElementById("heading_table").textContent=("Distanz von "+fname+" zu den größten Städten Europas:"); // Titel ändern
  
    let text = "<table class='table table-striped table-bordered'> <tr> <th>Stadt</th> <th>Distanz [km]</th>"; //man setzt einen html-code als Text ein
    for (let i = 0; i < num_elem; i++) {
        text += ("<tr><td>" + name[i] + "</td>"+"<td>" + dist[i] + "</td></tr>"); //In der Schleife wird jede Distanz mit Namen in die Tabelle eingefüht
        }
    document.getElementById("table").innerHTML = text; //hier wird der Text in den HTML-Code eingefügt

// Diagramm
    document.getElementById("chart").textContent=(""); //Der Text aus der HTML-Datei wird überschrieben

    let my_data = {
        labels: name, //Wert der dargestellt werden soll
        datasets: [{
          label: ('Distanz von ' + fname + ' zu den größten Städten Europas [in km]'),
          data: dist, //Wert der dargestellt werden soll
          borderWidth: 1
        }]
      }
// clear the canvas:
      let chartStatus = Chart.getChart("myChart"); // <canvas> id
        if (chartStatus != undefined) {
        chartStatus.destroy();
        }

// specify config information
      const config = {
          type: 'bar',
          data: my_data, // enthält Werte und Label
          options: {
            scales: {
              y: {
                beginAtZero: true
        }}}}
      
    var my_chart = new Chart(document.getElementById('myChart'), config) // Ein neues Balkendiagram wird erzeugt

})
