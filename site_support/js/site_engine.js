/* CENGAGE LEARNING SITE ENGINE

This engine makes use of the jQuery JavaScript library. JQuery methods are preceded by the symbol "$." jQuery documentation can be found at http://docs.jquery.com/.
*/


// INSTANTIATE CLASSES


var sites = new Sites();
var siteData = new SiteData();
var buckets = new Buckets();
var assets = new Assets();
// For embedded pages
var currentLocation = new SiteLocation("current");
// For reporting and other functions that shouldn't update
// curentLocation
var tempLocation = new SiteLocation("temp");
var currentStatus = new Status();
var ajaxResults = new AjaxResults();
var constants = new ConstantValues();
var tracker;


// SETTINGS


// Forces the browser NOT to cache AJAX calls. 
$.ajaxSetup ({   
	cache: false  
});  

//// Extend JQuery to include a "slowslide" effects option that can be used
//// to slide accordion menu open more slowly
//$.extend($.ui.accordion.animations, {
//	slowslide: function(options) {
//		$.ui.accordion.animations.slide(options, {duration: 500});
//	}
//});


// CONSTANTS


// New Line
function ConstantValues() {
	this.NL = "\r\n";
}


// UTILITY FUNCTIONS


// Copy all the properties from one object to another.
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
// if removeSlahs is true,
// returned value doesn't include final / at end of path
function removeFilename(fullPath, removeSlash) {
	
	if (!fullPath) {
		return "";
	}
	
	var pathNoFilename = fullPath.replace(/\/[^\/#]*(#.*)?$/, "");
	
	if (arguments.length = 2 && !removeSlash) {
		pathNoFilename += "/";
	}
	
	return pathNoFilename;
}

// Remove file extension from a path and return path;
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

// Return the domain of the passed URL
function getHostname(url) {
	
	var domainStr = "";
	var matchArray = [];
	
	if ((matchArray = url.match(/^http:\/\/([^\/]+)/)) != null) {
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
		// Remove leading slash and add to path
		path += filename.replace(/^\/+/, "");
	}
	
	return path;
	
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
	// In case input value isn't string
	numberStr = numberStr.toString();
	// Add leading zeroes if necessary
	while (numberStr.length < places) {
		numberStr = "0" + numberStr;
	}
	return numberStr
}

// Get the filename without extension or suffix from a URL
function getBaseFilename(url) {
	
	// Remove path
	var slashPos = url.lastIndexOf("/");
	var baseFilename = url.substring(slashPos + 1);
	// Remove extension
	var dotPos = baseFilename.lastIndexOf(".");
	if (dotPos != -1) {
		baseFilename = baseFilename.substring(0, dotPos);
	}
	// Remove "-hover"
	baseFilename = baseFilename.replace("-hover", "");
	return baseFilename;
	
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


// CLASSES


// Sites 
// Stores data applicable to all Web sites
//
// PUBLIC PROPERTIES
// .isbn
// .dir
// .templates[assetType]		Text of asset templates

// PUBLIC METHODS
// .values						All site values
// .properties()				Array of properties for each site
// .get(isbn)					Get site object by isbn
// .getByName(name)				Get site object by name
// .add(isbn, dir)				Add data for a site
function Sites() {
	
	// Asset types and their corresponding template filenames (minus extension)
	var templateNames = {
						 video: "video",
						 audio: "audio"
						};
	
	// Discipline name, number, subrand, and directory name
	this.disciplines = {
					Accounting : ["400", "South-Western", ""],
					Anthropology : ["15", "Wadsworth", ""],
					Art : ["37", "Wadsworth", ""],
					Biology : ["22", "Brooks/Cole", ""],
					Business : ["", "South-Western", ""],
					"Business Law" : ["404", "South-Western", "blaw"],
					Chemistry : ["12", "Brooks/Cole", ""],
					"College Success": ["26", "Wadsworth", "collegesuccess"],
					Communication : ["48", "Wadsworth", ""],
					"Criminal Justice" : ["23", "Wadsworth", "criminaljustice"],
					"Decision Sciences" : ["412", "South-Western", "decisionsciences"],
					"Earth Science" : ["30", "Brooks/Cole", "earthscience"],
					Economics : ["413", "South-Western", ""],
					Education : ["3", "Wadsworth", ""],
					English : ["300", "Wadsworth", ""],
					Finance : ["414", "South-Western", ""],
					French : ["304", "Heinle", ""],
					German : ["305", "Heinle", ""],
					History : ["21", "Wadsworth", ""],
					Humanities : ["", "Wadsworth", ""],
					Italian : ["306", "Heinle", ""],
					Japanese : ["309", "Heinle", ""],
					Marketing : ["415", "South-Western", ""],
					Mathematics : ["1", "Brooks/Cole", ""],
					Music : ["2", "Wadsworth", ""],
					"Political Science" : ["20", "Wadsworth", "polisci"],
					Psychology : ["24", "Wadsworth", ""],
					"Social Work" : ["4", "Wadsworth", "social_work"],
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
	this.sitesDir = "";
	this.siteSupportDir = "site_support/";
	this.templatesDir = this.siteSupportDir + "templates/";
	this.jsDir = this.siteSupportDir + "js/";
	this.cssDir = this.siteSupportDir + "css/";
	this.customStylesheet = "styles.css";
	this.imagesDir = this.siteSupportDir + "images/";
	this.definitionFile = "site_definition.js";
	this.glossaryDataFile = "glossary/glossary_content.js";
	this.logosDir = "/images/header_logos/";
	this.jwPlayerDir = "/shared/jw_player/player.swf";
	this.loginFile = this.templatesDir + "login.html";
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
	
	// DECLARE PUBLIC METHODS
	
	// Return array of properties of site object
	this.properties = getProperties;
	// Takes name as parameter and returns siteObject
	this.get = getSiteByIsbn;
	// Add new site
	this.add = addSite;
	// Return array of ISBNs of all sites
	this.isbns = getIsbns;
	// Return array of all site directories
	this.dirs = getDirs;
	// Return object containing variables to be passed to Flash SWFObject
	this.getFlashVars = GetFlashVars;
	
	// FUNCTIONS FOR PUBLIC METHODS
	
	function getArray(property, filter, values) {
		
		var itemsArray = new Array();
		
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
		
		var propertiesArray = new Array();
		
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
				break;
			}
		}
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
	
	// Variables to be passed to Flash SWFObject
	function GetFlashVars(playerType) {
		
		var varsObj = {};
		
		varsObj.flashvars = {
			// Path to FLV file
			'file':                '',
			'backcolor':           'efecec',
			'frontcolor':          '404040',  
			'id':                  'flashPlayer',
			'seamlesstabbing':		'true',
			'autostart':           'false'
			};
		
		varsObj.params = {
			'allowscriptaccess':   'sameDomain',
			'bgcolor':             'FFFFFF',
			'wmode':				'transparent'
			};
		
		varsObj.attributes = {
			'id':                  'flashPlayer',
			'name':                'flashPlayer'
			};
		
		// Add additional parameters for specific player types
		switch(playerType) {
			case "video":
				varsObj.flashvars.plugins = "captions-1";
				varsObj.flashvars.captions = "";
				varsObj.flashvars["captions.fontsize"] = "16";
				varsObj.flashvars["captions.back"] = "true";
				varsObj.flashvars.plugins = "captions-1";
				varsObj.params.allowfullscreen = "true";
				break;
			case "audio":
				varsObj.params.allowfullscreen = "false";
				break;
		}
			
		
		return varsObj;
	
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
		
		for (name in templateNames) {
			url = makePath([this.templatesDir], templateNames[name] + ".html");
			$.ajax({
				url: url,
				async: false,
				success: function(data, textStatus){
					templatesObject[name] = data;
				},
				error: function(XMLHttpRequest, textStatus){
					alert("Couldn't load asset template file " + url);
				}
			})
		}
		
		return templatesObject;
		
	}

	
}

// General Site Data
function SiteData() {

	var currentSiteData = {};
	
	// Properties
	// Possible templates are: studious
	this.templateType = "studious";
	// Specific default template file;
	this.template = "shell.html";
	this.stylesheet = "";
	this.chapters = [];
	this.chapterCount = 0;
	this.demoChapters = [];
	this.firstChapter = "1";
	this.lastChapter = "";
	
	this.discipline = "";
	this.isbnCore = "";
	// SSO ISBN
	this.isbn = "";
	this.title = "";
	this.subtitle = "";
	this.bookId = "";
	this.author = "";
	this.authorShort = "";
	this.editionNumber = "";
	this.editionType = "";
	this.edition = "";
	
	this.dir = "";
	this.assetsDir = "";
	this.imagesDir = "";
	this.hostname = window.location.hostname;
	
	// Methods
	this.update = updateSiteData;
	
	// Update site data values from loaded configuration information
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
		
		// Get data for this site from global sites definition
		currentSiteData = sites.get(currentLocation.isbn);
		
		// Load the data into the siteData properties
		for (var name in currentSiteData) {
			this[name] = currentSiteData[name];
		}
		
		// Directory to store images
		this.imagesDir = makePath([this.dir, "images/"])
	
		// Load definition file for site
		loadSiteDefinition();
		
		this.chapterCount = this.chapters.length;
		
		if (this.editionType) {
			this.edition += this.editionType + " ";
		}
		this.edition += ordinals[parseInt(this.editionNumber, 10) - 1] + " Edition";
		
		// If assetsDir was specified in site definition file, replace vars
		if (this.assetsDir) {
			this.assetsDir = replaceVars(this.assetsDir);
		// Otherwise use site dir
		} else {
			this.assetsDir = this.dir;
		}
		
		// Get template type from template filename
		this.templateType = this.template.replace(/(_[\d_]+)?\.html/, "");
		
		// Get first and last active chapters
		if (this.demoChapters.length > 0) {
			this.firstChapter = this.demoChapters[0];
			this.lastChapter = this.demoChapters[this.demoChapters.length - 1];
		} else {
			this.lastChapter = this.chapterCount.toString();
		}
		
	}
	
}

// Buckets
// Stores bucket data

// PUBLIC PROPTERTIES
// .name
// .title
// .shortBlurb
// .longBlurb
// .icon
// .interface
// .assets							Names of assets in bucket

// PUBLIC METHODS
// .values							All bucket values
// .filter							Limits listing of buckets to filtered values;
//									Possible values: all | navbar | menu
// .names(filter)					Array of all names; can use optional filter
// .titles(filter)					Array of all titles; can use optional filter
// .properties()					Array of properties for each bucket
// .get(name)						Get bucket object by name
// .getByTitle(title)				Get bucket object by title
// .getIndex(name)					Get index of specified bucket
// .add(name, title, shortBlurb, longBlurb, interface)
//									Add a bucket
function Buckets() {
	
	// Data values
	this.values = [];
	
	// PUBLIC METHODS
	
	// Value can be all or menu; limits listing of names or titles
	// to only buckets in those categories
	this.filter = "all";
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
	this.values.push(new bucketObj(["_none", "", "", "", "", "menu"]));
	
	// Data object for each object in bucketValues
	function bucketObj(bucketValues) {
		
		var propertyNames = ["name", "title", "shortBlurb", "longBlurb", "icon", "interface", "assets"];
		
		// Add each property
		for (var i = 0,
			 count = propertyNames.length;
			 i < count;
			 i ++) {
			
			// If property is not passed as a parameter, set it to ""
			if (typeof bucketValues[i] == "undefined") {
				this[propertyNames[i]] = "";
			// Otherwise set property from passed parameter
			} else {
				this[propertyNames[i]] = bucketValues[i];
			}
			
		}
		
		// Assets
		this.assets = [];
		
		
		// Set interface type if not passed as parameter;
		// premium assets are buttons; others are menu
		if (!this.interface) {
			if (this.name == "navbar") {
				this.interface = "navbar";
			} else {
				this.interface = "menu";
			}
		}
		
	}

	// Methods for getting names and titles
	function getNames(filterValue) {
		// Use current filter if temporary filter value isn't passed
		if (arguments.length == 0) {
			filterValue = this.filter;
		}
		return getArray("name", filterValue, this.values);
	}
	function getTitles(filterValue) {
		if (arguments.length == 0) {
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
				case "navbar":
					if (values[i].interface == "navbar") {
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
		newValues = new bucketObj(bucketValues);
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
	
}

// Assets
// Stores asset data

// PUBLIC PROPERTIES
// .name					Name of asset
// .title					Title of asset
// .assetType				"html | ilrn | index"
// .bucket					If an asset is not in a bucket, bucket = "_none"
// .blurb					Description
// .url						URL of asset file
// .scope					"book | chapter"
// .sections				"single | multiple" (if multiple, there will be a menu with tabs
// 							For the different sections)
// .protected				Whether asset is protected (true | false)
// .freeChapters			Array of free sample chapter numbers
// .missingChapters			Array of chapter numbers for chapters missing content
// .iframeHeight			Default value for iframeHeight
// .icon					Filename of icon for menu
// .linkStyle				Style of "popup" to specify window parameters

// PUBLIC METHODS
// .values							All bucket values
// .filter = "all|menu"				Limits listing of buckets to filtered values
// .names(filter)					Array of all names; can use optional filter (all, menu)
// .titles(filter)					Array of all titles; can use optional filter
// .properties()					Array of properties for each asset
// .get(name)						Get asset object by name
// .getByTitle(title)				Get asset object by title
// .getByBucket(bucketName)			Get assets in specified bucket
// .getIndex(name)					Get index of specified asset
// .add(<array of asset values>)	Add new asset
function Assets() {
	
	this.values = [];
	
	// Value can be all or menu; limits listing of names or titles
	// to only assets in those categories
	this.filter = "all";
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
	// Get index of asset withing bucket
	this.getBucketIndex = getIndexInBucket;
	// Add new asset
	this.add = addAsset;

	// Data object for each object in Assets.values; 
	// argument is an array of property values
	function AssetObj(assetValues) {
		
		var propertyNames = ["name",
							 "title",
							 "bucket",
							 "assetType",
							 "scope",
							 "sections",
							 "blurb",
							 "protected",
							 "url",
							 "freeChapters",
							 "missingChapters",
							 "iframeHeight",
							 "icon",
							 "linkStyle",
							 "playerWidth",
							 "playerHeight"];
		
		// Add each property
		for (var i = 0,
			 count = propertyNames.length;
			 i < count;
			 i ++) {
			
			// If property is not passed as a parameter, set it to ""
			if (typeof assetValues[i] == "undefined") {
				this[propertyNames[i]] = "";
			// Otherwise set property from passed parameter
			} else {
				this[propertyNames[i]] = assetValues[i];
			}
			
		}
		
		// If there's no bucket, set bucket to "_none"
		if (!this.bucket) {
			this.bucket = "_none";
		}
		
		// Check URL, and if it's the ILRN hostname, 
		// set assettype to ilrn
		if (getHostname(this.url) == sites.ilrnHostname) {
			this.assetType = "ilrn";
		}
		
		// Popup or embedded
		if (buckets.get(this.bucket).interface == "menu") {
			this.behavior = "embedded";
		} else {
			this.behavior = "popup";
		}
	}

	// Methods for getting names and titles
	function getNames(filterValue) {
		// Use current filter if temporary filter value isn't passed
		if (arguments.length == 0) {
			filterValue = this.filter;
		}
		return getArray("name", filterValue, this.values);
	}
	function getTitles(filterValue) {
		if (arguments.length == 0) {
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
				// If asset is in a bucket with navbar interface
				case "navbar":
					if (buckets.get(values[i].bucket).interface == "navbar") {
						itemsArray.push(values[i][property]);
					}
					break;
				// If asset is not in a bucket with navbar interface
				// it will be included in the menu
				case "menu":
					if (buckets.get(values[i].bucket).interface != "navbar") {
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
	
	// Add a new asset; abort if bucket already exists;
	// argument is array of property values
	function addAsset(assetValues) {
		
		var newValues;
		
		// Create asset
		newValues = new AssetObj(assetValues);
		this.values.push(newValues);
	}
	
}

// PUBLIC METHODS
// .resetTabStatus 			Set loaded status of all tabs to false
// .update 					Set current chapter and and tab status
// .updateChapterView		Set chapterView to "single | all"

// Status of states, such as current chapter
function Status() {
	
	var browserName = "";
	
	// Whether content should be displayed in site shell;
	// true | false
	this.shell;
	// Whether popup chapter menu is being displayed
	this.chapterMenu = 0;
	// Number of current chapter; if viewing a book asset,
	// this value holds the last chapter that was viewed
	this.chapter = "";
	// "single" | "all"
	this.chapterView = "single";
	// Browser being used
	this.browser = "";
	// Array specifying whether a tab has the correct content loaded into it
	// true | false
	this.tabLoaded = [];
	// Name of bucket if there is content in the bucket tabs
	this.tabContent = "";
	
	$.each($.browser, function(name, isTrue) {
		if (isTrue) {
			browserName = name;
		}
	});
	
	this.browser = browserName;
	
	// PUBLIC METHODS
	
	// Set loaded status of all tabs to false
	this.resetTabStatus = ResetTabStatus;
	// Set current chapter and and tab status
	this.update = Update;
	// Update chapterView setting
	this.updateChapterView = UpdateChapterView;
	
	// Functions for Public Methods
	
	function ResetTabStatus() {
		
		for (var i = 0, count = this.tabLoaded.length; i < count; i ++) {
			this.tabLoaded[i] = false;
		}
		
	}
	
	function Update() {
		
		// If no chapter has been selected, set chapter to first available chapter
		if (!this.chapter) {
			this.chapter = siteData.firstChapter;
		// Otherwise reset tab status if chapter has changed
		} else if (currentLocation.chapter != this.chapter) {
			this.chapter = currentLocation.chapter;
			this.resetTabStatus();
		}
		
	}
	
	function UpdateChapterView(viewValue) {
		
		// Reset tab status if chapter view has changed
		if (this.chapterView != viewValue) {
			this.chapterView = viewValue;
			this.resetTabStatus();
		}
		
	}
	
}

// Results of AJAX calls
function AjaxResults() {
	
	// Result of last attempt to load page load
	this.loadResult = "";
	// Content of last page loaded
	this.pageContent = "";
	
}

// SiteLocation
// Stores info about a content location; updated every time a location changes
//
// classType parameter is "current," "section," or "temp"; 
// if "current," data for popup pages
// is stored in .popupLocation; otherwise it's stored
// in the primary class properties;
// "section" is used for section files (multiple files per chapter)
// that are loaded into tabs; temp is used for reports, etc.
//
// PUBLIC PROPERTIES
// .isbn					SSO ISBN for site
// .parameter				"standalone" | "report"
// .shell					Whether site shell is being rendered (true | false)
// .type					Type of content ("all sites" | "asset" | "bucket" | "home page"
//							| "section")
// .assetType				Type of asset ("html" | "glossary" | "index" | "ilrn")
// .behavior				embedded | popup
// .name					Name of asset or bucket
// .title					Title of asset or bucket
// .chapter					Chapter number
// .menuName				Name of menu option under with the asset is located
// .bucket					Name of bucket that constitutes or contains the location
// .bucketInd				0-based index of position of asset within bucket;
//							0 if location is a bucket; -1 for asset is not in bucket
// .scope					chapter | book
// .sections				"multiple" if each chapter contains multiple files;
// 							otherwise "single"
// .url						URL for asset file
// .urlType					Type of URL (absolute | relative to server |
//							relative to site | cross-domain | hard disk)
// .id						Location ID
// .popupLocation			Info for last popup page that was opoened;
//							contains all the properties of its parent class
// .classType				Value passed for classType as a parameter
// .iframeHeight			If this contains a value, the page will be loaded into
//							an iframe; value is a number or "auto" to autosize the 
//							frame to the content

// PUBLIC METHODS
// .update(locationId)		Update the values stored in location object

function SiteLocation(classType) {
	
	copyToObject(new LocationObj(), this);
	// For storing properties for popup page
	this.popupLocation = new LocationObj();
	this.classType = classType;

	// Object for structuring data for this class
	function LocationObj() {
		
		// Properties
		this.isbn = "";
		this.parameter = "";
		// home | bucket | asset
		this.type = "";
		// embedded | popup
		this.behavior = "";
		this.name = "";
		this.title = "";
		this.menuName = "";
		this.bucket = "";
		this.bucketInd = 0;
		this.assetType = "";
		this.scope = "";
		this.sections = "";
		this.chapter = "";
		this.url = "";
		this.urlType = "";
		this.dir = "";
		this.id = "";
		this.iframeHeight = "";
		this.templateStr = "";
		this.flashSettings = {};
		
	}
	
	// Methods
	this.update = parseLocation;
	
	// Get properties from locationId
	function parseLocation(urlStr) {
		
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
		var properties = ["name", "chapter"];
		// Extract string following the hash character
		var locationId = getLocationId(urlStr);
		
		// Get parameter
		if ((matchArray = locationId.match(/^([^\:]+)\:([^\:]+)$/)) != null) {
			locationObj.parameter = matchArray[2];
			locationId = matchArray[1];
		}
		
		// Get isbn; if there's no isbn in locationId, it will stay the same;
		// remove isbn from locationId
		if ((matchArray = locationId.match(/^(\d{9}[\dxX]|\d{13})(?:\/(.*))?/)) != null) {
			locationObj.isbn = matchArray[1];
			locationId = matchArray[2];
			// If Firefox returns "undefined" here
			if (!locationId) {
				locationId = "";
			}
		// If ISBN is in not in Location ID, get it from siteData
		} else if (siteData.isbn) {
			locationObj.isbn = siteData.isbn;
//		// Otherwise get it from previous location
//		} else if (this.isbn) {
//			locationObj.isbn = this.isbn;
		// If there's no ISBN, show index for all sites
		} else {
			locationObj.isbn = "";
			locationObj.type = "all sites";
		}

		// Get name and chapter
		if ((matchArray = locationId.match(/^([^\/]+)?(?:\/([^\/]+))?/)) != null) {
			locationObj.name = matchArray[1];
			if (matchArray[2]) {
				locationObj.chapter = matchArray[2];
			}
		}
		
		// Shell
		// If shell status hasn't already been set
		if (!currentStatus.shell) {
			// Whether to use site shell
			if (locationObj.parameter == "shell"
				|| locationObj.name == "home"
				|| (!locationId && locationObj.isbn)) {
				currentStatus.shell = true;
			} else {
				currentStatus.shell = false;
			}
		}

		// If asset data has been loaded
		if (assets.names().length > 0) {
		
			// If a chapter is specified for the home page,
			// go to first asset in menu; this will occur when chapter
			// is selected from home page
			if (locationObj.chapter && !locationObj.name) {
				if (locationObj.chapter) {
					locationObj.name = getFirstAsset();
					locationObj.type = "asset";
				}
			}
			
			// Get type (and create name if necessary)
			if (locationObj.parameter == "report") {
				locationObj.type = "report";
			} else if (!locationId || locationObj.name == "home") {
				locationObj.name = "home";
				locationObj.type = "home";
				locationObj.scope = "book";
			} else if (getContentType(locationObj.name) == "asset") {
				locationObj.type = "asset";
			// If Location ID is a bucket, change it to the first asset in the bucket
			} else if (getContentType(locationObj.name) == "bucket") {
				locationObj.bucket = locationObj.name;
				locationObj.menuName = locationObj.bucket;
				locationObj.bucketInd = 0;
				locationObj.name = buckets.get(locationObj.bucket).assets[0];
				locationObj.type = "asset";
			} else {
				resolvedName = parseVerboseIdName(locationObj.name);
				if (resolvedName) {
					locationObj.name = resolvedName;
					locationObj.type = "asset";
				} else {
					locationObj.type = "error";
				}
			}
			
			// Get behavior (embedded or popup)
			if (locationObj.type == "asset") {
				locationObj.behavior = assets.get(locationObj.name).behavior;
			} else {
				locationObj.behavior = "embedded";
			}
			
			// Get bucket, bucket index, and menuName
			
			// If asset
			if (locationObj.type == "asset") {
				locationObj.bucket = assets.get(locationObj.name).bucket;
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
			}
			
			//Get title
			if (locationObj.type == "asset") {
				locationObj.title = assets.get(locationObj.name).title;
			} else if (locationObj.type == "home") {
				locationObj.title = "Home Page";
			}
			
			// If not home page and no chapter specified, use current chapter or Chapter 1
			if (locationObj.type != "home" && !locationObj.chapter) {
				if (currentStatus.chapter) {
					locationObj.chapter = currentStatus.chapter;
				} else {
					locationObj.chapter = siteData.firstChapter;
				}
			}
			
			// Get URL, urlType, dir, iframeHeight, and other properties
			if (locationObj.type == "asset") {
				locationObj.url = assets.get(locationObj.name).url;
				// Replace variables in URL string
				locationObj.url = replaceVars(locationObj.url, locationObj);
				// Get type of URL
				locationObj.urlType = getUrlType(locationObj.url);
				// If URL is relative to site root, add assetDir
				if (locationObj.urlType == "relative to site") {
					locationObj.url = siteData.assetsDir + locationObj.url;
				}
				// URL with extension removed from filename
				locationObj.urlNoExtension = removeExtension(locationObj.url);
				// Directory of asset
				locationObj.dir = removeFilename(locationObj.url);
				// iframe setting
				locationObj.iframeHeight = assets.get(locationObj.name).iframeHeight;
				// Type of asset
				locationObj.assetType = assets.get(locationObj.name).assetType;
				// Scope of asset
				locationObj.scope = assets.get(locationObj.name).scope;
				// Whether there are multiple sections
				locationObj.sections = assets.get(locationObj.name).sections;
				// Width of Flash Player
				locationObj.playerWidth = assets.get(locationObj.name).playerWidth;
				// Height of Flash Player
				locationObj.playerHeight = assets.get(locationObj.name).playerHeight;
			}
			
			// Template
			// Get template code, set Flash variables
			if (locationObj.assetType == "video" || locationObj.assetType == "audio") {
				// Get template and replace variables in it
				locationObj.templateStr = replaceVars(sites.templates[locationObj.assetType], locationObj);
				locationObj.flashSettings = sites.getFlashVars(locationObj.assetType);
				locationObj.flashSettings.flashvars.file = locationObj.url
				locationObj.flashSettings.flashvars.captions = locationObj.urlNoExtension + ".xml";
			}
			
//			if (classType != "temp") {
//				// Set chapter status
//				currentStatus.chapter = locationObj.chapter;
//			}
			
		}
		
		// Get Location ID
		locationObj.id = locationObj.isbn + "/" + locationObj.name + "/" + locationObj.chapter;
		// Add parameter
		if (classType != "temp") {
			if (currentStatus.shell) {
				locationObj.id += ":shell";
			} else if (locationObj.parameter) {
				locationObj.id += ":" + locationObj.parameter;
			}
		}
		
		// If page is popup and class is being used to store current page locations,
		// copy location to popup property
		if (locationObj.behavior == "popup" && this.classType == "current") {
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
		
		return locationObj.behavior;
		
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
		
}

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
				chapterInd < siteData.chapterCount; chapterInd ++) {
			
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
	
	// Bibliographic data
	this.text = makeHead("SITE REPORT")
				+ "<p>"
				+ makeBold("Title: ") + siteData.title + "<br />"
				+ makeBold("Author: ") + siteData.author + "<br />"
				+ makeBold("Edition: ") + siteData.editionNumber + "<br />"
				+ makeBold("Core Text ISBN: ") + siteData.isbnCore + "<br />"
				+ makeBold("SSO ISBN: ") + siteData.isbn + "<br />"
				+ makeBold("Number of Chapters: ") + siteData.chapterCount + "<br />"
				+ makeBold("Site Directory: ") + siteData.dir + "<br />"
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

// List all sites
function AllSitesIndex() {
	
	var allIsbns = sites.isbns();
	var allDirs = sites.dirs();
	var sitesList = "";
	var baseUrl = removeHash(window.location.href);
	
	this.text = "";
	
	for (var i = 0,
		 url = "",
		 isbn = "";
		 i < allIsbns.length; 
		 i ++) {
		url = baseUrl + "#" + allIsbns[i];
		sitesList += "<p>" + makeBold('<a href="' + url + '">' + allIsbns[i] + "</a><br />")
					+ allDirs[i] + "</p>"
	}
	
	
	this.text = makeHead("WEB SITES")
		+ sitesList;
	
}


// PARSING FUNCTIONS


// Get first asset in menu
function getFirstAsset() {

	return assets.names("menu")[0];
	
}

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
// "absolute"
// "cross-domain"
// "hard disk" [file on hard disk]
// "relative to server" [relative to server root]
// "relative to site" [relative to site root]
function getUrlType(url) {
	
	var urlType = "";
	var matchArray = [];
	
	// Check for http://
	if ((matchArray = url.match(/^http\:\/\//)) != null) {
		urlType = "absolute";
		// If URL has different hostname than the site URL
		if (getHostname(url) != siteData.hostname) {
			urlType = "cross-domain";
		}
	} else if ((matchArray = url.match(/^file\:\/\//)) != null) {
		urlType = "hard disk";
	// Check for leading slash
	} else if ((matchArray = url.match(/^\//)) != null) {
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
	
	var assetName = "";
	var chapterNum = "";
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
				chapterInd < siteData.chapterCount; chapterInd ++) {
			
			chapterNum = chapterInd + 1;
			results = callbackFunction(assetName, chapterNum, results);
			
		}
		
	}
	
	return results;
	
}

// Get content for URL; get only content within body tags
function getPage(url) {
	
	// Clear value of last page loaded
	ajaxResults.pageContent = "";
	// Get page content
	$.ajax({
		url: url,
		complete: function(data, textStatus){
			ajaxResults.loadResult = textStatus;
			if (textStatus == "success") {
				// Remove content preceding body
				data = data.replace(/^[\s\S]*?<body[^>]*>/i, "")
				// Remove content following body
				data = data.replace(/<\/body[^>]*>[\s\S]*$/i, "")
				ajaxResults.pageContent = data;
			}
		}
	})
	
}

// THIS FUNCTION NOT YET USED
// Get content of specified asset page
function getPageByName(assetName, chapterNum) {
	
	// Clear value of last page loaded
	ajaxResults.pageContent = "";
	var varsObj = {chapter: chapterNum};
	var urlPattern = assets.get(assetName).url;
	// URL of page
	var url = makePath([siteData.assetsDir], replaceVars(urlPattern, varsObj));
	
	// Get page content
	$.ajax({
		url: url,
		async: false,
		success: function(data, textStatus){
			 ajaxResults.pageContent = data;
		}
	})
	
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
		})
	} else {
		ajaxResults.loadResult = "inaccessible";
	}
	
}

// Get Location ID from full URL; if no URL is passed,
// get URL from window.length
function getLocationId(urlStr) {
	
	if (arguments.length == 0) {
		urlStr = window.location.hash;
	}
	if (!urlStr) {
		return "";
	}
	
	// Extract string following the hash character
	var locationId = urlStr.replace(/^[^#]*#/, "");
	
	return locationId;
	
}

// Update variable values if necessary and replace variable values in string.
// Variables are in the format [%variableName%] and will be replaced by the value
// with the corresponding property name in either currentLocation or siteData.
// If there are duplicate property names, the value in currentLocation has precedence.
// locationObj is passed if currentLocation isn't updated yet; they contain the same data
function replaceVars(str, locationObj) {
	
	if (!str) {
		return "";
	}
	
	var varsObj = {};
	var varValue = "";
	var varPattern = new RegExp();
	
//	// Get chapter number from passed object if possible
//	if (locationObj) {
//		if (typeof locationObj.chapter != "undefined") {
//			chapterNum = locationObj.chapter;
//		}
//	// Otherwise get it from currentLocation
//	} else {
//		if (typeof currentLocation.chapter != "undefined") {
//			chapterNum = currentLocation.chapter;
//		}
//	}
	
	// Copy values from data objects to varsObj
	copyToObject(siteData, varsObj, "string");
	if (locationObj) {
		copyToObject(locationObj, varsObj, "string");
	} else {
		copyToObject(currentLocation, varsObj, "string");
	}
	
	// Add chapterNum var
	varsObj.chapterNum = varsObj.chapter;
	// Chapter number padded with zero if necessary
	varsObj.chapterNumPadded = padNum(varsObj.chapter, 2);
	
	// Update replaceable variables to add sitesDir
	varsObj.sitesDir = removeTrailingSlash(sites.sitesDir);
	
	// Replace variables in passed string
	for (var name in varsObj) {
		varValue = varsObj[name];
		// Replace variables in value of var
		for (var varName in varsObj) {
			varPattern = new RegExp("\\[%" + varName + "%\\]", "g");
			varValue = varValue.replace(varPattern, varsObj[varName]);
		}
		varPattern = new RegExp("\\[%" + name + "%\\]", "g");
		str = str.replace(varPattern, varValue);
	}
	
	return str;
	
}
//
//// Set parameters for swfobject to prevent Flash from showing through
//// popup elements
//function setSwfobject() {
//	
//	if (typeof fo != "undefined") {
//		fo.addParam("wmode", "transparent");
//	}
//	
//}

// Set variables in Flash SWFObject to load player
function setFlash() {
	
	var width = "";
	var height = "";
	var flash = currentLocation.flashSettings;
	
	switch (currentLocation.assetType) {
		case "video":
			width = currentLocation.playerWidth;
			height = currentLocation.playerHeight;
			break;
		case "audio":
			width = "350";
			height = "20";
	}
		
//	flash.flashvars.file = currentLocation.url
//	flash.flashvars.captions = currentLocation.urlNoExtension + ".xml";
	
	swfobject.embedSWF(sites.jwPlayerDir, 'player', width, height, '9.0.124', false, flash.flashvars, flash.params, flash.attributes);
	
}

// Set data path for FAE asset
function setFaeDataPath() {
	
	// Folder containing FAE data files
	params.folder_path = removeFilename(currentLocation.url, true);

}

// Updates code in content page so it will function properly when loaded in a div
function preparePageCode(pageStr) {
	
	pageStr = updateRelativeUrls(pageStr);
	pageStr = updateFlashVars(pageStr);
	
	return pageStr;
	
	// PRIVATE METHODS
	
	// Update URLs in page to point to base URL for page
	function updateRelativeUrls(pageStr) {
		
		pageStr = pageStr.replace(/(src ?= ?| href ?= ?)"([^"]+)"/gi, function (matchStr, attrib, url) {
			var newStr = "";
			if (getUrlType(url) == "relative to site") {
				newStr = attrib + '"' + currentLocation.dir + url + '"';
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
			if ((matchArray = matchStr.match(/wmode ?\= ?"transparent"/i)) == null) {
				return embedCode + ' wmode="transparent">';
			} else {
				return matchStr;
			}

		});
		
		return pageStr;
		
	}
	
}



// FILE LOADING FUNCTIONS


// Load external JS file; showError determines
// whether an error message is displayed if file can't be loaded
function loadScript(url, showError) {
	
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

// Determine which site is being called and load site_definition.js
// file for that site
function loadSiteDefinition() {
	
	// Get URL
	var url = makePath([siteData.dir], sites.definitionFile);
	
	// Load site definition file
	loadScript(url);
		
}

// Load glossary data file
function loadGlossaryData() {
	
	var url = makePath([siteData.dir], sites.glossaryDataFile);
	
	loadScript(url, false);

}

// Load Tracker class from external JS file
function loadTracker() {

	var url = makePath([sites.jsDir], "tracker.js");
	
	loadScript(url);

}


// Load custom stylesheet from site directory
function loadCustomStylesheet() {
	
	var stylesheetPath = "";
	
	// If stylesheet path is specified in site definition, load it
	if (siteData.stylesheet) {
		stylesheetPath = siteData.stylesheet;
	// Otherwise load stylesheet with default name
	} else {
		stylesheetPath = sites.customStylesheet;
	}

	loadStylesheet(makePath([siteData.dir], stylesheetPath));

}

// Load external stylesheet
function loadStylesheet(filePath) {

	$("head").append("<link>");
	var cssElement = $("head").children(":last");
	cssElement.attr({
		rel:  "stylesheet",
		type: "text/css",
		href: filePath
	});

}

// Load the content for the specified location object into the specified
// content container; if there's a sectionUrl, the page is a section
// and this is the URL for the section; the locationObj contains info
// for the index page for all the sections
function loadFileIntoPage(contentContainer, locationObj, sectionUrl) {

	var comingSoonMessage = "";
	var currentAsset = "";
	var heightCode = "";
	var iframeCode = "";
	var heightDiv = 0;
	var checkPageResults = {};
	var pageStr = "";
//	var isLogin = false;
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
	
	// Check to see if page is redirected to the SSO login screen
//	isLogin = checkPageStatus(assetDir, locationObj.name);
	pageStatus = checkPageStatus(assetDir, locationObj.name);
	
	if (pageStatus == "ok") {
	
		// Load page into iFrame if it is not a index and if it has an iframeHeight
		if (locationObj.assetType != "index" && locationObj.iframeHeight) {
			
			// If iframe height is specified, use specified value for height;
			// otherwise, autosize height to content
			iframeCode = makeIframe(iframeId, assetDir, locationObj.iframeHeight);
			$(contentContainer).html(iframeCode);
			
			// Dynamically size iframe to content if content is not cross-domain,
			// if iframe height is auto, and if content will be loaded into the first
			// tab of the bucket
			if (locationObj.iframeHeight == "auto"
				&& getUrlType(assetDir) != "cross-domain" 
				&& canSizeIframe(locationObj.name)) {
				sizeIframe(iframeId, true);
			}
			
		// Otherwise load into page element using AJAX
		} else {
			$.ajax({
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
						// If loading an index for a tab, set all links
						// on the page to open page in second tab
						if (locationObj.assetType == "index") {
							makeOpenInTab(contentContainer);
						}
					}
	
				}
			});
		}
		
	// If login screen, load alternative login
	} else if (pageStatus == "login"){
		
		loadLogin(contentContainer);
		
	} else if (pageStatus == "not found") {
		
		showComingSoon(contentContainer);
		
	}
	
}

// Open page in popup window; parameters must be in the format
// of CSS attributes
function openPopup(url, classNames, width, height) {

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
	}
	var isWindowTooBig = false;
	var defaultWidth = 800;
	var defaultHeight = 560;
	var maxWidth = screen.width - 20;
	var maxHeight = screen.height - 60;
	
	// Get width and height from style;
	// for Safari use default values, because it can return
	// dimensions set in stylesheet
	windowParams.width = parseInt(width, 10);
	if (!windowParams.width || windowParams.width == 0 || currentStatus.browser == "safari") {
		windowParams.width = defaultWidth;
	}
	// Reduce window size if it is larger than screen size
	if (windowParams.width > maxWidth) {
		windowParams.width = maxWidth;
		isWindowTooBig = true;
	}
	
	windowParams.height = parseInt(height, 10);
	if (!windowParams.height || windowParams.height == 0 || currentStatus.browser == "safari") {
		windowParams.height = defaultHeight;
	}
	if (windowParams.height > maxHeight) {
		windowParams.height = maxHeight;
		isWindowTooBig = true;
	}
	
	windowParams.width = windowParams.width.toString();
	windowParams.height = windowParams.height.toString();
		
	if (classNames) { 
		classNamesArray = classNames.split(" ");
	}
	// Use the url as the window name;
	if (url) {   
		windowName = url;
		// Strip out extra chars
		windowName = windowName.replace(/http|\W/gi, "");
	}
//	// Get width and height from style
//	if (width) {   
//		windowParams.width = width;
//	}
//	if (height) {   
//		windowParams.height = height;
//	}
	
	// Get additional class names to set browser elements
	for (var i = 0; i < classNamesArray.length; i ++) {
		// Show all browser elements
		if (classNamesArray[i] == "show-all") {
			windowParams.toolbar = "yes";
			windowParams.directories = "yes";
			windowParams.location = "yes";
			windowParams.menubar = "yes";
			windowParams.status = "yes";
		// Show toolbar only
		} else if (classNamesArray[i] == "show-nav") {
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
		} else if (classNamesArray[i] == "no-scroll") {
			windowParams.scrollbars = "no";
		} else if (classNamesArray[i] == "no-resize") {
			windowParams.resizable = "no";
		}
		// Crosswords must use this window name
		if (classNamesArray[i] == "crossword") {
			windowName = "popit2";
		}
	}
	
	// If window had to be scaled down to fit screen,
	// allow scrolling and resizing and put window at top of screen
	if (isWindowTooBig || currentStatus.browser == "safari") {
		windowParams.scrollbars = "yes";
		windowParams.resizable = "yes";
		windowParams.top = 0;
	} else {
		windowParams.top = 20;
	}
	
	windowParams.left = (screen.width / 2) - (parseInt(windowParams.width, 10) / 2);
  
	// Create parameter string for window.open
	for (var name in windowParams) {   
		useParams += (useParams === "") ? "" : ",";   
		useParams += name + "=";   
		useParams += windowParams[name];   
	}
	
	// Open new window
	newWindow = window.open(url, windowName, useParams);
	// Move window forward if it is already open
	newWindow.focus();
	return false;
	
}
	
// Load login screen
function loadLogin(contentContainer) {
	
	$.ajax({
		// Load custom login page
		url: sites.loginFile,
		success: function(data, textStatus) {
			$(contentContainer).html(data);
		}
	});
	
}


// RENDERING FUNCTIONS


// SHELL GRAPHICS

// Get logo file
function getLogoFile() {
	
	var subbrand = sites.disciplines[siteData.discipline][1];
	var logoFilename = sites.subbrands[subbrand][0] + ".jpg";

	return logoFilename;

}

// Load graphics for site shell
function loadImages() {
	
	// Logo
	var url = makePath([sites.logosDir], getLogoFile());
	$("#logo-foreground").html('<img src="' + url + '" />');
	
	// Book cover in upper left
	url = makePath([siteData.imagesDir], "book_cover.jpg");
	$("#bookInfoWrapper").css("background-image", "url(" + url + ")");
	
	// Masthead image across top of page
	url = makePath([siteData.imagesDir], "masthead.jpg");
	$("#masthead").html('<img src="' + url + '" />');
	
	// Image on Home Page
	url = makePath([siteData.imagesDir], "home_page.jpg");
	$("#home").css("background-image", "url(" + url + ")");
	
}


// INTERFACE CREATION FUNCTIONS


// Create Side Menu
function makeSideMenu() {
	
	var menuOptions = getMenuOptions();
	var menuStr = "";
	
	// Remove existing content from menu in template
	$("ul.inner-menu").empty();
	
	// Add each menu option to string
	for (var i = 0,
		 count = menuOptions.length,
		 option = {};
		 i < count; i ++) {
		option = menuOptions[i];
		menuStr += makeOption(option);
	}
	$("ul.inner-menu").html(menuStr);
	
	// Returns array of menu option names
	function getMenuOptions() {
		
		var menuOptions = [];
		var bucketsFound = [];
		var assetNames = assets.names("menu");
		
		for (var i = 0,
			count = assetNames.length,
			assetName = "",
			bucketName = "",
			newOption = {};
			i < count; i ++) {
			
			assetName = assetNames[i];
			bucketName = assets.get(assetName).bucket;
			
			// If asset is in a bucket
			if (bucketName != "_none") {
				// Add bucket name to menu options
				// if it's not already there
				if ($.inArray(bucketName, bucketsFound) == -1) {
					newOption = new menuOption(bucketName,
												buckets.get(bucketName).title,
												buckets.get(bucketName).icon,
												isBucketProtected(bucketName),
												bucketName);
					bucketsFound.push(bucketName);
					menuOptions.push(newOption);
				}
			// If option is an asset, add asset name
			} else {
				newOption = new menuOption(assetName,
											assets.get(assetName).title,
											assets.get(assetName).icon,
											assets.get(assetName).protected,
											"");
				menuOptions.push(newOption);
			}
			
		}
		
		return menuOptions;
		
		// Object for storing menu option values
		function menuOption(name, title, icon, protected, bucket) {
			
			this.name = name;
			this.title = title;
			this.icon = makePath([sites.imagesDir], icon);
			this.protected = protected;
			this.bucket = bucket;
			
		}
	
	}
	
	// Make code for menu option
	function makeOption(optionObj) {
		
		var classStr = "";
		var titleStr = "";
		var optionStr = "";
		var assetNames = [];
		
		if (optionObj.protected) {
			classStr = ' class="protected"';
		}
		if (optionObj.bucket) {
			assetNames = buckets.get(optionObj.bucket).assets;
			titleStr += ' title="' + optionObj.title + '|';
			for (var i = 0, count = assetNames.length; i < count; i ++) {
				titleStr += assets.get(assetNames[i]).title + '|';
			}
			titleStr += '"';
		}
		
		optionStr = '<li' + classStr + titleStr + '><span>'
						+ '<img src="' + optionObj.icon + '" align="absmiddle" class="assetimages">'
						+ '<a href="#' + optionObj.name + '">' + optionObj.title + '</a>'
						+ '</span></li>';
						
		return optionStr;
		
	}
	
}

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

// Build top nav bar
function makeNavBar() {
	
	var linkStr = "";
	var navLinks = getNavLinks();
	
	// Remove existing content from nav bar in template
	$("div#home-nav ul#resource").empty();
	
	// Add link for Home to string
	linkStr += '<li class="first"><a href="#home" class="location-id">HOME</a></li>';
	
	// Add each nav link to string
	for (var i = 0,
		 count = navLinks.length,
		 linkValues = {};
		 i < count; i ++) {
		linkValues = navLinks[i];
		
		linkStr += makeNavLink(linkValues);
		
	}
	
	// Add links to DOM
	$("div#home-nav ul#resource").append(linkStr);
	
	// Returns array of nav link names
	function getNavLinks() {
		
		var navLinks = [];
		var bucketsFound = [];
		var assetNames = assets.names("navbar");
		
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
		
		if (navObj.protected) {
			protectedStr = ' protected';
		}
		
		linkStr = '<li class="premium-button' + protectedStr + '">'
				+ '<a href="#' + navObj.name + '" class="' + navObj.linkStyle + '">'
				+ navObj.title.toUpperCase() + '</a>'
				+ '</li>';
		return linkStr;
		
	}
	
}

// Make chapter menu
function makeChapterMenu() {
	
	var titleStr = "";
	var leftColumnStr = "";
	var rightColumnStr = "";
	var menuStr = "";
	// Dtermine where to break column of chapter titles
	var halfInd = Math.ceil(siteData.chapterCount / 2) - 1;
	
	// Add each chapter
	for (var i = 0,
		 chapterNum = 0,
		 linkOpenTag = "",
		 linkCloseTag = "",
		 classStr = "";
		 i < siteData.chapterCount; i ++) {
		
		chapterNum = i + 1;
		
		// If there are demo chapters, only add links to demo chapters
		if (siteData.demoChapters.length == 0 || $.inArray(chapterNum.toString(), siteData.demoChapters) != -1) {
			classStr = "";
			linkOpenTag = '<a href="#/' + chapterNum + '">';
			linkCloseTag = '</a>';
		} else {
			classStr = ' class="inactive"';
			linkOpenTag = "";
			linkCloseTag = "";
		}
		
		titleStr = '<li ' + classStr + '><div class="chapter-title"><div class="chap-num">' + chapterNum + '.</div><div class="chap-title">' + linkOpenTag
				 + siteData.chapters[i]
				 + linkCloseTag + '</div></div></li>';
		
		// Add title to either left or right column
		if (i <= halfInd) {
			leftColumnStr += titleStr;
		} else {
			rightColumnStr += titleStr;
		}
	}
	
	// Make code for menu
	menuStr = '<ul id="left-chapter-column" class="select-chapter leftside">'
			+ leftColumnStr + '</ul>'
			+ '<ul id="right-chapter-column" class="select-chapter rightside">'
			+ rightColumnStr + '</ul>';
	
	// Add chapter menu to DOM
	$("div#popup-chapters").html(menuStr);
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

// CONTENT LOADING FUNCTIONS

// Size iframe dynamically to fit content.
// If onLoad is true, wait for iframe to load before resizing;
// this only works with the first panel of a set of tabs; the other tabs
// must be sized when they are first viewed
function sizeIframe(frameId, onload) {
	
	var frameSelector = "#" + frameId;
	var currentHeight = $(frameSelector, top.document).attr("height");
	
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
		var minHeight = parseInt(sites.defaultIframeHeight, 10);
		
		$(frameSelector, top.document).css({height: 0});
		bodyHeight = $(frameSelector, top.document).contents().find("body").attr("scrollHeight");
		// Add 10% to height to keep bottom from being cut off
		heightOffset = Math.round(bodyHeight / 10);
		bodyHeight += heightOffset;
		// iframe should at least be big enough to fill the page
		if (bodyHeight < minHeight) {
			bodyHeight = minHeight;
		}
		$(frameSelector, top.document).css({height: bodyHeight});
		
	}
	
}

// Make tabs for displaying assets in bucket
function makeBucketTabs(bucketName) {
	
	var assetsInBucket = assets.getByBucket(bucketName);
	
	// Remove all existing tabs
	// Each tab
	for (var i = 0,
		 tabsCount = $("#bucket-tabs").tabs("length");
		 i < tabsCount;
		 i ++) {
		
		$bucketTabs.tabs("remove", 0);
		
	}
	
	// Reset tab status
	currentStatus.tabLoaded = [];
	
	// Add tabs
	// Each asset
	for (var i = 0,
		 assetCount = assetsInBucket.length,
		 firstTabId = "",
		 firstIframeId = "",
		 assetObj = {},
		 url = "",
		 tabUrl = "",
		 tabContainer = "",
		 iframeId = "",
		 tabContent = "",
		 pageStatus = "";
		 i < assetCount;
		 i ++) {
		
		assetObj = assetsInBucket[i];
		tempLocation.update(assetObj.name + "/" + currentStatus.chapter);
		url = tempLocation.url;
		iframeId = assetObj.name + "-iframe";
		tabUrl = "#" + assetObj.name;
		tabContainer = "#bucket-tabs div" + tabUrl;
		tabContent = '<div id="' + assetObj.name + '"></div>';
		
		
		// Add tab
		$("#bucket-tabs").append(tabContent).tabs("add", tabUrl, assetObj.title);
		
		// Clicking on tab will call showLocation()
		$("#bucket-tabs a").click(function() {
			var locationId = $(this).attr("href");
			showLocation(locationId);
		});
		
		// Load content into tab
		loadPage(tabContainer, tempLocation);
		
		// Set tab status
		// If asset is ILRN, set tabLoaded = false to force reload
		if (tempLocation.assetType == "ilrn" && currentStatus.chapterView == "single") {
			currentStatus.tabLoaded[i] = false;
		} else {
			currentStatus.tabLoaded[i] = true;
		}
		
//		// Check whether page request triggers SSO login screen
//		pageStatus = checkPageStatus(url, assetObj.name);
//		
//		// Load page only if page is not protected or user has logged in,
//		if (pageStatus == "ok") {
//			// Load page, but don't load ILRN quizzes into anything but first tab
//			if (!(assetObj.assetType == "ilrn" && !isFirstTab(assetObj.name))) {
//				loadFileIntoPage(tabContainer, tempLocation);
//			}
//		// If page is protected and user hasn't logged in,
//		// load custom login page to tab
//		} else {
//			loadLogin(tabContainer);
//		}
			
		// If asset is protected, add lock icon to tab
		if (assetObj.protected) {
			$("#bucket-tabs li:last a").append('<span class="protected">&nbsp;</span>');
		}
		
	}
	
	// Reset tab status
	currentStatus.tabContent = assetObj.bucket;
	
}

// Make index page for All Chapters view
function makeIndexPage(contentContainer) {
	
	var indexStr = '<ul class="all-chapters">';
	
	// Add each chapter
	for (var i = 0,
		 assetName = currentLocation.name,
		 chapterNum = 0,
		 linkOpenTag = "",
		 linkCloseTag = "",
		 classStr = "";
		 i < siteData.chapterCount; i ++) {
		
		chapterNum = i + 1;
		
		// If there are demo chapters, only add links to demo chapters
		if (siteData.demoChapters.length == 0 || $.inArray(chapterNum.toString(), siteData.demoChapters) != -1) {
			classStr = "";
			linkOpenTag = '<a href="#' + assetName + '/' + chapterNum + '">';
			linkCloseTag = '</a>';
		} else {
			classStr = ' class="inactive"';
			linkOpenTag = "";
			linkCloseTag = "";
		}
		
		indexStr += '<li ' + classStr + '><span>' + chapterNum + '. ' + linkOpenTag
				 + siteData.chapters[i]
				 + linkCloseTag + '</span></li>';
		
	}
	
	indexStr += "</ul>";
	
	// Add content to DOM
	$(contentContainer).html(indexStr);
	
	// Set the behavior of the links
	$(contentContainer + " a").click(function() {
		var url = $(this).attr("href");
		currentStatus.updateChapterView("single");
		showLocation(url);
		setChapterViewButtons();
		return false;
	});
	
}

// Make asset page from template
function makeFromTemplate(assetType, contentContainer) {
	
	$(contentContainer).html(currentLocation.templateStr);
	setFlash(assetType, currentLocation.playerWidth, currentLocation.playerHeight);
	
}

// Make chapter glossary page
function makeGlossary(contentContainer) {
	
	var chapterNum = "";
	
	if (currentStatus.chapterView == "single") {
		chapterNum = currentStatus.chapter;
	}
	
	// Javascript to intialize glossary
	var glossaryStr = '<div id="glossary"></div>'
					+ '<script type="text/javascript">'
					+ 'initGlossary(' + chapterNum + ');'
					+ '</script>';
	
	// Add code to page
	$(contentContainer).html(glossaryStr);
	
}

// Return true if the asset passed can be have its iframe resized when loaded;
// if iframe is in a tab, it must be in the first tab; other iframes must be
// resized when they are first viewed
function canSizeIframe(assetName) {
	
	var firstTabId = "";
	var sizable = false;
	
	// If asset is part of a bucket and will be loaded into bucket tabs
	if (assets.get(assetName).bucket != "_none") {
		// Allow sizing only if asset is loaded into first tab
		if (isFirstTab(assetName)) {
			sizable = true;
		}
	} else {
		sizable = true;
	}
	
	return sizable;

}

// Is the current asset loaded into the first bucket tab?
function isFirstTab(tabId) {
	
	var isFirstTab = false;
	var firstTabId = $("#bucket-tabs div").attr("id");
	
	// If passed tab ID is ID of first tab
	if (tabId == firstTabId) {
		isFirstTab = true;
	}
	
	return isFirstTab;
	
}

// Display page
function showLocation(locationId) {
	
	var bucketName = "";
	var trackerData = {};
	var pageBehavior = currentLocation.update(locationId);
	var isInBucket = false;
	
	// Popup page;
	if (pageBehavior == "popup") {
		// If site is being loaded with a URL specifying a popup page,
		// load the page into the current window;
		if (!currentLocation.type) {
			window.location = currentLocation.popupLocation.url;
		// Otherwise load the page in a new window and record it in Tracker
		} else {
			copyToObject(currentLocation.popupLocation, trackerData);
			tracker.update(trackerData);
		}
		return;
	}
	
	// Content not found
	if (currentLocation.type == "error") {
		showError(locationId);
	// Home page
	} else if (currentLocation.type == "home") {
		showHome();
		updateInterface();
	// Report
	} else if (currentLocation.type == "report") {
		showReport();
	} else if (currentLocation.type == "all sites") {
		showSitesIndex();
	// Content page (asset or bucket)
	} else {
		
		// If location is a bucket or an asset in a bucket
		if (currentLocation.bucket) {
			populateBucketPage();
			$("#asset-content").hide();
			$("#bucket-content").show();
		// If it's an asset not in a bucket
		} else {
			populateAssetPage();
			if (currentStatus.shell) {
				$("#bucket-content").hide();
				$("#asset-content").show();
			}
			if (currentLocation.sections == "multiple") {
				$("#asset-text").hide();
				$("#asset-tabs").show();
			} else {
				$("#asset-tabs").hide();
				$("#asset-text").show();
			}
		}
		
		if (currentStatus.shell) {
			showContent();
		}
		
	}
	
	updateInterface();
	
	// Pass location data to Tracker
	if (currentStatus.shell) {
		copyToObject(currentLocation, trackerData);
		tracker.update(trackerData);
	}
	
}

// Load correct content into page if it's not already loaded
function loadPage(contentContainer, location) {
	
	// Load if asset page or if bucket page that needs reloading
	if (location.bucketInd == -1 || currentStatus.tabLoaded[location.bucketInd] != true) {
		if (location.assetType == "video" || location.assetType == "audio") {
			makeFromTemplate(location.assetType, contentContainer)
		} else if (location.assetType == "glossary") {
			makeGlossary(contentContainer);
		} else if (currentStatus.chapterView == "all") {
			makeIndexPage(contentContainer);
		} else {
			loadFileIntoPage(contentContainer, location);
		}
		// Set tab loaded status to true, unless asset is ILRN quiz,
		// which must be reloaded in Firefox
		if (currentStatus.browser == "mozilla" && location.assetType == "ilrn" && currentStatus.chapterView == "single") {
			currentStatus.tabLoaded[location.bucketInd] = false;
		} else {
			currentStatus.tabLoaded[location.bucketInd] = true;
		}
	}
		
}

// Display home page content
function showHome() {
	
	clearMenu();
	$("#content-error").hide();	
	$("#content-page").hide();
	$("#book").show();
	$("#home-page").show();
	
}

// Display bucket or asset page
function showContent() {
	
	$("#content-error").hide();	
	$("#book").hide();
	$("#home-page").hide();
	$("#content-page").show();
	$("#side-menu").show();
	
}

// Page not found error message
function showError(locationId) {
	
	$("#content-error").text('The location "' + locationId + '" could not be found.');
	$("#book").hide();
	$("#home-page").hide();
	$("#content-page").hide();
	$("#content-error").show();
	
}

// Site report
function showReport() {
	
	var siteReport = new SiteReport;
	
	$("#content-page").html("Creating report . . .");
	$("#content-page").html(siteReport.text);
		
}

// List of all sites
function showSitesIndex() {
	
	$("#content-page").html("Listing Sites . . .");
	var allSitesIndex = new AllSitesIndex;
	$("#content-page").html(allSitesIndex.text);
	
	// Force all links to reload page
	$("a").click(function() {
		window.location.href = $(this).attr("href");
		window.location.reload();
	});
	
}

function showTracker() {
	
	var trackerWin = window.open("", "tracker", "width=600,height=450,resizable=0,scrollbars=1,status=0,toolbar=0,menubar=0,location=0,left=20,top=40");

	trackerWin.document.write(tracker.report);	

}

// Create tabs for bucket and select appropriate tab for location
function populateBucketPage() {
	
	var tabUrl = "";
	var tabContainer = "";
	
	// Create bucket tabs if necessary
	if (currentStatus.tabContent != currentLocation.bucket) {
		makeBucketTabs(currentLocation.bucket);
	// Otherwise load content into current tab
	} else {
		tabUrl = "#" + currentLocation.name;
		tabContainer = "#bucket-tabs div" + tabUrl;
		loadPage(tabContainer, currentLocation);
	}
	$bucketTabs.tabs("select", currentLocation.bucketInd);
	
}

// Populate divs for Asset Page
function populateAssetPage() {
	
	var currentAsset = assets.get(currentLocation.name);
	var bucketTitle = buckets.get(currentAsset.bucket).title;
	var titleStr = bucketTitle + ": " + currentAsset.title;
	var contentContainer = "#asset-text";
	
	// Determine which div should hold the content
	// For standalone pages
	if (currentStatus.shell == false) {
		contentContainer = "#content-page";
	// Asset in shell
	} else {
		// Asset with single section
		if (currentLocation.sections == "single") {
			contentContainer = "#asset-text";
		// Asset with multiple sections
		} else {
			contentContainer = "#asset-tabs #tabs-menu";
		}
	}
	
	// Load content file into div
	loadPage(contentContainer, currentLocation);
	
}

// Go to previous or next chapter
// navOption is "next" or "previous"
function goToChapter(position) {
	
	var chapterNum = parseInt(currentStatus.chapter, 10);
	var locationId = currentLocation.id;
	var canChange = false;
	var demoCount = siteData.demoChapters.length;
	
	// Previous chapter
	if (position == "previous") {
		if (chapterNum > parseInt(siteData.firstChapter, 10)) {
			chapterNum --;
			// If there are demo chapters and previous chapter isn't in demo chapters,
			// look in demo chapters to find the first lower number
			if (demoCount > 0 && $.inArray(chapterNum.toString(), siteData.demoChapters) == -1) {
				for (var i = demoCount - 1, demoNum; i >= 0; i --) {
					demoNum = parseInt(siteData.demoChapters[i], 10);
					if (demoNum < chapterNum) {
						chapterNum = demoNum;
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
		if (chapterNum < parseInt(siteData.lastChapter, 10)) {
			chapterNum ++;
			if (demoCount > 0 && $.inArray(chapterNum.toString(), siteData.demoChapters) == -1) {
				for (var i = 0, demoNum; i < demoCount; i ++) {
					demoNum = parseInt(siteData.demoChapters[i], 10);
					if (demoNum > chapterNum) {
						chapterNum = demoNum;
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
		locationId = currentLocation.name + "/" + chapterNum.toString();
		showLocation(locationId);
		// Force tab content to reload
		currentStatus.tabContent = "";
	}
	
}

// Show Coming Soon message
function showComingSoon(contentContainer) {
	
	var comingSoonMessage = "";
	
	currentAsset = assets.get(currentLocation.name);
	// If content is chapter specific
	if (currentLocation.chapter) {
		comingSoonMessage += "Chapter " + currentLocation.chapter + " "; 
	}
	comingSoonMessage += "Content for " + currentAsset.title + " is Coming Soon.";
	comingSoonMessage = '<div class="missing">' + comingSoonMessage + "</div>";
	$(contentContainer).html(comingSoonMessage);
	
}

// Check page to see if it loads;
// possible returned values are:
// login: SSO login screen is encountered because user hasn't logged in
// not found: page not found
// ok: page loads successfully
function checkPageStatus(assetUrl, assetName) {
	
	var pageStatus = "ok";
	
	// Firefox can't check a cross-domain URL because AJAX call fails across domain.
	// With FF must assume that cross-domain URLs are OK
	if (currentStatus.browser == "mozilla" && getUrlType(assetUrl) == "cross-domain") {
		return pageStatus;
	}
	
	try {
	
		$.ajax({
			url: assetUrl,
			async: false,
			complete: function(XMLHttpRequest, textStatus) {
				// If error getting page
				if (textStatus != "success") {
					// If asset is not protected or is cross-domain,
					// or if error code is 404,
					// couldn't be login screen
					if (!assets.get(assetName).protected
						|| getUrlType(assetUrl) == "cross-domain"
						|| XMLHttpRequest.status == "404") {
							pageStatus = "not found";
					}
				// If page is returned, parse it to see if it's the login screen
				} else {
					if ((matchArray = XMLHttpRequest.responseText.match(sites.loginPattern)) != null) {
						pageStatus = "login";
					// If 404 is redirected to Cengage Home Page
					} else  if ((matchArray = XMLHttpRequest.responseText.match(sites.notFoundPattern)) != null) {
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
	loadFileIntoPage("div#tabs-asset", currentLocation, url);
	// Select second tab
	$assetTabs.tabs("select", 1);

}

// INTERFACE UPDATE FUNCTIONS

// Update interface elements as appropriate
function updateInterface() {
	
	if (currentStatus.shell) {
		makeBreadcrumbs();
		showChapterTitle();
		setSideMenu();
		setButtons();
		setChapterMenu();
		// Update URL in browser's address bar
		window.location.hash = currentLocation.id;
	}
	
}

// Update Side Menu to select specified option
function setSideMenu() {
	
	var urlValue = "";
		
	// Remove all highlights from options
	clearMenu();
	// Highlight selected option
	// Find URL in menu that matches name of current location
	// and add sub-select class to its li to
	$("#side-menu .inner-menu li").each(function() {
		urlValue = $(this).find("a").attr("href");
		urlValue = getLocationId(urlValue);
		if (urlValue == currentLocation.menuName) {
			$(this).addClass("sub-selected");
		}
	});

}

// Clear the selected option in the menu
function clearMenu() {
	
	$("#side-menu .inner-menu li").removeClass("sub-selected");
	
}

// Set the state of buttons, such as the Next and Previous Chapter buttons
function setButtons() {
	
	// Next/Previous Chapter buttons
	// Disable Previous if on first chapter or home or if book resource
	if (currentStatus.chapter == siteData.firstChapter
								|| currentLocation.type == "home"
								|| currentLocation.scope == "book") {
		$("#previous-chapter").removeClass("active");
		$("#previous-chapter").addClass("inactive");
	} else {
		$("#previous-chapter").removeClass("inactive");
		$("#previous-chapter").addClass("active");
	}
	
	if (currentStatus.chapter == siteData.lastChapter
								|| currentLocation.type == "home"
								|| currentLocation.scope == "book") {
		$("#next-chapter").removeClass("active");
		$("#next-chapter").addClass("inactive");
	} else {
		$("#next-chapter").removeClass("inactive");
		$("#next-chapter").addClass("active");
	}
	
	// Select Chapter button
	if (currentLocation.scope == "book" && currentLocation.type != "home") {
		$("#select-chapter").removeClass("active");
		$("#select-chapter").addClass("inactive");
	} else {
		$("#select-chapter").removeClass("inactive");
		$("#select-chapter").addClass("active");
	}
	
	setChapterViewButtons();
	
}

// Set the states of the Chapter View buttons according to the current mode
function setChapterViewButtons() {
	
	// Single
	if (currentStatus.chapterView == "single") {
		$("#allChapers").removeClass("selected");
		$("#thisChapter").addClass("selected");
	// All
	} else if (currentStatus.chapterView == "all") {
		$("#thisChapter").removeClass("selected");
		$("#allChapers").addClass("selected");
	}
	
	// Disable if scope is book
	if (currentLocation.scope == "chapter") {
		$("#studyTool").removeClass("inactive");
	} else {
		$("#studyTool").addClass("inactive");
	}
	
}

// Highlight current chapter in Chapter Menu
function setChapterMenu() {
	
	$("#popup-chapters li").each(function() {
		url = $(this).find("a").attr("href");
		url = getLocationId(url);
		tempLocation.update(url);
		if (tempLocation.chapter == currentStatus.chapter) {
			$(this).addClass("selected");
		} else {
			$(this).removeClass("selected");
		}
	});
	
}

// Create breadcrumbs
function makeBreadcrumbs() {
	
	var breadcrumbCode = "";
	var separator = "&nbsp;>&nbsp;";
	var firstAssetName = getFirstAsset();
	
	// If Home Page
	if (currentLocation.type == "home") {
		breadcrumbCode = "Home";
	} else {
		// Home
		breadcrumbCode = "<div>" + makeLink("Home", "#home") + separator + "</div>";
		// Chapter
		if (currentLocation.scope == "chapter") {
			breadcrumbCode += "<div>" + makeLink(makeChapterStr(), "#" + firstAssetName) + separator + "</div>";
		}
		// Bucket
		if (currentLocation.bucket) {
			breadcrumbCode += "<div>" + buckets.get(currentLocation.bucket).title + separator + "</div>";
		}
		// Asset
		breadcrumbCode += "<div>" + currentLocation.title + "</div>";
		
	}
	
	// Add breadcrumb code
	$("#breadcrumbs span").html(breadcrumbCode);
	// Set links to respond to location IDs
	$("#breadcrumbs a").mousedown(function() {
		urlValue = $(this).attr("href");
		showLocation(urlValue);
	});
	
}

// Update chapter title in the display
function showChapterTitle() {
	
	$("#current-chapter span").html(makeChapterStr());
	
}

// Get chapter title
function getChapterTitle() {
	
	var title = siteData.chapters[parseInt(currentLocation.chapter, 10) - 1];
	
	return title;
	
}

// Display chapter title
function makeChapterStr() {
	
	var chapterStr = "";
	
	if (currentLocation.scope == "chapter" && currentStatus.chapter) {
		chapterStr = '<div class="breadcrumb-chapter"><div class="chap-num">' + currentStatus.chapter
					+ '.&nbsp;</div><div class="chap-title">' + getChapterTitle() + "</div></div>";
	} else if (currentLocation.type != "home") {
		chapterStr = '<div class="chap-title">Not chapter related</div>';
	}
	
	return chapterStr;
	
}

// INITIALIZE ELEMENTS IN SITE

// After page has loaded, load content into elements
// and initialize behaviors
function initSite() {
	
	// WINDOW TITLE
	document.title = siteData.title;
	
	// LOAD GRAPHICS
	loadImages();
	
	// HOME PAGE CONTENT
	
	loadFileIntoPage("#homeIntro", "", siteData.dir + "home.html");
	
	// HEADER CONTENT
	
	$("#book-title").html(siteData.title.toUpperCase());
	$("#book-subtitle").html(siteData.subtitle);
	$("#edition").html(siteData.edition);
	$("#author").html(siteData.author);
	
	// ENGAGEMENT TRACKER LINK

	$("a#engagement-tracker").click(function() {
		showTracker();
		return false;
	});
	
	
	// CHAPTER MENU
	
	// Whether chapter menu is displayed
	currentStatus.chapterMenu = 0;
	
	// Links in popup chapter menu
	$("#popup-chapters li").click(function() {
		var urlValue = $(this).find('a').attr("href");
		disablePopup();
		currentStatus.updateChapterView("single");
		showLocation(urlValue);
		return false;
	});
	
	// Semi-transparent layer for graying out interface when chapter list comes up
	$("#backgroundPopup").css({
		"opacity": "0.7"
	});
	
	// Button for loading Chapter Menu
	$("#select-chapter").click(function() {
		if ($(this).attr("class") == "active") { 
			loadPopup();
		}
		return false;
	});
		
	$('#chapter-popup-close').click(function() {
		disablePopup();
	});
	
	// NEXT/PREVIOUS CHAPTER BUTTONS
	
	$("#previous-chapter").mousedown(function() {
		if ($(this).attr("class") == "active") { 
			goToChapter("previous")
		}
	});
	
	$("#next-chapter").mousedown(function() {
		if ($(this).attr("class") == "active") { 
			goToChapter("next")
		}
	});
	
	// CHAPTER VIEW MODE (THIS OR ALL)
	
	$("#thisChapter").mousedown(function() {
		// Do nothing if buttons are disabled
		if ($("#studyTool").attr("class").indexOf("inactive") == -1) {
			currentStatus.updateChapterView("single");
			setChapterViewButtons();
			showLocation(currentLocation.id);
		}
	});
	
	$("#allChapers").mousedown(function() {
		// Do nothing if buttons are disabled
		if ($("#studyTool").attr("class").indexOf("inactive") == -1) {
			currentStatus.updateChapterView("all");
			setChapterViewButtons();
			showLocation(currentLocation.id);
		}
	});
	
	// POPUP LINKS (INCLUDING TOP NAV BAR)
	
	// Add popup behaviors to links according to specified class
	$("a.popup").click(function() {
		
		// Get names in class attribute
		var classNames = $(this).attr("class");
		// Get URL
		var url = $(this).attr("href");
		// Get width and height from style
		var width = $(this).css("width");
		var height = $(this).css("height");
		
		// If popup link is in Top Nav Bar
		if ($(this).parent().attr("class").indexOf("premium-button") != -1) {
			// Get URL from location ID and update location
			showLocation(url);
			url = currentLocation.popupLocation.url;
		}
		
		openPopup(url, classNames, width, height);
		
		return false;
		
	});
	
	// TOP NAV BAR
	
	// Color of link on Premium Buttons
	var premiumButtonLinkColor = $(".premium-button").find('a').css('color');
	
	// Makes the link inside the button have its hover effect when hovering over the asset (which is a parent of the <a> tag)
	$(".premium-button").hover(
		function() {
			$(this).find('a').css('color', '#ce3c23').css('text-decoration', 'underline');
			$(this).css("cursor", "pointer");
		},
		function() {
			var linkColor = $(this).find('a').css('color');
			$(this).find('a').css('color', premiumButtonLinkColor).css('text-decoration', 'none');;
			$(this).css("cursor", "arrow");
		}
	);
		
	// LINKS WITH location-id CLASS
	
	$("a.location-id").click(function() {
		var url = $(this).attr("href");
		showLocation(url);
		return false;
	});
		
	// SIDE MENU
	
	$("#side-menu ul.inner-menu li").click(function() {
		var urlValue = $(this).find('a').attr("href");
		showLocation(urlValue);
		// Don't load value from URL into address bar
		return false;
	});
	
	// Highlight menu option on mousedown instead of click for faster response
	$("#side-menu ul.inner-menu li").mousedown(function() {
		clearMenu();
		// Highlight selected option
		$(this).addClass("sub-selected");
	});
	
	// Rollover tooltips for menu options
	$(".inner-menu li").cluetip({
		width: "200px",
		splitTitle: "|",
		cursor: ""
	});
	
	// BUCKET PAGE TABS
	
	$bucketTabs = $("#bucket-tabs").tabs({
		
		// Execute whenever content of tab is displayed
		show: function(event, ui) {
			
			var currentTab = ui.panel.id;
			var contentContainer = "#" + currentTab;
			var frameSelector =  currentTab + "-iframe"
			
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
			
//		},
//		
//		// Update location when tab is clicked
//		select: function(event, ui) {
//			
//			var currentTab = ui.panel.id;
//			var contentContainer = "#" + currentTab;
//			
//			showLocation(contentContainer);
//			
//		}
		
	});
	
	// ASSET PAGE TABS
	
	$assetTabs = $("#asset-tabs").tabs({
		
		// When tab is shown, resize iframe if it's not in the first tab;
		// first tab's iframe is resized when it is loaded via makeAssetTabs()
		show: function(event, ui) {
			var currentTab = ui.panel.id;
			var frameSelector =  currentTab + "-iframe";
			
			if (!isFirstTab(currentTab)) {
				sizeIframe(frameSelector);
			}
		},
		
		disabled: [1]
			
	});

	// VIDEO TRANSCRIPT
	
	// Hide video transcript until it is toggled on
	$("#transcript").hide();
	$("#print-transcript").hide();
	
	// Toggle the display for a video transcript
	$("a#toggle-transcript").click(function() {
		$("#transcript").toggle();
		if ($("#transcript").is(':visible')) {
			$("a#toggle-transcript").html("Hide Transcript");
			$("#print-transcript").show();
		} else {
			$("a#toggle-transcript").html("View Transcript");
			$("#print-transcript").hide();
		}
	});
	
	// Print transcript for video
	$("a#print-transcript").click(function() {
		// Get a FRAMES reference to the iframe.
		var objFrame = window.frames["transcript"];
		objFrame.focus();
		objFrame.print();
		return(false);
	});

}
	
// Load popup for Chapter Menu
function loadPopup(){
	updateChapterLinks();
	//loads popup only if it is disabled
	if (currentStatus.chapterMenu == 0){
		$("#backgroundPopup").fadeIn("slow");
		$("#select-a-chapter").fadeIn("slow");
		currentStatus.chapterMenu = 1;
	}
	
}	

// Disable Chapter Menu
function disablePopup() {
	
	//disables popup only if it is enabled
	if (currentStatus.chapterMenu == 1){
		$("#backgroundPopup").fadeOut("slow");
		$("#select-a-chapter").fadeOut("slow");
		currentStatus.chapterMenu = 0;
	}
	
}
	
// Update the links in the popup chapter menu.
function updateChapterLinks() {
	
	var matchArray = new Array();
	var newLocationId = "";
	var chapterNum = "";
	var chapterNumPattern = /\/(\d+)$/;
	
	// Upldate each link in popup menu
	$("#popup-chapters a").each(function() {
		if (this.href) {
			
			newLocationId = "";
			
			// Get chapter number
			if ((matchArray = this.href.match(chapterNumPattern)) != null) {
				chapterNum = matchArray[1];
			}
			// Add name to locationId if it's not home page
			if (currentLocation.type != "home") {
				newLocationId += currentLocation.name;
			}
			newLocationId += "/" + chapterNum;
			this.href = "#" + newLocationId;
			
		}
	});
	
}
					
// Execute after document has fully loaded
$(document).ready(function() {
	
	var template = "";
	var locationId = getLocationId();
	
	currentLocation.update(locationId);
	
	// Load data from sites class into siteData;
	// load site definition file
	// load glossary file; load Tracker class
	if (currentLocation.type != "all sites") {
		siteData.update();
		// Update buckets to calculate values that couldn't be created
		// at instantiation
		buckets.update();
		loadGlossaryData();
		if (currentStatus.shell) {
			loadTracker();
			tracker = new Tracker();
		}
	}

	// Load custom stylesheet if there is one
	loadCustomStylesheet();
	
	template += sites.templatesDir;
	
	// If shell is not to be rendered, don't load site shell
	if (!currentStatus.shell) {
		template += "standalone.html";
	} else {
		template += siteData.template;
	}
	
	// Load shell template
	$("body").load(template, "", function callbackProxy() {
		if (currentStatus.shell) {
			// Build interface elements
			makeSideMenu();
			makeNavBar();
			makeChapterMenu();
			// Initialize behaviors on page
			initSite();
			tracker.init();
		}
		showLocation(locationId);
	});
	
	// This will set current chapter to first active chapter
	currentStatus.update();
	
});