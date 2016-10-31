# Site Engine

Home-grown MVC framework (2008-2012) 

This is the documentation for the existing Site Definition File format that is currently used by the Media App and Premium Websites built in the Site Engine. It includes documentation for Components Files, which contain information for Asset Items and are referenced by Site Definition Files. Not all of the metadata defined here is relevant to the Media App, so the Media App uses a subset of the elements defined below.
Bibliographic Information
The &lt;book&gt; element contains the following child elements to define bibliographic data:
&lt;title&gt; : the title of the book, not including the subtitle.
&lt;subtitle&gt; : The subtitle of the book.
&lt;author&gt; : The full name(s) of the book's author or authors. Multiple names should be separated by commas.
&lt;edition-number&gt; : The number of the edition, as a numeral (not spelled out). For example: 8.
&lt;edition-type&gt; : Any term describing the type of edition. Some examples are Enhanced, Brief, Concise, Texas.
&lt;book-id&gt; : An abbreviated name for the book in this format : &lt;author last name&gt;&lt;edition number&gt;e&lt;abbreviated title&gt; (For example: kleiner_13e_art) [Not yet implemented]
&lt;isbn-core&gt; : The 13-digit core text ISBN of the book. This is different from the SSO ISBN. This is used to create the Buy Online link to the product information page in Cengage Brain.
&lt;discipline&gt; : The discipline of the book, such as Art or History.
&lt;start-chapter-number&gt; : This can be any number, for examle 0 (for an intro) or say 17 (for a site that starts with chapters from volume 2) and determines what the starting number will be for chapter numbering. The numbers in filenames and URL patterns must correspond to these numbers. Set this value to 0 if the first chapter is an introduction and the second chapter should be called Chapter 1. Then use label=&quot;Introduction&quot; to specify the chapter label for the first chapter (see below). If no label attribute is supplied for a chapter title, the label will be the chapter number.
&lt;chapter-titles&gt; : The titles of the book's chapters. Each must be enclosed in a seperate&lt;title&gt; tag. [The following feature is not yet implemented:] If the label for the chapter should be something other than the chapter number, add a label attribute to the title tag. For example,
&lt;title label=&quot;Introduction&quot;&gt;The Early Years&lt;/title&gt;
would render as:
Introduction. The Early Years
To suppress the label, use label=&quot;_none&quot;
Example:
 &lt;book&gt;
  &lt;title&gt;Art Through the Ages&lt;/title&gt;
  &lt;subtitle&gt;A Global History&lt;/subtitle&gt;
  &lt;author&gt;Fred S. Kleiner&lt;/author&gt;
  &lt;edition-number&gt;13&lt;/edition-number&gt;
  &lt;edition-type&gt;Enhanced&lt;/edition-type&gt;
  &lt;book-id&gt;kleiner_13e_art&lt;/book-id&gt;
  &lt;isbn-core&gt;9780495799863&lt;/isbn-core&gt;
  &lt;discipline&gt;Art&lt;/discipline&gt;
  &lt;chapter-titles&gt;
   &lt;title&gt;Art before History&lt;/title&gt;
   &lt;title&gt;The Ancient Near East&lt;/title&gt;
   &lt;title&gt;Egypt under the Pharaoh&lt;/title&gt;
   &lt;title&gt;The Prehistoric Aegean&lt;/title&gt;
   &lt;title&gt;Ancient Greece&lt;/title&gt;
  &lt;/chapter-titles&gt;
 &lt;/book&gt;
Site Information
The &lt;site&gt; element contains data concerning the site structure. Normally it is not necessary to enter values for these elements, since the defaults are usually correct. The child elements of &lt;site&gt; are described below.
&lt;type&gt; : The type must be either &quot;premium&quot; for a standard premium site (the default), &quot;4ltr&quot; for a 4LTR Press site, or &quot;resource_center&quot; for a non-book-specific Resource Center. For more information about configuring a Resource Center, see the Resource Center section below.
&lt;show-heading&gt; : When this element is set to &quot;true&quot; a heading will be displayed at the top of each content page in the form Bucket Name: Asset Name. For example, &quot;Games: Crossword Puzzle.&quot; The default is &quot;false&quot; to avoid problems of redundant headings in existing sites, but for new sites this should always be set to &quot;true.&quot; If you need to suppress the heading on a particular page, set &lt;show-heading&gt; to &quot;false&quot; for that asset.
&lt;show-chapter-numbers&gt; : When this element is set to &quot;true&quot; (the default value), chapter numbers will always be displayed in front of the chapter titles everywhere in the interface. For example, 1. Early Civilization. To suppress the display of these chapter numbers, set the value to &quot;false.&quot;
&lt;unavailable-menu-options&gt; This dictates how the site engine will display unavailable assets in resource center sites. The values are:
show - This is the default setting. Left Side Menu will display options for all assets, whether or not they are available for the current chapter.
hide - Menu will hide options for assets that aren't available in the current chapter.
gray - Menu will display options for assets that aren't available in the current chapter as grayed out/disabled.
&lt;show-book&gt; - This setting dictates whether your resource center site will display the group/book level home pages as a custom image or if it will display information about the book (title, subtitle, edition, author, and book cover image) - all of which are specified within the &lt;book&gt; section of the &lt;resource-group&gt; It also allows the book description to be displayed for each resource group which is pulled from html files in the site root which need to be named home1.html, home2.html, etc. Note:&quot;home.html&quot; is the home page for the entire resource center - home1.html would be the homepage for the first group/book level resource. This tag has a value of either true or false. (false is the default).
Example (show-book):
&lt;?xml version=&quot;1.0&quot; encoding=&quot;utf-8&quot;?&gt;
&lt;clse version=&quot;1.0&quot;&gt;
&lt;resource-center&gt;
    &lt;title&gt;Helping Professions Learning Center&lt;/title&gt;
&lt;/resource-center&gt;
&lt;site&gt;
&lt;title&gt;Resource Center&lt;/title&gt;
    &lt;subtitle&gt;Testing Subtitle&lt;/subtitle&gt;
    &lt;type&gt;resource_center&lt;/type&gt;
    &lt;unavailable-menu-options&gt;gray&lt;/unavailable-menu-options&gt;
    &lt;show-book&gt;true&lt;/show-book&gt;
Example (book information):
&lt;resource-group&gt;
    &lt;name&gt;social_work&lt;/name&gt;
    &lt;icon&gt;swicon.png&lt;/icon&gt;
    &lt;substitutions&gt;
    &lt;site&gt;
        &lt;site-dirs&gt;
            &lt;glossary-audio&gt;&lt;/glossary-audio&gt;
        &lt;/site-dirs&gt;
        &lt;site-files&gt;
            &lt;glossary-content&gt;glossary/glossary_sw.js&lt;/glossary-content&gt;
            &lt;home-page-image&gt;/counseling/987654321X_rodgerhplc/images/home_page1.jpg&lt;/home-page-image&gt;
        &lt;/site-files&gt;
    &lt;/site&gt;
    &lt;interface&gt;
        &lt;nav-bar&gt;&lt;/nav-bar&gt;
            &lt;side-menu&gt;
                &lt;item display=&quot;false&quot;/&gt;
                &lt;item display=&quot;false&quot;/&gt;
                &lt;item display=&quot;false&quot;/&gt;
            &lt;/side-menu&gt;
        &lt;/interface&gt;
    &lt;book&gt;
        &lt;title&gt;Introduction to Social Work and Social Welfare&lt;/title&gt;
        &lt;subtitle&gt;Empowering People&lt;/subtitle&gt;
        &lt;edition-number&gt;10&lt;/edition-number&gt;
        &lt;author&gt;Charles Zastrow&lt;/author&gt;
        &lt;bookcover-image&gt;/counseling/987654321X_rodgerhplc/images/socialwork_sample_book.png&lt;/bookcover-image&gt;
&lt;menu-style&gt; - Set this tag to &quot;compressed&quot; to display the accordion menu on the resource center in it's compressed state (reduced link &amp; topic height + smaller icon and font on group/book level topic.
Interface Labels
The &lt;labels&gt; element is used to alter the Chapter labels that appear in the interface and messages. This element has two children:
&lt;chapter-singular&gt; : Defines the label that appears in the Select Chapter button and the popup Chapter Menu. the default value of &quot;Chapter&quot; can be changed to something such as &quot;Topic&quot; or &quot;Part&quot; as desired. This will alter the appropriate interface elements to say &quot;Select Topic&quot; or &quot;Select a Topic,&quot; etc.
&lt;chapter-plural&gt; : Defines the label that appears in messages such as &quot;This resource is not available for all chapters.&quot; The default of &quot;Chapters&quot; can be changed to match the value in &lt;chapter-singular&gt;.
&lt;resource-group-singular&gt;, &lt;resource-group-singular&gt; : These are used to change the labels for Resource Groups in Resource Centers, similarly to the elements above.
Example:
&lt;labels&gt;
   &lt;chapter-singular&gt;Topic&lt;/chapter-singular&gt;
   &lt;chapter-plural&gt;Topics&lt;/chapter-plural&gt;
   &lt;resource-group-singular&gt;Course&lt;/resource-group-singular&gt;
   &lt;resource-group-plural&gt;Courses&lt;/resource-group-plural&gt;
&lt;/labels&gt;
Glossary Settings
* *The &lt;glossary&gt; element is used to change how the native Site Engine glossaries work.
&lt;audio&gt;: Set to &quot;true&quot; if the glossary has audio.
&lt;chapter-titles&gt;: Set to &quot;true&quot; if you the parenthetical chapter references in the book level glossary to pull from the chapter titles names instead of being auto numbered.
For example:
&lt;glossary&gt;
   &lt;chapterTitles&gt;true&lt;/chapterTitles&gt;
&lt;/glossary&gt;
Demo Chapters
&lt;demo-chapters&gt; : If the site is demo site that doesn't offer content for all chapters, the chapters that have content should be listed in &lt;chapter-number&gt; tags. For example:
&lt;demo-chapters&gt;
   &lt;chapter-number&gt;1&lt;/chapter-number&gt;
   &lt;chapter-number&gt;2&lt;/chapter-number&gt;
&lt;/demo-chapters&gt;
Site Engine Directories
The &lt;engine-dirs&gt; element defines the directory names for files needed by the Site Engine. It contains the following child elements:
&lt;templates&gt; : The location of the site shell template. The default is /site_engine/templates/
&lt;js&gt;: The location of the supporting JavaScript files. The default is /site_engine/js/
Site Directories
The &lt;site-dirs&gt; element defines the names for directories used by site. It contains the following child elements:
&lt;content&gt; : This defines the site root where content is located. It is useful when all content should be loaded from a different site. The default is &quot;.&quot; which indicates the site root. [Not yet implemented]
&lt;protected&gt; : This specifies the directory that holds protected content, relative to the site root. The default is &quot;/student.&quot;
&lt;unprotected&gt; : This specifies the directory that holds unprotected content, relative to the site root. The default is &quot;/assets.&quot; Changing this to &quot;.&quot; will indicate the site root.
&lt;glossary-audio&gt; : This specifies where audio files are located if there is an audio glossary.
Site Files
The &lt;site-files&gt; element defines the names for files used by site. It contains the following child elements:
&lt;glossary-content&gt; : This specifies the relative path of the glossary content file. The default is &quot;glossary/glossary_content.js.&quot; You should not change this unless you are loading glossary content from another site.
&lt;stylesheet&gt; : If you need to use a custom stylesheet in the site, enter the URL of the stylesheet relative to the site root. For example, &quot;styles.css&quot; (the recommended name) or &quot;css/styles.css.&quot; These styles will override any built-in styles of the same name.
&lt;stylesheet4ltr&gt;: Same as above, for 4LTR sites. Default is &quot;site.css&quot;
&lt;home-page-image&gt;: Sets the image for the site or resource group home page. Default is &quot;[%siteDirs.images%]/home_page.jpg&quot;
&lt;home-page-base-filename&gt;: Sets the basename of the home's HTML file. Default is &quot;home&quot;
&lt;glossary-content&gt;: Sets the location for the glossary content file for a site or resource group.
&lt;survey&gt; : This defines the URL for the Tell us what you think! link at the top of the screen. By default the link goes to a generic survey at http://cengage.qualtrics.com/SE?SID=SV_0GwLkyEppF8MqI4&amp;SVID=Prod. If you have a custom survey specifically tailored to your site, enter its URL here.
Other children, which would rarely would used are:
&lt;authentication&gt;: &quot;[%siteDirs.protected%]/index.html&quot;
&lt;ssoUrls&gt;: &quot;[%siteDirs.protected%]/sso_urls.jsp&quot;
&lt;ebookUrl&gt;: &quot;&quot;
&lt;ebookDomain&gt;: &quot;&quot;
&lt;instructorSite&gt;: &quot;&quot;
&lt;buyOnline&gt;: &quot;http://www.cengagebrain.com/tl1/en/US/storefront/ichapters?cmd=catProductDetail&amp;ISBN=&quot;
Interface Information
The &lt;interface&gt; element contains two child elements: &lt;nav-bar&gt; and &lt;side-menu&gt;.
Nav Bar
The &lt;nav-bar&gt; element determines what appears in the Nav Bar (the row links at the top of the screen, which includes the predefined Home link).
Side Menu
The &lt;side-menu&gt; element determines the options that appear in the Side Menu.
Interface Items
Inpidual options are added to the Nav Bar or Side Menu as &lt;item&gt; elements. Items of the type &quot;asset&quot; will appear as indivdual menu options. Asset items can be enclosed by items of the type &quot;bucket,&quot; which group asset items together under a single menu option. A bucket item element must enclose two or more asset items.
&lt;item&gt;
Important: The name attribute must match the name specified for the asset or bucket in its corresponding &lt;bucket&gt; or &lt;asset&gt; element (see below).
Example:
 &lt;interface&gt;
  &lt;nav-bar&gt;
   &lt;item/&gt;
   &lt;item/&gt;
  &lt;/nav-bar&gt;
  &lt;side-menu&gt;
   
   &lt;item&gt;
    &lt;item/&gt;
    &lt;item/&gt;
   &lt;/item&gt;
   
   &lt;item/&gt;
   
   &lt;item&gt;
    &lt;item/&gt;
    &lt;item/&gt;
   &lt;/item&gt;
   
   &lt;item/&gt;
  &lt;/side-menu&gt;
&lt;/interface&gt;
Bucket Information
The &lt;buckets&gt; element defines bucket data. Each bucket is defined by a &lt;bucket&gt; child element containing the following children:
&lt;name&gt; : The name of the bucket. This is an abbreviation of the bucket title and should be all lowercase with no spaces or punctuation (underscores may be used). It is used internally and must match the bucket name specified in the corresponding &lt;interface&gt; element.
&lt;title&gt; : The title of the bucket as it will appear in the menu.
&lt;blurb-short&gt; : The description of the bucket that will appear when the user mouses over the menu option. If there is no short blurb the long blurb will be used.
&lt;blurb-long&gt; : The description that will appear on the site map page (which hasn't yet been implemented). If there is no long blurb, the short blurb will be used. [Not yet implemented]
&lt;icon&gt; : The filename of the icon that should appear on the menu beside the name of the bucket. Currently, all these reside in the main site_engine directory: site_engine/images/icons/
Example:
 &lt;buckets&gt;  
  &lt;bucket&gt;
   &lt;name&gt;games&lt;/name&gt;
   &lt;title&gt;Games&lt;/title&gt;
   &lt;blurb-short&gt;Challenge yourself with a collection of games.&lt;/blurb-short&gt;
   &lt;blurb-long/&gt;
   &lt;icon&gt;games.gif&lt;/icon&gt;
  &lt;/bucket&gt;
  &lt;bucket&gt;
   &lt;name&gt;video&lt;/name&gt;
   &lt;title&gt;Video&lt;/title&gt;
   &lt;blurb-short&gt;Watch the video that accompanies your textbook and test your comprehension.&lt;/blurb-short&gt;
   &lt;blurb-long/&gt;
   &lt;icon&gt;video.gif&lt;/icon&gt;
  &lt;/bucket&gt;
&lt;/buckets&gt; 
Asset Information
The &lt;assets&gt; element defines data for all the site's assets. Each asset must also be defined in the &lt;interface&gt; node! (see &lt;name&gt; element below). Each asset is defined by an &lt;asset&gt; child element containing the following children:
&lt;name&gt; : The name of the asset. This is an abbreviation of the asset title and should be all lowercase with no spaces or punctuation (underscores may be used). It is used internally and must match the asset name specified in the corresponding &lt;interface&gt; element.
&lt;title&gt; : The title of the asset as it will appear in the menu or tab. A normalized version of the title will used to create Location IDs for linking to the asset.
&lt;type&gt; : The type of asset. These are the possible values:htmlAny page that should be loaded directly into the site's content area. Usually these will be HTML pages, but they can also be pages generated by the Companion Site database, such as Flashcards. Such content will be loaded into an iFrame if the asset has an &lt;iframe-height&gt; value, or if the file is cross-domain. Otherwise only the body content of the file will be loaded via AJAX into an auto-sized &lt;div&gt; element, and &lt;head&gt; content, including any linked CSS or JS, will be stripped out.audioMP3 audio files that should be loaded into the JW Player.videoFLV video files that should be loaded into the JW Player.glossaryUsed to bring up an Apollo-created glossary. Can be book level (all terms) or chapter level, depending on the &lt;scope&gt; element. (Most sites have a book level glossary in the nav-bar, and a chapter level one in the side-bar.) Looks for /glossary/ directory by default in the site root, with a &quot;glossay_content.js&quot; inside. If the glossary is an audio one, this node should be added to the &lt;site&gt; element:
&lt;glossary&gt;
  &lt;audio&gt;true&lt;/audio&gt;
&lt;/glossary&gt;
In addition, a &lt;glossary-audio&gt; node should be added to the &lt;site-dirs&gt; element, with the path to the glossary mp3 files. Such as: &lt;glossary-audio&gt;flashcards/media/&lt;/glossary-audio&gt;
indexPuts asset content into tabs, in that it treats the page given in the &lt;url&gt; as an index, in which all links in the page are opened in a second tab. Tab labels are taken from the &lt;menu-tab-label&gt; and &lt;content-tab-label&gt; elements.templateSpecifies that a predefined template will be used to create the page content. Variables within the template will be replaced to create the correct URLs and (if applicable) component titles. The name of the template must be specified in the &lt;template&gt; element (see below). Templates should always be used for an asset if one is available.&lt;template&gt; : The name of the template to be used if the asset type is &quot;template.&quot; Templates should be used to create Launch Pages for the following assets that will open in a new window. If the text that is used for the link on a Launch Page is alterable, the new text is specified by &lt;link-title&gt; (see below). For a list of all available templates and more details about using them, see &quot;Templated Assets with Launch Pages&quot; in the discussion of Asset Types.
&lt;link-title&gt; : This specifies the text that be used for the link on any of the Launch Page Templates above.
&lt;scope&gt; : &quot;book&quot; for a &quot;Course Resource&quot; or &quot;chapter&quot; for resources that are different for each chapter. If the scope is &quot;book&quot; the 'Select chapters&quot; and &quot;Browse&quot; functionalities will be unavailable.
&lt;show-heading&gt; : When set to &quot;true&quot; a heading will be displayed at the top of the asset's content page in the form Bucket Name: Asset Name. For example, &quot;Games: Crossword Puzzle.&quot; Normally this property will be set to &quot;true&quot; in the &lt;site&gt; element, which will cause headings to display for all asset pages. If you need to suppress the heading for a particular asset, set &lt;show-heading&gt; to &quot;false&quot; for the asset.
&lt;blurb&gt; : This is the short description that will appear in the rollover when the asset title is hovered over in the side menu.
&lt;protected&gt; : &quot;true&quot; or &quot;false&quot; value determines if a SSO login-in is needed to view the asset. If &quot;true&quot; the Site Engine will look for the asset in the protected directory (&quot;student&quot; by default); otherwise, the unprotected directory will be used (&quot;assets&quot; by default). In either case the default directories can be overridden on a per asset basis by giving an absolute URL instead of a relative one. The protected and unprotected directories can also be changed in the &lt;site-dirs&gt; element.
&lt;standalone-protected&gt; : [This feature is deprecated. The &lt;courseware&gt; option should be used instead.] Set to &quot;false&quot; if the asset should be protected on the site but must be accessible in unprotected form when linked to as a standalone page from a course. When this is set to &quot;false,&quot; asset files must be stored in an unprotected folder (/assets) and should not be placed in the protected folder (/student). The Site Engine will block access if the user is not logged in. Default is &quot;true.&quot;
&lt;courseware&gt; : Set to &quot;true&quot; if the site has a /courseware directory that will be used for accessing protected content from a course or WebTutor. This will cause standalone Site Engine pages (loaded by URLs without the :shell parameter) to access protected content through the unprotected /courseware directory, while content within the site shell is still accessed through the protected /student folder. See Accessing Protected Content from Courses. Defaults to &quot;false.&quot;
&lt;url&gt; : The absolute or relative path to the asset. If the URL is not preceded by a slash, it will be treated as relative to the site's &quot;protected&quot; or &quot;unprotected&quot; directory, depending on the value of &lt;protected&gt;. If the URL has a consistent pattern, and some part of it changes per chapter, then the Site Engine can use the following variables to replace that part accordingly: [%chapterNumPadded%] (appends a zero before single digit chapter numbers) and [%chapterNum%] (returns the chapter number). If there is no pattern in the URLs, a components XML file should be made and referred to in a &lt;sections-file&gt; element.
For example: &lt;url&gt;[http://webquiz.ilrn.com/quiz-public?name=klgh13q/klgh13q_psl_chp[%chapterNumPadded%]]&lt;/url&gt; would return URLS such as http://webquiz.ilrn.com/quiz-public?name=klgh13q/klgh13q_psl_chp01 or http://webquiz.ilrn.com/quiz-public?name=klgh13q/klgh13q_psl_chp17
&lt;dir&gt; : Specifies a parent directory that should be prepended before each URL entered in the &lt;url&gt; element of a components XML file.
&lt;chapters-free&gt; : Unprotected sample chapters for protected assets. Each chapter number must be enclosed in a &lt;chapter-number&gt; tag. Make sure files are placed in the right directories. Normally, free chapter content will go in /assets and protected chapter content will go in /student. For example:
&lt;chapters-free&gt;
   &lt;chapter-number&gt;1&lt;/chapter-number&gt;
   &lt;chapter-number&gt;2&lt;/chapter-number&gt;
&lt;/chapters-free&gt;
&lt;chapters-unavailable&gt; : This tells the Engine know to display an &quot;unavailable&quot; message instead of a &quot;coming soon&quot; message for chapters that don't have this asset. Each chapter number must be enclosed in a &lt;chapter-number&gt; tag.
&lt;iframe-height&gt; : Entering a value in this field will force content to load into an iframe instead of a div. This is necessary if the page must retain header tags to load CSS or JavaScript. If the content is being loaded from a URL with the same domain as the Site Engine, you should enter the value &quot;auto&quot;, which will cause the iframe height to be automatically adjusted to match the height of the content. Automatic iframe sizing will not work if content is loaded from a cross-domain URL; in these cases you should enter a numeral specifying the height of the iframe in pixels. If content is loaded from a cross-domain URL, it will be loaded into an iframe regardless of the value entered in &lt;iframe-height&gt;. In these cases, if the height of the content exceeds the default height of the page, you can specify an &lt;iframe-height&gt; suitable for the content.
&lt;menu-tab-label&gt;, &lt;content-tab-label&gt; : Used with &lt;type&gt; &quot;index&quot;. The former specifies the label for the &quot;menu&quot; tab, and the latter specifies the label for the &quot;content&quot; tab where the content page appears. 
&lt;icon&gt; : The filename of the icon to be used for the menu option for the asset.
&lt;link-style&gt; : Specifies the style for popup windows. For assets that appear in the Top Nav Bar, this defines the style of the window in which the asset page opens. For assets that appear in the side menu, this forces every link on the asset page to open in a new window and defines the style of those popup windows. The value of &lt;link-style&gt; must be &quot;popup&quot; or &quot;popup&quot; followed by a substyle. Different substyles can be used in combination where appropriate. The available substyles are as follows:
showAll : Show all browser elements (menu, navigation buttons, etc.)
showNav : Show browser navigation buttons only
fixed : Window not scrollable or resizable
noScroll : Window not scrollable
noResize : Window not resizable
vpgEbook : The correct setting for opening a vpgEbook. No browser elements and dimensions of 945 by 720.
crossword : The correct setting for popup Crossword Puzzles. No browser elements and dimensions of 730 by 530.
A setting of &lt;link-style&gt;popup showNav noScroll&lt;/link-style&gt; will open the window with only the browser navigation buttons displayed and scrollbars removed. It will use the default window dimensions of 800 by 560.
&lt;window-width&gt;, &lt;window-height&gt; : If a popup link-style is specified (see above), these elements will set the window width or height. These values will override any dimensions inherent in the style.
&lt;player-width&gt;, &lt;player-height&gt; : for &lt;type&gt; &quot;video,&quot; or &quot;audio,&quot; this sets the dimensions of the player.
&lt;margin&gt; : Overrides the default left and right margins for the content area. Set this to &quot;0&quot; to increase the available width if necessary for embedding a wide page.
&lt;sections-file&gt; : This element takes the filename of a components XML file. The file itself must be put in the site root and should be named in this manner:
onge_8e_interaction_video_sections.xml
This file allows you to assign multiple video or audio selections to a playlist on a single page, and also makes it possible to assign per chapter URLs to an asset that do not follow a particular pattern.
&lt;link-title&gt; : Specifes the text that is used for the link in a Launch Page template. See Asset Types for more details.
&lt;link-bullet&gt; : Specifies the bullet icon to be used for each link in a page based on the download template. Some possible values are pdf and zip. See Asset Types for the complete list of values.
Media Options (for Audio and Video)
The &lt;media-options&gt; element specifies values that will be used for video and audio asset types. This element contains the following children that must be contained within a &lt;media-options&gt; tag:
&lt;video-width&gt; : The default video size is 480 (width) by 360 (height). If a different width is required, set this to the the width of the video in pixels. The value must be a numeral. This has the same effect as &lt;player-width&gt;.
&lt;video-height&gt; : If the video height should be different than the default 360, set this to the height of the video. Unlike &lt;player-height&gt;, this determines the height of the video play area, not the height of the entire player. It should be used instead of &lt;player-height&gt; whenever possible.
&lt;download-media&gt; : The value is either &quot;true&quot; or &quot;false&quot; and determines whether a downloadable file is available for an audio or video asset.
&lt;download-media-ext&gt; : Specifies the extension for the files if &lt;download-media&gt; is true. The extension should be entered in lowercase without the dot. The default is &quot;zip.&quot;
&lt;download-media-label&gt; : Specifies the text that will appear in parentheses after the download link if &lt;download-media&gt; is true. The defaults are &quot;Zipped MP3&quot; for Audio and &quot;Zipped MP4&quot; for Video.
&lt;view-transcript&gt; : The value is either &quot;true&quot; or &quot;false&quot; and determines whether an html transcript will be displayed for an audio asset.
&lt;download-transcript&gt; : The value is either &quot;true&quot; or &quot;false&quot; and specifies whether a downloadable transcript is available for an audio or video asset.
&lt;download-transcript-ext&gt; : Specifies the extension for the files if &lt;download-transcript&gt; is true. The extension should be entered in lowercase without the dot.
&lt;streamer&gt; : If a streaming server is being used for the media, specify the relevant URL. (This sets the streamer flashvar for the player.)
Example:
&lt;media-options&gt;
           &lt;video-width&gt;400&lt;/video-width&gt;
           &lt;video-height&gt;300&lt;/video-height&gt;
           &lt;download-media&gt;true&lt;/download-media&gt;
           &lt;download-media-ext&gt;zip&lt;/download-media-ext&gt; 
&lt;view-transcript&gt;true&lt;/view-transcript&gt;
           &lt;download-transcript&gt;true&lt;/download-transcript&gt;
           &lt;download-transcript-ext&gt;pdf&lt;/download-transcript-ext&gt;
&lt;/media-options&gt; 
Examples:
&lt;asset&gt;
  &lt;name&gt;images&lt;/name&gt;
  &lt;title&gt;Bonus Images&lt;/title&gt;
  &lt;type&gt;index&lt;/type&gt;
  &lt;scope&gt;chapter&lt;/scope&gt;
  &lt;protected&gt;true&lt;/protected&gt;
  &lt;blurb /&gt;
  &lt;url&gt;
  bonus/ch[%chapterNumPadded%]/[%chapterNumPadded%]_index.html&lt;/url&gt;
  &lt;chapters-free&gt;
    &lt;chapter-number&gt;6&lt;/chapter-number&gt;
    &lt;chapter-number&gt;7&lt;/chapter-number&gt;
  &lt;/chapters-free&gt;
  &lt;chapters-unavailable&gt;
    &lt;chapter-number&gt;&lt;/chapter-number&gt;
  &lt;/chapters-unavailable&gt;
  &lt;iframe-height&gt;auto&lt;/iframe-height&gt;
  &lt;menu-tab-label&gt;Menu&lt;/menu-tab-label&gt;
  &lt;content-tab-label&gt;Image&lt;/content-tab-label&gt;
  &lt;icon&gt;images.gif&lt;/icon&gt;
  &lt;link-style&gt;&lt;/link-style&gt;
&lt;/asset&gt;
&lt;asset&gt;
  &lt;name&gt;glossary&lt;/name&gt;
  &lt;title&gt;Glossary&lt;/title&gt;
  &lt;type&gt;glossary&lt;/type&gt;
  &lt;scope&gt;book&lt;/scope&gt;
  &lt;protected&gt;false&lt;/protected&gt;
  &lt;blurb /&gt;
  &lt;url /&gt;
  &lt;chapters-free&gt;
    &lt;chapter-number /&gt;
  &lt;/chapters-free&gt;
  &lt;chapters-unavailable&gt;
    &lt;chapter-number /&gt;
  &lt;/chapters-unavailable&gt;
  &lt;iframe-height /&gt;
  &lt;icon /&gt;
  &lt;link-style&gt;popup vpg-ebook&lt;/link-style&gt;
&lt;/asset&gt;
&lt;asset&gt;
  &lt;name&gt;timeline&lt;/name&gt;
  &lt;title&gt;Interactive Timeline&lt;/title&gt;
  &lt;type&gt;html&lt;/type&gt;
  &lt;scope&gt;chapter&lt;/scope&gt;
  &lt;blurb&gt;Explore and Learn important dates with our Interactive
  Timelines&lt;/blurb&gt;
  &lt;protected&gt;true&lt;/protected&gt;
  &lt;url&gt;timeline/[%chapterNumPadded%]_index.html .html&lt;/url&gt;
  &lt;chapters-free&gt;
    &lt;chapter-number /&gt;
  &lt;/chapters-free&gt;
  &lt;chapters-unavailable&gt;
    &lt;chapter-number&gt;4&lt;/chapter-number&gt;
    &lt;chapter-number&gt;8&lt;/chapter-number&gt;
    &lt;chapter-number&gt;17&lt;/chapter-number&gt;
    &lt;chapter-number&gt;21&lt;/chapter-number&gt;
    &lt;chapter-number&gt;22&lt;/chapter-number&gt;
  &lt;/chapters-unavailable&gt;
  &lt;iframe-height&gt;480&lt;/iframe-height&gt;
  &lt;icon&gt;timeline.gif&lt;/icon&gt;
  &lt;link-style /&gt;
  &lt;margin&gt;0&lt;/margin&gt;
&lt;/asset&gt;
&lt;asset&gt;
  &lt;name&gt;intext_audio&lt;/name&gt;
  &lt;title&gt;In-Text Audio&lt;/title&gt;
  &lt;type&gt;audio&lt;/type&gt;
  &lt;scope&gt;chapter&lt;/scope&gt;
  &lt;blurb&gt;Audio files from each lesson of the textbook.&lt;/blurb&gt;
  &lt;protected&gt;false&lt;/protected&gt;
  &lt;url&gt;&lt;/url&gt;
  &lt;dir&gt;intext_audio/&lt;/dir&gt;
  &lt;chapters-free&gt;
    &lt;chapter-number /&gt;
  &lt;/chapters-free&gt;
  &lt;chapters-unavailable&gt;
    &lt;chapter-number /&gt;
  &lt;/chapters-unavailable&gt;
  &lt;iframe-height&gt;300&lt;/iframe-height&gt;
  &lt;icon&gt;audio.gif&lt;/icon&gt;
  &lt;link-style /&gt;
  &lt;sections-file&gt;onge_8e_intext_audio_sections.xml&lt;/sections-file&gt;
&lt;/asset&gt;
Resource Centers
A Resource Center is a Website that is not devoted to a single book. It can be discipline specific, containing assets that are not correlated to particular books, or it can aggregate the content for multiple books into a single site. The Resource Center site structure adds an additional element to the top of the structural heirarchy. The top-level unit is called a Resource Group and can constitute a book, a course topic (such as World History or US History), or some other pedagogical grouping. Each Resource Group has the structure of a self-contained Premium Site. It contains multiple &quot;chapters,&quot; which in turn each contain multiple assets. The units within a Resource Group are referred to internally as &quot;chapters,&quot; but in the interface they can be labeled &quot;topics,&quot; &quot;themes,&quot; or any other appropriate term.
To specify that a site is a Resource Center, you must set the value of &lt;type&gt; in the &lt;site&gt; element to &quot;resource_center&quot;:
&lt;type&gt;resource_center&lt;/type&gt;
Resource Center Element
To define a Resource Center, you must add a &lt;resource-center&gt; element to the top of the Site Definition File, preceding the &lt;site&gt; elment. This element must contain the following child element:
&lt;title&gt; : This specifies the title for the Resource Center.
Example:
&lt;resource-center&gt;
    &lt;title&gt;Helping Professions Learning Center&lt;/title&gt;
&lt;/resource-center&gt;
Resource Groups Element
A Resource Center must also contain a &lt;resource-groups&gt; element, which in turn contains a &lt;resource-group&gt; child for each Resource Group. Default values for the contents of all Resource Groups are specified outside of &lt;resource-groups&gt; in the &lt;site&gt;, &lt;book&gt;, &lt;interface&gt;, &lt;buckets&gt;, and &lt;assets&gt; elements. These default values are defined exactly the same way that values are defined for a standard Premium Site. The &lt;resource-group&gt; element specifies only values that are different from the default values. These group-specific values are stored in a &lt;substitutions&gt; element within &lt;resource-group&gt;.
Every asset and bucket that appears anywhere in the site must have a default entry specified in the top-level &lt;assets&gt; and &lt;buckets&gt; elements. Typically the values for an asset (title, protection, scope, etc.) will be the same for every Resource Group in which it appears, with the exception of &lt;url&gt; and &lt;chapters-unavailable&gt;. This scheme enables the recurring values for an asset to be stored in a single location where they can be easily modified in a single operation. The asset values that differ from one Resource Group to the next (such as &lt;url&gt;) must be stored in the &lt;substitutions&gt; element within each &lt;resource-group&gt; element.
The names of glossary content files should be specified in the &lt;site&gt; element within &lt;substitutions&gt; as follows:
  &lt;site&gt;
   &lt;site-files&gt;
    &lt;glossary-content&gt;glossary/glossary_sw.js&lt;/glossary-content&gt;
   &lt;/site-files&gt;
  &lt;/site&gt;
Each &lt;resource-group&gt; element contains the following children:
&lt;name&gt; : The name of the Resource Group, used internally. (This is not displayed in the interface.)
&lt;substitutions&gt; : This element holds the values that replace the default values. The children of this element are the standard elements that define a Premium Site---&lt;site&gt;, &lt;book&gt;, &lt;interface&gt;, &lt;buckets&gt;, and &lt;assets&gt;-and their values are defined exactly the same way.
Example:
&lt;resource-group&gt;
 &lt;name&gt;social_work&lt;/name&gt;
 &lt;substitutions&gt;
  &lt;site&gt;
   &lt;site-files&gt;
    &lt;glossary-content&gt;glossary/glossary_sw.js&lt;/glossary-content&gt;
   &lt;/site-files&gt;
  &lt;/site&gt;
  &lt;book&gt;
   &lt;title&gt;Social Work&lt;/title&gt;
   &lt;chapter-titles&gt;
    &lt;title&gt;Introduction to Social Work&lt;/title&gt;
    &lt;title&gt;Values and Ethics&lt;/title&gt;
    &lt;title&gt;Theories of Human Behavior&lt;/title&gt;
    &lt;title&gt;Practice&lt;/title&gt;
    &lt;title&gt;Multicultural Competency&lt;/title&gt;
    &lt;title&gt;Research&lt;/title&gt;
    &lt;title&gt;Social Welfare Policy&lt;/title&gt;
    &lt;title&gt;Field Education&lt;/title&gt;
    &lt;title&gt;Professional Development&lt;/title&gt;
   &lt;/chapter-titles&gt;
  &lt;/book&gt;
  &lt;interface&gt;
   &lt;side-menu&gt;
    &lt;item display=&quot;false&quot;/&gt;
    &lt;item display=&quot;false&quot;/&gt;
    &lt;item display=&quot;false&quot;/&gt;
   &lt;/side-menu&gt;
  &lt;/interface&gt;
  &lt;assets&gt;
   &lt;asset&gt;
    &lt;name&gt;section_intro&lt;/name&gt;
    &lt;url&gt;social_work/intro/section[%chapterNumPadded%]_intro.html&lt;/url&gt;
   &lt;/asset&gt;
   &lt;asset&gt;
    &lt;name&gt;select_textbook&lt;/name&gt;
    &lt;url&gt;social_work/select_textbook/section[%chapterNumPadded%]_select.html&lt;/url&gt;
   &lt;/asset&gt;
  &lt;/assets&gt;
 &lt;/substitutions&gt;
&lt;/resource-group&gt;
Resource Center Menus
The option labels in the Left Side Accordion Menu are defined by values in the &lt;book&gt; element that appears in the &lt;substitutions&gt; element of each Resource Group. The &lt;title&gt; element defines the top-level menu option labels and the &lt;chapter-titles&gt; element defines the submenu options.
The Asset Menu is defined by the &lt;interface&gt; element. All the menu options that for assets that appear in any Resource Group must be defined in the top-level &lt;interface&gt; element. Any options that shouldn't appear in the menu for a particular Resource Group must be overridden by values in the &lt;interface&gt; element that resides within &lt;substitutions&gt;. To supress default menu options you set the display attribute to &quot;false&quot; in the following manner:
&lt;side-menu&gt;
      &lt;item display=&quot;false&quot;/&gt;
      &lt;item display=&quot;false&quot;/&gt;
      &lt;item display=&quot;false&quot;/&gt;
&lt;/side-menu&gt;
The following configuration will result in an Asset Menu for Resource Group 1 that contains objectives, flashcards, and videos, and an Asset Menu for Resource Group 2 that contains objectives, quiz, flashcards, and cases.
Entry in top-level &lt;site&gt; element:
&lt;interface&gt;
  &lt;side-menu&gt;
    &lt;item display=&quot;false&quot;/&gt;
    &lt;item display=&quot;false&quot;/&gt;
    &lt;item display=&quot;false&quot;/&gt;
    &lt;item display=&quot;false&quot;/&gt;
    &lt;item display=&quot;false&quot;/&gt;
   &lt;/side-menu&gt;
&lt;/interface&gt;
Entry in &lt;substitutions&gt; for Resource Group 1:
&lt;interface&gt;
  &lt;side-menu&gt;
      &lt;item display=&quot;false&quot;/&gt;
      &lt;item display=&quot;false&quot;/&gt;
  &lt;/side-menu&gt;
&lt;/interface&gt;
Entry in &lt;substitutions&gt; for Resource Group 2:
&lt;interface&gt;
   &lt;side-menu&gt;
      &lt;item display=&quot;false&quot;/&gt;
   &lt;/side-menu&gt;
&lt;/interface&gt;
Components Files
 A Components File is an XML file that defines multiple components within a chapter for an asset. Components will usually be individual pages or items in a media playlist. [All &lt;section&gt; and &lt;sections&gt; tags will eventually be deprecated and replaced with &lt;component&gt; and &lt;components&gt; tags.]
 
Building a Components File
 A components file consists of a &lt;section&gt; element for each component within a chapter. This contains the following children:
 &lt;chapter&gt; : This should be a numeral indicating the chapter of the component. If the asset is a book-level resource, the chapter element should be omitted or left blank, and all components will be placed on the same page.
 &lt;url&gt; : Specifies the url for the component.
 &lt;title&gt; : The title of the component to appear in a playlist or menu.
 Example:
 &lt;sections&gt;
  &lt;section&gt;
    &lt;chapter&gt;1&lt;/chapter&gt;
    &lt;url&gt;onge_8e_interaction_intext_cd01-03-03.mp3&lt;/url&gt;
    &lt;title&gt;Listen to Lesson 1&lt;/title&gt;
  &lt;/section&gt;
&lt;/sections&gt;
 Make sure you escape all entites (or enclose them in CDATA tags) and that the XML validates. A DOCTYPE is not needed.
 When to Use Them
 This file allows you to assign multiple video or audio selections to a playlist on a single page, and also makes it possible to assign URLs to an asset per chapter that do not follow a particular pattern. Rather than using the &lt;url&gt; element for an asset, one uses the &lt;sections-file&gt; element to point to an xml file in the root of the site.
 Example:
 &lt;asset&gt;
   &lt;name&gt;intext_audio&lt;/name&gt;
   &lt;title&gt;In-Text Audio&lt;/title&gt;
   &lt;type&gt;audio&lt;/type&gt;
   &lt;scope&gt;chapter&lt;/scope&gt;
   &lt;blurb&gt;Audio files from each lesson of the textbook.&lt;/blurb&gt;
   &lt;protected&gt;false&lt;/protected&gt;
   &lt;url&gt;&lt;/url&gt;
   &lt;dir&gt;intext_audio/&lt;/dir&gt;
   &lt;chapters-free&gt;
    &lt;chapter-number/&gt;
   &lt;/chapters-free&gt;
   &lt;chapters-unavailable&gt;
    &lt;chapter-number/&gt;
   &lt;/chapters-unavailable&gt;
   &lt;iframe-height&gt;300&lt;/iframe-height&gt;
   &lt;icon&gt;audio.gif&lt;/icon&gt;
   &lt;link-style/&gt;
   &lt;sections-file&gt;onge_8e_intext_audio_sections.xml&lt;/sections-file&gt;
&lt;/asset&gt;
 The value in the &lt;dir&gt; element in the asset definition (see above) will be prepended to all the URLs entered in the Components File. So, for example, you can use &lt;dir&gt; to specify the directory and enter only the filenames in the Components File.
 Loading media in a playlist
 Take, for example, this French asset page containing a playlist of two audio tracks (as referenced in the example above): http://college.cengage.com/site_engine/#0495897604/intext_audio/1:shell (there are two mp3s for every chapter)
 The Components File, for the first two chapters, looks like:
 &lt;sections&gt;
  &lt;section&gt;
    &lt;chapter&gt;1&lt;/chapter&gt;
    &lt;url&gt;onge_8e_interaction_intext_cd01-02-02.mp3&lt;/url&gt;
    &lt;title&gt;Chapitre 1: Vocabulaire actif&lt;/title&gt;
  &lt;/section&gt;
  &lt;section&gt;
    &lt;chapter&gt;1&lt;/chapter&gt;
    &lt;url&gt;onge_8e_interaction_intext_cd01-03-03.mp3&lt;/url&gt;
    &lt;title&gt;
      &lt;![CDATA[Chapitre 1: A l'&eacute;coute]]&gt;
    &lt;/title&gt;
  &lt;/section&gt;
  &lt;section&gt;
    &lt;chapter&gt;2&lt;/chapter&gt;
    &lt;url&gt;onge_8e_interaction_intext_cd01-04-04.mp3&lt;/url&gt;
    &lt;title&gt;Chapitre 2: Vocabulaire actif&lt;/title&gt;
  &lt;/section&gt;
  &lt;section&gt;
    &lt;chapter&gt;2&lt;/chapter&gt;
    &lt;url&gt;onge_8e_interaction_intext_cd01-05-05.mp3&lt;/url&gt;
    &lt;title&gt;
      &lt;![CDATA[Chapitre 2: A l'&eacute;coute]]&gt;
    &lt;/title&gt;
  &lt;/section&gt;   ... more sections here ...&lt;/sections&gt;
 The &lt;chapter&gt; element determines which chapter the playlist item appears in.
 The &lt;url&gt; is the path/name of the file. This can be absolute or relative. If relative, the values in the &lt;protected&gt; and &lt;dir&gt; elements will help define the full url.
 &lt;title&gt; is the title of the media in the asset playlist.
 
Loading Irregularly Named HTML assets
 In many cases, the URL of an asset only changes between chapters in that a chapter number string changes. In this case, the &lt;url&gt; element can be used, and the variable [%chapterNumPadded%] will be replaced in the URL appropriately: &lt;url&gt;flashcards/[%chapterNumPadded%]_index.html&lt;/url&gt;
 But sometimes the URLs for an asset change wildly between different chapters. Here, a Components File can also be used:
 &lt;sections&gt;
  &lt;section&gt;
    &lt;chapter&gt;1&lt;/chapter&gt;
    &lt;url&gt;/polisci/primary_sources/quizzes/embed.html?src=t01_amer_pol_sys_ps_decl_indepen_fae.xml&lt;/url&gt;
    &lt;title&gt;&lt;/title&gt;
  &lt;/section&gt;
  &lt;section&gt;
    &lt;chapter&gt;2&lt;/chapter&gt;
    &lt;url&gt;/polisci/primary_sources/quizzes/embed.html?src=t03_roots_of_the_constitution_constitution.xml&lt;/url&gt;
    &lt;title&gt;&lt;/title&gt;
  &lt;/section&gt;
  &lt;section&gt;
    &lt;chapter&gt;3&lt;/chapter&gt;
    &lt;url&gt;/polisci/primary_sources/quizzes/embed.html?src=t02_constitutional_reform_mcculloch_v_maryland.xml&lt;/url&gt;
    &lt;title&gt;Maryland&lt;/title&gt;
  &lt;/section&gt;
  &lt;section&gt;
    &lt;chapter&gt;4&lt;/chapter&gt;
    &lt;url&gt;/polisci/primary_sources/quizzes/embed.html?src=t04_amer_pol_culture_ps_common_sense_fae.xml&lt;/url&gt;
    &lt;title&gt;&lt;/title&gt;
  &lt;/section&gt;
... more sections follow ...&lt;/sections&gt;
 Note that &lt;title&gt; has no effect in this context.
Creating Tabbed Index Pages
If you define an asset type as &quot;html,&quot; the content will be displayed using two tabs, with the left tab presenting a menu of inks to pages available for that chapter and the right tab presenting the content of each page selected from the menu. (See the instructions for defining an asset of the type &quot;index&quot; in the discussion of the Site Definition File.) As an alternative you can set the asset type to &quot;html&quot; and use a Components File to create these menus dynamically. Each chapter component defined in the XML file will appear as a link in menu in the left tab. Clicking the menu option will open the component URL in the second tab. If there is only a single page for the chapter, the content will be loaded directly into the main page and no tabs will appear.
In the following example, the menu for Chapter 1 will contain 2 options:
Lesson 1
Lesson 2
Clicking on Lesson 1 will load onge_8e_interaction_lesson_ch01_01.html into the right tab.
&lt;sections&gt;
  &lt;section&gt;
    &lt;chapter&gt;1&lt;/chapter&gt;
    &lt;url&gt;onge_8e_interaction_lesson_ch01_01.html&lt;/url&gt;
    &lt;title&gt;Lesson 1&lt;/title&gt;
  &lt;/section&gt;
  &lt;section&gt;
    &lt;chapter&gt;1&lt;/chapter&gt;
    &lt;url&gt;onge_8e_interaction_lesson_ch01_02.html&lt;/url&gt;
    &lt;title&gt;Lesson 2&lt;/title&gt;
    &lt;/title&gt;
  &lt;/section&gt;
   &lt;section&gt;
    &lt;chapter&gt;2&lt;/chapter&gt;
    &lt;url&gt;onge_8e_interaction_lesson_ch02_01.html&lt;/url&gt;
    &lt;title&gt;Lesson 1&lt;/title&gt;
    &lt;/title&gt;
  &lt;/section&gt;
&lt;/sections&gt;
