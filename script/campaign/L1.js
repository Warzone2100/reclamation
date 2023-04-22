include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const PLAYER_RES = [
	"R-Wpn-MG1Mk1", "R-Vehicle-Body01", "R-Sys-Spade1Mk1", "R-Vehicle-Prop-Wheels",
	"R-Comp-SynapticLink", "R-Cyborg-Wpn-MG", "R-Cyb-Sys-Construct",
];
const SCAV_RES = [
	"R-Wpn-Flamer-Damage01", "R-Wpn-Cannon-Damage01",
];

// Player values
const NASDA = 1; // NASDA Base
const CYAN_SCAVS = 2; // Cyan Scavengers
const YELLOW_SCAVS = 3; // Yellow Scavengers

// Whether the player has been detected by either of the scavenger factions
var playerDetected = false;
// Whether the player can use the chat to change colors, disabled when capturing the NASDA base.
var allowColourChange = true;
// Changing the player's colour only updates playerData after save-loading or level progression.
// This variable is to make sure the transport correctly matches the player's colour on this level.
var playerColour;

// Damage NASDA structures
function preDamageNasdaStructs()
{
	var structures = enumStruct(NASDA);

	for (var i = 0; i < structures.length; ++i)
	{
		var struc = structures[i];
		// 60% to 90% base HP
		setHealth(struc, 60 + camRand(31));
	}
}

// This triggers when the player moves a droid into the NASDA base
camAreaEvent("captureZone", function(droid)
{
	// Give the player some power
	if (difficulty === HARD)
	{
		setPower(600, CAM_HUMAN_PLAYER);
	}
	else if (difficulty === INSANE)
	{
		setPower(300, CAM_HUMAN_PLAYER);
	}
	else
	{
		setPower(900, CAM_HUMAN_PLAYER);
	}

	camAbsorbPlayer(NASDA, CAM_HUMAN_PLAYER); // Give NASDA base to player
	changePlayerColour(NASDA, playerColour); // NASDA Base to player's colour

	var lz = getObject("LZ");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER); // Set up LZ

	camCallOnce("sendPlayerTransporter"); // Call in a truck transporter

	enableResearch("R-Sys-Engineering01", CAM_HUMAN_PLAYER); // "Find" Engineering upgrade in Research Facility

	queue("researchFlash", camSecondsToMilliseconds(1));

	// Tell the player to use the inbound trucks
	camPlayVideos(["pcv621.ogg", {video: "L1_BASEMSG", type: MISS_MSG}]);
	queue("messageAlert", camSecondsToMilliseconds(3.4));

	// Activate scavenger factories after a 35 second delay
	queue("expandMap", camSecondsToMilliseconds(35));

	// Remove the beacon over the NASDA base
	hackRemoveMessage("NASDA_BASE", PROX_MSG, CAM_HUMAN_PLAYER);

	// Re-damage the NASDA base (because apparently donating structures resets health)
	queue("reDamageNasdaStructs", camSecondsToMilliseconds(0.25));

	// Don't let the player change colors anymore
	allowColourChange = false;
});

// Damage NASDA structures again (because apparently donating structures resets health)
function reDamageNasdaStructs()
{
	var structures = enumStruct(CAM_HUMAN_PLAYER);

	for (var i = 0; i < structures.length; ++i)
	{
		var struc = structures[i];
		// 60% to 90% base HP
		setHealth(struc, 60 + camRand(31));
	}
}

// Make the research button flash
function researchFlash()
{
	setReticuleFlash(2, true);
}

// This triggers when the player moves a droid into river town area
camAreaEvent("townMsg", function(droid)
{
	// Only trigger if the player move a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Tell the player about the scavengers fighting in the town
		camPlayVideos({video: "L1_TOWNMSG", type: MISS_MSG});
		queue("messageAlert", camSecondsToMilliseconds(0.2));
	}
	else
	{
		resetLabel("townMsg", CAM_HUMAN_PLAYER);
	}
});

function expandMap()
{
	// Reveal the whole map.
	setScrollLimits(0, 0, 64, 64);

	// Set up victory conditions (kill everything... you know, the usual)
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "L2S", {
		callback: "checkMissileSilos"
	});

	setMissionTime(camMinutesToSeconds(60)); // Set mission timer to 60 minutes

	camSetExtraObjectiveMessage(_("Defend the missile silos"));

	// Enable scavenger factories (leaving out the second yellow scav factory for now)
	camEnableFactory("yScavFactory1");
	camEnableFactory("cScavFactory");

	// The player will automatically be detected after some time 
	setTimer("yScavPlayerDetected", camMinutesToMilliseconds(8));
	setTimer("cScavPlayerDetected", camMinutesToMilliseconds(12));

	// Tell the player to go and kill all the scavs
	// (and defend the base)
	camPlayVideos({video: "L1_SCAVMSG", type: MISS_MSG});
	queue("messageAlert", camSecondsToMilliseconds(0.2));
}

// This is used to start make scavengers "detect" the player once they're attacked
function eventAttacked(victim, attacker) 
{
	if (!camDef(victim) || !victim || victim.player === CAM_HUMAN_PLAYER)
	{
		return;
	}
	if (victim.player === CYAN_SCAVS && attacker.player === CAM_HUMAN_PLAYER && !playerDetected)
	{
		camCallOnce("cScavDetectCountdown");
		return;
	}
	if (victim.player === YELLOW_SCAVS && attacker.player === CAM_HUMAN_PLAYER && !playerDetected)
	{
		camCallOnce("yScavDetectCountdown");
		return;
	}
}

// Give the landed trucks to the player
function eventTransporterLanded(transport)
{
	// Count all "NASDA" units
	var units = enumDroid(NASDA);

	for (var i = 0, len = units.length; i < len; i++)
	{
		var droid = units[i];
		if (!camIsTransporter(droid)) // Give every unit that isn't a transport
		{
			donateObject(droid, CAM_HUMAN_PLAYER);
		}
	}
}

// Overwrite the long detection timers with much shorter ones.
// This happens if any scavengers are attacked by the player.
function cScavDetectCountdown()
{
	removeTimer("cScavPlayerDetected");
	setTimer("cScavPlayerDetected", camSecondsToMilliseconds(30));
}

function yScavDetectCountdown()
{
	removeTimer("yScavPlayerDetected");
	setTimer("yScavPlayerDetected", camSecondsToMilliseconds(30));
}

// The player has been detected by the yellow scavengers:
function yScavPlayerDetected()
{
	removeTimer("yScavPlayerDetected");

	// Tell the player that they've been detected if they haven't already recieved a message before.
	// Also disable the cyan factory so it doesn't fill the town area with units
	if (!playerDetected)
	{
		camSetFactories({"cScavFactory": {}}); // Clears factory data (disabling the factory)

		camPlayVideos({video: "L1_DETMSG", type: MISS_MSG});
		queue("messageAlert", camSecondsToMilliseconds(0.2));
		playerDetected = true;
	}

	// Set the first yellow factory to attack the player (if it still exists)
	camSetFactories({
		"yScavFactory1": {
			assembly: "yScavAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.trike, cTempl.bloke ]
		}
	});

	// Enable both yellow factories
	camEnableFactory("yScavFactory1");
	camEnableFactory("yScavFactory2");
}

// The player has been detected by the cyan scavengers:
function cScavPlayerDetected()
{
	removeTimer("cScavPlayerDetected");

	// Tell the player that they've been detected if they haven't already recieved a message before.
	// Also disable the yellow factory so it doesn't fill the town area with units
	if (!playerDetected)
	{
		camSetFactories({"yScavFactory1": {}}); // Clears factory data (disabling the factory)

		camPlayVideos({video: "L1_DETMSG", type: MISS_MSG});
		queue("messageAlert", camSecondsToMilliseconds(0.2));
		playerDetected = true;
	}

	// Set the cyan factory to attack the player (if it still exists)
	camSetFactories({
		"cScavFactory": {
			assembly: "cScavAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(13)),
			data: {
				morale: 50,
				fallback: camMakePos("cScavAssembly"),
				regroup: true,
				count: -1,
			},
			templates: [ cTempl.bjeep, cTempl.bloke, cTempl.rbjeep, cTempl.bloke ]
		},
	});

	// Enable the cyan factory
	camEnableFactory("cScavFactory");
}

// This triggers when the player moves a droid near the east wall
camAreaEvent("wallMsg", function(droid)
{
	// Tell the player to break through the wall
	camPlayVideos({video: "L1_WALLMSG", type: MISS_MSG});
	queue("messageAlert", camSecondsToMilliseconds(0.2));
});

function sendPlayerTransporter()
{
	var trucks = [cTempl.truck, cTempl.truck, cTempl.truck, cTempl.truck]; // 4 trucks

	camSendReinforcement(NASDA, camMakePos("LZ"), trucks,
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 2, y: 2 },
			exit: { x: 2, y: 2 }
		}
	);
}

function enableBaseStructures()
{
	const STRUCTS = [
		"A0CommandCentre", "A0PowerGenerator", "A0ResourceExtractor",
		"A0ResearchFacility", "A0LightFactory", "A0CyborgFactory",
	];

	for (var i = 0; i < STRUCTS.length; ++i)
	{
		enableStructure(STRUCTS[i], CAM_HUMAN_PLAYER);
	}
}

// This function is called after a video is played, a delay is required for the 'alert' sound to play properly in all cases
function messageAlert()
{
	playSound("beep7.ogg"); // Play a little noise to notify the player that they have a new message
}

// Check to make sure at least 1 silo still exists.
function checkMissileSilos()
{
	if (!countStruct("NX-CruiseSite", CAM_HUMAN_PLAYER))
	{
		return false;
	}
	else
		return true;
}

// Allow the player to change to colors that are hard-coded to be unselectable
function eventChat(from, to, message)
{
	var colour = 0;
	switch (message)
	{
		case "green me":
			colour = 0; // Green
			break;
		case "orange me":
			colour = 1; // Orange
			break;
		case "grey me":
		case "gray me":
			colour = 2; // Gray
			break;
		case "black me":
			colour = 3; // Black
			break;
		case "red me":
			colour = 4; // Red
			break;
		case "blue me":
			colour = 5; // Blue
			break;
		case "pink me":
			colour = 6; // Pink
			break;
		case "aqua me":
		case "cyan me":
			colour = 7; // Cyan
			break;
		case "yellow me":
			colour = 8; // Yellow
			break;
		case "purple me":
			colour = 9; // Purple
			break;
		case "white me":
			colour = 10; // White
			break;
		default:
			return; // Some other message
	}

	if (allowColourChange) // Only let the player change colors before capturing the NASDA base.
	{
		playerColour = colour;
		changePlayerColour(CAM_HUMAN_PLAYER, colour);

		// Make sure the scavengers aren't choosing conflicting colours with the player
		if (colour === 7)
		{
			changePlayerColour(CYAN_SCAVS, 0); // Switch to green
		}
		else
		{
			changePlayerColour(CYAN_SCAVS, 7); // Keep as cyan
		}

		if (colour === 8)
		{
			changePlayerColour(YELLOW_SCAVS, 1); // Switch to orange
		}
		else
		{
			changePlayerColour(YELLOW_SCAVS, 8); // Keep as yellow
		}

		playSound("beep6.ogg");
	}
	else
	{
		playSound("beep8.ogg");
	}	
}

function eventStartLevel()
{
	playerColour = playerData[0].colour;

	// Make sure the scavengers aren't choosing conflicting colours with the player
	if (playerColour !== 7)
	{
		changePlayerColour(CYAN_SCAVS, 7); // Primary scavengers to cyan
	}
	else
	{
		changePlayerColour(CYAN_SCAVS, 0); // Switch to green if player is already cyan
	}

	if (playerColour !== 8)
	{
		changePlayerColour(YELLOW_SCAVS, 8); // Secondary scavengers to yellow
	}
	else
	{
		changePlayerColour(YELLOW_SCAVS, 1); // Switch to orange if player is already yellow
	}
	changePlayerColour(NASDA, 10); // NASDA Base to white (it doesn't really matter if the player is already white)

	// Make extra sure no one attacks the base before it's captured 
	setAlliance(CYAN_SCAVS, NASDA, true);
	setAlliance(YELLOW_SCAVS, NASDA, true);
	setAlliance(CAM_HUMAN_PLAYER, NASDA, true);

	// Restrict the map for now.
	setScrollLimits(0, 0, 64, 30);

	var startpos = getObject("startPosition");
	centreView(startpos.x, startpos.y);

	enableBaseStructures(); // Allow the player to build base structures (Command Center, Factory, etc.)
	camCompleteRequiredResearch(PLAYER_RES, CAM_HUMAN_PLAYER); // Give starting tech
	camCompleteRequiredResearch(SCAV_RES, CYAN_SCAVS); // Give scavengers weapon upgrades
	camCompleteRequiredResearch(SCAV_RES, YELLOW_SCAVS);

	// Give player briefing.
	camPlayVideos({video: "L1_BRIEF", type: MISS_MSG});
	queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Set artifact placement
	camSetArtifacts({
		"yScavFactory1": { tech: "R-Wpn-MG-Damage01" }, // Hardened MG Bullets
		"yScavFactory2": { tech: "R-Wpn-Rocket05-MiniPod" }, // Mini-Rocket Pod
		"cScavFactory": { tech: "R-Vehicle-Prop-Tracks" }, // Tracked Propulsion
		"cScavSensor": { tech: "R-Sys-Sensor-Turret01" }, // Sensor Turret
	});

	// Set up bases
	camSetEnemyBases({
		"SensorOutpost": {
			cleanup: "cScavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"BridgeDefences": {
			cleanup: "cScavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"CyanBase": {
			cleanup: "cScavBase3",
			detectMsg: "CSCAV_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"GasStation": {
			cleanup: "yScavBase1",
			detectMsg: "YSCAV_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"YellowBase": {
			cleanup: "yScavBase2",
			detectMsg: "YSCAV_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
	});

	// Set up factories
	camSetFactories({
		"yScavFactory1": {
			assembly: "yScavAssembly1",
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("scavPatrol1"),
					camMakePos("scavPatrol2"),
				],
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			templates: [ cTempl.trike, cTempl.bloke ]
		},
		// This factory only activates when the player is detected
		"yScavFactory2": {
			assembly: "yScavAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 4,
			maxSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			templates: [ cTempl.bloke, cTempl.trike, cTempl.bloke, cTempl.buggy ]
		},
		"cScavFactory": {
			assembly: "cScavAssembly",
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("scavPatrol1"),
					camMakePos("scavPatrol2"),
				],
			},
			groupSize: 4,
			maxSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.bjeep, cTempl.bloke, cTempl.bloke ]
		},
	});

	// Place a beacon on the NASDA base
	hackAddMessage("NASDA_BASE", PROX_MSG, CAM_HUMAN_PLAYER);

	// Set the fog to it's default colours
	camSetFog(182, 225, 236);

	// All NASDA structures start out partially damaged
	preDamageNasdaStructs();

	// Replace the scav's sensor tower with its rusty version
	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", CYAN_SCAVS);
}
