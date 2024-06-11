"use strict"
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
  
document.getElementById('inputForm').addEventListener('submit', function(e) { //Wird beim klick auf submit aktibiert
    e.preventDefault(); 

    //Die eingegebenen Werte werden zu einer Konstanten mit der man noch weitere Berechnungen anstellen kann
    const fname = document.getElementById('fname').value; 
    const l_b = parseFloat(document.getElementById('l_b').value);
    const l_l = parseFloat(document.getElementById('l_l').value);
    const pic_url = document.getElementById('pic_url').value;

    var newCity = new Point(l_b, l_l, fname) //neuer Punkt aus den eingegebenen Werten
    var listCityClosenes = farest2nearest(cities, newCity) 
    var name = listCityClosenes[0] // name ist der erste Array des Elements
    var dist = listCityClosenes[1]
    var num_elem = cities.features.length //Anzahl der eingegebenen Städte

    // Distanz bis Berlin:
    var indexB = null
    for (let i = 0; i < num_elem; i++) {
        if (cities.features[i].properties.cityname == "Berlin"){
            indexB = i
    }}
    var berlin = new Point(cities.features[indexB].geometry.coordinates[1], cities.features[indexB].geometry.coordinates[0], cities.features[indexB].properties.cityname) //aus der Cities-Datei werden die wichtigen Daten extrahiert (Koordinaten und Name)
    var distBln_1 = compute_geographic_distance(newCity, berlin, "km")

    //mit turf
    var from = turf.point([berlin.lon,berlin.lat]);
    var to = turf.point([newCity.lon,newCity.lat]);
    var options = {units: 'kilometers'};

    var distBln_2 = turf.distance(from, to, options);
    
    /*let indexBln = name.indexOf('Berlin'); 
    var distBln = dist[indexBln] */ //Einfachste Methode, anhand der bisherigen Ergebnisse
    console.log('Die Distanz zwischen Berlin und der eingegebenen Stadt beträgt mit der Funktion "compute_geographic_distance" berechnet: '+ distBln_1+' km. Anhand der distance Funktion von truf.js: '+distBln_2+ ' km.')
    distBln_1 = Math.round([distBln_1*1000])/1000; //Für die bessere Lesbarkeit habe ich den Wert auf drei Stellen nach dem Komma gekürzt 
    
    // Marker für die eingegebene Stadt
    var marker = L.marker([l_b, l_l]);
    var input2json = null

    if (pic_url !== undefined && pic_url !== ""){
        marker.bindPopup('<h4>'+ fname +'</h4><p> Entfernung bis Berlin: '+distBln_1 +' km <br><a href= "https://de.wikipedia.org/wiki/' + fname + '" target="_blank">Weitere Infos (Einwohnerzahl, Land, usw.)</a></p><a href="'+pic_url+'" target="_blank"><img src= "'+ pic_url+ '" alt="Popup Image" style="width:150px;height:auto;"></a>');
      
    //Da man beim Geojson Objekt auch nach Bild ja oder nein unterscheiden muss, habe ich es in die selbe schleife gepackt
        input2json = '{"type": "FeatureCollection","features": [{"type": "Feature","properties": {"cityname": "'
        + fname +'", "picture": "'+ pic_url + '"},"geometry": {"coordinates": ['
        + l_l +',  '+ l_b +'],"type": "Point"}}]}'
    } else {
        marker.bindPopup('<h4>'+ fname +'</h4><p> Entfernung bis Berlin: '+distBln_1 +' km <br><a href= "https://de.wikipedia.org/wiki/' + fname + '" target="_blank">Weitere Infos (Einwohnerzahl, Land, usw.)</a></p>');

        input2json = '{"type": "FeatureCollection","features": [{"type": "Feature","properties": {"cityname": "'
        + fname +'"},"geometry": {"coordinates": ['
        + l_b +',  '+ l_l +'],"type": "Point"}}]}'
    }

   console.log('Eingabe als GeoJson-Objekt: '+ input2json)
   var markers = [marker]

    // Marker für alle Städte hinzufügen
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
    layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map); //neue Layer hinzufügen mit Markern und den Baselayern
    
// Tabelle
    document.getElementById("heading_table").textContent=("Distanz von "+fname+" zu den größten Städten Europas:"); // Titel ändern
  
    let text = "<table class='table table-striped table-bordered'> <tr> <th>Stadt</th> <th>Distanz km</th>"; //man setzt einen html-code als Text ein
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
      let chartStatus = Chart.getChart("myChart"); // canvas-id
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
