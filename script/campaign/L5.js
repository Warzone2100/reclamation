include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const SCAV_RES = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage03",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];
const INFESTED_RES = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];

// Player values
const AMBIENT = 1;
const CYAN_SCAVS = 2;
const YELLOW_SCAVS = 3;
const INFESTED = 4;

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

// Triggered when discovering the scav outpost
function camEnemyBaseDetected_ScavOutpost()
{
	// Enable the outpost's factory
	camEnableFactory("yScavFactory1");

	// Send out the outpost's guards
	camManageGroup(camMakeGroup("outpostGuard"), CAM_ORDER_ATTACK, {
			morale: 60,
			fallback: camMakePos("outpostDefensePos")
	});
}

// Triggered when entering the scavenger outpost
camAreaEvent("outpostAmbushTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Call in the reserve defense units at the outpost
		camManageGroup(camMakeGroup("outpostDefenseGroup"), CAM_ORDER_DEFEND, {
		pos: camMakePos("outpostDefensePos"),
		radius: 3
		});

		// Send infested to attack the outpost and awaken the infested base
		camEnableFactory("infestedFactory");

		setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(25)));

		var droids = [cTempl.stinger, cTempl.stinger, cTempl.infbjeep, cTempl.infminitruck, cTempl.infbjeep, cTempl.inffiretruck];
		camSendReinforcement(INFESTED, camMakePos("ambushEntry1"), randomTemplates(droids),
			CAM_REINFORCE_GROUND, {
				data: {regroup: false, count: -1,},
			}
		);
	}
	else
	{
		resetLabel("outpostAmbushTrigger", CAM_HUMAN_PLAYER);
	}
});

function sendInfestedReinforcements()
{
	// Stop if the infested factory was destroyed
	if (getObject("infestedFactory") === null)
	{
		removeTimer("sendInfestedReinforcements");
		return;
	}

	var droids = [cTempl.stinger, cTempl.inffiretruck, cTempl.infbuscan, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy];

	camSendReinforcement(INFESTED, camMakePos("ambushEntry2"), randomTemplates(droids),
		CAM_REINFORCE_GROUND, {
			data: {regroup: false, count: -1,},
		}
	);
}

// Triggered when leaving the outpost
camAreaEvent("boomTickAmbushTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Send the road Boom Tick to attack the player
		camManageGroup(camMakeGroup("boomTickGroup1"), CAM_ORDER_ATTACK);
	}
	else
	{
		resetLabel("boomTickAmbushTrigger", CAM_HUMAN_PLAYER);
	}
});

// Triggered when entering the infested town
camAreaEvent("townAmbushTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Send the town Boom Tick to attack the player and send some reinforcements
		camManageGroup(camMakeGroup("boomTickGroup2"), CAM_ORDER_ATTACK);

		var droids = [cTempl.stinger, cTempl.stinger, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infmoncan];
		camSendReinforcement(INFESTED, camMakePos("ambushEntry3"), droids,
			CAM_REINFORCE_GROUND, {
				data: {regroup: false, count: -1,},
			}
		);
	}
	else
	{
		resetLabel("townAmbushTrigger", CAM_HUMAN_PLAYER);
	}
});

// Triggered when discovering the large scavenger base
function camEnemyBaseDetected_ScavAllianceBase()
{
	// Enable the base's factories
	camEnableFactory("yScavFactory2");
	camEnableFactory("cScavFactory");

	// Start helicopter attacks
	heliAttack();

	// Tell the player to go kill everything (once again)
	camPlayVideos(["pcv455.ogg", {video: "L5_SCAVMSG", type: MISS_MSG}]);
	queue("messageAlert", camSecondsToMilliseconds(3.4));
}

function heliAttack()
{
	var list = [cTempl.helcan, cTempl.helhmg];
	var ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0
	};

	// A helicopter will attack the player every 90 seconds.
	// The helicopter attacks stop when the VTOL radar tower is destroyed.
	camSetVtolData(CYAN_SCAVS, "heliSpawn", "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "radarTower", ext);
}

// Randomize the provided list of units and tack on a bunch of extra rocket fodder
function randomTemplates(list)
{
	var i = 0;
	var droids = [];
	var coreSize = 4 + camRand(2); // Maximum of 6 core units.
	var fodderSize = 14 + camRand(2); // 14 - 16 extra Infested Civilians to the swarm.

	for (i = 0; i < coreSize; ++i)
	{
		droids.push(list[camRand(list.length)]);
	}

	// Add a bunch of Infested Civilians.
	for (i = 0; i < fodderSize; ++i)
	{
		droids.push(cTempl.infciv);
	}

	return droids;
}

function eventStartLevel()
{
	var startpos = getObject("startPosition");
	var lz = getObject("LZ");
	var tent = getObject("transporterEntry");
	var text = getObject("transporterEntry");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L6S", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(2),
		annihilate: true
	});

	// set up alliances
	setAlliance(AMBIENT, CAM_HUMAN_PLAYER, true);
	setAlliance(CYAN_SCAVS, YELLOW_SCAVS, true); // The scavs are now friends :)

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Give research upgrades
	camCompleteRequiredResearch(SCAV_RES, CYAN_SCAVS);
	camCompleteRequiredResearch(SCAV_RES, YELLOW_SCAVS);
	camCompleteRequiredResearch(INFESTED_RES, INFESTED);

	changePlayerColour(YELLOW_SCAVS, 8); // Set the yellow scavs back to yellow

	camSetArtifacts({
		"cScavFactory": { tech: "R-Vehicle-Prop-Halftracks" }, // Half-Tracks
		"yScavFactory1": { tech: "R-Wpn-Flamer-ROF02" }, // Flamer Autoloader Mk2
	});

	// Set up bases
	camSetEnemyBases({
		"ScavOutpost": {
			cleanup: "yScavBase",
			detectMsg: "SCAV_BASE1",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"ScavAllianceBase": {
			cleanup: "scavBase",
			detectMsg: "SCAV_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"InfestedStation": {
			cleanup: "infestedBase",
			detectMsg: "INFESTED_BASE",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
	});

	camSetFactories({
		"yScavFactory1": {
			assembly: "outpostDefensePos",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			data: {
				morale: 50,
				fallback: camMakePos("outpostDefensePos"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.buggy, cTempl.lance, cTempl.bloke, cTempl.rbuggy, cTempl.trike] // Light units
		},
		"yScavFactory2": {
			assembly: "baseDefensePos4",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("baseDefensePos4"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.firetruck, cTempl.buggy, cTempl.lance, cTempl.bloke, cTempl.rbuggy, cTempl.buscan, cTempl.buggy, cTempl.minitruck] // Mix of infantry and vehicles
		},
		"cScavFactory": {
			assembly: "baseDefensePos2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("baseDefensePos2"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bjeep, cTempl.sartruck, cTempl.rbjeep, cTempl.moncan, cTempl.bjeep, cTempl.firetruck, cTempl.monhmg, cTempl.bjeep, cTempl.minitruck, cTempl.monmrl] // Only vehicles and bus tanks
		},
		"infestedFactory": {
			assembly: "infestedAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.inflance, cTempl.infrbuggy, cTempl.infbjeep, cTempl.infminitruck, cTempl.inffiretruck, cTempl.infrbjeep, cTempl.infbloke] // Mixed units
		},
	});

	// Set up patrols in the large scav base
	camManageGroup(camMakeGroup("baseDefenseGroup1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("baseDefensePos1"),
			camMakePos("baseDefensePos2"),
		],
		interval: camSecondsToMilliseconds(20)
	});

	camManageGroup(camMakeGroup("baseDefenseGroup2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("baseDefensePos3"),
			camMakePos("baseDefensePos4"),
		],
		interval: camSecondsToMilliseconds(20)
	});

	// All infested structures start out partially damaged
	preDamageInfestedStructs();
}
