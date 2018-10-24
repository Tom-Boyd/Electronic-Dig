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
var excavatedSquares = [];

//Used for drag selecting
var mouseDown = 0;
document.body.onmousedown = function() {
  mouseDown = 1;
}
document.body.onmouseup = function() {
  mouseDown = 0;
}
function hovered(square) {
	if (mouseDown == 1){
		selectSquare(square);
	}
}

//Lets user select a random number of squares
function random() {
	var number = prompt("Enter number of squares to select", 0);
	if (number <= ((15*13)-selectedSquares.length)) {
		for (i=0;i<number;i++){
			var x = Math.floor(Math.random() * 15);
			var y = Math.floor(Math.random() * 13);
			var square = document.getElementById(""+x+"a"+y+"");
			if (square.style.backgroundColor == "black"){
				i -= 1;
			} else {
				selectSquare(square);
			}
		}
	}
}
//These 3 functions can show the 3 different views
function viewSquare(){
	var map = document.getElementById("map");
	var square = document.getElementById("square");
	var feature = document.getElementById("feature");
	var artifacts = document.getElementById("artifacts");
	artifacts.style.display = "inline";
	map.style.display = "none";
	feature.style.display = "none";
	square.style.display = "inline";
}
function viewMap() {
	var map = document.getElementById("map");
	var square = document.getElementById("square");
	var feature = document.getElementById("feature");
	var artifacts = document.getElementById("artifacts");
	artifacts.style.display = "none";
	map.style.display = "inline";
	feature.style.display = "none";
	square.style.display = "none";
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
}

//When the user clicks on a square:
//Selects a square if its not excavated or already selected
//Deselects a square if its already selected
function selectSquare(div) {
	if(selectedSquares.includes(div.id)) {
		div.style.backgroundColor= "#bfd6ef";
		remove(div.id);
	} else {
		if(excavatedSquares.includes(div.id)) {
			viewSquare();
		} else {
			div.style.backgroundColor= "black";
			selectedSquares.push(div.id);
		}
	}
}

//Deselects all squares
function deselect() {
	for (var i = 0; i< selectedSquares.length; i++){
		selectSquare(document.getElementById(selectedSquares[i]));
	}
	if (selectedSquares.length > 0){
		deselect();
	}
}

//Removes a square from the selected square array
function remove(value) {
	for (var i = 0; i< selectedSquares.length; i++){
		if (selectedSquares[i] == value){
			selectedSquares.splice(i,1);
		}
	}
}

//Excavates all the squares selected
function excavateSquare() {
	for (var i = 0; i< selectedSquares.length; i++){
		console.log(selectedSquares.length);
		document.getElementById(selectedSquares[i]).style.backgroundColor= "transparent";
		excavatedSquares.push(selectedSquares[i]);
		remove(selectedSquares[i]);
	}
	if (selectedSquares.length > 0){
		excavateSquare();
	}
}
