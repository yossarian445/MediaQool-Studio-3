/**
 * Created by Zeemawn on 1/8/15.
 */

var slider;
var isLoading;

// initializes the "query-model" -> selectedOptions
// initializes the GUI-elements (sliders, date-pickers and checkbox)
function initializeDatePicking(){

    // Initialize the "query-model" with the default-values
    selectedOptions.minDate = clientOptions.initialMinDate;
    selectedOptions.maxDate = clientOptions.initialMaxDate;

    // Initialize the TimeSlider
    $("#slider").ionRangeSlider({
        type: "double",
        min: moment(clientOptions.initialMinDate).subtract(clientOptions.initialMinDate.getHours(), "hours").format("X"),
        max: moment(clientOptions.initialMaxDate).add(24-clientOptions.initialMaxDate.getHours(), "hours").format("X"),
        from: moment(clientOptions.initialMinDate).format("X"),
        to: moment(clientOptions.initialMaxDate).format("X"),
        grid: true,
        grid_num: 24,
        drag_interval : true,
        keyboard: true,
        prettify: function (num) {
            var unixSeconds = moment(num, "X");

            if(unixSeconds.format("hh:mm A") == "12:00 AM"){ // HACK Check if it's midnight -> if so, show date instead of time
                return unixSeconds.format("MMM Do YY");
            } else {
                return unixSeconds.format("hh:mm A");
            }
        },
        onChange: onSliderChanged,
        onFinish: getDataForSelectedOptions
    });

    // Save slider to variable, in order to be able to manipulate it later
    slider = $("#slider").data("ionRangeSlider");


    // Initialize the  datepicker
    $( "#datepicker" ).datepicker({
        maxDate: 0,
        onSelect: onSelectedDateChanged
    });
    $( "#datepicker").datepicker('setDate', selectedOptions.minDate);

    // Set listeners to Checkboxes
    $('#another-day-left').change(updateSliderBounds);
    $('#another-day-right').change(updateSliderBounds);

    // Set listener to Continue-Button
    $('#nextButton').click(goToNextPage);

}

// Called when a date is picked in the date-picker
function onSelectedDateChanged(){

    var date = $( "#datepicker").datepicker('getDate');

    // update query-model: Selected date + default time-range
    selectedOptions.minDate = new Date (date);
    selectedOptions.minDate.setHours(clientOptions.initialMinDate.getHours());
    selectedOptions.minDate.setMinutes(clientOptions.initialMinDate.getMinutes());

    selectedOptions.maxDate = new Date (date);
    selectedOptions.maxDate.setHours(clientOptions.initialMaxDate.getHours());
    selectedOptions.maxDate.setMinutes(clientOptions.initialMaxDate.getMinutes());

    resetCache();
    reinitializeSlider();
    getDataForSelectedOptions();

}

// Reinitializes the slider to show only one day representing the selected values
function reinitializeSlider(){

    // uncheck the checkboxes
    $('#another-day-left').attr('checked', false);
    $('#another-day-right').attr('checked', false);

    // Reset the slider to the values in the query-model
    slider.update({
        from: moment(selectedOptions.minDate).format("X"),
        to: moment(selectedOptions.maxDate).format("X"),
        min: moment(selectedOptions.minDate).startOf('day').format("X"),
        max: moment(selectedOptions.maxDate).startOf('day').add(1, "days").format("X")
    });
}

// Checks which checkboxes are checked and updates the slider
function updateSliderBounds(){

    var date = $( "#datepicker").datepicker('getDate');

    // Add a day on the left if the left checkbox is clicked, or don't if it isn't
    if($('#another-day-left').is(':checked')) {
        slider.update({
            min: moment(date).startOf('day').subtract(1, "days").format("X")
        });
    } else {
        slider.update({
            min: moment(date).startOf('day').format("X")
        });
    }

    // Add a day on the right if the right checkbox is clicked, or don't if it isn't
    if($('#another-day-right').is(':checked')) {
        slider.update({
            max: moment(date).startOf('day').add(2, "days").format("X")     // You have to go two days from the start of the day to get to the END of the extra-day

        });
    } else {
        slider.update({
            max: moment(date).startOf('day').add(1, "days").format("X")
        });
    }

    // of course the slider changed, if we're manipulating the values
    onSliderChanged(slider.options);

}

// Updates the query-model with the values shown on the slider
function onSliderChanged(data){

    selectedOptions.minDate = new Date (moment(data.from, "X"));
    selectedOptions.maxDate = new Date (moment(data.to, "X"));

    // If it's loading, it is likely that the user extending the time range at the moment;
    // In this case we don't want to send a request to the server every time the slider changes
    // -> it will do one request at a time
    if(!isLoading){
        getDataForSelectedOptions();
    }
}

// Saves the selected video-objects into the html5-local-storage and starts the next page
function goToNextPage() {

    if($('#nextButton').hasClass("activeButton")) {

        // Put selectedVideoObjects as String in local storage
        localStorage.setItem("storedVideoObjects", JSON.stringify(selectedVideoObjects));

        // Go to next page
        window.location.href = "viewTimeLine.html";
    }
}

// util method
function logSelectedOptions(i){
    console.log("("+i+")\n" +
        "fr "
        +moment(selectedOptions.minDate).format("D.M.YYYY h:mm A")
        +" to "
        +moment(selectedOptions.maxDate).format("D.M.YYYY h:mm A")
    );
}