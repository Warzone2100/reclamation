include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	camSetupTransporter(101, 116, 85, 94);
	centreView(101, 116);
	setNoGoArea(100, 115, 102, 117, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.5)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A2L4");

	// Give player briefing.
	camPlayVideos({video: "A2L4_BRIEF", type: MISS_MSG});

	// Suggest that the player should use some hover tanks for this mission
	camQueueDialogue([
		{text: "CHARLIE: Hey Bravo!", delay: 12, sound: CAM_RCLICK},
		{text: "CHARLIE: Clayde's sending you to a flooded portion of the city.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: It'll be hard to move around there with normal ground units.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: ...But that new propulsion you found in", delay: 3, sound: CAM_RCLICK},
		{text: "the last Collective base might be useful there.", delay: 0},
	]);

	camSetSunIntensity(.35, .35, .45);
}