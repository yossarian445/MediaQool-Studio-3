/**
 * Created by rival on 10.01.15.
 */

/**
 *  The xmlController contains all methods that are used to
 *  generate a Final Cut Pro conform XML file, that contains
 *  all necessary information about a video element
 *
 *  Mapping from MediaQ attributes to FCP XML Interchange format
 *
 *  - must use "sequence" to include multiple videos
 *  - then <media> <video> <track> <clipitem>
 *  - need duration of the sequence: min of minTC and max of Max TC
 *
 *    duration ->  duration (of clipitem)
 *  minTC ->  start (relative to the duration of the sequence)
 *  maxTc ->  end (relative to the duratio of the sequence)
 *  plat ->  X not applicable
 *  plng ->  X not applicable
 *  user ->
 *  videoID -> name
 *
 */

//setup

//for test purposes some of the XML values can be set here
var xmlFileName = "MediaQoolExport";
var nameOfSequence = "Sequence1";
var NTSC = "TRUE";
var timebase = "30";

//methods

/**
 * generateXMLFromData takes care of the actual XML build up and saves the
 * created XML to disk
 *
 * at the moment a minimum viable Final Cut Pro XML is created like
 * "Listing 3-1 A minimum clip" at
 * https://developer.apple.com/library/mac/documentation/AppleApplications/Reference/FinalCutPro_XML/Basics/Basics.html#//apple_ref/doc/uid/TP30001154-TPXREF101
 *
 */


function generateXMLfromData(duration, selectedVideos) {

	//get min of minTC and max of Max TC -> total time horizon
	var absoluteMin = Math.min.apply(null, selectedVideos.map(function (a) {
		return a.minTC;
	}));
	var absoluteMax = Math.max.apply(null, selectedVideos.map(function (a) {
		return a.maxTC;
	}));

	//create root node for XML document
	var $root = $('<XMLDocument />');

	//build up document structure
	$root.append
		(
			$('<xmeml />').attr({version: "5"}).append(
				$('<sequence />').append(
					$('<media />').append(
						$('<video />').append(
						)
					)
				)
			)
		)


	// get a reference to sequence
	var $sequence = $root.find('sequence');
	$sequence.prepend($('<rate />').append(
		$('<timebase />')
	));
	$sequence.prepend($('<name />').text(nameOfSequence));

	//get reference to media
	var $media = $root.find('media');
	var $outerAudio = $('<audio />');
	$media.append($outerAudio);

	//first while loop for video items
	//get reference to video
	var $video = $root.find('video');
	for (var i = 0; i < selectedVideos.length; i++) {
		//calculate duration of video in frames
		var durationInFrames = Math.floor((selectedVideos[i].videoDuration / 1000) * 30);
		var startPointOfVideoInFrames = Math.floor(((selectedVideos[i].minTC - absoluteMin) / 1000) * 30);
		var endPointOfVideoInFrames = Math.floor(((selectedVideos[i].maxTC - absoluteMin) / 1000) * 30);

		//create new tags
		var $clipitem = $('<clipitem />');
		var $file = $('<file />').attr({id: "file" + i});

		$video.append
			(
				$('<track />').append(
					$clipitem.append(
						$file
					)
				)
			)

		//fill up clipitem
		$clipitem.prepend($('<end />').text(endPointOfVideoInFrames));
		$clipitem.prepend($('<start />').text(startPointOfVideoInFrames));
		$clipitem.prepend($('<duration />').text(durationInFrames));
		$clipitem.prepend($('<name />').text(selectedVideos[i].videoID));

		//create new tag
		var $rate = $('<rate />');
		var $Insidemedia = $('<media />');

		//fill up file
		$file.append($('<name />').text(selectedVideos[i].videoID));
		$file.append($('<pathurl />').text(""));
		$file.append($rate.append($('<timebase />').text('21')));
		$file.append($('<duration />').text(durationInFrames));
		$file.append($Insidemedia);
		$Insidemedia.append($('<video />'));
		$Insidemedia.append($('<audio />'));

	}

	//second while loop for audio items
	//get reference to audio --> outerAudio
	for (var i = 0; i < selectedVideos.length; i++) {
		//calculate duration of video in frames
		var durationInFrames = Math.floor((selectedVideos[i].videoDuration / 1000) * 30);
		var startPointOfVideoInFrames = Math.floor(((selectedVideos[i].minTC - absoluteMin) / 1000) * 30);
		var endPointOfVideoInFrames = Math.floor(((selectedVideos[i].maxTC - absoluteMin) / 1000) * 30);

		//create new tags
		var $clipitem = $('<clipitem />');
		var $track = $('<track />');

		$outerAudio.append
			(
				$track.append(
					$clipitem
				)
			)

		//fill up track
		$track.prepend($('<enabled />').text("TRUE"));
		$track.append($('<outputchannelindex />').text("1"));

		//fill up clipitem
		$clipitem.prepend($('<file />').attr({id: "file" + i}));
		$clipitem.prepend($('<end />').text(endPointOfVideoInFrames));
		$clipitem.prepend($('<start />').text(startPointOfVideoInFrames));
		$clipitem.prepend($('<duration />').text(durationInFrames));
		$clipitem.prepend($('<name />').text(selectedVideos[i].videoID));

	}

	//bulid export string with markup
	var stringOutput = '<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE xmeml>';

	//write to file -> append xmlDOM to stringmarkup
	var xmlOutput = new Blob([stringOutput + $root.html()], {type: "text/plain;charset=utf-8"});
	saveAs(xmlOutput, xmlFileName + ".xml");


}


/**
 * The following two functions handle the video downloading
 * @param selectedVideos
 */
function downloadSelectedVideos(selectedVideos) {
	for(var i=0; i<selectedVideos.length; i++){
		downloadVideoFromURL("http://mediaq.dbs.ifi.lmu.de/MediaQ_MVC_V2/video_content/" + selectedVideos[i].videoID, "");
	}
}

function downloadVideoFromURL(uri, name) {
	var link = document.createElement("a");
	link.download = name;
	link.href = uri;
	link.click();
}


/**
 * The method buttonClicked handles the click events for "Generate XML" AND "Generate XML & Download videos"
 * @param donwloadVideos : BOOL (only XML or also videos)
 */

function buttonClicked (donwloadVideos){


	//check if any videos selected
	if(!$('#page-content input[type=checkbox]:checked').length) {
		//no videos selected at all
		alert("Please select at least one video!");
		return;
	}

	//build up new array for XML generator
	var selectedVideos = [];
	//select all elements that have checked checkbox
	$('input[type=checkbox]').each(function () {
		if (this.checked) {
			//get the corresponding videoIDs through the same index

			var currentIndex = this.id.slice(8);

			var videoElement = getScope().getVideoElementItemForIndex(currentIndex);
			//new Element for array
			var elementToBeAdded = new VideoElementItem(getScope(), videoElement.videoDuration, videoElement.maxTC, videoElement.minTC, videoElement.plat, videoElement.plng, "", videoElement.videoID);
			//add to array
			selectedVideos.push(elementToBeAdded);
			//alert("number of checkbox: " + this.id + " correspinding videoID: " + currentVideoId);
		}
	});


	//calculate new time values
	//get minminTC
	var absoluteMin = Math.min.apply(null, selectedVideos.map(function (a) {
		return a.minTC;
	}));
	//get maxmaxTc
	var absoluteMax = Math.max.apply(null, selectedVideos.map(function (a) {
		return a.maxTC;
	}));

	//recalculate minTc and maxTC
	for (var i = 0; i < selectedVideos.length; i++) {
		selectedVideos[i].minTC = selectedVideos[i].minTC - absoluteMin;
		selectedVideos[i].maxTC = selectedVideos[i].maxTC - absoluteMin;
	}

	//duration of the whole video sequence
	var absoluteDuration = absoluteMax - absoluteMin;

	generateXMLfromData(absoluteDuration, selectedVideos);
	//download all videos if the xml&video button was clicked
	if(donwloadVideos){
		downloadSelectedVideos(selectedVideos);
	}

	//unselect all videos in the end
	$('input[type=checkbox]').each(function () {
		//for every select
		if (this.checked) {
			$(this).prop("checked" , false);
			$(this).parents("li").removeClass("list-group-item-active");
			getScope().counter--;
			//write to label
			$('#selectedLabel').text("Videos selected: " + getScope().counter);
		}
	});
}


//helper functions

// creates new 'name' element
$.createElement = function (name) {
	return $('<' + name + ' />');
};

// appends a new 'name' element to every node matched by fn directive
$.fn.appendNewElement = function (name) {
	this.each(function (i) {
		$(this).append('<' + name + ' />');
	});
	return this;
}


$(document).on('click', '#xmlButton', function () {
	buttonClicked(false);  //FALSE -> user only wants XML
});

$(document).on('click', '#xmlVideoButton', function () {
	buttonClicked(true);  //TRUE -> user also wants the video download
});


