include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(46, 11, 68, 2);
	centreView(46, 11);
	setNoGoArea(45, 10, 47, 12, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.25)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A1L5");

	// Give player briefing.
	camPlayVideos({video: "A1L5_BRIEF", type: MISS_MSG});

	// Darken the fog to 1/2 default brightness
	camSetFog(8, 8, 32);
	// Darken the lighting and add a slight blue hue
	camSetSunIntensity(.4, .4, .5);
	camSetWeather(CAM_WEATHER_RAINSTORM);
	camSetSkyType(CAM_SKY_NIGHT);

	// Place the satellite uplink from A1L3
	const NASDA = 1;
	setAlliance(CAM_HUMAN_PLAYER, NASDA, true);
	addStructure("UplinkCentre", NASDA, 108 * 128, 50 * 128);
}