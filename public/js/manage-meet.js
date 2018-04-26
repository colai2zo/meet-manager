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
						/** POSSIBLY OPEN MODAL HERE **/
						window.location = "/get-results?eventId=" + events[i].event_id;
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
							/** POSSIBLY OPEN MODAL HERE **/
							window.location = "/enter-results?eventId=" + events[i].event_id;
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

function get(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
		return decodeURIComponent(name[1]);
}