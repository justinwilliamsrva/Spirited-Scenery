var image_track = "f";



// Show Murals Click Event
$(document).ready(function () {
	$("#flip").click(function () {
		$("#muralpc").slideDown("slow");
		$("#flip").html("Click on image to see more!");
	});
});
// Change Mural Image Function
function change() {
	var image = document.getElementById("muralpc");
	if (image_track == "f") {
		image.src = "assets/img/2.png";
		image_track = "2";
	} else if (image_track == "2") {
		image.src = "assets/img/3.jpg";
		image_track = "3";
	} else if (image_track == "3") {
		image.src = "assets/img/4.jpg";
		image_track = "4";
	} else if (image_track == "4") {
		image.src = "assets/img/5.jpg";
		image_track = "5";
	} else if (image_track == "5") {
		image.src = "assets/img/6.jpg";
		image_track = "6";
	} else if (image_track == "6") {
		image.src = "assets/img/7.jpg";
		image_track = "7";
	} else if (image_track == "7") {
		image.src = "assets/img/8.jpg";
		image_track = "8";
	} else if (image_track == "8") {
		image.src = "assets/img/9.jpg";
		image_track = "9";
	} else if (image_track == "9") {
		image.src = "assets/img/10.jpg";
		image_track = "10";
	} else if (image_track == "10") {
		image.src = "assets/img/11.jpg";
		image_track = "11";
	} else if (image_track == "11") {
		image.src = "assets/img/12.jpg";
		image_track = "f";
	} else if (image_track == "f") {
		change();
	}
}
