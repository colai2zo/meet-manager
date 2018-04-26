$(document).ready( () => {
	$('#login-form').submit( (e) => {
		e.preventDefault();
		const username = $('#username').val();
		const password = $('#password').val();
		// post('/login', { username, password });
		$.ajax({
			type: "POST",
			xhrFields: {withCredentials: true},
			url: '/login',
			data: {
				username: username,
				password: password
			},
			success: (result) => {
				console.log(result);
				if(result.success == true){
					window.location.href = '/main-menu';
				}
			},
			statusCode: {
				401: () => {
					alert('Invalid login credentials. Please try again.');
					$('#login-form').each(() =>{
						this.reset();
					});
				}
			}
		});

	});
});