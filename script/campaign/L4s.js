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
	camSetupTransporter(31, 20, 25, 32);
	centreView(32, 20);
	setNoGoArea(30, 19, 33, 22, CAM_HUMAN_PLAYER);
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "L4");

	// Set a timer for checking that the player didn't demolish the missile silos.
	setTimer("checkMissileSilos", camSecondsToMilliseconds(1));

	// Give player briefing.
	camPlayVideos({video: "L4_BRIEF", type: MISS_MSG});

	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(75)));
	}
	else
	{
		setMissionTime(-1);
	}

	// Set the sky to night
	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the lighting somewhat
	camSetSunIntensity(.4,.4,.4);
	// Darken the fog to 1/4 default brightness
	camSetFog(45, 56, 59);
	// Clear skies
	camSetWeather(CAM_WEATHER_CLEAR);
}