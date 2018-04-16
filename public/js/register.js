'use strict';
const createUser = document.querySelector('#register-form');
if(createUser){
	createUser.addEventListener('submit', function(e){
		e.preventDefault();
		const username = createUser.querySelector('#username').value;
		const password = createUser.querySelector('#password').value;
		const passwordConfirm = createUser.querySelector('#password-confirm').value;
		if(password === passwordConfirm){
			post('/createUser', {username, password}).then((result) =>{
				result.json().then(function(data){
			 		console.log(data);
			 		if(data.success == true){
						const token = data.token;
						document.cookie="username=" + username + ";token=" + token + ";path=/";
						console.log(document.cookie);
						window.location.href = '/html/main-menu.html';
					}else{
						alert('Internal Server Error. Please Try Again');
					}	
			 	});
			});
		}else{
			window.alert('Please try again. Your passwords must match.');
			createUser.clear();
		}
	});
}
