/**
 * Created by rival on 15.01.15.
 */


var app = angular.module('app', [])
	.controller('TimeSliderController', function ($scope, $locale) {


		/*
		 Using var that = this; is a way to store the context at function definition time
		 (rather than function execution time, when the context could be anything,
		 depending on how the function was invoked). Meaning: that keeps the context from
		 the time the ServiceElement was initialized.
		 */
		var that = this;

		//array that holds all video Items
		$scope.videoElementList = [];

		//create array with all image sources
		var sourceArray = [];
		//create array for image data
		var imageArray = [];
		//create Array for JSON precaching
		var jsonArray = [];
		//counter for selected items
		$scope.counter = 0;

		/*test array for later video elements
		 // REAL DATA
		 $scope.videoElementList = [
		 new VideoElementItem($scope, "101803"  , 1420806374145, 1420806272342, "48.151257", "11.581384", "bibabutzemann", "video1"),
		 new VideoElementItem($scope, "40803"  , 1414764013526, 1414763972723, "48.151257", "11.581384", "bibabutzemann", "video2"),
		 new VideoElementItem($scope, "84112"  , 1415612715998, 1415612631886, "48.151257", "11.581384", "bibabutzemann", "video5"),
		 new VideoElementItem($scope, "61408"  , 1415629175522, 1415629114114, "48.151718", "11.578938", "jensffb", "-1363g07c2bdr4_2014_11_10_Videotake_1415629113453.mp4"),
		 new VideoElementItem($scope, "58401"  , 1417631166565, 1417631108164, "48.149896", "11.594649", "Daniel Basaran", "-16l8p110e26ii_2014_12_3_Videotake_1417631108014.mp4")
		 ]
		 */
		/*
		 //fake data for Ui test
		 $scope.videoElementList = [
		 new VideoElementItem($scope, "12", 100, 88, "48.151257", "11.581384", "bibabutzemann", "video1"),
		 new VideoElementItem($scope, "54", 66, 12, "48.151257", "11.581384", "bibabutzemann", "video2"),
		 new VideoElementItem($scope, "6", 14, 8, "48.151257", "11.581384", "bibabutzemann", "video3"),
		 new VideoElementItem($scope, "16", 78, 62, "48.151257", "11.581384", "bibabutzemann", "video4"),
		 new VideoElementItem($scope, "15", 45, 30, "48.151257", "11.581384", "bibabutzemann", "video5")
		 ]
		 */
		/**
		 * The method getVideoElementItemForVideoId() returns a VideoElementItem for given videoID
		 * @param videoID
		 * @returns {*}
		 */
		$scope.getVideoElementItemForVideoId = function (videoID) {
			for (var i = 0; i < $scope.videoElementList.length; i++) {
				if ($scope.videoElementList[i].videoID == videoID) {
					return $scope.videoElementList[i];
				}
			}
			//nothing found
			console.error("ERROR: Requested video element does not exist!");
		}

		/**
		 * The method getVideoElementItemForIndex() returns a VideoElementItem for given index number
		 * @param videoID
		 * @returns {*}
		 */
		$scope.getVideoElementItemForIndex = function (index) {
			for (var i = 0; i < $scope.videoElementList.length; i++) {
				if (parseInt(index) == i) {
					return $scope.videoElementList[i];
				}
			}
			//nothing found
			console.error("ERROR: Requested video element does not exist!");
		}

		/**
		 * The method sortVideoElementList sorts all elements by their start time
		 */

		$scope.sortVideoElementList = function () {
			$scope.videoElementList.sort(function compare(a, b) {
				if (a.minTC < b.minTC)
					return -1;
				if (a.minTC > b.minTC)
					return 1;
				return 0;
			});
			$scope.$apply();
		}


		/**
		 * The method isVideoCurrentlyFocused takes to parameters and returns a bool value.
		 * If the position given to the function is within the DISPLAYED position of the video,
		 * then return TRUE, else FALSE
		 * @param videoElement  - video element to be checked
		 * @param position - current position of the slider as retrieved by element.offset(); -> contains { left: 42, top: 567 }
		 */
		$scope.isVideoCurrentlyFocused = function (videoElement, position) {
			//check if the slider position is currently in between the video MAX and MIN positions
			//alert("slider position: " + position.left + " min: " + videoElement.minPos + " max: " + videoElement.maxPos);
			if (position.left <= videoElement.maxPos && position.left >= videoElement.minPos) {
				//it is
				return true;
			}
			return false;
		}


		/**
		 * The method scaleVideoElementsToFitTheTimeline is iterrating over all video elements
		 * and scales the progress bar of the UI according to the durations and start times of the videos
		 */
		$scope.scaleVideoElementsToFitTheTimeline = function () {

			//make progressbar same size as slider
			var sliderWidth = $("#slider").width();
			$(".progress").css("width", sliderWidth);

			//get min of minTC and max of Max TC -> total time horizon
			var absoluteMin = Math.min.apply(null, $scope.videoElementList.map(function (a) {
				return a.minTC;
			}));
			var absoluteMax = Math.max.apply(null, $scope.videoElementList.map(function (a) {
				return a.maxTC;
			})) + 1;  //+1 to avoid progress bar separation
			var absoluteDuration = absoluteMax - absoluteMin;
			//alert("absoluteduration:" + absoluteDuration);

			//get relative size of videoElements
			//(duration of video / total time horizon) * 100 for percentage
			for (var i = 0; i < $scope.videoElementList.length; i++) {
				$scope.videoElementList[i].relativeUIWidthInPercent = Math.floor(($scope.videoElementList[i].videoDuration / absoluteDuration) * 100);
				//alert("relative width: "+$scope.videoElementList[i].relativeUIWidthInPercent);
				//make scale if the time horizon is very long
				if ($scope.videoElementList[i].relativeUIWidthInPercent <= 5) {
					//too small because of big time horizon
					$scope.videoElementList[i].relativeUIWidthInPercent = 5;
				}
				//if there is only one element in the list, then make 100% progress bar usage
				if($scope.videoElementList.length == 1){
					$scope.videoElementList[i].relativeUIWidthInPercent = 100;
				}
				//apply
				$('#element' + i).css("width", $scope.videoElementList[i].relativeUIWidthInPercent + "%");
			}

			//get relative size of the stub element before the actual element
			//((minTC of element - absoluteMin) / total time horizon) * 100 for percentage
			for (var i = 0; i < $scope.videoElementList.length; i++) {
				$scope.videoElementList[i].relativeUIWidthOfStubElementInPercent = Math.ceil((($scope.videoElementList[i].minTC - absoluteMin) / absoluteDuration) * 100);
				//alert("relative width for stub: "+$scope.videoElementList[i].relativeUIWidthOfStubElementInPercent);
				//make scale if the time horizon is very long
				if ($scope.videoElementList[i].relativeUIWidthOfStubElementInPercent >= 95) {
					//avoid the progress bar separation to next line
					$scope.videoElementList[i].relativeUIWidthOfStubElementInPercent = 95;
				}
				//apply
				$('#stubElement' + i).css("width", $scope.videoElementList[i].relativeUIWidthOfStubElementInPercent + "%");
			}

			//trigger the position calculation of the elements in the UI (slider and video bar snippets)
			//timeout due to race condition with UI elements --> in order to get the pixel positions,
			//DOM needs time to update
			setTimeout(function(){
				$scope.calculateScreenPositioningOfTheVideoElements();   //absolute position is calculated
			}, 1000);
		}


		/**
		 * The method calculateScreenPositioningOfTheVideoElements is used to calculate the absolute
		 * positions of the progress bar snippets of each video and save the min and max values to
		 * each element in the list
		 * THIS SHOULD ONLY BE CALLED AFTER THE POSITIONING OF THE ELEMENTS IS DONE
		 * WHICH MEANS AFTER THE METHOD scaleVideoElementsToFitTheTimeline()
		 */
		$scope.calculateScreenPositioningOfTheVideoElements = function () {
			for (var i = 0; i < $scope.videoElementList.length; i++) {
				//set max and min positions of all elements
				$scope.videoElementList[i].minPos = $('#element' + i).offset().left;
				$scope.videoElementList[i].maxPos = $('#element' + i).width() + $('#element' + i).offset().left;
			}
		}

		/**
		 * The method updateSliderFocus() is used to handle any sprite events according to the current
		 * position of the slider. This method is called every time the slider changes position
		 *
		 * The two methods handleVideoElementInFocus() and handleVideoElementOutOfFocus() should
		 * ONLY BE CALLED FROM THIS METHOD
		 */
		$scope.updateSliderFocus = function () {
			//some random variable check to avoid NULL-pointer
			if ( $scope.videoElementList[0].maxPos == null) {
				return;
			}
			//get position of slider
			var sliderPosition = $("#time-indicator-line").offset();
			//for every element check if progress bar snippet is currently in focus by slider
			for (var i = 0; i < $scope.videoElementList.length; i++) {
				if ($scope.isVideoCurrentlyFocused($scope.videoElementList[i], sliderPosition)) {
					//the current video is currently in focus by the slider
					//get the exact point (in percent) of the video
					//first total length
					var totalLength = $scope.videoElementList[i].maxPos - $scope.videoElementList[i].minPos;  //pixel
					//current slider position relative to video start
					var sliderOverVideo = sliderPosition.left - $scope.videoElementList[i].minPos;
					//position of slider in percent relative to the video
					var relativePosition = Math.ceil((sliderOverVideo / totalLength) * 100);

					$scope.handleVideoElementInFocus(i, sliderPosition, relativePosition);

				} else {

					//the video is currently out of focus
					$scope.handleVideoElementOutOfFocus(i, sliderPosition);
				}
			}
		}
		//slider is currently over the selected element
		$scope.handleVideoElementInFocus = function (positionOfVideoElementInList, sliderPosition, coveredPercentage) {
			// get path to thumbnail
			var videoID = $scope.videoElementList[positionOfVideoElementInList].videoID;
			var path = $scope.getImagePath(videoID);
			//get sprite coordinates
			var coordinatesForSprite = $scope.getSpriteCoordinates(videoID, coveredPercentage);

			//get index for videoId from precached images
			var index = null;
			for(var i=0; i<sourceArray.length; i++){
				if(sourceArray[i] == path){
					index = i;
				}
			}

			//load image
			$('#image' + positionOfVideoElementInList).css("background", "url(" + imageArray[index].src + ") " + coordinatesForSprite);
		}

		//slider is currently NOT over the selected element
		$scope.handleVideoElementOutOfFocus = function (positionOfVideoElementInList, sliderPosition) {
			//for now: make image grey
			$('#image' + positionOfVideoElementInList).css("background", "");
			$('#image' + positionOfVideoElementInList).css("background-color", "#000000");

		}

		// ---------------- SPRITE OPERATIONS ------------------------------

		$scope.getImagePath = function (videoID) {
			//testpath
			//var source = "server/media/" + videoID.substring(0, videoID.length - 4) + "/thumbnails.png";
			//node path
			var source = "/thumbs?vid=" + videoID.substring(0, videoID.length - 4);
			return source;
		}

		/**
		 * The method precacheSprites() should be called on startup. It iterrates over
		 * the videoItemList and downloads a sprite for every videoItem. These sprites are
		 * saved in the imageArray
		 *
		 * NOTE: two times for loop is not elegant but better for understanding
		 */
		$scope.precacheSprites = function (){
			console.log("start caching pictures ...");
			for(var i=0; i<$scope.videoElementList.length; i++){
				var videoID = $scope.videoElementList[i].videoID;
				sourceArray[i] = "/thumbs?vid=" + videoID.substring(0, videoID.length - 4);
			}

			//preload all selected images
			var img;
			var remaining = sourceArray.length;
			for (var j = 0; j < sourceArray.length; j++) {
				img = new Image();
				img.onload = function() {
					remaining--;
					if (remaining <= 0) {
						console.log("all pictures cached!");
					}
				};
				img.src = sourceArray[j];
				imageArray.push(img);
			}
		}



        $scope.getSpriteCoordinates = function(videoID, coveredPercentage) {


			//get video duration
			var videoElement = $scope.getVideoElementItemForVideoId(videoID);
			var duration = videoElement.videoDuration / 1000;
			var ySprite = null;

			//get JSON
           // console.log("JSON ARRAY ViD::",videoID,jsonArray[videoID]);

			//JSON of particular videoID was already loaded -> take from cache
            if(jsonArray[videoID]){
				console.log("JSON already cached!");
                var data = jsonArray[videoID];
                var numberOfSprites = data.thumbnailsData.length;
                //calculate one sprite percentage
                var spritePercentage = 100 / numberOfSprites;
                //calculate sprite position
                var spritePosition = Math.floor(coveredPercentage / spritePercentage);
                //variable for y coordinate of the sprite --> fetch from specific JSON

                ySprite = data.thumbnailsData[Math.min(Math.max(0, spritePosition - 1), numberOfSprites - 1)].metaData.posY;
            }
			//else branch: JSON could not be found in JSONArray -> fetch it from server
            else {
				console.log("loading JSON from server...!");
				console.log("JSON was NOT cached for video ID: " + videoID);
                $.ajax({
                    url: "/thumbs/json?vid=" + videoID.substring(0, videoID.length - 4),
                    dataType: 'json',
                    async: false,
                    data: "",
                    success: function (data) {
                        jsonArray[videoID]=data;
                        var numberOfSprites = data.thumbnailsData.length;
                        //calculate one sprite percentage
                        var spritePercentage = 100 / numberOfSprites;
                        //calculate sprite position
                        var spritePosition = Math.floor(coveredPercentage / spritePercentage);
                        //variable for y coordinate of the sprite --> fetch from specific JSON

                        ySprite = data.thumbnailsData[Math.min(Math.max(0, spritePosition - 1), numberOfSprites - 1)].metaData.posY;
                    },
					error: function (jqXHR, exception){
						console.log("ERROR: Ajax call failed: " + JSON.stringify(jqXHR) + "; " + exception);
					}
                });
            }
			//build string
			return "0px " + (-ySprite) + "px";

			//calculate pixel position
			//var ySprite = spritePosition * 82

		}

		/**
		 * method is called every time one of the list elements gets clicked
		 * (no matter where the click event is fired)
		 * @param event
		 */
		$scope.checkNumberOfCheckboxes = function (event) {
			var clickedTarget = angular.element(event.target);
			//in order to select the input box relative to the clicked element
			//we need to get the parent <li> object (ng-click can be fired from any sub-element too)
			//get property of clicked element
			var property = clickedTarget.prop('tagName')
			var liElement = null

			//CAREFUL exception when ng-click was fired from <input> -> checked property gets changed immediately (should not!!!)
			//reverse the automated checked
			if(property == "INPUT"){
				clickedTarget.prop('checked', function(idx, oldProp) {
					return !oldProp;
				});
			}

			if(property != "LI"){
				//ng-click was fired from sub element
				liElement = clickedTarget.parents("li");
			} else {
				//ng-click was already fires from <li>
				liElement = clickedTarget;
			}
			console.log("DOM element clicked: " + liElement.prop("tagName"));

			//check the checkbox of clicked element if not already clicked
			var inputElement = liElement.find("input");

			if(inputElement.is(":checked")){
				console.log("uncheck!");
				inputElement.prop("checked", false);
				liElement.removeClass("list-group-item-active");
				$scope.counter--;

			} else {
				console.log("check!");
				inputElement.prop("checked", true);
				liElement.addClass("list-group-item-active");
				$scope.counter++;
			}
			//write to label
			$('#selectedLabel').text("Videos selected: " + $scope.counter);

		}
	});


$(function () {

	/**
	 * STARTUP SECTION
	 */

	//load videos
	var retrievedObjects = JSON.parse(localStorage.getItem("storedVideoObjects"));
	console.log("number of objects selected: " + retrievedObjects.length);
	for (var i = 0; i < retrievedObjects.length; i++) {
		//create a list object for every selected object from viewSelection.html
		getScope().videoElementList.push(new VideoElementItem(getScope(), retrievedObjects[i].Duration, parseInt(retrievedObjects[i].MaxTC), parseInt(retrievedObjects[i].MinTC), retrievedObjects[i].Plat, retrievedObjects[i].Plng, retrievedObjects[i].User, retrievedObjects[i].VideoID));
	}
	console.log("number of objects pushed to array: " + getScope().videoElementList.length);
	//first sort all video elements by start-time
	getScope().sortVideoElementList();
	//scale video elements to fit screen
	getScope().scaleVideoElementsToFitTheTimeline();   //relative position in percent is calculated
	//trigger the update of the slider focus (should also be done every time the slider is moved)
	getScope().updateSliderFocus();

	//precache images
	getScope().precacheSprites();


	//initiate slider
	$("#slider").slider({
		range: "min",
		min: 0,
		max: 5000,
		step: 1,
		value: 1,
		create: function (e, ui) {
			synchronizeHandleAndIndicator();
		},
		slide: function (e, ui) {
			synchronizeHandleAndIndicator();
			//also trigger update focus operation
			getScope().updateSliderFocus();

		},
		change: function (event, ui) {
			synchronizeHandleAndIndicator();
			//also trigger update focus operation
			getScope().updateSliderFocus();
		},
		stop: function (e, ui) {

		}
	})



	//add pip lables to slider
	for (var i = 0; i <= 100; i++) {

		// Create a new element and position it with percentages
		var el = $('<label class="gridElement" style="margin-top: 5px; margin-left: -1px; font-size: x-small; z-index: -1">' + "|" + '</label>').css('left', (i/100*100) + '%');

		// Add the element inside #slider
		$("#slider").append(el);

	}



	//event handler for window resize event
	window.onresize = function(event) {
		synchronizeHandleAndIndicator();
		//scale video elements to fit screen
		getScope().scaleVideoElementsToFitTheTimeline();   //relative position in percent is calculated
		//trigger the position calculation of the elements in the UI (slider and video bar snippets)
		//should only be done once, or when the window is resized (TODO implement window resize reaction)
		getScope().calculateScreenPositioningOfTheVideoElements();   //absolute position is calculated
		//trigger the update of the slider focus (should also be done every time the slider is moved)
		getScope().updateSliderFocus();
	};


	//get absolute min and max
	//get min of minTC and max of Max TC -> total time horizon
	var absoluteMin = Math.min.apply(null, getScope().videoElementList.map(function (a) {
		return a.minTC;
	}));
	var absoluteMax = Math.max.apply(null, getScope().videoElementList.map(function (a) {
		return a.maxTC;
	}));

	var startDate = new Date(absoluteMin);
	var endDate = new Date(absoluteMax);

	var startDateString = startDate.customFormat( "#DD#/#MM#/#YYYY# #hhh#:#mm#:#ss#" );
	var endDateString = endDate.customFormat( "#DD#/#MM#/#YYYY# #hhh#:#mm#:#ss#" );


	// Create a new element and position it with percentages
	var e1 = $('<label >' + startDateString + '</label>').css('left', '-2%');
	var e2 = $('<label >' + endDateString +  '</label>').css('left', '96%');

	// Add the element inside #slider
	$("#slider").append(e1);
	$("#slider").append(e2);


});


/**
 * The method synchronizeHandleIndicator is used to allign the slider handle and
 * the vertical indicator line horizontally. The method gets called every time the
 * the slider handle changes position
 *
 */

//TODO: not perfectly synchronized yet!!!
function synchronizeHandleAndIndicator() {
	//control the time indicator line -> make it move together with the slider handle
	//get the current position of the slider handle
	var currentLocation = parseInt($("#slider span:first").css("left"));
	//set the location to the indicator line
	$("#time-indicator-line").css("left", currentLocation + 45 + "px");
}

/**
 * Gets the NG scope
 * @returns {*}
 */
function getScope() {
	return angular.element($("#page-content")).scope();
}

/**
 * Time format change helper function
 * @param formatString
 * @returns {XML|string}
 */
Date.prototype.customFormat = function(formatString){
	var YYYY,YY,MMMM,MMM,MM,M,DDDD,DDD,DD,D,hhh,hh,h,mm,m,ss,s,ampm,AMPM,dMod,th;
	var dateObject = this;
	YY = ((YYYY=dateObject.getFullYear())+"").slice(-2);
	MM = (M=dateObject.getMonth()+1)<10?('0'+M):M;
	MMM = (MMMM=["January","February","March","April","May","June","July","August","September","October","November","December"][M-1]).substring(0,3);
	DD = (D=dateObject.getDate())<10?('0'+D):D;
	DDD = (DDDD=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][dateObject.getDay()]).substring(0,3);
	th=(D>=10&&D<=20)?'th':((dMod=D%10)==1)?'st':(dMod==2)?'nd':(dMod==3)?'rd':'th';
	formatString = formatString.replace("#YYYY#",YYYY).replace("#YY#",YY).replace("#MMMM#",MMMM).replace("#MMM#",MMM).replace("#MM#",MM).replace("#M#",M).replace("#DDDD#",DDDD).replace("#DDD#",DDD).replace("#DD#",DD).replace("#D#",D).replace("#th#",th);

	h=(hhh=dateObject.getHours());
	if (h==0) h=24;
	if (h>12) h-=12;
	hh = h<10?('0'+h):h;
	AMPM=(ampm=hhh<12?'am':'pm').toUpperCase();
	mm=(m=dateObject.getMinutes())<10?('0'+m):m;
	ss=(s=dateObject.getSeconds())<10?('0'+s):s;
	return formatString.replace("#hhh#",hhh).replace("#hh#",hh).replace("#h#",h).replace("#mm#",mm).replace("#m#",m).replace("#ss#",ss).replace("#s#",s).replace("#ampm#",ampm).replace("#AMPM#",AMPM);
}