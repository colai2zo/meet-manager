// $(document).ready(function(){
// 	console.log(document.cookie);
// 	$.ajax({url: "/signed-in-user" , method: "GET" ,
// 		success: function(result){
// 			result.json().then(function(data){
// 				var welcome = $('<h2>Welcome, ' + data.username + '!</h2>');
// 				var container = $("#main-menu-div");
// 				container.append(welcome);
// 			});
// 		}
// 	});
// });