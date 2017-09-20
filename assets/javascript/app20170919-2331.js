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

//CONSTRUCTION BEGINS<===========================================================================

function printUserInfo(id, name, win, loss) {
	var rockPNG = '<img title="Rock" src="assets/images/rock.png"/>';
	var paperPNG = '<img title="Paper" src="assets/images/paper.png"/>';
	var scissorsPNG = '<img title="Scissors" src="assets/images/scissors.png"/>';
	$('.userName' + id).html('<h3>' + name + '</h3>');
	$('.userRPS' + id).html('<div class="tool" data-tool="rock">' + rockPNG + '</div><div class="tool" data-tool="paper">' + paperPNG + '</div><div class="tool" data-tool="scissors">' + scissorsPNG + '</div>');
	$('.userScore' + id).html('Wins: ' + win + ' Losses: ' + loss);
}

//why on click doesn't capture anything???
$('.user1').on('click', function() {
	console.log('click on user1 div'); //this works
});

$('.tool').on('click', function() {
	console.log('click on tool'); //this doesn't work
});


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
	
	for (var i = 1; i < 3; i++) {
		printUserInfo(i, '', '', '');
		$('.userName' + i).html('Waiting for Player ' + i);
		$('.userRPS' + i).html('');
		$('.userScore' + i).html('');
	}
});

//CONSTRUCTION ENDS<===========================================================================

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

getReady();

$('#startButton').on('click', createNewUser);
$('#sendButton').on('click', sendMessage);