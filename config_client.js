/**
 * Created by Zeemawn on 1/21/15.
 */

var clientOptions = {
    videoUrlPrefix : "http://mediaq.dbs.ifi.lmu.de/MediaQ_MVC_V2/video_content/",
    initialMinDate : new Date(2014, 11, 8, 11, 0, 0, 0),
    initialMaxDate : new Date(2014, 11, 8, 13, 0, 0, 0),
    oneDayMode : true,
    mapOptions : {
        zoom: 13,
        center: new google.maps.LatLng(48.137222222222, 11.575555555556519)
    },
    mapMarkerIcon : {
        path: "M80,35.017C80,18.438,66.566,5,49.999,5C33.43,5,20,18.438,20,35.017c0,4.909,1.185,9.538,3.272,13.627h-0.009   l26.736,46.534l26.736-46.534h-0.009C78.813,44.555,80,39.926,80,35.017z M36.375,35.017c0-7.529,6.1-13.632,13.624-13.632   c7.523,0,13.625,6.103,13.625,13.632c0,7.453-5.974,13.504-13.393,13.627h-0.464C42.35,48.521,36.375,42.47,36.375,35.017z",
        fillColor: '#64b94c',
        fillOpacity: 1.0,
        anchor: new google.maps.Point(0,0),
        strokeWeight: 1.0,
        scale: .3
    }
}