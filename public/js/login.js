'use strict';
const loginUser = document.querySelector('#login-form');
if(loginUser){
	loginUser.addEventListener('submit', function(){
		const username = loginUser.querySelector('#username').value;
		const password = loginUser.querySelector('#password').value;
		post('/login', { username, password }).then((result) => {
			result.json().then(function(data){
				console.log(data)
				if (data.success == true){
					const token = data.token;
					document.cookie="username=" + username + ";token=" + token + ";path=/";
					window.location.href = '/html/main-menu.html';
				} else{
					alert('Login failed. Please try again.');
				} 
			});
	    });
	});
}