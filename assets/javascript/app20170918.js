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

var ref = firebase.database().ref('users');
var currentUser = 0;

//prepare game
function getReady() {
	/*print name box and start button*/
	$('.userLogIn').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id="startButton" type="submit" class="btn btn-success">Start</button></div>');

	checkCurrentUser();
}

function checkCurrentUser() {
	if (ref !== null) {
		ref.once('value').then(function(snapshot) {
			currentUser = snapshot.numChildren();
			console.log('no of user: ', currentUser);
		});
	}
}

getReady();

function writeUserData(name, win, loss) {

	if (currentUser === 0) {
		firebase.database().ref('users/' + 1).set({
			name: name,
			wins: win,
			losses: loss
		});
	}
	else if (currentUser === 1) {
		firebase.database().ref('users/' + 2).set({
			name: name,
			wins: win,
			losses: loss
		});
	}
	else if (currentUser >= 2) {
		console.log('maximum no of users');
		return;
	}
}

/*create new user*/
function createNewUser() {
	var newUser = $('#newUser').val().trim();

	if (newUser) {
		writeUserData(newUser, 0, 0);
		checkCurrentUser();

		console.log('new user name: ', newUser);
	}
	else {
		return;
	}
}

$('#startButton').on('click', function() {
	createNewUser();
});