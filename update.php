<?php
include "db.php";

$roll = $_POST['roll'];
$contact = $_POST['contact'];

$sql = "UPDATE students SET contact='$contact' WHERE roll_no='$roll'";

if(mysqli_query($conn,$sql)){
    echo "Updated Successfully";
}else{
    echo "Error";
}
?>