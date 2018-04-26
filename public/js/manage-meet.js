$(document).ready( () => {
	$('#accept-entries-toggle').bootstrapToggle({
		on: 'Accepting Entries',
		off: 'Not Accepting Entries'
	});
	const acceptingEntries;
	$.ajax({url: "/is-accepting-entries?meetId=" + get('meetId') , method: "GET",
		success: (result) => {
			acceptingEntries = result.accepting_entries;
			acceptEntries(acceptEntries);
		}
	});

	$.ajax({url: "/get-all-events-for-meet?meetId=" + get("meetId") , method: "GET" ,
		
		success: (result) => {
			const table = $('#events-table');
			const events = JSON.parse(result.toString());
			for(let i = 0 ; i < events.length ; i++){
				const row = $("<tr>"+ 
				"<td>" + events[i].event_name + "</td>"+
				"<td>" + events[i].event_gender + "td>"+
				"</tr>");
				var status;
				var button;
				if(acceptingEntries === true){
					status = $("<td>Accepting Entries</td>");
					button = $("<button class='btn btn-primary'>View Entries</button>");
					button.click(() => {
						/** POSSIBLY OPEN MODAL HERE **/
						window.location = "/get-results?eventId=" + events[i].event_id;
					});
				}else if(events[i].scored === true){
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
				row.append(status);
				row.append(button);
				table.append(row);
			}
		}

	});
});



function get(name){
	if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
		return decodeURIComponent(name[1]);
}