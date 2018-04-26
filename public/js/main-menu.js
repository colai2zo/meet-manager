$.ajax({url: "/signed-in-user" , method: "GET" ,
	success: (result) => {
		var welcome = $('<h2>Welcome, ' + result.user.team_name + '!</h2>');
		var container = $("#welcome-div");
		container.append(welcome);
	}
});
$(document).ready(() => {
	$('#logout-button').click(() => {
		$.ajax({
			url: '/logout',
			method: 'POST',
			success: () =>{
				window.location = '/';
			}
		});
	});
});