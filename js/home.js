//Prompts user to enter a buget
var budget = 20000;
function start() {
	localStorage.setItem("budget",budget);
	window.location.href = "dig.html";
}

//Budget slider
document.addEventListener("DOMContentLoaded", function(event) {
	var slider = document.getElementById("myRange");
	var output = document.getElementById("val");
	output.innerHTML = slider.value;
	slider.oninput = function() {
		if (this.value == 100000) {
			output.innerHTML = "Unlimited"
			budget = -1;
		} else {
			budget = this.value;
			output.innerHTML = budget;
		}
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
