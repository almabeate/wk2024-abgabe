"use strict"
class Point{ // Konstruktor mit 3 Eigenschaften
    constructor(lat, lon, name) 
    {
        this.lat = lat
        this.lon = lon
        this.name = name
    }
}

function jsonC0(nr, c){ //Koordinate 0 (Breitengrad, latitude)
    var coord0 = c.features[nr].geometry.coordinates[0]
    return coord0
}

function jsonC1(nr, c){ //Koordinate 1 (Längengrad, longitude)
    var coord1 = c.features[nr].geometry.coordinates[1]
    return coord1
}

function jsonName(nr, c){ //name
    var name = c.features[nr].properties.cityname
    return name
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


//Datei einlesen:
function type_function(finput) { 
    let fname = (finput.name).split('.'); //Teile den Datei-Namen am Punkt
    let ftype = fname[fname.length - 1].toLowerCase(); //so muss ich nicht nach allen Schreibweisen fragen
    return ftype;
}

function file2text() {
    let file = document.getElementById("json").files[0]; //File aufrufen
    let ftype = type_function(file); //Typ von der Datei mit der Funktion ermitteln

    if (ftype == "json" || ftype == "geojson") {
        let testFehlermeldung = document.getElementById('jsonErr'); // Check ob aktuell die Fehlermeldung angezeigt wird:      
        if (testFehlermeldung.classList.contains != 'd-none') { //Falls jsonErr nicht die Klasse d-none enthält wird sie hinzugefügt, damit der Fehler nicht mehr angezeigt wird
            testFehlermeldung.classList.add('d-none'); 
        }

        console.log('Der Dateityp ist ' + ftype + '. Und somit kann die Datei verwendet werden.');
        let reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function () {
            cities = JSON.parse(reader.result);
            console.log("Stadt-Liste: ", cities);
            allCities = cities; // Save all cities
            withinBox();
        };

        reader.onerror = function () {
            console.error(reader.error);
        };
    } else {
        console.log("Die Datei ist entspricht nicht dem richtigen Format.");
        document.getElementById("jsonErr").classList.remove('d-none');
    }
}

function onlySix() {  
    if (cities.features.length > 6){ //The box is now checked
        var sample = turf.sample(cities, 6);
        cities = sample
        console.log('Die sech zufällig gewählten Städte: ')
        withinBox();
        for (let i = 0; i < 6; i++) {
            console.log(cities.features[i].properties.cityname)}
    }
    else {
        cities = allCities // The box is now unchecked and the user wants to use all cities
        withinBox();
    }
}

function makeMarker(city){ //Statt über den Eventhandler, nun als Funktion: Abänderung so, dass mit der Funktion jeweils nur ein Marker erstellt wird
    var marker = L.marker([city.geometry.coordinates[1], city.geometry.coordinates[0]]);
    var iName = city.properties.cityname;
    var iLand = city.properties.country;
    var iEinw = city.properties.population;
    var iWeb = city.properties.picture;

    if (iWeb !== undefined && iWeb !== ""){
        marker.bindPopup('<h4>'+ iName + '</h4><p>Land: '+ iLand + '<br>Einwohnerzahl: '+ iEinw + '</p><a href="'+iWeb+'" target="_blank"><img src= "'+ iWeb+ '" alt="Popup Image" style="width:150px;height:auto;"></a>');
    } else {
        marker.bindPopup('<h4>'+ iName + '</h4><p>Land: '+ iLand + '<br>Einwohnerzahl: '+ iEinw + '</p>'); 
    }
    marker.addTo(markers)
    console.log("Neuer Marker wurde erstellt.")
}

function withinBox(){
    markers.clearLayers() //Alle Marker werden entfernt

    var box = drawnItem.toGeoJSON() //toGeoJSON Funtion von Leander übernommen
    if (box.features.length==0){ // Wenn es keine Box gibt
        for (let i=0; i<cities.features.length; i++){
            makeMarker(cities.features[i]) //Alle Marker werden erstellt
        }
    } else { 
        console.log("Rechteck: ", box)
        citiesWithin = turf.pointsWithinPolygon(cities,box)
        console.log("Städte im ausgewählten bereich: ")
        for (let i=0; i<citiesWithin.features.length; i++){
            makeMarker(citiesWithin.features[i]) //Für alle Städte innerhalb Marker erstellen
            console.log(citiesWithin.features[i].properties.cityname)
        }
    }
}

