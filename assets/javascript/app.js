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
var user2Ref = database.ref('users/2/');
var turnRef = database.ref('turn/');
var chatRef = database.ref("/chat");
var existingUsers;
var localUser = {id: [], name: ''};

//================================================ FUNCTIONS ================================================

/*prepare game*/
function getReady() {
	/*print name box and start button*/
	$('.userInfo').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id="startButton" type="submit" class="btn btn-success">Start</button></div>');
}



/*show user name, win, loos to both users, exclude RPS*/
function printUserInfo(id, name, win, loss) {
	$('.userName' + id).html('<h3>' + name + '</h3>');
	$('.userScore' + id).html('Wins: ' + win + ' Losses: ' + loss);
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

/*show user's own RPS*/
function printRPS() {
	if (localUser.id === 1) {
		setRPS(1);
	}
	else if (localUser.id === 2) {
		setRPS(2);
	}
} //issue: if user left, the other doesn't see RPS

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

			user1Ref.onDisconnect().remove(); //issue: if player 1 disconnects, then a 3rd player log-ins, 3rd player will replace existing player 2

			localUser.id = 1;
			localUser.name = newUser;

			printRPS();
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

			localUser.id = 2;
			localUser.name = newUser;

			printRPS();
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
	
	/*print user's info*/
	for (var i = 1; i < 3; i++) {
		if (snapshot.child(i).exists()) {
			var name = snapshot.child(i).val().name;
			var win = snapshot.child(i).val().win;
			var loss = snapshot.child(i).val().loss;

			printUserInfo(i, name, win, loss);
		}
	}
});

/*remove player's info if disconnected*/
userRef.on('child_removed', function(snapshot) {
	chatRef.remove();
	turnRef.remove();
	
	for (var i = 1; i < 3; i++) {
		printUserInfo(i, '', '', '');
		$('.userName' + i).html('Waiting for Player ' + i);
		$('.userRPS' + i).html('');
		$('.userScore' + i).html('');
	}
});

//change user box colour when turn changes
turnRef.on('value', function(snapshot) {
	var turn = snapshot.val();

	if (turn == 1) {
		$('.user1').css('border', '3px solid red');
	}
});

function chosenTool() {
	var chosenTool = $(this).data().tool;

	if (localUser.id == 1) {
		database.ref('users/1/choice').set(chosenTool);
	}

	if (localUser.id == 2) {
		database.ref('users/2/choice').set(chosenTool);
	}
}

//turn++ after each round
//when 1 user left, remove turn

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

$('.tool').on('click', chosenTool); /*must place before getReady()*/

getReady(); /*if place before onclick tool, the localUser's tools aren't shown, only shown on the other user's screen. weird*/

$('#startButton').on('click', createNewUser);
$('#sendButton').on('click', sendMessage);