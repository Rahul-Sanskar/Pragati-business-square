<?php
// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// ── Configuration ──────────────────────────────────────────────
$to      = 'theredbricks.in@gmail.com';
$subject = 'New Enquiry — The Business Square, Nerul MIDC';
// ───────────────────────────────────────────────────────────────

// Sanitise inputs
function clean($value) {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

$name     = clean($_POST['txt_firstname']   ?? '');
$email    = filter_var(trim($_POST['txt_email']  ?? ''), FILTER_SANITIZE_EMAIL);
$mobile   = clean($_POST['txt_mobile']      ?? '');
$interest = isset($_POST['space_interest'])
              ? (is_array($_POST['space_interest'])
                  ? implode(', ', array_map('clean', $_POST['space_interest']))
                  : clean($_POST['space_interest']))
              : 'Not specified';

// Basic validation
if (empty($name) || empty($email) || empty($mobile)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Required fields missing']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

if (!preg_match('/^\d{10}$/', $mobile)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid mobile number']);
    exit;
}

// UTM / tracking fields (optional)
$utm_source   = clean($_POST['utm_source']   ?? '');
$utm_medium   = clean($_POST['utm_medium']   ?? '');
$utm_campaign = clean($_POST['utm_campaign'] ?? '');

// Build email body
$body  = "New enquiry received from The Business Square website.\n";
$body .= str_repeat('-', 50) . "\n\n";
$body .= "Name       : {$name}\n";
$body .= "Email      : {$email}\n";
$body .= "Mobile     : +91 {$mobile}\n";
$body .= "Interested : {$interest}\n\n";

if ($utm_source || $utm_medium || $utm_campaign) {
    $body .= str_repeat('-', 50) . "\n";
    $body .= "UTM Source   : {$utm_source}\n";
    $body .= "UTM Medium   : {$utm_medium}\n";
    $body .= "UTM Campaign : {$utm_campaign}\n\n";
}

$body .= str_repeat('-', 50) . "\n";
$body .= "Submitted at : " . date('d M Y, h:i A') . " IST\n";
$body .= "Website      : The Business Square — business-square.in\n";

// Email headers
$headers  = "From: noreply@business-square.in\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// Send email
$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Enquiry sent successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Mail server error. Please try again.']);
}
