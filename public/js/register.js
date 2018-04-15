const createUser = document.querySelector('#register-form');
if(createUser){
	createUser.addEventListener('submit', function(){
		const username = createUser.querySelector('#username').value;
		const password = createUser.querySelector('#password').value;
		const passwordConfirm = createUser.querySelector('#password-confirm').value;
		if(password === passwordConfirm){
			post('/createUser', {username, password});
		}else{
			window.alert('Please try again. Your passwords must match.');
			createUser.clear();
		}
	});
}