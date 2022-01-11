include("script/campaign/libcampaign.js");

// Check to make sure at least 1 silo still exists.
function checkMissileSilos()
{
	if (!countStruct("NX-CruiseSite", CAM_HUMAN_PLAYER))
	{
		gameOverMessage(false, false);
	}
}

// This function is called after a video is played, a delay is required for the 'alert' sound to play properly in all cases
function messageAlert()
{
	playSound("beep7.ogg"); // Play a little noise to notify the player that they have a new message
}

function eventStartLevel()
{
	camSetupTransporter(31, 20, 25, 16);
	centreView(32, 20);
	setNoGoArea(30, 19, 33, 22, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(75)));
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "L2");

	// Set a timer for checking that the player didn't demolish the missile silos.
	setTimer("checkMissileSilos", camSecondsToMilliseconds(1));

	// Give player briefing.
	camPlayVideos({video: "L2_BRIEF", type: MISS_MSG});
	queue("messageAlert", camSecondsToMilliseconds(0.2));
}