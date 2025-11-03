include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_scavRes = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage03",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];
const mis_infestedRes = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];

// Player values
const MIS_AMBIENT = 1;
const MIS_CYAN_SCAVS = 2;
const MIS_YELLOW_SCAVS = 3;

// ID of the scav monster bus used to trigger Boom Tick demonstration
var showBus;
// All factory-produced infested units are automatically assigned to this group
var infGlobalAttackGroup;

// Needed to ensure the Boom Tick showcase can be triggered after a save/load
function eventGameLoaded()
{
	if (camDef(getObject(DROID, MIS_CYAN_SCAVS, showBus)) && getObject(DROID, MIS_CYAN_SCAVS, showBus) !== null)
	{
		addLabel({ type: GROUP, id: camMakeGroup(getObject(DROID, MIS_CYAN_SCAVS, showBus)) }, "showBusST", false);
		resetLabel("showBusST", CAM_HUMAN_PLAYER); // subscribe for eventGroupSeen
	}
}

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

// This function is called after a video is played, a delay is required for the 'alert' sound to play properly in all cases
function messageAlert()
{
	playSound("beep7.ogg"); // Play a little noise to notify the player that they have a new message
}

function eventDestroyed(obj)
{
	if (obj.type === STRUCTURE)
	{
		const label = getLabel(obj);
		if (!camDef(label) || !(label === "infestedFactory2" || label === "infestedFactory3" || label === "infestedFactory4"))
		{
			return false;
		}

		// Count how many factories remain
		let factCount = 0;
		if (getObject("infestedFactory2") !== null && label !== "infestedFactory2") factCount++;
		if (getObject("infestedFactory3") !== null && label !== "infestedFactory3") factCount++;
		if (getObject("infestedFactory4") !== null && label !== "infestedFactory4") factCount++;

		switch (factCount)
		{
		case 2: // One factory down; increase wave spawn rate
			removeTimer("sendInfestedReinforcements");
			setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(55)));
			break;
		case 1: // Two factories down; increase wave spawn rate further
			removeTimer("sendInfestedReinforcements");
			setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(35)));
			break;
		default: // All factories down; stop waves and activate any remaing scav factories
			removeTimer("sendInfestedReinforcements");
			camCallOnce("townAmbush2");
			camEnableFactory("yScavFactory2");
			camEnableFactory("yScavFactory3");
			camEnableFactory("yScavFactory4");
			break;
		}
	}
}

// Damage infested units when they're built
function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_INFESTED)
	{
		if (droid.body !== "CrawlerBody")
		{
			// 50% to 80% base HP
			setHealth(droid, 50 + camRand(41));
		}
		if (!camDef(infGlobalAttackGroup))
		{
			infGlobalAttackGroup = camMakeGroup(droid);
			camManageGroup(infGlobalAttackGroup, CAM_ORDER_ATTACK, {removable: false, targetPlayer: CAM_HUMAN_PLAYER})
		}
		else
		{
			groupAdd(infGlobalAttackGroup, droid);
		}
	}
}

// Damage infested structures
function preDamageInfested()
{
	const structures = enumStruct(CAM_INFESTED);
	for (let i = 0; i < structures.length; ++i)
	{
		// 60% to 90% base HP
		setHealth(structures[i], 60 + camRand(31));
	}

	const units = enumDroid(CAM_INFESTED);
	for (let i = 0; i < units.length; ++i)
	{
		if (units[i].body !== "CrawlerBody") // Don't damage crawlers
		{
			// 50% to 80% base HP
			setHealth(units[i], 50 + camRand(41));
		}
	}
}

// Damage infested reinforcements
function preDamageInfestedGroup(group)
{
	const units = enumGroup(group);
	for (let i = 0; i < units.length; ++i)
	{
		if (units[i].body !== "CrawlerBody") // Don't damage crawlers
		{
			// 50% to 80% base HP
			setHealth(units[i], 50 + camRand(31));
		}
	}
}

// Used to trigger Boom Tick demonstration (when the player sees the monste bus)
function eventGroupSeen(viewer, group)
{
	if (camDef(getObject(DROID, MIS_CYAN_SCAVS, showBus)) && getObject(DROID, MIS_CYAN_SCAVS, showBus) !== null 
		&& group === getObject(DROID, MIS_CYAN_SCAVS, showBus).group)
	{
		// Unleash the thingamabob
		camManageGroup(camMakeGroup("boomShowcaseGroup"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
		camManageGroup(camMakeGroup("showcaseBoomTick"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
	}
}

// Triggered when discovering the scav outpost
function camEnemyBaseDetected_scavOutpost()
{
	// Enable the outpost's factory
	camEnableFactory("yScavFactory1");

	// Send out the outpost's guards
	camManageGroup(camMakeGroup("outpostGuard"), CAM_ORDER_ATTACK, {
		morale: 60,
		fallback: camMakePos("outpostGuard"),
		targetPlayer: CAM_HUMAN_PLAYER
	});

	// Tell the player to go destroy the scavengers (again)
	camPlayVideos(["pcv455.ogg", {video: "L5_SCAVMSG", type: MISS_MSG}]);
	queue("messageAlert", camSecondsToMilliseconds(3.4));
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

		// Send infested to attack the outpost and awaken the infested bases
		camEnableFactory("infestedFactory1");
		camEnableFactory("infestedFactory2");
		camEnableFactory("infestedFactory3");
		camEnableFactory("infestedFactory4");

		setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(75)));

		// Two groups at once, from both sides
		const group1 = [cTempl.stinger, cTempl.stinger, cTempl.infrbjeep, cTempl.infbuscan, cTempl.infbuggy, cTempl.inffiretruck];
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, camMakePos("ambushSpawn1"), randomTemplates(group1), CAM_REINFORCE_GROUND));
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, camMakePos("ambushSpawn1"), randomTemplates(group1), CAM_REINFORCE_GROUND));

		const group2 = [cTempl.stinger, cTempl.inftrike, cTempl.infbuggy, cTempl.infbjeep, cTempl.infrbuggy, cTempl.infbjeep];
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, camMakePos("ambushSpawn2"), randomTemplates(group2), CAM_REINFORCE_GROUND));
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, camMakePos("ambushSpawn2"), randomTemplates(group2), CAM_REINFORCE_GROUND));
	}
	else
	{
		resetLabel("outpostAmbushTrigger", CAM_HUMAN_PLAYER);
	}
});

function sendInfestedReinforcements()
{
	// NE entrance
	if (getObject("infestedFactory2") !== null) // Stop if the infested factory was destroyed
	{
		const droids = [cTempl.stinger, cTempl.infbloke, cTempl.infbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy];
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntry2"), randomTemplates(droids), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		));
	}

	// NW entrance
	if (getObject("infestedFactory3") !== null)
	{
		const droids = [cTempl.stinger, cTempl.inffiretruck, cTempl.infbloke, cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy];
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntry1"), randomTemplates(droids), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		));
	}

	// West entrance
	if (getObject("infestedFactory4") !== null)
	{
		const droids = [cTempl.stinger, cTempl.inflance, cTempl.infbuscan, cTempl.infbloke, cTempl.infbjeep, cTempl.infrbjeep];
		preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntry4"), randomTemplates(droids), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		));
	}
}

// Triggered when approaching the town
camAreaEvent("boomTownAmbushTrigger1", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("townAmbush1");
	}
	else
	{
		resetLabel("boomTownAmbushTrigger1", CAM_HUMAN_PLAYER);
	}
});

function camEnemyBaseDetected_infestedStation()
{
	camCallOnce("townAmbush1");
}

// Triggered when the player approaches the town, or detects the town's infested base
function townAmbush1()
{
	// Send the road Boom Tick to attack the player
	camManageGroup(camMakeGroup("boomTownGroup1"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
}

// Triggered when entering the south part of the infested town
camAreaEvent("boomTownAmbushTrigger2", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("townAmbush2");
	}
	else
	{
		resetLabel("boomTownAmbushTrigger2", CAM_HUMAN_PLAYER);
	}
});

// Triggered when discovering the large scavenger base
function camEnemyBaseDetected_scavAllianceBase()
{
	camCallOnce("townAmbush2");

	// Enable factories
	camEnableFactory("yScavFactory2");
	camEnableFactory("yScavFactory4");

	// Start helicopter attacks
	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
}

// Triggered when the player approaches the the south part of town, or detects the scavenger alliance base
function townAmbush2()
{
	// Send the town Boom Tick to attack the player and send some reinforcements
	camManageGroup(camMakeGroup("boomTownGroup2"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});

	const droids = [cTempl.stinger, cTempl.stinger, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infmoncan];
	preDamageInfestedGroup(camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntry3"), droids, CAM_REINFORCE_GROUND,
		{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
	));

	// Also enables the cyan scav's factory
	camEnableFactory("cScavFactory");
}

// Triggered when approaching the western infested base from the north
camAreaEvent("westBoomTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("westAmbush");
	}
	else
	{
		resetLabel("westBoomTrigger", CAM_HUMAN_PLAYER);
	}
});

function camEnemyBaseDetected_infestedCampW()
{
	camCallOnce("westAmbush");

	// Also activate the factory in the SW
	camEnableFactory("yScavFactory3");
}

// Triggered when the player approaches or detects the western infested base
function westAmbush()
{
	camManageGroup(camMakeGroup("westBoomGroup1"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
	camManageGroup(camMakeGroup("westBoomGroup2"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
}

// Triggered when approaching the western infested base from the north
camAreaEvent("northBoomTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("northAmbush");
	}
	else
	{
		resetLabel("northBoomTrigger", CAM_HUMAN_PLAYER);
	}
});

function camEnemyBaseDetected_infestedCampNW()
{
	camCallOnce("northAmbush");
}

// Triggered when the player approaches or detects the northwest infested base
function northAmbush()
{
	camManageGroup(camMakeGroup("northBoomGroup"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
}

function heliAttack()
{
	const list = [cTempl.helcan, cTempl.helhmg];
	const ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0,
		targetPlayer: CAM_HUMAN_PLAYER
	};

	// A helicopter will attack the player every 90 seconds.
	// The helicopter attacks stop when the VTOL radar tower is destroyed.
	camSetVtolData(MIS_CYAN_SCAVS, "heliSpawn", "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "radarTower", ext);
}

// Randomize the provided list of units and tack on a bunch of extra rocket fodder
function randomTemplates(list)
{
	const droids = [];
	const CORE_SIZE = 3 + camRand(4); // Maximum of 6 core units.
	const FODDER_SIZE = 14 + camRand(3); // 14 - 16 extra Infested Civilians to the swarm.

	for (let i = 0; i < CORE_SIZE; ++i)
	{
		droids.push(list[camRand(list.length)]);
	}

	// Add a bunch of Infested Civilians.
	for (let i = 0; i < FODDER_SIZE; ++i)
	{
		droids.push(cTempl.infciv);
	}

	// Chance to add a Boom Tick on Hard (10%) or Insane (20%)
	if ((difficulty === HARD && camRand(101) < 10) || (difficulty === INSANE && camRand(101) < 20))
	{
		droids.push(cTempl.boomtick);
	}

	return droids;
}

function camEnemyBaseDetected_scavCamp()
{
	// Activate factories in the south
	camEnableFactory("yScavFactory3");
	camEnableFactory("yScavFactory4");
}

function camEnemyBaseDetected_scavRoadblock()
{
	// Activate factories in the south (and alliance base)
	camEnableFactory("yScavFactory2");
	camEnableFactory("yScavFactory3");
	camEnableFactory("yScavFactory4");
}

function eventStartLevel()
{
	const startpos = camMakePos("LZ");
	const lz = getObject("LZ");
	const tent = camMakePos(28, 88);
	const text = camMakePos(28, 88);

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L6S", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(1.75),
		annihilate: true
	});

	// set up alliances
	setAlliance(MIS_AMBIENT, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_AMBIENT, MIS_CYAN_SCAVS, true);
	setAlliance(MIS_AMBIENT, MIS_YELLOW_SCAVS, true);
	setAlliance(MIS_AMBIENT, CAM_INFESTED, true);
	setAlliance(MIS_CYAN_SCAVS, MIS_YELLOW_SCAVS, true); // The scavs are now friends :)

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Give research upgrades
	camCompleteRequiredResearch(mis_scavRes, MIS_CYAN_SCAVS);
	camCompleteRequiredResearch(mis_scavRes, MIS_YELLOW_SCAVS);
	camCompleteRequiredResearch(mis_infestedRes, CAM_INFESTED);

	if (playerData[0].colour != 8)
	{
		changePlayerColour(MIS_YELLOW_SCAVS, 8); // Set the yellow scavs back to yellow
	}
	else
	{
		changePlayerColour(MIS_YELLOW_SCAVS, 1); // Set as orange if the player is already yellow
	}

	camSetArtifacts({
		"cScavFactory": { tech: "R-Vehicle-Prop-Halftracks" }, // Half-Tracks
		"yScavFactory1": { tech: "R-Wpn-Flamer-ROF02" }, // Flamer Autoloader Mk2
	});

	// Set up bases
	camSetEnemyBases({
		"scavOutpost": {
			cleanup: "yScavBase1",
			detectMsg: "SCAV_BASE1",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"scavCamp": {
			cleanup: "yScavBase2",
			detectMsg: "SCAV_BASE2",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"scavRoadblock": {
			cleanup: "yScavBase3",
			detectMsg: "SCAV_BASE3",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"scavAllianceBase": {
			cleanup: "scavBase",
			detectMsg: "SCAV_BASE4",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"infestedStation": {
			cleanup: "infestedBase1",
			detectMsg: "INFESTED_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"infestedCampNE": {
			cleanup: "infestedBase2",
			detectMsg: "INFESTED_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"infestedCampNW": {
			cleanup: "infestedBase3",
			detectMsg: "INFESTED_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"infestedCampW": {
			cleanup: "infestedBase4",
			detectMsg: "INFESTED_BASE4",
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
				fallback: camMakePos("outpostDefensePos"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.bloke, cTempl.buggy, cTempl.lance, cTempl.bloke, cTempl.rbuggy, cTempl.trike] // Light units
		},
		"yScavFactory2": {
			assembly: "basePatrolPos4",
			order: CAM_ORDER_ATTACK,
			groupSize: 8,
			maxSize: 10,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				fallback: camMakePos("basePatrolPos4"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.bloke, cTempl.firetruck, cTempl.buggy, cTempl.lance, cTempl.bloke, cTempl.rbuggy, cTempl.buscan, cTempl.buggy, cTempl.minitruck] // Mix of infantry and vehicles
		},
		"yScavFactory3": {
			assembly: "yScavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 8,
			maxSize: 10,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				fallback: camMakePos("yScavAssembly2"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.bloke, cTempl.firetruck, cTempl.buggy, cTempl.bloke, cTempl.rbuggy, cTempl.buggy] // Light vehicles and fire trucks
		},
		"yScavFactory4": {
			assembly: "yScavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 8,
			maxSize: 10,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			data: {
				fallback: camMakePos("yScavAssembly3"),
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.bloke, cTempl.buggy, cTempl.lance, cTempl.bloke] // Mostly infantry
		},
		"cScavFactory": {
			assembly: "basePatrolPos2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("basePatrolPos2"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.bjeep, cTempl.sartruck, cTempl.rbjeep, cTempl.firetruck, cTempl.monhmg, cTempl.bjeep, cTempl.minitruck, cTempl.monmrl] // Vehicles and bus tanks
		},
		"infestedFactory1": {
			assembly: "infestedAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 1,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.inflance, cTempl.infbjeep, cTempl.infbuscan, cTempl.infbloke] // Mixed light units and cannon buses
		},
		"infestedFactory2": {
			assembly: "infestedAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 1,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.infrbuggy, cTempl.infminitruck, cTempl.infbuggy, cTempl.infbloke] // Mixed light units and MRP trucks
		},
		"infestedFactory3": {
			assembly: "infestedAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 1,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.inflance, cTempl.inffiretruck, cTempl.infbloke] // Infantry and firetrucks
		},
		"infestedFactory4": {
			assembly: "infestedAssembly4",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 1,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.infrbuggy, cTempl.infminitruck, cTempl.infbuggy, cTempl.infbloke] // Mixed light units and MRP trucks
		},
	});

	// Set up patrols in the large scav base
	camManageGroup(camMakeGroup("baseDefenseGroup1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("basePatrolPos1"),
			camMakePos("basePatrolPos2"),
		],
		interval: camSecondsToMilliseconds(20)
	});

	camManageGroup(camMakeGroup("baseDefenseGroup2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("basePatrolPos3"),
			camMakePos("basePatrolPos4"),
		],
		interval: camSecondsToMilliseconds(20)
	});

	camManageGroup(camMakeGroup("southScavPatrol"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southPatrolPos1"),
			camMakePos("southPatrolPos2"),
			camMakePos("southPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(20)
	});

	// Infested start out partially damaged
	preDamageInfested();

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);

	// Damage the Boom Tick showcase group
	const units = enumArea("boomShowcaseGroup");
	for (let i = 0; i < units.length; ++i)
	{
		// 40% to 80% base HP
		setHealth(units[i], 40 + camRand(41));
	}

	// Spawn a scav Monster Bus tank (to be blown up)
	const busPos = camMakePos("boomShowcaseGroup");
	showBus = addDroid(MIS_CYAN_SCAVS, busPos.x, busPos.y, "Battle Bus 4",
		"MonsterBus", "tracked01", "", "", "RustCannon1Mk1").id;
	setHealth(getObject(DROID, MIS_CYAN_SCAVS, showBus), 15); // Starts very damaged
	addLabel({ type: GROUP, id: camMakeGroup(getObject(DROID, MIS_CYAN_SCAVS, showBus)) }, "showBusST", false);
	resetLabel("showBusST", CAM_HUMAN_PLAYER); // subscribe for eventGroupSeen (used to trigger Boom Tick demonstration)

	camManageGroup(camMakeGroup("boomShowcaseGroup"), CAM_ORDER_DEFEND, {pos: camMakePos("boomShowcaseGroup")});

	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_CYAN_SCAVS);
	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_YELLOW_SCAVS);
	camUpgradeOnMapStructures("Sys-VTOL-RadarTower01", "Sys-VTOL-RustyRadarTower01", MIS_CYAN_SCAVS);
}

