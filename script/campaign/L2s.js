include("script/campaign/libcampaign.js");

// Check to make sure at least 1 silo still exists.
function checkMissileSilos()
{
	if (!countStruct("NX-CruiseSite", CAM_HUMAN_PLAYER))
	{
		gameOverMessage(false, false);
	}
}

function eventStartLevel()
{
	camSetupTransporter(31, 20, 25, 16);
	centreView(32, 20);
	setNoGoArea(30, 19, 32, 21, CAM_HUMAN_PLAYER);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "L2");

	// Set a timer for checking that the player didn't demolish the missile silos.
	setTimer("checkMissileSilos", camSecondsToMilliseconds(1));

	// Give player briefing.
	camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});

	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(75)));
	}
	else
	{
		setMissionTime(-1);
	}

	// Increase the lighting
	camSetSunIntensity(.6,.6,.6);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Clear the skies
	camSetWeather(CAM_WEATHER_CLEAR);
}