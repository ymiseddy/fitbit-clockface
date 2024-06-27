import clock from "clock";
import * as document from "document";
import { battery } from "power";
import { today, goals } from 'user-activity';
import { HeartRateSensor } from "heart-rate";

const dow = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function zeroPad(i) {
	if (i < 10) {
		i = "0" + i;
	}
	return i;
}

const hrm = null;
if (HeartRateSensor) {
	hrm = new HeartRateSensor();
	hrm.addEventListener("reading", () => {
		hrm.heartRate;
		drawHeartRate(hrm);
	});
	hrm.start();
}

// Update the clock every second
clock.granularity = "seconds";

// Update the <text> element every tick with the current time
clock.ontick = (evt) => {
	drawTime(evt);
	drawBatteryIndicator(evt);
	drawStepInfo(evt);
	drawCalories();
	drawActivity();
	drawStairs();
}

const dateLabel = document.getElementById("dateLabel");
const clockLabel = document.getElementById("clockLabel");
const utcLabel = document.getElementById("utcLabel");
const epochLabel = document.getElementById("epochLabel");

function drawTime(evt) {
	let eventDate = evt.date;

	const year = eventDate.getFullYear();
	var month = zeroPad(eventDate.getMonth() + 1);
	var day = zeroPad(eventDate.getDate());
	var dayOfWeek = dow[eventDate.getDay()];
	dateLabel.text = `${dayOfWeek} ${year}-${month}-${day}`;


	// Epoch seconds
	let epoch = Math.floor(eventDate.getTime() / 1000);
	epochLabel.text = epoch;
	// UTC Time
	let utcHours = zeroPad(eventDate.getUTCHours());
	let utcMinutes = zeroPad(eventDate.getUTCMinutes());
	let utcSeconds = zeroPad(eventDate.getUTCSeconds());

	// Local Time - note, ignoring 12h preferences.
	let hours = zeroPad(eventDate.getHours());
	let mins = zeroPad(eventDate.getMinutes());
	let seconds = zeroPad(eventDate.getSeconds());

	clockLabel.text = `${hours}:${mins}:${seconds}`;
	utcLabel.text = `${utcHours}:${utcMinutes}:${utcSeconds}`;

}


const batteryLevel = document.getElementById("batteryLevel");
function drawBatteryIndicator() {
	let batteryFill = 20 - Math.floor((battery.chargeLevel / 100) * 20);
	batteryLevel.height = batteryFill;
}

const stepLabel = document.getElementById("stepLabel");
const stepPaceLabel = document.getElementById("stepPaceLabel");
function drawStepInfo() {
	const goalSteps = goals.steps ?? 10000;
	const date = new Date();
	const currentDate = new Date();

	const startOfDay = date.setHours(8, 0, 0, 0);
	const endOfDay = date.setHours(19, 59, 59, 999);
	const dayRange = endOfDay - startOfDay;
	const current = currentDate.getTime();
	let dayFraction = (current - startOfDay) / dayRange;
	dayFraction = dayFraction < 0 ? 0 : dayFraction;
	dayFraction = dayFraction > 1 ? 1 : dayFraction;

	const targetSteps = Math.floor(goalSteps * dayFraction);
	let remaining = targetSteps - today.adjusted.steps;
	let ahead = false;
	if (remaining < 0) {
		ahead = true;
		remaining = Math.abs(remaining);
	}
	stepLabel.text = today.adjusted.steps;
	stepPaceLabel.style.fill = ahead ? "teal" : "palevioletred";
	stepPaceLabel.text = remaining
}

const calorieLabel = document.getElementById("calorieLabel");
function drawCalories() {
	calorieLabel.text = today.adjusted?.calories ?? "--";
}

const activityLabel = document.getElementById("activityLabel");
function drawActivity() {
	activityLabel.text = today.adjusted?.activeZoneMinutes?.total ?? "--";
}


const heartRateLabel = document.getElementById("heartRateLabel");
function drawHeartRate(hrm) {
	heartRateLabel.text = hrm.heartRate ?? "--";
}

const stairLabel = document.getElementById("stairLabel");
function drawStairs() {
	stairLabel.text = today.adjusted?.elevationGain ?? "--";
}
