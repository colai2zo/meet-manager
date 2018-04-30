var acceptingEntries;
$(document).ready( () => {
	$('#accept-entries-toggle').bootstrapToggle({
		on: 'Accepting Entries',
		off: 'Not Accepting Entries'
	});

	$.ajax({url: "/is-accepting-entries?meetId=" + get('meetId') , method: "GET",
		success: (result) => {
			acceptingEntries = ((JSON.parse(result)[0].accepting_entries === 1) ? true : false);
			$('#accept-entries-toggle').change(() => toggleAcceptingEntries($('#accept-entries-toggle').prop('checked')));
			$('#accept-entries-toggle').bootstrapToggle(acceptingEntries ? 'on' : 'off');
		}
	});

	$.ajax({
		url: "/meet-info?meetId=" + get('meetId') , 
		method: 'GET',
		success: (result) => {
			result = JSON.parse(result);
			$('#meet-title-header').html(result[0].meet_name);
			$('#meet-location-header').html("Location: " + result[0].meet_location);
			$('#meet-date-header').html("Date: " + result[0].meet_date);
		}
	});

	$('#view-entries-modal').on('hidden.bs.modal', (e) => {
		console.log("removed");
		$('#view-entries-modal tbody').remove();
		$('#view-entries-modal-header').empty();
	});

	$('#heat-sheet-modal').on('hidden.bs.modal', (e) => {
		$('.event-result-div').remove();
		$('#heat-sheet-modal-header').empty();
	});

	$('#score-event-modal').on('hidden.bs.modal', (e) => {
		$('#score-event-modal tbody').remove();
		$('#score-event-modal-header').empty();
		$('event-being-scored').val('');
	});

	$('#heat-sheet-button').click(() => {
		const modal = $('#heat-sheet-modal');
		$.ajax({
			url: "/meet-results?meetId=" + get("meetId"),
			method: "GET",
			success: (result) => {
				$('#heat-sheet-modal-header').html("Heat Sheet for " + $('#meet-title-header').html());
				const modalBody = $('#heat-sheet-modal-body');
				if(result.success === true){
					const meetResults = result.meetResults;
					for(let i = 0 ; i < meetResults.length ; i++){
						let eventInfo = meetResults[i].event;
						let eventResults = meetResults[i].results;
						const eventDiv = $('<div></div>').addClass('event-result-div');
						const eventHeader = $('<h5></h5>').html(eventInfo.eventName + " " + eventInfo.eventGender + " (" + eventInfo.numberOfParticipants + " runners)");
						const eventTable = $('<table></table>').append($('<thead></thead>').append($('<tr></tr>').append($('<th>Name</th><th>Grade</th><th>Team</th><th>Seed Time</th>'))));
						const tableBody = $('<tbody></tbody>')
						for(let j = 0 ; j < eventResults.length ; j++){
							let row = $('<tr><td>' + eventResults[j].runner_name + '</td><td>' + eventResults[j].runner_grade + '</td><td>' + eventResults[j].team_name + '</td><td>' + formatTime(eventResults[j].seed_mins, eventResults[j].seed_secs, eventResults[j].seed_millis) + '</td></tr>');
							tableBody.append(row);
						}	
						eventTable.append(tableBody);
						eventDiv.append(eventHeader);
						eventDiv.append(eventTable);
						modalBody.append(eventDiv);
					}
				}
				modal.modal();
			}
		});
	});

	$('#submit-results-button').click(() => {
		console.log('click');
		let rows = $('#score-event-modal-body tbody tr');
		let resultIds = $('.result_id');
		let result_mins = $('.result_mins');
		let result_secs = $('.result_secs');
		let result_millis = $('.result_millis');
		let team_name = $('.team_name');
		let results = [];
		for(let i = 0 ; i < rows.length ; i++){
			let resultJSON = {
				resultId : resultIds[i].value,
				team_name: team_name[i].innerHTML,
				result_mins : result_mins[i].value || 0,
				result_secs : result_secs[i].value || 0,
				result_millis : result_millis[i].value || 0,
			}
			console.log(JSON.stringify(resultJSON));
			results.push(resultJSON);
		}
		$.ajax({
			url: "/score-event",
			method: "POST",
			data: {
				eventId: $('#event-being-scored').val(),
				results: results
			}
			statusCode: {
				200: () => {
					alert('You have successfully scored this event.');
					$('#score-event-modal').modal('hide');
					window.location.reload(true);
				},
				500: () => {
					alert('Something went wrong trying to score this event. Check to make sure all inputs are filled with numbers only, and try again.');
					$('#score-event-modal').modal('hide');
					window.location.reload(true);
				}
			}
		});
	});
});

function populateTable(){
	$.ajax({url: "/get-all-events-for-meet?meetId=" + get("meetId") , method: "GET" ,
		success: (result) => {
			const table = $('#events-table');
			let oneScored = false;
			table.empty();
			const events = JSON.parse(result.toString());
			for(let i = 0 ; i < events.length ; i++){
				const row = $("<tr>"+ 
				"<td>" + events[i].event_name + "</td>"+
				"<td>" + events[i].event_gender + "</td>"+
				"</tr>");
				var status;
				var button;
				if(acceptingEntries === true){
					$("#heat-sheet-button").prop('disabled',true);
					$("#results-button").prop('disabled',true);
					status = $("<td>Accepting Entries</td>");
					button = $("<button class='btn btn-primary'>View Entries</button>");
					button.click(() => {
						openEntriesModal(events[i].event_id);
						$('#view-entries-modal').modal();
					});
				}else{
					$("#heat-sheet-button").prop('disabled',false);
					if(events[i].scored === true){
						oneScored = true;
						status = $("<td>Scored</td>");
						button = $("<button class='btn btn-primary'>Review Results</button>");
						button.click(() => {
							/** POSSIBLY OPEN MODAL HERE **/
							window.location = "/get-results?eventId=" + events[i].event_id;
						});
					}else{
						status = $("<td>Not Yet Scored</td>");
						button = $("<button class='btn btn-primary'>Score Event Now</button>");
						button.click(() => {
							openScoringModal(events[i].event_id);
							$('#score-event-modal').modal();
						});
					}
					$("#results-button").prop("disabled", !oneScored);
				}
				row.append(status);
				row.append(button);
				table.append(row);
			}
		}
	});
}

function formatTime(mins,secs,millis){
	if(mins < 10)
		mins = "0" + mins;
	if(secs < 10)
		secs = "0" + secs;
	if(millis < 100)
		millis = "00" + millis;
	else if(millis < 10)
		millis = "0" + millis;
	return mins + ":" + secs + "." + millis;
}

function openEntriesModal(eventId){
	console.log("Opening Modal")
	getResults(eventId, (err, data) => {
		if(err) alert(err);
		else{
			console.log(data);
			let eventInfo = data.info.event;
			let entries = data.info.results;
			let modal = $('#view-entries-modal');
			$('#view-entries-modal-header').html(eventInfo.eventName + " " + eventInfo.eventGender + " (" + eventInfo.numberOfParticipants + " runners signed up)");
			let tableBody = $('<tbody></tbody>');
			for(let i = 0 ; i < entries.length ; i++){
				let row = $('<tr><td>' + entries[i].runner_name + '</td><td>' + entries[i].runner_grade + '</td><td>' + entries[i].team_name + '</td><td>' + formatTime(entries[i].seed_mins, entries[i].seed_secs, entries[i].seed_millis) + '</td></tr>')
				tableBody.append(row);
			}
			$('#view-entries-modal table:first-of-type').append(tableBody);
			return entries;
		}
	});
}

function openScoringModal(eventId){
	getResults(eventId, (err, data) => {
		if(err) alert(err);
		else{
			let eventInfo = data.info.event;
			let entries = data.info.results;
			let modal = $('#score-event-modal');
			$('#event-being-scored').val(eventInfo.eventId);
			$('#score-event-modal-header').html("Enter Scores For " + eventInfo.eventName + " " + eventInfo.eventGender);
			let tableBody = $('<tbody></tbody>');
			for(let i = 0 ; i < entries.length ; i++) {
				let row = $("<tr><td>" + entries[i].runner_name + "</td><td>" + entries[i].runner_grade + "</td><td class='team_name'>" + entries[i].team_name + "</td><td>" + formatTime(entries[i].seed_mins, entries[i].seed_secs, entries[i].seed_millis) + "</td></tr>");
				let minsInput = $("<input type='number' max='30' min='0' class='result_mins' placeholder='mm'/>");
				let secsInput = $("<input type='number' max='59' min='0' class='result_secs' placeholder='ss'/>");
				let millisInput = $("<input type='number' max='999' min='0' class='result_millis' placeholder='millis'/>");
				let resultIdInput = $("<input type='hidden' class='result_id' value='" + entries[i].result_id + "'/>");
				row.append($('<td></td>').addClass('td-unpadded').append(minsInput)).append($('<td></td>').addClass('td-unpadded').append(secsInput)).append($('<td></td>').addClass('td-unpadded').append(millisInput)).append($('<td></td>').addClass('td-unpadded').append(resultIdInput));
				tableBody.append(row);
			}
			$('#score-event-modal table:first-of-type').append(tableBody);
		}
	});	
}

function toggleAcceptingEntries(accepting){
	acceptingEntries = accepting;
	console.log(accepting);
	$.ajax({
		url: "/toggle-accepting-entries", 
		method: "POST",
		data: {
			meetId: get('meetId'),
			acceptingEntries: accepting
		},
		success: () => {
			console.log('SUCCESS');
			populateTable();
		}
	});
}

function getResults(eventId,callback){
	$.ajax({
		url: '/event-results?eventId=' + eventId,
		method: 'GET',
		success: (result) => {
			callback(null, (result));
		},
		error: (xhr, ajaxOptions, thrownError) => {
			callback(thrownError);
		}
	});
}

function get(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
		return decodeURIComponent(name[1]);
}