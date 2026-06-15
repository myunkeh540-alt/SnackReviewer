<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, ngrok-skip-browser-warning");
header("Access-Control-Allow-Methods: POST, OPTIONS");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit();
}

require_once 'db_connect.php';

$data = json_decode(file_get_contents("php://input"), true);

// Check if an array of IDs was sent (Bulk Delete)
if (isset($data['ids']) && is_array($data['ids'])) {
    $ids = $data['ids'];
    
    // Security: Ensure all IDs are strictly integers to prevent SQL injection
    $ids = array_map('intval', $ids); 
    $ids_string = implode(',', $ids);
    
    $sql = "DELETE FROM reviews WHERE id IN ($ids_string)";
    
    if ($conn->query($sql) === TRUE) {
        echo json_encode(["status" => "success", "message" => "Selected reviews deleted."]);
    } else {
        echo json_encode(["status" => "error", "message" => $conn->error]);
    }
} 
// Check if a single ID was sent (Individual Delete)
elseif (isset($data['id'])) {
    $id = intval($data['id']);
    $stmt = $conn->prepare("DELETE FROM reviews WHERE id=?");
    $stmt->bind_param("i", $id);
    
    if ($stmt->execute()) {
        echo json_encode(["status" => "success"]);
    } else {
        echo json_encode(["status" => "error"]);
    }
    $stmt->close();
} else {
    echo json_encode(["status" => "error", "message" => "No ID provided"]);
}

$conn->close();
?>