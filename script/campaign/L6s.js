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

// This function is called after a video is played, a delay is required for the 'alert' sound to play properly in all cases
function messageAlert()
{
	playSound("beep7.ogg"); // Play a little noise to notify the player that they have a new message
}

function eventStartLevel()
{
	camSetupTransporter(31, 20, 39, 46);
	centreView(32, 20);
	setNoGoArea(30, 19, 33, 22, CAM_HUMAN_PLAYER);
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(105)));
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "L6");

	// Set a timer for checking that the player didn't demolish the missile silos.
	setTimer("checkMissileSilos", camSecondsToMilliseconds(1));

	// Give player briefing.
	camPlayVideos({video: "L6_BRIEF", type: MISS_MSG});
	queue("messageAlert", camSecondsToMilliseconds(0.2));

	setTimer("check", camSecondsToMilliseconds(1));

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);
}
























































// What are you looking for? There's nothing down here.















































// Yep. Nothing at all.































































// No secrets here.
















































































// Nothing to see here...































































// ok FINE you can look
var currentColour = 3;
const THEM = 3;

function check()
{
	var nw = getObject(3, 8);
	var w = getObject(4, 68);
	var c = getObject(42, 92);
	var e = getObject(60, 100);

	if (nw !== null && w !== null && c !== null && e !== null 
		&& nw.isSensor && w.isSensor && c.isSensor && e.isSensor 
		&& nw.status === BUILT && w.status === BUILT && c.status === BUILT && e.status === BUILT)
	{
		setTimer("colourSwitch", camSecondsToMilliseconds(0.2));
		removeTimer("check");
		spawnThem();
	}
}

function colourSwitch()
{
	switch(currentColour) {
		case 3:
			changePlayerColour(THEM, 4);
			currentColour = 4;
			break;
		case 4:
			changePlayerColour(THEM, 3);
			currentColour = 3;
			break;
		default:
			changePlayerColour(THEM, 3);
			currentColour = 3;
			break;
	}
}

function spawnThem()
{
	var droids = [cTempl.bubut, cTempl.bubut, cTempl.sart, cTempl.sart, cTempl.cybtf, cTempl.cybtf, cTempl.cybtf, cTempl.cybtf, cTempl.cybtf, cTempl.cybtf];

	camSendReinforcement(THEM, camMakePos(61, 115), droids, CAM_REINFORCE_GROUND);
	
	var theOne = addDroid(THEM, 60, 115, "NOT CANNON",
		"Body9REC", "tracked01", "", "", "Cannon375mmMk1");

	orderDroidLoc(theOne, DORDER_MOVE, 31, 20);

	addLabel(theOne, "theOnly");

	camSetArtifacts({
		"theOnly": { tech: "R-Wpn-Flame2" }
	});

	var messageID = camRand(3);
	switch(messageID) {
		case 0:
			camPlayVideos({video: "MSG1", type: MISS_MSG});
			queue("messageAlert", camSecondsToMilliseconds(0.2));
			break;
		case 1:
			camPlayVideos({video: "MSG2", type: MISS_MSG});
			queue("messageAlert", camSecondsToMilliseconds(0.2));
			break;
		case 2:
			camPlayVideos({video: "MSG3", type: MISS_MSG});
			queue("messageAlert", camSecondsToMilliseconds(0.2));
			break;
		default:
			camPlayVideos({video: "MSG1", type: MISS_MSG});
			queue("messageAlert", camSecondsToMilliseconds(0.2));
			break;
	}
}