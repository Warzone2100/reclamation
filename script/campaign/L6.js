include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const SCAV_RES = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy01",
];
const INFESTED_RES = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];

// Player values
const AMBIENT = 1;
const CYAN_SCAVS = 2;
const INFESTED = 4;

// Keep track of how many waves have spawned for the second part of the level
var numWaves = 0;
var wavePhase = false;

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

// This function is called after a video is played, a delay is required for the 'alert' sound to play properly in all cases
function messageAlert()
{
	playSound("beep7.ogg"); // Play a little noise to notify the player that they have a new message
}

// Damage infested structures
function preDamageInfestedStructs()
{
	var structures = enumStruct(INFESTED);

	for (var i = 0; i < structures.length; ++i)
	{
		var struc = structures[i];
		// 60% to 90% base HP
		setHealth(struc, 60 + camRand(31));
	}
}

// Triggered when approaching the western infested base
camAreaEvent("infestedAttackTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Activate both infested factories and the western scav factory
		camEnableFactory("westInfestedFactory");
		camEnableFactory("northInfestedFactory");
		camEnableFactory("westScavFactory");

		// Start sending infested waves from the west and north entrances
		setTimer("westInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(45)));
		setTimer("northInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(45)));

		// Message the player about infested outside of the area
		camPlayVideos(["pcv456.ogg", {video: "L6_INFESMSG", type: MISS_MSG}]);
		queue("messageAlert", camSecondsToMilliseconds(3.4));
	}
	else
	{
		resetLabel("infestedAttackTrigger", CAM_HUMAN_PLAYER);
	}
});

function westInfestedReinforcements()
{
	// Stop if the infested factory was destroyed, or if the level is in it's ending phase
	if (getObject("westInfestedFactory") === null || wavePhase)
	{
		removeTimer("westInfestedReinforcements");
		return;
	}

	var droids = [cTempl.stinger, cTempl.inffiretruck, cTempl.infbuscan, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infbloke];

	camSendReinforcement(INFESTED, camMakePos("wHighwayEntry"), randomTemplates(droids),
		CAM_REINFORCE_GROUND, {
			data: {regroup: false, count: -1,},
		}
	);
}

function northInfestedReinforcements()
{
	// Stop if the infested factory was destroyed, or if the level is in it's ending phase
	if (getObject("northInfestedFactory") === null || wavePhase)
	{
		removeTimer("northInfestedReinforcements");
		return;
	}

	var droids = [cTempl.stinger, cTempl.boomtick, cTempl.infminitruck, cTempl.inftrike, cTempl.infrbuggy, cTempl.inflance];

	camSendReinforcement(INFESTED, camMakePos("nRoadEntry"), randomTemplates(droids),
		CAM_REINFORCE_GROUND, {
			data: {regroup: false, count: -1,},
		}
	);
}

// Triggered when following the highway to the east
camAreaEvent("boomTickTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Send a small infested group against the player
		var droids = [cTempl.vilestinger, cTempl.boomtick, cTempl.boomtick, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infciv]; 

		camSendReinforcement(INFESTED, camMakePos("eHighwayEntry"), droids, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_ATTACK,
		data: { regroup: false, count: -1 }
		});
	}
	else
	{
		resetLabel("boomTickTrigger", CAM_HUMAN_PLAYER);
	}
});

// Triggered when moving north along the road towards the scavenger bases
camAreaEvent("scavAttackTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Enable the remaining scav factories
		camEnableFactory("nwScavFactory1");
		camEnableFactory("nwScavFactory2");
		camEnableFactory("eastScavFactory");

		// Start sending helicopters from the west (immediately)
		westHeliAttack();
	}
	else
	{
		resetLabel("scavAttackTrigger", CAM_HUMAN_PLAYER);
	}
});

// Helicopter attack waves from the northwestern side of the map
function westHeliAttack()
{
	var list = [cTempl.helhmg, cTempl.helcan];
	var ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0
	};

	// The helicopter attacks stop when the northwest VTOL radar tower is destroyed.
	camSetVtolData(CYAN_SCAVS, "nwHeliSpawn", "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "nwRadarTower", ext);
}

// Helicopter attack waves from the eastern side of the map
function eastHeliAttack()
{
	var list = [cTempl.helcan, cTempl.helhmg];
	var ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0
	};

	// The helicopter attacks stop when the east VTOL radar tower is destroyed.
	camSetVtolData(CYAN_SCAVS, "eHeliSpawn", "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "eRadarTower", ext);
}

// Set up scav patrols around the map
function scavPatrolSetUp()
{
	// South patrol
	camManageGroup(camMakeGroup("scavSouthPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southPatrolPos1"),
			camMakePos("southPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(20)
	});

	// West mountain patrol
	camManageGroup(camMakeGroup("wPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("wPatrolPos1"),
			camMakePos("wPatrolPos2"),
			camMakePos("wPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(15)
	});

	// North West base patrol
	camManageGroup(camMakeGroup("nwPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("nwPatrolPos1"),
			camMakePos("nwPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(10)
	});

	// North East patrol
	camManageGroup(camMakeGroup("nePatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("nePatrolPos1"),
			camMakePos("nePatrolPos2"),
		],
		interval: camSecondsToMilliseconds(20)
	});

	// East Base patrol
	camManageGroup(camMakeGroup("ePatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("ePatrolPos1"),
			camMakePos("ePatrolPos2"),
		],
		interval: camSecondsToMilliseconds(10)
	});
}

// Check if there are any remaining AA emplacements
function checkAA()
{
	if (!countStruct("AASite-QuadBof", CYAN_SCAVS))
	{
		return true; // None remaining
	}
}

// Start the next phase of the level if the player has collected all artifacts and destroyed all AA
function checkForLZReturn()
{
	if (camAllArtifactsPickedUp() && checkAA())
	{
		removeTimer("checkForLZReturn");

		// Set the mission to timer to 10 minutes and get ready to start sending waves of infested
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(10)));
		setTimer("infestedEndWaves", camChangeOnDiff(camSecondsToMilliseconds(20)));
		wavePhase = true;

		// Give a message about the imminent infested waves
		camPlayVideos(["pcv456.ogg", {video: "L6_WAVEMSG", type: MISS_MSG}]);
		queue("messageAlert", camSecondsToMilliseconds(3.4));
		camSetExtraObjectiveMessage("Escape the incoming infested waves");

		// Change the fog colour to a dark purple
		camSetFog(114, 73, 156);
	}
}

// Large waves of infested that appear after the main objective is complete
function infestedEndWaves()
{
	numWaves++;

	/*
		The waves of infested will start spawning from the various map "entrances" after the player finishes the main mission objectives
		Waves will spawn from more locations the longer the player spends on the map
		> Waves 1+ will spawn from the entrances inside the northwest scav base and the northeast scav outpost
		> Waves 6+ will spawn additional waves from outside the northwest scav base and from the northern road
		> Waves 12+ will spawn additional waves from the west and east highway entrances
	*/

	// Each entrance has it's own "core" unit compositions, with a bunch of Infested Civilians added on top:
	var nwBaseDroids = [cTempl.stinger, cTempl.stinger, cTempl.infbloke, cTempl.infbloke, cTempl.inflance, cTempl.infbuggy];
	var neRoadDroids = [cTempl.stinger, cTempl.stinger, cTempl.infbuggy, cTempl.infbuggy, cTempl.infrbuggy, cTempl.inftrike];

	var nwRoadDroids = [cTempl.inftrike, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infbuscan, cTempl.inffiretruck];
	var nRoadDroids = [cTempl.infmoncan, cTempl.infbuscan, cTempl.inffiretruck, cTempl.boomtick, cTempl.infbloke, cTempl.infbloke];

	var wHighwayDroids = [cTempl.stinger, cTempl.infbjeep, cTempl.infrbjeep, cTempl.infminitruck, cTempl.infbloke, cTempl.inflance];
	var eHighwayDroids = [cTempl.stinger, cTempl.infbjeep, cTempl.infrbjeep, cTempl.infsartruck, cTempl.infbloke, cTempl.inflance];

	camSendReinforcement(INFESTED, camMakePos("nwBaseEntry"), randomTemplates(nwBaseDroids), CAM_REINFORCE_GROUND, {});
	camSendReinforcement(INFESTED, camMakePos("neRoadEntry"), randomTemplates(neRoadDroids), CAM_REINFORCE_GROUND, {});

	if (numWaves > 5)
	{
		camSendReinforcement(INFESTED, camMakePos("nwRoadEntry"), randomTemplates(nwRoadDroids), CAM_REINFORCE_GROUND, {});
		camSendReinforcement(INFESTED, camMakePos("nRoadEntry"), randomTemplates(nRoadDroids), CAM_REINFORCE_GROUND, {});
	}
	if (numWaves > 11)
	{
		camSendReinforcement(INFESTED, camMakePos("wHighwayEntry"), randomTemplates(wHighwayDroids), CAM_REINFORCE_GROUND, {});
		camSendReinforcement(INFESTED, camMakePos("eHighwayEntry"), randomTemplates(eHighwayDroids), CAM_REINFORCE_GROUND, {});
	}
	if (numWaves === 12)
	{
		// Give the player an angry message about how slow they are
		camPlayVideos({video: "L6_SCOLDMSG", type: MISS_MSG});
		queue("messageAlert", camSecondsToMilliseconds(0.2));
	}
}

// Randomize the provided list of units and tack on a bunch of extra rocket fodder
function randomTemplates(list)
{
	var i = 0;
	var droids = [];
	var coreSize = 4 + camRand(3); // Maximum of 6 core units.
	var fodderSize = 14 + camRand(3); // 14 - 16 extra Infested Civilians to the swarm.

	for (i = 0; i < coreSize; ++i)
	{
		droids.push(list[camRand(list.length)]);
	}

	// Add a bunch of Infested Civilians.
	for (i = 0; i < fodderSize; ++i)
	{
		droids.push(cTempl.infciv);
	}

	// Chance to add a Vile Stinger on Hard (10%) or Insane (20%)
	if ((difficulty === HARD && camRand(101) < 10) || (difficulty === INSANE && camRand(101) < 20))
	{
		droids.push(cTempl.vilestinger);
	}

	return droids;
}

function eventStartLevel()
{
	var lz = getObject("LZ");
	var tent = getObject("transporterEntry");
	var text = getObject("transporterEntry");
	var busPos = getObject("monsterBusPos");

	// In order to win, the player must destroy all AA sites and collect any artifacts, then return to LZ
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L7", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(2),
		callback: "checkAA",
		retlz: true
	});
	camSetExtraObjectiveMessage("Destroy the AA emplacements");

	// set up alliances
	setAlliance(AMBIENT, CAM_HUMAN_PLAYER, true);
	setAlliance(AMBIENT, CYAN_SCAVS, true);
	setAlliance(AMBIENT, INFESTED, true);

	centreView(tent.x, tent.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Get the camera to follow the transporter
	// Transporter is the only droid of the player's on the map at this point
	var transporter = enumDroid();
	cameraTrack(transporter[0]);

	// Give research upgrades
	camCompleteRequiredResearch(SCAV_RES, CYAN_SCAVS);
	camCompleteRequiredResearch(INFESTED_RES, INFESTED);

	camSetArtifacts({
		"nwScavFactory2": { tech: "R-Wpn-Rocket02-MRL" }, // Mini-Rocket Array
		"eastScavFactory": { tech: "R-Wpn-Rocket-LtA-TMk1" }, // Sarissa AT Rocket
	});

	// Set up bases
	camSetEnemyBases({
		"NorthWestScavOutpost": {
			cleanup: "wScavOutpost",
			detectMsg: "SCAV_OUTPOST1",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"NorthEastScavOutpost": {
			cleanup: "neScavOutpost",
			detectMsg: "SCAV_OUTPOST2",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"NorthWestScavBase": {
			cleanup: "nwScavFactoryBase",
			detectMsg: "SCAV_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"WestScavBase": {
			cleanup: "wScavMountainBase",
			detectMsg: "SCAV_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"EastScavBase": {
			cleanup: "eScavBase",
			detectMsg: "SCAV_BASE3",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"SouthWestScavBase": {
			cleanup: "swScavBase",
			detectMsg: "SCAV_BASE4",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"InfestedHighwayBase": {
			cleanup: "infestedHighwayBase",
			detectMsg: "INFESTED_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"InfestedRoadBase": {
			cleanup: "infestedRoadBase",
			detectMsg: "INFESTED_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
	});

	camSetFactories({
		"southScavFactory": {
			assembly: "southAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("southAssembly"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.bjeep, cTempl.lance, cTempl.bloke, cTempl.rbjeep, cTempl.moncan, cTempl.firetruck, cTempl.minitruck] // Mixed units
		},
		"westScavFactory": {
			assembly: "wMountainAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("wMountainAssembly"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.bjeep, cTempl.lance, cTempl.bloke, cTempl.rbjeep, cTempl.minitruck, cTempl.firetruck] // Mixed units
		},
		"nwScavFactory1": {
			assembly: "nwAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			data: {
				morale: 50,
				fallback: camMakePos("nwAssembly1"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.monhmg, cTempl.buscan, cTempl.lance, cTempl.bloke, cTempl.monsar, cTempl.monmrl, cTempl.lance] // Heavy vehicles + infantry
		},
		"nwScavFactory2": {
			assembly: "nwAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("nwAssembly2"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.buscan, cTempl.firetruck, cTempl.bjeep, cTempl.minitruck, cTempl.rbjeep, cTempl.sartruck, cTempl.firetruck] // Only vehicles
		},
		"eastScavFactory": {
			assembly: "eAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("eAssembly"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.buscan, cTempl.monmrl, cTempl.lance, cTempl.minitruck, cTempl.bloke, cTempl.bjeep, cTempl.rbjeep, cTempl.sartruck, cTempl.monhmg] // Mixed units (cool)
		},
		"westInfestedFactory": {
			assembly: "highwayAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 1,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [cTempl.inflance, cTempl.infminitruck, cTempl.infmoncan, cTempl.infbjeep, cTempl.infbloke, cTempl.infrbjeep, cTempl.infbloke] // Mixed units
		},
		"northInfestedFactory": {
			assembly: "roadAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 1,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.inflance, cTempl.infsartruck, cTempl.infbjeep, cTempl.infbloke, cTempl.inffiretruck, cTempl.infrbjeep, cTempl.infbloke] // Mixed units
		},
	});

	// Set up scav patrols across the map
	queue("scavPatrolSetUp", camSecondsToMilliseconds(2));

	// Queue eastern helicopter attacks
	queue("eastHeliAttack", camChangeOnDiff(camMinutesToMilliseconds(3.5)));

	// Enable the south west scav factory right away
	camEnableFactory("southScavFactory");

	// Spawn a scav Monster Bus tank near the southern scav base
	addDroid(CYAN_SCAVS, busPos.x, busPos.y, "Battle Bus 2",
		"MonsterBus", "tracked01", "", "", "RustCannon1Mk1");

	// Set a timer for checking when the player is "ready" to return to LZ
	setTimer("checkForLZReturn", camSecondsToMilliseconds(3));

	// All infested structures start out partially damaged
	preDamageInfestedStructs();

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);
}
