
var unread;
var canvas;
var gfx;
var audio;
var storage = window.localStorage;
var loopTimer;
var animTimer;
var animDelay = 10;

var stopAnimate = function() {
  if (animTimer != null) {
    clearTimeout(animTimer);
  }
  setIcon();
  rotation = 1;
  return factor = 1;
};

var setIcon = function(){
  chrome.browserAction.setIcon({
      path: "../img/icon.png"
  });
}

var stopAnimateLoop = function() {
  if (loopTimer != null) {
    clearTimeout(loopTimer);
  }
  return stopAnimate();
};

var startAnimate = function() {
    stopAnimateLoop();
    animTimer = setInterval(doAnimate, animDelay);
    setTimeout(stopAnimate, 2000);
    return loopTimer = setInterval(startAnimate, 20000);
};

var doAnimate = function() {
  canvasContext.save();
  canvasContext.clearRect(0, 0, canvas.width, canvas.height);
  canvasContext.translate(Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
  canvasContext.rotate(rotation * 2 * Math.PI);
  canvasContext.drawImage(gfx, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
  canvasContext.restore();
  rotation += 0.01 * factor;
  if (rotation <= 0.9 && factor < 0) {
    factor = 1;
  } else if (rotation >= 1.1 && factor > 0) {
    factor = -1;
  }
  return chrome.browserAction.setIcon({
    imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
  });
};

var playSound = function(){
  audio.load();
  audio.play();
}

function notLogin(){
  chrome.browserAction.setBadgeBackgroundColor({
    color: [190, 190, 190, 255]
  });
  chrome.browserAction.setBadgeText({
    text: "X"
  });
  chrome.browserAction.setTitle({
    title: "Not Log In!"
  });
}

function pollingMails(){
  chrome.browserAction.setBadgeBackgroundColor({
    color: [190, 190, 190, 255]
  });
  chrome.browserAction.setBadgeText({
    text: "..."
  });
  chrome.browserAction.setTitle({
    title: "Polling Mails..."
  });
  getUnread();
}

 

function updateMails(newMails){
    stopAnimateLoop();
  if(newMails > unread){
    unread = newMails;
    setTimeout(startAnimate, 0);
    setTimeout(playSound,0);
  }

	if(newMails < 1){
  		chrome.browserAction.setBadgeBackgroundColor({
    		color: [36, 36, 190, 255]
  		});
 		chrome.browserAction.setBadgeText({
    		text: "0"
  		});
  		chrome.browserAction.setTitle({
    		title: "No Unread Mails"
 		});
	}
	else{
		chrome.browserAction.setBadgeBackgroundColor({
    		color: [36, 36, 190, 255]
  		});
 		chrome.browserAction.setBadgeText({
    		text: ""+ newMails
  		}); 
  		chrome.browserAction.setTitle({
    		title: newMails + " Unread Mails."
 		});
	}
}

var getUnread = function(){
  $.ajax({
    url:"http://10.131.228.215/fMail.php/Index/getNumUnRead",
    timeout : 3000,
    success : function(data){
      updateMails(data.num_unread);
      return setTimeout(getUnread,30000);
    },
    error : function(){
      return setTimeout(getUnread,30000);
    }
  });
}

var login = function(){
  $.ajax({
        url:"http://10.131.228.215/fMail.php/Index/login",
        data: {
          username : storage.getItem("uid"),
          password : storage.getItem("password")
        }, 
        success : function(){
          pollingMails();
        },
        type : "Post"
      });
}

$(document).ready(function(){
	init();
});

var init = function(){
  unread = 0;
  canvas = document.createElement('canvas');
  canvas.setAttribute('height', '19px');
  canvas.setAttribute('width', '19px');
  canvasContext = canvas.getContext('2d');
  gfx = document.getElementById("gfx");
  audio = new Audio();
  audio.src = "../audio/ding.ogg";
  if(!storage.getItem("uid")){
      notLogin();
      return setTimeout(init,3000);
  }
  else{
      login();
  }
  // $.ajax({
  //   url : "mail.fudan.edu.cn/coremail/index.php?uid=11302010006&password=020635&action%3Alogin=",
  //   success : function(data){
  //     alert(data);
  //   }
  // });
}
chrome.extension.onRequest.addListener(function(request, sender, sendResponse){
    if(request.command == "login"){
      storage.setItem("uid",request.username);
      storage.setItem("password",request.password);
      $.ajax({
        url:"http://10.131.228.215/fMail.php/Index/login",
        data: {
          username : request.username,
          password : request.password
        }, 
        success:function(data){
          sendResponse(data);
          pollingMails();
        },
        type : "Post"
      });
    }
    else if(request.command == "delete"){
      $.ajax({
        url:"http://10.131.228.215/fMail.php/Index/delete?uid=" + request.uid,
        success:function(data){
          sendResponse(data);
        }
      });
    }
    else if(request.command == "read"){
       $.ajax({
          url:"http://10.131.228.215/fMail.php/Index/setReaded?uid=" + request.uid,
          success:function(data){
           sendResponse(data);
        }
      });
    }
    else if(request.command == "headers"){
        $.ajax({
          url:"http://10.131.228.215/fMail.php/Index/getHeaders",
          success:function(data){
           sendResponse(data);
        }
      });
    }
});


