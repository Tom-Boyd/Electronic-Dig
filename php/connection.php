<?php
    //Connect to database
    $con = mysqli_connect('http://dig.cs.unc.edu (or whatever host is)','thomboyd', 'Qwertyuoip!');
    if (!$con) {
        die('Could not connect: ' . mysqli_error($con));
    } 
    mysqli_select_db($con,"databaseName");
    echo "Connection successful.";
    mysqli_close($con);
?>