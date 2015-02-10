/**
 * Created by rival on 16.01.15.
 *
 * This Class is used to store all information of a single video element
 *
 */

var VideoElementItem = function($scope, duration, maxTC, minTC, plat, plng, user, videoID){

	var $scope = $scope;

	/*
	 Using var that = this; is a way to store the context at function definition time
	 (rather than function execution time, when the context could be anything,
	 depending on how the function was invoked). Meaning: that keeps the context from
	 the time the Service was initialized.
	 */
	var that = this;

	this.videoDuration = duration;
    this.videoDurationMIN = Math.floor(duration/60000);
    this.videoDurationSec = Math.round((duration%60000)/1000);
    if(this.videoDurationSec<10){
        this.videoDurationSec = '0'+ this.videoDurationSec;
    }
	this.maxTC = maxTC;
	this.minTC = minTC;
	this.plat = plat;
	this.plng = plng;
    if(user){
	    this.MQuser = user;
    }else{
        this.MQuser = "Anonymous";
    }
	this.videoID = videoID;



	//self-made ;)
	this.minPos = null;   //is the horizontal minimum coordinates of the position where the video is DISPLAYED! (as green progress bar)
	this.maxPos = null;   //is the horizontal maximum coordinates of the position where the video is DISPLAYED! (as green progress bar)
							//   minPos<------------------>maxPos
							//            minPos<-------------------->maxPos
	this.relativeUIWidthInPercent = null;  //used to calculate a relative width of the element in view (relative to other elements & total duration)
	                              //in percent!!!
	this.relativeUIWidthOfStubElementInPercent  = null;   //used to define the element size of the stub element that is placed in front of
	   											          //the actual element

	//NOTE: the minPos and maxPos variables can only be set AFTER the relative coordinates were set! they depend on the screen view



}