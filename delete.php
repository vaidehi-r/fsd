<?php
include "db.php";

$roll = $_POST['roll'];

$sql = "DELETE FROM students WHERE roll_no='$roll'";

if(mysqli_query($conn,$sql)){
    echo "Deleted Successfully";
}else{
    echo "Error";
}
?>