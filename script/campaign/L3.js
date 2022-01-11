include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

// Player values
const DUMMY_TRANSPORT = 1; // "Fake" transport at beginning of the level
const CYAN_SCAVS = 2; // Cyan Scavengers
const YELLOW_SCAVS = 3; // Yellow Scavengers

var waveNum = 1; // How many scavenger attack waves have occured

const YELLOW_SCAV_RES = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02",
];
const CYAN_SCAV_RES = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];

//Remove scav helicopters.
camAreaEvent("heliRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		if (isVTOL(droid))
		{
			camSafeRemoveObject(droid, false);
		}
	}

	resetLabel("heliRemoveZone", CYAN_SCAVS);
});

// Enable the mountain base factory after the player gets over the ramp
camAreaEvent("mointainBaseTrigger", function(droid)
{
	camEnableFactory("cScavFactory2");
});

// This function is called after a video is played, a delay is required for the 'alert' sound to play properly in all cases
function messageAlert()
{
	playSound("beep7.ogg"); // Play a little noise to notify the player that they have a new message
}

//Setup helicopter attacks.
function heliAttack()
{
	var list = [cTempl.helcan, cTempl.helhmg];
	var ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0
	};

	// A helicopter will attack the player every 3 minutes.
	// The helicopter attacks stop when the VTOL radar tower is destroyed.
	camSetVtolData(CYAN_SCAVS, "heliSpawn", "heliExit", list, camChangeOnDiff(camMinutesToMilliseconds(3)), "radarTower", ext);
}

function expandMap()
{
	// Remove the scav attack beacons
	hackRemoveMessage("WEST_ATTACK", PROX_MSG, CAM_HUMAN_PLAYER);
	hackRemoveMessage("EAST_ATTACK", PROX_MSG, CAM_HUMAN_PLAYER);

	// Set the mission time to it's actual allotment
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(90)));

	// Fully expand the map
	setScrollLimits(0, 0, 64, 128);

	// Tell the player to go kill everything again
	camPlayVideos(["pcv455.ogg", {video: "L3_KILLMSG", type: MISS_MSG}]);
	queue("messageAlert", camSecondsToMilliseconds(3.4));

	// Setup patrol groups and repeating helicopter attacks
	activateScavGroups();
	heliAttack();

	// Enable all factories except the mountain base one (for now)
	camEnableFactory("yScavFactory");
	camEnableFactory("cScavFactory1");
	camEnableFactory("cScavFactory3");
}

// Send scavenger attack waves
function sendScavAttackWaves()
{
	var westDroids;
	var eastDroids;

	switch(waveNum)
	{
		case 1:
			// First wave contains mostly infantry + monster bus tanks
			westDroids = [cTempl.bloke, cTempl.bloke, cTempl.bloke, cTempl.bloke, cTempl.lance, cTempl.lance, cTempl.moncan];
			eastDroids = [cTempl.bloke, cTempl.bloke, cTempl.bloke, cTempl.bjeep, cTempl.rbjeep, cTempl.lance, cTempl.moncan];
			break;
		case 2:
			// Second wave contains variety of light + medium units
			westDroids = [cTempl.bloke, cTempl.bloke, cTempl.bjeep, cTempl.rbjeep, cTempl.rbjeep, cTempl.buscan];
			eastDroids = [cTempl.bloke, cTempl.bjeep, cTempl.bjeep, cTempl.minitruck, cTempl.lance, cTempl.firetruck];
			break;
		case 3:
			// Third wave contains only infantry, also spawns a helicopter
			westDroids = [cTempl.bloke, cTempl.bloke, cTempl.bloke, cTempl.lance, cTempl.lance];
			eastDroids = [cTempl.bloke, cTempl.bloke, cTempl.bloke, cTempl.lance, cTempl.lance];
			break;
		default:
			westDroids = [];
			eastDroids = [];
	}

	// Place beacons on the first wave 
	if (waveNum === 1)
	{
		hackAddMessage("WEST_ATTACK", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("EAST_ATTACK", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	if (waveNum < 4)
	{
		camSendReinforcement(CYAN_SCAVS, camMakePos("westAttackPos"), westDroids,
			CAM_REINFORCE_GROUND, {
				data: {regroup: true, count: -1,},
			}
		);

		camSendReinforcement(CYAN_SCAVS, camMakePos("eastAttackPos"), eastDroids,
			CAM_REINFORCE_GROUND, {
				data: {regroup: true, count: -1,},
			}
		);
	}

	// Only on the final wave
	if (waveNum === 3)
	{
		// Send the attack chopper
		camSendReinforcement(CYAN_SCAVS, camMakePos("heliAttackPos"), [cTempl.helcan],
			CAM_REINFORCE_GROUND, {
				data: {regroup: false, count: -1,},
			}
		);

		// Spawn no more waves, and queue up the map expansion
		removeTimer("sendScavAttackWaves");
		queue("expandMap", camSecondsToMilliseconds(30));
	}

	++waveNum
}

function camEnemyBaseDetected_ScavHideout()
{
	camEnableFactory("yScavFactory");
}

// These are all defence/patrol groups of units
function activateScavGroups()
{
	camManageGroup(camMakeGroup("factoryDefenceGroup"), CAM_ORDER_DEFEND, {
		pos: camMakePos("factoryDefencePos"),
		radius: 3,
		regroup: false,
		count: -1
	});

	camManageGroup(camMakeGroup("marshPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("marshPatrolPos1"),
			camMakePos("marshPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(20),
		regroup: false,
		count: -1
	});

	camManageGroup(camMakeGroup("forestPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("forestPatrolPos1"),
			camMakePos("forestPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(20),
		regroup: false,
		count: -1
	});

	camManageGroup(camMakeGroup("mountainPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("mountainPatrolPos1"),
			camMakePos("mountainPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(20),
		regroup: false,
		count: -1
	});
}

// Give the player an intel report about incoming scavs
function startScavAttack()
{
	// Get the dummy transport to fly away
	var transportExit = getObject("transportRemoveZone");
	var transport = enumDroid(DUMMY_TRANSPORT);
	orderDroidLoc(transport[0], DORDER_MOVE, transportExit.x, transportExit.y);

	// Tell the player about incoming scavs
	camPlayVideos(["pcv456.ogg", {video: "L3_ATTACKMSG", type: MISS_MSG}]);
	queue("messageAlert", camSecondsToMilliseconds(3.4));

	// Send the first attack wave after a delay, and cue up additional waves
	queue("sendScavAttackWaves", camSecondsToMilliseconds(5));
	setTimer("sendScavAttackWaves", camSecondsToMilliseconds(30));
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

function eventStartLevel()
{
	var startpos = getObject("startPosition");
	var lz = getObject("LZ");

   	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "L4S", {
		callback: "checkMissileSilos"
	});
	camSetExtraObjectiveMessage("Defend the missile silos");
	setMissionTime(camChangeOnDiff(camMinutesToSeconds(45))); // For the beginning "mission".

	// Setup lz and starting camera
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Give research upgrades to scavs, the cyan scavs also get armor upgrades
	camCompleteRequiredResearch(CYAN_SCAV_RES, CYAN_SCAVS);
	camCompleteRequiredResearch(YELLOW_SCAV_RES, YELLOW_SCAVS); 

	camSetArtifacts({
		"cScavFactory1": { tech: "R-Wpn-Cannon1Mk1" }, // Light Cannon
		"cScavFactory2": { tech: "R-Wpn-Flamer01Mk1" }, // Flamer
		"cScavFactory3": { tech: "R-Wpn-MG-ROF01" }, // Chaingun Upgrade
	});

	camSetEnemyBases({
		"ScavHideout": {
			cleanup: "yScavBase",
			detectMsg: "YSCAV_BASE",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"FactoryZone": {
			cleanup: "cScavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"RampDefences": {
			cleanup: "cScavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"MortarRidge": {
			cleanup: "cScavBase3",
			detectMsg: "CSCAV_BASE3",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"MountainBase": {
			cleanup: "cScavBase4",
			detectMsg: "CSCAV_BASE4",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"CityBase": {
			cleanup: "cScavBase5",
			detectMsg: "CSCAV_BASE5",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		}
	});

	camSetFactories({
		"yScavFactory": {
			assembly: "yScavAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				pos: camMakePos("yScavAssembly"),
			},
			templates: [cTempl.bloke, cTempl.buggy, cTempl.lance, cTempl.trike]
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 60,
				fallback: camMakePos("cScavAssembly1"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.lance, cTempl.bjeep, cTempl.rbjeep, cTempl.lance, cTempl.minitruck] // Variety
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 40,
				fallback: camMakePos("cScavAssembly2"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.minitruck, cTempl.bjeep, cTempl.buscan, cTempl.rbjeep, cTempl.lance, cTempl.firetruck] // Mix of light and heavy vehicles
		},
		"cScavFactory3": {
			assembly: "cScavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			data: {
				morale: 40,
				fallback: camMakePos("cScavAssembly3"),
				regroup: true,
				count: -1,
			},
			// Mostly light units, but will also build monster bus tanks
			templates: [cTempl.bloke, cTempl.bjeep, cTempl.moncan, cTempl.rbjeep, cTempl.lance, cTempl.monhmg]
		}
	});

	// Give player briefing about finding the research facility.
	camPlayVideos({video: "L3_BRIEF", type: MISS_MSG});
	queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Set dummy transport colour to match the player, and ally it to the player
	changePlayerColour(DUMMY_TRANSPORT, playerData[0].colour);
	setAlliance(DUMMY_TRANSPORT, CAM_HUMAN_PLAYER, true);

	// Place a dummy transport on the LZ
	addDroid(DUMMY_TRANSPORT, 31, 20, "Transport", "TransporterBody", "V-Tol", "", "", "MG3-VTOL");

	queue("startScavAttack", camSecondsToMilliseconds(12));

	// Restrict the map to the original level for now
	setScrollLimits(0, 0, 64, 64);
}
