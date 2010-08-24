(function(){
    iframe = document.createElement('iframe');
    iframe.setAttribute('name', 'scottyframe');
    iframe.setAttribute('name', 'scottyframe');
    iframe.setAttribute('style', 'z-index: 100000; position: fixed; top: 0; left: 50%; margin-left: -150px; width: 300px; height: 70px; background-color: #060720; border: 4px solid ');
    document.body.appendChild(iframe);0
    function get_var(name, string)
    {
      name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
      var regexS = "[\\?&]"+name+"=([^&#]*)";
      var regex = new RegExp( regexS );
      var results = regex.exec(string);
      if( results == null )
        return "";
      else
        return results[1];
    }
    var querystring =  window.document.getElementById('scottyscript').getAttribute('src');
    username = get_var('user', querystring);
    url = get_var('url', querystring);
    iframe.setAttribute('src', "http://scotty.tomusher.com/" + username + "/panel/" + url);
})();
