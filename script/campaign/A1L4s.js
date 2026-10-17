include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(46, 11, 34, 2);
	centreView(46, 11);
	setNoGoArea(45, 10, 47, 12, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(20)));
		camSetExtraObjectiveMessage(_("Additional mission time available later"));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A1L4");

	// In case the player didn't get this in the last mission
	enableResearch("R-Wpn-MG-ROF01", CAM_HUMAN_PLAYER);

	// Descrease the lighting slightly
	camSetSunIntensity(.45,.45,.45);
	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	camSetWeather(CAM_WEATHER_RAINSTORM);

	// Place the satellite uplink from A1L3
	const NASDA = 1;
	setAlliance(CAM_HUMAN_PLAYER, NASDA, true);
	addStructure("UplinkCentre", NASDA, 108 * 128, 50 * 128);

	// Give player briefing.
	camPlayVideos({video: "A1L4_BRIEF", type: MISS_MSG});
}