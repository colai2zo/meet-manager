'use strict';
const createUser = document.querySelector('#register-form');
if(createUser){
	createUser.addEventListener('submit', function(e){
		e.preventDefault();
		const username = createUser.querySelector('#username').value;
		const teamName = createUser.querySelector('#team-name').value;
		const password = createUser.querySelector('#password').value;
		const passwordConfirm = createUser.querySelector('#password-confirm').value;
		if(password === passwordConfirm){
			post('/create-user', {username, teamName, password}).then((result) =>{
				result.json().then(function(data){
			 		console.log(data);
			 		if(data.success == true){
			 			alert('You have successfully registered. Please login to begin using the meet manager.')
						window.location.href = '/login';
					}else{
						alert('Internal Server Error. Please Try Again');
					}
		 		});
			});
		}else{
			window.alert('Please try again. Your passwords must match.');
			createUser.reset();
		}
	});
}
