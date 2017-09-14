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

/*==========================================================================================*/
/*NOTICE: keep everything organised by tasks for now, when done, organise things by categories*/
/*==========================================================================================*/


function getReady() {
	/*print name box and start button*/
	$('.userLogIn').html('<div class="form-inline"><input id="newUser" type="text" class="form-control col-sm-9 mr-sm-2" placeholder="Type your name here"><button id = "startButton" type="submit" class="btn btn-success">Start</button></div>');
}

getReady();

/*==========================================================================================users log in*/
var userId = 1;

/*send user data to firebase*/
function writeUserData(userId, name, win, loss) {
	firebase.database().ref('users/' + userId).set({
		name: name,
		wins: win,
		losses: loss
	});
}

/*create new user*/
function createNewUser() {
	var newUser = $('#newUser').val().trim();

	

	if (newUser) {
		console.log(newUser);

		/*show the line below when figure out how to allow 2 browsers log in*/
		/*$('.userLogIn').html('<p>Hi ' + newUser + '! You\'re player ' + userId + '</p>');*/
		
		

		writeUserData(userId, newUser, 0, 0);
		userId++; /*need to update userId based on firebase data, otherwise the other browser will reset user1 data*/
	}
	else {
		return;
	}


}

/*count user*/
var countUser = firebase.database().ref('users/' + userId);

firebase.database().ref('/users/' + userId).once('value').then(function() {
			console.log('number of users: ', userId);
});

/*add user when click start*/
$('#startButton').on('click', function() {
	createNewUser();

	
});









/*==========================================================================================users send messages*/
function sendMessage() {
	var message = $('#newMessage').val();
	firebase.database().ref('chat').push(message);
	/*push will create a random id for each message, need to remove that to pull messages back*/

	console.log(message);
}

$('#sendButton').on('click', sendMessage);

/*TO DO LIST:*/

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