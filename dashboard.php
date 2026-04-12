<!DOCTYPE html>
<html>
<head>
<title>Dashboard</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<div class="container">

<h2>Dashboard</h2>

<div class="section">
    <a href="view.php">📋 View Students</a>
</div>

<div class="section">
    <h3>Update Contact</h3>
    <form action="update.php" method="POST">
        <input type="text" name="roll" placeholder="Roll No">
        <input type="text" name="contact" placeholder="New Contact">
        <button>Update</button>
    </form>
</div>

<div class="section">
    <h3>Delete Student</h3>
    <form action="delete.php" method="POST">
        <input type="text" name="roll" placeholder="Roll No">
        <button>Delete</button>
    </form>
</div>

<br>
<a href="index.html">Logout</a>

</div>

</body>
</html>