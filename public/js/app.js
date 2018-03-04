var createUser = document.getElementById('register-form');
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
})

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

