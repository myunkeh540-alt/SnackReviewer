let latitude = "";
let longitude = "";

let map;
let marker;

const GEOAPIFY_API_KEY = "843712b069214fbeb2c896a01dc4137e";

// YOUR CURRENT NGROK URL
const API = "https://outlet-fleshed-sensuous.ngrok-free.dev/snack_reviewer";

window.onload = function () {
    getLocation();
    loadReviews();
};

// ========================
// LOCATION
// ========================

function getLocation() {
    if (!navigator.geolocation) {
        alert("Geolocation not supported.");
        return;
    }

    navigator.geolocation.watchPosition(
        function(position) {
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;

            if (!map) {
                initMap();
            } else {
                updateMapLocation();
            }
        },
        function(error) {
            switch(error.code) {
                case error.PERMISSION_DENIED:
                    alert("Location permission denied.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    alert("Location unavailable.");
                    break;
                case error.TIMEOUT:
                    alert("Location timeout.");
                    break;
                default:
                    alert("Unknown location error.");
            }
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

function initMap() {
    map = L.map("map").setView(
        [latitude, longitude],
        15
    );

    L.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-carto/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`,
        {
            maxZoom: 20,
            attribution: "© OpenStreetMap contributors © Geoapify"
        }
    ).addTo(map);

    marker = L.marker(
        [latitude, longitude]
    )
    .addTo(map)
    .bindPopup("Current Location")
    .openPopup();
}

function updateMapLocation() {
    marker.setLatLng([
        latitude,
        longitude
    ]);

    map.setView([
        latitude,
        longitude
    ], 15);
}

// ========================
// SAVE REVIEW
// ========================

function saveReview() {
    const snack_name = document.getElementById("snack_name").value.trim();
    const review_text = document.getElementById("review_text").value.trim();
    const rating = document.getElementById("rating").value;

    if (snack_name === "" || review_text === "") {
        alert("Please complete all fields.");
        return;
    }

    if (latitude === "" || longitude === "") {
        alert("Location not ready.");
        return;
    }

    console.log(API + "/insert.php");

    fetch(API + "/insert.php", {
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
    .then(response => {
        if (!response.ok) {
            throw new Error("HTTP Error " + response.status);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);

        if (data.status === "success") {
            alert("Review Saved Successfully");
            document.getElementById("snack_name").value = "";
            document.getElementById("review_text").value = "";
            document.getElementById("rating").value = "1";
            loadReviews();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error(error);
        alert("Failed to save review:\n" + error.message);
    });
}

// ========================
// LOAD REVIEWS (TABLE VIEW)
// ========================
function loadReviews() {
    const url = API + "/get_reviews.php";
    document.getElementById("reviewList").innerHTML = "Loading reviews...";

    fetch(url, {
        method: 'GET',
        headers: {
            'ngrok-skip-browser-warning': 'true',
            'Accept': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) throw new Error("HTTP Error: " + response.status);
        return response.json(); 
    })
    .then(data => {
        if (data.status === "error") {
            document.getElementById("reviewList").innerHTML = "ERROR: " + data.message;
            return;
        }

        if (!data || data.length === 0) {
            document.getElementById("reviewList").innerHTML = "<p>No reviews found yet.</p>";
            return;
        }

        // Added the "Delete Selected" button and the Select All checkbox header
        let tableHTML = `
            <div style="margin-bottom: 10px;">
                <button onclick="deleteSelected()" style="background: #d9534f; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">🗑️ Delete Selected</button>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; margin-top: 10px; font-size: 0.85em;">
                    <thead>
                        <tr style="background-color: #f2f2f2; border-bottom: 2px solid #ddd;">
                            <th style="padding: 8px; text-align: center;">
                                <input type="checkbox" id="selectAll" onclick="toggleSelectAll(this)">
                            </th>
                            <th style="padding: 8px;">Snack</th>
                            <th style="padding: 8px;">Review</th>
                            <th style="padding: 8px;">Rating</th>
                            <th style="padding: 8px;">Location (Lat, Lng)</th>
                            <th style="padding: 8px;">Time Saved</th>
                            <th style="padding: 8px;">Action</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach(review => {
            let lat = parseFloat(review.latitude).toFixed(5);
            let lng = parseFloat(review.longitude).toFixed(5);

            // Added individual checkboxes for each row
            tableHTML += `
                <tr style="border-bottom: 1px solid #ddd;">
                    <td style="padding: 8px; text-align: center;">
                        <input type="checkbox" class="review-checkbox" value="${review.id}">
                    </td>
                    <td style="padding: 8px;"><strong>${review.snack_name}</strong></td>
                    <td style="padding: 8px;">${review.review_text}</td>
                    <td style="padding: 8px;">${review.rating} ⭐</td>
                    <td style="padding: 8px;">${lat}, <br>${lng}</td>
                    <td style="padding: 8px;">${review.created_at}</td>
                    <td style="padding: 8px;">
                        <button onclick="deleteReview(${review.id})" style="background: #ff4c4c; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Delete</button>
                    </td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table></div>`;
        document.getElementById("reviewList").innerHTML = tableHTML;
    })
    .catch(error => {
        console.error(error);
        document.getElementById("reviewList").innerHTML = `<b>ERROR: Failed to fetch.</b><br>Check browser console for details.`;
    });
}

// ========================
// DELETE REVIEW (SINGLE)
// ========================

function deleteReview(id) {
    if (!confirm("Delete this review?")) {
        return;
    }

    fetch(API + "/delete.php", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            id: id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Review Deleted");
            loadReviews();
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error(error);
        alert("Failed to delete review.");
    });
}

// ========================
// BULK DELETE LOGIC
// ========================

// Toggles all checkboxes when the header checkbox is clicked
function toggleSelectAll(source) {
    const checkboxes = document.querySelectorAll('.review-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = source.checked;
    });
}

// Gathers selected IDs and sends them to delete.php
function deleteSelected() {
    const checkedBoxes = document.querySelectorAll('.review-checkbox:checked');
    const idsToDelete = Array.from(checkedBoxes).map(cb => cb.value);

    if (idsToDelete.length === 0) {
        alert("Please select at least one review to delete.");
        return;
    }

    if (!confirm(`Are you sure you want to delete ${idsToDelete.length} review(s)?`)) return;

    fetch(API + "/delete.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: idsToDelete }) 
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            alert("Selected reviews deleted.");
            loadReviews(); 
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(error => {
        console.error(error);
        alert("Failed to delete reviews.");
    });
}