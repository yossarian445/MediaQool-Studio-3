/**
 * Created by Zeemawn on 1/8/15.
 */


var map;


// Initializes the map with the default values of the clientOptions
function initializeMap() {

    map = new google.maps.Map(document.getElementById('map-stuff-div'),
        clientOptions.mapOptions);

    // Once the map is set up: save the current bounds to the query-model
    // And get the data from the server
    google.maps.event.addListener(map, 'idle', function(ev){
        updateSelectedBounds();
        getDataForSelectedOptions();
    });

}

// Takes the current map-Bounds and saves them into the query-model
function updateSelectedBounds(){

    var northEast = map.getBounds().getNorthEast();
    var southWest = map.getBounds().getSouthWest();
    selectedOptions.bounds = {
        lat1 : northEast.lat(),
        lng1 : northEast.lng(),
        lat2 : southWest.lat(),
        lng2 : southWest.lng()
    }
}


// Only shows those markers, who are in the given time frame
function updateVideoMarkers(){

    // Check which cached videos should get a marker
    cachedVideoObjects.forEach(function (entry) {

        // If the video has not yet a marker and is in the time frame -> create marker
        if (!(entry.VideoID in videosWithAdditionalInfos) /* && im Zeitrahmen */
            && entry.MinTC >= selectedOptions.minDate && entry.MaxTC <= selectedOptions.maxDate) {


            var marker = new google.maps.Marker({
                position: {lat: entry.Plat, lng: entry.Plng},
                map: map,
                title: entry.VideoID,
                icon: clientOptions.mapMarkerIcon
            });

            // Create new VideoWithAdditionalInfos
            videosWithAdditionalInfos[entry.VideoID] = {
                videoObject: entry,
                marker: marker,
                chosen: true
            }

            // Set ClickListener to choose/unchoose marker
            google.maps.event.addListener(marker, 'click', function() {

                videosWithAdditionalInfos[entry.VideoID].chosen = !videosWithAdditionalInfos[entry.VideoID].chosen;

                var icon = marker.getIcon();

                if(!videosWithAdditionalInfos[entry.VideoID].chosen){
                    icon.fillColor = "#eeeeee";
                    icon.fillOpacity = 0.85;
                    icon.strokeWeight = 0.5;
                } else{
                    icon.fillColor = "#64b94c";
                    icon.fillOpacity = 1.0;
                    icon.strokeWeight = 1.0;
                }
                marker.setIcon(icon);

                updateSelectedVideos();
                updateButton();
            });


            console.log("new markers.");

        } else { // if there exists a marker that exceeds the time range -> delete
            if(entry.VideoID in videosWithAdditionalInfos &&
                (entry.MinTC < selectedOptions.minDate || entry.MaxTC > selectedOptions.maxDate)){

                videosWithAdditionalInfos[entry.VideoID].marker.setMap(null);
                delete videosWithAdditionalInfos[entry.VideoID];
                console.log("deleted markers.");

            }
        }
    });


}

// Removes the markers from the map
function deleteAllMarkers(){

    for (var entry in videosWithAdditionalInfos) {
        videosWithAdditionalInfos[entry].marker.setMap(null);
    }

}

// returns true, if a video is in the currently selected bounds
function videoInSelectedBounds(video){

    var position = new google.maps.LatLng(video.Plat, video.Plng);

    var selectedOptionsGoogleBounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(selectedOptions.bounds.lat2, selectedOptions.bounds.lng2),
        new google.maps.LatLng(selectedOptions.bounds.lat1, selectedOptions.bounds.lng1)
    )

    return selectedOptionsGoogleBounds.contains(position);

}
