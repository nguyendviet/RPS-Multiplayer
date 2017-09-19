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

//================================================ FUNCTIONS ================================================

/*prepare game*/
function getReady() {
	/*print name box and start button*/
	$('.userInfo').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id="startButton" type="submit" class="btn btn-success">Start</button></div>');
}

//work begins

function printUserInfo(id, name, win, loss) {
	$('.playerName' + id).html('<h3>' + name + '</h3>');
	$('.playerRPS' + id).html('<div class="tool">Rock</div><div class="tool">Paper</div><div class="tool">Scissors</div>');
	$('.playerScore' + id).html('Wins: ' + win + ' Losses: ' + loss);
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
	
	if (snapshot.child('1').exists()) {
		var name = snapshot.child('1').val().name;
		var win = snapshot.child('1').val().win;
		var loss = snapshot.child('1').val().loss;

		printUserInfo(1, name, win, loss);
	}

	if (snapshot.child('2').exists()) {
		var name = snapshot.child('2').val().name;
		var win = snapshot.child('2').val().win;
		var loss = snapshot.child('2').val().loss;

		printUserInfo(2, name, win, loss);
	}

  	console.log('number of users: ', existingUsers);
});

//remove player's info if disconnected
user1Ref.on('child_removed', function() {
	chatRef.remove();

	printUserInfo(1, '', '', '');
	$('.playerName1').html('Waiting for Player 1');
	$('.playerRPS1').html('');
	$('.playerScore1').html('');
});

user2Ref.on('child_removed', function() {
	chatRef.remove();

	printUserInfo(2, '', '', '');
	$('.playerName2').html('Waiting for Player 2');
	$('.playerRPS2').html('');
	$('.playerScore2').html('');
});

//work ends

/*send message*/
function sendMessage() {
	var message = $('#newMessage').val();
	chatRef.push(message);
}

chatRef.on('child_added', function(snapshot) {
	var currentMessage = snapshot.val();
	var str = $('.userInfo').text();
	var userName = str.split(/\s+/).pop(); //how to know which user sends message?
	$('.messageHolder').append('<p>' + userName + ': ' + currentMessage + '</p>');
});

chatRef.on('child_removed', function() {
	$('.messageHolder').html('');
});

//================================================ OPERATIONS ================================================

getReady();

$('#startButton').on('click', createNewUser);
$('#sendButton').on('click', sendMessage);