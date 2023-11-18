// Global variables

// Start & End of Day - change these variables to increase or reduce the length of the scheduled day
var dayStart = 9;
var dayEnd = 17;

// Class Names used to display the colour for past, present and future Time Blocks
var pastClass = "past";
var presentClass = "present";
var futureClass = "future";

// Scheduler variables
// planner is the object holding Time Blocks while the scheduler is in use
// schedule is the local storage key to hold the planner data
var planner;
var schedule = "schedule";

$(function () {

  // Read planner data from local storage if it exists
  planner = readPlanner();
  if (planner === null) {
    // If planner data doesn't exist create & populate planner data object
    planner = {}
    for (var i = dayStart; i < dayEnd + 1; i++) {
      planner[i] = "";
    }
  }

  //Build the Daily Planner
  // Get the date
  var dateAsString = dayjs().format("YYYY-MM-DD");
  var currentHour = dayjs().hour();
  // Build each Time Block
  for (var i = dayEnd; i > dayStart - 1; i--) {

    // Create the Time Block
    var hourId = "hour-" + i.toString();
    $(".container-lg").prepend("<div id='" + hourId + "' class='row time-block'></div>");
    // Add the time colour class
    $("#" +hourId).addClass(colourTimeBlock(i, currentHour));
    $("#" + hourId).append("<div class='col-2 col-md-1 hour text-center py-3'></div>");
    hourAsString = i.toString() + ":00";
    // show the hour in 12 hour format AM/PM
    $("#" + hourId + " div").text(dayjs(dateAsString + " " + hourAsString).format("hA"));

    $("#" + hourId).append("<textarea class='col-8 col-md-10 description' rows='3'></textarea>");
    // Get Meeting for this Time Block
    $("#" + hourId + " textarea").text(planner[i]);

    // Create Save Button
    $("#" + hourId).append("<button class='btn saveBtn col-2 col-md-1' aria-label='save'>");
  }
  // Add the Save Icon to all elements with the saveBtn class
  $(".saveBtn").prepend("<i class='fas fa-save' aria-hidden='true'></i>");

  // Event listener for Save Button 
  $(".saveBtn").on("click", function () {
    meetingTime = parseInt($(this).parent().attr("id").split("-")[1]);
    meetingDescription = $(this).siblings(".description").val();
    planner[meetingTime] = meetingDescription
    // Save Planner Data to local storage
    localStorage.setItem(schedule, JSON.stringify(planner));
  });

  // Set an interval timer to handle hour changes
  setInterval(function () {
    // Checks each minute to see if its the start of a new hour
    // If so, call checkTime and update the hour block classes
    var currentMinute = parseInt(dayjs().minute());
    if (currentMinute === 0) {
      var newHour = dayjs().hour();
      var oldHour = newHour - 1;
      //build new hourIDs
      newHourId = "hour-" + newHour.toString();
      oldHourId="hour-" + oldHour.toString();
      // Change the colour classes
      $("#" +newHourId).addClass(presentClass).removeClass(futureClass);
      $("#" +oldHourId).addClass(pastClass).removeClass(presentClass);
    }
  }, 60000);

  // Get todays date
  var todaysDate = dayjs();
  // Get the Ordinal Suffix
  var suffix = getOrdinal(dayjs(todaysDate).format("D")) + ",";
  $("#currentDay").text(
    dayjs(todaysDate).format("dddd, MMMM D") +
    suffix +
    " " +
    dayjs().format("YYYY")
  );
});

function colourTimeBlock(i, currentHour) {
// Get the colour class for past, present or future
  if (i < currentHour) {
    hourClass = pastClass;
  } else if (i > currentHour) {
    hourClass = futureClass;
  } else {
    hourClass = presentClass;
  }
  return hourClass;
}

function getOrdinal(noToOrdinal) {
  // Determine the ordinal number of a date in a month
  // Eg: 1st, 2nd, 3rd, 11th, 21st, etc
  // I wrote my own function because I encountered an error in the dayjs advancedFormat routine
  switch (parseInt(noToOrdinal)) {
    case 1:
    case 21:
    case 31:
      ordinalSuffix = "st";
      break;
    case 2:
    case 22:
      ordinalSuffix = "nd";
      break;
    case 3:
    case 23:
      ordinalSuffix = "rd";
      break;
    default:
      ordinalSuffix = "th";
  }
  return ordinalSuffix;
}

function readPlanner() {
  // Read Planner Data from local storage
  return JSON.parse(localStorage.getItem(schedule));
}
