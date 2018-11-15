var tooltipOn;


// EVENT LISTENERS
document.addEventListener("DOMContentLoaded", function(event) {
  //Declare DOM global variables
	svg = document.getElementById('svg');
	svgStyle = document.getElementById("svgMap");
	lines = document.querySelectorAll("svg *");

	//set Budget
	setBudget(localStorage.getItem("budget"));

	//Show map
	var svgMap = document.getElementById("svgMap");
	svgMap.style.display = "inline";

  //modal
  var modal = document.getElementById('myModal');
  var span = document.getElementsByClassName("close")[0];
  //When the user clicks on <span> (x), close the modal
  span.onclick = function() {	modal.style.display = "none";}
});
window.addEventListener('mouseover',function(){
  //Drag selecting
	if (mouseDown == 1) {
		element = event.target.parentElement;
		parent = element.parentElement;
		if (parent) {
			if (!excavatedSquaresObj.includes(element) && !selectedSquaresObj.includes(element)) {
				if (parent.id == "GRID_UNITS") {
					element.onclick();
				}
			}
		}
	}
	//tooltip
	parent = event.target.parentElement;
	if (parent) {
		var tooltip = document.getElementById('excavateFeatureTooltip');
		if( event.target !=  tooltipOn){
			if(parent.id=="Features"){
				tooltip.style.display = "inline";
				tooltip.style.left = event.screenX;
				tooltip.style.top = event.screenY;
				tooltipOn=  event.target;
			}
		}
	}
});
window.addEventListener('wheel',function(){
  //Allows scroll wheel to enter and exit a square
	var x = event.clientX, y = event.clientY,
  element = document.elementFromPoint(x, y).parentElement;
	if (excavatedSquaresObj.includes(element) && event.deltaY < 0){
		element.onclick();
	}
	if (element.id == "svgMap" && view == "square"  && event.deltaY > 0) {
		viewMap();
	}
});

//Budget
var budget = -1;
var rate = 10; //in dollars per hour
function formatBudget(val) {
	var budgetString = "$"+val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	return budgetString;
}
function setBudget(val) {
	budget = val;
	element = document.getElementById("budget");
	if (val == "-1") element.innerHTML = "Unlimited";
	else element.innerHTML = formatBudget(val);
}
function updateBudget(newBudget) {
	if (budget != newBudget) {
		difference = budget - newBudget;
		setBudget(newBudget);
		//do minus animation
		element = document.getElementsByClassName("budgetAnim")[0];
		animate = element.cloneNode(false);
		element.parentElement.appendChild(animate);
		element.innerHTML = "-"+formatBudget(difference);
		element.style.top = "50px";
		element.style.opacity = "0";
		setTimeout(function(){
			element = document.getElementsByClassName("budgetAnim")[0];
			element.remove();
		}, 2000);
	}
}

//Info box
var log = [];
function updateInfo(info) {
	element = document.getElementById("infoText");
	element.innerHTML = info+"<br>"+element.innerHTML;
	log.push(info)
}

//Ajax calls
var squares = [];
function getSquares(code) {
	var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
			squares = jQuery.parseJSON(this.response);
    }
  };
  xmlhttp.open("GET", "php/connection.php?codeFeat=" + code, false);
  xmlhttp.send();
}
var cost = 0;
function getCost(code) {
	var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
			cost = parseInt(this.response)*rate;
    }
  };
  xmlhttp.open("GET", "php/connection.php?codeCost=" + code, false);
  xmlhttp.send();
}
var sqcontextTable, sqartifactTable, sqproperties, sqmoreTables, sqpictures;
var feacontextTable, feaartifactTable, feaproperties, feamoreTables, feapictures;
function getData(code) {
  var xmlhttp = new XMLHttpRequest();
  xmlhttp.onreadystatechange = function() {
      if (this.readyState == 4 && this.status == 200) {
          var data = jQuery.parseJSON(this.response);
          var cTable = data[0];
          var aTable = data[1];
          var props = data[2];
					var mTables = data[3];
					var pics = data[4];
					if (view == "square") {
						sqcontextTable = cTable;
						sqartifactTable = aTable;
						sqproperties = props;
						sqmoreTables = mTables;
						sqpictures = pics;
					} else {
						feacontextTable = cTable;
						feaartifactTable = aTable;
						feaproperties = props;
						feamoreTables = mTables;
						feapictures = pics;
					}
          update();
      }
  };
  xmlhttp.open("GET", "php/connection.php?code=" + code, true);
  xmlhttp.send();
}

function update() {
  var title = document.getElementById("ajTitle");
  var type = document.getElementById("ajType");
  var length = document.getElementById("ajLength");
  var width = document.getElementById("ajWidth");
  var depth = document.getElementById("ajDepth");
  var volume = document.getElementById("ajVolume");
  var area = document.getElementById("ajArea");
	if (view == "square") {
	  title.innerHTML = sqproperties[0];
	  type.innerHTML = sqproperties[1];
	  length.innerHTML = sqproperties[2];
	  width.innerHTML = sqproperties[3];
	  depth.innerHTML = sqproperties[4];
	  area.innerHTML = sqproperties[5];
	  volume.innerHTML = sqproperties[6];
	  generateCTable(sqcontextTable);
	  generateATable(0,sqartifactTable,sqpictures);
	} else {
		title.innerHTML = feaproperties[0];
	  type.innerHTML = feaproperties[1];
	  length.innerHTML = feaproperties[2];
	  width.innerHTML = feaproperties[3];
	  depth.innerHTML = feaproperties[4];
	  area.innerHTML = feaproperties[5];
	  volume.innerHTML = feaproperties[6];
		generateCTable(feacontextTable);
		generateATable(0,feaartifactTable,feapictures);
	}
}

function generateATable(contextID, artifactTable, pictures) {
	if (view != "square") {
		artifactTable = feaartifactTable;
		pictures = feapictures;
	} else {
		artifactTable = sqartifactTable;
		pictures = sqpictures;
	}
  var aTable = document.getElementById("artifactTable");
  var table = "<table><tr>";
  table += "<th>Cat No.</th>";
  table += "<th>Artifacts</th>";
	table += "<th>Picture</th>";
  table += "<th>More</th>";
  table += "</tr>";
  for (i = 0; i < artifactTable[contextID].length-1; ++i) {
    table += "<tr>";
    table += "<td>"+artifactTable[contextID][i][8]+"</td>";
		table += "<td>"+artifactTable[contextID][i][3]+"</td>";
		var more = parseInt(artifactTable[contextID][i][9]);
		if (more > 0){
			if (pictures[more]){
				table += "<td>Y</td>";
			} else {
				table += "<td>X</td>";
			}
			table += "<td><button onclick='more("+more+")'>More</button></td>";
		} else {
			table += "<td>X</td>";
			table += "<td>X</td>";
		}
    table += "</tr>";
  }
  aTable.innerHTML = table;
}

function generateCTable(contextTable) {
  var cTable = document.getElementById("contextTable");
  var table = "<table><tr>";
  table += "<th>Context</th>";
  table += "<th>Entries</th>";
  table += "<th>Photo</th>";
  table += "</tr>";
  for (i = 0; i < contextTable.length-1; ++i) {
    table += "<tr onclick='generateATable("+i+")'>";
    for (z = 0; z < contextTable[i].length; ++z) {
      table += "<td>"+contextTable[i][z]+"</td>";
    }
    table += "</tr>";
  }
  cTable.innerHTML = table;
}

//When the user clicks anywhere outside of the modal, close it
var modal, btn, span;
window.onclick = function(event) {
		if (event.target == modal) {
				modal.style.display = "none";
		}
}

//When the more button is clicked
function more(index) {
	if (view == "feature") {
		pictures = feapictures;
		moreTables = feamoreTables;
	}
	else {
		pictures = sqpictures;
		moreTables = sqmoreTables;
	}

	//Filter Columns
	var tableName = moreTables[index][0];
	var columnNames = [];
	var indexes = [];
	var title = "";

	if (tableName == "aabeads") {
		title = "Beads";
		columnNames = ["Catalog Number","Material","Condition","Manufacture","Size","Shape","Diaphaneity","Color","Count"];
		indexes = [1,3,4,5,6,7,8,9,10];
	}
	if (tableName == "aaceram") {
		title = "Ceramics";
		columnNames = ["Catalog Number","Portion","Temper","Surface","Interior","Size","Thickness","Decoration"];
		indexes = [1,2,3,4,5,6,7,11];
	}
	if (tableName == "aafaun") {
		title = "Fauna";
		columnNames = ["Catalog Number","Species","Name","Class","Element","Size","Count"];
		indexes = [1,2,3,4,5,10,12];
	}
	if (tableName == "aahc") {
		title = "Historic Ceramics";
		columnNames = ["Catalog Number","Portion","Ware","Type","Decoration","Size","Count"];
		indexes = [1,2,3,4,5,8,9];
	}
	if (tableName == "aahist") {
		title = "Historic Artifacts";
		columnNames = ["Catalog Number","Material Type","Type","Function","Size","Count"];
		indexes = [1,3,4,5,8,9];
	}
	if (tableName == "aalithic") {
		title = "Stone Tools";
		columnNames = ["Catalog Number","Category","Raw Material","Condition","Size","Count"];
		indexes = [1,2,5,6,7,8];
	}
	if (tableName == "aapip") {
		title = "Pipes";
		columnNames = ["Catalog Number","Raw Material","Morphology","Portion","Count"];
		indexes = [1,2,3,4,18];
	}

	var modal = document.getElementById('myModal');
	var modalEdit = document.getElementById('modalEdit');
	modal.style.display = "block";

	title = "<h1>"+title+"</h1>"
	//Column names
	var table = title+"<table><tr>";
	for (i = 0; i < columnNames.length; ++i) {
			table += "<th>"+columnNames[i]+"</th>";
	}
	table += "</tr>";
	for (i = 2; i < moreTables[index].length; ++i) {
		table += "<tr>";
		for (z = 0; z < indexes.length; ++z) {
			table += "<td>"+moreTables[index][i][indexes[z]]+"</td>";
		}
		table += "</tr>";
	}
	table += "</table>";

	var content = table+"<br>";
	if (pictures[index] != "") {
		content += "<img src='db/images/"+pictures[index].toString().toLowerCase()+".gif'/>";
	}
	modalEdit.innerHTML = content;
	modal.style.display = "block";
}

//Used to keep track of the type of square
var selectedSquares = [];
var selectedSquaresObj = [];
var excavatedSquares = [];
var excavatedSquaresObj = [];

//Used for drag selecting
var mouseDown = 0;
document.body.onmousedown = function() {
  mouseDown = 1;
};
document.body.onmouseup = function() {
  mouseDown = 0;
};

//Lets user select a random number of squares
var unselectedSquares;
function random() {
	var number = prompt("Enter number of squares to select", 0);
	if (number > 0){
		var squares = document.querySelectorAll("#GRID_UNITS a");
		unselectedSquares = [];
		for (i = 0; i < squares.length; ++i) {
			if (!(selectedSquaresObj.includes(squares[i]) || excavatedSquaresObj.includes(squares[i]))){
				unselectedSquares.push(squares[i]);
			}
		}
		if (number > unselectedSquares.length) number = unselectedSquares.length;
		running = true;
		for (i=0;i<number;i++){
			var x = Math.floor(Math.random() * unselectedSquares.length);
			unselectedSquares[x].onclick();
			remove(unselectedSquares,unselectedSquares[x]);
		}
		if (number == 1) updateInfo("Randomly selected 1 square");
		else updateInfo("Randomly selected "+number+" squares");
		running = false;
	}
}

//Global vars to do with map zooming
var to, from = [];
var per, sto, sfrom, hto, hfrom = 0;
var svg, svgStyle, lines, zooming;
var view = "map";
//mapZoom gets a new value using a percentage of
//what the value started as, to what the value will be.
//This creates a animation of zooming in and out
function mapZoom() {
	per += 0.2;
	var val = [0,0,0,0];
	for (var i = 0; i < 4; i++) val[i] = from[i] + ((to[i]-from[i]) * per);
	var stroke = sfrom + ((sto-sfrom) * per);
	for (i = 0; i < lines.length; ++i) lines[i].style.strokeWidth = stroke;
	var height = hfrom + ((hto-hfrom) * per);
	svgStyle.style.height = height+"px";
	if (val[2] < 0) val[2] = 0;
	if (val[3] < 0) val[3] = 0;
	if (per >= 1) {
		svg.setAttribute("viewBox", to[0]+" "+to[1]+" "+to[2]+" "+to[3]);
		zooming = false;
		if (view == "square") hideGrid();
		return;
	} else svg.setAttribute("viewBox", val[0]+" "+val[1]+" "+val[2]+" "+val[3]);
	setTimeout(mapZoom, 1);
}

//Hides grid so a feature can be clicked
function hideGrid() {
	var grid = document.getElementById("GRID_UNITS");
	grid.style.display = "none";
}

//Shows grid so a square can be clicked
function showGrid() {
	var grid = document.getElementById("GRID_UNITS");
	grid.style.display = "inline";
}

//These 3 functions can show the 3 different views
function viewSquare(info){
	if (!zooming) {
		var wasFeature = false;
		if (view == "feature") {
			wasFeature = true;
		}
		view = "square";
		if (wasFeature) {
			update();
			var svgStyle = document.getElementById("svgMap");
			svgStyle.style.display = "inline";
		}
		var map = document.getElementById("map");
		var square = document.getElementById("square");
		var feature = document.getElementById("feature");
		var artifacts = document.getElementById("artifacts");
		artifacts.style.display = "inline";
		map.style.display = "none";
		feature.style.display = "none";
		square.style.display = "inline";

		if (!wasFeature) {
			//Set value for zooming in
			zooming = true;
			per = 0;
			var string = info.split("S")[1];
			if (string.includes("R")) {
				var first = parseInt(string.split("R")[0]);
				var second = parseInt(string.split("R")[1]);
				if (second == 103) second = 110;
				first = (first+10)*-1;
			} else {
				var first = parseInt(string.split("L")[0]);
				var second = -10;
				first = (first+10)*-1;
			}
			second = second-10;
			to = [second,first,10,150]; //viewbox
			from = [-20, -330, 130, 150]; //viewbox
			sto = 0.05; //stroke
			sfrom = 0.3; //stroke
			hto = 494; //height
			hfrom = 570; //height
			mapZoom();
		}
	}
}
function viewMap() {
	if (!zooming) {
		if (view == "feature") {
			var svgStyle = document.getElementById("svgMap");
			svgStyle.style.display = "inline";
		}
		view = "map";
		zooming = true;
		showGrid();
		var map = document.getElementById("map");
		var square = document.getElementById("square");
		var feature = document.getElementById("feature");
		var artifacts = document.getElementById("artifacts");
		artifacts.style.display = "none";
		map.style.display = "inline";
		feature.style.display = "none";
		square.style.display = "none";

		//Reverses all values for map zooming
		per = 0;
		var temp = to;
		to = from;
		from = temp;
		temp = sto;
		sto = sfrom;
		sfrom = temp;
		temp = hto;
		hto = hfrom;
		hfrom = temp;
		mapZoom();
	}
}
function viewFeature() {
	view = "feature";
	var map = document.getElementById("map");
	var feature = document.getElementById("feature");
	var artifacts = document.getElementById("artifacts");
	artifacts.style.display = "inline";
	map.style.display = "none";
	feature.style.display = "inline";

	var svgStyle = document.getElementById("svgMap");
	svgStyle.style.display = "none";
}

//When the user clicks on a square:
//Selects a square if its not excavated or already selected
//Deselects a square if its already selected
var selectedSquares = [];
var selectedSquaresObj = [];
var excavatedSquares = [];
var excavatedSquaresObj = [];
function square(object,info) {
	if(selectedSquaresObj.includes(object)) { //deselect
		object.firstChild.style.fill= "url(#imgGrass)";
		remove(selectedSquares, info);
		remove(selectedSquaresObj, object);
		if (!running) updateInfo("Squares selected: "+selectedSquares.length);
	} else {
		if(excavatedSquaresObj.includes(object)) {
			if (info != 'null') {
        getData(info);
        viewSquare(info);
      }
		} else {
			object.firstChild.style.fill= "url(#imgGrassSelected)";
			selectedSquares.push(info);
			selectedSquaresObj.push(object);
			if (!running) updateInfo("Squares selected: "+selectedSquares.length);
		}
	}
}

var featuredExcavated = []
function feature(info) {
	//budget
	if (budget != -1) {
		if (featuredExcavated.includes(info)) {
			getData(info);
			viewFeature();
		} else {
			//check if uncovered
			getSquares(info);
			var uncovered = true;
			for (i = 0; i < squares.length; ++i) {
				if(!excavatedSquares.includes(squares[i])){
					uncovered = false;
					break;
				}
			}
			if (!uncovered) {
				updateInfo("This feature is not fully uncovered");
			} else {
				getCost(info)
				var newBudget = budget;
				if (cost <= newBudget) {
					newBudget -= cost;
					getData(info);
					viewFeature();
					updateBudget(newBudget);
					featuredExcavated.push(info)
					updateInfo("You have excavated a feature for "+formatBudget(cost));
				} else {
					updateInfo("Not enough money to excavate!");
				}
			}
		}
	} else {
		getData(info);
		viewFeature();
	}
}

//Deselects all squares
var running = false;
function deselect() {
	while (selectedSquares.length != 0) {
		var num = selectedSquares.length;
		if (num == 0) {
			updateInfo("No squares selected to deselect");
		} else {
			running = true;
			var arr = selectedSquaresObj.slice();
			for (var i = num-1; i>=0; i--){
				arr[i].onclick();
			}
			running = false;
		}
	}
	updateInfo("All squares were deselected");
}

//Removes element from array
function remove(list,value) {
	for (var i = 0; i< list.length; i++){
		if (list[i] == value){
			list.splice(i,1);
		}
	}
}

//Excavates all the squares selected
function excavateSquare() {
	var num = selectedSquares.length;
	if (num == 0) {
		updateInfo("No squares selected to excavate");
	} else {
		var newBudget = budget;
		for (i = 0; i< num; i++){
			//budget
			if (budget != -1){
				cost = 40 * rate;
				if (cost <= newBudget) {
					newBudget -= cost;
				} else {
					updateInfo("Not enough money to excavate further!");
					break;
				}
			}
			selectedSquaresObj[i].firstChild.style.fill= "rgb(255, 255, 255,0)";
			excavatedSquares.push(selectedSquares[i]);
			excavatedSquaresObj.push(selectedSquaresObj[i]);
		}
		if (i != 0) {
			if (budget != -1) {
				if (i == 1) updateInfo("You have excavated "+i+" square for "+formatBudget(budget-newBudget));
				else updateInfo("You have excavated "+i+" squares for "+formatBudget(budget-newBudget));
				updateBudget(newBudget);
			} else {
				if (i == 1) updateInfo("You have excavated "+i+" square");
				else updateInfo("You have excavated "+i+" squares");
			}
			selectedSquares = selectedSquares.diff(excavatedSquares);
			selectedSquaresObj = selectedSquaresObj.diff(excavatedSquaresObj);
		}
	}
}

Array.prototype.diff = function(a) {
    return this.filter(function(i) {return a.indexOf(i) < 0;});
};
