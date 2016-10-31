// Redirects index.html to site launch URL
function redirect() {
	
	var matchArray = [];
	var isbn = "";
	var newUrl = "";
	var currentUrl = window.location.href;
	var currentHost = window.location.hostname;
	var jspHosts = ["s-college.cengage.com", "college.cengage.com"];
	var indexFile = "";
	
	// Extract ISBN from name of directory in which index.html is located
	if ((matchArray = currentUrl.match(/\/([\dxX]{10,13})_[\w]+\//)) != null) {
		isbn = matchArray[1];
	}
	
//	// Use JSP index file for staging or production
//	for (var i = 0; i < jspHosts.length; i ++) {
//		if (jspHosts[i] == currentHost) {
//			indexFile = "index.jsp";
//			break;
//		}
//	}

	window.location = "/site_engine/" + indexFile + "#" + isbn;

}
