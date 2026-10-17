include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(101, 116, 118, 118);
	centreView(101, 116);
	setNoGoArea(100, 115, 102, 117, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(0.5)));
		camSetExtraObjectiveMessage(_("Additional mission time available later"));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A2L2");

	// Give player briefing.
	camPlayVideos({video: "A2L2_BRIEF", type: MISS_MSG});

	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	// Add a pinch of darker and gritty blue
	camSetSunIntensity(.45, .45, .5);
}