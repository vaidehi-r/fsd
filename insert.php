<?php
include "db.php";

$fname = mysqli_real_escape_string($conn, $_POST['fname']);
$lname = mysqli_real_escape_string($conn, $_POST['lname']);
$roll = mysqli_real_escape_string($conn, $_POST['roll']);
$pass = mysqli_real_escape_string($conn, $_POST['pass']);
$contact = mysqli_real_escape_string($conn, $_POST['contact']);

$sql = "INSERT INTO students (first_name, last_name, roll_no, user_password, contact) 
VALUES ('$fname', '$lname', '$roll', '$pass', '$contact')";

if(mysqli_query($conn,$sql)){
    echo "Student Registered";
}else{
    echo "Error: " . mysqli_error($conn);
}
?>