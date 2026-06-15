<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

// THE FIX: Explicitly allow the ngrok bypass header here
header("Access-Control-Allow-Headers: Content-Type, ngrok-skip-browser-warning");
header("Access-Control-Allow-Methods: GET, OPTIONS");

// Handle preflight requests
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

// Ensure db_connect.php is correct and in the same folder
require_once 'db_connect.php'; 

$sql = "SELECT * FROM reviews ORDER BY id DESC";
$result = $conn->query($sql);

if (!$result) {
    echo json_encode(["status" => "error", "message" => $conn->error]);
    exit();
}

$reviews = [];
while ($row = $result->fetch_assoc()) {
    $reviews[] = $row;
}

echo json_encode($reviews);
$conn->close();
?>