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

const loginUser = document.querySelector('#login-form');
if(loginUser){
	loginUser.addEventListener('submit', function(){
		const username = loginUser.querySelector('#username').value;
		const password = loginUser.querySelector('#password').value;
		post('/login', { username, password }).then(({ status }) => {
			if (status === 200){
				alert('login success');
			} else{
				alert('login failed');
			} 
	    });
	});
}

function post (path, data) {
  return window.fetch(path, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
}

