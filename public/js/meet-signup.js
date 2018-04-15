$(document).ready(function(){
	$.ajax({url: "/get-all-events-for-meet?meetId=" + get("meetId") , method: "GET" ,
		
		success: (result) => {
			var meetDiv = $('#events-div');
			console.log(result);
			var events = JSON.parse(result.toString());
			for(i = 0 ; i < events.length ; i++){
				let header = $("<div class='card-header'>" + events[i].event_name + " (" +  events[i].event_gender + ")</div>");
				let button = $("<a class='btn' style='border-color: black'>+</a>");
				let card = $("<div class='card'></div>");
				let body = $("<div class='card-body'></div>");
				let table = $("<table id='" + events[i].event_id + "'><tr><th>Name</th><th>Grade</th><th colspan='3'>Seed Time</th></tr></table>");
				button.click(() => {
					const row = $("<tr>"+ 
					"<td><input type='text' id='runner_name'/></td>"+
					"<td><input type='text' id='runner_grade'/></td>"+
					"<td><input type='number' max='30' min='0' id='seed_minutes' placeholder='mm'/>:</td>"+
					"<td><input type='number' max='59' min='0' id='seed_seconds' placeholder='ss'/>.</td>"+
					"<td><input type='number' max='999' min='0' id='seed_seconds' placeholder='millis'/></td>"+
					"</tr>");
					table.append(row);
				});
				header.append(button);
				body.append(table);
				card.append(header);
				card.append(body);
				meetDiv.append(card);
			}
		}

	});
	function get(name){
		if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
	      return decodeURIComponent(name[1]);
	}
	$('signup-form').submit((e) => {
		e.preventDefault();
		var events = $('.table');
		for(i = 0 ; i < events.length ; i++){

		}
	});
});	
