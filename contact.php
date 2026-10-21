<?php
/**
 * Enquiry handler — The Business Square, Nerul MIDC
 *
 * JSON responses:
 *   success : {"success": true,  "message": "...", "submission_id": "..."}
 *   failure : {"success": false, "message": "..."}
 *
 * `submission_id` is a one-time identifier for a successfully processed
 * enquiry. The front end uses it to guarantee that exactly one Google Ads
 * conversion ("Business Square – Successful Enquiry") is recorded per
 * successful submission. It carries no personal data and is meaningless
 * outside this request.
 *
 * DELIVERY LIMITATION — please read:
 * PHP's mail() only reports whether the message was accepted by the local
 * mail transfer agent. It cannot confirm that the message reached anyone's
 * inbox (it may still bounce later, or be filtered as spam). Therefore
 * "success": true means "the enquiry was accepted for delivery", NOT "the
 * email was definitely delivered". No delivery guarantee is claimed by this
 * code or by the conversion tracking built on top of it.
 */

// Only accept POST requests
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// ── Cross-site request filtering ────────────────────────────────
// This is a public landing-page form with no authenticated session, so a
// classic CSRF token would add little protection. Instead, requests whose
// Origin is present and clearly does not belong to this site are rejected.
// Requests with no Origin header (some privacy tools strip it) are allowed
// so that genuine visitors are never blocked.
$requestHost = strtolower(preg_replace('/^www\./', '', explode(':', $_SERVER['HTTP_HOST'] ?? '')[0]));
$origin      = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '') {
    $originHost = strtolower(preg_replace('/^www\./', '', (string) parse_url($origin, PHP_URL_HOST)));
    if ($requestHost !== '' && $originHost !== '' && $originHost !== $requestHost) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Request blocked']);
        exit;
    }
}

// ── Configuration ──────────────────────────────────────────────
$to      = 'theredbricks.in@gmail.com';
$subject = 'New Enquiry — The Business Square, Nerul MIDC';
// ───────────────────────────────────────────────────────────────

/**
 * Normalise a single-line value posted by the form.
 * Strips tags and control characters so that no value can break out of an
 * email header or inject additional lines into the plain-text body.
 */
function field_text($value, $maxLength = 120) {
    $value = is_string($value) ? $value : '';
    $value = strip_tags($value);
    $value = preg_replace('/[\r\n\t\0]+/', ' ', $value);
    $value = trim(preg_replace('/\s{2,}/', ' ', $value));
    if (function_exists('mb_substr')) {
        return mb_substr($value, 0, $maxLength, 'UTF-8');
    }
    return substr($value, 0, $maxLength);
}

$name     = field_text($_POST['txt_firstname'] ?? '', 100);
$emailRaw = field_text($_POST['txt_email'] ?? '', 150);
$mobile   = field_text($_POST['txt_mobile'] ?? '', 20);

$interest = 'Not specified';
if (isset($_POST['space_interest'])) {
    $raw   = $_POST['space_interest'];
    $items = is_array($raw) ? $raw : [$raw];
    $picked = [];
    foreach ($items as $item) {
        $value = field_text($item, 40);
        if ($value !== '' && !in_array($value, $picked, true)) {
            $picked[] = $value;
        }
    }
    if ($picked) {
        $interest = implode(', ', $picked);
    }
}

// ── Validation ──────────────────────────────────────────────────
if ($name === '' || $emailRaw === '' || $mobile === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Required fields missing']);
    exit;
}

// Header-injection defence: refuse anything containing line breaks before it
// can reach the Reply-To header.
if (preg_match('/[\r\n]/', $emailRaw . $name)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid input']);
    exit;
}

$email = filter_var($emailRaw, FILTER_VALIDATE_EMAIL);
if ($email === false) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    exit;
}

if (!preg_match('/^[0-9]{10}$/', $mobile)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid mobile number']);
    exit;
}

// UTM / tracking fields (optional)
$utm_source   = field_text($_POST['utm_source'] ?? '', 100);
$utm_medium   = field_text($_POST['utm_medium'] ?? '', 100);
$utm_campaign = field_text($_POST['utm_campaign'] ?? '', 150);

// Build email body (plain text)
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

// Email headers ($email has passed FILTER_VALIDATE_EMAIL, so it is safe here)
$headers  = "From: noreply@business-square.in\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// One-time identifier used by the front end to de-duplicate the conversion.
try {
    $submissionId = bin2hex(random_bytes(16));
} catch (Throwable $e) {
    $submissionId = bin2hex(pack('N', time())) . bin2hex(pack('N', mt_rand()));
}

// Send email
$sent = @mail($to, $subject, $body, $headers);

if ($sent) {
    http_response_code(200);
    echo json_encode([
        'success'       => true,
        'message'       => 'Enquiry sent successfully',
        'submission_id' => $submissionId,
    ]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Mail server error. Please try again.']);
}
