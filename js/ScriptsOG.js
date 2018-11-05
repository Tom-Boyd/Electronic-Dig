//Declare global variables
document.addEventListener("DOMContentLoaded", function(event) {
	svg = document.getElementById('svg');
	svgStyle = document.getElementById("svgMap");
	lines = document.querySelectorAll("svg *");

	//Show map
	var svgMap = document.getElementById("svgMap");
	svgMap.style.display = "inline";
});

//Prompts user to enter a buget
function start() {
	if (document.getElementById("unlimited").checked) {
		return;
	}
	var budget = prompt("Budget prompt", 20000);

	if (budget == 0 || budget == "") {
		alert("Using an unlimited budget");
	}
	else {
		alert("Using a budget of $" + budget + ". You may begin your dig.");
	}
}

window.addEventListener('mouseover',function(){
	if (mouseDown == 1) {
		element = event.target.parentElement;
		parent = element.parentElement;
		if (parent) {
			if (!excavatedSquaresObj.includes(element) && !selectedSquaresObj.includes(element)) {
				if (parent.id == "GRID_UNITS") {
					console.log("found");
					element.onclick();
				}
			}
		}
	}
});

//Allows scroll wheel to enter and exit a square
window.addEventListener('wheel',function(){
	var x = event.clientX, y = event.clientY,
  element = document.elementFromPoint(x, y).parentElement;
	if (excavatedSquaresObj.includes(element) && event.deltaY < 0){
		element.onclick();
	}
	if (element.id == "svgMap" && view == "square"  && event.deltaY > 0) {
		viewMap();
	}
});

//Shows the tutorial or primer
function tutPri() {
	var first = document.getElementById("first");
	var other = document.getElementById("other");
	first.style.display = "none";
	other.style.display = "block";
}
//From the tutorial or primer back, this will take them to the start screen
function back() {
	var first = document.getElementById("first");
	var other = document.getElementById("other");
	first.style.display = "block";
	other.style.display = "none";
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
	var squares = document.querySelectorAll("#GRID_UNITS a");
	unselectedSquares = [];
	for (i = 0; i < squares.length; ++i) {
		if (!(selectedSquaresObj.includes(squares[i]) || excavatedSquaresObj.includes(squares[i]))){
			unselectedSquares.push(squares[i]);
		}
	}
	if (number > unselectedSquares.length) number = unselectedSquares.length;
	for (i=0;i<number;i++){
		var x = Math.floor(Math.random() * unselectedSquares.length);
		console.log(number);
		unselectedSquares[x].onclick();
		remove(unselectedSquares,unselectedSquares[x]);
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
		view = "square";
		zooming = true;
		var map = document.getElementById("map");
		var square = document.getElementById("square");
		var feature = document.getElementById("feature");
		var artifacts = document.getElementById("artifacts");
		artifacts.style.display = "inline";
		map.style.display = "none";
		feature.style.display = "none";
		square.style.display = "inline";

		//Set value for zooming in
		per = 0;
		var string = info.split("S")[1];
		var first = parseInt(string.split("R")[0]);
		var second = parseInt(string.split("R")[1]);
		if (second == 103) second = 110;
		first = (first+10)*-1;
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
function viewMap() {
	if (!zooming) {
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
	var map = document.getElementById("map");
	var square = document.getElementById("square");
	var feature = document.getElementById("feature");
	var artifacts = document.getElementById("artifacts");
	artifacts.style.display = "inline";
	map.style.display = "none";
	feature.style.display = "inline";
	square.style.display = "none";

	var svgStyle = document.getElementById("svgMap");
	svgStyle.style.display = "none";
}

//When the user clicks on a square:
//Selects a square if its not excavated or already selected
//Deselects a square if its already selected
function square(object,info) {
	if(selectedSquaresObj.includes(object)) { //deselect
		object.firstChild.style.fill= "url(#imgGrass)";
		remove(selectedSquares, info);
		remove(selectedSquaresObj, object);
	} else {
		if(excavatedSquaresObj.includes(object)) {
			if (info != 'null') viewSquare(info);
		} else {
			object.firstChild.style.fill= "url(#imgGrassSelected)";
			selectedSquares.push(info);
			selectedSquaresObj.push(object);
		}
	}
}

//Deselects all squares
function deselect() {
	for (var i = selectedSquares.length-1; i>=0; i--){
		selectedSquaresObj[i].onclick();
	}
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
	for (i = 0; i< num; i++){
		selectedSquaresObj[i].firstChild.style.fill= "rgb(255, 255, 255,0)";
		excavatedSquares.push(selectedSquares[i]);
		excavatedSquaresObj.push(selectedSquaresObj[i]);
	}
	selectedSquares = [];
	selectedSquaresObj = [];
}
