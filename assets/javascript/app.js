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
var win;
var loss;
var localUser = {id: [], ref: '', choiceRef: '', name: '',  choice: '', win: win, loss: loss};
var score1 = 0;
var score2 = 0;
var turn = 1;

var user1Quit = false;
var user2Quit = false;

//================================================ FUNCTIONS ================================================

/*prepare game*/
function getReady() {
	/*print name box and start button*/
	$('.userInfo').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id="startButton" type="submit" class="btn btn-success">Start</button></div>');

	win = 0;
	loss = 0;
}

/*insert photos for shapes*/
function showChoice(id) {
	var rockPNG = '<img title="Rock" src="assets/images/rock.png"/>';
	var paperPNG = '<img title="Paper" src="assets/images/paper.png"/>';
	var scissorsPNG = '<img title="Scissors" src="assets/images/scissors.png"/>';

	$('.rock' + id).html(rockPNG);
	$('.paper' + id).html(paperPNG);
	$('.scissors' + id).html(scissorsPNG);
	$('.userChoice' + id).show();
}

function clearOldChoices() {
	$('.shapeChosen1').html('');
	$('.shapeChosen2').html('');
}

function writeUserDatabase(id, name, win, loss) {
	localUser.id = id;
	localUser.name = name;
	localUser.ref = database.ref('users/' + localUser.id + '/');

	localUser.ref.set({
		name: name,
		win: win,
		loss: loss
	});

	$('.userInfo').html('<p>Hi ' + name + '! You\'re Player ' + id + '</p>');
	
	showChoice(localUser.id);
	localUser.ref.onDisconnect().remove();
}

/*create new user*/
function createNewUser() {
	var newUser = $('#newUser').val().trim();

	if (newUser) {
		if ((existingUsers === 0) || ((existingUsers === 1) && (currentUser.hasOwnProperty('2')))) {
			writeUserDatabase(1, newUser, 0, 0);
		}
		else if ((existingUsers === 1) && (currentUser.hasOwnProperty('1'))) {
			writeUserDatabase(2, newUser, 0, 0);
		}
		else if (existingUsers >= 2) {
			$('.userInfo').html('<p>Hi ' + newUser + '</p>');
			$('.notification').html('There are already 2 players. Please come back later.');
		}
	}
	else {
		return;
	}
}

userRef.on("value", function(snapshot) {
	/*start 1st turn when 2 users in*/
	if (snapshot.numChildren() === 2) {
		turnRef.set(turn);
	}

	/*check no of existing users*/
	existingUsers = snapshot.numChildren();

	/*check current user id on firebase*/
	currentUser = snapshot.val();
});

//need work
userRef.on('child_added', function(snapshot) {
	/*reset score if 3rd user joins*/
	if (existingUsers >= 1) {
		score1 = 0;
		score2 = 0;

		localUser.ref.update({win: 0, loss: 0});
	}
});

/*remove player's info if disconnected*/
userRef.on('child_removed', function(snapshot) {
	chatRef.remove();
	turnRef.remove();

	$('.box').css('border-color', '#cccccc');
	$('.notification').html('');
});

/*switch colours of user boxes*/
function toggleBorder(a, b) {
	$('.user' + a).addClass('redBorder');
	$('.user' + b).removeClass('redBorder');
}

/*show message to the right user*/
function toggleTurnMessage(id) {
	if (localUser.id === id) {
		$('.notification').html('It\'s your turn.');
	}
	else {
		$('.notification').html('Wait for the other player.');
	}
}

turnRef.on('value', function(snapshot) {
	t = snapshot.val();

	/*display message and colour according to turn*/
	if (t !== null) {
		
		if (t === 1) {
			toggleTurnMessage(1);
			toggleBorder(1, 2);
		}
		
		if (t === 2) {
			toggleTurnMessage(2);
			toggleBorder(2, 1);
		}
		
		if (t === 3) {
			$('.notification').html('');
			$('.shapeChosen1').html('<h1>' + user1Choice + '</h1>');
			$('.shapeChosen2').html('<h1>' + user2Choice + '</h1>');
		}
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

function showShape(id, shape) {
	/*write choice on firebase*/
	localUser.choiceRef = localUser.ref.child('/choice/');
	localUser.choiceRef.set(shape);

	/*show choice on user's screen*/
	$('.userChoice' + id).hide();
	$('.shapeChosen' + id).html('<h1>' + shape + '</h1>');
}

function pickShape() {
	var choice = $(this).data().shape;

	localUser.choice = choice;

	if (existingUsers === 2) {
		if ((localUser.id === 1) && (turn === 1)) {
			showShape(1, choice);
		}
		else if ((localUser.id === 2) && (turn === 2)) {
			showShape(2, choice);
		}
		else {
			return;
		}
	}
	else {
		return;
	}
}

/*localUser.choiceRef.on('value', function(snapshot) {
	localUser.choice = snapshot.val();

	if (localUser.choice) {
		turn++;
	}

	compareChoice();
});*/

//need work
user1ChoiceRef.on('value', function(snapshot) {
	user1Choice = snapshot.val();

	if (user1Choice) {
		turn++;
	}

	compareChoice();
});


//need work
user2ChoiceRef.on('value', function(snapshot) {
	user2Choice = snapshot.val();

	if (user2Choice) {
		turn++;
	}

	compareChoice();
});

//need work
function compareChoice() {

	if ((user1Choice !== null) && (user2Choice !== null)) {

		if (user1Choice === user2Choice) {
			$('.gameInfo').html('<h1>It\'s a tie!</h1>');

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
		else if (((user1Choice === 'Rock') && (user2Choice === 'Scissors')) || ((user1Choice === 'Paper') && (user2Choice === 'Rock')) || ((user1Choice === 'Scissors') && (user2Choice === 'Paper'))) {
			$('.gameInfo').html('<h1>' + user1WinName + ' wins!</h1>');
			
			score1++;

			user1Ref.update({win: score1});
			user2Ref.update({loss: score1});

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
		else if (((user2Choice === 'Rock') && (user1Choice === 'Scissors')) || ((user2Choice === 'Paper') && (user1Choice === 'Rock')) || ((user2Choice === 'Scissors') && (user1Choice === 'Paper'))) {
			$('.gameInfo').html('<h1>' + user2WinName + ' wins!</h1>');

			score2++;

			user2Ref.update({win: score2});
			user1Ref.update({loss: score2});

			turn = 3;

			setTimeout(newRound, 1000 * 3);
		}
	}
}

function newRound() {
	/*remove data on firsebase*/
	localUser.ref.child('choice').remove();

	/*clear choices*/
	user1Choice = '';
	user2Choice = '';
	$('.gameInfo').html('');
	
	/*reset turn and push to firebase*/
	turn = 1;
	turnRef.set(turn);

	/*show the right user choices again*/
	if (localUser.id === 1) {
		showChoice(1);
	}
	else {
		showChoice(2);
	}

	/*clear both old choices*/
	clearOldChoices();
}

/*send message*/
function sendMessage() {
	var text = $('#newMessage').val();
	var message = localUser.name + ': ' + text;

	if (localUser.id === 1) {
		chatRef.push('<span class="green">' + message + '</span>');
	}
	else {
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

$('.shape').on('click', pickShape);
getReady();
$('#startButton').on('click', createNewUser);
$('#sendButton').on('click', sendMessage);