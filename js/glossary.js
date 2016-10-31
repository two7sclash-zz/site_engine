// Version 1.3

var glossary = new Glossary();

// Glossary class
function Glossary() {
	
	// Is glossary loaded as part of Site Engine
	var usesSiteEngine = true;
	// Display drop-down chapter menu
	var showDropDown = true;
	var selectedChapter = "";
	
	if (typeof site == "undefined") {
		usesSiteEngine = false;
	}
	
	var glossaryNode;
	var glossaryForm;
	var searchButton;
	var clearButton;
	
	var foreignChars = {
						192: "A",
						193: "A",
						194: "A",
						195: "A",
						196: "A",
						197: "A",
						198: "AE",
						199: "C",
						200: "E",
						201: "E",
						202: "E",
						203: "E",
						204: "I",
						205: "I",
						206: "I",
						207: "I",
						208: "Th",
						209: "N",
						210: "O",
						211: "O",
						212: "O",
						213: "O",
						214: "O",
						216: "O",
						217: "U",
						218: "U",
						219: "U",
						220: "U",
						221: "Y",
						222: "Th",
						223: "ss",
						224: "a",
						225: "a",
						226: "a",
						227: "a",
						228: "a",
						229: "a",
						230: "ae",
						231: "c",
						232: "e",
						233: "e",
						234: "e",
						235: "e",
						236: "i",
						237: "i",
						238: "i",
						239: "i",
						240: "th",
						241: "n",
						242: "o",
						243: "o",
						244: "o",
						245: "o",
						246: "o",
						248: "o",
						249: "u",
						250: "u",
						251: "u",
						252: "u",
						253: "y",
						254: "th",
						255: "y",
						338: "OE",
						339: "oe",
						352: "S",
						353: "s",
						376: "Y",
						402: "f"
						};
	
	// Public Properties
	
	this.content = [];

	
	// Public Methods
	
	// Load glossary JS content file(s)
	this.loadContent = LoadContent;
	// Initialize glossary page
	this.initPage = InitPage;
	this.doSearch = DoSearch;
	this.clearSearch = ClearSearch;
	this.changeChapter = ChangeChapter;
	this.captureEnter = CaptureEnter;
	
	// Load glossary data file
	function LoadContent() {
		
		// Load content JS file(s), which will popuplate contentArray,
		// then copy array to correct location;
		// there will be multiple files for Resource Centers
		if (usesSiteEngine) {
			// Premium and 4LTR
			if (site.type != "resource_center") {
				if (site.siteFiles.glossaryContent) {
					fileLoader.loadScript(site.siteFiles.glossaryContent, false);
					if (typeof contentArray != "undefined") {
						this.content = this.content.concat(contentArray);
					}
				}
			// Resource Center
			} else {
				/* for (var i = 0, filepath = ""; i < resourceCenter.count; i ++) {
					if (resourceCenter.getByIndex(i).site.siteFiles.glossaryContent) {
						fileLoader.loadScript(resourceCenter.getByIndex(i).site.siteFiles.glossaryContent, false);
						resourceCenter.getByIndex(i).site.update();
						if (typeof contentArray != "undefined") {
							resourceCenter.updateGlossary(i, contentArray);
						}
					}
				}*/
			}
		// If not run from Site Engine, content will be loaded by link in header
		} else {
			if (typeof contentArray != "undefined") {
				this.content = contentArray;
			}
		}
		if (typeof contentArray != "undefined") {
			delete contentArray;
		}
	
	}

	// Initialize interface
	
	// Optional parameter limits the glossary to only entries
	// for that chapter
	function InitPage(defaultChapterNum) {
		
		var formCode = "";
		
		// Show drop down chapter selector only if glossary is
		// opening in a new window in Site Engine
		if (usesSiteEngine) {
			if (currentLocation.behavior == "embedded") {
				showDropDown = false;
			}
		} else {
			showDropDown = false;
		}
		
		// If chapterNum parameter is passed, select specified chapter
		if (arguments.length > 0) {
			selectedChapter = defaultChapterNum;
		} else {
			selectedChapter = "all"
		}
		
		// Add form, search box, and buttons to HTML
		formCode += '<form id="theForm" name="theForm"><table border="0" cellpadding="0"><tr><td valign="bottom"><span class="bodytext">Enter term to search for:</span><br /><input name="searchBox" id="searchBox" type="text" size="40" onKeyPress="return glossary.captureEnter(event)" /></td><td valign="bottom"><input type="button" name="searchButton" id="searchButton" value="Search" onClick="glossary.doSearch()"/>&nbsp;<input type="button" name="clearButton" id="clearButton" value="Clear" onClick="glossary.clearSearch()"/></td></tr>';
		if (showDropDown) {
			formCode += '<tr><td>&nbsp;</td><td><select name="chapterSelector" id="chapterSelector" onChange="glossary.changeChapter()"></select></td></tr>';
		}
		formCode += '</table></form><div id="playercontainer"></div><div id="glossaryEntries"></div>';
		
		glossaryNode = document.getElementById("glossary");
		glossaryNode.innerHTML = formCode;
		
		glossaryForm = document.getElementById("theForm");
		searchButton = document.getElementById("searchButton");
		clearButton = document.getElementById("clearButton");
		
		// Size buttons
		searchButton.width = "52";
		searchButton.height = "22";
		clearButton.width = "52";
		clearButton.height = "22";
		
		// Build chapter menu
		if (showDropDown) {
			glossaryForm.chapterSelector.options[0] = new Option();
			glossaryForm.chapterSelector.options[0].text = "All Chapters";
			glossaryForm.chapterSelector.options[0].value = "all";
			for (var i = 0, newChapterInd, chapterNum; i < site.chapterCount; i ++) {
				newChapterInd = glossaryForm.chapterSelector.options.length;
				chapterNum = i + site.startChapterNumber;
				glossaryForm.chapterSelector.options[newChapterInd] = new Option();
				glossaryForm.chapterSelector.options[newChapterInd].text = "Chapter " + chapterNum;
				glossaryForm.chapterSelector.options[newChapterInd].value = chapterNum;
			}
			// If chapterNum parameter is passed, select specified chapter
			if (selectedChapter != "all") {
				glossaryForm.chapterSelector.selectedIndex = selectedChapter - site.startChapterNumber + 1;
			}
		}
		
		// Load glossary entries
		this.doSearch();
		
	}
	
	// Capture Enter key to launch search
	function CaptureEnter(e) {
		
		var key;
		
		// For IE
		if (window.event) {
			key = window.event.keyCode;
		// For Firefox
		} else {
			key = e.which;
		}
		
		// If Enter key was pressed
		if (key == 13) {
			this.doSearch();
			return false;
		} else {
			return true;
		}
	
	}
	
	// Perform search and display results
	function DoSearch() {
		
		var selectedEntriesArray = new Array();
//		var glossaryForm = document.getElementById("theForm");
		var searchStr = glossaryForm.searchBox.value;
		
		// .call specifies object to treat as this
		getEntries.call(this);
		displayEntries();
		
		// Get correct entries to display
		function getEntries() {
			
			var matchesFound = {term : new Array(), definition : new Array()};
			var matchArray = new Array();
			var count = this.content.length;
			var sourceStr = "";
			var previousTerm = "";
			var currentTerm = "";
			var chapterNum = "";
			var searchPattern = new RegExp();
			var addEntry = "";
			
			// Remove extra space, punctuation, and diacritics from search string
			searchStr = fixSpaces(searchStr);
			searchStr = normalizeText(searchStr);
			searchStr = searchStr.toLowerCase();
			
			// Find terms in selected chapter that match search
			for (var i = 0; i < count; i ++) {
				currentTerm = this.content[i][0][0];
				chapterNum = this.content[i][2][0];
				// Skip term if it doesn't belong to selected chapter
				if (selectedChapter != "all") {
					if (chapterNum != selectedChapter) {
						continue;
					}
				}
				// If there's a search term
				if (searchStr) {
					addEntry = "";
					// Find matches only when search term is beginning of the word;
					// "horn" will match "horns" but not "thorn"
					searchPattern = new RegExp("\\b" + searchStr, "g");
					sourceStr = this.content[i][0][1];
					if ((matchArray = sourceStr.match(searchPattern)) != null) {
						addEntry = "term";
					// If no terms found, find definitions that match search
					} else {
						sourceStr = this.content[i][1][1];
						if ((matchArray = sourceStr.match(searchPattern)) != null) {
							addEntry = "definition";
						}
					}
				// If no search term
				} else {
					addEntry = "term";
				}
				
				// If entry is to be added, eliminate duplicate terms
				if (addEntry) {
					// If term isn't identical to previous term, add it to array
					if (currentTerm != previousTerm) {
						matchesFound[addEntry].push(this.content[i]);
					// If term is identical to previous term, add its chapter number
					// to previous term's list of chapters (unless the number is already in the list)
					} else {
						if (!isInArray(chapterNum, matchesFound[addEntry][matchesFound[addEntry].length - 1][2])) {
							matchesFound[addEntry][matchesFound[addEntry].length - 1][2].push(chapterNum);
						}
					}
				}
				previousTerm = currentTerm;
				
			}
			
			// Add entries with hits in definition to end of list
			selectedEntriesArray = selectedEntriesArray.concat(matchesFound.term, matchesFound.definition);
			
		}
		
		// Display content
		function displayEntries() {
			
//			var glossaryForm = document.getElementById("theForm");
//			var selectedChapter = glossaryForm.chapterSelector.options[glossaryForm.chapterSelector.selectedIndex].value;
//			var glossaryNode = document.getElementById("glossary");
			var existingGlossary = document.getElementById("glossaryEntries");
			var newGlossary = document.createElement("div");
			var newPara;
			var chapterName = site.labels.chapterSingular || "Chapter";
			var chapterDisplay = chapterName + "&nbsp;";
			
			// Create entries and add them to page
			var count = selectedEntriesArray.length;
			
			// If no results
			if (count == 0) {
				
				newPara = document.createElement("p");
				var message = document.createElement("div");
				message.style.fontWeight = "bold";
				message.innerHTML = "No Results Found";
				newPara.appendChild(message);
				newGlossary.appendChild(newPara);
			
			// If results
			} else {
				// Each entry
				for (var entryInd = 0; entryInd < count; entryInd ++) {
					
					var chaptersArray = selectedEntriesArray[entryInd][2];
					var titleArray = [];
					
		
					// Sort chapters
					chaptersArray.sort(compareNumbers);
					var termStr = selectedEntriesArray[entryInd][0][0];
					var definitionStr = selectedEntriesArray[entryInd][1][0];
					
					if (site.glossary.audio) {
						var mp3Str = selectedEntriesArray[entryInd][3];
					}
					
					if (site.glossary.chapterTitles) {
						for (chapter in chaptersArray) {
							titleArray.push(site.chapterTitles[chaptersArray[chapter]]);
							chapterDisplay = "";
						}
					}
					
					// Add chapter references
					
					if (selectedChapter == "all") {
						if (chaptersArray.length == 1) {
							definitionStr += " (" + chapterDisplay + (titleArray[0] || chaptersArray[0] ) + ")";
						} else {
							definitionStr += " (" + chapterDisplay + makeListWithCommas(titleArray || chaptersArray) + ")";
						}
					}
					newPara = document.createElement("p");
					var term = document.createElement("div");
					var definition = document.createElement("div");
					if (site.glossary.audio) {
						var mp3 = document.createElement('a');
						mp3.innerHTML = termStr;
						mp3.href = makePath([site.siteDirs.glossaryAudio], mp3Str[0]);
						term.appendChild(mp3);
					} else {
						term.innerHTML = termStr;
					}
					
					term.className = "glossaryTerm";
					definition.className = "glossaryDefinition";
					
					
		//			term.style.fontWeight = "bold";
		//			definition.style.fontWeight = "normal";
					// Must use innerHTML to preserve special characters
					definition.innerHTML = definitionStr;
					newPara.appendChild(term);
					newPara.appendChild(definition);
					newGlossary.appendChild(newPara);
			
				}
				
			}
			
			// Display the new entries
			glossaryNode.replaceChild(newGlossary, existingGlossary);
			newGlossary.id = "glossaryEntries";
			

			// Bind click behaviors to entries
			$(document).ready(function() {
				$("div#glossaryEntries a").live("click", function() {
					$("div#glossaryEntries a.playing").removeClass("playing");
					$(this).addClass("playing");
					var term = $(this).text();
					if (site.glossary.audio) {
						var mp3 = $(this).attr("href");	
						flashManager.player.sendEvent('LOAD', mp3);
						flashManager.player.sendEvent('PLAY');
					}
					return false;
				});
			});
			
		}

		// Remove diacritics and punctuation from text
		function normalizeText(str) {
			
			if (!str) {
				return "";
			}
			// Each character in string
			for (var charPos = 0; charPos < str.length; charPos ++) {
				var newChar = "";
				var segment1 = "";
				var segment2 = "";
				var characterCode = str.charCodeAt(charPos);
				
				// If not alphanumeric or space
				if (!((characterCode == 32) ||
					(characterCode > 47 && characterCode < 58) ||
					(characterCode > 64 && characterCode < 91) ||
					(characterCode > 96 && characterCode < 123))) {
					// If foreign language char, remove diacritic
					if (characterCode > 191 && characterCode < 403) {
						if (foreignChars[characterCode] != undefined) {
							// New char is first characters of HTML symbolic entity
							newChar = foreignChars[characterCode].substring(0, 1);
						} else {
							newChar = "";
						}
					// If another type of char, delete it
					} else {
						newChar = "";
					}
					// Replace special char with new char, or delete it if
					// replacement can't be found
					segment1 = str.substring(0, charPos);
					segment2 = str.substring(charPos + 1);
					str = segment1 + newChar.toLowerCase() + segment2;
					// Move pointer back to compensate for removed character
					if (newChar == "") {
						charPos --;
					}
				}
			}
			
			return str;
			
		}
	
	}
	
	// Clear the search box and display all entries
	function ClearSearch() {
		
		glossaryForm.searchBox.value = "";
		this.doSearch();
		
	}
	
	// Change to new chapter selected from drop-down menu
	function ChangeChapter() {
		
		selectedChapter = glossaryForm.chapterSelector.options[glossaryForm.chapterSelector.selectedIndex].value;
		this.doSearch();
		
	}
	
	// Private Methods
	
	// Check if value is contained in array
	function isInArray(value, array) {
		for (var i = 0; i < array.length; i ++) {
			if (array[i] == value) {
				return true;
			}
		}
		return false;
	}
	
	// For sorting numerically
	function compareNumbers(a, b) {
		return a - b;
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
	}
	
	// Remove extra spaces; convert hyphens to space
	function fixSpaces(str) {
		
		// Convert space and hyphens to single space
		str = str.replace(/[\s\-]+/g, " ");
		// Remove leading and trailing space
		str = str.replace(/^\s+/, "");
		str = str.replace(/\s+$/, "");
		
		return str;
		
	}

}