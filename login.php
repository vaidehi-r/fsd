<?php
include "db.php";

$roll = $_POST['roll'];
$pass = $_POST['pass'];

$sql = "SELECT * FROM students WHERE roll_no='$roll' AND user_password='$pass'";
$result = mysqli_query($conn,$sql);

if(mysqli_num_rows($result) > 0){
    header("Location: dashboard.php");
}else{
    echo "<script>alert('Invalid Login'); window.location.href='index.html';</script>";
}
?>