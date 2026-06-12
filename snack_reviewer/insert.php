<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

$conn = new mysqli("localhost", "root", "", "snack_reviewer");

if ($conn->connect_error) {
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$snack_name = $data["snack_name"] ?? "";
$review_text = $data["review_text"] ?? "";
$rating = $data["rating"] ?? "";
$latitude = $data["latitude"] ?? "";
$longitude = $data["longitude"] ?? "";

if ($snack_name == "" || $review_text == "" || $rating == "" || $latitude == "" || $longitude == "") {
    echo json_encode([
        "status" => "error",
        "message" => "Missing data"
    ]);
    exit();
}

$stmt = $conn->prepare(
    "INSERT INTO reviews (snack_name, review_text, rating, latitude, longitude)
     VALUES (?, ?, ?, ?, ?)"
);

$stmt->bind_param("ssiss", $snack_name, $review_text, $rating, $latitude, $longitude);

if ($stmt->execute()) {
    echo json_encode([
        "status" => "success",
        "message" => "Review saved successfully"
    ]);
} else {
    echo json_encode([
        "status" => "error",
        "message" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();

?>