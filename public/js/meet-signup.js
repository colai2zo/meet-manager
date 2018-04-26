'use strict';
$(document).ready(function(){
	$.ajax({url: "/get-all-events-for-meet?meetId=" + get("meetId") , method: "GET" ,
		
		success: (result) => {
			var meetDiv = $('#events-div');
			var events = JSON.parse(result.toString());
			for(let i = 0 ; i < events.length ; i++){
				let header = $("<div class='card-header'>" + events[i].event_name + " (" +  events[i].event_gender + ")</div>");
				let button = $("<a class='btn' style='border-color: black'>+</a>");
				let card = $("<div class='card'></div>");
				let body = $("<div class='card-body'></div>");
				let table = $("<table id='" + events[i].event_id + "'><tr><th>Name</th><th>Grade</th><th colspan='3'>Seed Time</th></tr></table>");
				button.click(() => {
					const row = $("<tr>"+ 
					"<td><input type='text' class='runner_name'/></td>"+
					"<td><input type='text' class='runner_grade'/></td>"+
					"<td><input type='number' max='30' min='0' class='seed_minutes' placeholder='mm'/>:</td>"+
					"<td><input type='number' max='59' min='0' class='seed_seconds' placeholder='ss'/>.</td>"+
					"<td><input type='number' max='999' min='0' class='seed_millis' placeholder='millis'/></td>"+
					"<td><input type='hidden' class='event_id' value='" + events[i].event_id + "'/></td>"+
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
	$('#submit-entries').click((e) => {
		e.preventDefault();
		var entryArray = [];
		var events = $('.event_id')
		var names = $('.runner_name');
		var grades = $('.runner_grade');
		var mins = $('.seed_minutes');
		var secs = $('.seed_seconds');
		var millis = $('.seed_millis');
		for(let i = 0 ; i < names.length ; i++){
			let event_id = events[i].value;
			let name = names[i].value;
			let grade = grades[i].value;
			let seed_mins = mins[i].value;
			let seed_secs = secs[i].value;
			let seed_millis = millis[i].value;
			let entry_json = {
				event_id : event_id,
				name : name,
				grade : grade,
				seed_mins : seed_mins,
				seed_secs : seed_secs,
				seed_millis : seed_millis
			}
			entryArray.push((entry_json));
		}
		let data = {
				meet_id: get('meetId'),
				entries: JSON.stringify(entryArray)
			}
		console.log(data);
		$.ajax({
			type: "POST",
			xhrFields: {withCredentials: true},
			url: '/register-runners',
			data: data,
			success: () => {
				alert('You have successfully registered for the meet');
				window.location = '/main-menu';
			},
			error: () => {
				alert('There was an error registering for the meet');
				window.location = '/display-meets';
			}
		});
	});
});	
