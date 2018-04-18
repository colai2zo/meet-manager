$(document).ready( function(){
	$('#login-form').submit( function(e){
		e.preventDefault();
		const username = $('#username').val();
		const password = $('#password').val();
		post('/login', { username, password }).then((result) => {
			result.json().then(function(data){
				if (data.success == true){
					const token = data.token;
					document.cookie="username=" + username + ";path=/";
					document.cookie="token=" + token + ";path=/";
					window.location.href = '/html/main-menu.html';
				} else{
					alert('Login failed. Please try again.');
				} 
			});
	    });
	});
});