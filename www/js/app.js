let latitude = "";
let longitude = "";

const API =
"https://outlet-fleshed-sensuous.ngrok-free.dev/snackreviewer";

window.onload = function(){

    getLocation();

    loadReviews();
};

function getLocation(){

    navigator.geolocation.getCurrentPosition(

        function(position){

            latitude =
            position.coords.latitude;

            longitude =
            position.coords.longitude;

            initMap();

        },

        function(error){

            alert("Location Error");
        }
    );
}

function initMap(){

    const myPos = {

        lat:parseFloat(latitude),
        lng:parseFloat(longitude)
    };

    const map =
    new google.maps.Map(
        document.getElementById("map"),
        {
            zoom:15,
            center:myPos
        }
    );

    new google.maps.Marker({
        position:myPos,
        map:map,
        title:"Current Location"
    });
}

function saveReview(){

    const snack_name =
    document.getElementById("snack_name").value;

    const review_text =
    document.getElementById("review_text").value;

    const rating =
    document.getElementById("rating").value;

    const fd = new FormData();

    fd.append(
        "snack_name",
        snack_name
    );

    fd.append(
        "review_text",
        review_text
    );

    fd.append(
        "rating",
        rating
    );

    fd.append(
        "latitude",
        latitude
    );

    fd.append(
        "longitude",
        longitude
    );

    fetch(
        API + "/insert.php",
        {
            method:"POST",
            body:fd
        }
    )
    .then(res=>res.json())
    .then(data=>{

        alert("Review Saved");

        loadReviews();

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

function deleteReview(id){

    if(!confirm(
        "Delete this review?"
    )) return;

    const fd =
    new FormData();

    fd.append(
        "id",
        id
    );

    fetch(
        API + "/delete.php",
        {
            method:"POST",
            body:fd
        }
    )
    .then(res=>res.json())
    .then(data=>{

        loadReviews();
    });
}