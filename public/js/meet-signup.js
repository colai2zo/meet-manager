$(document).ready(function(){
	$.ajax({url: "/get-all-meets" , method: "GET" ,
		
		success: function(result){
			var meetDiv = $('#meets-div');
			var meets = JSON.parse(result.toString());
			console.log(meets.length);
			for(i = 0 ; i < meets.length ; i++){
				var header = $("<div class='card-header'>" + meets[i].meet_name + "</div>");
				var body = $("<div class='card'><p>Date: " + meets[i].meet_date + "</p><p>Location: " + meets[i].meet_location + "</p></div>");
				var card = $("<div class='card'></div>");
				var button = $("<a class='btn btn-primary' href='/signup?meetId=" + meets[i].meet_id + "'>Sign Up</a>");
				body.append(button);
				card.append(header);
				card.append(body);
				meetDiv.append(card);
			}
		}

	});

});