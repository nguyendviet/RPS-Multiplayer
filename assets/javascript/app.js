// Initialize Firebase
var config = {
	apiKey: "AIzaSyCMlkvlZbv5pElUZg99hZJm0H6CqSKVQWE",
	authDomain: "rps-multiplayer-6e91f.firebaseapp.com",
	databaseURL: "https://rps-multiplayer-6e91f.firebaseio.com",
	projectId: "rps-multiplayer-6e91f",
	storageBucket: "",
	messagingSenderId: "879810800461"
};
firebase.initializeApp(config);

function userLogIn() {
	$('.userLogIn').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id = "startButton" type="submit" class="btn btn-success">Start</button></div>');
}

userLogIn();

/*submit players*/
function writeUserData(userId, name, win, loss) {
  firebase.database().ref('users/' + userId).set({
    name: name,
    wins: win,
    losses: loss
  });
}

$('#startButton').on('click', function() {
	console.log('click');

	var newUser = $('#newUser').val().trim();

	if (newUser) {
		console.log(newUser);
		writeUserData(1, newUser, 0, 0);
	}
	else {
		return;
	}

	
});


/*users send messages*/
function sendMessage() {
	var message = $('#newMessage').val();
	firebase.database().ref('messages').push(message);

	console.log(message);
}

$('#sendButton').on('click', sendMessage);

	//print input and submit player name button

	//print 2 box for 2 players
	//print middle box
	//players are objects: contain RPS, win, lose

	//1st user enters name becomes 1st player
	//2nd user enters becomes 2nd player (firebase?)

	//users choose R/P/S, users can see what they chose, but the other can't
	//both players see whose turn it is

	//compare RPS and decides who wins point
	//reset, play another round

	//players can leave anytime, free space for someone else to join

	//chat box:
	//board shows all messages sent
	//bar type new message and send button

/*//firebase message
const messaging = firebase.messaging();

messaging.requestPermission()
.then(function() {
    console.log('have permission');
    return messaging.getToken();
})
.then(function(token) {
    console.log(token);
})
.catch(function(err) {
    console.log('Error occured');
});

messaging.getToken()
.then(function(currentToken) {
	if (currentToken) {
	  sendTokenToServer(currentToken);
	  updateUIForPushEnabled(currentToken);
	} else {
	  // Show permission request.
	  console.log('No Instance ID token available. Request permission to generate one.');
	  // Show permission UI.
	  updateUIForPushPermissionRequired();
	  setTokenSentToServer(false);
	}
})
.catch(function(err) {
	console.log('An error occurred while retrieving token. ', err);
	showToken('Error retrieving Instance ID token. ', err);
	setTokenSentToServer(false);
});*/