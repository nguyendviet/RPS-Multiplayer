/*Initialize Firebase*/
var config = {
	apiKey: "AIzaSyCMlkvlZbv5pElUZg99hZJm0H6CqSKVQWE",
	authDomain: "rps-multiplayer-6e91f.firebaseapp.com",
	databaseURL: "https://rps-multiplayer-6e91f.firebaseio.com",
	projectId: "rps-multiplayer-6e91f",
	storageBucket: "rps-multiplayer-6e91f.appspot.com",
	messagingSenderId: "879810800461"
};
firebase.initializeApp(config);

//================================================ GLOBAL VARS ================================================

var database = firebase.database();
var userRef = database.ref("/users");
var chatRef = database.ref("/chat");
var currentUsers;

//================================================ FUNCTIONS ================================================

/*prepare game*/
function getReady() {
	/*print name box and start button*/
	$('.userInfo').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id="startButton" type="submit" class="btn btn-success">Start</button></div>');
}

//work begins

userRef.on("value", function(snapshot) {
	currentUsers = snapshot.numChildren();
	
  	console.log('number of users: ', currentUsers);
});

/*create new user*/
function createNewUser() {
	var newUser = $('#newUser').val().trim();

	if (newUser) {
		var con = userRef.push({
			name: newUser,
			win: 0,
			loss: 0
		});
		con.onDisconnect().remove();

		$('.userInfo').html('<p>Hi ' + newUser + '</p>');
		$('.notification').html('You are Player ' + currentUsers);

		console.log('new user key: ', con.key);
	}
	else {
		return;
	}
}

//work ends

/*send message*/
function sendMessage() {
	var message = $('#newMessage').val();
	chatRef.push(message);
}

chatRef.on('child_added', function(snapshot) {
	var currentMessage = snapshot.val();
	$('.messageHolder').append('<p>' + currentMessage + '</p>');
});

//================================================ OPERATIONS ================================================

getReady();

$('#startButton').on('click', createNewUser);
$('#sendButton').on('click', sendMessage);