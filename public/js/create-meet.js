'use strict';
const createMeet = document.querySelector("#create-meet-form");
const eventTable = document.querySelector("#event-table");
createMeet.addEventListener('submit', function(e){
	e.preventDefault();
	if(duplicateEvents()){
		window.alert('You have duplicate events. Please Remove duplicates or change them so that all events are unique.')
	}else{
		const meetName = document.querySelector('#meet-name').value;
		const meetDate = document.querySelector('#meet-date').value;
		const meetLocation = document.querySelector('#meet-location').value;
		const meetType = document.querySelector('#meet-type').value;
		const meetEvents = [];
		for(let i = 1 ; i < eventTable.rows.length ; i++){
			console.log(getEventAtRow(i));
			meetEvents.push(getEventAtRow(i));
		}
		console.log(meetEvents);
		$.ajax({
			type: "POST",
			xhrFields: {withCredentials: true},
			url: '/create-meet',
			data: { name : meetName,
					date : meetDate,
					location : meetLocation,
					type : meetType,
					events : JSON.stringify(meetEvents)},
			success: () => {
				alert('Meet Created Successfully. Please check the meets page to score your meet.');
				window.location = "/main-menu";
			},
			error: () => {
				alert("There was an error in creating this meet.");
				createMeet.clear();
			}
		});	
	}
});

const addEventButton = document.querySelector("#add-event-button");
addEventButton.addEventListener('click', function(){
	console.log('adding');
	addEventRow();
});

const subtractEventButton = document.querySelector("#subtract-event-button");
subtractEventButton.addEventListener('click', function(){
	console.log('subtracting');
	deleteEventRow();
});
	

function addEventRow(){
	if(eventTable.rows.length < 27){
		document.querySelector("#submit-new-meet").disabled = false;
		const eventTable = document.querySelector("#event-table");
		const row = document.createElement('tr');
		//Add Event and Gender Selectors to New Row
		const eventEntry = document.createElement('td');
		eventEntry.className = "td-unpadded";
		const eventSelector = document.createElement('select');
		const genderEntry = document.createElement('td');
		genderEntry.className = "td-unpadded"
		const genderSelector = document.createElement('select');
		const meetType = document.querySelector('#meet-type').value.substring(0,5);
		addChoicesTo(eventSelector,['55m','60m','100m','200m','300m','400m','500m','600m','800m','1000m','1500m','1600m','3000m']);
		addChoicesTo(genderSelector,['Male','Female']);
		genderEntry.appendChild(genderSelector);
		eventEntry.appendChild(eventSelector);
		row.appendChild(eventEntry);
		row.appendChild(genderEntry);
		eventTable.appendChild(row);
	}
}
function deleteEventRow(){
	var rows = eventTable.rows;
	console.log(rows.length);
	if(rows.length > 2){
		rows[rows.length-1].remove();
	}
}
function addChoicesTo(selector,choices){
	for(let i = 0 ; i < choices.length ; i++){
		const option = document.createElement('option');
		option.value = option.innerHTML = choices[i];
		selector.appendChild(option);
	}
}
function duplicateEvents(){
	var rows = eventTable.rows;
	for(let i = 1 ; i < rows.length ; i++){
		console.log(rows[i].childNodes);
		var event1 = rows[i].childNodes[0].childNodes[0].selectedIndex;
		var gender1 = rows[i].childNodes[1].childNodes[0].selectedIndex;
		for(let j = i + 1; j < rows.length ; j++){
			var event2 = rows[j].childNodes[0].childNodes[0].selectedIndex;
			var gender2 = rows[j].childNodes[1].childNodes[0].selectedIndex;
			console.log(event1 + " : " + event2 +" : " + gender1 + " : " + gender2);
			if(event1 === event2 && gender1 === gender2){
				return true;
			}
		}
	}
	return false;
}
function getEventAtRow(i){
	var row = eventTable.rows[i];
	return {event : row.childNodes[0].childNodes[0].value ,
			gender : row.childNodes[1].childNodes[0].value };
}
addEventRow();