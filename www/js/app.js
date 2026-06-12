let latitude = "";
let longitude = "";

let map;
let marker;

const GEOAPIFY_API_KEY = "843712b069214fbeb2c896a01dc4137e";

const API = "https://impotency-ragweed-unfocused.ngrok-free.dev/snack_reviewer/";

window.onload = function () {
    getLocation();
    loadReviews();
};

function getLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by this device.");
        return;
    }

    navigator.geolocation.watchPosition(
        function (position) {

            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            if (!map) {
                initMap();
            } else {
                updateMapLocation();
            }
        },
        function (error) {

            if (error.code === error.PERMISSION_DENIED) {
                alert("Permission denied. Please allow location in browser/app settings.");
            }
            else if (error.code === error.POSITION_UNAVAILABLE) {
                alert("Location unavailable. Turn on phone GPS/location.");
            }
            else if (error.code === error.TIMEOUT) {
                alert("Location timeout. Try again outside or enable high accuracy.");
            }
            else {
                alert("Unknown location error.");
            }
        },
        {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 10000
        }
    );
}

function initMap() {

    map = L.map("map").setView([latitude, longitude], 15);

    L.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
        {
            maxZoom: 20,
            attribution: "© OpenStreetMap contributors © Geoapify"
        }
    ).addTo(map);

    marker = L.marker([latitude, longitude])
        .addTo(map)
        .bindPopup("Current Location")
        .openPopup();
}

function updateMapLocation() {

    marker.setLatLng([latitude, longitude]);

    map.setView([latitude, longitude], 15);
}

function saveReview() {

    const snack_name = document.getElementById("snack_name").value.trim();
    const review_text = document.getElementById("review_text").value.trim();
    const rating = document.getElementById("rating").value;

    if (snack_name === "" || review_text === "") {
        alert("Please fill in snack name and review.");
        return;
    }

    if (latitude === "" || longitude === "") {
        alert("Location not ready yet. Please wait.");
        return;
    }
    

    fetch(API + "insert.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            snack_name: snack_name,
            review_text: review_text,
            rating: rating,
            latitude: latitude,
            longitude: longitude
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.status === "success") {
            alert("Review Saved");

            document.getElementById("snack_name").value = "";
            document.getElementById("review_text").value = "";
            document.getElementById("rating").value = "1";

            loadReviews();
        } else {
            alert("Save failed: " + data.message);
        }
    })
    .catch(error => {
    alert("Failed to save review: " + error.message);
});
}

function loadReviews(){

    fetch(API + "/get_reviews.php")
    .then(res=>res.json())
    .then(data=>{

        let html = "";
        
        data.forEach(item=>{

            html += `
            <div class="review">

                <h3>${item.snack_name}</h3>

                <p>${item.review_text}</p>

                <p>
                Rating:
                ${item.rating}/5
                </p>

                <p>
                Lat:
                ${item.latitude}
                </p>

                <p>
                Lng:
                ${item.longitude}
                </p>

                <button
                class="deleteBtn"
                onclick="deleteReview(${item.id})">

                Delete

                </button>

            </div>
            `;
        });

        document.getElementById(
            "reviewList"
        ).innerHTML = html;
    });
}

function deleteReview(id) {

    if (!confirm("Delete this review?")) return;

    fetch(API + "delete.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.status === "success") {
            alert("Review Deleted");
            loadReviews();
        } else {
            alert("Delete failed: " + data.message);
        }
    })
    .catch(error => {
        alert("Failed to delete review.");
    });
}
