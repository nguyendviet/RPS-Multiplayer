/*Initialize Firebase*/
var config = {
	apiKey: "AIzaSyCMlkvlZbv5pElUZg99hZJm0H6CqSKVQWE",
	authDomain: "rps-multiplayer-6e91f.firebaseapp.com",
	databaseURL: "https://rps-multiplayer-6e91f.firebaseio.com",
	projectId: "rps-multiplayer-6e91f",
	storageBucket: "",
	messagingSenderId: "879810800461"
};
firebase.initializeApp(config);

//prepare game
function getReady() {
	/*print name box and start button*/
	$('.userLogIn').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id="startButton" type="submit" class="btn btn-success">Start</button></div>');
}

getReady();

var user = firebase.auth().currentUser;
var name;

if (user != null) {
	name = user.displayName;
}

if (user) {
console.log('user signed in');
} else {
console.log('no user');
}

/*create new user*/
function createNewUser() {
	var newUser = $('#newUser').val().trim();

	if (newUser) {
		var ref = firebase.database().ref.onAuth(function(authData) {
			if (authData && isNewUser) {
				ref.child('users').child(authData.uid)
				.set({
					name: getName(authData)
				});
			}
		});

		console.log('user name enetered: ', newUser);
	}
	else {
		return;
	}
}

$('#startButton').on('click', function() {
	createNewUser();
});