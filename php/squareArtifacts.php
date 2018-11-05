<!DOCTYPE html>
<html>
<head>
<style>
table {
    width: 100%;
    border-collapse: collapse;
}

table, td, th {
    border: 1px solid black;
    padding: 5px;
    text-align: center;
}

th {text-align: center;}
</style>
</head>
<body>

<?php
$squareNo = strval($_GET['squareId']);

//Connect to database
$con = mysqli_connect('electronicdig.sites.oasis.unc.edu','electron_admin','occaneechi523','electron_database');
if (!$con) {
    die('Could not connect: ' . mysqli_error($con));
}

//Ensure the id was received
if ($squareNo == '')
{
    echo "Square ID not found.";
}

else
{
    //Fetch artifacts in current square
    mysqli_select_db($con,"electron_database");
    $sql="SELECT S.context, S.description, S.catno FROM squares S WHERE S.econtext = $squareNo";
    $result = mysqli_query($con,$sql);
    
    //Create table
    echo "<table>
    <tr>
    <th>Context</th>
    <th>Description</th>
    <th>Catalog No.</th>
    <th>More Info</th>
    </tr>";

    while($row = mysqli_fetch_array($result)) {
        echo "<tr>";
        echo "<td>" . $row[0] . "</td>";
        echo "<td>" . $row[1] . "</td>";
        echo "<td>" . $row[2] . "</td>";
        echo "<td><button id=\"myBtn\">More</button></td>";
        echo "</tr>";
    }
    echo "</table>";
}

mysqli_close($con);
?>
</body>
</html>