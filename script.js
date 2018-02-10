window.addEventListener("load", init);

function init() {
	document.getElementById("form").style.display = "none";
	document.getElementById("chatroomFormDiv").style.display = "none";
	
	var logShow = document.getElementById("loginBtn");
    logShow.addEventListener("click", function() {
		showLogs();
	});
	
	var regShow = document.getElementById("regBtn");
    regShow.addEventListener("click", function() {
		showRegs();
	});
	
    var logButton = document.getElementById("logSubmit");
    logButton.addEventListener("click", function() {
		var username = document.forms["form"].elements["username"].value;
		var password = document.forms["form"].elements["password"].value;
        AjaxFunctionLogin(username, password);
    });

    var regButton = document.getElementById("regSubmit");
    regButton.addEventListener("click", function() {
		var username = document.forms["form"].elements["username"].value;
		var password = document.forms["form"].elements["password"].value;
		var confirm = document.forms["form"].elements["conPassword"].value;
		var firstname = document.forms["form"].elements["firstName"].value;
		var lastname = document.forms["form"].elements["lastName"].value;
		AjaxFunctionRegister(username, password, confirm, firstname, lastname);
    });
	
	var sendMessageButton = document.getElementById("chatForm");
    sendMessageButton.addEventListener("submit", function(evt) {
		evt.preventDefault();
		SendMessage();
	});
	
	var logoutButtonVar = document.getElementById("logoutButtonID");
    logoutButtonVar.addEventListener("click", function() {
		AjaxFunctionLogout();
	});
		
	ajax("HEAD", "http://itsuite.it.brighton.ac.uk/john10/ci227/a1/whois.php", null, checkLogin);
}

var login = false;

function showLogs(){
	document.getElementById("formTitle").innerHTML = "Login";
	document.getElementById("form").style.display = "inline";
	document.getElementById("reg").style.display = "none";
	document.getElementById("logSubmit").style.display = "inline";
	
};

function showRegs(){
	document.getElementById("formTitle").innerHTML = "Register";
	document.getElementById("form").style.display = "inline";
	document.getElementById("reg").style.display = "inline";
	document.getElementById("logSubmit").style.display = "none";
	
};

function ajax(method, url, content, response) {
	var xhr = null;
    if (window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    } else if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    }
    if (xhr != null) {
        xhr.onreadystatechange = function() {
			response(xhr);
		}
        xhr.open(method, url, true);
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(content);
    }
};

function AjaxFunctionLogin(user, pass) {
	ajax("GET", "http://itsuite.it.brighton.ac.uk/john10/ci227/a1/login.php?username=" + user + "&password=" + pass, null, LoginResponse);
};

function AjaxFunctionRegister(user, pass, con, first, last) {
    if(pass != con){
		document.forms["form"].elements["password"].value = "";
		document.forms["form"].elements["conPassword"].value = "";
		return;
	}
	
	ajax("POST", "http://itsuite.it.brighton.ac.uk/john10/ci227/a1/register.php", "username=" + user + "&password=" + pass + "&firstname=" + first + "&surname=" + last, Response);
	
	document.forms["form"].elements["password"].value = "";
	document.forms["form"].elements["conPassword"].value = "";
	document.forms["form"].elements["firstName"].value = "";
	document.forms["form"].elements["lastName"].value = "";
};

function AjaxFunctionLogout() {
	ajax("GET", "http://itsuite.it.brighton.ac.uk/john10/ci227/a1/logout.php", null, LogoutResponse);
};

function getUserList() {
	var userNodes = document.getElementById("currentUsers")
	while(userNodes.firstChild){
		userNodes.removeChild(userNodes.firstChild);
	}
	ajax("GET", "http://itsuite.it.brighton.ac.uk/john10/ci227/a1/list.php", null, listResponse);
};

function LoginResponse(xhr) {
    if (xhr.readyState == 4) {
        if (xhr.status == 200) {
            var response = xhr.responseText;
			login = true;
			Chatroom();
        }
    }
};


function LogoutResponse(xhr) {
    if (xhr.readyState == 4) {
        if (xhr.status == 200) {
            var response = xhr.responseText;
			login = false;
			LoginRegisterPage();
        }
    }
};

function RegisterResponse(xhr) {
    if (xhr.readyState == 4) {
        if (xhr.status == 200) {
            var response = xhr.responseText;
        }
    }
};

function checkLogin(xhr) {
    if (xhr.readyState == 4) {
        if (xhr.status == 200) {
			login = true;
            Chatroom();
        }
    }	
};

function listResponse(xhr) {
    if (xhr.readyState == 4) {
        if (xhr.status == 200) {
            var response = xhr.responseXML;
			var users = response.getElementsByTagName("user");
			for(i = 0; i < users.length; i++) {
				makeUsers(users[i].textContent);
			}
			setTimeout(getUserList,5000)
        }
    }
};

function makeUsers(user){
	var node = document.createElement("article");
	node.textContent = "hack " + user + "\(\)\;";
	document.getElementById("currentUsers").appendChild(node);
}

function Chatroom(){
	document.getElementById("loginFormDiv").style.display = "none";
	document.getElementById("topTitle").innerHTML = "Chatroom";
	document.getElementById("chatroomFormDiv").style.display = "inline";
	getChat();
	getUserList();
};

function LoginRegisterPage(){
	document.getElementById("loginFormDiv").style.display = "inline";
	document.getElementById("topTitle").innerHTML = "Login/Register";
	document.getElementById("chatroomFormDiv").style.display = "none";
};

function SendMessage() {
    var message = document.forms["chatForm"].elements["userMsg"].value;
	ajax("POST", "http://itsuite.it.brighton.ac.uk/john10/ci227/a1/send.php", "message=" + message, Response);
	document.forms["chatForm"].elements["userMsg"].value = "";
};

function Response(xhr) {
    if (xhr.readyState == 4) {
        if (xhr.status == 200) {
            var response = xhr.responseText;
        }
    }
};

function getChat() {
	ajax("GET", "http://itsuite.it.brighton.ac.uk/john10/ci227/a1/channel.php", null, ChannelResponse);
};

function updateScroll(){
	var scrollbox = document.getElementById("chatBox");
	scrollbox.scrollTop = scrollbox.scrollHeight;
}

function ChannelResponse(xhr) {
	var i;
    if (xhr.readyState == 4) {
        if (xhr.status == 200) {
            var response = xhr.responseXML;
			var msgs = response.getElementsByTagName("message");
			for(i = 0; i < msgs.length; i++) {
				makeMsg(msgs[i]);
				updateScroll();
			}
        }
		if(login) {
			setTimeout(getChat, 1000);
		}
    }
};

function makeMsg(msg) {
	var node = document.createElement("article");
	var foot = document.createElement("footer");
	var timestamp = new Date(msg.getElementsByTagName("timestamp")[0].textContent);
	var user = msg.getElementsByTagName("from")[0].textContent;
	var txt = msg.getElementsByTagName("content")[0].textContent;
	var newtxt = document.createElement("div");
	
	node.appendChild(newtxt);
	foot.appendChild(document.createTextNode(timestamp + " " + user));
	node.appendChild(foot);
	document.getElementById("chatBox").appendChild(node);
	if( txt.toLowerCase() === "temps.exe") {
		node.appendChild(document.createTextNode(txt));
		ajax("GET", "http://itsuite.it.brighton.ac.uk/js884/ting/tempa.txt", null, function(xhr) {
			newtxt.innerHTML = xhr.responseText;
			var audio = new Audio("sound/temps.mp3");
			audio.play();
		});
	} else {
		txt = txt.replace(/([>:I;b8XfFsS][-':uUhH]?[DdPsSbcCiI\)\(][kKtT]?)/g, function (match) {
			switch(match) {
				case ":)" : return "<img src=\"emotijons/Happy.png\"/>";
				case ":D" : return "<img src=\"emotijons/Happy.png\"/>";
				case ":P" : return "<img src=\"emotijons/Tongue.png\"/>";
				case "8)" : return "<img src=\"emotijons/Sunglasses.png\"/>";
				case ";)" : return "<img src=\"emotijons/Wink.png\"/>";
				case "I:)" : return "<img src=\"emotijons/Box.png\"/>";
				case ":(" : return "<img src=\"emotijons/Sad.png\"/>";
				case ">:I" : return "<img src=\"emotijons/Angry.png\"/>";
				case "b)" : return "<img src=\"emotijons/PirateHappy.png\"/>";
				case "bD" : return "<img src=\"emotijons/PirateHappy.png\"/>";
				case "bP" : return "<img src=\"emotijons/PirateTongue.png\"/>";
				case "b)" : return "<img src=\"emotijons/PirateWink.png\"/>";
				case "b(" : return "<img src=\"emotijons/PirateSad.png\"/>";
				case ">bI" : return "<img src=\"emotijons/PirateAngry.png\"/>";
				case "bbk" : return "<img src=\"emotijons/bbk.gif\"/>";
				case "fuck" : return "fudge";
				case "Fuck" : return "Fudge";
				case "FUCK" : return "FUDGE";
				case "shit" : return "sugar";
				case "Shit" : return "Sugar";
				case "SHIT" : return "SUGAR";
				default: return match;
			};
		}
		);
		newtxt.innerHTML = txt;
	};
}
