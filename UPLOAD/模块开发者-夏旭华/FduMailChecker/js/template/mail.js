var mailTemplate;
var months = new Array("Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"),
mailTemplate = function(mail) {
  date = new Date(mail.issued);
  var summary;
  if(mail.summary != null){
    if(mail.summary.length > 100){
      summary = mail.summary.substring(0,100)+"…";
    }
    else{
      summary = mail.summary;
    }
  }
  else{
    summary = null;
  }
  var title = mail.title == null? "无主题" : mail.title;
  return  "<div class=\"entry\" id=\"" + mail.id + "\">\n"+
  "     <div class=\"dd\">\n"+
  "         <div class=\"mailInfo \">\n"+
  "            <label class=\"title\" mailId=\"" + mail.id + "\" title=\"" + title + "\">" + mail.shortTitle + "</label>\n"+
  "            <label class=\"author\" title=\"" + mail.authorMail + "\">" + mail.authorName + "</label>\n"+
  "            <label class=\"issued\" title=\"" + date + "\">" + formatDateTime(date, months) + "</label>\n"+
  "         </div>\n"+
  "         <div class=\"mailActions\">\n"+
  "            <a class=\"options\" mailId=\"" + mail.id + "\" href=\"#\" title=\"Options\"><img src=\"../img/options.png\"></a>\n"+
  "            <a class=\"read s\" mailId=\"" + mail.id + "\" href=\"#\" title=\"Mark as read\">Mark As Read</a>\n"+
  "            <a class=\"trash s\" mailId=\"" + mail.id + "\" href=\"#\" title=\"Trash Mail\"><img src=\"../img/trash.png\"></a>\n"+
  "            <a class=\"reply s\" mailId=\"" + mail.id + "\" href=\"#\" title=\"Reply mail\"><img src=\"../img/reply.png\"></a>\n"+
  "            <a class=\"forward s\" mailId=\"" + mail.id + "\" href=\"#\" title=\"Forward Mail\"><img src=\"../img/forward.png\"></a>\n"+
  "            <a class=\"more \" mailId=\"" + mail.id + "\" href=\"#\" title=\"Show full message\"><img src=\"../img/more.png\" /></a>\n"+
  "         </div>\n"+
  "      </div>\n\n"+
  "      <div class=\"summary\" mailId=\"" + mail.id + "\">\n" + summary + "\n"+
  "     </div>\n"+
  "   </div>";;
};
 