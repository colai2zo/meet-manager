'use strict';
$(document).ready(function(){
	$.ajax({url: "/get-my-meets" , method: "GET" ,
		success: function(result){
			var meetDiv = $('#meets-div');
			var meets = JSON.parse(result.toString());
			for(let i = 0 ; i < meets.length ; i++){
				let header = $("<div class='card-header'><h4 class='card-title'>" + meets[i].meet_name + "</h4></div>");
				let body = $("<div class='card-body'><p>Date: " + meets[i].meet_date + "</p><p>Location: " + meets[i].meet_location + "</p></div>");
				let card = $("<div class='card text-center'></div>");
				let container = $("<div class='col-md-4 col-sm-2'</div>");
				var button = $("<a class='btn btn-primary' href='/manage-meet?meetId=" + meets[i].meet_id + "'>Manage</a>");
				body.append(button);
				card.append(header);
				card.append(body);
				container.append(card);
				meetDiv.append(container);
			}
		}
	});	
});
