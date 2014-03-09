<?php
class IndexAction extends Action {
    public function index(){
    	$date = "Fri, 7 Mar 2014 12:28:59 +0800 (GMT+08:00)";
    	import('ORG.Util.Date');
    	$Date = new Date($date);
    	print_r($Date);
    }
    public function login(){
    	$user_name = I('post.username',null);
    	$password = I('post.password',null);
    	if($user_name == null || $password == null ){
    		$user_name = I('get.username',null);
    		$password = I('get.password',null);
    	}
    	
    	if($user_name==null || $password == null){
    		$this->ajaxReturn(array("success"=>false));
    	}
    	
    	$session = uniqid().md5($user_name.$password);
    	S($session,array($user_name,$password),3600);
    	
    	session("username",$user_name);
    	session("password",$password);
    	
    	$imap = imap_open("{mail.fudan.edu.cn:143}INBOX", $user_name, $password);
    	$this->ajaxReturn(array("success"=>($imap?true:false),"S" => $session));
    }
    public function getNumMsg(){
    	$nn = imap_num_msg($this->open());
    	$this -> ajaxReturn(array("num_all" => $nn));
    }
    public function getNumUnRead(){
    	$nn = imap_num_recent($this->open());
    	$this -> ajaxReturn(array("num_unread" => $nn));
    }
    
    public function getHeaders($len = 50){
    	$imap = $this->open();
    	$nn = imap_num_msg($imap);
    	$counter = 0;
		$nnn = imap_num_recent($imap);
		if($nnn>10) $nnn=10;
		if($nnn!=0)
	    	for($i=$nn;$i>0;$i--){ 
	    		$ret = imap_header($imap,$i);
	    		$uid = imap_uid($imap, $ret->Msgno);
	    		if(!($ret -> Unseen == 'U')) continue;
	    		$re[$counter]['uid'] = $uid;
	    		
	    		$subjection = imap_mime_header_decode($ret->subject);
				$re[$counter]['subject'] = iconv($subjection[0]->charset."",'UTF-8',$subjection[0]->text);
	    		$re[$counter]['unSeen'] = $ret -> Unseen;
	    		$re[$counter]['content'] = $this ->getBodyM($imap,$uid,$len);
	    		$re[$counter]['date'] =  $ret ->date;
	    		
	    		$fromname = imap_mime_header_decode($ret -> from[0]->personal);
	    		$re[$counter]['from']['name'] = iconv($fromname[0]->charset."",'UTF-8',$fromname[0]->text);
	    		$re[$counter]['from']['mailbox'] =  $ret -> from[0]->mailbox.'@'.$ret -> from[0]->host;
	    		
	    		$toaddress = $ret->to;
	    		foreach($toaddress as $toadd){
	    			$name = imap_mime_header_decode($toadd->personal);
	    			$mail = $toadd ->mailbox.'@'.$toadd ->host;
	    			$recievers[$mail] = iconv($name[0]->charset."",'UTF-8',$name[0]->text);
	    		}
	    		$re[$counter]['to'] = $recievers;
	    		
	    		imap_clearflag_full($imap, "".$uid, "\Seen",ST_UID);
	    		if($counter++ > $nnn) break;
	    	}
    	$this -> ajaxReturn($re);
// print_r($re);
    }
    public function getBody($uid){
    	$imap = $this->open();
    	$re['content'] = $this ->getBodyM($imap,$uid,0);
    	$this -> ajaxReturn($re);
    }
    public function setReaded($uid){
    	$imap = $this->open();
    	$b = imap_setflag_full($imap, "".$uid, "\Seen",ST_UID);
    	$this->ajaxReturn(array("success"=>$b));
    }
    
    public function delete($uid){
    	$imap = $this->open();
    	$b = imap_delete($imap, $uid,FT_UID);
    	if($b) $b = imap_expunge($imap);
    	$this->ajaxReturn(array("success"=>$b));
    }
    public function sendMail(){
    	$name = session('username');
    	$password = session('password');
    	
    	if($name == null || $password == null){
    		$array = S(I('get.S',null));
    		if(!$array){
    			$this->ajaxReturn(array("success"=>"unlogin"));
    			die();
    		}
    		$name = $array[0];
    		$password = $array[1];
    	}

		$to = I('post.toAddress');
		$toName=I('post.toName');
		//TODO ,splite
		$serderAdd = $name.'@fudan.edu.cn';
		$senderName = I('post.senderName',@name);
		$subject = I('post.subject');
		$content = I('post.content'," ");
		
    	vendor('PHPMailer.class#phpmailer');
    	$mail             = new PHPMailer();
    	$mail->CharSet    = 'UTF-8'; 
    	$mail->IsSMTP(); 
    	$mail->SMTPDebug  = 1;
    	$mail->SMTPAuth   = true;
// 		$mail->SMTPSecure = 'ssl';
    	$mail->Host       = 'mail.fudan.edu.cn';
    	$mail->Port       = '25' ; 
    	$mail->Username   = $name; 
    	$mail->Password   = $password;
    	$mail->SetFrom($serderAdd, $senderName);
    	$replyEmail       = $serderAdd;
    	$replyName        = $senderName;
    	$mail->AddReplyTo($replyEmail, $replyName);
    	$mail->Subject    = $subject;
    	$mail->MsgHTML($content);
    	$mail->AddAddress($to, $toName);
    	$ret = $mail->Send() ? true : $mail->ErrorInfo;
    	$this->ajaxReturn(array("success"=>$ret));
    }
    
    private function open(){
    	$name = session('username');
    	$password = session('password');

    	if($name == null || $password == null){
    		$array = S(I('get.S',null));
    		if(!$array){
    			$this->ajaxReturn(array("success"=>"unlogin"));
    			die();
    		}
    		$name = $array[0];
    		$password = $array[1];
    	}
//     	echo $name.$password;
//     	die();
    	$imap = imap_open("{mail.fudan.edu.cn:143}INBOX", $name, $password);
    	return $imap;
    }
    
    private function getBodyM($imap,$uid,$len){
    	$structure=imap_fetchstructure($imap,$uid,FT_UID);
    	$ret = array('counter' => 0,'isattachment' => 0);
    	$ret = $this -> procedure_parts($imap,$structure,$uid,"",true,$ret,$len);
    	return $ret;
    }
	private function procedure_parts($imap,$structure,$uid,$partno,$isBase=false,$ret,$len){
		if($structure->ifdisposition){
			$ret['isattachment'] = 1;
			return $ret;
		}else{						
			switch($structure -> type){
				case 0:$type = "text";break;
				case 1:$type = "multipart";
					$counter = count($structure->parts);
					if ($partno != "")  $partno = $partno.".";
					for ($i = 0; $i < $counter; $i++){
						$ret = $this->procedure_parts($imap,$structure->parts[$i], $uid, $partno.($i + 1),false,$ret,$len);
					};return $ret;break;
				case 2:$type = "message";break;
				case 3:$type = "application";break;
				case 4:$type = "audio";break;
				case 5:$type = "image";break;
				case 6:$type = "video";break;
				case 7:$type = "other";break;
				default:break;
			}
			
			$type = strtolower($type."/".$structure->subtype);
				
			if($isBase) $text = imap_body($imap,$uid,FT_UID);
			else $text = imap_fetchbody($imap,$uid,$partno,FT_UID);

			switch ($structure->encoding){
				case 3:$content =  imap_base64($text);break;
				case 4:$content =  imap_qprint($text);break;
				default:$content = $text;break;
			}
			$charset = $structure->parameters[0]->value;
			if(!($charset == 'UTF-8')) {
				$content = iconv($charset."", "UTF-8", $content);
			}
			
// 			if($len!= 0 ) $content =substr($content, 0,$len);
			
			$ret['array'][$ret['counter']] = array('type' => $type,'text' => $content);
			$ret['counter'] = $ret['counter']+1;
			return $ret;
		}
	}
}