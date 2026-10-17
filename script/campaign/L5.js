include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_scavRes = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Vehicle-Metals01", "R-Struc-Materials01",
];
const mis_infestedRes = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01",
];

// Player values
const MIS_CYAN_SCAVS = 2;
const MIS_YELLOW_SCAVS = 3;

// Group ID of the scav monster bus used to trigger Boom Tick demonstration
var showBusST;

// Needed to ensure the Boom Tick showcase can be triggered after a save/load
function eventGameLoaded()
{
	if (groupSize(showBusST) > 0)
	{
		addLabel({type: GROUP, id: showBusST}, "showBusST", false);
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
			setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(75)));
			break;
		case 1: // Two factories down; increase wave spawn rate further
			removeTimer("sendInfestedReinforcements");
			setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(30)));
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

// Used to trigger Boom Tick demonstration (when the player sees the monster bus)
function eventGroupSeen(viewer, group)
{
	if (group === showBusST)
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
	camQueueDialogue([
		{text: "CLAYDE: Commander, continue forward and eradicate that scavenger base.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Infested or not, they still pose a threat to our cause.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: As such, they must be rooted out.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: If we are to succeed, we cannot allow any loose ends to remain.", delay: 4, sound: CAM_RCLICK},
	]);
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

		setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(105)));

		const CORE_SIZE = 5;
		const FODDER_SIZE = 12;

		// Two groups at once, from both sides
		const group1 = [cTempl.stinger, cTempl.stinger, cTempl.infrbjeep, cTempl.infbuscan, cTempl.infbuggy, cTempl.inffiretruck];
		camSendReinforcement(CAM_INFESTED, camMakePos("ambushSpawn1"), camRandInfTemplates(group1, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
		camSendReinforcement(CAM_INFESTED, camMakePos("ambushSpawn1"), camRandInfTemplates(group1, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

		const group2 = [cTempl.stinger, cTempl.inftrike, cTempl.infbuggy, cTempl.infbjeep, cTempl.infrbuggy, cTempl.infbjeep];
		camSendReinforcement(CAM_INFESTED, camMakePos("ambushSpawn2"), camRandInfTemplates(group2, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
		camSendReinforcement(CAM_INFESTED, camMakePos("ambushSpawn2"), camRandInfTemplates(group2, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}
	else
	{
		resetLabel("outpostAmbushTrigger", CAM_HUMAN_PLAYER);
	}
});

function sendInfestedReinforcements()
{
	const CORE_SIZE = 3 + camRand(4); // Maximum of 6 core units.
	const FODDER_SIZE = 14 + camRand(3); // 14 - 16 extra Infested Civilians to the swarm.

	// NE entrance
	if (getObject("infestedFactory2") !== null) // Stop if the infested factory was destroyed
	{
		const coreDroids = [cTempl.stinger, cTempl.infbloke, cTempl.infbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy];
		const droids = camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE);
		// Chance to add a Boom Tick on Hard (10%) or Insane (20%)
		if ((difficulty === HARD && camRand(101) < 10) || (difficulty === INSANE && camRand(101) < 20))
		{
			droids.push(cTempl.boomtick);
		}
		camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntry2"), droids, CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}

	// NW entrance
	if (getObject("infestedFactory3") !== null)
	{
		const coreDroids = [cTempl.stinger, cTempl.infbloke, cTempl.infbloke, cTempl.inflance, cTempl.infbuggy, cTempl.infrbuggy];
		const droids = camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE);
		if ((difficulty === HARD && camRand(101) < 10) || (difficulty === INSANE && camRand(101) < 20))
		{
			droids.push(cTempl.boomtick);
		}
		camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntry1"), droids, CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}

	// West entrance
	if (getObject("infestedFactory4") !== null)
	{
		const coreDroids = [cTempl.stinger, cTempl.infkevlance, cTempl.infkevbloke, cTempl.infbjeep, cTempl.infrbjeep];
		const droids = camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE);
		if ((difficulty === HARD && camRand(101) < 10) || (difficulty === INSANE && camRand(101) < 20))
		{
			droids.push(cTempl.boomtick);
		}
		camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntry4"), droids, CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
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
	camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntry3"), droids, CAM_REINFORCE_GROUND,
		{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
	);

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
	setAlliance(MIS_CYAN_SCAVS, MIS_YELLOW_SCAVS, true); // The scavs are now friends :)

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Give research upgrades
	camCompleteRequiredResearch(mis_scavRes, MIS_CYAN_SCAVS);
	camCompleteRequiredResearch(mis_scavRes, MIS_YELLOW_SCAVS);
	camCompleteRequiredResearch(mis_infestedRes, CAM_INFESTED);

	camSetArtifacts({
		"cScavFactory": { tech: "R-Wpn-MG3Mk1" }, // Heavy Machinegun
		"yScavFactory1": { tech: "R-Struc-Materials01" }, // Reinforced Structure Materials
		"yScavFactory2": { tech: "R-Wpn-Mortar-ROF01" }, // Mortar Autoloader
		"sarissaPit": { tech: "R-Wpn-Rocket-LtA-TMk1" }, // Sarissa AT Rocket
	});

	// Set up bases
	camSetEnemyBases({
		"scavOutpost": {
			cleanup: "yScavBase1",
			detectMsg: "SCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"scavCamp": {
			cleanup: "yScavBase2",
			detectMsg: "SCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"scavRoadblock": {
			cleanup: "yScavBase3",
			detectMsg: "SCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"scavAllianceBase": {
			cleanup: "scavBase",
			detectMsg: "SCAV_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"infestedStation": {
			cleanup: "infestedBase1",
			detectMsg: "INFESTED_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedCampNE": {
			cleanup: "infestedBase2",
			detectMsg: "INFESTED_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedCampNW": {
			cleanup: "infestedBase3",
			detectMsg: "INFESTED_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedCampW": {
			cleanup: "infestedBase4",
			detectMsg: "INFESTED_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
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
			templates: [cTempl.kevbloke, cTempl.firetruck, cTempl.buggy, cTempl.kevlance, cTempl.kevbloke, cTempl.rbuggy, cTempl.buscan, cTempl.buggy, cTempl.minitruck] // Mix of infantry and vehicles
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
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.inflance, cTempl.infbjeep, cTempl.infbuscan, cTempl.infbloke] // Mixed light units and cannon buses
		},
		"infestedFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.infrbuggy, cTempl.infminitruck, cTempl.infbuggy, cTempl.infkevbloke] // Mixed light units and MRP trucks
		},
		"infestedFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.infkevlance, cTempl.inffiretruck, cTempl.infkevbloke] // Infantry and firetrucks
		},
		"infestedFactory4": {
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
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// If we're in Timerless mode, set up scavenger Cranes
	if (tweakOptions.rec_timerlessMode)
	{
		// Scav main base (cyan)
		camManageTrucks(
			MIS_CYAN_SCAVS, {
				label: "scavAllianceBase",
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
				template: cTempl.crane,
				structset: camAreaToStructSet("scavBase", MIS_CYAN_SCAVS)
		});
		if (difficulty >= MEDIUM)
		{
			// Scav main base (yellow)
			camManageTrucks(
				MIS_YELLOW_SCAVS, {
					label: "scavAllianceBase",
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(90)),
					template: cTempl.crane,
					structset: camAreaToStructSet("scavBase", MIS_YELLOW_SCAVS)
			});
			// Central scav outpost
			camManageTrucks(
				MIS_YELLOW_SCAVS, {
					label: "scavOutpost",
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(90)),
					template: cTempl.crane,
					structset: camAreaToStructSet("yScavBase1")
			});
		}
		if (difficulty >= HARD)
		{
			// Yellow scav southern bases
			camManageTrucks(
				MIS_YELLOW_SCAVS, {
					label: "scavCamp",
					rebuildBase: true,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(110)),
					template: cTempl.crane,
					structset: camAreaToStructSet("yScavBase2")
			});
			// Yellow scav southern bases
			camManageTrucks(
				MIS_YELLOW_SCAVS, {
					label: "scavRoadblock",
					rebuildBase: true,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(110)),
					template: cTempl.crane,
					structset: camAreaToStructSet("yScavBase3")
			});
		}
	}

	// Change the fog to half-light pink/purple
	camSetFog(90, 90, 118);
	// Darken the lighting a wee bit and add a purple hue
	camSetSunIntensity(.45,.43,.45);
	// Constant snow
	camSetWeather(CAM_WEATHER_SNOWSTORM);

	// Damage the Boom Tick showcase group
	const units = enumArea("boomShowcaseGroup");
	for (let i = 0; i < units.length; ++i)
	{
		// 40% to 80% base HP
		setHealth(units[i], 40 + camRand(41));
	}

	// Spawn a scav Monster Bus tank (to be blown up)
	const busPos = camMakePos("boomShowcaseGroup");
	const showBusDroid = camAddDroid(MIS_CYAN_SCAVS, busPos, cTempl.moncan, "Battle Bus 4");
	showBusId = showBusDroid.id;
	// Configure the bus' HP depending on difficulty so that the Boom Tick always one-shots it
	const showBusHP = [
		32, // SUPEREASY 
		27, // EASY
		21, // MEDIUM
		19, // HARD
		17, // INSANE
	];
	setHealth(showBusDroid, showBusHP[difficulty]);

	showBusST = camMakeGroup(showBusDroid);
	addLabel({type: GROUP, id: showBusST}, "showBusST", false);
	resetLabel("showBusST", CAM_HUMAN_PLAYER); // subscribe for eventGroupSeen (used to trigger Boom Tick demonstration)

	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_CYAN_SCAVS);
	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_YELLOW_SCAVS);
	camUpgradeOnMapStructures("Sys-VTOL-RadarTower01", "Sys-VTOL-RustyRadarTower01", MIS_CYAN_SCAVS);

	camAutoReplaceObjectLabel("radarTower");
}
