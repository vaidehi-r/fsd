<?php
include "db.php";
?>

<!DOCTYPE html>
<html>
<head>
    <title>View Students</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">

<h2>Student Records</h2>

<?php
$result = mysqli_query($conn, "SELECT * FROM students");

echo "<table>
<tr>
<th>ID</th>
<th>First Name</th>
<th>Last Name</th>
<th>Roll No</th>
<th>Contact</th>
</tr>";

while($row = mysqli_fetch_assoc($result)){
    echo "<tr>
    <td>{$row['id']}</td>
    <td>{$row['first_name']}</td>
    <td>{$row['last_name']}</td>
    <td>{$row['roll_no']}</td>
    <td>{$row['contact']}</td>
    </tr>";
}

echo "</table>";
?>

<br>
<a href="index.html">← Back to Home</a>

</div>

</body>
</html>