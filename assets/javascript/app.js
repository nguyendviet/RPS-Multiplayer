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
var user1Ref = database.ref('users/1/');
var user2Ref = database.ref('users/2/')
var chatRef = database.ref("/chat");
var existingUsers;
var localUser = {name: '', colour: ''};

//================================================ FUNCTIONS ================================================

/*prepare game*/
function getReady() {
	/*print name box and start button*/
	$('.userInfo').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id="startButton" type="submit" class="btn btn-success">Start</button></div>');

	/*print div for user's data*/
	for (var i = 1; i < 3; i++) {
		$('.user' + i).html('<div class="userName userName' + i + '">Waiting for Player ' + i + '</div><div class="userRPS' + i + '"></div><div class="userScore' + i + '"></div>');
	}
}

//work begins

function printUserInfo(id, name, win, loss) {
	$('.userName' + id).html('<h3>' + name + '</h3>');
	$('.userRPS' + id).html('<div class="tool">Rock</div><div class="tool">Paper</div><div class="tool">Scissors</div>');
	$('.userScore' + id).html('Wins: ' + win + ' Losses: ' + loss);
}

/*create new user*/
function createNewUser() {
	var newUser = $('#newUser').val().trim();

	if (newUser) {

		if (existingUsers === 0) {
			user1Ref.set({
				name: newUser,
				win: 0,
				loss: 0
			});

			$('.userInfo').html('<p>Hi ' + newUser + '</p>');
			$('.notification').html('You are Player 1');

			user1Ref.onDisconnect().remove(); /*issue: if player 1 disconnects, then a 3rd player log-ins, 3rd player will replace existing player 2*/

			localUser.name = newUser;
			localUser.colour = 'green';
		}
		else if (existingUsers === 1) {
			user2Ref.set({
				name: newUser,
				win: 0,
				loss: 0
			});
			$('.userInfo').html('<p>Hi ' + newUser + '</p>');
			$('.notification').html('You are Player 2');
			
			user2Ref.onDisconnect().remove();

			localUser.name = newUser;
			localUser.colour = 'blue';
		}
		else if (existingUsers >= 2) {
			$('.userInfo').html('<p>Hi ' + newUser + '</p>');
			$('.notification').html('There are already 2 players!');
		}
	}
	else {
		return;
	}
}

userRef.on("value", function(snapshot) {
	existingUsers = snapshot.numChildren();
	
	for (var i = 1; i < 3; i++) {
		if (snapshot.child(i).exists()) {
			var name = snapshot.child(i).val().name;
			var win = snapshot.child(i).val().win;
			var loss = snapshot.child(i).val().loss;

			printUserInfo(i, name, win, loss);
		}
	}
  	console.log('number of users: ', existingUsers);
});

//remove player's info if disconnected
user1Ref.on('child_removed', function() {
	chatRef.remove();

	printUserInfo(1, '', '', '');
	$('.userName1').html('Waiting for Player 1');
	$('.userRPS1').html('');
	$('.userScore1').html('');
});

user2Ref.on('child_removed', function() {
	chatRef.remove();

	printUserInfo(2, '', '', '');
	$('.userName2').html('Waiting for Player 2');
	$('.userRPS2').html('');
	$('.userScore2').html('');
});

//work ends

/*send message*/
function sendMessage() {
	var text = $('#newMessage').val();
	var message = localUser.name + ': ' + text;

	if (localUser.colour === 'green') {
		chatRef.push('<span class="green">' + message + '</span>');
	}
	
	if (localUser.colour === 'blue') {
		chatRef.push('<span class="blue">' + message + '</span>');
	}

	$('#newMessage').val('');
}

chatRef.on('child_added', function(snapshot) {
	var currentMessage = snapshot.val();
	/*var str = $('.userInfo').text();
	var userName = str.split(/\s+/).pop(); //how to know which user sends message?*/
	$('.messageHolder').append('<p>' + currentMessage + '</p>');
});

chatRef.on('child_removed', function() {
	$('.messageHolder').html('');
});

//================================================ OPERATIONS ================================================

getReady();

$('#startButton').on('click', createNewUser);
$('#sendButton').on('click', sendMessage);