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
var user1ChoiceRef = database.ref('users/1/choice/');
var user2Ref = database.ref('users/2/');
var user2ChoiceRef = database.ref('users/2/choice/');
var turnRef = database.ref('turn/');
var chatRef = database.ref("/chat");

var existingUsers, currentUser;
var user1Choice = ''; 
var user2Choice = '';
var localUser = {id: [], name: ''};

//================================================ FUNCTIONS ================================================

/*prepare game*/
function getReady() {
	/*print name box and start button*/
	$('.userInfo').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id="startButton" type="submit" class="btn btn-success">Start</button></div>');
}

/*insert photos for RPS*/
function setRPS(id) {
	var rockPNG = '<img title="Rock" src="assets/images/rock.png"/>';
	var paperPNG = '<img title="Paper" src="assets/images/paper.png"/>';
	var scissorsPNG = '<img title="Scissors" src="assets/images/scissors.png"/>';

	$('.rock' + id).html(rockPNG);
	$('.paper' + id).html(paperPNG);
	$('.scissors' + id).html(scissorsPNG);
}

//CONSTRUCTION BEGINS<===========================================================================

/*create new user*/
function createNewUser() {
	var newUser = $('#newUser').val().trim();

	if (newUser) {
		if ((existingUsers === 0) || ((existingUsers === 1) && (currentUser.hasOwnProperty('2')))) {
			user1Ref.set({
				name: newUser,
				win: 0,
				loss: 0
			});

			$('.userInfo').html('<p>Hi ' + newUser + '</p>');
			$('.notification').html('You are Player 1');

			user1Ref.onDisconnect().remove();

			localUser.id = 1;
			localUser.name = newUser;

			setRPS(1);
		}
		else if ((existingUsers === 1) && (currentUser.hasOwnProperty('1'))) {
			user2Ref.set({
				name: newUser,
				win: 0,
				loss: 0
			});
			$('.userInfo').html('<p>Hi ' + newUser + '</p>');
			$('.notification').html('You are Player 2');
			
			user2Ref.onDisconnect().remove();

			localUser.id = 2;
			localUser.name = newUser;

			setRPS(2);
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

	/*start 1st turn when 2 users in*/
	if (snapshot.numChildren() == 2) {
		turnRef.set(1);
	}

	/*check no of existing users*/
	existingUsers = snapshot.numChildren();

	/*check current user id on firebase*/
	currentUser = snapshot.val();
});

/*remove player's info if disconnected*/
userRef.on('child_removed', function(snapshot) {
	chatRef.remove();
	turnRef.remove();
});

//change user box colour when turn changes
turnRef.on('value', function(snapshot) {
	var turn = snapshot.val();

	if (turn == 1) {
		$('.user1').css('border', '3px solid red');
	}
});

/*print user 1 info when joined*/
user1Ref.on('value', function(snapshot) {
	var name = snapshot.child('name').val();
	var win = snapshot.child('win').val();
	var loss = snapshot.child('loss').val();

	if (name !== null) {
		$('.userName1').html('<h3>' + snapshot.child('name').val() + '</h3>');
		$('.userScore1').html('Wins: ' + win + ' Losses: ' + loss);
	}
});

/*print user 2 info when joined*/
user2Ref.on('value', function(snapshot) {
	var name = snapshot.child('name').val();
	var win = snapshot.child('win').val();
	var loss = snapshot.child('loss').val();

	if (name !== null) {
		$('.userName2').html('<h3>' + snapshot.child('name').val() + '</h3>');
		$('.userScore2').html('Wins: ' + win + ' Losses: ' + loss);
	}
});

/*clear user 1 info when left*/
user1Ref.on('child_removed', function(snapshot) {
	$('.userName1').html('Waiting for Player 1');
	$('.userScore1').html('');
});

/*clear user 2 info when left*/
user2Ref.on('child_removed', function(snapshot) {
	$('.userName2').html('Waiting for Player 2');
	$('.userScore2').html('');
});

function chosenTool() {
	var chosenTool = $(this).data().tool;

	if (localUser.id == 1) {
		database.ref('users/1/choice').set(chosenTool);
		$('.userRPS1').html('<h2>' + chosenTool + '</h2>');
	}

	if (localUser.id == 2) {
		database.ref('users/2/choice').set(chosenTool);
		$('.userRPS2').html('<h2>' + chosenTool + '</h2>');
	}
}

/*get choice from user 1*/
user1ChoiceRef.on('value', function(snapshot) {
	user1Choice = snapshot.val();
	console.log('player 1 chose: ', user1Choice);
	compareChoice();
});

/*get choice from user 2*/
user2ChoiceRef.on('value', function(snapshot) {
	user2Choice = snapshot.val();
	console.log('player 2 chose: ', user2Choice);
	compareChoice();
});

function compareChoice() {

	if ((user1Choice !== null) && (user2Choice !== null)) {
		if (user1Choice === user2Choice) {
			$('.gameInfo').html('It\'s a tie!');
			
			clearChoice();
		}
		else if (((user1Choice === 'Rock') && (user2Choice === 'Scissors')) || ((user1Choice === 'Paper') && (user2Choice === 'Rock')) || ((user1Choice === 'Scissors') && (user2Choice === 'Paper'))) {
			$('.gameInfo').html('Player 1 wins!');

			clearChoice();
		}
		else if (((user2Choice === 'Rock') && (user1Choice === 'Scissors')) || ((user2Choice === 'Paper') && (user1Choice === 'Rock')) || ((user2Choice === 'Scissors') && (user1Choice === 'Paper'))) {
			$('.gameInfo').html('Player 2 wins!');

			clearChoice();
		}
	}
}

function clearChoice() {
	user1ChoiceRef.remove();
	user2ChoiceRef.remove();
	user1Choice = '';
	user2Choice = '';
}

//turn++ after each round

//CONSTRUCTION ENDS<===========================================================================

/*send message*/
function sendMessage() {
	var text = $('#newMessage').val();
	var message = localUser.name + ': ' + text;

	if (localUser.id === 1) {
		chatRef.push('<span class="green">' + message + '</span>');
	}
	
	if (localUser.id === 2) {
		chatRef.push('<span class="blue">' + message + '</span>');
	}

	$('#newMessage').val('');
}

/*print message from firebase*/
chatRef.on('child_added', function(snapshot) {
	var currentMessage = snapshot.val();
	
	$('.messageHolder').append('<p>' + currentMessage + '</p>');
});

/*clear chat on firebase if disconnected*/
chatRef.on('child_removed', function() {
	$('.messageHolder').html('');
});

//================================================ OPERATIONS ================================================

$('.tool').on('click', chosenTool);
getReady();
$('#startButton').on('click', createNewUser);
$('#sendButton').on('click', sendMessage);