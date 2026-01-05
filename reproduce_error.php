<?php
$url = 'http://localhost/kind-craft-portal/api/auth/register.php';
$data = array(
    'phone' => '1234567890', 
    'password' => 'testpassword',
    'options' => array(
        'data' => array(
            'registration_type' => 'matrimony',
            'full_name' => 'Test User',
            'dob' => '1990-01-01'
        )
    )
);

$options = array(
    'http' => array(
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true // Fetch content even on 4xx/5xx status
    )
);
$context  = stream_context_create($options);
$result = file_get_contents($url, false, $context);

echo "Raw Response:\n";
echo $result;
?>
