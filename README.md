# site_engine

Home-grown MVC framework (2008-2012) 

This is the documentation for the existing Site Definition File format that is currently used by the Media App and Premium Websites built in the Site Engine. It includes documentation for Components Files, which contain information for Asset Items and are referenced by Site Definition Files. Not all of the metadata defined here is relevant to the Media App, so the Media App uses a subset of the elements defined below.
Bibliographic Information
The <book> element contains the following child elements to define bibliographic data:
<title> : the title of the book, not including the subtitle.
<subtitle> : The subtitle of the book.
<author> : The full name(s) of the book's author or authors. Multiple names should be separated by commas.
<edition-number> : The number of the edition, as a numeral (not spelled out). For example: 8.
<edition-type> : Any term describing the type of edition. Some examples are Enhanced, Brief, Concise, Texas.
<book-id> : An abbreviated name for the book in this format : <author last name><edition number>e<abbreviated title> (For example: kleiner_13e_art) [Not yet implemented]
<isbn-core> : The 13-digit core text ISBN of the book. This is different from the SSO ISBN. This is used to create the Buy Online link to the product information page in Cengage Brain.
<discipline> : The discipline of the book, such as Art or History.
<start-chapter-number> : This can be any number, for examle 0 (for an intro) or say 17 (for a site that starts with chapters from volume 2) and determines what the starting number will be for chapter numbering. The numbers in filenames and URL patterns must correspond to these numbers. Set this value to 0 if the first chapter is an introduction and the second chapter should be called Chapter 1. Then use label="Introduction" to specify the chapter label for the first chapter (see below). If no label attribute is supplied for a chapter title, the label will be the chapter number.
<chapter-titles> : The titles of the book's chapters. Each must be enclosed in a seperate<title> tag. [The following feature is not yet implemented:] If the label for the chapter should be something other than the chapter number, add a label attribute to the title tag. For example,
<title label="Introduction">The Early Years</title>
would render as:
Introduction. The Early Years
To suppress the label, use label="_none"
Example:
 <book>
  <title>Art Through the Ages</title>
  <subtitle>A Global History</subtitle>
  <author>Fred S. Kleiner</author>
  <edition-number>13</edition-number>
  <edition-type>Enhanced</edition-type>
  <book-id>kleiner_13e_art</book-id>
  <isbn-core>9780495799863</isbn-core>
  <discipline>Art</discipline>
  <chapter-titles>
   <title>Art before History</title>
   <title>The Ancient Near East</title>
   <title>Egypt under the Pharaoh</title>
   <title>The Prehistoric Aegean</title>
   <title>Ancient Greece</title>
  </chapter-titles>
 </book>
Site Information
The <site> element contains data concerning the site structure. Normally it is not necessary to enter values for these elements, since the defaults are usually correct. The child elements of <site> are described below.
<type> : The type must be either "premium" for a standard premium site (the default), "4ltr" for a 4LTR Press site, or "resource_center" for a non-book-specific Resource Center. For more information about configuring a Resource Center, see the Resource Center section below.
<show-heading> : When this element is set to "true" a heading will be displayed at the top of each content page in the form Bucket Name: Asset Name. For example, "Games: Crossword Puzzle." The default is "false" to avoid problems of redundant headings in existing sites, but for new sites this should always be set to "true." If you need to suppress the heading on a particular page, set <show-heading> to "false" for that asset.
<show-chapter-numbers> : When this element is set to "true" (the default value), chapter numbers will always be displayed in front of the chapter titles everywhere in the interface. For example, 1. Early Civilization. To suppress the display of these chapter numbers, set the value to "false."
<unavailable-menu-options> This dictates how the site engine will display unavailable assets in resource center sites. The values are:
show - This is the default setting. Left Side Menu will display options for all assets, whether or not they are available for the current chapter.
hide - Menu will hide options for assets that aren't available in the current chapter.
gray - Menu will display options for assets that aren't available in the current chapter as grayed out/disabled.
<show-book> - This setting dictates whether your resource center site will display the group/book level home pages as a custom image or if it will display information about the book (title, subtitle, edition, author, and book cover image) - all of which are specified within the <book> section of the <resource-group> It also allows the book description to be displayed for each resource group which is pulled from html files in the site root which need to be named home1.html, home2.html, etc. Note:"home.html" is the home page for the entire resource center - home1.html would be the homepage for the first group/book level resource. This tag has a value of either true or false. (false is the default).
Example (show-book):
<?xml version="1.0" encoding="utf-8"?>
<clse version="1.0">
<resource-center>
    <title>Helping Professions Learning Center</title>
</resource-center>
<site>
<title>Resource Center</title>
    <subtitle>Testing Subtitle</subtitle>
    <type>resource_center</type>
    <unavailable-menu-options>gray</unavailable-menu-options>
    <show-book>true</show-book>
Example (book information):
<resource-group>
    <name>social_work</name>
    <icon>swicon.png</icon>
    <substitutions>
    <site>
        <site-dirs>
            <glossary-audio></glossary-audio>
        </site-dirs>
        <site-files>
            <glossary-content>glossary/glossary_sw.js</glossary-content>
            <home-page-image>/counseling/987654321X_rodgerhplc/images/home_page1.jpg</home-page-image>
        </site-files>
    </site>
    <interface>
        <nav-bar></nav-bar>
            <side-menu>
                <item display="false"/>
                <item display="false"/>
                <item display="false"/>
            </side-menu>
        </interface>
    <book>
        <title>Introduction to Social Work and Social Welfare</title>
        <subtitle>Empowering People</subtitle>
        <edition-number>10</edition-number>
        <author>Charles Zastrow</author>
        <bookcover-image>/counseling/987654321X_rodgerhplc/images/socialwork_sample_book.png</bookcover-image>
<menu-style> - Set this tag to "compressed" to display the accordion menu on the resource center in it's compressed state (reduced link & topic height + smaller icon and font on group/book level topic.
Interface Labels
The <labels> element is used to alter the Chapter labels that appear in the interface and messages. This element has two children:
<chapter-singular> : Defines the label that appears in the Select Chapter button and the popup Chapter Menu. the default value of "Chapter" can be changed to something such as "Topic" or "Part" as desired. This will alter the appropriate interface elements to say "Select Topic" or "Select a Topic," etc.
<chapter-plural> : Defines the label that appears in messages such as "This resource is not available for all chapters." The default of "Chapters" can be changed to match the value in <chapter-singular>.
<resource-group-singular>, <resource-group-singular> : These are used to change the labels for Resource Groups in Resource Centers, similarly to the elements above.
Example:
<labels>
   <chapter-singular>Topic</chapter-singular>
   <chapter-plural>Topics</chapter-plural>
   <resource-group-singular>Course</resource-group-singular>
   <resource-group-plural>Courses</resource-group-plural>
</labels>
Glossary Settings
* *The <glossary> element is used to change how the native Site Engine glossaries work.
<audio>: Set to "true" if the glossary has audio.
<chapter-titles>: Set to "true" if you the parenthetical chapter references in the book level glossary to pull from the chapter titles names instead of being auto numbered.
For example:
<glossary>
   <chapterTitles>true</chapterTitles>
</glossary>
Demo Chapters
<demo-chapters> : If the site is demo site that doesn't offer content for all chapters, the chapters that have content should be listed in <chapter-number> tags. For example:
<demo-chapters>
   <chapter-number>1</chapter-number>
   <chapter-number>2</chapter-number>
</demo-chapters>
Site Engine Directories
The <engine-dirs> element defines the directory names for files needed by the Site Engine. It contains the following child elements:
<templates> : The location of the site shell template. The default is /site_engine/templates/
<js>: The location of the supporting JavaScript files. The default is /site_engine/js/
Site Directories
The <site-dirs> element defines the names for directories used by site. It contains the following child elements:
<content> : This defines the site root where content is located. It is useful when all content should be loaded from a different site. The default is "." which indicates the site root. [Not yet implemented]
<protected> : This specifies the directory that holds protected content, relative to the site root. The default is "/student."
<unprotected> : This specifies the directory that holds unprotected content, relative to the site root. The default is "/assets." Changing this to "." will indicate the site root.
<glossary-audio> : This specifies where audio files are located if there is an audio glossary.
Site Files
The <site-files> element defines the names for files used by site. It contains the following child elements:
<glossary-content> : This specifies the relative path of the glossary content file. The default is "glossary/glossary_content.js." You should not change this unless you are loading glossary content from another site.
<stylesheet> : If you need to use a custom stylesheet in the site, enter the URL of the stylesheet relative to the site root. For example, "styles.css" (the recommended name) or "css/styles.css." These styles will override any built-in styles of the same name.
<stylesheet4ltr>: Same as above, for 4LTR sites. Default is "site.css"
<home-page-image>: Sets the image for the site or resource group home page. Default is "[%siteDirs.images%]/home_page.jpg"
<home-page-base-filename>: Sets the basename of the home's HTML file. Default is "home"
<glossary-content>: Sets the location for the glossary content file for a site or resource group.
<survey> : This defines the URL for the Tell us what you think! link at the top of the screen. By default the link goes to a generic survey at http://cengage.qualtrics.com/SE?SID=SV_0GwLkyEppF8MqI4&SVID=Prod. If you have a custom survey specifically tailored to your site, enter its URL here.
Other children, which would rarely would used are:
<authentication>: "[%siteDirs.protected%]/index.html"
<ssoUrls>: "[%siteDirs.protected%]/sso_urls.jsp"
<ebookUrl>: ""
<ebookDomain>: ""
<instructorSite>: ""
<buyOnline>: "http://www.cengagebrain.com/tl1/en/US/storefront/ichapters?cmd=catProductDetail&ISBN="
Interface Information
The <interface> element contains two child elements: <nav-bar> and <side-menu>.
Nav Bar
The <nav-bar> element determines what appears in the Nav Bar (the row links at the top of the screen, which includes the predefined Home link).
Side Menu
The <side-menu> element determines the options that appear in the Side Menu.
Interface Items
Inpidual options are added to the Nav Bar or Side Menu as <item> elements. Items of the type "asset" will appear as indivdual menu options. Asset items can be enclosed by items of the type "bucket," which group asset items together under a single menu option. A bucket item element must enclose two or more asset items.
<item>
Important: The name attribute must match the name specified for the asset or bucket in its corresponding <bucket> or <asset> element (see below).
Example:
 <interface>
  <nav-bar>
   <item/>
   <item/>
  </nav-bar>
  <side-menu>
   
   <item>
    <item/>
    <item/>
   </item>
   
   <item/>
   
   <item>
    <item/>
    <item/>
   </item>
   
   <item/>
  </side-menu>
</interface>
Bucket Information
The <buckets> element defines bucket data. Each bucket is defined by a <bucket> child element containing the following children:
<name> : The name of the bucket. This is an abbreviation of the bucket title and should be all lowercase with no spaces or punctuation (underscores may be used). It is used internally and must match the bucket name specified in the corresponding <interface> element.
<title> : The title of the bucket as it will appear in the menu.
<blurb-short> : The description of the bucket that will appear when the user mouses over the menu option. If there is no short blurb the long blurb will be used.
<blurb-long> : The description that will appear on the site map page (which hasn't yet been implemented). If there is no long blurb, the short blurb will be used. [Not yet implemented]
<icon> : The filename of the icon that should appear on the menu beside the name of the bucket. Currently, all these reside in the main site_engine directory: site_engine/images/icons/
Example:
 <buckets>  
  <bucket>
   <name>games</name>
   <title>Games</title>
   <blurb-short>Challenge yourself with a collection of games.</blurb-short>
   <blurb-long/>
   <icon>games.gif</icon>
  </bucket>
  <bucket>
   <name>video</name>
   <title>Video</title>
   <blurb-short>Watch the video that accompanies your textbook and test your comprehension.</blurb-short>
   <blurb-long/>
   <icon>video.gif</icon>
  </bucket>
</buckets> 
Asset Information
The <assets> element defines data for all the site's assets. Each asset must also be defined in the <interface> node! (see <name> element below). Each asset is defined by an <asset> child element containing the following children:
<name> : The name of the asset. This is an abbreviation of the asset title and should be all lowercase with no spaces or punctuation (underscores may be used). It is used internally and must match the asset name specified in the corresponding <interface> element.
<title> : The title of the asset as it will appear in the menu or tab. A normalized version of the title will used to create Location IDs for linking to the asset.
<type> : The type of asset. These are the possible values:htmlAny page that should be loaded directly into the site's content area. Usually these will be HTML pages, but they can also be pages generated by the Companion Site database, such as Flashcards. Such content will be loaded into an iFrame if the asset has an <iframe-height> value, or if the file is cross-domain. Otherwise only the body content of the file will be loaded via AJAX into an auto-sized <div> element, and <head> content, including any linked CSS or JS, will be stripped out.audioMP3 audio files that should be loaded into the JW Player.videoFLV video files that should be loaded into the JW Player.glossaryUsed to bring up an Apollo-created glossary. Can be book level (all terms) or chapter level, depending on the <scope> element. (Most sites have a book level glossary in the nav-bar, and a chapter level one in the side-bar.) Looks for /glossary/ directory by default in the site root, with a "glossay_content.js" inside. If the glossary is an audio one, this node should be added to the <site> element:
<glossary>
  <audio>true</audio>
</glossary>
In addition, a <glossary-audio> node should be added to the <site-dirs> element, with the path to the glossary mp3 files. Such as: <glossary-audio>flashcards/media/</glossary-audio>
indexPuts asset content into tabs, in that it treats the page given in the <url> as an index, in which all links in the page are opened in a second tab. Tab labels are taken from the <menu-tab-label> and <content-tab-label> elements.templateSpecifies that a predefined template will be used to create the page content. Variables within the template will be replaced to create the correct URLs and (if applicable) component titles. The name of the template must be specified in the <template> element (see below). Templates should always be used for an asset if one is available.<template> : The name of the template to be used if the asset type is "template." Templates should be used to create Launch Pages for the following assets that will open in a new window. If the text that is used for the link on a Launch Page is alterable, the new text is specified by <link-title> (see below). For a list of all available templates and more details about using them, see "Templated Assets with Launch Pages" in the discussion of Asset Types.
<link-title> : This specifies the text that be used for the link on any of the Launch Page Templates above.
<scope> : "book" for a "Course Resource" or "chapter" for resources that are different for each chapter. If the scope is "book" the 'Select chapters" and "Browse" functionalities will be unavailable.
<show-heading> : When set to "true" a heading will be displayed at the top of the asset's content page in the form Bucket Name: Asset Name. For example, "Games: Crossword Puzzle." Normally this property will be set to "true" in the <site> element, which will cause headings to display for all asset pages. If you need to suppress the heading for a particular asset, set <show-heading> to "false" for the asset.
<blurb> : This is the short description that will appear in the rollover when the asset title is hovered over in the side menu.
<protected> : "true" or "false" value determines if a SSO login-in is needed to view the asset. If "true" the Site Engine will look for the asset in the protected directory ("student" by default); otherwise, the unprotected directory will be used ("assets" by default). In either case the default directories can be overridden on a per asset basis by giving an absolute URL instead of a relative one. The protected and unprotected directories can also be changed in the <site-dirs> element.
<standalone-protected> : [This feature is deprecated. The <courseware> option should be used instead.] Set to "false" if the asset should be protected on the site but must be accessible in unprotected form when linked to as a standalone page from a course. When this is set to "false," asset files must be stored in an unprotected folder (/assets) and should not be placed in the protected folder (/student). The Site Engine will block access if the user is not logged in. Default is "true."
<courseware> : Set to "true" if the site has a /courseware directory that will be used for accessing protected content from a course or WebTutor. This will cause standalone Site Engine pages (loaded by URLs without the :shell parameter) to access protected content through the unprotected /courseware directory, while content within the site shell is still accessed through the protected /student folder. See Accessing Protected Content from Courses. Defaults to "false."
<url> : The absolute or relative path to the asset. If the URL is not preceded by a slash, it will be treated as relative to the site's "protected" or "unprotected" directory, depending on the value of <protected>. If the URL has a consistent pattern, and some part of it changes per chapter, then the Site Engine can use the following variables to replace that part accordingly: [%chapterNumPadded%] (appends a zero before single digit chapter numbers) and [%chapterNum%] (returns the chapter number). If there is no pattern in the URLs, a components XML file should be made and referred to in a <sections-file> element.
For example: <url>[http://webquiz.ilrn.com/quiz-public?name=klgh13q/klgh13q_psl_chp[%chapterNumPadded%]]</url> would return URLS such as http://webquiz.ilrn.com/quiz-public?name=klgh13q/klgh13q_psl_chp01 or http://webquiz.ilrn.com/quiz-public?name=klgh13q/klgh13q_psl_chp17
<dir> : Specifies a parent directory that should be prepended before each URL entered in the <url> element of a components XML file.
<chapters-free> : Unprotected sample chapters for protected assets. Each chapter number must be enclosed in a <chapter-number> tag. Make sure files are placed in the right directories. Normally, free chapter content will go in /assets and protected chapter content will go in /student. For example:
<chapters-free>
   <chapter-number>1</chapter-number>
   <chapter-number>2</chapter-number>
</chapters-free>
<chapters-unavailable> : This tells the Engine know to display an "unavailable" message instead of a "coming soon" message for chapters that don't have this asset. Each chapter number must be enclosed in a <chapter-number> tag.
<iframe-height> : Entering a value in this field will force content to load into an iframe instead of a div. This is necessary if the page must retain header tags to load CSS or JavaScript. If the content is being loaded from a URL with the same domain as the Site Engine, you should enter the value "auto", which will cause the iframe height to be automatically adjusted to match the height of the content. Automatic iframe sizing will not work if content is loaded from a cross-domain URL; in these cases you should enter a numeral specifying the height of the iframe in pixels. If content is loaded from a cross-domain URL, it will be loaded into an iframe regardless of the value entered in <iframe-height>. In these cases, if the height of the content exceeds the default height of the page, you can specify an <iframe-height> suitable for the content.
<menu-tab-label>, <content-tab-label> : Used with <type> "index". The former specifies the label for the "menu" tab, and the latter specifies the label for the "content" tab where the content page appears. 
<icon> : The filename of the icon to be used for the menu option for the asset.
<link-style> : Specifies the style for popup windows. For assets that appear in the Top Nav Bar, this defines the style of the window in which the asset page opens. For assets that appear in the side menu, this forces every link on the asset page to open in a new window and defines the style of those popup windows. The value of <link-style> must be "popup" or "popup" followed by a substyle. Different substyles can be used in combination where appropriate. The available substyles are as follows:
showAll : Show all browser elements (menu, navigation buttons, etc.)
showNav : Show browser navigation buttons only
fixed : Window not scrollable or resizable
noScroll : Window not scrollable
noResize : Window not resizable
vpgEbook : The correct setting for opening a vpgEbook. No browser elements and dimensions of 945 by 720.
crossword : The correct setting for popup Crossword Puzzles. No browser elements and dimensions of 730 by 530.
A setting of <link-style>popup showNav noScroll</link-style> will open the window with only the browser navigation buttons displayed and scrollbars removed. It will use the default window dimensions of 800 by 560.
<window-width>, <window-height> : If a popup link-style is specified (see above), these elements will set the window width or height. These values will override any dimensions inherent in the style.
<player-width>, <player-height> : for <type> "video," or "audio," this sets the dimensions of the player.
<margin> : Overrides the default left and right margins for the content area. Set this to "0" to increase the available width if necessary for embedding a wide page.
<sections-file> : This element takes the filename of a components XML file. The file itself must be put in the site root and should be named in this manner:
onge_8e_interaction_video_sections.xml
This file allows you to assign multiple video or audio selections to a playlist on a single page, and also makes it possible to assign per chapter URLs to an asset that do not follow a particular pattern.
<link-title> : Specifes the text that is used for the link in a Launch Page template. See Asset Types for more details.
<link-bullet> : Specifies the bullet icon to be used for each link in a page based on the download template. Some possible values are pdf and zip. See Asset Types for the complete list of values.
Media Options (for Audio and Video)
The <media-options> element specifies values that will be used for video and audio asset types. This element contains the following children that must be contained within a <media-options> tag:
<video-width> : The default video size is 480 (width) by 360 (height). If a different width is required, set this to the the width of the video in pixels. The value must be a numeral. This has the same effect as <player-width>.
<video-height> : If the video height should be different than the default 360, set this to the height of the video. Unlike <player-height>, this determines the height of the video play area, not the height of the entire player. It should be used instead of <player-height> whenever possible.
<download-media> : The value is either "true" or "false" and determines whether a downloadable file is available for an audio or video asset.
<download-media-ext> : Specifies the extension for the files if <download-media> is true. The extension should be entered in lowercase without the dot. The default is "zip."
<download-media-label> : Specifies the text that will appear in parentheses after the download link if <download-media> is true. The defaults are "Zipped MP3" for Audio and "Zipped MP4" for Video.
<view-transcript> : The value is either "true" or "false" and determines whether an html transcript will be displayed for an audio asset.
<download-transcript> : The value is either "true" or "false" and specifies whether a downloadable transcript is available for an audio or video asset.
<download-transcript-ext> : Specifies the extension for the files if <download-transcript> is true. The extension should be entered in lowercase without the dot.
<streamer> : If a streaming server is being used for the media, specify the relevant URL. (This sets the streamer flashvar for the player.)
Example:
<media-options>
           <video-width>400</video-width>
           <video-height>300</video-height>
           <download-media>true</download-media>
           <download-media-ext>zip</download-media-ext> 
<view-transcript>true</view-transcript>
           <download-transcript>true</download-transcript>
           <download-transcript-ext>pdf</download-transcript-ext>
</media-options> 
Examples:
<asset>
  <name>images</name>
  <title>Bonus Images</title>
  <type>index</type>
  <scope>chapter</scope>
  <protected>true</protected>
  <blurb />
  <url>
  bonus/ch[%chapterNumPadded%]/[%chapterNumPadded%]_index.html</url>
  <chapters-free>
    <chapter-number>6</chapter-number>
    <chapter-number>7</chapter-number>
  </chapters-free>
  <chapters-unavailable>
    <chapter-number></chapter-number>
  </chapters-unavailable>
  <iframe-height>auto</iframe-height>
  <menu-tab-label>Menu</menu-tab-label>
  <content-tab-label>Image</content-tab-label>
  <icon>images.gif</icon>
  <link-style></link-style>
</asset>
<asset>
  <name>glossary</name>
  <title>Glossary</title>
  <type>glossary</type>
  <scope>book</scope>
  <protected>false</protected>
  <blurb />
  <url />
  <chapters-free>
    <chapter-number />
  </chapters-free>
  <chapters-unavailable>
    <chapter-number />
  </chapters-unavailable>
  <iframe-height />
  <icon />
  <link-style>popup vpg-ebook</link-style>
</asset>
<asset>
  <name>timeline</name>
  <title>Interactive Timeline</title>
  <type>html</type>
  <scope>chapter</scope>
  <blurb>Explore and Learn important dates with our Interactive
  Timelines</blurb>
  <protected>true</protected>
  <url>timeline/[%chapterNumPadded%]_index.html .html</url>
  <chapters-free>
    <chapter-number />
  </chapters-free>
  <chapters-unavailable>
    <chapter-number>4</chapter-number>
    <chapter-number>8</chapter-number>
    <chapter-number>17</chapter-number>
    <chapter-number>21</chapter-number>
    <chapter-number>22</chapter-number>
  </chapters-unavailable>
  <iframe-height>480</iframe-height>
  <icon>timeline.gif</icon>
  <link-style />
  <margin>0</margin>
</asset>
<asset>
  <name>intext_audio</name>
  <title>In-Text Audio</title>
  <type>audio</type>
  <scope>chapter</scope>
  <blurb>Audio files from each lesson of the textbook.</blurb>
  <protected>false</protected>
  <url></url>
  <dir>intext_audio/</dir>
  <chapters-free>
    <chapter-number />
  </chapters-free>
  <chapters-unavailable>
    <chapter-number />
  </chapters-unavailable>
  <iframe-height>300</iframe-height>
  <icon>audio.gif</icon>
  <link-style />
  <sections-file>onge_8e_intext_audio_sections.xml</sections-file>
</asset>
Resource Centers
A Resource Center is a Website that is not devoted to a single book. It can be discipline specific, containing assets that are not correlated to particular books, or it can aggregate the content for multiple books into a single site. The Resource Center site structure adds an additional element to the top of the structural heirarchy. The top-level unit is called a Resource Group and can constitute a book, a course topic (such as World History or US History), or some other pedagogical grouping. Each Resource Group has the structure of a self-contained Premium Site. It contains multiple "chapters," which in turn each contain multiple assets. The units within a Resource Group are referred to internally as "chapters," but in the interface they can be labeled "topics," "themes," or any other appropriate term.
To specify that a site is a Resource Center, you must set the value of <type> in the <site> element to "resource_center":
<type>resource_center</type>
Resource Center Element
To define a Resource Center, you must add a <resource-center> element to the top of the Site Definition File, preceding the <site> elment. This element must contain the following child element:
<title> : This specifies the title for the Resource Center.
Example:
<resource-center>
    <title>Helping Professions Learning Center</title>
</resource-center>
Resource Groups Element
A Resource Center must also contain a <resource-groups> element, which in turn contains a <resource-group> child for each Resource Group. Default values for the contents of all Resource Groups are specified outside of <resource-groups> in the <site>, <book>, <interface>, <buckets>, and <assets> elements. These default values are defined exactly the same way that values are defined for a standard Premium Site. The <resource-group> element specifies only values that are different from the default values. These group-specific values are stored in a <substitutions> element within <resource-group>.
Every asset and bucket that appears anywhere in the site must have a default entry specified in the top-level <assets> and <buckets> elements. Typically the values for an asset (title, protection, scope, etc.) will be the same for every Resource Group in which it appears, with the exception of <url> and <chapters-unavailable>. This scheme enables the recurring values for an asset to be stored in a single location where they can be easily modified in a single operation. The asset values that differ from one Resource Group to the next (such as <url>) must be stored in the <substitutions> element within each <resource-group> element.
The names of glossary content files should be specified in the <site> element within <substitutions> as follows:
  <site>
   <site-files>
    <glossary-content>glossary/glossary_sw.js</glossary-content>
   </site-files>
  </site>
Each <resource-group> element contains the following children:
<name> : The name of the Resource Group, used internally. (This is not displayed in the interface.)
<substitutions> : This element holds the values that replace the default values. The children of this element are the standard elements that define a Premium Site---<site>, <book>, <interface>, <buckets>, and <assets>-and their values are defined exactly the same way.
Example:
<resource-group>
 <name>social_work</name>
 <substitutions>
  <site>
   <site-files>
    <glossary-content>glossary/glossary_sw.js</glossary-content>
   </site-files>
  </site>
  <book>
   <title>Social Work</title>
   <chapter-titles>
    <title>Introduction to Social Work</title>
    <title>Values and Ethics</title>
    <title>Theories of Human Behavior</title>
    <title>Practice</title>
    <title>Multicultural Competency</title>
    <title>Research</title>
    <title>Social Welfare Policy</title>
    <title>Field Education</title>
    <title>Professional Development</title>
   </chapter-titles>
  </book>
  <interface>
   <side-menu>
    <item display="false"/>
    <item display="false"/>
    <item display="false"/>
   </side-menu>
  </interface>
  <assets>
   <asset>
    <name>section_intro</name>
    <url>social_work/intro/section[%chapterNumPadded%]_intro.html</url>
   </asset>
   <asset>
    <name>select_textbook</name>
    <url>social_work/select_textbook/section[%chapterNumPadded%]_select.html</url>
   </asset>
  </assets>
 </substitutions>
</resource-group>
Resource Center Menus
The option labels in the Left Side Accordion Menu are defined by values in the <book> element that appears in the <substitutions> element of each Resource Group. The <title> element defines the top-level menu option labels and the <chapter-titles> element defines the submenu options.
The Asset Menu is defined by the <interface> element. All the menu options that for assets that appear in any Resource Group must be defined in the top-level <interface> element. Any options that shouldn't appear in the menu for a particular Resource Group must be overridden by values in the <interface> element that resides within <substitutions>. To supress default menu options you set the display attribute to "false" in the following manner:
<side-menu>
      <item display="false"/>
      <item display="false"/>
      <item display="false"/>
</side-menu>
The following configuration will result in an Asset Menu for Resource Group 1 that contains objectives, flashcards, and videos, and an Asset Menu for Resource Group 2 that contains objectives, quiz, flashcards, and cases.
Entry in top-level <site> element:
<interface>
  <side-menu>
    <item display="false"/>
    <item display="false"/>
    <item display="false"/>
    <item display="false"/>
    <item display="false"/>
   </side-menu>
</interface>
Entry in <substitutions> for Resource Group 1:
<interface>
  <side-menu>
      <item display="false"/>
      <item display="false"/>
  </side-menu>
</interface>
Entry in <substitutions> for Resource Group 2:
<interface>
   <side-menu>
      <item display="false"/>
   </side-menu>
</interface>
Components Files
 A Components File is an XML file that defines multiple components within a chapter for an asset. Components will usually be individual pages or items in a media playlist. [All <section> and <sections> tags will eventually be deprecated and replaced with <component> and <components> tags.]
 
Building a Components File
 A components file consists of a <section> element for each component within a chapter. This contains the following children:
 <chapter> : This should be a numeral indicating the chapter of the component. If the asset is a book-level resource, the chapter element should be omitted or left blank, and all components will be placed on the same page.
 <url> : Specifies the url for the component.
 <title> : The title of the component to appear in a playlist or menu.
 Example:
 <sections>
  <section>
    <chapter>1</chapter>
    <url>onge_8e_interaction_intext_cd01-03-03.mp3</url>
    <title>Listen to Lesson 1</title>
  </section>
</sections>
 Make sure you escape all entites (or enclose them in CDATA tags) and that the XML validates. A DOCTYPE is not needed.
 When to Use Them
 This file allows you to assign multiple video or audio selections to a playlist on a single page, and also makes it possible to assign URLs to an asset per chapter that do not follow a particular pattern. Rather than using the <url> element for an asset, one uses the <sections-file> element to point to an xml file in the root of the site.
 Example:
 <asset>
   <name>intext_audio</name>
   <title>In-Text Audio</title>
   <type>audio</type>
   <scope>chapter</scope>
   <blurb>Audio files from each lesson of the textbook.</blurb>
   <protected>false</protected>
   <url></url>
   <dir>intext_audio/</dir>
   <chapters-free>
    <chapter-number/>
   </chapters-free>
   <chapters-unavailable>
    <chapter-number/>
   </chapters-unavailable>
   <iframe-height>300</iframe-height>
   <icon>audio.gif</icon>
   <link-style/>
   <sections-file>onge_8e_intext_audio_sections.xml</sections-file>
</asset>
 The value in the <dir> element in the asset definition (see above) will be prepended to all the URLs entered in the Components File. So, for example, you can use <dir> to specify the directory and enter only the filenames in the Components File.
 Loading media in a playlist
 Take, for example, this French asset page containing a playlist of two audio tracks (as referenced in the example above): http://college.cengage.com/site_engine/#0495897604/intext_audio/1:shell (there are two mp3s for every chapter)
 The Components File, for the first two chapters, looks like:
 <sections>
  <section>
    <chapter>1</chapter>
    <url>onge_8e_interaction_intext_cd01-02-02.mp3</url>
    <title>Chapitre 1: Vocabulaire actif</title>
  </section>
  <section>
    <chapter>1</chapter>
    <url>onge_8e_interaction_intext_cd01-03-03.mp3</url>
    <title>
      <![CDATA[Chapitre 1: A l'écoute]]>
    </title>
  </section>
  <section>
    <chapter>2</chapter>
    <url>onge_8e_interaction_intext_cd01-04-04.mp3</url>
    <title>Chapitre 2: Vocabulaire actif</title>
  </section>
  <section>
    <chapter>2</chapter>
    <url>onge_8e_interaction_intext_cd01-05-05.mp3</url>
    <title>
      <![CDATA[Chapitre 2: A l'écoute]]>
    </title>
  </section>   ... more sections here ...</sections>
 The <chapter> element determines which chapter the playlist item appears in.
 The <url> is the path/name of the file. This can be absolute or relative. If relative, the values in the <protected> and <dir> elements will help define the full url.
 <title> is the title of the media in the asset playlist.
 
Loading Irregularly Named HTML assets
 In many cases, the URL of an asset only changes between chapters in that a chapter number string changes. In this case, the <url> element can be used, and the variable [%chapterNumPadded%] will be replaced in the URL appropriately: <url>flashcards/[%chapterNumPadded%]_index.html</url>
 But sometimes the URLs for an asset change wildly between different chapters. Here, a Components File can also be used:
 <sections>
  <section>
    <chapter>1</chapter>
    <url>/polisci/primary_sources/quizzes/embed.html?src=t01_amer_pol_sys_ps_decl_indepen_fae.xml</url>
    <title></title>
  </section>
  <section>
    <chapter>2</chapter>
    <url>/polisci/primary_sources/quizzes/embed.html?src=t03_roots_of_the_constitution_constitution.xml</url>
    <title></title>
  </section>
  <section>
    <chapter>3</chapter>
    <url>/polisci/primary_sources/quizzes/embed.html?src=t02_constitutional_reform_mcculloch_v_maryland.xml</url>
    <title>Maryland</title>
  </section>
  <section>
    <chapter>4</chapter>
    <url>/polisci/primary_sources/quizzes/embed.html?src=t04_amer_pol_culture_ps_common_sense_fae.xml</url>
    <title></title>
  </section>
... more sections follow ...</sections>
 Note that <title> has no effect in this context.
Creating Tabbed Index Pages
If you define an asset type as "html," the content will be displayed using two tabs, with the left tab presenting a menu of inks to pages available for that chapter and the right tab presenting the content of each page selected from the menu. (See the instructions for defining an asset of the type "index" in the discussion of the Site Definition File.) As an alternative you can set the asset type to "html" and use a Components File to create these menus dynamically. Each chapter component defined in the XML file will appear as a link in menu in the left tab. Clicking the menu option will open the component URL in the second tab. If there is only a single page for the chapter, the content will be loaded directly into the main page and no tabs will appear.
In the following example, the menu for Chapter 1 will contain 2 options:
Lesson 1
Lesson 2
Clicking on Lesson 1 will load onge_8e_interaction_lesson_ch01_01.html into the right tab.
<sections>
  <section>
    <chapter>1</chapter>
    <url>onge_8e_interaction_lesson_ch01_01.html</url>
    <title>Lesson 1</title>
  </section>
  <section>
    <chapter>1</chapter>
    <url>onge_8e_interaction_lesson_ch01_02.html</url>
    <title>Lesson 2</title>
    </title>
  </section>
   <section>
    <chapter>2</chapter>
    <url>onge_8e_interaction_lesson_ch02_01.html</url>
    <title>Lesson 1</title>
    </title>
  </section>
</sections>
