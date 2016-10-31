// Version 1.1

var introString = "";

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

// Initialize interface

// Old name used instead of initGlossary
function init() {
	
	initGlossary();
	
}

// Optional parameter limits the glossary to only entries
// for that chapter
function initGlossary(defaultChapterNum) {
	
	var glossary = document.getElementById("glossary");
	
	// Add form, search box, and buttons
	glossary.innerHTML = '<form id="theForm" name="theForm"><table border="0" cellpadding="0"><tr><td valign="bottom"><span class="bodytext">Enter term to search for:</span><br /><input name="searchBox" id="searchBox" type="text" size="40" onKeyPress="return captureEnter(event)" /></td><td valign="bottom"><input type="button" name="searchButton" id="searchButton" value="Search" onClick="doSearch()"/>&nbsp;<input type="button" name="clearButton" id="clearButton" value="Clear" onClick="clearSearch()"/></td></tr><tr><td>&nbsp;</td><td><select name="chapterMenu" id="chapterMenu" onChange="clearSearch()"></select></td></tr></table></form><div id="glossaryEntries"></div>';
	
	var glossaryForm = document.getElementById("theForm");
	var searchButton = document.getElementById("searchButton");
	var clearButton = document.getElementById("clearButton");
	
	// Size buttons
	searchButton.width = "52";
	searchButton.height = "22";
	clearButton.width = "52";
	clearButton.height = "22";
	
	// Build chapter menu
	glossaryForm.chapterMenu.options[0] = new Option();
	glossaryForm.chapterMenu.options[0].text = "All Chapters";
	glossaryForm.chapterMenu.options[0].value = "all";
	for (var i = 0; i < chapterCount; i ++) {
		var newChapterInd = glossaryForm.chapterMenu.options.length;
		var chapterNum = i + 1;
		var label = "";
		// Ajust chapter number if there is an introductory chapter
		if (introString && chapterNum == 1) {
			label = introString;
		} else if (introString) {
			label = "Chapter " + (chapterNum - 1).toString();
		} else {
			label = "Chapter " + chapterNum.toString();
		}
		glossaryForm.chapterMenu.options[newChapterInd] = new Option();
		glossaryForm.chapterMenu.options[newChapterInd].text = label;
		glossaryForm.chapterMenu.options[newChapterInd].value = chapterNum;
	}
	
	// If chapterNum parameter is passed, select specified chapter
	if (arguments.length > 0) {
		glossaryForm.chapterMenu.selectedIndex = defaultChapterNum;
	}
	
	// Load glossary entries
	doSearch();
	
}

// Capture Enter key to launch search
function captureEnter(e) {
	
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
		doSearch();
		return false;
	} else {
		return true;
	}

}


// Perform search and display results
function doSearch() {
	var glossaryForm = document.getElementById("theForm");
	searchStr = glossaryForm.searchBox.value;
	getEntries(searchStr);
}

// Get correct entries to display
function getEntries(searchStr) {
	
	var selectedEntriesArray = new Array();
	var matchesFound = {term : new Array(), definition : new Array()};
	var matchArray = new Array();
	var count = contentArray.length;
	var sourceStr = "";
	var previousTerm = "";
	var currentTerm = "";
	var chapterNum = "";
	var searchPattern = new RegExp();
	var addEntry = "";
	var glossaryForm = document.getElementById("theForm");
	var selectedChapter = glossaryForm.chapterMenu.options[glossaryForm.chapterMenu.selectedIndex].value;
	
	// Remove extra space, punctuation, and diacritics from search string
	searchStr = fixSpaces(searchStr);
	searchStr = normalizeText(searchStr);
	searchStr = searchStr.toLowerCase();
	
	// Find terms in selected chapter that match search
	for (var i = 0; i < count; i ++) {
		currentTerm = contentArray[i][0][0];
		chapterNum = contentArray[i][2][0];
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
			sourceStr = contentArray[i][0][1];
			if ((matchArray = sourceStr.match(searchPattern)) != null) {
				addEntry = "term";
			// If no terms found, find definitions that match search
			} else {
				sourceStr = contentArray[i][1][1];
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
				matchesFound[addEntry].push(contentArray[i]);
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
	displayEntries(selectedEntriesArray);
	
}

// Display content
function displayEntries(selectedEntriesArray) {
	
	var glossaryForm = document.getElementById("theForm");
	var selectedChapter = glossaryForm.chapterMenu.options[glossaryForm.chapterMenu.selectedIndex].value;
	var glossary = document.getElementById("glossary");
	var existingGlossary = document.getElementById("glossaryEntries");
	var newGlossary = document.createElement("div");
	var newPara;
	
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
			// Sort chapters
			chaptersArray.sort(compareNumbers);
			var termStr = selectedEntriesArray[entryInd][0][0];
			var definitionStr = selectedEntriesArray[entryInd][1][0];
			// Add chapter references
			if (selectedChapter == "all") {
				if (chaptersArray.length == 1) {
					definitionStr += " (Chapter&nbsp;" + chaptersArray[0] + ")";
				} else {
					definitionStr += " (Chapters&nbsp;" + makeListWithCommas(chaptersArray) + ")";
				}
			}
			newPara = document.createElement("p");
			var term = document.createElement("div");
			var definition = document.createElement("div");
			
			term.className = "glossary-term";
			definition.className = "glossary-definition";
//			term.style.fontWeight = "bold";
//			definition.style.fontWeight = "normal";
			// Must use innerHTML to preserve special characters
			term.innerHTML = termStr;
			definition.innerHTML = definitionStr;
			newPara.appendChild(term);
			newPara.appendChild(definition);
			newGlossary.appendChild(newPara);
	
		}
		
	}
	
	// Display the new entries
	glossary.replaceChild(newGlossary, existingGlossary);
	newGlossary.id = "glossaryEntries";
	
}

// Clear the search box and display all entries
function clearSearch() {
	var glossaryForm = document.getElementById("theForm");
	glossaryForm.searchBox.value = "";
	doSearch();
}

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

// Remove extra spaces; convert hyphens to space
function fixSpaces(str) {
	
	// Convert space and hyphens to single space
	str = str.replace(/[\s\-]+/g, " ");
	// Remove leading and trailing space
	str = str.replace(/^\s+/, "");
	str = str.replace(/\s+$/, "");
	
	return str;
	
}