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
var user1WinName = '';
var user2WinName = '';
var localUser = {id: [], name: ''};
var user1Win = 0;
var user1Loss = 0;
var user2Win = 0;
var user2Loss = 0;

var turn = 1;
//================================================ FUNCTIONS ================================================

/*prepare game*/
function getReady() {
	/*print name box and start button*/
	$('.userInfo').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id="startButton" type="submit" class="btn btn-success">Start</button></div>');
}

/*insert photos for RPS*/
function setRPS() {
	var rockPNG = '<img title="Rock" src="assets/images/rock.png"/>';
	var paperPNG = '<img title="Paper" src="assets/images/paper.png"/>';
	var scissorsPNG = '<img title="Scissors" src="assets/images/scissors.png"/>';

	if (localUser.id === 1) {
		$('.rock1').html(rockPNG);
		$('.paper1').html(paperPNG);
		$('.scissors1').html(scissorsPNG);
	}
	else {
		$('.rock2').html(rockPNG);
		$('.paper2').html(paperPNG);
		$('.scissors2').html(scissorsPNG);
	}
}

/*create new user*/
function createNewUser() {
	var newUser = $('#newUser').val().trim();

	if (newUser) {
		if ((existingUsers === 0) || ((existingUsers === 1) && (currentUser.hasOwnProperty('2')))) {
			user1Ref.set({
				name: newUser,
				win: user1Win,
				loss: user1Loss
			});

			$('.userInfo').html('<p>Hi ' + newUser + '! You\'re Player 1</p>');
			
			localUser.id = 1;
			localUser.name = newUser;

			setRPS();
			user1Ref.onDisconnect().remove();
		}
		else if ((existingUsers === 1) && (currentUser.hasOwnProperty('1'))) {
			user2Ref.set({
				name: newUser,
				win: user2Win,
				loss: user2Loss
			});
			$('.userInfo').html('<p>Hi ' + newUser + '! You\'re Player 2</p>');

			localUser.id = 2;
			localUser.name = newUser;

			setRPS();
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

	/*start 1st turn when 2 users in*/
	if (snapshot.numChildren() == 2) {
		turnRef.set(turn);
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

turnRef.on('value', function(snapshot) {
	var t = snapshot.val();

	/*switch colours of user boxes*/
	if (t === 1) {
		$('.user1').css('border', '3px solid red');
		$('.user2').css('border', '3px solid #cccccc');

		if (localUser.id === 1) {
			$('.notification').html('It\'s your turn');
		}
		else {
			$('.notification').html('Waiting for player 1');
		}
	}

	if (t === 2) {
		$('.user2').css('border', '3px solid red');
		$('.user1').css('border', '3px solid #cccccc');

		if (localUser.id === 2) {
			$('.notification').html('It\'s your turn');
		}
		else {
			$('.notification').html('Waiting for player 2');
		}
	}

	if (t === 3) {
		/*show results and choices*/
		$('.toolChosen1').html('<h1>' + user1Choice + '</h1>');
		$('.toolChosen2').html('<h1>' + user2Choice + '</h1>');
	}
});

/*print user 1 info when joined*/
user1Ref.on('value', function(snapshot) {
	var name = snapshot.child('name').val();
	var win = snapshot.child('win').val();
	var loss = snapshot.child('loss').val();

	user1WinName = name;

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

	user2WinName = name;

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

	if (existingUsers === 2) {
		if ((localUser.id === 1) && (turn === 1)) {
			user1ChoiceRef.set(chosenTool);

			$('.userRPS1').hide();
			$('.toolChosen1').html('<h1>' + chosenTool + '</h1>');
		}
		else if ((localUser.id === 2) && (turn === 2)) {
			user2ChoiceRef.set(chosenTool);

			$('.userRPS2').hide();
			$('.toolChosen2').html('<h1>' + chosenTool + '</h1>');
		}
		else {
			return;
		}
	}
	else {
		return;
	}
}

/*get choice from user 1*/
user1ChoiceRef.on('value', function(snapshot) {
	user1Choice = snapshot.val();

	if (user1Choice) {
		turn++;
	}

	compareChoice();
});

/*get choice from user 2*/
user2ChoiceRef.on('value', function(snapshot) {
	user2Choice = snapshot.val();

	if (user2Choice) {
		turn++;
	}

	compareChoice();
});

function compareChoice() {

	if ((user1Choice !== null) && (user2Choice !== null)) {

		if (user1Choice === user2Choice) {
			$('.gameInfo').html('<h1>It\'s a tie!</h1>');

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
		else if (((user1Choice === 'Rock') && (user2Choice === 'Scissors')) || ((user1Choice === 'Paper') && (user2Choice === 'Rock')) || ((user1Choice === 'Scissors') && (user2Choice === 'Paper'))) {
			$('.gameInfo').html('<h1>' + user1WinName + ' wins!</h1>');
			
			user1Win++;
			user2Loss++;

			user1Ref.child('win').set(user1Win);
			user2Ref.child('loss').set(user2Loss);

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
		else if (((user2Choice === 'Rock') && (user1Choice === 'Scissors')) || ((user2Choice === 'Paper') && (user1Choice === 'Rock')) || ((user2Choice === 'Scissors') && (user1Choice === 'Paper'))) {
			$('.gameInfo').html('<h1>' + user2WinName + ' wins!</h1>');

			user2Win++;
			user1Loss++;

			user2Ref.child('win').set(user2Win);
			user1Ref.child('loss').set(user1Loss);

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
	}
}

function newRound() {
	/*remove data on firsebase*/
	user1ChoiceRef.remove();
	user2ChoiceRef.remove();

	/*clear choices*/
	user1Choice = '';
	user2Choice = '';
	$('.gameInfo').html('');
	
	/*reset turn and push to firebase*/
	turn = 1;
	turnRef.set(turn);

	/*show the right user RPS options again*/
	if (localUser.id === 1) {
		$('.userRPS1').show();
	}
	else {
		$('.userRPS2').show();
	}

	/*clear shown chosen tools*/
	$('.toolChosen1').html('');
	$('.toolChosen2').html('');
}

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