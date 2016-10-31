// This class is loaded by the Site Engine.
// It gathers data for the Engagement Tracker
function Tracker() {
	
	// PUBLIC PROPERTIES
	
	this.lastAccess;
	// Data about site
	this.headings = "";
	// List of content accessed
	this.log = "";
	// Combination of headings and log
	this.report = "";
	
	// PUBLIC METHODS
	
	// Initializes log to add bibliographic information
	this.init = Init;
	// Called by currentLocation whenever new content
	// is accessed by user
	this.update = Update;
	
	// Functions
	
	// Ads bibliographic data to log
	function Init() {
		
		var startTime = new Date();
		
		this.lastAccess = startTime.getTime();
		this.headings = "<p><b>" + site.title + ",</b><br />by " + site.author + "</p>"
					  + "<p>Content Viewed:</p>";
		this.log = "";
		this.report = "";
	
	}
	
	// This method is executed every time currentLocation is updated;
	// the locationObj contains the following properties, which provide information
	// about the content being viewed:
	// Properties:
	// .isbn					SSO ISBN for site
	// .type					Type of content (asset | bucket | home page | section)
	// .assetType				Type of asset (html | glossary | index | ilrn)
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
	//							relative to site)
	// .id						Location ID
	// .iframeHeight			If this contains a value, the page will be loaded into
	//							an iframe; value is a number or "auto" to autosize the 
	//							frame to the content
	function Update(locationObj) {
		
		var currentTime = new Date();
		var timeStamp = currentTime.getTime();
		var viewTime = Math.round((timeStamp - this.lastAccess) / 1000);
		
		this.lastAccess = timeStamp;
		
		if (this.log) {
			this.log += "Viewing Time: " + viewTime + " seconds<br /><br />";
		}
		
		this.log += "<b>" + locationObj.title + "</b><br />";
		
		if (locationObj.chapter) {
			this.log += "Chapter " + locationObj.chapter + "<br />"
		}
		
		this.report = this.headings + this.log;
		
	}
	
}
