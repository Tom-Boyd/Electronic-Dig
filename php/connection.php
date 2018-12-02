<?php
define('MYSQL_NUM',MYSQLI_NUM);

if ($_SERVER["REQUEST_METHOD"] == "GET") {
  //Create connection
  $servername = "localhost";
  $username = "electronicdig";
  $password = "occaneechi523";
  $dbname = "electron_database";
  $conn = mysqli_connect($servername, $username, $password, $dbname);

  //Check connection
  if (mysqli_connect_errno()) {
    die("Connection failed: " . mysqli_connect_error());
  }

  //Get squares feature is on
  if (isset($_GET["codeFeat"])) {
    $code = mysqli_real_escape_string($conn, $_GET["codeFeat"]); //For security
    $sql = "SELECT assoc FROM masterls WHERE UPPER(code) = '".$code."' limit 1";
    $query = $conn->query($sql);
    if (!$query) printf("Error: %s\n", mysqli_error($conn));
    $result = mysqli_fetch_array($query)[0];
    $squares = explode(",",$result);
    $codes = array();
    for ($x=0; $x < count($squares); $x++){
      if (strpos($squares[$x], 'Sq.') !== false) {
          array_push($codes,"S".trim(explode(".",$squares[$x])[1]));
      }
    }
    echo json_encode($codes);
  }

  //Gets Cost to excavate
  if (isset($_GET["codeCost"])) {
    $code = mysqli_real_escape_string($conn, $_GET["codeCost"]); //For security
    $sql = "SELECT hours FROM masterls WHERE UPPER(code) = '".$code."' limit 1";
    $query = $conn->query($sql);
    if (!$query) printf("Error: %s\n", mysqli_error($conn));
    echo mysqli_fetch_array($query)[0];
  }

  //Gets Images of square
  if (isset($_GET["codeSquPics"])) {
    $code = mysqli_real_escape_string($conn, $_GET["codeSquPics"]); //For security
    $sql = "SELECT pict FROM masterls WHERE UPPER(code) = '".$code."' limit 1";
    $query = $conn->query($sql);
    if (!$query) printf("Error: %s\n", mysqli_error($conn));
    echo mysqli_fetch_array($query)[0];
  }

  //Gets Info about a square or feature
  if (isset($_GET["code"])) {
    $code = mysqli_real_escape_string($conn, $_GET["code"]); //For security

    //Get general data about the item
    $sql = "SELECT prov,type,length,width,depth,area,vol FROM masterls WHERE UPPER(code) = '".$code."' limit 1";
    $query = $conn->query($sql);
    if (!$query) printf("Error: %s\n", mysqli_error($conn));
    $properties = mysqli_fetch_array($query);

    //Finds which table we need (Square or Feature)
    $table = "squares";
    if (strpos($code, 'fea') !== false || strpos($code, 'bur') !== false) $table = "features";

    //Declare arrays to be populated
    $contextTable = array();
    $artifactTables = array();
    $moreTables = array();
    $morePictures = array();

    //Populate the context table
    $sql = "SELECT DISTINCT context FROM ".$table." WHERE econtext = '".$code."'";
    $contexts = $conn->query($sql);
    while ($context = mysqli_fetch_array($contexts, MYSQLI_NUM)) {
      //Get number of entries in that context
      $sql = "SELECT COUNT(context) FROM ".$table." WHERE econtext = '".$code."' AND context = '".$context[0]."'";
      $entries = mysqli_fetch_array($conn->query($sql))[0];

      //Find if one of them has a photo
      $photo = "X";
      $sql = "SELECT filecode FROM ".$table." WHERE econtext = '".$code."' AND context = '".$context[0]."'";
      $filecodes = $conn->query($sql);
      while ($filecode = mysqli_fetch_array($filecodes, MYSQLI_NUM)) {
        if (!empty($filecode[0])) {
          $photo = "Y";
          break;
        }
      }

      array_push($contextTable,array($context[0],$entries,$photo));
    }

    //Populate the artifact tables - a table per each context
    for ($x=0; $x < count($contextTable); $x++){
      //Populate an artifact table
      $artifactTable = array();

      $sql = "SELECT * FROM ".$table." WHERE econtext = '".$code."' AND context = '".$contextTable[$x][0]."'";
      $artifacts = $conn->query($sql);

      //Store result in array
      while ($artifact = mysqli_fetch_array($artifacts, MYSQLI_NUM)) {
        array_push($artifactTable,$artifact);
      }
      //Push extra column 0 = no more button
      array_push($artifactTable,0);

      array_push($artifactTables,$artifactTable);
    }

    //Populate the more tables and pictures
    $moreCount = 1;
    for ($x=0; $x < count($artifactTables); $x++){
      for ($z=0; $z < count($artifactTables[$x]); $z++){
        $isPhoto = false;
        $isMore = false;

        //Check if there is more information
        if (!empty($artifactTables[$x][$z][7])) {
          //Get more information
          $moreTable = array();
          $moreTableName = strtolower($artifactTables[$x][$z][7]); //Lowercase to work with mysql 5.7
          $catalog = $artifactTables[$x][$z][8];

          //First push the column names
          //$columns = array();
          //$sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '".$moreTableName."'";
          //$query = $conn->query($sql);
          //while ($col = mysqli_fetch_array($query, MYSQLI_NUM)) {
          //  array_push($columns,$col);
          //}
          //array_push($moreTable,$columns);

          //First push table name - used in JS to filter columns
          array_push($moreTable,$moreTableName);

          $columns = array();
          $sql = "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '".$moreTableName."'";
          $query = $conn->query($sql);
          while ($col = mysqli_fetch_array($query, MYSQLI_NUM)) {
            array_push($columns,$col);
          }
          array_push($moreTable,$columns);

          //Push the rest of the data
          $sql = "SELECT * FROM ".$moreTableName." WHERE catalog_no = '".$catalog."'";
          $more = $conn->query($sql);
          while ($moreRow = mysqli_fetch_array($more, MYSQLI_NUM)) {
            array_push($moreTable,$moreRow);
          }

          array_push($moreTables,$moreTable);
          $isMore = true;
        }

        //Check if there is a photo
        if (!empty($artifactTables[$x][$z][1])) {
          array_push($morePictures,$artifactTables[$x][$z][1]);
          $isPhoto = true;
        }

        //Keep moreTables and morePictures at same length
        if ($isPhoto || $isMore) {
          if (!$isPhoto || !$isMore) {
            if ($isPhoto) array_push($moreTables,"");
            if ($isMore) array_push($morePictures,"");
          }

          //Set to more count so JS knows
          $artifactTables[$x][$z][9] = $moreCount;
          $moreCount++;
        }
      }
    }

    //The output
    echo json_encode(array($contextTable,$artifactTables,$properties,$moreTables,$morePictures));
  }
}
?>
