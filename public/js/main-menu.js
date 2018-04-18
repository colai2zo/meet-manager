$(document).ready(function(){
	console.log("COOKIE: " + document.cookie);
	$.ajax({url: "/signed-in-user" , method: "GET" ,
		success: function(result){
			var welcome = $('<h2>Welcome, ' + result.username + '!</h2>');
			var container = $("#welcome-div");
			container.append(welcome);
		}
	});
});