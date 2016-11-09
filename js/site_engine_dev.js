/* SITE ENGINE

Version 1.20
12/12/21

This file contains the core code for the Site Engine and is loaded by index.html. In turn it loads glossary.js and tracker.js. The file requires the jQuery JavaScript library. JQuery methods are preceded by the symbol "$." jQuery documentation can be found at http://docs.jquery.com/.

Maintainer: james.fishwick@cengage.com

*/

// INSTANTIATE CLASSES

// Declare functions before using a reference to them
var ConstantValues, ErrorHandler, Update, Clear, Show, AllSites, Site, Buckets, Assets, ResourceCenter, ContentLocation;

// Data-modeling classes
var allSites = new AllSites();	
var site = new Site();
var buckets = new Buckets();
var assets = new Assets();
var resourceCenter = new ResourceCenter();
// For embedded pages
var currentLocation = new ContentLocation("current");
// For reporting and other functions that shouldn't update
// curentLocation
var tempLocation = new ContentLocation("temp");
var currentStatus = new Status();

// Controller to handle interface requests
var controller = new Controller();

// Handles the interface
var view = new View();

// Handles loading Site Engine files
var fileLoader = new FileLoader();
// Handles Flash
var flashManager = new FlashManager();

var errorHandler = new ErrorHandler();
var ajaxResults = new AjaxResults();
var constants = new ConstantValues();
var tracker;

/*Trap calls to Firebug in IE
if (!window.console || !console.firebug) {
    var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml",
    "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];

    window.console = {};
    for (var i = 0, count = names.length; i < count; ++i) {
        window.console[names[i]] = function() {};
	}
}*/

// SETTINGS

// Forces the browser NOT to cache AJAX calls.
$.ajaxSetup ({
	//cache: false
});

//// Extend JQuery to include a "slowslide" effects option that can be used
//// to slide accordion menu open more slowly
//$.extend($.ui.accordion.animations, {
//	slowslide: function(options) {
//		$.ui.accordion.animations.slide(options, {duration: 500});
//	}
//});

// CONSTANTS

function ConstantValues() {
	// New Line
	this.NL = "\r\n";
}///////////////////////////////////
// PROGRAM BODY
///////////////////////////////////

// Execute after document has fully loaded
$(document).ready(function() {
		var template = "";
	var locationId = getLocationId();
	var loginDiv = "";
		currentLocation.update(locationId);
		// Load data from sites class into site;
	// load site definition file
	// load glossary file; load Tracker class
	if (currentLocation.type != "all sites") {
		// Load data into Site class
		site.getAllSitesData();
		fileLoader.loadSiteDefinition();
		$('html').removeClass('busy');
		site.update();
		// Load correct stylesheet for template
		loadStylesheet(site.engineFiles.stylesheet);
		// Load site-specific 4LTR Press stylesheet
		if (site.type == "4ltr") {
			loadStylesheet(site.siteFiles.stylesheet4ltr);
			update4ltrStylesheet();
		}
		// Terminate if there are errors
		errorHandler.show();
		// Update buckets and resourceCenter to calculate values
		// that couldn't be created at instantiation
		buckets.update();
		// Check whether user has been authenticated
		currentStatus.checkAuthentication();
		if (currentStatus.authenticated) {
			fileLoader.getSsoUrls();
		}
		// Load glossary
		fileLoader.loadScript(site.engineFiles.glossary);
		glossary.loadContent();
		// Engagement Tracker module
		loadTracker();
		tracker = new Tracker();
		// Load custom stylesheet if there is one
		loadCustomStylesheet();
		template = site.engineDirs.templates;
		// If shell is not to be rendered, and a custom stylesheet is desired
		if (!(currentStatus.shell) && site.siteFiles.standaloneStyles) {
			var cssNode = document.createElement('link');
			cssNode.type = 'text/css';
			cssNode.rel = 'stylesheet';
			cssNode.href = site.siteFiles.standaloneStyles;
			cssNode.media = 'screen';
			cssNode.title = 'dynamicLoadedSheet';
			document.getElementsByTagName("head")[0].appendChild(cssNode);
		}
		// If shell is not to be rendered, don't load site shell
		if (!currentStatus.shell) {
			template = makePath([template], "standalone.html");
		} else {
			template = makePath([template], site.engineFiles.shellTemplate);
		}
	// All Sites Index
	} else {
		template = makePath([allSites.engineDirs.templates], "report.html");
		loadStylesheet(allSites.engineFiles.reportStylesheet);
		allSitesIndex = new AllSitesIndex();
	}
		
	// Load shell template
	$.ajax({
		url: template,
		async: false,
		success: function(templateStr) {
			templateStr = replaceVars(templateStr, currentLocation);
			
			$("body").html(templateStr);
			$(document).ready(function() {
				if (currentStatus.shell) {
					view.init();
				}
				// Initialize nonshell behaviors
				initSite();
				controller.showLocation(locationId);
			});
		},
		error: function(){
			alert("Couldn't load template file " + template);
		}
	});

});

// CLASSES

///////////////////////
// ERROR-HANDLING CLASS
///////////////////////

// ErrorHandler
// Mangages error messages
function ErrorHandler() {
		function Update(messageStr) {
		
		this.message += constants.NL + messageStr;
		if (this.type == "none") {
			this.type = "nonfatal";
		}
		this.type = "fatal";
		
	}
		function Clear() {
		
		this.message = "";
		this.type = "none";
		
	}
		function Show() {
		
		if (this.type == "fatal") {
			alert(this.message);
		}
		if (this.type != "none") {
			throw(this.message);
		}
		this.clear;
		
	}
		this.message = "";
	// none, nonfatal, fatal
	this.type = "none";
		this.update = Update;
	this.clear = Clear;
	this.show = Show;
	}

////////////////////////
// DATA-MODELING CLASSES
////////////////////////

// Stores default data values applicable to all Web sites;
// most of these values are inherited by sites()
function AllSites() {
		function getArray(property, filter, values) {
		
		var itemsArray = [];
		
		// Check each site
		for (var i = 0; i < values.length; i ++) {
						
			// Filter
			switch(filter) {
				// All sites
				case "all":
					itemsArray.push(values[i][property]);
					break;
			}
		}
		
		return itemsArray;
	}
		function getProperties() {
		
		var propertiesArray = [];
		
		for (var property in this.values[0]) {
			propertiesArray.push(property);
		}
		
		return propertiesArray;
		
	}

	// Return siteObject with specified name
	function getSiteByIsbn(isbn) {
		for (var i = 0; i < this.values.length; i ++) {
			if (isbn == this.values[i].isbn) {
				return this.values[i];
			}
		}
	}
		// Get global location data
	function GetGlobalData() {
		
		globalData = {};
		
		for (var i = 0, propertyName = ""; i < this.siteObjectNames.length; i ++) {
			propertyName = this.siteObjectNames[i];
			globalData[propertyName] = {};
			copyToObject(this[propertyName], globalData[propertyName]);
		}
		
		return globalData;
		
	}

	// Add a new site or update existing one
	function addSite(isbn, dir) {
		
		var newValues;
		
		// If a site exists with this isbn, abort;
		// don't allow existing sites to be modified
		for (var i = 0; i < this.values.length; i ++) {
			if (isbn == this.values[i].isbn) {
				return;
			}
		}
		
		// Create site
		newValues = new siteObj(isbn, dir);
		this.values.push(newValues);
		
	}
		// Get array of ISBNs for all sites
	function getIsbns() {
		
		var isbns = [];
		
		for (var i = 0; i < this.values.length; i ++) {
			isbns.push(this.values[i].isbn);
		}
		
		return isbns;
		
	}

	// Get array of ISBNs for all sites
	function getDirs() {
		
		var dirs = [];
		
		for (var i = 0; i < this.values.length; i ++) {
			dirs.push(this.values[i].dir);
		}
		
		return dirs;
		
	}
		// PRIVATE METHODS
		// Data object for each object in siteValues
	function siteObj(isbn, dir) {
		this.isbn = isbn;
		this.dir = dir;
	}
		// Load templates that will be used for asset pages
	// and put their text in the returned object
	function getAssetTemplates() {
		
		var templatesObject = {};
		var url = "";
		
		for (var i = 0,
			 count = templateNames.length; i < count; i ++) {
			url = makePath([this.engineDirs.templates], templateNames[i] + ".html");
			$.ajax({
				url: url,
				async: false,
				success: function(data, textStatus){
					templatesObject[templateNames[i]] = data;
				},
				error: function(XMLHttpRequest, textStatus){
					alert("Couldn't load asset template file " + url);
					}
			});
		}
		
		return templatesObject;
		
	}
		
	// Asset types and their corresponding template filenames (minus extension)
	var templateNames = [
						 "index",
						 "video",
						 "video_playlist",
						 "audio",
						 "audio_playlist",
						 "vpg_ebook",
						 "cl_ebook",
						 "timeline",
						 "crossword",
						 "flash",
						 "google_earth",
						 "google_maps",
						 "itunes_playlist",
						 "author_blog",
						 "news_now",
						 "speak_up",
						 "download",
						 "flashcards_printable",
						 "coming_soon"
						];
		// PUBLIC PROPERTIES
						
	// Discipline name, number, subrand, and directory name
	this.disciplines = {
					Accounting : ["400", "South-Western", ""],
					Anthropology : ["15", "Wadsworth", ""],
					Art : ["37", "Wadsworth", ""],
					Astronomy : ["", "Brooks/Cole", ""],
					Biology : ["22", "Brooks/Cole", ""],
					Business : ["", "South-Western", ""],
					"Business Law" : ["404", "South-Western", "blaw"],
					Chemistry : ["12", "Brooks/Cole", ""],
					"College Success": ["26", "Wadsworth", "collegesuccess"],
					Communication : ["48", "Wadsworth", ""],
					Counseling : ["", "Brooks/Cole", ""],
					"Criminal Justice" : ["23", "Wadsworth", "criminaljustice"],
					"Decision Sciences" : ["412", "South-Western", "decisionsciences"],
					"Earth Science" : ["30", "Brooks/Cole", "earthscience"],
					Economics : ["413", "South-Western", ""],
					Education : ["3", "Wadsworth", ""],
					English : ["300", "Wadsworth", ""],
					Finance : ["414", "South-Western", ""],
					French : ["304", "Heinle", ""],
					Geology : ["", "Brooks/Cole", ""],
					German : ["305", "Heinle", ""],
					History : ["21", "Wadsworth", ""],
					Humanities : ["", "Wadsworth", ""],
					Italian : ["306", "Heinle", ""],
					Japanese : ["309", "Heinle", ""],
					Management : ["", "South-Western", ""],
					Marketing : ["415", "South-Western", ""],
					Mathematics : ["1", "Brooks/Cole", ""],
					Music : ["2", "Wadsworth", ""],
					Philosophy : ["2", "Wadsworth", ""],
					"Political Science" : ["20", "Wadsworth", "polisci"],
					Psychology : ["24", "Wadsworth", ""],
					Physics : ["", "Brooks/Cole", ""],
					"Social Work" : ["4", "Brooks/Cole", "social_work"],
					Sociology : ["14", "Wadsworth", ""],
					Spanish : ["303", "Heinle", ""],
					Statistics : ["17", "Brooks/Cole", ""],
					Testing : ["", "Wadsworth", ""],
					Theatre : ["51", "Wadsworth", ""]
					};
		
	// Lookup table for sub-brand to logo filename and home page
	this.subbrands = {
					  "Brooks/Cole" : ["brookscole_logo", "brookscole"],
					  Heinle : ["heinle_logo", "heinle"],
					  "South-Western" : ["soutWestern", "southwestern"],
					  Wadsworth : ["Wadsorth_logo", "wadsworth"]
					};
					
	this.ilrnHostname = "webquiz.ilrn.com";

	// List of objects that will be inherited by Sites class
	this.siteObjectNames = ["engineDirs",
								"engineFiles",
								"siteDirs",
								"siteFiles",
								"assetDirs",
								"assetFiles",
								"glossary",
								"labels"];
	// Directories needed by the Site Engine and normally shared by all sites
	this.engineDirs = {
								root: "",
								templates: "templates",
								js: "js",
								css: "css",
								images: "images",
								icons: "icons",	
								logos: "/images/header_logos",
								fae: "/flash/central_app"
								};
	this.engineFiles = {
								root: "",
								shellTemplate: "",
								stylesheet: "",
								reportStylesheet: "[%engineDirs.css%]/report.css",
								glossary: "[%engineDirs.js%]/glossary.js",
								login: "[%engineDirs.templates%]/login.html",
								login4ltr: "[%engineDirs.templates%]/4ltr/login.html",
								leftPanel: "[%engineDirs.templates%]/left_panel.html",
								siteDefinition: "site_definition.xml",
								jwPlayer: "/shared/jw_player/player.swf"
								};
	// Site-level directories
	this.siteDirs = {
								root: "",
								images: "images",
								content: "",
								"protected": "student",
								unprotected: "assets",
								courseware: "courseware",
								glossaryAudio: "glossary/audio/"
					};
	this.siteFiles = {
								root: "",
								stylesheet: "styles.css",
								standaloneStyles: "",
								// Site-specific files for 4LTR Press site
								stylesheet4ltr: "site.css",
								homePageImage: "[%siteDirs.images%]/home_page.jpg",
								homePageBaseFilename: "home",
								glossaryContent: "glossary/glossary_content.js",
								authentication: "[%siteDirs.protected%]/index.html",
								ssoUrls: "[%siteDirs.protected%]/sso_urls.jsp",
								ebookUrl: "",
								ebookDomain: "",
								instructorSite: "",
								survey: "http://cengage.qualtrics.com/SE?SID=SV_0GwLkyEppF8MqI4&SVID=Prod",
								buyOnline: "http://www.cengagebrain.com/tl1/en/US/storefront/ichapters?cmd=catProductDetail&ISBN="
								};
	// Asset-level directories
	this.assetDirs = {
								root: "",
								downloads: "",
								media: "",
								captions: "",
								transcripts: "",
								faeData: "data"
								};
	this.assetFiles = {
								root: ""
								};
	// Glossary settings
	this.glossary = {
								audio: false,
								chapterTitles: false
								};
								
	// Labels used for interface elements, such as Select Chapter,
	// and content messages (such as "Content not available for this Chapter")
	this.labels = {				chapterSingular: "Chapter",
								chapterPlural: "Chapters",
								resourceGroupSingular: "Course",
								resourceGroupPlural: "Courses"
								};
		// Replace variables in file and directory strings
	for (var i = 0, siteObject = {}; i < this.siteObjectNames.length; i ++) {
		siteObject = this[this.siteObjectNames[i]];
		for (var name in siteObject) {
			siteObject[name] = replaceVars(siteObject[name], this);
		}
	}

	// Checks whether page is SSO login screen
	this.loginPattern = /name\="loginForm".+?\/sso\/dologin.do/i;
	// Page returned on d-college for 404
	this.notFoundPattern = /<title>Cengage Learning \- Learning solutions, training and educational publishing<\/title>/;
		// Data values
	this.values = [];
	// Value can be all or menu; limits listing of names or titles
	// to only sites in those categories
	this.filter = "all";
	// Content of asset templates
	// (call() specifies object to be treated as "this" within funciton)
	this.templates = getAssetTemplates.call(this);
		// PUBLIC METHODS
		
	// Return array of properties of site object
	this.properties = getProperties;
	// Takes name as parameter and returns siteObject
	this.get = getSiteByIsbn;
	// Get common data for all sites
	this.getGlobalData = GetGlobalData;
	// Add new site
	this.add = addSite;
	// Return array of ISBNs of all sites
	this.isbns = getIsbns;
	// Return array of all site directories
	this.dirs = getDirs;
		
	}

// General data for the site
function Site() {

	var currentSite = {};
		// PUBLIC PROPERTIES
		// Possible types are: premium, 4ltr, and resource_center
	this.type = "";
	this.chapterTitles = [];
	this.chapterCount = 0;
	this.demoChapters = [];
	// True if :demo parameter forces free chapters to be used as demo chapters
	this.forceDemo = false;
	this.chaptersFree = [];
	this.startChapterNumber = 1;
	this.firstChapter = "";
	this.lastChapter = "";
	this.showHeading = false;
	this.showChapterNumbers = true;
	this.menuStyle = "normal";
	this.unavailableMenuOptions = "show";
		this.discipline = "";
	// Core Text ISBN
	this.isbnCore = "";
	// SSO ISBN
	this.isbn = "";
	// CL eBook ISBN
	this.ebookIsbn = "";
	this.showBook = "";
	this.title = "";
	this.subtitle = "";
	this.bookId = "";
	this.author = "";
	this.authorShort = "";
	this.editionNumber = "";
	this.editionType = "";
	this.edition = "";
	this.bookcoverImage = "";
	// This is used to store original margin value,
	// if margin for page is changed via Site Definition
	this.assetMargin = "";
		// PUBLIC METHODS
		// Get global data from allSites class
	function GetAllSitesData() {
		
		// Get global site data from allSites class
		copyToObject(allSites.getGlobalData(), this);
		
		// Get data for this site from global sites definition
		currentSiteData = allSites.get(currentLocation.isbn);
		// Update ISBN
		this.isbn = currentSiteData.isbn;
		// Update root dirs
		this.siteDirs.root = currentSiteData.dir;
		this.siteFiles.root = this.siteDirs.root;
		
		this.defaultIframeHeight = allSites.defaultIframeHeight;
		
	}
		
	// Update calculated chapter values if new data is loaded from a Resource Center
	// Resource Group
	function updateSiteData() {
		
		var ordinals = ["1st",
						"2nd",
						"3rd",
						"4th",
						"5th",
						"6th",
						"7th",
						"8th",
						"9th",
						"10th",
						"11th",
						"12th",
						"13th",
						"14th",
						"15th",
						"16th",
						"17th",
						"18th",
						"19th",
						"20th"];
		
		// Add ISBN to Buy Online URL
		// this.siteFiles.buyOnline += this.isbnCore;
		
		// Convert dots to empty strings; these indicate that the directory
		// is the same as its parent.
		// Add root directories to all directory and file values
		// that are relative to site
		for (var i = 0,
			 objName = "",
			 url = "",
			 urlType = "";
			 i < allSites.siteObjectNames.length;
			 i ++) {
			
			objName = allSites.siteObjectNames[i];
			for (var name in this[objName]) {
				url = this[objName][name];
				urlType = getUrlType(url);
				if (url == ".") {
					url = "";
				}
				if (name != "root" && this[objName][name] && (urlType == "relative to site" || urlType == "none")) {
					this[objName][name] = makePath([this[objName].root], url);
				}
			}
			
		}

		// Default site type
		if (!this.type) {
			this.type = "premium";
		}
		// Set file locations and names depending on site type
		this.engineFiles.shellTemplate = "shell_" + this.type + ".html";
		this.engineFiles.stylesheet = makePath([this.engineDirs.css], this.type + ".css");
		// Icons
		if (site.type == "resource_center") {
			if (this.engineDirs.icons.indexOf("premium") == -1)
			{this.engineDirs.icons = makePath([this.engineDirs.icons], "premium");}
		} else {
			this.engineDirs.icons = makePath([this.engineDirs.icons], this.type);
		}
		
		if (this.editionType) {
			this.edition += this.editionType + " ";
		}
		this.edition = ordinals[parseInt(this.editionNumber, 10) - 1] + " Edition";
		
		this.chapterCount = this.chapterTitles.length;
		
		this.updateChaptersFree();
		
		// If demo parameter, use free sample chapters as demo chapters
		if (this.demoChapters.length === 0) {
			if (currentLocation.parameter == "demo") {
				this.demoChapters = this.demoChapters.concat(this.chaptersFree);
				this.forceDemo = true;
			}
		}
		// Get first and last active chapters
		if (this.demoChapters.length > 0) {
			this.firstChapter = this.demoChapters[0];
			this.lastChapter = this.demoChapters[this.demoChapters.length - 1];
		} else {
			this.firstChapter = this.startChapterNumber.toString();
			this.lastChapter = (this.startChapterNumber - 1 + this.chapterCount).toString();
		
		}
		
	}
		
	// Get the free sample chapter(s) for the site by retrieving sample chapters
	// from each asset
	function updateSampleChapters() {
		
		var chaptersArray = [];
		var assetNames = assets.names();
		
		if (this.chaptersFree.length > 0) {
			return;
		}
		
		for (var assetInd = 0, count = assetNames.length; assetInd < count; assetInd ++) {
			chaptersArray = assets.get(assetNames[assetInd]).chaptersFree;
			for (var ChapterInd = 0, chapterNum = ""; ChapterInd < chaptersArray.length; ChapterInd ++) {
				chapterNum = chaptersArray[ChapterInd];
				if ($.inArray(chapterNum, this.chaptersFree) == -1) {
					this.chaptersFree.push(chapterNum);
				}
			}
		}
		this.chaptersFree.sort(numerical);
		
	}
		// Make Location Id from name and/or chapter
	function MakeLocationId(name, chapter) {
		

		var locationId = "";
		
		if (site.type == "resource_center") {
			locationId += "/";
		}
		locationId += "/" + name;
		if (chapter) {
			locationId += "/" + chapter;
		}
		
		return locationId;
		
	}
		this.getAllSitesData = GetAllSitesData;
	// Update values if new data is loaded for Resource Center
	this.update = updateSiteData;
	// Get sample chapters specified for assets
	this.updateChaptersFree = updateSampleChapters;
	// Return Location ID when passed name or chapter
	this.makeLocationId = MakeLocationId;
		

}

// Defines buckets in the site; a bucket contains multiple assets.
// A bucket will appear as a menu option, and its assetes will appear
// in tabs in the content area.
function Buckets() {
		// PUBLIC PROPERTIES
		// Data object for each object in bucketValues
	function BucketObj(bucketValues) {
				
		this.name = "";
		this.title = "";
		this.blurbShort = "";
		this.blurbLong = "";
		this.icon = "";
		this["interface"] = "";
		// Assets
		this.assets = [];
		
		// Don't update values of no values are passed
		if (typeof bucketValues == "undefined") {
			return;
		}
		
		// Add each property
		for (var name in bucketValues) {
			// If property is not passed as a parameter, set it to ""
			if (typeof bucketValues[name] == "undefined") {
				this[name] = "";
			// Otherwise set property from passed parameter
			} else {
				this[name] = bucketValues[name];
			}
		}

		
		// Set interface type if not passed as parameter;
		// premium assets are buttons; others are menu
		if (!this["interface"]) {
			if (this.name == "navBar") {
				this["interface"] = "navBar";
			} else {
				this["interface"] = "menu";
			}
		}
		
	}
		// Create asset object
	function Bucket() {
		
		return new BucketObj();
		
	}
		// Methods for getting names and titles
	function getNames(filterValue) {
		// Use current filter if temporary filter value isn't passed
		if (arguments.length === 0) {
			filterValue = this.filter;
		}
		return getArray("name", filterValue, this.values);
	}
	function getTitles(filterValue) {
		if (arguments.length === 0) {
			filterValue = this.filter;
		}
		return getArray("title", filterValue, this.values);
	}
		function getArray(property, filter, values) {
		
		var itemsArray = new Array();
		
		// Check each bucket
		for (var i = 0; i < values.length; i ++) {
						
			// Filter
			switch(filter) {
				// All buckets
				case "all":
					itemsArray.push(values[i][property]);
					break;
				// Buckets listed in menu
				case "navBar":
					if (values[i].interface == "navBar") {
						itemsArray.push(values[i][property]);
					}
					break;
				// Buckets listed in menu
				case "menu":
					if (values[i].interface == "menu") {
						itemsArray.push(values[i][property]);
					}
					break;
			}
		}
		
		return itemsArray;
	}
		function getProperties() {
		
		var propertiesArray = new Array();
		
		for (var property in this.values[0]) {
			propertiesArray.push(property);
		}
		
		return propertiesArray;
		
	}

	// Return bucketObject with specified name
	function getBucket(name) {
		for (var i = 0; i < this.values.length; i ++) {
			if (name == this.values[i].name) {
				return this.values[i];
				break;
			}
		}
	}

	// Return bucketObject with specified name
	function getBucketByTitle(title) {
		for (var i = 0; i < this.values.length; i ++) {
			if (title == this.values[i].title) {
				return this.values[i];
				break;
			}
		}
	}
		function getBucketIndex(name, interface) {
		
		var ind = null;
		var names = this.names("menu");
		
		for (var i = 0; i < names.length; i ++) {
			if (names[i] == name) {
				ind = i;
			}
		}
		
		return ind;
		
	}
		// Add a new bucket or update existing one
	function addBucket(bucketValues) {
		
		var newValues;
		
		// Create bucket
		newValues = new BucketObj(bucketValues);
		this.values.push(newValues);
		
	}
		// Create values that must be created after asset content is loaded
	function updateBuckets() {
		
		var assetsInBucket = [];
		
		// Create array of names of assets in bucket
		// Each bucket
		for (var bucketInd = 0,
			bucketCount = this.values.length,
			bucketName = ""; bucketInd < bucketCount; bucketInd ++) {
			bucketName = this.values[bucketInd].name;
			assetsInBucket = assets.getByBucket(bucketName);
			// Add each asset that's in bucket
			for (var assetInd = 0,
				assetCount = assetsInBucket.length,
				assetName = ""; assetInd < assetCount; assetInd ++) {
				assetName = assetsInBucket[assetInd].name;
				this.values[bucketInd].assets.push(assetName);
			}
		}
		
	}
		// Data values
	this.values = [];
	// Value can be all or menu; limits listing of names or titles
	// to only buckets in those categories
	this.filter = "all";
		// PUBLIC METHODS
		this.bucketObj = Bucket;
	// Return array of names or titles, filtered by filterValue
	this.names = getNames;
	this.titles = getTitles;
	// Return array of properties of bucket object
	this.properties = getProperties;
	// Takes name as parameter and returns bucketObject
	this.get = getBucket;
	// Takes title as parameter and returns bucketObject
	this.getByTitle = getBucketByTitle;
	// Get index of bucket from name
	this.getIndex = getBucketIndex;
	// Add new bucket
	this.add = addBucket;
	// Update class with info that cannot be added at instantiation
	this.update = updateBuckets;
		// Add bucket called "_none" that is assigned to all assets not in a bucket
	this.values.push(new BucketObj({name: "_none",
								   "interface": "menu"}));
	// Create navBar bucket
	this.values.push(new BucketObj({name: "navBar",
								   title: "Top Navigation Bar"}));
		
		
	}

// Defines assets for the site
function Assets() {
		this.values = [];
	// Value can be all or menu; limits listing of names or titles
	// to only assets in those categories
	this.filter = "all";
		// PUBLIC METHODS
		// Return asset object
	this.assetObj = Asset;
	// Return section object
	this.sectionObj = Section;
	// Return array of names or titles, filtered by filterValue
	this.names = getNames;
	this.titles = getTitles;
	// Return array of property names of asset object
	this.properties = getProperties;
	// Takes name as parameter and returns assetObject
	this.get = getAsset;
	// Takes title as parameter and returns assetObject
	this.getByTitle = getAssetByTitle;
	// Takes bucket as parameter and returns array of assetObjects
	// in that bucket
	this.getByBucket = getAssetsByBucket;
	// Get index of asset from name
	this.getIndex = getAssetIndex;
	// Get index of asset within bucket
	this.getBucketIndex = getIndexInBucket;
	// Add new asset
	this.add = addAsset;

	// Data object for each object in Assets.values;
	// argument is an array of property values.
	// siteParent is either window or a resourceGroup;
	// this determines which instantiation of site
	// is used to get the default values for the asset
	function AssetObj(assetValues, siteParent) {
		
		var chapterCount = 0;
		
		this.name = "";
		this.title = "";
		this["interface"] = "";
		this.bucket = "";
		this.type = "";
		this.scope = "";
		this.blurb = "";
		// <bucket title>: <asset title>
		this.heading = "";
		this.showHeading = false;
		this.instructions = "";
		this.protected = false;
		this.standaloneProtected = true;
		// Unprotected courseware directory used for courses
		this.courseware = false;
		this.url = "";
		this.dir = "";
		this.template = "";
		this.chaptersFree = [];
		this.chaptersUnavailable = [];
		this.iframeHeight = "";
		this.menuTabLabel = "Menu";
		this.contentTabLabel = "Content";
		// Link text for launch page templates
		this.linkTitle = "";
		// Icon for links in Download Template
		this.linkBullet = "";
		// For menu
		this.icon = "";
		this.linkStyle = "";
		this.windowWidth = "";
		this.windowHeight = "";
		this.playerWidth = "";
		this.playerHeight = "";
		this.margin = "";
		this.sectionsFile = "";
		this.sectionsUrl = "";
		this.sections = [];
		this.mediaOptions = {
								videoWidth: "",
								videoHeight: "",
								downloadMedia: true,
								downloadMediaExt: "zip",
								downloadMediaLabel: "",
								viewTranscript: false,
								downloadTranscript: false,
								downloadTranscriptExt: "doc",
								streamer: ""
							}
		
		this.chaptersAvailable = [];
		this.behavior = "";
				
		// Don't update values if no values are passed
		if (typeof assetValues == "undefined" && typeof siteParent == "undefined") {
			return;
		}

		// Get default value from Site class
		this.showHeading = siteParent.site.showHeading;

		// Add each property
		for (var name in assetValues) {
			// If property is not passed as a parameter, set it to ""
			if (typeof assetValues[name] == "undefined") {
				this[name] = "";
			// Otherwise set property from passed parameter
			} else {
				this[name] = assetValues[name];
			}
		}
		
		// For backward compatibility with deprecated elements
		switch (this.template) {
			case "ebook":
				this.template = "vpg_ebook";
				break;
			case "4ltr/flashcards":
				this.template = "flashcards_printable";
				break;
			case "4ltr/download":
				this.template = "download";
				this.linkTitle = "Access Resource";
		}
		
			
		// If there's no bucket, set bucket to "_none"
		if (!this.bucket) {
			this.bucket = "_none";
		}
		
		// Heading
		if (this.bucket != "_none") {
			this.heading += buckets.get(this.bucket).title + ": ";
		}
		this.heading += this.title;
		
		// For Flash template create default linkTitle if necessary
		if ((this.template == "flash" || this.template == "download") && !this.linkTitle) {
			this.linkTitle = "Access the " +  this.title + " for This Chapter";
		}
		
		// Check URL, and if it's the ILRN hostname,
		// set assettype to ilrn; otherwise get type from passed object
		if (getHostname(this.url) == allSites.ilrnHostname) {
			this.assetType = "ilrn";
		} else {
			this.assetType = assetValues.type;
		}
		// Remove .type after it is replaced by .assetType
		delete this.type;
		
		// Popup or embedded
		if (buckets.get(this.bucket).interface == "menu") {
			this.behavior = "embedded";
		} else {
			this.behavior = "popup";
		}
		
		// URL where sections XML file is stored
		if (this.sectionsFile) {
			this.sectionsUrl = makePath([siteParent.site.siteDirs.root], this.sectionsFile);
		}
		
		// Default for mediaDownloadLabel
		if (!this.mediaOptions.downloadMediaLabel) {
			if (this.type == "video") {
				this.mediaOptions.downloadMediaLabel = "Zipped MP4";
			} else if (this.type == "audio") {
				this.mediaOptions.downloadMediaLabel = "Zipped MP3";
			}
		}
		
		// Chapters for which this asset is available
		if (siteParent.site.demoChapters.length > 0) {
			chapterCount = siteParent.site.demoChapters.length;
		} else {
			chapterCount = siteParent.site.chapterTitles.length;
		}
		// Each chapter or demo chapter
		for (var i = 0,
			 chapterNum = 0; i < chapterCount; i ++) {
			// If there are demo chapters
			if (siteParent.site.demoChapters.length > 0) {
				chapterNum = siteParent.site.demoChapters[i];
			} else {
				chapterNum = (i + siteParent.site.startChapterNumber).toString();
			}
			// Record available chapters
			if ($.inArray(chapterNum, this.chaptersUnavailable) == -1) {
				this.chaptersAvailable.push(chapterNum);
			}
		}
		
	}
		// Create asset object
	function Asset() {
		
		return new AssetObj();
		
	}
		// Create section object
	function Section() {
		
		return {
				chapter: "",
				url: "",
				name: "",
				title: ""
				}
		
	};
		// Methods for getting names and titles
	function getNames(filterValue) {
		// Use current filter if temporary filter value isn't passed
		if (arguments.length === 0) {
			filterValue = this.filter;
		}
		return getArray("name", filterValue, this.values);
	}
		function getTitles(filterValue) {
		if (arguments.length === 0) {
			filterValue = this.filter;
		}
		return getArray("title", filterValue, this.values);
	}
		// Get array of names for getNames or getTitles
	function getArray(property, filter, values) {
		
		var itemsArray = new Array();
		
		// Check each asset
		for (var i = 0; i < values.length; i ++) {
						
			// Filter
			switch(filter) {
				// All assets
				case "all":
					itemsArray.push(values[i][property]);
					break;
				// If asset is in a bucket with navBar interface
				case "navBar":
					if (buckets.get(values[i].bucket).interface == "navBar") {
						itemsArray.push(values[i][property]);
					}
					break;
				// If asset is not in a bucket with navBar interface
				// it will be included in the menu
				case "menu":
					if (buckets.get(values[i].bucket).interface != "navBar") {
						itemsArray.push(values[i][property]);
					}
					break;
			}
		}
		
		return itemsArray;
	}
		function getProperties() {
		
		var propertiesArray = new Array();
		
		for (var property in this.values[0]) {
			propertiesArray.push(property);
		}
		
		return propertiesArray;
		
	}

	// Return assetObject with specified name
	function getAsset(name) {
		for (var i = 0; i < this.values.length; i ++) {
			if (name == this.values[i].name) {
				return this.values[i];
				break;
			}
		}
	}

	// Return assetObject with specified name
	function getAssetByTitle(title) {
		for (var i = 0; i < this.values.length; i ++) {
			if (title == this.values[i].title) {
				return this.values[i];
				break;
			}
		}
	}
		// Return array of assetObjects in specified bucket
	function getAssetsByBucket(bucketName) {
		for (var i = 0, assetsInBucket = []; i < this.values.length; i ++) {
			if (bucketName == this.values[i].bucket) {
				assetsInBucket.push(this.values[i])
			}
		}
		return assetsInBucket;
	}
		function getAssetIndex(name, interface) {
		
		var ind = null;
		var names = this.names("menu");
		
		for (var i = 0; i < names.length; i ++) {
			if (names[i] == name) {
				ind = i;
			}
		}
		
		return ind;
		
	}
		// Get index of asset within its bucket; -1 if not in a bucket
	function getIndexInBucket(name) {
		
		var bucketName = this.get(name).bucket;
		var bucketInd = -1;
		var assetsInBucket = this.getByBucket(bucketName);
		
		for (var i = 0,
			 count = assetsInBucket.length;
			 i < count; i ++) {
			if (name == assetsInBucket[i].name) {
				bucketInd = i
				break;
			}
		}
		
		return bucketInd;
		
	}
		// Add a new asset;
	// argument is asset object
	function addAsset(assetValues, siteParent) {
		
		var newValues;
		
		// Create asset
		newValues = new AssetObj(assetValues, siteParent);
		this.values.push(newValues);
	}
	}

// Defines Resource Groups for a Resource Center.
// A resorce group may be a course or a book.
// When a Resource Group is selected its content is loaded
// into Assets, Buckets, and Site
function ResourceCenter() {
		// Properties
		this.values = [];
	// Specifies that methods will select all names or titles;
	// alternatives haven't been implemented in this class
	this.filter = "all";
	this.count = 0;
		// Methods
		// Create a new resourceGroup object
	this.resourceGroup = ResourceGroup;
	// Return array of names or titles of Resource Groups, filtered by filterValue
	this.names = getNames;
	this.titles = getTitles;
	this.get = getGroup;
	this.getByIndex = GetByIndex;
	this.load = loadGroup;
	this.add = addResourceGroup;
	this.updateGlossary = UpdateGlossary;
	// Get index of resourceGroup from name
	this.getIndex = getResourceIndex;
	    // Resource Center course or book, should be built from template, which is the "root" site info
	// add assets property
    function ResourceGroup(resourceValues) {
		
		var resourceGroup = {};
		
		if (typeof resourceValues != "undefined") {
			resourceGroup = resourceValues
		}
		resourceGroup.site = $.extend(true, {}, site);
		resourceGroup.assets = new Assets();
		resourceGroup.buckets = new Buckets();
		resourceGroup.name = "";
		resourceGroup.icon = "";
		resourceGroup.glossaryContent = [];
		
		return resourceGroup;
		
    }
		// Methods for getting names and titles
	function getNames(filterValue) {
		// Use current filter if temporary filter value isn't passed
		if (arguments.length === 0) {
			filterValue = this.filter;
		}
		return getArray("name", filterValue, this.values);
	}
		function getTitles(filterValue) {
		if (arguments.length === 0) {
			filterValue = this.filter;
		}
		return getArray("title", filterValue, this.values);
	}

	// Return resourceGroup with specified name
	function getGroup(name) {
		for (var i = 0; i < this.values.length; i ++) {
			if (name == this.values[i].name) {
				return this.values[i];
				break;
			}
		}
	}
		function GetByIndex(ind) {
		
		return this.values[ind];
		
	}

	// Get array of names for getNames or getTitles
	function getArray(property, filter, values) {
		
		var itemsArray = new Array();
		
		// Check each asset
		for (var i = 0; i < values.length; i ++) {
						
			// Filter
			switch(filter) {
				// All assets
				case "all":
					itemsArray.push(values[i][property]);
					break;
			}
		}
		
		return itemsArray;
	}
		// Load values for specified Resource Group into active portion
	// of the Data Model
	function loadGroup(groupName) {
		
		var titlesArray = [];
		
		// Copy values for Resource Group into active classes
		site = $.extend(site, this.get(groupName).site);
		site.update();
		assets = $.extend(true, assets, this.get(groupName).assets);
		buckets = $.extend(true, buckets, this.get(groupName).buckets);
		glossary.content = this.get(groupName).glossaryContent;
		
	}
		// Add a new asset;
	// argument is asset object
	function addResourceGroup(resourceValues) {
		
        this.values.push(resourceValues);
		this.count = this.values.length;
		// Update values in site that depend upon other classes
		// already being initialized
		this.values[this.count - 1].site.update();

	}
		// Add glossary content to existing Resource Group.
	// This is called by glossary.js
	function UpdateGlossary(index, glossaryArray) {
		
		this.values[index].glossaryContent = this.values[index].glossaryContent.concat(glossaryArray);
		
	}

	// Get index of Resource Group
	function getResourceIndex(name) {
		
		var ind = null;
		var names = this.names();
		
		for (var i = 0; i < names.length; i ++) {
			if (names[i] == name) {
				ind = i;
			}
		}
		
		return ind;
		
	}
	}

// Holds global state information, such as current chapter
function Status() {
		var browserName = "";
		// PUBLIC PROPERTIES
		// Whether content should be displayed in site shell;
	// true | false
	this.shell;
	// Whether popup chapter menu is being displayed
	this.chapterMenu = 0;
	// Number of current chapter; if viewing a book asset,
	// this value holds the last chapter that was viewed
	this.chapter = "";
	// Chapter viewed previously
	this.previousChapter = "";
	// Has the chapter changed
	this.isNewChapter = false;
	// "single" | "all"
	this.chapterView = "single";
	// Determines which Side Menu is active; there may be multiple Side Menus
	// in a Resource Center
	this.sideMenuInd = 0;
	// Name of last asset accessed
	this.asset = "";
	// Name of last Resource Group accessed
	this.resourceGroup = "";
	this.previousResourceGroup= "";
	this.isNewResourceGroup = false;
	// Browser being used
	this.browser = "";
	// Array specifying whether a tab has the correct content loaded into it
	// true | false
	this.tabLoaded = [];
	// Name of bucket if there is content in the bucket tabs
	this.tabContent = "";
	// Whether or not user is athenticated
	this.authenticated = false;
	// Token returned by JSP file
	this.token = "";
	this.hostname = window.location.hostname;
	// Server from which Site Engine is being run
	this.server = "";
		$.each($.browser, function(name, isTrue) {
		if (isTrue) {
			browserName = name;
		}
	});
		this.browser = browserName;
		switch(this.hostname) {
		
		case "coldevss2":
			this.server = "development_1";
			break;
		case "d-college.cengage.com":
			this.server = "development_2";
			break;
		case "s-college.cengage.com":
			this.server = "staging";
			break;
		case "college.cengage.com":
			this.server = "production";
			break;
		
	}
		// PUBLIC METHODS
		// Set loaded status of all tabs to false
	this.resetTabStatus = ResetTabStatus;
	// Set current chapter and and tab status
	this.update = Update;
	// Update chapterView setting
	this.updateChapterView = UpdateChapterView;
	// Check whether user has been authenticated by SSO
	this.checkAuthentication = CheckAuthentication;
		// Functions for Public Methods
		function ResetTabStatus() {
		
		for (var i = 0, count = this.tabLoaded.length; i < count; i ++) {
			this.tabLoaded[i] = false;
		}
		
	}
		function Update() {
		
		if (currentLocation.type == "asset") {
			this.asset = currentLocation.name;
		}
		
		if (site.type == "resource_center") {
			this.resourceGroup = currentLocation.resourceGroup;
			if (this.resourceGroup != this.previousResourceGroup) {
				this.isNewResourceGroup = true;
			} else {
				this.isNewResourceGroup = false;
			}
			this.previousResourceGroup = this.resourceGroup;
			// Reset chapter and asset when Resource Group changes
			if (this.isNewResourceGroup) {
				this.chapter = "";
				this.asset = "";
			}
		}
		
		if (currentLocation.chapter) {
			this.chapter = currentLocation.chapter;
		}
		// Reset chapter and tab status if chapter has changed
		if (this.chapter != this.previousChapter) {
			this.isNewChapter = true;
			this.resetTabStatus();
		} else {
			this.isNewChapter = false;
		}
		this.previousChapter = this.chapter;
		
	}
		function UpdateChapterView(viewValue) {
		
		// Reset tab status if chapter view has changed
		if (this.chapterView != viewValue) {
			this.chapterView = viewValue;
			this.resetTabStatus();
		}
		
	}
		// Tries to access a file in the protected folder to determine
	// whether the user has been authenticated
	function CheckAuthentication() {
		
		var checkStatus = false;
		var checkStr = "<!-- AUTHENTICATION CHECK - DO NOT REMOVE OR ALTER THIS COMMENT -->";
		
		$.ajax({
			url: site.siteFiles.authentication,
			async: false,
			success: function(data){
				if (data.indexOf(checkStr) != -1) {
					checkStatus = true;
				}
			}
		})
		
		this.authenticated = checkStatus;
		
	}
	}

// Stores info about a content location; updated every time a location changes
//
// classType parameter is "current" or "temp";
// if "current," data for popup pages
// is stored in .popupLocation; otherwise it's stored
// in the primary class properties
function ContentLocation(classType) {
		copyToObject(new LocationObj(), this);
		// PUBLIC PROPERTIES
		// For storing properties for popup page
	this.popupLocation = new LocationObj();
	this.classType = classType;

	// Object for structuring data for this class
	function LocationObj() {
		
		// Properties
		this.isbn = "";
		this.parameter = "";
		// home | bucket | asset | resource group
		this.type = "";
		// embedded | popup
		this.behavior = "";
		this.name = "";
		this.title = "";
		this.menuName = "";
		this.bucket = "";
		this.bucketInd = 0;
		this.assetType = "";
		this.chapter = "";
		this.chapterTitle = "";
		this.resourceGroup = "";
		this.id = "";
		this.template = "";
		this.templateStr = "";
		this.playlist = false;
		// If asset as a whole is protected
		this.assetProtected = false;
		// Is content available for this chapter
		this.available = true;
		this.extension = "";
		this.urlNoExtension = "";
		// Used to open help file accordion to correct position based on content type on referring page
		this.helpLink = "";
		
	}
		// PUBLIC METHODS
		this.update = Update;
		// Get properties from locationId
	function Update(urlStr, interfaceComponent) {
		
		// For holding location values before they are assigned
		// to the parent object (for embedded pages) or the popup object
		// (for popup pages)
		var locationObj = new LocationObj();
		var trackerData = {};
		var fileNum = "";
		var segments = [];
		var matchArray = [];
		var assetsInBucket = [];
		var resolvedName = "";
		var assetObj = {}
		var assetDir = "";
		var properties = ["name", "chapter"];
		// Extract string following the hash character
		var locationId = getLocationId(urlStr);
		// This value is returned to indicate whether the page
		// should be embedded
		var pageBehavior = "";
		var helpPanelNum = "";
		
		// Get parameter
		if ((matchArray = locationId.match(/^([^\:]+)\:([^\:]+)$/)) != null) {
			locationObj.parameter = matchArray[2];
			locationId = matchArray[1];
		}
		
		// Get isbn; if there's no isbn in locationId, it will stay the same;
		// remove isbn from locationId
		if ((matchArray = locationId.match(/^((?:\d{9}[\dxX]|\d{13})(?:_demo)?)(\/(.*))?/)) != null) {
			locationObj.isbn = matchArray[1];
			locationId = matchArray[2];
			// If Firefox returns "undefined" here
			if (!locationId) {
				locationId = "";
			}
		// If ISBN is in not in Location ID, get it from site
		} else if (site.isbn) {
			locationObj.isbn = site.isbn;
		// If there's no ISBN, show index for all sites
		} else {
			locationObj.isbn = "";
			locationObj.type = "all sites";
		}

		// Get Resource Group (if Resource Center), Asset Name, and Chapter
		if ((matchArray = locationId.match(/\/([^\/]+)?/g)) != null) {
			for (var i = 0; i < matchArray.length; i ++) {
				matchArray[i] = matchArray[i].replace("/", "");
			}
			// Premium Site
			if (site.type != "resource_center") {
				// Asset Name
				if (matchArray[0]) {
					locationObj.name = matchArray[0];
				}
				// Chapter
				if (matchArray[1]) {
					locationObj.chapter = matchArray[1];
				}
			// Resource Center
			} else {
				// Resource Group
				if (matchArray[0]) {
					locationObj.resourceGroup = matchArray[0];
				}
				// Asset Name
				if (matchArray[1]) {
					locationObj.name = matchArray[1];
				}
				// Chapter
				if (matchArray[2]) {
					locationObj.chapter = matchArray[2];
				}
			}
		}
				
		// Shell
		
		// If shell status hasn't already been set
		if (!currentStatus.shell) {
			// Whether to use site shell
			if (locationObj.parameter == "shell"
				|| locationObj.parameter == "demo"
				|| site.forceDemo == true
				|| locationObj.name == "home"
				|| (!locationId && locationObj.isbn)) {
				currentStatus.shell = true;
			} else {
				currentStatus.shell = false;
			}
		}
		
		// If asset data has been loaded
		if (assets.names().length > 0) {
			
			// Load Resource Group data
			if (site.type == "resource_center" && locationObj.resourceGroup) {
				resourceCenter.load(locationObj.resourceGroup);
			}
				// Default values for missing elements of Location ID;
			// these will depend on which part of interface is calling

			// the function
			
			// If asset not specified
			if (locationObj.chapter && !locationObj.name) {
				// For selection from Chapter Menu, use current asset
				if (interfaceComponent == "chapterMenu"
					|| interfaceComponent == "resourceGroupSubmenu") {
					// If there's a current asset
					if (currentStatus.asset) {
						locationObj.name = currentStatus.asset;
					// Otherwise use first asset in menu
					} else {
						locationObj.name = getFirstAsset(locationObj.chapter);
					}
					locationObj.type = "asset";
				}
			}
			// Resource Group not specified
			if (site.type == "resource_center"
					   && locationObj.name
					   && !locationObj.resourceGroup) {
				locationObj.resourceGroup = currentStatus.resourceGroup;
			}
			
			// Get type (and create name if necessary)
			// Report
			if (locationObj.parameter == "report") {
				locationObj.type = "report";
			// Resource Group
			} else if (locationObj.resourceGroup && !locationObj.name) {
				locationObj.type = "resource group";
			// Home Page
			} else if (!locationId || locationObj.name == "home") {
				locationObj.name = "home";
				locationObj.title = "Home Page";
				locationObj.type = "home";
				locationObj.scope = "book";
			// Asset
			} else if (getContentType(locationObj.name) == "asset") {
				locationObj.type = "asset";
			// Bucket
			} else if (getContentType(locationObj.name) == "bucket") {
				locationObj.type = "bucket";
			// Name needs to be paresed as a title and resolved to a name
			} else {
				resolvedName = parseVerboseIdName(locationObj.name);
				if (resolvedName) {
					locationObj.name = resolvedName;
					locationObj.type = "asset";
				} else {
					locationObj.type = "error";
				}
			}
			
			// If not home page and no chapter specified, use current chapter
			if ((locationObj.type == "asset" || locationObj.type == "bucket") && !locationObj.chapter) {
				if (currentStatus.chapter) {
					locationObj.chapter = currentStatus.chapter;
				} else {
					locationObj.chapter = site.firstChapter;
				}
			}

			// If Location ID is a bucket, change it to the first available asset in the bucket
			if (locationObj.type == "bucket") {
				locationObj.bucket = locationObj.name;
				locationObj.menuName = locationObj.bucket;
				locationObj.bucketInd = 0;
				locationObj.type = "asset";
				// If no chapter specified, use first asset
				if (!locationObj.chapter) {
					locationObj.name = buckets.get(locationObj.bucket).assets[0];
				// Otherwise, use first asset available for chapter
				} else {
					for (var i = 0,
						 assetsInBucket = buckets.get(locationObj.bucket).assets,
						 count = assetsInBucket.length; i < count; i ++) {
						if ($.inArray(locationObj.chapter, assets.get(assetsInBucket[i]).chaptersUnavailable) == -1) {
							locationObj.name = assetsInBucket[i];
							break;
						}
					}
				}
			}

			// Asset properties
			
			if (locationObj.type == "asset") {
				
				// Copy properties from asset to locationObj
				copyToObject(assets.get(locationObj.name), locationObj);
				
				// If menu is set to hide unavailable assets, and unavailable asset is selected,
				// display current asset instead
				if ((site.unavailableMenuOptions == "hide" || site.unavailableMenuOptions == "gray") && (!locationObj.bucket || locationObj.bucket == "_none")) {
					if ($.inArray(locationObj.chapter, assets.get(locationObj.name).chaptersUnavailable) != -1) {
						locationObj.name = getFirstAsset(locationObj.chapter);
						copyToObject(assets.get(locationObj.name), locationObj);
					}
				}
				
				// Chapter
				
				if (locationObj.scope == "book") {
					locationObj.chapter = "";
				}
				// Chapter title
				locationObj.chapterTitle = getChapterTitle(locationObj.chapter);
				
				// Available
				if (locationObj.scope == "chapter") {
					// If chapter is in chaptersUnavailable
					if ($.inArray(locationObj.chapter, locationObj.chaptersUnavailable) != -1) {
						locationObj.available = false;
					}
				}
				
				// Bucket, bucket index, and menuName
				
				// If asset is not in bucket
				if (locationObj.bucket == "_none") {
					locationObj.menuName = locationObj.name;
					locationObj.bucket = "";
					locationObj.bucketInd = -1;
				// If asset is in bucket
				} else {
					locationObj.menuName = locationObj.bucket;
					// Get position in bucket
					locationObj.bucketInd = assets.getBucketIndex(locationObj.name);
				}
				
				// Sections
				
				// If asset has sections
				if (locationObj.sections.length > 0) {
					// Get sections for chapter
					if (locationObj.scope == "chapter") {
						locationObj.sections = locationObj.sections[parseInt(locationObj.chapter, 10)];
					// Sections for book-level asset
					} else {
						locationObj.sections = locationObj.sections[0];
					}
					if (typeof locationObj.sections == "undefined") {
						locationObj.sections = [];
					}
				}
				
				// If there are no sections and section values are required
				// for download template, create section values from linkTitle, linkBullet, and url
				if (locationObj.template == "download") {
					if (locationObj.sections.length === 0) {
						locationObj.sections = [];
						locationObj.sections[0] = new assets.sectionObj;
					}
					if (!locationObj.sections[0].title) {
						locationObj.sections[0].title = locationObj.linkTitle;
					}
					if (!locationObj.sections[0].url) {
						locationObj.sections[0].url = locationObj.url;
					}
				}
				
				// Protection
				
				// Protection status for entire asset is inherited
				locationObj.assetProtected = locationObj.protected;
				// Determine whether this chapter is protected or a free sample
				if (locationObj.assetProtected
					&& $.inArray(locationObj.chapter, locationObj.chaptersFree) != -1) {
					locationObj.protected = false;
				}
				
				// URL
				
				// URL for popup glossary
				if (locationObj.assetType == "glossary" && locationObj.behavior == "popup") {
					locationObj.url = makePath([allSites.engineDirs.root], "#" + makeLocationIdStr(locationObj));
				} else {
					
					// Section URLs
					
					// If asset has sections
					if (locationObj.sections.length > 0) {
						// Each section
						for (var i = 0,
							 count = locationObj.sections.length;
							 i < count;
							 i ++) {
							locationObj.sections[i].url = replaceVars(locationObj.sections[i].url, locationObj);
							// Add directory if necessary
							if (locationObj.dir && getUrlType(locationObj.sections[i].url) == "relative to site") {
								locationObj.sections[i].url = makePath([locationObj.dir], locationObj.sections[i].url);
							}
							// Create full URL for section
							locationObj.sections[i].url = makeFullUrl(locationObj.sections[i].url, locationObj);
							// Create URL with no extension
							locationObj.sections[i].urlNoExtension = removeExtension(locationObj.sections[i].url);
							// File extension
							locationObj.sections[i].extension = getExtension(locationObj.sections[i].url);
						}
						// Use URL of first section for main URL
						locationObj.url = locationObj.sections[0].url;
					}
					
					// Replace variables in URL string
					locationObj.url = replaceVars(locationObj.url, locationObj);
					// Get type of URL
					locationObj.urlType = getUrlType(locationObj.url);
					// Add site path, protected/student folder, etc.
					locationObj.url = makeFullUrl(locationObj.url, locationObj);
					// Extension of URL
					locationObj.extension = getExtension(locationObj.url);
					// URL with extension removed from filename
					locationObj.urlNoExtension = removeExtension(locationObj.url);
					// Directory of asset
					if (!locationObj.dir && locationObj.url) {
						locationObj.dir = removeFilename(locationObj.url);
					}
					
				}
				
				// Template and Flash
				
				// Get template code, set Flash variables
				if (locationObj.assetType == "video" || locationObj.assetType == "audio") {
					// Get name of template
					locationObj.template = locationObj.assetType;
					// Always add Asset Heading for media pages
					locationObj.showHeading = true;
					// Use playlist version of template if there are sections
					if (locationObj.sections.length > 0) {
						locationObj.template += "_playlist";
						locationObj.playlist = true;
					}
					// Get template and replace variables in it;
					// this string will be loaded into the site page
					locationObj.templateStr = removeMediaOptions(allSites.templates[locationObj.template], locationObj);
//					locationObj.templateStr = replaceVars(locationObj.templateStr, locationObj);
					// Player height and width
					// Audio
					if (locationObj.assetType == "audio") {
						locationObj.playerHeight = flashManager.playerHeightOffset;
						locationObj.playerWidth = "400";
					// Video
					} else {
						// If there's a video height
						if (!locationObj.playerHeight && locationObj.mediaOptions.videoHeight) {
							locationObj.playerHeight = (parseInt(locationObj.mediaOptions.videoHeight, 10) + parseInt(flashManager.playerHeightOffset, 10)).toString();
						} else {
							locationObj.playerHeight = "360";
						}
						// If there's a video width
						if (!locationObj.playerWidth && locationObj.mediaOptions.videoWidth) {
							locationObj.playerWidth = locationObj.mediaOptions.videoWidth;
						} else {
							locationObj.playerWidth = "480";
						}
					}
				// Template
				} else if (locationObj.assetType == "template") {
					// Determine Link Bullets
					if (locationObj.template == "download") {
						if (!locationObj.linkBullet) {
							switch (locationObj.extension) {
								case "pdf":
								case "zip":
								case "ppt":
								case "psd":
									locationObj.linkBullet = locationObj.extension
									break;
								case "doc":
									locationObj.linkBullet = "word";
									break;
								case "xls":
									locationObj.linkBullet = "excel";
									break;
								case "html":
								case "htm":
									locationObj.linkBullet = "flash";
									break;
								default:
									locationObj.linkBullet = "document";
									break;
							}
							
						}
						// Used to open correct help panel from help link
						// based on page content					
						if (!locationObj.helpLink) {
							switch (locationObj.extension) {
								case "pdf":
									helpPanelNum = "0";
									break;
								case "zip":
									helpPanelNum = "1";
									break;
								case "doc":
									helpPanelNum = "2";
									break;
								case "html":
								case "htm":
									helpPanelNum = "3";
									break;
								case "ppt":
									helpPanelNum = "4";
									break;
								case "xls":
									helpPanelNum = "5";
									break;
								case "psd":
									helpPanelNum = "6";
									break;
							}
							if (helpPanelNum) {
								locationObj.helpLink = "/coursemate/shared/help/download_help.html?panel="
													+ helpPanelNum
													+ "#Accordion1";
							} else {
								locationObj.helpLink = "/coursemate/shared/help/download_help.html";
							}
						}						
					}
					// Always add Asset Heading for template pages
					locationObj.showHeading = true;
					locationObj.templateStr = allSites.templates[locationObj.template];
//					locationObj.templateStr = replaceVars(locationObj.templateStr, locationObj);
				} else if (locationObj.assetType == "html" && locationObj.sections.length > 1) {
					locationObj.assetType = "template";
					locationObj.template = "index";
					locationObj.templateStr = allSites.templates["index"];
//					locationObj.templateStr = replaceVars(locationObj.templateStr, locationObj);
				} else if (locationObj.assetType == "cl_ebook") {
					locationObj.template = "cl_ebook";
					locationObj.templateStr = allSites.templates[locationObj.template];
				}
				
				// Get template code if there's a template
				if (locationObj.template) {
					locationObj.templateStr = replaceVars(locationObj.templateStr, locationObj);
				}
				
				
			// If content is not an asset, it should be embedded
			} else {
				locationObj.behavior = "embedded";
			}
						
		}
		
		// Location ID
		
		locationObj.id = makeLocationIdStr(locationObj);
		
		// If page is popup and class is being used to store current page locations,
		// copy location to popup property
		if (locationObj.behavior == "popup" && this.classType == "current" && currentStatus.shell) {
			this.popupLocation = {};
			copyToObject(locationObj, this.popupLocation);
		// If page is embedded, location is a section, or class is being used for reports,
		// copy location to main location
		} else {
			copyToObject(locationObj, this);
			// Update chapter status
			if (classType != "temp") {
				currentStatus.update();
			}
		}
		
		// PAGE BEHAVIOR (whether to pop page up)
		
		if (!currentStatus.shell) {
			pageBehavior = "embedded";
		} else {
			pageBehavior = locationObj.behavior;
		}
		
		return pageBehavior;
		
	}
		
	// Find asset title that matches location ID
	function parseVerboseIdName(name) {
		
		var assetTitles = assets.titles();
		var assetCount = assetTitles.length;
		var normalizedName = normalizeTitle(name);
		
		for (var i = 0; i < assetCount; i ++) {
			if (normalizedName == normalizeTitle(assetTitles[i])) {
				return assets.names()[i];
			}
		}
		
		return "";
		
	}
		// Lowercase and covert non-word characters to underscores for comparison
	function normalizeTitle(title) {
		
		var normalizedTitle = title.toLowerCase();
		
		// Convert space codes
		normalizedTitle = normalizedTitle.replace(/%20/g, "_");
		// Remove apostrophe
		normalizedTitle = normalizedTitle.replace(/'/g, "");
		// Replace nonword chars with underscore
		normalizedTitle = normalizedTitle.replace(/[\W_]+/g, "_");
		
		return normalizedTitle;
		
	}
		// Make Location ID string
	function makeLocationIdStr(locationObj) {
		
		var idStr = locationObj.isbn;
		
		// If there's a Resource Center Resource Group
		if (site.type == "resource_center" && locationObj.resourceGroup) {
			idStr += "/" + locationObj.resourceGroup;
		}
		
		if (locationObj.type != "home") {
			idStr += "/" + locationObj.name;
			if (locationObj.chapter) {
				idStr += "/" + locationObj.chapter;
			}
			// Add parameter
			if (currentStatus.shell && locationObj.behavior != "popup"
				&& locationObj.type != "home" && !site.forceDemo) {
				idStr += ":shell";
			}
		}
		if (site.forceDemo) {
			idStr += ":demo";
		}
		
		return idStr;
		
	}
		// Make URL relative to server from URL relative to site
	function makeFullUrl(url, locationObj) {
		
		var assetDir = "";
		var urlType = getUrlType(url);
		var chapterTitleValue = "";
		var matchArray = [];
		
		// CL eBook
		if (locationObj.assetType == "cl_ebook") {
			// If a URL is specified for a CL Ebook get the chapterName from it
			if (url) {
				if ((matchArray = url.match(/\bchapterName=([^&]+)/)) != null) {
					chapterTitleValue = matchArray[1];
				}
			// Otherwise create chapter name from chapter title
			} else {
				chapterTitleValue = makeClEbookChapterStr(locationObj.chapterTitle);
			}
			url = makePath([site.siteFiles.ebookDomain], "/vrle/retrieve.do?")
				+ "eISBN=" + site.siteFiles.ebookIsbn + "&prodId=VRL"
				+ "&chapterName=" + chapterTitleValue
				+ "&token=" + currentStatus.token;
		// If URL is relative to site root, add necessary site directories
		} else if (urlType == "relative to site") {
			// Protected or unprotected dir
			if (!locationObj.protected || !locationObj.standaloneProtected) {
				assetDir = site.siteDirs.unprotected;
			// Use courseware dir if specified when accessed ass standalone page
			} else if (!currentStatus.shell && locationObj.courseware) {
				assetDir = site.siteDirs.courseware;
			} else {
				assetDir = site.siteDirs.protected;
			}
			url = makePath([assetDir], url);
		}
		
		return url;
		
	}
		// Make value for chapterName parameter in CL Ebook query string.
	// The Javascript escape and unescape functions do not correspond
	// with what browsers actually do...
	function makeClEbookChapterStr(chapterTitle) {
		
		var SAFECHARS = "0123456789" +					// Numeric
						"ABCDEFGHIJKLMNOPQRSTUVWXYZ" +	// Alphabetic
						"abcdefghijklmnopqrstuvwxyz" +
						"-_.!~*'()";					// RFC2396 Mark characters
		var HEX = "0123456789ABCDEF";
		var plaintext = chapterTitle;
		var encoded = "";
		
		for (var i = 0; i < plaintext.length; i++ ) {
			var ch = plaintext.charAt(i);
			if (ch == " ") {
				encoded += "+";				// x-www-urlencoded, rather than %20
			} else if (SAFECHARS.indexOf(ch) != -1) {
				encoded += ch;
			} else {
				var charCode = ch.charCodeAt(0);
				if (charCode > 255) {
					encoded += "+";
				} else {
					encoded += "%";
					encoded += HEX.charAt((charCode >> 4) & 0xF);
					encoded += HEX.charAt(charCode & 0xF);
				}
			}
		}
		
		return encoded;

	}
		// Get first available asset in menu
	function getFirstAsset(chapter) {
		
		var allAssetNames = assets.names("menu");
		var assetName = "";
		
		for (var i = 0,
			 count = allAssetNames.length;
			 i < count;
			 i ++) {
			assetName = allAssetNames[i];
			// If asset is available for chapter
			if ($.inArray(chapter, assets.get(assetName).chaptersAvailable) != -1) {
				break;
			}
		}
		
		return assetName;
		
	}

}

/////////////////////////////////////////////////////////
// CONTROLLER CLASS (RESPONDS TO INTERFACE SELECTIONS)
/////////////////////////////////////////////////////////

function Controller() {
		// Public Method
		this.showLocation = ShowLocation;

	// Display page
	// interfaceComponent is the part of the interface that calls the function:
	// assetMenu, navBar, chapterMenu, resourceGroupMenu, resourceGroupSubmenu
	// (for Resource Centers only)
	function ShowLocation(locationId, interfaceComponent) {
			var bucketName = "";
		var trackerData = {};
		// Update data model to reflect new location
		var pageBehavior = currentLocation.update(locationId, interfaceComponent);
		var isInBucket = false;
		
		// If no interfaceComponent value is passed, assume page is loaded
		// by external URL
		if (!interfaceComponent) {
			interfaceComponent = "url";
		}
		
		// Popup page;
		if (pageBehavior == "popup") {
			copyToObject(currentLocation.popupLocation, trackerData);
			tracker.update(trackerData);
			return;
		}
		
		// Content not found
		if (currentLocation.type == "error") {
			view.error(locationId);
		// Home page
		} else if (currentLocation.type == "home") {
			view.home();
			// showHideBook();
		// Report
		} else if (currentLocation.type == "report") {
			view.report();
		} else if (currentLocation.type == "all sites") {
			view.sitesIndex();
		} else if (site.type == "resource_center"
				   && currentLocation.type == "resource group"
				   && (interfaceComponent == "resourceGroupMenu" || interfaceComponent == "url")) {	
			view.resourceGroup(interfaceComponent);
		// Content page (asset or bucket)
		} else {
		
			
			// Update view if RC submenu is clicked or if page is accessed from
			// an external URL
			if (site.type == "resource_center"
				&& (interfaceComponent == "resourceGroupSubmenu" || interfaceComponent == "url")) {
				//var groupName = currentLocation.resourceGroup;
				//var groupInd = resourceCenter.getIndex(groupName);
				// we may need to lazy load if the url is being accessed directly!	
				//if ($.inArray(groupInd, fileLoader.lazyloaded) == -1) {
					//fileLoader.loadSiteDefinition(resourceCenter.values[groupInd].assets.values, groupInd);
				//}
				view.resourceGroup(interfaceComponent);
				
			}
			
			// If location is a bucket or an asset in a bucket
			if (currentLocation.bucket && currentStatus.shell) {
				view.contentPage("bucket");
			// If it's an asset not in a bucket or a standalone page
			} else {
				view.contentPage();
			}
				
		}
		
		view.update();
		
		// Pass location data to Tracker
		if (currentStatus.shell) {
			copyToObject(currentLocation, trackerData);
			tracker.update(trackerData);
		}
		
	}

}

///////////////////////////////////////
// VIEW CLASS (INTERFACE)
///////////////////////////////////////

// This class maintains the interface;
// its methods are called by the controller
function View() {
		// Whether updateOptions has been run
	var optionsUpdated = false;
		// Public Methods
		this.init = Init;
	this.update = Update;
	// Methods for updating content area
	this.home = Home;
	this.resourceGroup = ResourceGroup;
	this.error = Error;
	this.report = Report;
	this.sitesIndex = SitesIndex;
	// Content page
	this.contentPage = ContentPage;
		//////////////////////////////
	// INIT VIEW
	//////////////////////////////
		// Initialize the interface
	function Init() {
		// Link to Instructor Companion Site
		makeInstructorLink();
		
		// spinner
		
		$("#loading").bind("ajaxSend", function() {
			$("html").addClass('busy');
            $(this).show();
        }).bind("ajaxStop", function() {
			$("html").removeClass('busy');
            $(this).hide();
        });
		
		// Side Menu
		if (site.type != "resource_center") {
			$("div.sideMenuWrapper").html(makeAssetMenu());
		} else {
			makeResourceGroupMenu();
		}
		// Top Nav Bar
		makeNavBar();
		// Popup Chapter Menu
		// Created by view.resourceGroup for Resource Centers
		if (site.type != "resource center") {
			makeChapterMenu();
		}
		// Initialize shell behaviors on page
		initShell();
		// Tracker module
		tracker.init();
		// Login box
		if (!currentStatus.authenticated) {
			// Display login on Home Page if user isn't authenticated
			if (site.type == "4ltr") {
				loginDiv = "div.homeTopRight";
			} else {
				loginDiv = "div#homeLogin";
			}
			loadLogin(loginDiv);
		}
		
		// Private Methods for Init
		
		////// CREATE INSTRUCTOR LINK ///////
		
		// This will be displayed only if user is logged into SSO as an instructor
		function makeInstructorLink() {
			
			if (site.siteFiles.instructorSite) {
				var linkStr = '<li><a href="' + site.siteFiles.instructorSite + '"  target="_blank">Instructor Companion Site</a></li>';
				$("div#supportNav ul").prepend(linkStr);
			}
			
		}
			////// CREATE SIDE MENU FOR ASSETS /////////
		function makeAssetMenu(menuInd) {
			
			var selector = "";
			var menuOptions = getMenuOptions(menuInd);
			var menuStr = '<ul class="sideMenu">';
			
			// Add each menu option to string
			for (var i = 0,
				 count = menuOptions.length,
				 option = {};
				 i < count; i ++) {
				option = menuOptions[i];
				menuStr += makeOption(option, menuInd);
			}
			
			// Add closing tag
			menuStr += '</ul>';

			return menuStr;
			
			// Private Methods for makeAssetMenu()
			
			// Returns array of menu option objects
			function getMenuOptions(menuInd) {
				
				var menuOptions = [];
				var bucketsFound = [];
				var assetNames = [];
				var parent = {};
				
				// Get assets and buckets
				
				// If it's not a Resource Center
				if (typeof menuInd == "undefined") {
					parent = window;
				// If it's a Resource Center
				} else {
					parent = resourceCenter.getByIndex(menuInd);
				}
				
				assetNames = parent.assets.names("menu");
				
				for (var i = 0,
					count = assetNames.length,
					assetName = "",
					bucketName = "",
					newOption = {};
					i < count; i ++) {
					
					assetName = assetNames[i];
					bucketName = parent.assets.get(assetName).bucket;
					
					// If asset is in a bucket
					if (bucketName != "_none") {
						// Add bucket name to menu options
						// if it's not already there
						if ($.inArray(bucketName, bucketsFound) == -1) {
							newOption = new menuOption(bucketName,
														parent.buckets.get(bucketName).title,
														parent.buckets.get(bucketName).icon,
														bucketName);
							bucketsFound.push(bucketName);
							menuOptions.push(newOption);
						}
					// If option is an asset, add asset name
					} else {
						newOption = new menuOption(assetName,
													parent.assets.get(assetName).title,
													parent.assets.get(assetName).icon,
													"");
						menuOptions.push(newOption);
					}
					
				}
				
				return menuOptions;
				
				// Object for storing menu option values
				function menuOption(name, title, icon, bucket) {
					
					this.name = name;
					this.title = title;
					this.icon = makePath([site.engineDirs.icons], icon);
					this.bucket = bucket;
					
				}
			
			}
						
			// Make code for menu option
			function makeOption(optionObj, menuInd) {
				
				var titleStr = "";
				var optionStr = "";
				var assetNames = [];
				var assetObj = {};
				var bucketObj = {};
				var blurb = "";
				var parent = {};
				
				// If it's not a Resource Center
				if (typeof menuInd == "undefined") {
					parent = window;
				// If it's a Resource Center
				} else {
					parent = resourceCenter.getByIndex(menuInd);
				}
				
				// Rollover text
				// Bucket
				if (optionObj.bucket) {
					bucketObj = parent.buckets.get(optionObj.bucket)
					assetNames = bucketObj.assets;
					// Get appropriate blurb
					if (bucketObj.blurbShort) {
						blurb = bucketObj.blurbShort;
					} else {
						blurb = bucketObj.blurbLong;
					}
					titleStr += ' title="|';
					if (blurb) {
						titleStr += blurb;
					// If there's no blurb, list contents of bucket
					} else {
						// List assets
						for (var i = 0, count = assetNames.length; i < count; i ++) {
							assetObj = parent.assets.get(assetNames[i]);
							titleStr += assetObj.title;
							// Add separator to list of assets if necessary
							if (i < count - 1) {
								titleStr += '&nbsp;&bull; ';
							}
						}
					}
					titleStr += '"';
				// Asset
				} else {
					assetObj = parent.assets.get(optionObj.name);
					if (assetObj.blurb) {
						titleStr += makeRolloverTitle(assetObj.name);
					}
				}
				
				optionStr = '<li><img src="' + optionObj.icon + '" class="assetimages">'
								+ '<span class="optionLabel">'
								+ '<a href="#' + site.makeLocationId(optionObj.name, "") + '"><span' + titleStr + '>' + optionObj.title + '</span></a>'
								+ '</span></li>';
				return optionStr;
				
			}
			
		}
		
		// Make Side Menu for Resource Centers
		function makeResourceGroupMenu() {
			
			var menuStr = "";
			var leftPanelStr = getLeftPanel();
			
//			// Compressed styles if necessary
//			if (site.menuStyle == "compressed") {
//				$("div#leftSide").add
//			}
			
			// Remove existing content from menu in template
			$("div#accordionMenu").empty();
			// Add each menu option to string
			for (var i = 0,
				 count = resourceCenter.count,
				 resourceGroup;
				 i < count;
				 i ++) {
				resourceGroup = resourceCenter.getByIndex(i);
				menuStr += makeMainOption(resourceGroup, i)
						+ makeSubOptions(resourceGroup)
						+ '<div class="leftPanel">'
						+ leftPanelStr
						+ '<div class="sideMenuWrapper" >' + makeAssetMenu(i) + '</div>'
						+ '<div class="clear"></div></div>';
			}
			$("div#accordionMenu").html(menuStr);
			
			// Sets mainTopic and leftPanel areas within resource center accordion to compressed state
			function setCompressedAccordion() {
				if (site.type == "resource_center") {	
					if (site.menuStyle == "compressed") {
						$("#leftSide").addClass('compressedAccMenu compressedAccSubMenu');
					}
				}
			}
			setCompressedAccordion();
						
			
			// Make string for Main Menu option
			function makeMainOption(resourceGroup, menuInd) {
				
				var str = "";
				var classStr = "";
				var idStr = "";
				
				if (menuInd === 0) {
					classStr = " rounded";
					idStr = ' id="top"';
				}
				
				str = '<div class="mainTopic' + classStr + '">'
					+ '<h3 class="accordionHead"' + idStr + '>'
					+ '<img src="' + site.siteDirs.images + '/' + resourceGroup.icon + '" class="topicIcon" border="0" />'
					+ '<span class="headLinkWrap"><a href="#/' + resourceGroup.name + '" class="headLink"><span>'
					+ resourceGroup.site.title + '</span></a></span></h3><div class="clear"></div>'
					+ '</div>';
					
				return str;
				
			}
			
			// Make string for submenu (chapter) options
			function makeSubOptions(resourceGroup) {
				
				var str = "";
				var titles = resourceGroup.site.chapterTitles;
				
				str += '<ul class="subNavAccordion">';
				
				for (var i = 0,
					 count = titles.length,
					 chapterNum = "";
					 i < count; i ++) {
					chapterNum = i + site.startChapterNumber;
					// Show chapter numbers
					if (site.showChapterNumbers) {
						str += '<li><span class="optionLabel">'
						+ '<span class="chapNum">' + chapterNum + '. </span>'
						+ '<a href="#/' + resourceGroup.name + '//' + chapterNum + '">'
						+ '<span>' + titles[i] + '</span></a></span></li>';
					// Suppress chapter numbers
					} else {
						str += '<li><span class="optionLabel">'
						+ '<span class="chapNum">'
						+ '<a href="#/' + resourceGroup.name + '//' + chapterNum + '">'
						+ titles[i] + '</a></span></span></li>';
					}
				}
				
				str += '</ul>';
				
				return str;
			
			}
			
			// Get the code from the template file for the Left Panel
			function getLeftPanel() {
				
				var templateStr = "";

				$.ajax({
					url: site.engineFiles.leftPanel,
					async: false,
					success: function(str) {
						templateStr = str;
					}
				})
				
				return templateStr;

			}
			
		}
					

		//////////// BUILD TOP NAV BAR ////////////////
		function makeNavBar() {
			
			var linkStr = "";
			var navLinks = getNavLinks();
			
			// Remove existing content from nav bar in template
			$("div#navBar ul#navItems").empty();
			
			// Add link for Home to string
			linkStr += '<li class="first"><a href="#" class="location-id">Home</a></li>';
			
			// Add Engagement Tracker link to 4LTR demos
		//	if (site.type == "4ltr" && site.demoChapters.length > 0) {
			if (site.type == "4ltr") {
				linkStr += '<li><a href="/engagement_tracker/Overview.html" class="popup large">Engagement Tracker</a></li>';
			}
			
			// Add each nav link to string
			for (var i = 0,
				 count = navLinks.length,
				 linkValues = {};
				 i < count; i ++) {
				
				linkValues = navLinks[i];
				linkStr += makeNavLink(linkValues);
				
			}
			
			// Add links to DOM
			$("div#navBar ul#navItems").append(linkStr);
			
			// Returns array of nav link names
			function getNavLinks() {
				
				var navLinks = [];
				var bucketsFound = [];
				var assetNames = assets.names("navBar");
				
				for (var i = 0,
					count = assetNames.length,
					assetName = "",
					newLink = {};
					i < count; i ++) {
					
					assetName = assetNames[i];
					
					newLink = new navLink(assetName,
										  assets.get(assetName).title,
										  assets.get(assetName).protected,
										  assets.get(assetName).linkStyle);
					navLinks.push(newLink);
					
				}
				
				return navLinks;
				
				// Object for storing nav link values
				function navLink(name, title, protected, linkStyle) {
					
					this.name = name;
					this.title = title;
					this.protected = protected;
					this.linkStyle = linkStyle;
					
				}
			
			}
			
			// Make code for nav bar; home will always be first link
			function makeNavLink(navObj) {
				
				var protectedStr = "";
				var linkStr = "";
				var assetObj = assets.get(navObj.name);
				var titleStr = makeRolloverTitle(assetObj.name);
				
				// Lock icon
				if (navObj.protected) {
					protectedStr = ' protected';
				}
				
				linkStr = '<li class="navItem' + protectedStr + '">'
						+ '<a href="#' + site.makeLocationId(navObj.name, "") + '" class="' + navObj.linkStyle + '"'
						+ titleStr + '>'
						+ navObj.title + '</a>'
						+ '</li>';
				return linkStr;
				
			}
			
		}
		
		///// INITIALIZE ELEMENTS IN SITE SHELL /////
		
		// After page has loaded, load content into elements
		// and initialize behaviors
		function initShell() {
			
			var homeUrl = site.siteFiles.homePageBaseFilename + ".html";
			// LOAD GRAPHICS
			loadImages();
			// showHideBook();			
			// HOME PAGE CONTENT
			
			if (site.type == "premium" || site.type == "resource_center") {
				fileLoader.loadFileIntoPage("#homeIntro", "", homeUrl);
			} else if (site.type == "4ltr") {
				fileLoader.loadFileIntoPage(".txtBoxCopy", "", homeUrl);
				$("#logoText").html(site.title);
				// Make title text smaller if it is more than 4 letters
				// so it fits on round graphic
				if (site.title.length > 4) {
					$("#logoText").css("font-size", "25px");
				}
			}
			
			// HEADER CONTENT
			
			$("#bookTitle").html(site.title);
			$("#bookSubtitle").html(site.subtitle);
			$("#edition").html(site.edition);
			$("#author").html(site.author);
			
			// ENGAGEMENT TRACKER LINK
		
			$("a#engagementTracker").click(function() {
				view.tracker();
				return false;
			});
			
			
			// POPUP CHAPTER MENU
			
			// Whether chapter menu is displayed
			currentStatus.chapterMenu = 0;
			
			// Menu Label
			$("#chapterMenuLabel").text("Select a " + site.labels.chapterSingular);
			
			if (site.type == "resource_center") {
				$("#courseSelectLabel").text("Change " + site.labels.resourceGroupSingular);
			}
			
			// Links in popup chapter menu; bind to current li elements
			// and those added in the future in Resource Centers
			$("#chapterList li").live("click", function() {
				var urlValue = $(this).find('a').attr("href");
				disablePopup();
				currentStatus.updateChapterView("single");
				controller.showLocation(urlValue, "chapterMenu");
				return false;
			});
			
			// Semi-transparent layer for graying out interface when chapter list comes up
			$("#backgroundPopup").css({
				"opacity": "0.7"
			});
			
			// Button for loading Chapter Menu
			// Label
			$(".selectChapter").text("Select " + site.labels.chapterSingular);
			// Behavior
			$(".selectChapter").click(function() {
				if ($(this).attr("class").indexOf("inactive") == -1) {
					loadPopup();
				}
				return false;
			});
			
			// Closing Chapter Menu
			$('#closeChapterMenu').click(function() {
				disablePopup();
			});
			
			// NEXT/PREVIOUS CHAPTER BUTTONS
			
			$(".previousChapter").mousedown(function() {
				if ($(this).attr("class").indexOf("active") != -1) {
					goToChapter("previous")
				}
			});
			
			$(".nextChapter").mousedown(function() {
				if ($(this).attr("class").indexOf("active") != -1) {
					goToChapter("next")
				}
			});
			
			// CHAPTER VIEW MODE (THIS OR ALL)
			
			// Labels
			$(".thisChapter").text("This " + site.labels.chapterSingular);
			$(".allChapters").text("All " + site.labels.chapterPlural);
			
			// Behaviors
			$(".thisChapter").mousedown(function() {
				// Do nothing if buttons are disabled
				if ($(".chapterView").attr("class").indexOf("inactive") == -1) {
					currentStatus.updateChapterView("single");
					setChapterViewButtons();
					controller.showLocation(currentLocation.id);
				}
			});
			
			$(".allChapters").mousedown(function() {
				// Do nothing if buttons are disabled
				if ($(".chapterView").attr("class").indexOf("inactive") == -1) {
					currentStatus.updateChapterView("all");
					setChapterViewButtons();
					controller.showLocation(currentLocation.id);
				}
			});
			
			// POPUP LINKS (INCLUDING TOP NAV BAR)
			
			// Add popup behaviors to links according to specified class
			$("a.popup").click(function() {
										
				// Get names in class attribute
				var classNames = $(this).attr("class");
				var navBarLink = false;
				
				// Get URL
				var url = $(this).attr("href");
				
				// If popup link is in Top Nav Bar
				if ($(this).parent().attr("class").indexOf("navItem") != -1) {
					// Get URL from location ID and update location
					controller.showLocation(url);
					url = currentLocation.popupLocation.url;
					// Get class name from Site Definition
					if (currentLocation.popupLocation.linkStyle) {
						classNames = currentLocation.popupLocation.linkStyle;
					}
					navBarLink = true;
					
				}
				
				openPopup(url, classNames, navBarLink);
				
				return false;
				
			});
			
			// TOP NAV BAR
			
			// Add URL for survey
			$("#survey a").attr("href", site.siteFiles.survey);
			
			// Color of link on Premium Buttons
			var premiumButtonLinkColor = $(".navItem").find('a').css('color');
			
			// Makes the link inside the button have its hover effect when hovering over the asset (which is a parent of the <a> tag)
			$(".navItem").hover(
				function() {
					$(this).find('a').css('color', '#ce3c23').css('text-decoration', 'underline');
					$(this).css("cursor", "pointer");
				},
				function() {
					var linkColor = $(this).find('a').css('color');
					$(this).find('a').css('color', premiumButtonLinkColor).css('text-decoration', 'none');;
					$(this).css("cursor", "default");
				}
			);
				
			// Rollover tooltips for menu options
			$(".navItem a").cluetip({
				width: "200px",
				positionBy: "bottomTop",
				splitTitle: "|",
				showTitle: false,
				cursor: "",
				clickThrough: true
			});
			
			// LINKS WITH location-id CLASS
			
			$("a.location-id").click(function() {
				var url = $(this).attr("href");
				controller.showLocation(url);
				return false;
			});
				
			// SIDE MENU
			
			$("ul.sideMenu li").click(function() {
				var urlValue = $(this).find('a').attr("href");
				controller.showLocation(urlValue);
				// Don't load value from URL into address bar
				return false;
			});
			
			// Highlight menu option on mousedown instead of click for faster response
			$("ul.sideMenu li").mousedown(function() {
				clearMenu();
				// Highlight selected option
				$(this).addClass("sub-selected");
			});
			
			// Underline menu option when hovering over bar
			$("ul.sideMenu li").mouseover(function() {
				if ($(this).attr("class") != "sub-selected") {
					$(this).find('a').css('text-decoration', 'underline');
				}
			});
			$("ul.sideMenu li").mouseout(function() {
				$(this).find('a').css('text-decoration', 'none');
			});
		
			// Rollover tooltips for menu options
			$(".sideMenu span.optionLabel span").cluetip({
				width: "200px",
				splitTitle: "|",
				showTitle: false,
				cursor: "",
				clickThrough: true
			});
			
			// RESOURCE CENTER MENU
		//	var homeURL = site.siteFiles.homePageBaseFilename + ".html";
			
			if (site.type == "resource_center") {
				
				// Main Menu options
				$("div.mainTopic").click(function() {
					$("*").css("cursor", "progress");
					var urlValue = $(this).find('a').attr("href");
					controller.showLocation(urlValue, "resourceGroupMenu");
					$("*").css("cursor", "");
					$(this).next().toggle();
					
					//Shows book specific info in main content area on Resource Center websites
					// showHideBook();
					$("#homeIntro").show();
			//		fileLoader.loadFileIntoPage("#homeIntro", "", homeURL);
					// Load appropriate html file into group home page
					// update home page image if it exists
					$("img#homePageImg").attr("src", site.siteFiles.homePageImage);
					$("#contentArea").hide();
					$("#homePage").show();
				

					// Don't load value from URL into address bar
					return false;
				});
				
				// Submenu Options
				$("ul.subNavAccordion li").click(function() {
					var urlValue = $(this).find('a').attr("href");
					controller.showLocation(urlValue, "resourceGroupSubmenu");
					// Don't load value from URL into address bar
					return false;
				});
				
			}
			
			// BUCKET PAGE TABS
			
			$bucketTabs = $("#bucketTabs").tabs({
				
				// Execute whenever content of tab is displayed
				show: function(event, ui) {
					
					var currentTab = ui.panel.id;
		//			var contentContainer = "#" + currentTab;
					var frameSelector =  currentTab + "-iframe";
					
		//			// If asset is ILRN, reload content
		//			if (currentLocation.assetType == "ilrn" && currentStatus.chapterView == "single") {
		//				loadPage(contentContainer, currentLocation);
		//			}
		
					// Resize iframe if it's not in the first tab;
					// first tab's iframe is resized when it is loaded via loadFileIntoPage()
					if (!isFirstTab(currentTab)) {
						sizeIframe(frameSelector);
					}
					
				}
					
			});
		
		}

	}
		//////////////////////////
	// UPDATE VIEW
	//////////////////////////
		// Update interface elements as appropriate
	function Update() {
		
		if (currentStatus.shell) {
			makeBreadcrumbs();
			showChapterTitle();
			setSideMenu();
			updateOptions();
			setButtons();
			setChapterMenu();
			// Update URL in browser's address bar
			window.location.hash = currentLocation.id;
		}
		
		// Private Methods for Update View
		
		// Create breadcrumbs
		function makeBreadcrumbs() {
			
			var breadcrumbCode = "";
			var separator = "&nbsp;&gt;&nbsp;";
			var groupTitle = "";
			
			// If Home Page
			if (currentLocation.type == "home") {
				breadcrumbCode += "Home";
			} else {
				// Home
				breadcrumbCode += "<div>" + makeLink("Home", "#") + "</div>";
				//Resource Group
				if (site.type == "resource_center") {
					groupTitle = resourceCenter.get(currentLocation.resourceGroup).site.title;
					breadcrumbCode += "<div>" + separator + groupTitle + "</div>";
				}
				// Chapter
				if (currentLocation.scope == "chapter" && currentLocation.chapter) {
	//				breadcrumbCode += "<div>" + makeLink(makeChapterStr(), "#" + firstAssetName) + separator + "</div>";
					breadcrumbCode += "<div>" + makeChapterStr(separator) + "</div>";
				}
				// Bucket
				if (currentLocation.bucket) {
					breadcrumbCode += "<div>" + separator + buckets.get(currentLocation.bucket).title + "</div>";
				}
				// Asset
				if (currentLocation.type == "asset") {
					breadcrumbCode += "<div>" + separator + currentLocation.title + "</div>";
				}
				
			}
			
			// Add breadcrumb code
			$("#breadcrumbs span").html(breadcrumbCode);
			// Set links to respond to location IDs
			$("#breadcrumbs a").mousedown(function() {
				urlValue = $(this).attr("href");
				controller.showLocation(urlValue);
			});
			
		}
		
		// Update chapter title in the display
		function showChapterTitle() {
			
			$(".currentChapter div").html(makeChapterStr());
			
		}
			// Update Side Menu to select specified option
		function setSideMenu() {
			
			var menuName = "";
			var matchArray = [];
			var groupName = "";
			var groupArray = [];
			
			// Remove all highlights from options
			clearMenu();
			clearTopic();

			// Highlight selected option
			// Find URL in menu that matches name of current location
			// and add sub-select class to its li to
			$(".sideMenu li").each(function() {
				var urlValue = $(this).find("a").attr("href");
				if ((matchArray = urlValue.match(/\/([^\/]+)$/)) != null) {
					menuName = matchArray[1];
				}
				if (menuName == currentLocation.menuName) {
					$(this).addClass("sub-selected");
					// Hide rollover
					$(this).find("a span").trigger('hideCluetip');
				}
			});
		
			$("div.mainTopic").each(function() {
				var urlValue = $(this).find("a").attr("href");
				if ((groupArray = urlValue.match(/\/([^\/]+)$/)) != null) {
					groupName = groupArray[1];
				}
				if (currentLocation.resourceGroup != "") {
					if (groupName == currentLocation.resourceGroup) {
						$(this).addClass("selected");
					}
				}
				else {
					clearTopic();
				}
			});

		
		}
		
		// Set the state of buttons, such as the Next and Previous Chapter buttons
		function setButtons() {
			
			// Next/Previous Chapter buttons
			// Disable Previous if on first chapter or home or if book resource
			if (currentLocation.type == "home"
				|| currentLocation.type == "resource group"
				|| currentLocation.scope == "book"
				|| currentStatus.chapter == currentLocation.chaptersAvailable[0]) {
				$(".previousChapter").removeClass("active");
				$(".previousChapter").addClass("inactive");
			} else {
				$(".previousChapter").removeClass("inactive");
				$(".previousChapter").addClass("active");
			}
			
			if (currentLocation.type == "home"
				|| currentLocation.type == "resource group"
				|| currentLocation.scope == "book"
				|| currentStatus.chapter == currentLocation.chaptersAvailable[currentLocation.chaptersAvailable.length - 1]) {
				$(".nextChapter").removeClass("active");
				$(".nextChapter").addClass("inactive");
			} else {
				$(".nextChapter").removeClass("inactive");
				$(".nextChapter").addClass("active");
			}
			
			// Select Chapter button
			if (currentLocation.scope == "book" && currentLocation.type != "home") {
				$(".selectChapter").removeClass("active");
				$(".selectChapter").addClass("inactive");
			} else {
				$(".selectChapter").removeClass("inactive");
				$(".selectChapter").addClass("active");
			}
			
			setChapterViewButtons();
			
		}
		
		// Highlight current chapter in Chapter Menu
		function setChapterMenu() {
			
			$("#chapterList li").each(function() {
				var url = $(this).find("a").attr("href");
				var chapterNum = "";
				var matchArray = [];
				// Skip disabled chapters that have no url
				if (!url) {
					return;
				}
				if ((matchArray = url.match(/\d+$/)) != null) {
					chapterNum = matchArray[0];
				}
				if (chapterNum == currentStatus.chapter) {
					$(this).addClass("selected");
				} else {
					$(this).removeClass("selected");
				}
			});
			
		}
		
		// Change lock icons if necessary for free sample chapter
		function updateOptions() {
			
			var optionName = "";
			var optionType = "";
			var assetArray = [];
			var matchArray = [];
			var allProtected;
			var allUnavailable;
			
			// Only execute if chapter has changed
			if (currentStatus.isNewChapter || !optionsUpdated) {
				// Update lock icons on Side Menu
				$(".sideMenu li").each(function() {
					var url = $(this).find("a").attr("href");
					$icon = $(this).children("img");

					if ((matchArray = url.match(/\/([^\/]+)$/)) != null) {
						optionName = matchArray[1];
					}
					
					// If menu option is asset
					if (getContentType(optionName) == "asset") {
						var grayedIcon = site.engineDirs.icons + "/" + removeExtension(assets.get(optionName).icon) + "_disabled.gif";
						var origIcon = site.engineDirs.icons + "/" + assets.get(optionName).icon;
						// If content is not available for this asset for the current chapter,
						// and unavailableMenuOptions is set to "hide," hide the menu option
						if (site.unavailableMenuOptions == "hide"
							&& $.inArray(currentStatus.chapter, assets.get(optionName).chaptersUnavailable) != -1) {
							$(this).hide();
						// If content is not available for this asset for the current chapter,
						// and unavailableMenuOptions is set to "gray," apply class "grayAsset"
						}  else if (site.unavailableMenuOptions == "gray"
							&& $.inArray(currentStatus.chapter, assets.get(optionName).chaptersUnavailable) != -1) {
							$(this).addClass("grayAsset").find("a").trigger('hideCluetip'); //gray out text, hide rollover
							$icon.attr("src",grayedIcon);
						} else {
							$(this).show();
							$(this).removeClass("grayAsset");
							$icon.attr("src",origIcon);
							// If menu option should be unprotected
							if ($.inArray(currentStatus.chapter, assets.get(optionName).chaptersFree) != -1) {
								$(this).removeClass("protected");
							// If it should be protected
							} else if (assets.get(optionName).protected) {
								$(this).addClass("protected");
							}
						}
					// If option is bucket, add lock only if all assets within it are protected
					// or remove it from menu if all options in it are hidden
					} else {
						assetArray = assets.getByBucket(optionName);
						allProtected = true;
						allUnavailable = true;
						// Check each asset
						for (var i = 0,
							 assetObj = {}; i < assetArray.length; i ++) {
							assetObj = assetArray[i];
							// If an asset is unprotected
							if (!(assetObj.protected
								&& $.inArray(currentStatus.chapter, assetObj.chaptersFree) == -1)) {
								allProtected = false;
							}
							// If an asset is unavailable
							if ($.inArray(currentStatus.chapter, assets.get(assetObj.name).chaptersUnavailable) == -1) {
								allUnavailable = false;
							}
						}
						// Hide bucket if all assets in it are hidden
						if (site.unavailableMenuOptions == "hide" && allUnavailable) {
							$(this).hide();
						} else {
							$(this).show();
							// Add lock if all are protected
							if (allProtected) {
								$(this).addClass("protected");
							// Otherwise remove lock
							} else {
								$(this).removeClass("protected");
							}
						}
					}
				});
				optionsUpdated = true;
			}
			
		}

	}
		//////////////////////////////////////
	// UPDATE CONTENT AREA OF VIEW
	//////////////////////////////////////
		// SHOW HOME PAGE
	function Home() {
		
		var homeTextUrl = "";
		
		if (site.type == "resource_center") {
			homeTextUrl = site.siteFiles.homePageBaseFilename + ".html";
			// Load appropriate html file into group home page
			fileLoader.loadFileIntoPage("#homeIntro", "", homeTextUrl);
		}
			
		clearMenu();
		if (site.type == "resource_center") {
			$(".leftPanel").hide();
			$("#accordion").show();
		}
		if (site.type == "premium" || site.type == "resource_center") {
			$("#contentError").hide();	
			$("#contentArea").hide();
			if (site.menuStyle == "normal") {
				$("ul.subNavAccordion").show();
			} else if (site.menuStyle == "compressed") {
				$("ul.subNavAccordion").hide();
			}
		} else if (site.type == "4ltr") {
			$("#mainArea").hide();
			// Home Page image
			$("#homeImage").css("background-image", "url(" + site.siteFiles.homePageImage + ")");
		}
		$("#book").show();
		$("#homePage").show();
		
	}

	// SHOW RESOURCE GROUP
	// Open accordion menu to show selected Resource Group menu
	function ResourceGroup(interfaceComponent) {
		var groupName = currentLocation.resourceGroup;
		var chapterNum = currentLocation.chapter;
		var allNames = resourceCenter.names();
		// Index no. of current Resource Group
		var groupInd = resourceCenter.getIndex(groupName);
		var homeTextUrl = site.siteFiles.homePageBaseFilename + ".html";
		// Lazy load sections XML
		if(!currentLocation.sectionsFile) {fileLoader.loadSiteDefinition(resourceCenter.values[groupInd].assets.values, groupInd);}
		// Load appropriate html file into group home page
		fileLoader.loadFileIntoPage("#homeIntro", "", homeTextUrl);
		
		if (currentLocation.type == "resource group") {
			// update home page image, book link if it exists
			$("img#homePageImg").attr("src", site.siteFiles.homePageImage);
			// Add correct URL to Buy Online link
			$("a.buy-online").attr("href", site.siteFiles.buyOnline + site.isbnCore);
			//$("#bookThumb").html('<img src="' + site.bookcoverImage + '" />');
			$("#contentArea").hide();
			$("#homePage").show();
			// showHideBook();
		}
		
		// Change states of menu panels
		for (var i = 0, count = allNames.length; i < count; i ++) {
			// Hide unselected panels
			if (i != groupInd) {
				$("div.leftPanel:eq(" + i + ")").slideUp("600");
				$("ul.subNavAccordion:eq(" + i + ")").slideUp("600");
			// Display selected panel
			} else {
				// If it was Resource Group Main Menu that was clicked (or url linking to group),
				// diplay Chapter Menu
				if (interfaceComponent == "resourceGroupMenu"
					|| (interfaceComponent == "url" && currentLocation.type == "resource group")) {
					$("ul.subNavAccordion:eq(" + i + ")").slideDown("600");
					$("div.leftPanel:eq(" + i + ")").slideUp("600");
				// If submenu or external URL, display Asset Menu
				} else if ((interfaceComponent == "resourceGroupSubmenu"
							|| interfaceComponent == "url")
							&& chapterNum) {
					$("div.leftPanel:eq(" + groupInd + ")").slideDown("600");
					$("ul.subNavAccordion:eq(" + groupInd + ")").slideUp("600");
				}
			}
		}
		// Create new Chapter Menu for Resource Group if necessary
		if (currentStatus.isNewResourceGroup) {
			makeChapterMenu();
		}
		
	}
		// DISPLAY "CONTENT NOT FOUND" ERROR MESSAGE
	function Error(locationId) {
		
		$("#contentError").text('The location "' + locationId + '" could not be found.');
		$("#book").hide();
		$("#homePage").hide();
		$("#contentArea").hide();
		$("#contentError").show();
		
	}
		// SHOW SITE REPORT
	function Report() {
		
		var siteReport = new SiteReport;
		
		$("#contentArea").html("Creating report . . .");
		$("#contentArea").html(siteReport.text);
			
	}
		// SHOW LIST OF ALL SITES
	function SitesIndex() {
		
		$("#contentArea").html(allSitesIndex.text);
		
		// Show details if called from Production Server
		if (currentStatus.server == "production") {
			allSitesIndex.getDetails();
		// Show only dirs if not called from Production Server
		} else {
			allSitesIndex.init();
		}
		
	}
		// OPEN WINDOW SHOWING TRACKER LOG
	function Tracker() {
		
		var trackerWin = window.open("", "tracker", "width=600,height=450,resizable=0,scrollbars=1,status=0,toolbar=0,menubar=0,location=0,left=20,top=40");
			trackerWin.document.write(tracker.report);	
		}
		// DISPLAY CONTENT PAGE
	// type is either "asset" (asset not in bucket) or "bucket" (asset in bucket)
	function ContentPage(type) {
		
		// type defaults to "asset"
		if (!type) {
			type = "asset";
		}
			switch (type) {
			
			// Create tabs for bucket, load content into tabs,
			// and select appropriate tab for location
			case "bucket":
			
				var tabUrl = "#" + currentLocation.name;
				var tabContainer = "#bucketTabs div" + tabUrl;
				
				// Create bucket tabs if necessary
				if (currentStatus.tabContent != currentLocation.bucket) {
					makeBucketTabs(currentLocation.bucket);
				// Otherwise load content into current tab
				} else {
					loadPage(tabContainer, currentLocation);
					$bucketTabs.tabs("select", currentLocation.bucketInd);
				}
				
				$("#assetContent").hide();
				$("#bucketContent").show();
				
				break;
			
			// Populate divs for Asset Page
			case "asset":
			
				
				var currentAsset = assets.get(currentLocation.name);
				var bucketTitle = buckets.get(currentAsset.bucket).title;
				var titleStr = bucketTitle + ": " + currentAsset.title;
				var contentContainer = "";
				
				// Asset with index for multiple sections
				if (currentLocation.assetType == "index" || currentLocation.template == "index") {
					contentContainer = "#assetTabs #tabsMenu";
				// Determine which div should hold the content
				} else {
					contentContainer = "#assetText";
				}
				
				// Load content file into div
				loadPage(contentContainer, currentLocation);
				
				if (currentStatus.shell) {
					$("#bucketContent").hide();
					$("#assetContent").show();
				}
				
				// Index page
				if (currentLocation.assetType == "index" || currentLocation.template == "index") {
					initAssetTabs();
					$("#menuTab").text(currentLocation.menuTabLabel);
					$("#contentTab").text(currentLocation.contentTabLabel);
					$("#assetText").hide();
					$("#assetTabs").show();
				} else {
					$("#assetTabs").hide();
					$("#assetText").show();
				}
				
				break;
			
		}
		
		// Show interface elements for content page
		if (currentStatus.shell) {
			$("#contentError").hide();	
			$("#book").hide();
			$("#homePage").hide();
			if (site.type == "premium" || site.type == "resource_center") {
				$("#contentArea").show();
			} else if (site.type == "4ltr") {
				// Home Page image
				$("#homeImage").css("background-image", "none");
				$("#mainArea").show();
			}
			$(".sideMenu").show();
		}
		
		// Private Methods for Asset
			// Make tabs for displaying assets in bucket.
		// Tabs must first all be created and then content added
		// in a separate loop to avoid loading problems with IE
		function makeBucketTabs(bucketName) {
			
			var assetsInBucket = assets.getByBucket(bucketName);
			var assetCount = assetsInBucket.length;
			var assetObj = {};
			var locationObj = {};
			var tabUrl = "";
			
			// Remove all existing tabs
			// Each tab
			for (var i = 0,
				 tabsCount = $("#bucketTabs").tabs("length");
				 i < tabsCount;
				 i ++) {
				
				$bucketTabs.tabs("remove", 0);
				
			}
			
			// Reset tab status
			currentStatus.tabLoaded = [];
			
			// Add tabs
			// Each asset
			for (var i = 0,
				 tabContent = "";
				 i < assetCount;
				 i ++) {
				
				assetObj = assetsInBucket[i];
				tabUrl = "#" + assetObj.name;
				tabContent = '<div id="' + assetObj.name + '"></div>';
				
				// Add tab
				$("#bucketTabs").append(tabContent).tabs("add", tabUrl, assetObj.title);
				
				// Clicking on tab will update Location ID
				$("#bucketTabs a").click(function() {
					var url = $(this).attr("href");
					var assetName = url.replace("#", "");
					var locationId = site.makeLocationId(assetName, "");
					controller.showLocation(locationId);
				});
				
				// If asset is protected, add lock icon to tab
				if (assetObj.protected) {
					$("#bucketTabs li:last a").append('<span class="protected">&nbsp;</span>');
				}
				// Add rollover text
				$("#bucketTabs li:last span:first").attr("title", makeRolloverTitle(assetObj.name, false));
				
				$bucketTabs.tabs("select", currentLocation.bucketInd);
				
			}
			
			// Rollover tooltips
			$("#bucketTabs li span").cluetip({
				width: "200px",
				positionBy: "bottomTop",
				topOffset: 20,
				splitTitle: "|",
				showTitle: false,
				cursor: "",
				clickThrough: true
			});
			
			// Load content into tabs
			// Each asset
			for (var i = 0,
				 tabContainer = "",
				 locationId = "";
				 i < assetCount;
				 i ++) {
				
				assetObj = assetsInBucket[i];
				locationId = site.makeLocationId(assetObj.name, currentStatus.chapter);
				tempLocation.update(locationId);
				copyToObject(tempLocation, locationObj);
				tabUrl = "#" + assetObj.name;
				tabContainer = "#bucketTabs div" + tabUrl;
				
				// Load content
				loadPage(tabContainer, locationObj);
				
				// Set tab status
				// If asset is ILRN, set tabLoaded = false to force reload
				if (tempLocation.assetType == "ilrn" && currentStatus.chapterView == "single") {
					currentStatus.tabLoaded[i] = false;
				} else {
					currentStatus.tabLoaded[i] = true;
				}
						
			}
			// Reset tab status
			currentStatus.tabContent = assetObj.bucket;
			
		}
		}
		
	//////////////////////////////////
	// PRIVATE METHODS FOR VIEW
	//////////////////////////////////
		// MAKE POPUP CHAPTER MENU
	// This must be called outside of .init() for changing
	// Resource Center menus
	function makeChapterMenu() {
		
		var titleStr = "";
		var leftColumnStr = "";
		var rightColumnStr = "";
		var menuStr = "";
		var listBullet = "";
		// Determine where to break column of chapter titles
		var halfInd = Math.ceil(site.chapterCount / 2) - 1;
		
		// Add each chapter
		for (var i = 0,
			 chapterNum = 0,
			 linkOpenTag = "",
			 linkCloseTag = "",
			 classStr = "";
			 i < site.chapterCount; i ++) {
			
			chapterNum = (i + site.startChapterNumber).toString();
			
			// If there are demo chapters, only add links to demo chapters
			if (site.demoChapters.length === 0 || $.inArray(chapterNum, site.demoChapters) != -1) {
				classStr = "";
				linkOpenTag = '<a href="#' + site.makeLocationId("", chapterNum) + '">';
				linkCloseTag = '</a>';
			} else {
				classStr = ' class="inactive"';
				linkOpenTag = "";
				linkCloseTag = "";
			}
			
			// Show chapter numbers
			if (site.showChapterNumbers) {
				listBullet = chapterNum + '.';
			// Use bullet instead of chapter number
			} else {
				listBullet = '&bull;';
			}
			
			// Code for title item
			titleStr = '<li ' + classStr + '><div class="chapterTitle"><div class="chapNum">'
					 + listBullet + '</div><div class="chapTitle">' + linkOpenTag
					 + site.chapterTitles[i]
					 + linkCloseTag + '</div></div></li>';
			
			// Add title to either left or right column
			if (i <= halfInd) {
				leftColumnStr += titleStr;
			} else {
				rightColumnStr += titleStr;
			}
		}
		
		// Make code for menu
		menuStr = '<ul id="left-chapter-column" class="popupMenu leftColumn">'
				+ leftColumnStr + '</ul>'
				+ '<ul id="right-chapter-column" class="popupMenu rightColumn">'
				+ rightColumnStr + '</ul>';
		
		// Add chapter menu to DOM
		$("div#chapterList").html(menuStr);
	}
	// End Chapter Menu

	// LOAD CONTENT INTO PAGE
	// Load correct content into page if it's not already loaded
	function loadPage(contentContainer, location) {
		// Show login screen if necesssary;
		// Don't show it if standaloneProtected is false
		if (location.protected && !currentStatus.authenticated
			&& !((location.courseware || !location.standaloneProtected) && !currentStatus.shell)) {
			loadLogin(contentContainer);
			return;
		}
		
		// If content not available
		if (!location.available && currentStatus.chapterView == "single") {
			showNotAvailable(contentContainer, location);
			return;
		}
		
		// Load if asset page or if bucket page that needs reloading
		if (location.bucketInd == -1 || currentStatus.tabLoaded[location.bucketInd] != true) {
			if (currentStatus.chapterView == "all") {
				makeIndexPage(contentContainer);
			} else if (location.assetType == "video"
				|| location.assetType == "audio"
				|| location.assetType == "template"
				|| location.assetType == "cl_ebook") {
				makeFromTemplate(location, contentContainer);
				// Add behaviors to links if page is index
				if (location.template == "index") {
					makeOpenInTab(contentContainer);
				}
			} else if (location.assetType == "glossary") {
				makeGlossary(contentContainer);
			} else {
				
				fileLoader.loadFileIntoPage(contentContainer, location);
			}
			// Set tab loaded status to true, unless asset is ILRN quiz,
			// which must be reloaded in Firefox
			if (currentStatus.browser == "mozilla" && location.assetType == "ilrn" && currentStatus.chapterView == "single") {
				currentStatus.tabLoaded[location.bucketInd] = false;
			} else {
				currentStatus.tabLoaded[location.bucketInd] = true;
			}
		}
		
		// Change any "student" links to "courseware" links for courseware content
		if (location.protected && !currentStatus.authenticated
			&& ((location.courseware || !location.standaloneProtected) && !currentStatus.shell))
		{
			$(contentContainer + " a[href*='/student/']").attr('href', function(){
				return this.href.replace('student','courseware');
			});
		}
		
		// Add asset instructions
		if (location.instructions) {
			if ($(contentContainer + " div.instructions").length === 0) {
				$(contentContainer).prepend('<div class="instructions">');
			}
			$(contentContainer + " div.instructions").html(location.instructions);
		}
		
		// Add asset heading
		if (location.showHeading) {
			if ($(contentContainer + " div.assetHeading").length === 0) {
				$(contentContainer).prepend('<div class="assetHeading">');
			}
			$(contentContainer + " div.assetHeading").html(location.heading);
		} else {
			$(contentContainer + " div.assetHeading").remove();
		}
		
		setContentMargin();
		
		// Private Methods for loadPage
			
		// Make index page for All Chapters view
		function makeIndexPage(contentContainer) {
			
			var indexStr = '<ul class="allChapters">';
			var areChaptersMissing = false;
			var missingMessage = '<div class="missing">This resource is not available for some ' + site.labels.chapterPlural.toLowerCase() + '.</div>';
			
			// Add each chapter
			for (var i = 0,
				 assetName = currentLocation.name,
				 chapterNum = 0,
				 linkOpenTag = "",
				 linkCloseTag = "",
				 classStr = "",
				 isAvailable = true,
				 listBullet = "";
				 i < site.chapterCount; i ++) {
				
				chapterNum = (i + site.startChapterNumber).toString();
				isAvailable = true;
				
				if ($.inArray(chapterNum, currentLocation.chaptersAvailable) == -1) {
					isAvailable = false;
				}
				
				// Don't add links to demo chapters or missing chapters
				if ((site.demoChapters.length === 0 || $.inArray(chapterNum, site.demoChapters) != -1)
					&& isAvailable) {
					classStr = "";
					linkOpenTag = '<a href="#' + site.makeLocationId(assetName, chapterNum) + '">';
					linkCloseTag = '</a>';
				} else {
					classStr = ' class="inactive"';
					linkOpenTag = "";
					linkCloseTag = "";
					if (!isAvailable) {
						areChaptersMissing = true;
					}
				}
				
				if (site.showChapterNumbers) {
					listBullet = chapterNum + '. ';
				} else {
					listBullet = '&bull; ';
				}
				
				indexStr += '<li ' + classStr + '><span>' + listBullet + linkOpenTag
						 + site.chapterTitles[i]
						 + linkCloseTag + '</span></li>';
				
			}
			
			indexStr += "</ul>";
			
			if (areChaptersMissing) {
				indexStr = missingMessage + indexStr;
			}
			
			// Add content to DOM
			$(contentContainer).html(indexStr);
			
			// Set the behavior of the links
			$(contentContainer + " a").click(function() {
				var url = $(this).attr("href");
				currentStatus.updateChapterView("single");
				controller.showLocation(url);
				setChapterViewButtons();
				return false;
			});
			
		}
		
		// Set margin for content page;
		// use custom margin if specified
		function setContentMargin() {
			
			// Save original margin if it hasn't been saved
			if (!site.assetMargin) {
				// Get current margin being used
				site.assetMargin = $("#assetContent").css("margin-left");
			}
			
			// Use custom margin if specified
			if (currentLocation.margin) {
				$("#assetContent").css("margin-left", currentLocation.margin);
				$("#assetContent").css("margin-right", currentLocation.margin);
			// Otherwise make sure margin has been set back to original value
			} else {
				if ($("#assetContent").css("margin-left") != site.assetMargin) {
					$("#assetContent").css("margin-left", site.assetMargin);
					$("#assetContent").css("margin-right", site.assetMargin);
				}
			}
			
		}
		}

	// Clear the selected option in the menu
	function clearMenu() {
		
		var filename = "";
		$(".sideMenu li").removeClass("sub-selected");
		
	}
		// Clear the selected topic in the menu
	function clearTopic() {
		
		var filename = "";
		$("div.mainTopic").removeClass("selected");
		
	}

}
// End View

// NOT YET IMPLEMENTED
// Report of all the external links in the site pages
function LinksReport() {
		var reportStr = "";
		this.results = [];
		function AssetObj(assetName) {
		
		this.asset = assetName;
		this.links = [];
		
	}
		function LinksObj() {
		
		this.chapter = "";
		this.name = "";
		this.url = "";
		
	}
		// Each asset
	var count = assets.names().length;
	for (var assetInd = 0,
			 page = "",
			 assetName = "",
			 assetObj,
			 urlPattern = "",
			 matchArray = [];
			 assetInd < count; assetInd ++) {
		
		assetName = assets.names()[assetInd];
		assetObj = assets.get(assetName);
		urlPattern = assetObj.url;
		
		// Each chapter
		for (var chapterInd = 0,
			 	url = "",
				chapterNum = 0,
				fileNum = 0;
				chapterInd < site.chapterCount; chapterInd ++) {
			
			chapterNum = chapterInd + 1;
			fileNum = padNum(chapterNum);
			url = urlPattern.replace("[%chapterNumPadded%]", fileNum);
			$.get(url, function(data) {
				page = data;
			});
			if (page) {
				if ((matchArray = page.match(/href\="([^"+])"/gi)) != null) {
					for (var linkInd = 0,
							linksObj = new LinksObj();
							linkInd < matchArray.length; linkInd ++) {
						
						linksObj.chapter = chapterNum;
						linksObj.name = "";
						linksObj.url = matchArray[linkInd];
						
					}
					assetObj.links.push(chapterResults);
				}
			}
		}
		results.push(assetObj);
		
	}
		// Display links report
	function display() {
		
	}
	}

// Report of assets missing from site
function SiteReport() {
		var errorReport = "";
	// Get missing assets
	var missingAssets = eachPage(checkPage);
		// PUBLIC PROPERTIES
		// Bibliographic data
	this.text = makeHead("SITE REPORT")
				+ "<p>"
				+ makeBold("Title: ") + site.title + "<br />"
				+ makeBold("Author: ") + site.author + "<br />"
				+ makeBold("Edition: ") + site.editionNumber + "<br />"
				+ makeBold("Core Text ISBN: ") + site.isbnCore + "<br />"
				+ makeBold("SSO ISBN: ") + site.isbn + "<br />"
				+ makeBold("Number of Chapters: ") + site.chapterCount + "<br />"
				+ makeBold("Site Directory: ") + site.siteDirs.root + "<br />"
				+ "</p>";
		// Add each missing asset to report
	for (var name in missingAssets) {
		
		errorReport += makeHead(assets.get(name).title)
					+ "Content missing for these chapters: "
					+ missingAssets[name].join(", ");
		
	}
		// Report of errors
	if (errorReport) {
		this.text += '<div class="missing">'
					+ makeHead("The Following Assets Are Missing Content") + errorReport
					+ '</div>';
	}
		// Callback function that checks the specified page and adds it
	// to the results array if it's missing; doesn't check pages that are
	// under a different domain and therefor inaccessible
	function checkPage(assetName, chapterNum, results) {
			checkForPage(assetName, chapterNum);
//		alert("assetName: " + assetName + " ---- " + ajaxResults.loadResult);
		if (ajaxResults.loadResult != "success" && ajaxResults.loadResult != "inaccessible") {
			if (typeof results[assetName] == "undefined") {
				results[assetName] = [];
			}
			results[assetName].push(chapterNum);
		}
		
		return results;
		
	}
	}

// THIS CAN BE ELIMINATED
// Results of AJAX calls
function AjaxResults() {
		// Result of last attempt to load page load
	this.loadResult = "";
	// Content of last page loaded
	this.pageContent = "";
	}

// List all sites; this is run when Site Engine is loaded
// without a Location ID
function AllSitesIndex() {
		var allIsbns = allSites.isbns();
	var allDirs = allSites.dirs();
	var sitesList = "";
	var count = allIsbns.length;
		// PUBLIC PROPERTIES
		this.baseUrl = removeHash(window.location.href);
	this.displayBaseUrl = "http://" + window.location.host + "/site_engine";
	this.sitesArray = [];
	this.sites = [];
	this.listInd = 0;
	this.siteCount = 0;
	this.text = "";
	this.currentDiscipline = "";
		// Create array of both ISBNs and directories
	for (var i = 0; i < count; i ++) {
		this.sitesArray.push([allDirs[i], allIsbns[i]]);
	}
	// Sort by directory
	this.sitesArray.sort();
		
	for (var i = 0,
		 url = "",
		 isbn = "";
		 i < count;
		 i ++) {
		url = this.baseUrl + "#" + this.sitesArray[i][1];
		sitesList += '<p>Site Launch URL: <a class="launchSite" href="' + url + '">' + makeBold('/site_engine/#' + this.sitesArray[i][1]) + "</a><br />Site Directory Name: "
					+ makeBold(this.sitesArray[i][0]) + "</p>"
	}
		
	this.text = makeHead(count + " WEB SITES")
		+ '<div><a id="detailsButton" href="#">Show Details</a></div>'
		+ sitesList;
		// PUBLIC METHODS
		this.init = Init;
	this.getDetails = GetDetails;
		function Init() {
		
		// Force all links to reload page
		$("a.launchSite").click(function() {
			window.location.href = $(this).attr("href");
			window.location.reload();
		});
		$("a#detailsButton").click(function() {
			allSitesIndex.getDetails();
			return false;
		});
		}
		// List details about each site, such as title, authors, etc.
	function GetDetails() {
		
		var reportStr = '<div id="reportHeading"><span id="siteCount"></span>&nbsp;Websites</div>'
						+ '<div id="loading">Loading...</div>'
						+ '<ul id="sitesList"></ul>';
		
		$("div#contentArea").html(reportStr);
		
		for (var i = 0,
			count = this.sitesArray.length; i < count; i ++) {
			var url = makePath([this.sitesArray[i][0]], "site_definition.xml");
			// Skip test sites
			if (url.indexOf("/testing/") === 0) {
				break;
			}
			// Load Site Definition File
			$.ajax({
				type: "GET",
				url: url,
				dataType: "xml",
				async: false,
				success: parseSite
			});
			// Update index for use by parseSite
			this.listInd += 1;
		}
		
		$("div#loading").html("&nbsp;");
		this.init();
		
		// Get values from XML and display them
		function parseSite(xml) {
			
			var disciplineHead = "";
			var titleLine = "";
			var typeLine = "";
			var urlLine = "";
			var dirLine = "";
			var entry = "";
			var types = {premium: "Premium Site", "4ltr": "4LTR Press", resource_center: "Resource Center"};
			// CSS selectors (can't start with 4)
			var classNames = {premium: "premium", "4ltr": "fourLtr", resource_center: "resourceCenter"};
			
			// Book
			// ":last" selector in case of Resource Center
			var ssoIsbn = allSitesIndex.sitesArray[allSitesIndex.listInd][1];
			var title = $("book:last", xml).find("title:first").text();
			var author = $("book:last", xml).find("author:first").text();
			var edition = $("book:last", xml).find("edition-number:first").text();
			var discipline = $("book:last", xml).find("discipline:first").text();
			// Site
			var type = $("site", xml).find("type:first").text();
			var menuStyle = $("site", xml).find("menu-style").text();
			var demo = $("site", xml).find("demo-chapters").find("chapter-number:first").text();
			var url = "#" + ssoIsbn;
			var displayURL = makePath([allSitesIndex.displayBaseUrl], "#" + ssoIsbn);
			var dir = allSitesIndex.sitesArray[allSitesIndex.listInd][0];
			var className = "";
			var demoClass = "";
			
			if (demo) {
				demoClass = ' class="demo"';
			}
			
			if (!type) {
				type = "premium";
			}
			className = classNames[type];
			allSitesIndex.siteCount ++;
			
			titleLine += '<a class="launchSite" href="' + url + '">' + title + "</a>";
			if (edition) {
				titleLine += " (Edition " + edition + ")";
			}
			if (author) {
				titleLine += ", by " + author;
			}
			titleLine = '<div class="title ' + className + '">' + titleLine + '</div>';
			typeLine += types[type];
			if (demo) {
				typeLine += " Demo";
			}
			
			// Add discipline heading if necessary
			if (discipline != allSitesIndex.currentDiscipline) {
				disciplineHead = '<li><div class="discipline">' + discipline + '</div></li>';
				$("ul#sitesList").append(disciplineHead);
				allSitesIndex.currentDiscipline = discipline;
			}
			
			typeLine = '<div' + demoClass + '>' + typeLine + '</div>';
			urlLine = '<div class ="' + className + '">Site Launch URL: <a class="launchSite" href="' + url + '">' + displayURL + '</a></div>';
			// Don't show directory names if called from Production Server
			if (currentStatus.server != "production") {
				dirLine = '<div>Site Directory Name: ' + dir + '</div>';
			}
			entry = "<li>" + titleLine + typeLine + urlLine + dirLine + "</li>"
			
			$("ul#sitesList").append(entry);
			$("span#siteCount").text(allSitesIndex.siteCount.toString());
			
		}
		
	}
		// Objects
		function SiteObj() {
		
		this.isbn = "";
		this.title = "";
		this.author = "";
		this.edition = "";
		this.discipline = "";
		this.type = "";
		
	}
	}

// Loads Site Engine Files
function FileLoader() {
		// PUBLIC METHODS
		this.loadSiteDefinition = LoadSiteDefinition;
	this.loadFileIntoPage = LoadFileIntoPage;
	this.getSsoUrls = GetSsoUrls;
	this.loadScript = LoadScript;
		// PUBLIC PROPERTY
	this.lazyloaded = [];
		// Determine which site is being called and load site_definition.xml
	// file for that site
	function LoadSiteDefinition() {
		
		// Get URL
			var url = makePath([site.siteDirs.root], allSites.engineFiles.siteDefinition);
				var Element = function (data) {
				return function () {
					var _label = data.get(0).tagName,
						_content = data.text(),
						_key = toCamelCase(_label),
						_name = data.attr("name"),
						_type = data.attr("type");
						_display = data.attr("display");
					var that = {};
					that.label = function () {
							return _label;
						};
					that.content = function () {
							return _content;
						};
					that.key = function () {
							return _key;
						};
					that.name = function () {
							return _name;
						};
					that.type = function () {
							return _type;
						};
					that.display = function () {
							return _display;
						};	
					return that;
				}();
			};
		
		// function overload to lazyload section XML
		if (arguments.length == 2){
		
			gIndex = arguments[1];
			gAsset = arguments[0];
		
			if ($.inArray(gIndex, this.lazyloaded) === -1) {
				this.lazyloaded.push(gIndex); //record that we've loaded this RG
				$.each(gAsset, function(index, value) {
					// takes the two parameters we overode the parent function with: assetObj, groupIndex
					if (typeof value !== "undefined" && value.sectionsFile) { //only load for assets that actually have section files
						value = getSections(value, gIndex);
						
					}		
				});
			}

		
		}
		else {
		// Error checking
		try {
				// local arrays for order and content
			var bucketsOrder = [];
			var assetsOrder = [];
			var theBuckets = {};
			var theAssets = {};
			var tempResourceGroup = {};
		
			// Load XML file
			$.ajax({
				type: "GET",
				url: url,
				dataType: "xml",
				async: false,
				error: function () {
					errorHandler.update("Couldn't load site_definition.xml");
					errorHandler.type = "fatal";
				},
				success: parseXML
			});
				// Capture JavaScript errors
		} catch (err) {
			errorHandler.update("Error parsing site_definition.xml; " + err);
			errorHandler.type = "fatal";
		}
		}
		
		function parseXML(xml) {
			// parser functions take iteration index, a jquery object (presumably from the $(this) from each .each() iteration), and the object to compare and add properties to
			// parse book node(s)
			var parseBook = function (index, elem, obj) {
				var element = Element($(elem));
				// Add value
				if ((element.key() in obj) && (element.content() != "")) {
					// If value is array
					if (isArray(site[element.key()])) {
						// Each child element
						$(elem).children().each(function () {
							var child = Element($(this));
							if (child.content() != "") {
								obj[element.key()].push(child.content());
							}
						});
						// Number
					} else if (typeof site[element.key()] == "number") {
						obj[element.key()] = parseInt(element.content(), 10);
						// Simple value
					} else {
						obj[element.key()] = element.content();
					}
				}
			};
			
			// Parse content for site
			var parseSite = function (index, elem, obj) {
				var element = Element($(elem));
				// Add value
				if ((element.key() in obj) && (element.content() != "")) {
					// If value is object
					if (isObject(obj[element.key()])) {
						// Each child element
						$(elem).children().each(function () {
							var child = Element($(this));
							if ((child.key() in obj[element.key()]) && child.content() != "") {
								obj[element.key()][child.key()] = child.content();
							}
						});
						// If value is array
					} else if (isArray(obj[element.key()])) {
						// Each child element
						$(this).children().each(function () {
							var child = Element($(this));
							if (child.content() != "") {
								site[element.key()].push(child.content());
							}
						});
						// If boolean, convert string to boolean
						} else if (isBoolean(site[element.key()])) {
						obj[element.key()] = strToBoolean(element.content());
						// Simple value
					} else {
						obj[element.key()] = element.content();
					}
				}
			};
			
			var parseInterface = function (index, elem) {
				var item = Element($(elem));
				// get buckets
				if ((item.type() == "bucket") && (item.name() != "")) {
					bucketsOrder.push(item.name());
					Bucket(item.name());
				}
				if ((item.type() == "asset") && (item.name() != "")) {
					assetsOrder.push(item.name());
					// create each asset and give an optional obj to add these as a property to; return an array of the Assets
					Asset(item.name());
					var parent = Element($(elem).parent());
					// Assets in buckets
					if ((parent.type() == "bucket") && (parent.name != "")) {
						var grandparent = Element($(elem).parent().parent());
						theAssets[item.name()].bucket = parent.name();
						theAssets[item.name()].interface = grandparent.key();
						// Assets not in buckets
					} else {
						// Add assets to navBar bucket
						if (parent.key() == "navBar") {
							theAssets[item.name()].bucket = "navBar";
						}
						theAssets[item.name()].interface = parent.key();
					}
				}
			};
				var parseBuckets = function (index, elem, theseBuckets) {
				var element = Element($(elem));
				var bucketName = $(elem).children("name").text();
					$(elem).children().each(function () {
						var bucketElement = Element($(this));								
					// Error checking
						if (!(theseBuckets[bucketName]) // this allows empty buckets to be defined in the interface, but they won't actually appear in the sidebar
							|| !(bucketElement.key() in theseBuckets[bucketName])									
							|| (bucketElement.content() == "")
							|| (bucketName == "")
							|| $.inArray(bucketName, bucketsOrder) == -1) {
							return;
						}
						theseBuckets[bucketName][bucketElement.key()] = bucketElement.content();
					});
			};
			
			var parseAssets = function (index, elem, theseAssets, groupIndex) {
				
				var element = Element($(elem));
				var assetName = $(elem).children("name").text();
				
//				if (typeof theseAssets[assetName] == "undefined") {
//					return;
//				}
				
				$(elem).children().each(function () {
					// for resource center, directly add subsitution values to asset "template" per group
					var assetElement = Element($(this));
					if ((typeof theseAssets[assetName] === "undefined") || !(assetElement.key() in theseAssets[assetName]) || (assetElement.content() == "") || (assetName == "") || $.inArray(assetName, assetsOrder) == -1) {
						return;
					}
					// If value is object
					if (isObject(assets.assetObj()[assetElement.key()])) {
						// Each child element
						$(this).children().each(function () {
							var child = Element($(this));
							if ((typeof assets.assetObj()[assetElement.key()] != "undefined") && (child.key() in assets.assetObj()[assetElement.key()]) && child.content() != "") {
								// If boolean, convert string to boolean
								if (isBoolean(assets.assetObj()[assetElement.key()][child.key()])) {
									theseAssets[assetName][assetElement.key()][child.key()] = strToBoolean(child.content());
									// If simple value
								} else {
									theseAssets[assetName][assetElement.key()][child.key()] = child.content();
								}
							}
						});
						// If array
					} else if ($.isArray(assets.assetObj()[assetElement.key()])) {
						$(this).children().each(function () {
							var assetElementChild = Element($(this));
							if (assetElementChild.content() != "") {
								theseAssets[assetName][assetElement.key()].push(assetElementChild.content());
							}
						});
						// If boolean, convert string to boolean
					} else if (isBoolean(assets.assetObj()[assetElement.key()])) {
						theseAssets[assetName][assetElement.key()] = strToBoolean(assetElement.content());
						// If simple value
					} else {
						theseAssets[assetName][assetElement.key()] = assetElement.content();
		
					}
				});
				// Load sections if there is a Sections File
				if (typeof theseAssets[assetName] !== "undefined" && theseAssets[assetName].sectionsFile && resourceCenter.count === 0) {
					// Get sections and load them into Assets
				   theseAssets[assetName] = getSections(theseAssets[assetName], groupIndex);
				}
				
				else if  (typeof theseAssets[assetName] !== "undefined" && theseAssets[assetName].sectionsFile && site.type =="resource_center" && currentLocation.chapter ) {
							theseAssets[assetName] = getSections(theseAssets[assetName], groupIndex);
				}
			};
			
			// make sure interface assets are fully defined in an asset node -- further checking and/or addition or defaults maybe goes here?
			function adder(container, theseAssets, theseBuckets) {
				
				var theseAssetsOrder = assetsOrder.slice();
				var theseBucketsOrder = bucketsOrder.slice();
				
				for (var i = 0; i < theseAssetsOrder.length; i++) {
					if (!(theseAssetsOrder[i] in theseAssets)) {
						theseAssetsOrder.splice(i, 1);
						// don't forget to modify length since the array has been modified AND it is a condition:
						// http://www.dallasjclark.com/a-note-about-modifying-arrays-during-a-loop/
						i --;
					}
				}
				
				
				for (var i = 0; i < theseBucketsOrder.length; i++) {
					if (!(theseBucketsOrder[i] in theseBuckets)) {
						theseBucketsOrder.splice(i, 1);
						i --;
					}
				}
				
					// add buckets and asssets
				 for (var i = 0; i < theseBucketsOrder.length; i++) {
					container.buckets.add(theseBuckets[theseBucketsOrder[i]]);
				 }

				for (var i = 0; i < theseAssetsOrder.length; i++) {
					container.assets.add(theseAssets[theseAssetsOrder[i]], container);
				}
			
			}
			
			// these parse 4LTR and Premium sites, and get the Resource Center "template"
			// Load default content into "root" objects
			// perhaps parse function could be called according to what element is being parsed??? Just takes a selector and goes from there?
			$("clse > book", xml).children().each(function (index, elem) {
				parseBook(index, elem, site);
			});
			// Each property
			$("clse > site", xml).children().each(function (index, elem) {
				parseSite(index, elem, site);
			});
			// Parse content from "root" <interface>
			$("clse > interface item", xml).each(function (index, elem) {
				parseInterface(index, elem);
			});
			// Parse buckets
			$("clse > buckets > bucket", xml).each(function (index, elem) {
				 parseBuckets(index, elem, theBuckets);
			});
			// Parse assets
			// Each property in each asset
			$("clse > assets > asset", xml).each(function (index, elem) {
				parseAssets(index, elem, theAssets);
			});
			adder(window, theAssets, theBuckets);
				 // routine to import resource-center,
			//just gets <title> currently
			$("resource-center", xml).children().each(function () {
				var element = Element($(this));
				// Add string
				if ((element.key() in resourceCenter) && (element.content() != "")) {
					resourceCenter[element.key()] = element.content();
				}
			});
			
			// Load base template into each resourceGroup, then supplement
			$("resource-group", xml).each(function (groupIndex) {
				tempResourceGroup = resourceCenter.resourceGroup();
				$(this).children(":not(substitutions)").each(function (index, rg_element) {
					var element = Element($(rg_element));
					// Add string
					if ((element.key() in tempResourceGroup) && (element.content() != "")) {
						tempResourceGroup[element.key()] = element.content();
					}
				});

				// add book and site substitutions
				$(this).find("book").children().each(function (index, elem) {
					parseBook(index, elem, tempResourceGroup.site);
				});
				// Each property
				$(this).find("site").children().each(function (index, elem) {
					parseSite(index, elem, tempResourceGroup.site);
				});
				
				// make copy of template Buckets/Assets object to check against,
				var groupAssets = $.extend(true, {}, theAssets);	
				var groupBuckets = $.extend(true, {}, theBuckets);				

				// minus any interface items picked up from <substitutions>
				var remover = {};
				remover.bucket = [];
				remover.asset = [];
				
				$(this).find("interface").find("item").each(function (index, elem){
					var display = strToBoolean($(this).attr("display"));
					var displayName = $(this).attr("name");
					var displayType = $(this).attr("type");
					
					if (!(display)) {remover[displayType].push(displayName)};	
				});
				
				for (i=0;i<remover.bucket.length;i++) {
					delete groupBuckets[remover.bucket[i]];
				}
				
				$(this).find("bucket").each(function (index, elem) {
					parseBuckets(index, elem, groupBuckets);
				});
				
				for (i=0;i<remover.asset.length;i++) {
					delete groupAssets[remover.asset[i]];
				}
				$(this).find("asset").each(function (index, elem) {
					parseAssets(index, elem, groupAssets, groupIndex);
				});
				adder(tempResourceGroup, groupAssets, groupBuckets);				
				resourceCenter.add(tempResourceGroup);

			});
			
		}
			// Load sections file for passed asset and extract sections into the asset
		// that is currently being processed
		function getSections (assetObj, groupIndex) {
			var sectionsXml;
			var chapterNum = 0;
			var chapterCount = 0;
			var chapterStart;
			var assetName = assetObj.name;
			var siteParent = {};
			
			// Determine parent of site object that should be used for
			// chapter information.
			// Premium Sites
			if (typeof groupIndex == "undefined" || groupIndex === null) {
				siteParent = window;
			// Resource Centers
			// tempResourceGroup is the Resource Group currently being processed;
			// resourceCenter is not yet updated (unless lazy load is in process)
			} else {
				siteParent = tempResourceGroup || resourceCenter.values[groupIndex];		
			}
			
			// Get URL where sections file is stored
			assetObj.sectionsUrl = makePath([site.siteDirs.root], assetObj.sectionsFile);
			sectionsXml = loadSectionsFile(assetObj.sectionsUrl);
			// Each section
			$("sections", sectionsXml).children().each(function () {
				var sectionElement = Element($(this));
				var addSection = false;
				var sectionObj = assets.sectionObj();
				// Add properties to section
				if (sectionElement.content() != "") {
					// Each section property
					$(this).children().each(function () {
						var assetElementChild = Element($(this));
						// If property exists in Section definition, add its value
						if (sectionObj[assetElementChild.key()] != "undefined" && assetElementChild.content()) {
							sectionObj[assetElementChild.key()] = assetElementChild.content();
							addSection = true;
						}
					});
				}
				if (addSection) {
					chapterNum = parseInt(sectionObj.chapter, 10);
					chapterCount = siteParent.site.chapterTitles.length;
					chapterStart = siteParent.site.startChapterNumber;
					chapterEnd = chapterStart + chapterCount - 1;
					if ((chapterNum > chapterEnd) || (chapterNum < chapterStart)) {
						errorHandler.update("Didn't load section for chapter " + sectionObj.chapter + " in " + assetName + " because there are only " + chapterCount + " chapters, starting with " + chapterStart + " and ending with " + chapterEnd);
						// Put section in an array element with index corresponding to chapter number
					} else if (sectionObj.chapter) {
						if (typeof assetObj.sections[chapterNum] == "undefined") {
							assetObj.sections[chapterNum] = [];
						}
						assetObj.sections[chapterNum].push(sectionObj);
						// If no chapter, put it in 0
					} else {
						if (typeof assetObj.sections[0] == "undefined") {
							assetObj.sections[0] = [];
						}
						assetObj.sections[0].push(sectionObj);
					}
				}
				
			});
			
			// Record chapters that have no content
			// Add empty arrays to missing elements in sections array
			if (assetObj.scope == "chapter") {
				for (var i = 0; i < chapterCount; i++) {
					// If no content for a chapter
					if (typeof assetObj.sections[i] == "undefined") {
						assetObj.sections[i] = [];
						// Mark chapter as unavailable, unless it's a CL Ebook
						if (assetObj.type != "cl_ebook") {
							assetObj.chaptersUnavailable.push(i.toString());
						}
					}
				}
				assetObj.chaptersUnavailable.sort(numerical);
			}
			
			return assetObj;
			}
			// Load section data for asset from XML file
		function loadSectionsFile(url) {
				var sectionsXml;
				// Load XML file
			$.ajax({
				type: "GET",
				url: url,
				dataType: "xml",
				async: false,
				error: function () {
					errorHandler.update("Couldn't load section file" + url);
					sectionsXml = null;
				},
				success: function (xml) {
					sectionsXml = xml;
				}
			});
				return sectionsXml;
			}
			function toCamelCase(str) {
			return str.toString().replace(/([A-Z]+)/g, function (m, l) {
				return l.substr(0, 1).toUpperCase() + l.toLowerCase().substr(1, l.length);
			}).replace(/[\-_\s](.)/g, function (m, l) {
				return l.toUpperCase();
			});
		}
			function isArray(obj) {
			return ($.isArray(obj));
		};
		
			// Creates buckets
		
		function Bucket(name) {
			theBuckets[name] = new buckets.bucketObj();
			theBuckets[name].name = name;
			return theBuckets[name];
		}
			// Creates assets
			function Asset(name) {
			theAssets[name] = new assets.assetObj();
			theAssets[name].name = name;
			return theAssets[name];
		}
		}
		
	// Load the content for the specified location object into the specified
	// content container; if there's a sectionUrl, the page is a section
	// and this is the URL for the section; the locationObj contains info
	// for the index page for all the sections
	function LoadFileIntoPage(contentContainer, locationObj, sectionUrl) {

	
		var comingSoonMessage = "";
		var currentAsset = "";
		var heightCode = "";
		var iframeCode = "";
		var heightDiv = 0;
		var checkPageResults = {};
		var pageStr = "";
		var pageStatus = "";
		var assetDir = locationObj.url;
		var iframeId = locationObj.name + "-iframe";
		
		// If there's a section URL, the page is a section.
		// Use sectionUrl if it is passed; otherwise get URL of locationObj.
		// Asset type is HTML
		if (sectionUrl) {
			assetDir = sectionUrl;
			locationObj.assetType = "html";
		} else {
			assetDir = locationObj.url;
		}
		//console.warn(assetDir);
		// Abort and give error message if URL is a binary file
		// that can't be loaded this way
		if (!confirmFileIsLoadable(assetDir)) {
			return;
		}
		
		// If there's a URL, check to see if page is there
		if (assetDir) {
			pageStatus = checkPageStatus(assetDir, locationObj.name);
		// If there's no URL
		} else {
			pageStatus = "not found";
		}
		
		if (pageStatus == "ok") {
		
			// Load page into iFrame if it is not an index and if it has an iframeHeight,
			// or if it is cross-domain
			if ((locationObj.assetType != "index" && locationObj.iframeHeight)
				 || locationObj.urlType == "cross-domain") {
				
				if (locationObj.urlType == "cross-domain" && !locationObj.iframeHeight) {
					locationObj.iframeHeight = site.defaultIframeHeight;
				}
				
				// If iframe height is specified, use specified value for height;
				// otherwise, autosize height to content
				iframeCode = makeIframe(iframeId, assetDir, locationObj.iframeHeight);
				$(contentContainer).html(iframeCode);
				
				// Dynamically size iframe to content if content is not cross-domain,
				// if iframe height is auto, and if content will be loaded into the first
				// tab of the bucket
				if (locationObj.iframeHeight == "auto"
					&& canSizeIframe(locationObj.name)) {
					sizeIframe(iframeId, true);
				}
				
			// Otherwise load into page element using AJAX
			} else {
				$.ajax({
					async: false,
					cache: true,
					url: assetDir,
					complete: function(XMLHttpRequest, textStatus) {
						if (textStatus == "success") {
							pageStr = XMLHttpRequest.responseText;
							// Get only body content
							pageStr = extractBody(pageStr);
							// Change URLs to link to locations relative to index.html
							// and make other necesssary changes so page code will work in div
							pageStr = preparePageCode(pageStr);
							$(contentContainer).html(pageStr);
							// Set behaviors for page
							$(document).ready(function() {
								initContentPage(contentContainer, locationObj);
							});
							// If loading an index for a tab, set all links
							// on the page to open page in second tab
							if (locationObj.assetType == "index") {
								makeOpenInTab(contentContainer);
							}
						}
		
					}
				});
			}
			
		} else if (pageStatus == "not found") {
			
			showComingSoon(contentContainer, locationObj);
			
		}
		
		// Private Methods
		
		// Updates code in content page so it will function properly when loaded in a div
		function preparePageCode(pageStr) {
			
			pageStr = updateRelativeUrls(pageStr);
			pageStr = updateFlashVars(pageStr);
			
			return pageStr;
			
			// Methods for preparePageCode
			
			// Update URLs in page to point to base URL for page
			function updateRelativeUrls(pageStr) {
				
				pageStr = pageStr.replace(/(src ?= ?| href ?= ?)"([^"]+)"/gi, function (matchStr, attrib, url) {
					var newStr = "";
					if (getUrlType(url) == "relative to site") {
						newStr = attrib + '"' + makePath([currentLocation.dir], url) + '"';
						return newStr;
					} else {
						return matchStr;
					}
				});
				
				return pageStr;
				
			}
			
			// Add wmode="transparent" to Flash settings so that popup elements don't appear
			// behind Flash content
			function updateFlashVars(pageStr) {
				
				var matchArray = [];
				
				pageStr = pageStr.replace(/(<embed [^>]+type\="[^"]*flash[^"]*"[^>]*)>/i, function (matchStr, embedCode) {
					if ((matchArray = matchStr.match(/wmode ?\= ?"transparent"/i)) === null) {
						return embedCode + ' wmode="transparent">';
					} else {
						return matchStr;
					}
		
				});
				
				return pageStr;
				
			}
			
		}
		
	}
		// Load external JS file; showError determines
	// whether an error message is displayed if file can't be loaded
	function LoadScript(url, showError) {
		
		// Defaults to true
		if (typeof showError == "undefined") {
			showError = true;
		}
		
		var success = false;
		
		// Make the action synchronous
		$.ajaxSetup({async: false});
		// Load site definition file
		$.getScript(url, function() {
			success = true;
		});
		if (!success && showError) {
			alert("Couldn't load external JavaScript file." + constants.NL + url);
		}
		$.ajaxSetup({async: true});
			
	}
		// Get URLs with token for Instructor Site and CL Ebook from SSO
	// by loading JSP file
	function GetSsoUrls() {
		
		$.ajax({
			async: false,
			url: site.siteFiles.ssoUrls,
			success: function(data) {
				getUrls(data);
			}
		});
		
		// Extract URLs from AJAX results and put in Data Model
		function getUrls(str) {
			
			var matchArray = [];
			var url = "";
			
			// If there's an Instructor Site URL, store it
			if ((matchArray = str.match(/<url name="instructor_companion_site">([^>]+)<\/url>/)) !== null) {
				url = matchArray[1];
				if (isUrl(url)) {
					site.siteFiles.instructorSite = url;
				}
			}
			// If there's a CL eBook URL, get query values from it
			if ((matchArray = str.match(/<url name="cl_ebook">([^>]+)<\/url>/)) !== null) {
				url = matchArray[1];
				site.siteFiles.ebookUrl = url;
				if (site.siteFiles.ebookDomain === "") {
				site.siteFiles.ebookDomain = getHostname(url);
				}
				site.siteFiles.ebookIsbn = getValueFromQuery("eISBN", url);
				currentStatus.token = getValueFromQuery("token", url);
			}
			
		}
		
	}

}
// End FileLoader

// Load Tracker class from external JS file
function loadTracker() {

	var url = makePath([allSites.engineDirs.js], "tracker.js");
		fileLoader.loadScript(url);

}

// Load custom stylesheet from site directory
function loadCustomStylesheet() {
		loadStylesheet(site.siteFiles.stylesheet);

}

// Load external stylesheet
function loadStylesheet(filePath) {

	var headID = document.getElementsByTagName("head")[0];
	var cssNode = document.createElement('link');
	cssNode.type = 'text/css';
	cssNode.rel = 'stylesheet';
	cssNode.href = filePath;
	cssNode.media = 'screen';
	headID.appendChild(cssNode);

//	$("head").append('<link rel=StyleSheet href="' + filePath + '" type="text/css">');

}

// Manages Flash variables and instances of Flash objects
function FlashManager() {
		// JW Player variables
	var currentItem = -1;
	var previousItem = -1;

	// PUBLIC PROPERTIES
		this.assets = {};
	this.settings = {};
	this.player = null;
	this.allPlayers = [];
	this.playerHeightOffset = "20";
		// PUBLIC METHODS
		this.setFlash = SetFlash;
	this.loadPlaylist = LoadPlaylist;
	this.setTranscript = SetTranscript;
		// Set variables in Flash SWFObject to load player
	function SetFlash(contentContainer, location) {
		
		var width = "";
		var height = "";
		var elementName = "";
		var matchArray = [];
		

		// Get last element name in contentContainer
		if ((matchArray = contentContainer.match(/[^#\. ]+$/)) !== null) {
			elementName = matchArray[0];
		}

		this.settings.playerId = "player-" + elementName;
		this.settings.playlistId = "playlist-" + elementName;
		
		// Add values to .assets
		this.assets[location.name] = {
										playerId: this.settings.playerId,
										playlistId: this.settings.playlistId
										};

		this.settings.flashvars = {
			// Path to FLV file
			'file':                '',
			'backcolor':           'efecec',
			'frontcolor':          '404040',
			'id':                  this.settings.playerId,
			'seamlesstabbing':		'true',
			'autostart':           'false',
			'dock':					'false'
			};
		
		this.settings.params = {
			'allowscriptaccess':   'sameDomain',
			'bgcolor':             'FFFFFF',
			'wmode':				'transparent'
			};
		
		this.settings.attributes = {
			'id':                  this.settings.playerId,
			'name':                this.settings.playerId
			};
		
		// Add additional parameters for specific player types
		switch(location.assetType) {
			case "video":
				this.settings.flashvars.file = location.urlNoExtension + ".flv";
				this.settings.flashvars.plugins = "captions-1";
				this.settings.flashvars.captions = location.urlNoExtension + ".xml";
				this.settings.flashvars["captions.fontsize"] = "16";
				this.settings.flashvars["captions.back"] = "true";
				this.settings.params.allowscriptaccess = "always";
				this.settings.params.allowfullscreen = "true";
				width = location.playerWidth;
				height = location.playerHeight;
				break;
			case "audio":
				this.settings.flashvars.file = location.urlNoExtension + ".mp3";
				this.settings.params.allowfullscreen = "false";
				width = location.playerWidth;
				height = location.playerHeight;
				break;
			case "glossary":
				this.settings.params.allowfullscreen = "false";
				this.settings.params.wmode = "window";	
				this.settings.flashvars.id = "player1";
				this.settings.attributes.id = "player1";
				this.settings.attributes.name = "player1";
				width = "0";
				height = "0";
				break;
		}
		
		// Set streamer location if provided
		if (location.mediaOptions.streamer) {
			this.settings.flashvars.streamer = location.mediaOptions.streamer;
		}
		
		swfobject.embedSWF(allSites.engineFiles.jwPlayer, 'playercontainer', width, height, '9.0.124', false, this.settings.flashvars, this.settings.params, this.settings.attributes);
		
		$(contentContainer + " ul").attr("id", this.settings.playlistId);
		
	}
		
	// Load playlist into player
	function LoadPlaylist(location) {
			var playlist = [];
		var playlistId = this.assets[location.name].playlistId;
		var player = this.player;
		var areaID = "div#" + location.name + "MediaArea";
		
		// Load playlist if multiple videos per chapter
		if (location.playlist) {
			$("#" + playlistId + " a.playMedia").each(function(i) {
				playlist[i] = {
					file: location.sections[i].url,
					captions: location.sections[i].urlNoExtension + ".xml"
				};
				$(this).bind (
					"click",
					function() {
						player.sendEvent('ITEM', i);
						if (location.mediaOptions.viewTranscript) {
							loadTranscript(i);
						}
						return false;
					}
				);
			});
			player.sendEvent('LOAD', playlist);
			player.addControllerListener("ITEM","toggleSelected");
			
			}
		
		// Set width of playlist
		$(areaID + " div.mediaText").css("width", location.playerWidth + "px");
			
				
	}
		// Add code for viewing transcript
	function SetTranscript(location) {
		
		var areaID = "div#" + location.name + "MediaArea";

		if (location.mediaOptions.viewTranscript) {
			
			// Set width of transcript pane
			$(areaID + " div.transcriptPane").css("width", location.playerWidth + "px");
			loadTranscript(0);
			
			// Toggle the display for a video transcript
			$(areaID + " a.viewTranscript").click(function() {
				$(areaID + " div.transcriptPane").toggle();
				if ($(areaID + " div.transcriptPane").is(':visible')) {
					$(areaID + " a.viewTranscript").html("Hide Transcript");
//					$("#print-transcript").show();
				} else {
					$(areaID + " a.viewTranscript").html("View Transcript");
//					$(".printTranscript").hide();
				}
			});
			
//			// Print transcript for video
//			$("a.printTranscript").click(function() {
//				// Get a FRAMES reference to the iframe.
//				var objFrame = window.frames["viewTranscript"];
//				objFrame.focus();
//				objFrame.print();
//				return(false);
//			});
			
		}
		
	}
		// Load transcript into viewing area
	function loadTranscript(componentInd) {
		
		var url = "";
		
		if (currentLocation.playlist) {
			url = currentLocation.sections[componentInd].urlNoExtension + ".html";
		} else {
			url = currentLocation.urlNoExtension + ".html";
		}
		
		$.ajax({
			url: url,
			success: function(pageStr) {
				// Get only body content
				pageStr = extractBody(pageStr);
				$("div.transcriptText").html(pageStr);
			},
			error:  function(pageStr) {
				$("div.transcriptText").html("No Transcript Available");
			}
		});
		
		$("div.transcriptText").scrollTop(0);
		
	}
	}

// Function to add .selected to playlist item
function toggleSelected(obj) {
	var playing = $("#contentArea ul[className^='playlist'] li:visible")[obj.index];
	$("#contentArea li.selected").removeClass('selected');
	$(playing).addClass('selected');
	}

// function stopOtherPlayers(obj) {
// for ( var id in flashManager.allPlayers ) {
// if ( obj.id != flashManager.allPlayers[id] ) document.getElementById(flashManager.allPlayers[id]).sendEvent('STOP');
// }
// }

// Function called by JW Player when player is ready
function playerReady(thePlayer) {
	flashManager.allPlayers.push(thePlayer.id);
	flashManager.player = document.getElementById(thePlayer.id);
	// flashManager.player.addControllerListener('ITEM', 'stopOtherPlayers');
		if (currentLocation.type != "glossary") {
		flashManager.loadPlaylist(currentLocation);
		flashManager.setTranscript(currentLocation);
	}
}// PARSING FUNCTIONS

// Whether content item is asset or bucket
function getContentType(name) {
		var contentType = "";

	if ($.inArray(name, assets.names()) != -1) {
		contentType = "asset";
	} else if ($.inArray(name, buckets.names()) != -1) {
		contentType = "bucket";
	}
		return contentType;

}

// Return type of passed URL; possible values:
// "none" [no url]
// "absolute"
// "cross-domain"
// "hard disk" [file on hard disk]
// "relative to server" [relative to server root]
// "relative to site" [relative to site root]
function getUrlType(url) {
		var urlType = "";
	var matchArray = [];
		if (!url) {
		urlType = "none";
	// Check for http://
	} else if ((matchArray = url.match(/^http\:\/\//)) !== null) {
		urlType = "absolute";
		// If URL has different hostname than the site URL
		if (getHostname(url) != currentStatus.hostname) {
			urlType = "cross-domain";
		}
	} else if ((matchArray = url.match(/^file\:\/\//)) !== null) {
		urlType = "hard disk";
	// Check for leading slash
	} else if ((matchArray = url.match(/^\//)) !== null) {
		urlType = "relative to server";
	// Otherwise url is relative to site root
	} else {
		urlType = "relative to site";
	}
		return urlType;
	}
	// Run callback function on each page in site;
// callback function must have this format:
// callbackFunction(assetName, chapterNum, results)
// and must return results
// eachPage() returns an object called results
function eachPage(callbackFunction, data) {
		var assetName;
	var chapterNum;
	var results = {};
	var assetCount = assets.names().length;
		// Each asset
	for (var assetInd = 0,
			 assetName = "";
			 assetInd < assetCount; assetInd ++) {
		
		assetName = assets.names()[assetInd];
		
		// Each chapter
		for (var chapterInd = 0,
				chapterNum = 0;
				chapterInd < site.chapterCount; chapterInd ++) {
			
			chapterNum = chapterInd + 1;
			results = callbackFunction(assetName, chapterNum, results);
			
		}
		
	}
		return results;
	}

// Check to see if page is present on server;
// passes results to ajaxResults.loadResult;
// possible values returned by AJAX request:
// "success", "timeout", "error", "notmodified" and "parsererror";
// value returned if page is under a different domain and can't be accessed:
// "inaccessible"
function checkForPage(assetName, chapterNum) {
		// Create location ID
	var locationId = currentLocation.isbn + "/" + assetName;
	if (chapterNum) {
		locationId += "/" + chapterNum;
	}
		// Update values in tempLocation
	tempLocation.update(locationId);
		if (tempLocation.urlType != "cross-domain") {
		// Get success or error loading page
		$.ajax({
			url: tempLocation.url,
			async: false,
			success: function(data, textStatus){
				 ajaxResults.loadResult = textStatus;
			},
			error: function(XMLHttpRequest, textStatus){
				ajaxResults.loadResult = textStatus;
			}
		});
	} else {
		ajaxResults.loadResult = "inaccessible";
	}
	}

// Get Location ID (without #) from full URL; if no URL is passed,
// get URL from window.length
function getLocationId(urlStr) {
		if (arguments.length === 0) {
		urlStr = window.location.hash;
	}
	if (!urlStr) {
		return "";
	}
		// Extract string following the hash character
	var locationId = urlStr.replace(/^[^#]*#/, "");
	// Remove any query string
	locationId = locationId.replace(/\?[^\?]*$/, "");
	// Remove trailing slashes
	locationId = locationId.replace(/\/+$/, "");
		return locationId;
	}

// Update variable values if necessary and replace variable values in string.
// Variables are in the format [%variableName%] and will be replaced by the value
// with the corresponding property name in either currentLocation or site.
// If there are duplicate property names, the value in currentLocation has precedence.
// locationObj is passed if currentLocation isn't updated yet; they contain the same data
function replaceVars(templateStr, locationObj) {
		if (!templateStr) {
		return "";
	}
		var varsObj = {};
	var varValue = "";
	var varNames = [];
	var matchArray = [];
	var sectionTemplate = "";
	var sectionsStr = "";
	var anyVarPattern = /\[%(.+?)%\]/g;
	var sectionPattern = /\[%beginSection%\]([\s\S]+?)\[%endSection%\]/;
		// Copy values from data objects to varsObj
	copyToObject(site, varsObj);
	if (locationObj) {
		copyToObject(locationObj, varsObj);
	} else {
		copyToObject(currentLocation, varsObj);
	}
		// Add chapterNum var
	if (varsObj.chapter) {
		varsObj.chapterNum = varsObj.chapter;
		// Chapter number padded with zero if necessary
		varsObj.chapterNumPadded = padNum(varsObj.chapter, 2);
	}
	//	// Add playlist ID if there's a playlist
//	if (varsObj.playlist) {
//		varsObj.playlistId = flashManager.getPlaylistId();
//	}
		// Get array of variables in templateStr that will be replaced
	while ((matchArray = anyVarPattern.exec(templateStr)) !== null) {
		varNames.push(matchArray[1]);
	}
		// Create sections
	if ($.inArray("beginSection", varNames) != -1) {
		if ((matchArray = templateStr.match(sectionPattern)) !== null) {
			sectionTemplate = matchArray[1];
			
			// Each section
			for (var i = 0,
				 count = locationObj.sections.length,
				 sectionObj;
				 i < count;
				 i ++) {
				sectionObj = locationObj.sections[i];
				// Add the properties to varsObj.section object
				varsObj.section = {};
				copyToObject(sectionObj, varsObj.section);
				sectionsStr += replaceValues(sectionTemplate);
			}
		}
		templateStr = templateStr.replace(sectionPattern, sectionsStr);
	}
		// Replace variables
	if (varNames.length > 0) {
		templateStr = replaceValues(templateStr);
	} else {
		return templateStr;
	}
		return templateStr;
		
	// Replaec variables in passed string
	function replaceValues(str) {
		
		if (!str) {
			return "";
		}
		
		// Replace each variable in str
		for (var i = 0,
			 count = varNames.length,
			 varName = "",
			 varValue = "",
			 varPattern = new RegExp();
			 i < count;
			 i ++) {
			
			varName = varNames[i];
			// If variable is a property in a section (such as sections.1.url)
			if ((matchArray = varName.match(/sections\.(\d+)\.(.+)/)) !== null) {
				varValue = varsObj.sections[matchArray[1] - 1][matchArray[2]];
			// If variable is contained in an object (if there's a dot in the name)
			} else if ((matchArray = varName.match(/([^\.]+)\.(.+)/)) !== null) {
				if (varsObj[matchArray[1]]) {
					varValue = varsObj[matchArray[1]][matchArray[2]];
				} else {
					varValue = "";
				}
			// If variable isn't contained in an object
			} else {
				varValue = varsObj[varName];
			}
			if (typeof varValue == "undefined") {
				varValue = "";
			}
			varPattern = new RegExp("\\[%" + varName + "%\\]", "g");
			str = str.replace(varPattern, varValue);
		}
		
		return str;
		
	}
		
}// Remove unused Media Options from template
function removeMediaOptions(templateStr, locationObj) {
		// Download media link
	if (!locationObj.mediaOptions.downloadMedia) {
		templateStr = templateStr.replace(/<span class="downloadMedia">[\s\S]+?<\/span>/, "");
	}
	// Download transcript
	if (!locationObj.mediaOptions.downloadTranscript) {
		templateStr = templateStr.replace(/<span class="downloadTranscript">[\s\S]+?<\/span>/, "");
	}
	// View transcript
	if (!locationObj.mediaOptions.viewTranscript) {
		templateStr = templateStr.replace(/<div class="transcriptPane"><div class="transcriptText"><\/div><\/div>/, "");
		templateStr = templateStr.replace(/<div class="transcriptToggle">[\s\S]+?<\/div>/, "");
	}
		return templateStr;
	}

//// Set parameters for swfobject to prevent Flash from showing through
//// popup elements
//function setSwfobject() {
//	
//	if (typeof fo != "undefined") {
//		fo.addParam("wmode", "transparent");
//	}
//	
//}

// FILE LOADING FUNCTIONS

// Open page in popup window; parameters must be in the format
// of CSS attributes.
// contentStr is optional string to load into the window
function openPopup(url, classNames, navBarLink, contentStr) {
		// Default for navBarLink
	if (typeof navBarLink == "undefined") {
		navBarLink = false;
	}

	var useParams = "";
	var windowName = "";
	var newWindow;
	var classNamesArray = [];
	// Default parameters for popup window
	var windowParams = {
		toolbar: "no", // Show the tool (Back button etc. on FF) bar
		directories: "no", // Show directories/Links bar
		location: "no", // Show location/address bar (and back button on IE)
		resizable: "yes", // Make the window resizable
		menubar: "no", // Show the menu bar
		scrollbars: "yes", // Show scrollbars
		status: "no" // Show the status bar
	};
	var isWindowTooBig = false;
	var width = "";
	var height = "";
	var defaultWidth = 800;
	var defaultHeight = 560;
	var maxWidth = screen.width - 10;
	var maxHeight = screen.height - 60;
	var definitionWidth = "";
	var definitionHeight = "";
		// Get dimensions from Site Definition
	// Links on page
	if (!navBarLink) {
		definitionWidth = currentLocation.windowWidth;
		definitionHeight = currentLocation.windowHeight;
	// Nav bar links
	} else {
		definitionWidth = currentLocation.popupLocation.windowWidth;
		definitionHeight = currentLocation.popupLocation.windowHeight;
	}
		
		// If no class names in link, use linkStyle from Site Definition
	if (!classNames && currentLocation.linkStyle) {
		classNames = currentLocation.linkStyle;
	}
	if (classNames) {
		classNamesArray = classNames.split(" ");
	}
	// Use the url as the window name;
	if (url) {
		windowName = url;
		// Strip out extra chars
		windowName = windowName.replace(/http|\W/gi, "");
	} else {
		windowName = currentLocation.popupLocation.name;
	}
		// Get additional class names to set browser elements
	for (var i = 0; i < classNamesArray.length; i ++) {
		// Show all browser elements
		if (classNamesArray[i] == "showAll") {
			windowParams.toolbar = "yes";
			windowParams.directories = "yes";

			windowParams.location = "yes";
			windowParams.menubar = "yes";
			windowParams.status = "yes";
		// Show toolbar only
		} else if (classNamesArray[i] == "showNav") {
			if ($.browser.mozilla) {
				windowParams.toolbar = "yes";
			} else {
				windowParams.toolbar = "no";
			}
			windowParams.directories = "no";
			if ($.browser.msie) {
				windowParams.location = "yes";
			} else {
				windowParams.location = "no";
			}
			windowParams.menubar = "no";
			windowParams.status = "no";
		// No resize or scrollbars
		} else if (classNamesArray[i] == "fixed") {
			windowParams.scrollbars = "no";
			windowParams.resizable = "no";
		} else if (classNamesArray[i] == "noScroll") {
			windowParams.scrollbars = "no";
		} else if (classNamesArray[i] == "noResize") {
			windowParams.resizable = "no";
		}
		
		// Window styles specified by CSS classes
		switch(classNamesArray[i]) {
			case "vpg-ebook":
			case "vpgEbook":
			case "clEbook":
				width = "945";
				height = "720";
				break;
			case "crossword":
				// Crosswords must use this window name to work properly
				windowName = "crossword";
				width = "730";
				height = "530";
				break;
			case "timeline":
				width = "900";
				height = "680";
				break;
			case "speakUp":
				width = "775";
				height = "720";
				break;
			case "website":
				width = "1024";
				height = "768";
				windowParams.toolbar = "yes";
				windowParams.directories = "yes";
				windowParams.location = "yes";
				windowParams.menubar = "yes";
				windowParams.status = "yes";
				break;
			case "large":
				width = "1024";
				height = "768";
				break;
		}
	}
		// Set dimensions; priority is given as follows:
	// 1. Dimensions attached to styles in link class
	// 2. Dimensions set in Site Definition
	// 3. Default dimensions
	if (!width) {
		if (!definitionWidth || definitionWidth == "0") {
			width = defaultWidth;
		} else {
			width = definitionWidth;
		}
	}
	if (!height) {
		if (!definitionHeight || definitionHeight == "0") {
			height = defaultHeight;
		} else {
			height = definitionHeight;
		}
	}
		// Adjust size to fit screen if necessary
	windowParams.width = parseInt(width, 10);
	// Reduce window size if it is larger than screen size
	if (windowParams.width > maxWidth) {
		windowParams.width = maxWidth;
		isWindowTooBig = true;
	}
		windowParams.height = parseInt(height, 10);
	if (windowParams.height > maxHeight) {
		windowParams.height = maxHeight;
		isWindowTooBig = true;
	}
		windowParams.width = windowParams.width.toString();
	windowParams.height = windowParams.height.toString();
		// If window had to be scaled down to fit screen,
	// allow scrolling and resizing and put window at top of screen
	if (isWindowTooBig) {
		windowParams.scrollbars = "yes";
		windowParams.resizable = "yes";
		windowParams.top = 0;
	} else {
		windowParams.top = 20;
	}
		// Left position of window
	windowParams.left = Math.round((screen.width / 2) - (parseInt(windowParams.width, 10) / 2));

	// Create parameter string for window.open
	for (var name in windowParams) {
		useParams += (useParams === "") ? "" : ",";
		useParams += name + "=";
		useParams += windowParams[name];
	}
		// Open new window
	newWindow = window.open(url, windowName, useParams);
	if (contentStr) {
		newWindow.document.write(contentStr);
		newWindow.document.close();
	}
	// Move window forward if it is already open
	newWindow.focus();
	return false;
	}
	// Load login screen
function loadLogin(contentContainer) {
	var url = allSites.engineFiles.login;
		if (site.type == "4ltr") {
		url = allSites.engineFiles.login4ltr;
	}
		$.ajax({
		// Load custom login page
		url: url,
		success: function(loginText, textStatus) {
			var chapterStr = "";
			if (site.type == "4ltr") {
				// Replace "the Free Sample Chapter" with
				// sample chapter numbers
				chapterStr = "Chapter";
				if (site.chaptersFree.length > 1) {
					chapterStr += "s";
				}
				chapterStr += " "
							+ makeListWithCommas(site.chaptersFree);
				loginText = loginText.replace("the Free Sample Chapter", chapterStr);
			}
			$(contentContainer).html(loginText);
			// Display the appropriate heading, depending on whether
			// the login is on the home page or in an asset page
			if (site.type == "premium" || "resource_center") {
				$("div#contentArea div.loginHeading.home").hide();
				$("div#homeLogin div.loginHeading.asset").hide();
			} else if (site.type == "4ltr") {
				$("div#contentArea p.loginWelcome").hide();
			}
			// Add correct URL to Buy Online link
			$("a.buy-online").attr("href", site.siteFiles.buyOnline + site.isbnCore);
		}
	});
	}

// Make sure file is not binary file that can't be loaded
// into a page by AJAX; display error if necessary
function confirmFileIsLoadable(path) {
		var invalidExtensions = ["flv",
							"mp4",
							"mp3",
							"swf",
							"gif",
							"jpg",
							"zip",
							"pdf",
							"ppt",
							"doc"
							];
		var extension = getExtension(path).toLowerCase();
		if (!extension) {
		return true;
	} else if ($.inArray(extension, invalidExtensions) == -1) {
		return true;
	} else {
		alert("The file " + path + " cannot be loaded directly into a content page by AJAX because it is a binary file. You may need to correct the asset type for this file in site_definition.xml");
		return false;
	}

}

// RENDERING FUNCTIONS

// SHELL GRAPHICS

// Get logo file
function getLogoFile() {
		var subbrand = allSites.disciplines[site.discipline][1];
	var logoFilename = allSites.subbrands[subbrand][0] + ".jpg";

	return logoFilename;

}

// Load graphics for site shell; these graphics
// are all loaded as CSS background images
function loadImages() {
		// Logo
	var url = makePath([site.engineDirs.logos], getLogoFile());
	$("#logoForeground a").html('<img src="' + url + '" />');
		// Book cover
	url = makePath([site.siteDirs.images], "book_cover.jpg");
	// Book cover in upper left of Premium Site
	if (site.type !== "resource_center") {
		$("#bookInfoWrapper").css("backgroundImage", "url(" + url + ")");
	// Book cover in upper homeText section on resource center
	} else {
		$("#bookThumb").html('<img src="' + url + '" />');
	}
		// Image on Home Page
	if (site.type == "premium") {
		$("#home").css("background-image", "url(" + site.siteFiles.homePageImage + ")");
	}
		// Repeating Background Image on Resource Center Home Page
 	if (site.type == "resource_center") {
		url = makePath([site.engineDirs.images], "resource_center/home_page_toprepeat.jpg");
		$("#hometext").css("background-image", "url(" + url + ")").css("background-repeat", "repeat-y");

	}
	}

// INTERFACE CREATION FUNCTIONS

// Return true if all assets in bucket are protected;
// this will cause a lock icon to be put on the bucket's menu option
function isBucketProtected(bucketName) {
		var assetsInBucket = assets.getByBucket(bucketName);
	var isProtected = true;
		// Each asset in the bucket
	for (var i = 0,
		 count = assetsInBucket.length;
		 i < count; i ++) {
		
		if (!assetsInBucket[i].protected) {
			isProtected = false;
			break;
		}
		
	}
		return isProtected;
	}

// Make iframe code
function makeIframe(id, url, iframeHeight) {
		var iframeCode = "";
	var heightCode = "";
		if (iframeHeight != "auto") {
		heightCode = ' height="' + iframeHeight + '"';
	}
	iframeCode = '<iframe id="' + id + '" src="' + url + '"'
				+ ' width="100%"' + heightCode
				+ '" marginwidth="0" marginheight="0" vspace="0" hspace="0" frameborder="0"'
				+ ' scrolling="auto"></iframe>';
				
	return iframeCode;
	}

// Make title attribute for rollover cluetip;
// includeAttribName determines whether title= is included in string;
// defaults to true
function makeRolloverTitle(assetName, includeAttribName) {
		var titleStr = "";
	var assetObj = assets.get(assetName);
		if (typeof includeAttribName == "undefined") {
		includeAttribName = true;
	}
		// Rollover
	if (assetObj.blurb) {
//		titleStr += assetObj.title + '|';
		titleStr += '|' + assetObj.blurb;
	}
		if (includeAttribName) {
		titleStr = ' title="' + titleStr + '"';
	}
		return titleStr;
	}

		

// CONTENT LOADING FUNCTIONS

// Size iframe dynamically to fit content.
// If onLoad is true, wait for iframe to load before resizing;
// this only works with the first panel of a set of tabs; the other tabs
// must be sized when they are first viewed
function sizeIframe(frameId, onload) {
		var frameSelector = "#" + frameId;
	var currentHeight = $(frameSelector).attr("height");
		// Defaults to false
	if (typeof onload == "undefined") {
		onload = false;
	}
				
	// Resize iframe only if a fixed height has not already been set
	if (!currentHeight) {
		if (onload) {
			$(frameSelector).load(function() {
				setHeight(frameSelector);
			});
		} else {
			setHeight(frameSelector);
		}
	}
		// Set height of iframe
	function setHeight(frameSelector) {
		
		var bodyHeight = "";
		var heightOffset = 0;
		var minHeight = parseInt(allSites.defaultIframeHeight, 10);
		
		$(frameSelector).css({height: 0});
		bodyHeight = $(frameSelector).contents().find("body").attr("scrollHeight");
		// Add 10% to height to keep bottom from being cut off
		heightOffset = Math.round(bodyHeight / 10);
		bodyHeight += heightOffset;
		// iframe should at least be big enough to fill the page
		if (bodyHeight < minHeight) {
			bodyHeight = minHeight;
		}
		$(frameSelector).css({height: bodyHeight});
		
	}
	}

// Make asset page from template
function makeFromTemplate(location, contentContainer) {
	//	var pageStr = addPlaylistId(currentLocation.templateStr, contentContainer);
		$(contentContainer).html(location.templateStr);
	// Set behaviors for page
	$(document).ready(function() {
		initContentPage(contentContainer, location);
	});
	flashManager.setFlash(contentContainer, location);
	}

//// Add correct id to <ul> for playlist
//function addPlaylistId(templateStr) {
//	
//	var playlistId = "";
//	
//	if (currentLocation.playlist) {
//		playlistId = currentLocation.flashSettings.playlistId;
//		templateStr = templateStr.replace('class="playlist"', 'id="' + playlistId + '" $&')
//	}
//	
//	return templateStr;
//	
//}

// Make chapter glossary page
function makeGlossary(contentContainer) {
		var chapterNum = "";
		if (currentStatus.chapterView == "single") {
		chapterNum = currentLocation.chapter;
	}
		// Javascript to intialize glossary
	var glossaryStr = '<div id="glossary"></div>'
					+ '<script type="text/javascript">'
					+ 'glossary.initPage(' + chapterNum + ');'
					+ '</script>';
		// Add code to page
	$(contentContainer).html(glossaryStr);
	// If glossary has audio
	if (site.glossary.audio) {
		flashManager.setFlash(contentContainer, currentLocation);
	}
	}

// Return true if the asset passed can be have its iframe resized when loaded;
// if iframe is in a tab, it must be in the first tab; other iframes must be
// resized when they are first viewed
function canSizeIframe(assetName) {
	//	var firstTabId = "";
	var assetObj = assets.get(assetName);
	var sizable = false;
		// Can't resize iframe if URL is cross-domain
	if (getUrlType(assetObj.url) == "cross-domain") {
		sizable = false;
	} else {
		sizable = true;
	}
	//	// If asset is part of a bucket and will be loaded into bucket tabs;
//	// perform this check only if site shell is present
//	if (assetObj.bucket != "_none" && currentStatus.shell) {
//		// Allow sizing only if asset is loaded into first tab
//		if (isFirstTab(assetName)) {
//			sizable = true;
//		}
//	} else {
//		sizable = true;
//	}
		return sizable;

}

// Is the current asset loaded into the first bucket tab?
function isFirstTab(tabId) {
		var isFirstTab = false;
	var firstTabId = $("#bucketTabs div").attr("id");
		// If passed tab ID is ID of first tab
	if (tabId == firstTabId) {
		isFirstTab = true;
	}
		return isFirstTab;
	}

// Go to previous or next chapter
// navOption is "next" or "previous"
function goToChapter(position) {
		var chapterNum = parseInt(currentStatus.chapter, 10);
	var locationId = currentLocation.id;
	var canChange = false;
	var currentAsset = assets.get(currentLocation.name);
	// Available chapters
	var availableChapters = currentAsset.chaptersAvailable;
	var availableCount = availableChapters.length;
		// Previous chapter
	if (position == "previous") {
		if (chapterNum > parseInt(site.firstChapter, 10)) {
			chapterNum --;
			// If unavailable assets are set to display in menu and
			// if previous chapter isn't in available chapters,
			// look in available chapters to find the first lower number
			if (site.unavailableMenuOptions == "show"
				&& $.inArray(chapterNum.toString(), availableChapters) == -1) {
				for (var i = availableCount - 1, availableNum; i >= 0; i --) {
					availableNum = availableChapters[i];
					if (availableNum < chapterNum) {
						chapterNum = availableNum;
						canChange = true;
						break;
					}
				}
			} else {
				canChange = true;
			}
		}
	// Next chapter
	} else if (position == "next") {
		if (chapterNum < parseInt(site.lastChapter, 10)) {
			chapterNum ++;
			// If current chapter not available, find next available chapter
			if (site.unavailableMenuOptions == "show"
				&& $.inArray(chapterNum.toString(), availableChapters) == -1) {
				for (var i = 0, availableNum; i < availableCount; i ++) {
					availableNum = availableChapters[i];
					if (availableNum > chapterNum) {
						chapterNum = availableNum;
						canChange = true;
						break;
					}
				}
			} else {
				canChange = true;
			}
		}
	}
		if (canChange) {
		// Update chapter in Location ID
		locationId = locationId.replace(/\d+(:\w+)$/, chapterNum.toString() + "$1");
		// Force tab content to reload
		currentStatus.resetTabStatus();
		controller.showLocation(locationId);
	}
	}

// Show Coming Soon message
function showComingSoon(contentContainer, location) {
		var templateStr = allSites.templates.coming_soon;
	var comingSoonMessage = "";
	var varsObj = {};
	//	// If content is chapter specific
//	if (location.scope == "chapter") {
//		comingSoonMessage += site.labels.chapterSingular + " " + location.chapter + " ";
//	}
	comingSoonMessage += 'Content for ' + location.title + ' is';
	varsObj.message = comingSoonMessage;
	pageStr = replaceVars(templateStr, varsObj);
	$(contentContainer).html(pageStr);
	}

// Show Content Not Available message
function showNotAvailable(contentContainer, location) {
		var notAvailableMessage = '<div class="missing">' + location.title + " Content Not Available";
	if (location.scope == "chapter") {
		notAvailableMessage += " for This " + site.labels.chapterSingular;
	}
	notAvailableMessage += ".</div>";
	$(contentContainer).html(notAvailableMessage);
	}

// Check page to see if it loads;
// possible returned values are:
// login: SSO login screen is encountered because user hasn't logged in
// not found: page not found
// ok: page loads successfully
// When Firefox encounters a page not found redirect it returns a 0.
// When IE incounters a page not found redirect it returns 200 (OK)
function checkPageStatus(assetUrl, assetName) {
		var pageStatus = "ok";
		// Must assume that cross-domain URLs are OK.
	// Firefox can't check a cross-domain URL because AJAX call fails across domain.
	// IE 7 can often make successful AJAX requests across domains, but this sometimes fails.
	if (getUrlType(assetUrl) == "cross-domain") {
		return pageStatus;
	}
		try {
			$.ajax({
			url: assetUrl,
			async: false,
			complete: function(XMLHttpRequest, textStatus) {
				// If error getting page
				if (textStatus != "success") {
					// Determine whether it's a pge not found or the login screen
					if (!assets.get(assetName).protected
						|| XMLHttpRequest.status == "404"
						|| XMLHttpRequest.status == "0") {
							pageStatus = "not found";
					}
				// If page is returned, parse it to see if it's the login screen
				} else {
					if ((matchArray = XMLHttpRequest.responseText.match(allSites.loginPattern)) !== null) {
						pageStatus = "login";
					// If 404 is redirected to Cengage Home Page
					} else  if ((matchArray = XMLHttpRequest.responseText.match(allSites.notFoundPattern)) !== null) {
						pageStatus = "not found";
					}
				}
			}
		});
		
	} catch(e) {
		pageStatus = "login";
//		alert(e.message);

	}
		return pageStatus;
	}

// Make all links in div open their content in Tab 2
function makeOpenInTab(contentContainer) {
		$(contentContainer + " a").click(function() {
		var url = $(this).attr("href");
		loadIntoTab(url);
		return false;
	});

}

// Load asset section content into second tab (first tab is index)
function loadIntoTab(url) {
		$assetTabs.tabs("option", "disabled", []);
	fileLoader.loadFileIntoPage("div#tabsAsset", currentLocation, url);
	// Select second tab
	$assetTabs.tabs("select", 1);

}

// Initialize index tab by selecting first tab and disabling second
function initAssetTabs() {

	// Select first tab
	$assetTabs.tabs("select", 0);
	// Disable second tab
	$assetTabs.tabs("option", "disabled", [1]);

}

// Set the states of the Chapter View buttons according to the current mode
function setChapterViewButtons() {
		// Single
	if (currentStatus.chapterView == "single") {
		$(".allChapters").removeClass("selected");
		$(".thisChapter").addClass("selected");
	// All
	} else if (currentStatus.chapterView == "all") {
		$(".thisChapter").removeClass("selected");
		$(".allChapters").addClass("selected");
	}
		// Disable if scope is book
	if (currentLocation.scope == "chapter") {
		$(".chapterView").removeClass("inactive");
	} else {
		$(".chapterView").addClass("inactive");
	}
	}

// Get chapter title
function getChapterTitle(chapterNum) {
		var title = "";
	var titleInd = 0;
		if (chapterNum) {
		titleInd = parseInt(chapterNum, 10) - site.startChapterNumber;
		title = site.chapterTitles[titleInd];
	}
		return title;
	}

// Display chapter title
// Separator is the angle bracket character used for breadcrumbs
function makeChapterStr(separator) {
		var chapterStr = "";
	var openingCode = '<div class="breadcrumbChapter">';
		if (separator) {
		openingCode += separator;
	}
		if (currentLocation.type == "home") {
		chapterStr = openingCode
					+ '<span class="chapNum">Home Page</span>'
					+ '</div>';
	} else if (currentLocation.scope == "book") {
		chapterStr = openingCode
					+ '<span class="chapNum">Course Resource</span>'
					+ '</div>';
	} else if (currentLocation.chapter) {
		// Show chapter numbers
		if (site.showChapterNumbers) {
			chapterStr = openingCode + '<span class="chapNum">'
						+ currentStatus.chapter
						+ '. </span><span class="chapTitle">' + getChapterTitle(currentStatus.chapter)
						+ "</span></div>";
		// Suppress chapter numbers
		} else {
			chapterStr = openingCode + '<span class="chapNum">'
						+ getChapterTitle(currentStatus.chapter)
						+ "</span></div>";
		}

	}
		return chapterStr;
	}

// Initialize non-shell behaviors on page
function initSite() {
		// WINDOW TITLE
	document.title = site.title;
		// ASSET PAGE TABS
		$assetTabs = $("#assetTabs").tabs({
		
		// When tab is shown, resize iframe if it's not in the first tab;
		// first tab's iframe is resized when it is loaded
		show: function(event, ui) {
			var currentTab = ui.panel.id;
			var frameSelector =  currentTab + "-iframe";
			
			if (!isFirstTab(currentTab)) {
				sizeIframe(frameSelector);
			}
		},
		
		disabled: [1]
			
	});
	}

// Initialize behaviors on content page
function initContentPage(contentContainer, locationObj) {
		var linkSelector = "a.popup";
//	var classNames = "";
		// If linkStyle is set to popup, add popup behavior to all links on page
	if (locationObj.linkStyle && locationObj.linkStyle.indexOf("popup") === 0) {
		linkSelector = "a";
	}
		// Add popup behaviors to links (ignore links on tabs)
	$(contentContainer + " " + linkSelector).click(function() {
		
		// Get names in class attribute
		var classNames = $(this).attr("class");
//		// If no class attribute, use value from Site Definition
//		if (!classNames && locationObj.linkStyle) {
//			classNames = locationObj.linkStyle;
//		}
		// Get URL
		var url = $(this).attr("href");
				
		openPopup(url, classNames);
		
		return false;
		
	});
	}

// Load popup for Chapter Menu
function loadPopup(){
//	updateChapterLinks();
	//loads popup only if it is disabled
	if (currentStatus.chapterMenu === 0){
		$("#backgroundPopup").fadeIn("slow");
		$("#chapterMenu").fadeIn("slow");
		currentStatus.chapterMenu = 1;
	}
	}	

// Disable Chapter Menu
function disablePopup() {
		//disables popup only if it is enabled
	if (currentStatus.chapterMenu == 1){
		$("#backgroundPopup").fadeOut("slow");
		$("#chapterMenu").fadeOut("slow");
		currentStatus.chapterMenu = 0;
	}
	}
	// KLUDGE TO CHANGE IDS TO CLASSES IN SITE.CSS
// REMOVE WHEN NO LONG NECESSARY
function update4ltrStylesheet() {
		// Start timer to check whether stylesheet has loaded
	var poller = setInterval(checkStylesheet, 300);
		function checkStylesheet() {
		if (document.styleSheets[2]) {
			updateStylesheet();
			clearInterval(poller);
		}
	}
		function updateStylesheet() {
		
		var stylePattern = /#(currentChapter|previousChapter|nextChapter|selectChapter|sideMenuWrapper|chapterView|sideMenu)/g;
		var stylesheet = document.styleSheets[2];
		var allStyles;
		var newCss = "";
		var matchArray = [];
		var primaryColor = "";
		var colorPatternFf = /background-color: rgb\(\d+, \d+, \d+\) ! important;/;
		var colorPatternIe = /background-color: (#\w+)! important/i;
		
		// Firefox
		if (stylesheet.cssRules) {
			allStyles = stylesheet.cssRules;
			// Update each style
			for (var i = 0, count = allStyles.length, newStyle = ""; i < count; i ++) {
				newStyle = allStyles[i].cssText.replace(".selectChapter", ".popupMenu", "g");
				newStyle = newStyle.replace(stylePattern, ".$1");
				newStyle = newStyle.replace("\.sideMenuWrapper ", "");
				if (colorPatternFf.test(allStyles[i].style.cssText)) {
					newStyle = "a.loginBtn, " + newStyle;
				}
				allStyles[i].cssText = newStyle;
				stylesheet.deleteRule(i);
				stylesheet.insertRule(newStyle, i);
			}
		// IE
		} else if (stylesheet.cssText) {
			if ((matchArray = stylesheet.cssText.match(colorPatternIe)) !== null) {
				primaryColor = matchArray[1];
			}
			newCss = stylesheet.cssText.replace(".selectChapter", ".popupMenu", "g");
			newCss = newCss.replace(stylePattern, ".$1");
			newCss = newCss.replace("\.sideMenuWrapper ", "");
			newCss += "a.loginBtn { background-color: " + primaryColor + " !important };";
			document.styleSheets[2].cssText = newCss;
		}
	}
		
}////////////////////////////
// UTILITY FUNCTIONS
////////////////////////////

function isBoolean(value) {
	   if (typeof value == "boolean") {
      return true;
   } else {
      return false;
   }
	}

function busy() {

			$("html").addClass('busy');
			$("#loading").show();
}function notbusy() {

			$("html").removeClass('busy');
			$("#loading").hide();
}// Convert string to boolean
function strToBoolean(str) {
		switch (str) {
		case "true":
			return true;
		case "false":
			return false;
	}
	}

// Determine whether a variable is an object
function isObject(value) {
   if (typeof value == "object" && !$.isArray(value)) {
      return true;
   } else {
      return false;
   }
}// Copy all the properties from one object to another.
// Optional type parameter specifies that only values of that type
// should be copied.
function copyToObject(sourceObj, targetObj, type) {
		for (var name in sourceObj) {
		if (type) {
			if (typeof sourceObj[name] != type) {
				continue;
			}
		}
		targetObj[name] = sourceObj[name];
	}

}

// Remove filename from a path and return path;
// if removeSlash is true,
// returned value doesn't include final / at end of path
function removeFilename(fullPath, removeSlash) {
		if (!fullPath) {
		return "";
	}
		var pathNoFilename = fullPath.replace(/\/[^\/#]*(#.*)?$/, "");
		if (arguments.length == 2 && !removeSlash) {
		pathNoFilename += "/";
	}
		return pathNoFilename;
}// Remove file extension from a path and return path;
function removeExtension(fullPath) {
		if (!fullPath) {
		return "";
	}
		var pathNoExtension = fullPath.replace(/\.[^\.]*$/, "");
		return pathNoExtension;
	}

// Remove hash sign and following content from URL
function removeHash(url) {
		if (!url) {
		return "";
	}
		var urlNoHash =  url.replace(/#.*$/, "");
		return urlNoHash;
	}

// Get file extension from a path
function getExtension(fullPath) {
		if (!fullPath) {
		return "";
	}
		var matchArray = [];
	var extension = "";
		if ((matchArray = fullPath.match(/\.([^\.\/]*)$/)) !== null) {
		extension = matchArray[1];
	}
		return extension.toLowerCase();
	}

// Return the domain of the passed URL
function getHostname(url) {
		var domainStr = "";
	var matchArray = [];
		if ((matchArray = url.match(/^http:\/\/([^\/]+)/)) !== null) {
		domainStr = matchArray[1];
	}
		return domainStr;
	}

// Remove trailing slash from URL
function removeTrailingSlash(url) {
		return url.replace(/\/+$/, "");
	}

// Make path by concatenating an array of directory names and an optional filename;
// add or remove slashes as needed
function makePath(dirsArray, filename) {
		var path = "";
	var dir = "";
		if (dirsArray) {
		// Each directory
		for (var i = 0; i < dirsArray.length; i ++) {
			dir = dirsArray[i];
			if (dir) {
				// Remove leading slash from all but first dir
				if (i > 0) {
					dir.replace(/^\/+/, "");
				}
				if (dir.charAt(dir.length - 1) != "/") {
					dir += "/";
				}
				path += dir;
			}
		}
	}
		// Filename
	if (filename) {
		// Remove leading slash if necessary
		if (dir) {
			filename = filename.replace(/^\/+/, "");
		}
		// Add to path
		path += filename;
	}
		return path;
	}

// Get specified value from query string
function getValueFromQuery(name, queryStr) {
		var matchArray = [];
	var value = "";
	var valuePattern = new RegExp("[\\?&]" + name + "=([^&]+)");
		if ((matchArray = queryStr.match(valuePattern)) !== null) {
		value = matchArray[1];
	}
		return value;
	}

// Extract content from body tags
function extractBody(str) {
		// Remove content preceding body
	str = str.replace(/^[\s\S]*?<body[^>]*>/i, "")
	// Remove content following body
	str = str.replace(/<\/body[^>]*>[\s\S]*$/i, "")
		return str;
	}

// Pad out number with leading zeroes to equal value of places
function padNum(numberStr, places) {
	if (!numberStr) {
		return "";
	}
	// In case input value isn't string
	numberStr = numberStr.toString();
	// Add leading zeroes if necessary
	while (numberStr.length < places) {
		numberStr = "0" + numberStr;
	}
	return numberStr
}// Return filename from a path
function getFilename(fullPath) {
	if (!fullPath) {
		return "";
	}
	var slashPosition;
	// Check for either / or \
	slashPosition = fullPath.lastIndexOf("/");
	if (slashPosition == -1) {
		slashPosition = fullPath.lastIndexOf("\\");
	}
	var filename = fullPath.substring(slashPosition + 1);
	return filename;
}// Make sure string is a url
function isUrl(url) {
		var urlPattern = /^http:\/\//;
	if (urlPattern.test(url)) {
		return true;
	} else {
		return false;
	}
	}

// Add heading tags to text
function makeHead(str) {
		return "<p><b>" + str + "</b></p>";
	}

// Add bold tags to text
function makeBold(str) {
		return "<b>" + str + "</b>";
	}

// Make string into a link
function makeLink(str, href, classNames) {
		var classCode = "";
	var linkCode = "";
		if (classNames) {
		classCode = ' class="' + classNames + '"';
	}
		linkCode = '<a href="' + href + '"' + classCode + '>' + str + '</a>';
		return linkCode;
	}

// Makes a list of words from an array; inserts commas, and includes "and"
// eg, "one, two, and three"
function makeListWithCommas(itemArray) {
	var finalItem = itemArray.length - 1;
	var countItems = itemArray.length;
	var str = "";
	for (var i = 0; i < countItems; i ++) {
		// Add comma and "and" if necessary
		if (i > 0) {
			// Don't add comma before 'and' if there are only two resources in list
			if (countItems > 2) {
				str += ",";
			}
			if (i == finalItem) {
				str += " and ";
			} else {
				str += " ";
			}
		}
		str += itemArray[i];
	}
	return str;
}// Compare function for sort() to achieve sorting in numerical order
function numerical(value1, value2) {
	// Convert values to numbers
	value1 = parseInt(value1, 10);
	value2 = parseInt(value2, 10);
	if (value1 < value2) {
		return -1;								
	} else if (value1 > value2) {
		return 1;
	} else {
		return 0;
	}
}function showHideBook() {
		var homeTextUrl = "";	
		var groupName = currentLocation.resourceGroup;
		var groupInd = resourceCenter.getIndex(groupName);
		var homeURL = site.siteFiles.homePageBaseFilename + ".html";
		if (site.type == "resource_center") {
			homeTextUrl = site.siteFiles.homePageBaseFilename + ".html";
			if (site.showBook == "true") {
				if(currentLocation.type != "home") {
						$("#homePageImg").hide();	
						$("#homeIntro").hide();
						$("#bookInfoWrapper").show();	
						$("#homeImageBtm").show();
						fileLoader.loadFileIntoPage("#bookDesc", "", homeTextUrl);
						// $("#bookThumb").html('<img src="' + site.bookcoverImage + '" />');
						$("#bookTitle").html(site.title);
						$("#bookSubtitle").html('<strong>' + site.subtitle + '</strong>' + " " + site.edition);
						$("#edition").html("");
						$("#author").html('by ' + site.author);
				} else  {
						$("#homePageImg").show();	
						//$("img#homePageImg").attr("src", site.siteDirs.images + "/home_page.jpg");
						$("#homeIntro").show();
						$("#bookInfoWrapper").hide();	
						$("#homeImageBtm").hide();
						fileLoader.loadFileIntoPage("#homeIntro", "", homeURL);
				}
			}  else {
						//$("img#homePageImg").attr("src", site.siteDirs.images + "/home_page.jpg");
						$("#homeIntro").show();
						$("#bookInfoWrapper").hide();	
						$("#homeImageBtm").hide();
						fileLoader.loadFileIntoPage("#homeIntro", "", homeURL);
			}
		}
}
