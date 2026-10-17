include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

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
	camSetupTransporter(31, 20, 39, 46);
	centreView(32, 20);
	setNoGoArea(30, 19, 33, 22, CAM_HUMAN_PLAYER);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "L6");

	// Set a timer for checking that the player didn't demolish the missile silos.
	setTimer("checkMissileSilos", camSecondsToMilliseconds(1));

	// Give player briefing.
	camPlayVideos({video: "L6_BRIEF", type: MISS_MSG});

	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(105)));
	}
	else
	{
		setMissionTime(-1);
	}

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);
	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	// Add a slight purple hue
	camSetSunIntensity(.5,.45,.5);
	// Clear skies
	camSetWeather(CAM_WEATHER_CLEAR);
}