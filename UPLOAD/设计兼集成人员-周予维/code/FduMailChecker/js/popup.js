var storage;
var uid;
var password;
var totalNumber = 0;
var day = 0;
var maillist = void 0;
var backgroundPage = null;
var mailTest = {
	id : 1,
	authorMail : "11302010006@fudan.edu.cn",
	authorName :　"K2Ang",
	issued : new Date(),
	title : "A mail for Test",
	shortTitle : "Test",
	summary : "It is a dfnjkf  sbfhjbgdjgfsd jsgndberjhgewkj wh uibndfjkbjdfb djkfskfb  mail for test"
};
var mail = void 0;

var login = function(){
	chrome.extension.sendRequest({
		command: "login",
		username : $("#uid").val(),
		password : $("#password").val()
	},function(data){
		if(data.success){
			_init();
		}
		else{
			alert("登陆失败");
		}
	});

}

var showMailBox = function(){
	uid = storage.getItem("uid");
	password = storage.getItem("password");
	window.close();
	if(uid != null && password != null){
		return chrome.tabs.create({
      		url: "http://mail.fudan.edu.cn/coremail/index.jsp?uid="+uid+"&password="+password+"&action%3Alogin="
    	});
	}
	else{
		return chrome.tabs.create({
      		url: "http://mail.fudan.edu.cn/coremail/index.jsp"
    	});
	}
}

var showFullMessage = function(uid){
	$("#"+uid+" .fulltext").toggleClass("hidden");
	$("#"+uid+" .summary").toggleClass("hidden");
	if($("#"+uid+" .fulltext").hasClass("hidden")){
		$("#"+uid+" .more img").attr("src","../img/more.png");
	}
	else{
		$("#"+uid+" .more img").attr("src","../img/compose.png");
	}
}

var forward = function(){
	alert("forward a mail");
}

var reply = function(){
	alert("reply a mail");
}

var trash = function(uid){
	chrome.extension.sendRequest({
		command: "delete",
		uid : uid
	},function(data){
		$("#"+uid).remove();
	});
}

var read = function(uid){
	chrome.extension.sendRequest({
		command: "read",
		uid : uid
	},function(data){
		$("#"+uid).remove();
	});
}

var logout = function(){
	storage.removeItem("uid");
	document.location.reload();
}

var refresh = function(){
	chrome.extension.sendRequest({
		command : "refresh"
	});
	return pollMail();
}

var pollMail = function(){
	chrome.extension.sendRequest({
		command : "headers"
	},function(data){
		maillist = process(data);
		if(maillist == null)
			return;
		var _i;
		var max = data.length > 10? 10 : data.length;
		$(".mailBox").empty();
		for(_i = 0; _i < max; _i++){
			$(".mailBox").append(mailTemplate(maillist[_i]));
		}
		$(".read").click(function(){
			read($(this).attr("mailId"));
		});

		$(".trash").click(function(){
			trash($(this).attr("mailId"));
		});

		$(".reply").click(function(){
			reply($(this).attr("mailId"));
		});

		$(".forward").click(function(){
			forward($(this).attr("mailId"));
		});

		$(".more").click(function(){
			showFullMessage($(this).attr("mailId"));
		});

		
	});
}

var process = function(data){
	var _i;
	var mailHeaders = [];
	if(data == null)
		return null;
	var max = data.length > 10? 10 : data.length;
	for(_i = 0; _i < max; _i++){
		var content = data[_i].content.counter == 0?"":data[_i].content.array[0].text;
		mail = {
			title : data[_i].subject,
			shortTitle : shorter(data[_i].subject),
			issued : data[_i].date,
			id : data[_i].uid,
			summary : content,
			authorName : data[_i].from.name,
			authorMail : data[_i].from.mailbox
		};
		mailHeaders.push(mail);
	}
	return mailHeaders;
}

var shorter = function(subject){
	if(subject == null)
		return "无主题";
	if(subject.length > 25){
		return subject.substring(0,25)+"…";
	}
	else{
		return subject;
	}
}

var _init = function(){
	if(storage != null){
		uid = storage.getItem('uid');
	}
	if(uid == null){
		$("#main").html("<form id=\"loginForm\"><div class=\"logArea\">"+
					"<div class=\"inptr uid\"><input name = \"username\" title=\"用户名\" type=\"text\" id=\"uid\" class=\"uid\" placeholder=\"用户名\" /></div>"+
					"<div class=\"inptr password\"><input name=\"password\" title=\"密　码\" class=\"password\" id=\"password\" type=\"password\" placeholder=\"密　码\" /></div>"+
					"<input type=\"button\" name=\"action:login\" id=\"loginButton\" class=\"loginButton\" value=\"登陆\">"+
					"</div></form>");

		$(".loginButton").click(function(){
			login();
		})

	}
	else{
		uid = storage.getItem("uid")
		$("#main").html(
			"<div class=\"top\">\n"+
			"	<div class=\"title\">FDU Mail Checker</div>\n"+
			"	<ul class=\"generalOptions\">\n"+
			"		<li class = \"logout\"></li>\n"+
			"		<li class = \"refresh\"></li>\n"+
			"		<li class = \"close\"></li>\n"+
			"	</ul>\n"+
			"</div>\n"+
			"<div class = \"mailBox\">\n"+
			"</div>"
		);
		$(".logout").click(function(){
			logout();
		});

		$(".close").click(function(){
			window.close();
		});

		$(".refresh").click(function(){
			refresh();
		})

		$(".top .title").click(function(){
			showMailBox();
		});
		pollMail();
	}

	

}

$(document).ready(function(){
	backgroundPage = chrome.extension.getBackgroundPage();
  	if (backgroundPage != null) {
    	storage = backgroundPage.storage;
    	_init();
  	}
});

