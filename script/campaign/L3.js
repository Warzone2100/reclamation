include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

// Player values
const MIS_DUMMY_TRANSPORT = 1; // "Fake" transport at beginning of the level
const MIS_CYAN_SCAVS = 2; // Cyan Scavengers
const MIS_YELLOW_SCAVS = 3; // Yellow Scavengers

var waveNum = 1; // How many scavenger attack waves have occured

const mis_yellowScavRes = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01",
];
const mis_cyanScavRes = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01",
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

	resetLabel("heliRemoveZone", MIS_CYAN_SCAVS);
});

// Enable the mountain base factory after the player gets over the ramp
camAreaEvent("mointainBaseTrigger", function(droid)
{
	camEnableFactory("cScavFactory2");
});

//Setup helicopter attacks.
function heliAttack()
{
	const list = [cTempl.helcan, cTempl.helhmg];
	const ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: getObject("startPosition")
	};

	// A helicopter will attack the player every 3 minutes.
	// The helicopter attacks stop when the VTOL radar tower is destroyed.
	camSetVtolData(MIS_CYAN_SCAVS, "heliSpawn", "heliExit", list, camChangeOnDiff(camMinutesToMilliseconds(3)), "radarTower", ext);
}

// Check if we can expand the map
function expandMapCheck()
{
	if (enumArea(0, 0, 64, 60, MIS_CYAN_SCAVS, false).length == 0)
	{
		// No attacking scavs left, expand the map
		camCallOnce("expandMap");
	}
	else
	{
		// Some attackers remain, check again later...
		queue("expandMapCheck", camSecondsToMilliseconds(3));
	}
}

function expandMap()
{
	// Remove the scav attack beacons
	hackRemoveMessage("WEST_ATTACK", PROX_MSG, CAM_HUMAN_PLAYER);
	hackRemoveMessage("EAST_ATTACK", PROX_MSG, CAM_HUMAN_PLAYER);

	// Set the mission time to its actual allotment
	// Also set up cranes on timerless mode
	if (tweakOptions.rec_timerlessMode)
	{
		switch (difficulty)
		{
			case INSANE:
				// Cranes for the mortars on the ridge
				camManageTrucks(
					MIS_CYAN_SCAVS, {
						label: "mortarRidge",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(100)),
						template: cTempl.crane,
						structset: camAreaToStructSet("cScavBase3")
				});
			case HARD: // NOTE: Fall-through here! We still add Cranes from lower difficulties!
				// Crane for the ramp defenses
				camManageTrucks(
					MIS_CYAN_SCAVS, {
						label: "rampDefenses",
						rebuildBase: (difficulty === INSANE),
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(90)),
						template: cTempl.crane,
						structset: camAreaToStructSet("cScavBase2")
				});
			case MEDIUM:
				// Crane for the west cyan base
				camManageTrucks(
					MIS_CYAN_SCAVS, {
						label: "factoryZone",
						rebuildBase: false, // Cranes would have to go around the whole map to get back here
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("cScavBase1")
				});
			default:
				// Cranes for the southernmost cyan bases
				camManageTrucks(
					MIS_CYAN_SCAVS, {
						label: "mountainBase",
						rebuildBase: (difficulty >= MEDIUM),
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("cScavBase4")
				});
				camManageTrucks(
					MIS_CYAN_SCAVS, {
						label: "cityBase",
						rebuildBase: (difficulty >= MEDIUM),
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("cScavBase5")
				});
		}
	}
	else
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(90)));
	}

	// Fully expand the map
	setScrollLimits(0, 0, 64, 128);

	// Tell the player to go kill everything again
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "L3_KILLMSG", type: MISS_MSG}]);

	// Setup patrol groups and repeating helicopter attacks
	activateScavGroups();
	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(3)));

	// Enable all cyan factories except the mountain base one (for now)
	camEnableFactory("cScavFactory1");
	camEnableFactory("cScavFactory3");

	// HACK: Move the sun's position to remove the lingering shadow effect from the map border
	camSetSunPos(450.0, -400.0, 225.1);
}

// Send scavenger attack waves
function sendScavAttackWaves()
{
	let westDroids;
	let eastDroids;

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
		camSendReinforcement(MIS_CYAN_SCAVS, camMakePos("westAttackPos"), westDroids,
			CAM_REINFORCE_GROUND, {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}});

		camSendReinforcement(MIS_CYAN_SCAVS, camMakePos("eastAttackPos"), eastDroids,
			CAM_REINFORCE_GROUND, {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}});
	}

	// Only on the final wave
	if (waveNum === 3)
	{
		// Send the attack chopper
		camSendReinforcement(MIS_CYAN_SCAVS, camMakePos("heliAttackPos"), [cTempl.helcan],
			CAM_REINFORCE_GROUND, {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}});

		// Spawn no more waves, and queue up the map expansion
		removeTimer("sendScavAttackWaves");
		queue("expandMapCheck", camSecondsToMilliseconds(30));
	}

	++waveNum;
}

function camEnemyBaseDetected_scavHideout()
{
	camCallOnce("activateYellowScavs");
}

function camEnemyBaseDetected_rampDefenses()
{
	camCallOnce("activateYellowScavs");
}

function camEnemyBaseDetected_mountainBase()
{
	// Tell the player to destroy the scavenger's VTOL tower
	camQueueDialogue([
		{text: "CLAYDE: Commander, those scavenger helicopters are flying in from an off-site location.", delay: 0, sound: CAM_RCLICK},
		{text: "CLAYDE: These scavengers must be coordinating their attacks from a relay located nearby.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Look for some sort of radar structure or device.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: If you can disrupt their communications,", delay: 2, sound: CAM_RCLICK},
		{text: "they should be unable to coordinate any more air attacks. ", delay: 0},
	]);
}

function activateYellowScavs()
{
	camEnableFactory("yScavFactory");
	setAlliance(MIS_YELLOW_SCAVS, MIS_CYAN_SCAVS, false);
}

// These are all defence/patrol groups of units
function activateScavGroups()
{
	camManageGroup(camMakeGroup("factoryDefenceGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("factoryDefencePos"),
			camMakePos("factoryDefenceGroup"),
		],
		interval: camSecondsToMilliseconds(20),
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
	const transportExit = getObject("transportRemoveZone");
	const transport = enumDroid(MIS_DUMMY_TRANSPORT);
	orderDroidLoc(transport[0], DORDER_MOVE, transportExit.x, transportExit.y);
	queue("removeTransport", camSecondsToMilliseconds(5));

	// Tell the player about incoming scavs
	camPlayVideos([cam_sounds.incoming.incomingIntelligenceReport, {video: "L3_ATTACKMSG", type: MISS_MSG}]);

	// Send the first attack wave after a delay, and cue up additional waves
	queue("sendScavAttackWaves", camSecondsToMilliseconds(5));
	setTimer("sendScavAttackWaves", camSecondsToMilliseconds(30));
}

// Remove the dummy transport
function removeTransport()
{
	const transport = enumDroid(MIS_DUMMY_TRANSPORT);
	camSafeRemoveObject(transport[0], false);
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
	const startpos = getObject("startPosition");
	const lz = getObject("LZ");

   	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "L4S", {
		callback: "checkMissileSilos"
	});
	camSetExtraObjectiveMessage(_("Defend the missile silos"));

	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(45))); // For the beginning "mission".
	}
	else
	{
		setMissionTime(-1);
	}
	
	// Setup lz and starting camera
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Give research upgrades to scavs, the cyan scavs also get armor upgrades
	camCompleteRequiredResearch(mis_cyanScavRes, MIS_CYAN_SCAVS);
	camCompleteRequiredResearch(mis_yellowScavRes, MIS_YELLOW_SCAVS); 

	camSetArtifacts({
		"cScavFactory1": { tech: "R-Wpn-MG2Mk1" }, // Twin Machinegun
		"cScavFactory2": { tech: "R-Wpn-Flamer01Mk1" }, // Flamer
		"cScavFactory3": { tech: "R-Vehicle-Metals01" }, // Composite Alloys
	});

	camSetEnemyBases({
		"scavHideout": {
			cleanup: "yScavBase",
			detectMsg: "YSCAV_BASE",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"factoryZone": {
			cleanup: "cScavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"rampDefenses": {
			cleanup: "cScavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"mortarRidge": {
			cleanup: "cScavBase3",
			detectMsg: "CSCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"mountainBase": {
			cleanup: "cScavBase4",
			detectMsg: "CSCAV_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"cityBase": {
			cleanup: "cScavBase5",
			detectMsg: "CSCAV_BASE5",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		}
	});

	let templates1 = [cTempl.bloke, cTempl.lance, cTempl.bjeep, cTempl.buscan, cTempl.rbjeep, cTempl.lance, cTempl.minitruck];
	let templates3 = [cTempl.bloke, cTempl.bjeep, cTempl.moncan, cTempl.rbjeep, cTempl.lance, cTempl.monhmg];
	if (difficulty >= HARD)
	{
		// Armor-up the city factory blokes
		templates3 = camArrayReplaceWith(templates3, cTempl.bloke, cTempl.kevbloke);
		templates3 = camArrayReplaceWith(templates3, cTempl.lance, cTempl.kevlance);
		if (difficulty >= INSANE)
		{
			// Armor-up the eastern factory blokes
			templates1 = camArrayReplaceWith(templates1, cTempl.bloke, cTempl.kevbloke);
			templates1 = camArrayReplaceWith(templates1, cTempl.lance, cTempl.kevlance);
		}
	}
	camSetFactories({
		"yScavFactory": {
			assembly: "yScavAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
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
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: templates1 // Variety
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
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.kevbloke, cTempl.minitruck, cTempl.bjeep, cTempl.buscan, cTempl.rbjeep, cTempl.kevlance, cTempl.firetruck] // Mix of light and heavy vehicles
		},
		"cScavFactory3": {
			assembly: "cScavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				morale: 40,
				fallback: camMakePos("cScavAssembly3"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: templates3 // Mostly light units, but will also build monster bus tanks
		}
	});

	// Give player briefing about finding the research facility.
	camPlayVideos({video: "L3_BRIEF", type: MISS_MSG});

	// Set dummy transport colour to match the player, and ally it to the player
	changePlayerColour(MIS_DUMMY_TRANSPORT, playerData[0].colour);
	setAlliance(MIS_DUMMY_TRANSPORT, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_YELLOW_SCAVS, MIS_CYAN_SCAVS, true); // Just so the cyan scavs don't get distracted from attacking the player

	// Place a dummy transport on the LZ
	addDroid(MIS_DUMMY_TRANSPORT, 31, 20, "Transport", "TransporterBody", "V-Tol", "", "", "MG3-VTOL");

	queue("startScavAttack", camSecondsToMilliseconds(12));

	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_CYAN_SCAVS);
	camUpgradeOnMapStructures("Sys-VTOL-RadarTower01", "Sys-VTOL-RustyRadarTower01", MIS_CYAN_SCAVS);

	camAutoReplaceObjectLabel("radarTower");

	// Restrict the map to the original level for now
	setScrollLimits(0, 0, 64, 64);

	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
}
