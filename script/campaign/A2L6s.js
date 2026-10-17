include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(101, 116, 123, 94);
	centreView(101, 116);
	setNoGoArea(100, 115, 102, 117, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(30)));
		camSetExtraObjectiveMessage(_("Additional mission time available later"));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A2L6");

	// Give player briefing.
	camPlayVideos({video: "A2L6_BRIEF", type: MISS_MSG});

	// Additional dialogue
	camQueueDialogue([
		{text: "LIEUTENANT: Bravo, remember that you'll need to clear the", delay: 12, sound: CAM_RCLICK},
		{text: "LZ before you can call in any reinforcements.", delay: 0},
		{text: "LIEUTENANT: We can't risk the Collective detecting us before Clayde has launched his diversion.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Make sure that you bring enough combat units in your first transport.", delay: 4, sound: CAM_RCLICK},
	]);

	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the fog to 1/4 default brightness
	camSetFog(4, 4, 16);
	camSetSunIntensity(.4, .4, .45);
	camSetWeather(CAM_WEATHER_CLEAR);
}