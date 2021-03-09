// 1.Create Global Variables
let pos;
let map;
let bounds;
let infoWindow;
let currentInfoWindow;
let service;
let infoPane;
// 2. Runs first - Three Important items(a.Geolocation b. weather api c. Click events)
function initMap() {
    // Initialize variables
    bounds = new google.maps.LatLngBounds();
    infoWindow = new google.maps.InfoWindow();
    currentInfoWindow = infoWindow;
    /* TODO: Step 4A3: Add a generic sidebar */
    infoPane = document.getElementById("panel");

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            map = new google.maps.Map(document.getElementById("map"), {
                center: pos,
                zoom: 15,
            });
            bounds.extend(pos);

            infoWindow.setPosition(pos);
            infoWindow.setContent("Current Location");
            infoWindow.open(map);
            map.setCenter(pos);

            var queryURL =
                "https://api.openweathermap.org/data/2.5/weather?lat=" +
                pos.lat +
                "&lon=" +
                pos.lng +
                "&appid=a076bb4dbcd9082faae450a5cea191f6";

            console.log(queryURL);

            function getCurWeather() {
                $.ajax({ url: queryURL, method: "GET" }).then(function (response) {
                    console.log(response);

                    var weatherObj = {
                        temp: response.main.temp,
                        img: response.weather[0].icon,
                        desc: response.weather[0].description,
                    };
                    drawCurWeather(weatherObj);
                });
            }

            function drawCurWeather(weather) {
                console.log(weather);

                var realTemp = Math.floor((weather.temp * 9) / 5 - 459.67);
                var img = "http://openweathermap.org/img/wn/" + weather.img + ".png";
                var desc = weather.desc[0].toUpperCase() + weather.desc.slice(1).toLowerCase();
                console.log(img);

                let $tempP = $("<p> Current Temperature - " + realTemp + " &#8457;</p>");
                $("#temp").append($tempP);

                let $iconLi = $("<p>  Current Conditions </p>");
                let $iconI = $("<img>");
                $iconI.attr("src", img);

                $iconLi.append($iconI);
                $("#conditions").append($iconLi);

                if (realTemp <= 85 && realTemp >= 60 && desc == "clear sky") {
                    $("#advice").text(
                        "Should I venture out on foot? - Sure! The weather is perfect"
                    );
                } else if (
                    (realTemp <= 85 && realTemp >= 60) ||
                    desc == "few clouds" ||
                    desc == "scattered clouds"
                ) {
                    $("#advice").text(
                        "Should I venture out on foot? - Sure!! There are only a few clouds"
                    );
                } else if (realTemp <= 85 && realTemp >= 60 && desc == "rain") {
                    $("#advice").text(
                        "Should I venture out on foot? - Sure, but bring an umbrella"
                    );
                } else if (realTemp >= 86) {
                    $("#advice").text(
                        "Should I venture out on foot? - No, It is too hot. Venture by car"
                    );
                } else if (realTemp <= 45) {
                    $("#advice").text("Should I venture out on foot? - Yes, but bring a jacket");
                } else {
                    $("#advice").text("Should I venture out on foot? - No. Venture by car");
                }
            }

            getCurWeather();
        });
    }

    document.getElementById("clickbars").addEventListener(
        "click",
        function () {
            // Call Places Nearby Search on user's location
            getNearbyPlaces(pos);
        },
        () => {
            // Browser supports geolocation, but user has denied permission
            handleLocationError(true, infoWindow);
        }
    );

    document.getElementById("clickart").addEventListener(
        "click",
        function () {
            // Call Places Nearby Search on user's location
            getNearbyPlaces2(pos);
        },
        () => {
            // Browser supports geolocation, but user has denied permission
            handleLocationError(true, infoWindow);
        }
    );
}

// Handle a geolocation error
function handleLocationError(browserHasGeolocation, infoWindow) {
    // Set default location to Sydney, Australia
    pos = {
        lat: -33.856,
        lng: 151.215,
    };
    map = new google.maps.Map(document.getElementById("map"), {
        center: pos,
        zoom: 15,
    });

    // Display an InfoWindow at the map center
    infoWindow.setPosition(pos);
    infoWindow.setContent(
        browserHasGeolocation
            ? "Geolocation permissions denied. Using default location."
            : "Error: Your browser doesn't support geolocation."
    );
    infoWindow.open(map);
    currentInfoWindow = infoWindow;

    // Call Places Nearby Search on the default location
    getNearbyPlaces(pos);
}

// 3. Perform a Places Nearby Search Request
function getNearbyPlaces(position) {
    let request = {
        location: position,
        rankBy: google.maps.places.RankBy.DISTANCE,
        keyword: "brewery",
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, nearbyCallback);
}

function getNearbyPlaces2(position) {
    let request = {
        location: position,
        rankBy: google.maps.places.RankBy.DISTANCE,
        keyword: "art museum",
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, nearbyCallback2);
}

//4.  Handle the results  of the Nearby Search
function nearbyCallback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarkers(results);
    }
}

function nearbyCallback2(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        createMarkers2(results);
    }
}

// 5. Set markers at the location of each place result
// http://kml4earth.appspot.com/icons.html
function createMarkers(places) {
    var iconBase = "https://maps.google.com/mapfiles/kml/shapes/";
    places.forEach((place) => {
        let marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            icon: "assets/icons/bar.png",
        });

        /* TODO: Step 4B: Add click listeners to the markers */
        // Add click listener to each marker
        google.maps.event.addListener(marker, "click", () => {
            let request = {
                placeId: place.place_id,
                fields: ["name", "formatted_address", "geometry", "rating", "website", "photos"],
            };

            /* Only fetch the details of a place when the user clicks on a marker.
             * If we fetch the details for all place results as soon as we get
             * the search response, we will hit API rate limits. */
            service.getDetails(request, (placeResult, status) => {
                showDetails(placeResult, marker, status);
            });
        });

        // Adjust the map bounds to include the location of this marker
        bounds.extend(place.geometry.location);
    });
    /* Once all the markers have been placed, adjust the bounds of the map to
     * show all the markers within the visible area. */
    map.fitBounds(bounds);
}

function createMarkers2(places) {
    var iconBase = "https://maps.google.com/mapfiles/kml/shapes/";
    places.forEach((place) => {
        let marker = new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
            icon: "assets/icons/art-museum.png",
        });

        /* TODO: Step 4B: Add click listeners to the markers */
        // Add click listener to each marker
        google.maps.event.addListener(marker, "click", () => {
            let request = {
                placeId: place.place_id,
                fields: ["name", "formatted_address", "geometry", "rating", "website", "photos"],
            };

            /* Only fetch the details of a place when the user clicks on a marker.
             * If we fetch the details for all place results as soon as we get
             * the search response, we will hit API rate limits. */
            service.getDetails(request, (placeResult, status) => {
                showDetails(placeResult, marker, status);
            });
        });

        // Adjust the map bounds to include the location of this marker
        bounds.extend(place.geometry.location);
    });
    /* Once all the markers have been placed, adjust the bounds of the map to
     * show all the markers within the visible area. */
    map.fitBounds(bounds);
}

/* TODO: Step 4C: Show place details in an info window */
// Builds an InfoWindow to display details above the marker
function showDetails(placeResult, marker, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        let placeInfowindow = new google.maps.InfoWindow();
        let rating = "None";
        if (placeResult.rating) rating = placeResult.rating;
        placeInfowindow.setContent(
            "<div><strong>" + placeResult.name + "</strong><br>" + "Rating: " + rating + "</div>"
        );
        placeInfowindow.open(marker.map, marker);
        currentInfoWindow.close();
        currentInfoWindow = placeInfowindow;
        showPanel(placeResult);
    } else {
        console.log("showDetails failed: " + status);
    }
}

/* TODO: Step 4D: Load place details in a sidebar */
// Displays place details in a sidebar
function showPanel(placeResult) {
    // If infoPane is already open, close it
    if (infoPane.classList.contains("open")) {
        infoPane.classList.remove("open");
    }

    // Clear the previous details
    while (infoPane.lastChild) {
        infoPane.removeChild(infoPane.lastChild);
    }

    /* TODO: Step 4E: Display a Place Photo with the Place Details */
    // Add the primary photo, if there is one
    if (placeResult.photos) {
        let firstPhoto = placeResult.photos[0];
        let photo = document.createElement("img");
        photo.classList.add("hero");
        photo.src = firstPhoto.getUrl();
        infoPane.appendChild(photo);
    }

    // Add place details with text formatting
    let name = document.createElement("h1");
    name.classList.add("place");
    name.textContent = placeResult.name;
    infoPane.appendChild(name);
    if (placeResult.rating) {
        let rating = document.createElement("p");
        rating.classList.add("details");
        rating.textContent = `Rating: ${placeResult.rating} \u272e`;
        infoPane.appendChild(rating);
    }
    let address = document.createElement("p");
    address.classList.add("details");
    address.textContent = placeResult.formatted_address;
    infoPane.appendChild(address);
    if (placeResult.website) {
        let websitePara = document.createElement("p");
        let websiteLink = document.createElement("a");
        let websiteUrl = document.createTextNode(placeResult.website);
        websiteLink.appendChild(websiteUrl);
        websiteLink.title = placeResult.website;
        websiteLink.href = placeResult.website;
        websitePara.appendChild(websiteLink);
        infoPane.appendChild(websitePara);
    }

    // Open the infoPane
    infoPane.classList.add("open");
}
