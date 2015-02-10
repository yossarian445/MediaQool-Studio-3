/**
 * Created by Zeemawn on 1/8/15.
 */


var cachedOptions;
var selectedOptions = {
    minDate : new Date(),
    maxDate : new Date(),
    bounds : {
        lat1 : 1.0,
        lat2 : 1.0,
        lng1 : 1.0,
        lng2 : 1.0
    }
};

var cachedVideoObjects;
var selectedVideoObjects = {};
var videosWithAdditionalInfos = new Array();


function initialize(){
    resetCache();
    initializeMap();
    initializeDatePicking();
    getDataForSelectedOptions();
}

//Loading Indicator
$.ajaxSetup({
    beforeSend:function(){
        // show gif here, eg:
        $('#nextButton').attr("disabled", true);
        $('#load-indicator').css('visibility', 'visible');
        //$("#loading-indicator").show();
    },
    complete:function(){
        // hide gif here, eg:
        $('#nextButton').attr("disabled", false);
        $('#load-indicator').css('visibility', 'hidden');
        $("#loading-indicator").hide();
    }
});

function resetCache(){
    deleteAllMarkers();
    videosWithAdditionalInfos = new Array();
    cachedVideoObjects = new Array();
    selectedVideoObjects = {};
    cachedOptions = {
        minDate : new Date(),
        maxDate : new Date(0),
        bounds : {
            lat1 : 1.0,
            lat2 : 1.0,
            lng1 : 1.0,
            lng2 : 1.0
        }
    }
}

// Is called, when a date is picked, a time is changed, or the map-bounds change
// Checks if we need to load more video-information from the server
function getDataForSelectedOptions(){

    var enoughInCache = true;

    if(selectedOptions == null){
        enoughInCache = false;
    } else {

        // Check if Time-Range has become wider
        if(cachedOptions.minDate > selectedOptions.minDate || cachedOptions.maxDate < selectedOptions.maxDate){
            enoughInCache = false;
            console.log("Time-Range exceeds cache: GET MORE!");
        }

        // Check if bounds have become bigger
        var cachedOptionsGoogleBounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(cachedOptions.bounds.lat2, cachedOptions.bounds.lng2),
            new google.maps.LatLng(cachedOptions.bounds.lat1, cachedOptions.bounds.lng1)
        )

        var selectedNorthEast = new google.maps.LatLng(selectedOptions.bounds.lat1, selectedOptions.bounds.lng1);
        var selectedSouthWest = new google.maps.LatLng(selectedOptions.bounds.lat2, selectedOptions.bounds.lng2);

        if(!(cachedOptionsGoogleBounds.contains(selectedNorthEast)
            && cachedOptionsGoogleBounds.contains(selectedSouthWest))){
            enoughInCache = false;
            console.log("Bounds exceed cache: GET MORE!");
        }

    }

    // We have to load more stuff from the server
    if(!enoughInCache){
        var jd = {
            minDate: selectedOptions.minDate.getTime(),
            maxDate: selectedOptions.maxDate.getTime(),
            bounds: selectedOptions.bounds
        };

        var js = {data:JSON.stringify(jd)};

        console.log(js);

        $.post(cfg.mediaQDataURL, js, onGetSuccess);
        isLoading = true;
    } else { // We have enough data in the cache
        console.log("Accessing cache...");
        updateSelectedVideoObjects();
    }

}

// Is called when there comes new video-data from the server
function onGetSuccess(data) {

    // Put new videos in cache
    updateCacheWithNewData(data);

    // Set cache-options to the currently selected options
    // (so that we can check again in getDataForSelectedOptions,
    //  when something (date, time, place) has changed)
    if(cachedOptions.minDate > selectedOptions.minDate){
    cachedOptions.minDate = new Date(selectedOptions.minDate);
    }
    if(cachedOptions.maxDate < selectedOptions.maxDate){
    cachedOptions.maxDate = new Date(selectedOptions.maxDate);
    }
    cachedOptions.bounds.lat1 = selectedOptions.bounds.lat1;
    cachedOptions.bounds.lng1 = selectedOptions.bounds.lng1;
    cachedOptions.bounds.lat2 = selectedOptions.bounds.lat2;
    cachedOptions.bounds.lng2 = selectedOptions.bounds.lng2;
    console.log("SUCCESS: Cache updated!");

    updateSelectedVideoObjects();

    isLoading = false;

}

// Updates selectedVideoObjects so that it
function updateSelectedVideoObjects(){

    updateVideoMarkers();
    updateSelectedVideos();
    updateButton();

}


// Takes all the on the map chosen videos and
// puts them into selectedVideoObjects
function updateSelectedVideos(){

    selectedVideoObjects = new Array();

    for( var video in videosWithAdditionalInfos){

        if(videosWithAdditionalInfos[video].chosen && videoInSelectedBounds(videosWithAdditionalInfos[video].videoObject)){
            selectedVideoObjects.push(videosWithAdditionalInfos[video].videoObject);
        }
    }

    //$( "#result").text(selectedVideoObjects.length + " videos marked");


}

// Updates text on the button depending on the
// number of selected videos
function updateButton(){
    var nextButton = $("#nextButton");

    if(selectedVideoObjects.length == 0){
        nextButton.text("No videos selected");
        nextButton.prop("disabled", true);
        nextButton.attr("disabled", true);
        nextButton.addClass("inActiveButton");
        nextButton.removeClass("activeButton");
    } else {
        nextButton.text("Continue ("+selectedVideoObjects.length+" videos)");
        nextButton.prop("disabled", false);
        nextButton.attr("disabled", false);
        nextButton.addClass("activeButton");
        nextButton.removeClass("inActiveButton");
    }
}

// Puts new video-objects into the cache, if they are not
// in there already
function updateCacheWithNewData(data){

    // If there is nothing cached yet, just take everything
    if(cachedVideoObjects == null){
        cachedVideoObjects = data;
    }

    // Iterate through new data if elements are already in cache
    data.forEach(function(entry){

        var entryIsNew = true;

        cachedVideoObjects.forEach(function(videoObject){
            if(entry.VideoID == videoObject.VideoID){
                entryIsNew = false;
            }
        });

        // If an item is not in the cache -> push it!
        if(entryIsNew){
            cachedVideoObjects.push(entry);
            console.log("new Entry");
        }
    });
}