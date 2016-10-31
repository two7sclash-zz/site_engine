// Set parameters for Flash Activity Engine presentation

var params = new Object();

// *****************************************

// Change these parameters to control the Flash Player;
// these parameters will be overwritten
// by any parameters passed through the 
// URL query string

// Specify directory location of FAE application files;
// the first option below is for locally hosted files;
// the second is for shared centrally hosted files
var faeDir = "/flash/central_app/";

// Choose the mode for launching the FAE;
// the value must be either "embedded" (in the page) or 
// "popup" (in a new window)
var launchMode = "embedded";
// var launchMode = "popup";

// Choose the level at which to launch the Flash Activity Engine;
// the value must be either "item", "act", or "app"
// item is Item Level
// act is Activity (Workflow) Level; a series of exercises
// app is Application Level with table of contents

params.layer = "act";
// params.layer = "item";
// params.layer = "act";
// params.layer = "app";

// Data file to load if no filename is passed in query string
// params.src = "title_manifest.xml";
params.src = "";

// Custom width and height
// Normally you should not set width and height manually,
// but should let it be determined automatically from the other settings;
// height and width set here will override auto width and height
var customWidth = "";
var customHeight = "";

/*// Reference for loading external JS file
var extJsRef = document.createElement('script');
// Load external JS file
extJsRef.setAttribute("type","text/javascript");
extJsRef.setAttribute("src", faeDir + "swfobject.js");
document.getElementsByTagName("head")[0].appendChild(extJsRef);*/

// Apply settings to FAE files
function initFAE() {
	
	var matchArray = new Array();
	// For getting name/value pairs from parameters passed
	// in query string
	var paramPattern = /([^\=]+)\=([^&]+)(&|$)/g;
	// Get path of URL that opened index.html
	var urlString = window.location.pathname;
	// Get parameters passed
	var urlParamStr = window.location.search.slice(1);
	// Width and height of FAE
	var faeW = "";
	var faeH = "";
	
	// Update Folder Path
	// Remove drive letter
	urlString = urlString.replace(/[^\:]+\:/, "");
	// Remove filename
	urlString = urlString.replace(/\/[^\/]+$/, "");
//	urlString = "/web_sites_new/history/1234567890_jones/assets/test_prep/ace/";
//	params.folder_path = urlString;
	
	// Convert escaped ampersands in query string
	urlParamStr = urlParamStr.replace(/&amp;|%26/gi, "&");
	
	// If an XML data file is specified in the page,
	// that is the file that should be loaded
	if (typeof fileToLoad != "undefined") {
		if (fileToLoad) {
			params.src = fileToLoad;
		}
	}
	
	// Overwrite default parameters with passed parameters
	while ((matchArray = paramPattern.exec(urlParamStr)) != null) {
		params[matchArray[1]] = matchArray[2];
	}
	
	// Set dimensions depending on launch mode and level
	if (launchMode == "embedded") {
		switch(params.layer) {
			case "item":
				faeW = "650";
				faeH = "430";
				break;
			case "act":
				faeW = "715";
				faeH = "460";
				break;
			case "app":
				faeW = "715";
				faeH = "560";
				break;
		}
	} else if (launchMode == "popup") {
		switch(params.layer) {
			case "item":
				faeW = "650";
				faeH = "430";
				break;
			case "act":
				faeW = "790";
				faeH = "460";
				break;
			case "app":
				faeW = "790";
				faeH = "560";
				break;
		}
	}
	
	// Override width and height if there are custom settings
	if (customWidth) {
		faeW = customWidth;
	}
	if (customHeight) {
		faeH = customHeight;
	}
	
	// Parameter string passed to FAE
	tArgs = "folder_path=" + params.folder_path + "&layer=" + params.layer + "&src=" + params.src;
	
	// Flash variables
	var fo = new SWFObject(faeDir + "shell.swf", "shell", faeW, faeH, "7.0.19", "#FFFFFF");
	fo.addParam("base", faeDir);
	fo.addParam("flashvars", tArgs);
	fo.addParam("allowscriptaccess", "sameDomain");
	fo.addParam("quality", "high");
	fo.addParam("menu", "false");
	fo.addParam("wmode", "transparent");
	fo.write("flashcontent");
	
}