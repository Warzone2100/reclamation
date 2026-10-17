include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(46, 11, 34, 2);
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
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A1L2");

	// Give player briefing.
	// camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});

	// Lighten the fog to *more or less* 2x default brightness
	camSetFog(32, 32, 96);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Increase the lighting
	camSetSunIntensity(.6,.6,.6);

	// Give player briefing.
	camPlayVideos({video: "A1L2_BRIEF", type: MISS_MSG});
}