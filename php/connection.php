<?php
//if ($_SERVER["REQUEST_METHOD"] == "GET") {
  $servername = "localhost";
  $username = "electronicdig";
  $password = "occaneechi523";
  $dbname = "electron_database";
  //Create connection
  $conn = mysqli_connect($servername, $username, $password, $dbname);
  //Check connection
  if (mysqli_connect_errno()) {
    die("Connection failed: " . mysqli_connect_error());
  }
  if (isset($_GET["code"])) {
    $code = $_GET["code"];
    $sql = "SELECT prov,type,length,width,depth,area,vol FROM masterls WHERE UPPER(code) = '".$code."' limit 1";
    $properties = mysqli_fetch_array($conn->query($sql));
    $sql = "SELECT filecode,context,description,qty,unit,size,adinfo,catno FROM squares WHERE econtext = '".$code."'";
    $results = $conn->query($sql);
    $contextTable = array();
    $artifactTable = array();
    while ($data = mysqli_fetch_array($results)) {
      $exists = false;
      for ($x=0; $x < count($contextTable); $x++){
        if ($contextTable[$x][0] == $data[1]) {
          $more = "0";
          if (ctype_space($data[6])) $more = "1";
          array_push($artifactTable,array($x,$data[7],$data[2],$more));
          $contextTable[$x][1] += 1;
          if (ctype_space($data[0])) {
            $contextTable[$x][2] = "Y";
          }
          $exists = true;
          break;
        }
      }
      if (!$exists) {
        array_push($contextTable,array($data[1],0,"X"));
        $more = "0";
        if (ctype_space($data[6])) $more = "1";
        array_push($artifactTable,array(count($contextTable)-1,$data[7],$data[2],$more));
        $contextTable[count($contextTable)-1][1] += 1;
        if (ctype_space($data[0])) {
          $contextTable[count($contextTable)-1][2] = "Y";
        }
      }
    }
    //The output
    //Context Table: Context|Entries|Photo
    //Artifact Table: CatNo|Artifacts|More  //More = 1 if there is more
    //Properties: prov|type|length|width|depth|area|vol
    foreach ($contextTable as $row) {
      echo implode("|",$row);
      echo "]";
    }
    echo "[";
    foreach ($artifactTable as $row) {
      echo implode("|",$row);
      echo "]";
    }
    echo "[";
    for ($x=0; $x < count($properties); $x++){
      if (isset($properties[$x])) echo $properties[$x]."|";
    }
  }
?>
