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
