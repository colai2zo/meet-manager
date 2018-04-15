const loginUser = document.querySelector('#login-form');
if(loginUser){
	loginUser.addEventListener('submit', function(){
		const username = loginUser.querySelector('#username').value;
		const password = loginUser.querySelector('#password').value;
		post('/login', { username, password }).then(({ status }) => {
			if (status === 200){
				window.location = "/html/main-menu.html"
			} else{
				alert('login failed');
			} 
	    });
	});
}