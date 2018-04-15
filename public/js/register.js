const createUser = document.querySelector('#register-form');
if(createUser){
	createUser.addEventListener('submit', function(){
		const username = createUser.querySelector('#username').value;
		const password = createUser.querySelector('#password').value;
		const passwordConfirm = createUser.querySelector('#password-confirm').value;
		if(password === passwordConfirm){
			post('/createUser', {username, password}).then((result) =>{
				console.log(result);
				if(result.success == true){
					// const token = result.token;
					// window.location = "/html/main-menu.html";
				}else{
					// alert('Internal Server Error. Please Try Again');
				}	
			});
		}else{
			window.alert('Please try again. Your passwords must match.');
			createUser.clear();
		}
	});
}