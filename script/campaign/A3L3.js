include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage04", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials04", 
	"R-Defense-WallUpgrade04", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade01", "R-Wpn-Mortar-Acc01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Cyborg-Metals03", "R-Wpn-AAGun-ROF01", 
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03",
];

var infGroupIdx;
var exitRemoveGroups;

// Send a group of Infested from one entrance towards another on the opposite side of the map
// Groups will not seek out the player unless the player attacks them
function sendInfestedGroup()
{
	// The entrances are arranged as follows:
	// infEntry1: west side
	// infEntry2: southwest side
	// infEntry3: south side
	// infEntry4: east side
	// infEntry5: northeast side
	// infEntry6: north side
	const entrances = [null, "infEntry1", "infEntry2", "infEntry3", "infEntry4", "infEntry5", "infEntry6"];

	let entryIdx;
	let exitIdx;
	let droids;
	switch (infGroupIdx % 6) // Cycle through each entrance
	{
	// case 0: // Travel from entrances 1 -> 4
	// 	entryIdx = 1;
	// 	exitIdx = 4;
	// 	droids = camRandInfTemplates(
	// 		// Misc. units
	// 		[cTempl.stinger, cTempl.infbloke, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy], 
	// 		4 + camRand(5), // 4 - 8 core units
	// 		14 + camRand(3) // 14 - 16 fodder
	// 	);
	// 	break;
	case 1: // Travel from entrances 5 -> 1
		entryIdx = 5;
		exitIdx = 1;
		droids = camRandInfTemplates(
			// Stingers and Collective tanks
			[cTempl.stinger, cTempl.infcolpodt, cTempl.infcolhmght, cTempl.infkevbloke, cTempl.infkevlance], 
			4 + camRand(5), // 4 - 8 core units
			14 + camRand(3) // 14 - 16 fodder
		);
		if (difficulty >= MEDIUM) droids.push(cTempl.infcommcant); // Add an extra Medium Cannon
		break;
	case 2: // Travel from entrances 4 -> 2
		entryIdx = 4;
		exitIdx = 2;
		droids = camRandInfTemplates(
			// Cyborgs and Bashers
			[cTempl.basher, cTempl.basher, cTempl.infcybgr, cTempl.infcybca, cTempl.infcybhg], 
			4 + camRand(5), // 4 - 8 core units
			14 + camRand(3) // 14 - 16 fodder
		);
		break;
	case 3: // Travel from entrances 3 -> 5
		entryIdx = 3;
		exitIdx = 5;
		droids = camRandInfTemplates(
			// Infantry and bus tanks
			[cTempl.infkevbloke, cTempl.infbloke, cTempl.infmoncan, cTempl.infmonhmg, cTempl.inflance, cTempl.infbloke, cTempl.infkevlance, cTempl.infbloke], 
			4 + camRand(5), // 4 - 8 core units
			14 + camRand(3) // 14 - 16 fodder
		);
		break;
	case 4: // Travel from entrances 2 -> 6
		entryIdx = 2;
		exitIdx = 6;
		droids = camRandInfTemplates(
			// Infantry and light/medium scav vehicles
			[cTempl.infkevbloke, cTempl.infbuggy, cTempl.infbuscan, cTempl.infkevbloke, cTempl.inftrike, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infbjeep, cTempl.infkevlance], 
			8 + camRand(5), // 8 - 12 core units
			8 + camRand(5) // 8 - 12 fodder
		);
		break;
	case 5: // Travel from entrances 6 -> 3
		entryIdx = 6;
		exitIdx = 3;
		droids = camRandInfTemplates(
			// All Bashers
			[cTempl.basher], 
			5 + camRand(4), // 5 - 8 Bashers
			8 + camRand(3) // 8 - 10 fodder
		);
		if (difficulty >= MEDIUM) droids.push(cTempl.boomtick); // Add an extra Boom Tick
		break;
	default:
		infGroupIdx++;
		return;
	}

	const newGroup = camSendReinforcement(CAM_INFESTED, getObject(entrances[entryIdx]), droids, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_DEFEND, data: {
			pos: camMakePos(entrances[exitIdx]),
			radius: 4
		}});

	// Let the correct exit trigger know to expect this group's arrival
	exitRemoveGroups[exitIdx].push(newGroup);

	infGroupIdx++;
}

// Remove infested units once they reach their selected exit...
camAreaEvent("infEntry1", function(droid)
{
	if (droid.player === CAM_INFESTED)
	{
		removeInfGroup(1);
	}
	resetLabel("infEntry1", CAM_INFESTED);
});

camAreaEvent("infEntry2", function(droid)
{
	if (droid.player === CAM_INFESTED)
	{
		removeInfGroup(2);
	}
	resetLabel("infEntry2", CAM_INFESTED);
});

camAreaEvent("infEntry3", function(droid)
{
	if (droid.player === CAM_INFESTED)
	{
		removeInfGroup(3);
	}
	resetLabel("infEntry3", CAM_INFESTED);
});

camAreaEvent("infEntry4", function(droid)
{
	if (droid.player === CAM_INFESTED)
	{
		removeInfGroup(4);
	}
	resetLabel("infEntry4", CAM_INFESTED);
});

camAreaEvent("infEntry5", function(droid)
{
	if (droid.player === CAM_INFESTED)
	{
		removeInfGroup(5);
	}
	resetLabel("infEntry5", CAM_INFESTED);
});

camAreaEvent("infEntry6", function(droid)
{
	if (droid.player === CAM_INFESTED)
	{
		removeInfGroup(6);
	}
	resetLabel("infEntry6", CAM_INFESTED);
});

function removeInfGroup(index)
{
	const groupList = exitRemoveGroups[index];
	const droids = enumArea("infEntry" + index, CAM_INFESTED, false);
	for (const droid of droids)
	{
		for (const group of groupList)
		{
			// If this droid is from a group we're expecting to use this exit, remove it
			if (droid.group === group)
			{
				camSafeRemoveObject(droid);
			}
			if (groupSize(group) == 0)
			{
				// If this group is empty, remove it from the list
				groupList.splice(groupList.indexOf(group), 1);
			}
		}
	}
}

function eventTransporterLanded(transport)
{
	camCallOnce("claydeVtolCheck");
}

// Check if the player ONLY brought VTOLs (and softlocked themselves)
function claydeVtolCheck()
{
	const playerDroids = enumDroid(CAM_HUMAN_PLAYER);

	let foundNonVtol = false;
	for (const droid of playerDroids)
	{
		if (!camIsTransporter(droid) && !isVTOL(droid))
		{
			foundNonVtol = true;
		}
	}

	if (foundNonVtol)
	{
		// Player has at least one non-VTOL
		return;
	}

	// Cancel everything and scold the player
	removeTimer("sendInfestedGroup");

	// Shrink the map
	setScrollLimits(0, 0, 16, 12);

	// Lecture the player
	camQueueDialogue([
		{text: "CLAYDE: Commander Bravo, did you...", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: ONLY bring VTOLs?", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Why?!", delay: 3, sound: CAM_RCLICK},
		{delay: 3, callback: "antiSoftlock"},
	]);
}

function antiSoftlock()
{
	camEndMission(false);
}

// If an Infested group is attacked with the CAM_ORDER_DEFEND order, replace it with CAM_ORDER_ATTACK
function eventAttacked(victim, attacker)
{
	if (victim.player === CAM_INFESTED && attacker.player === CAM_HUMAN_PLAYER 
		&& victim.group !== null && camGetGroupOrder(victim.group) === CAM_ORDER_DEFEND)
	{
		// The player has attacked one of the meandering Infested groups
		// Re-order the Infested group to attack the player instead
		camManageGroup(victim.group, CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
	}
}

function eventPickup(feature, droid)
{
	if (feature.stattype === ARTIFACT && droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("cargoCollected");
	}
}

function cargoCollected()
{
	// Rev up any remaining infested factories
	queue("enableAllFactories", camChangeOnDiff(camSecondsToMilliseconds(12)));

	hackRemoveMessage("COL_CONVOY", PROX_MSG, CAM_HUMAN_PLAYER);
	camSetExtraObjectiveMessage();
}

// Activate the factories to chase the player on their way out
function enableAllFactories()
{
	camEnableFactory("infFactory");
	camEnableFactory("infCybFactory");
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A3L4", {
		message: "RET_LZ",
		reinforcements: -1,
		retlz: true,
		area: "compromiseZone",
		enableLastAttack: false // Don't overwhelm the player when they try to escape
	});
	camSetExtraObjectiveMessage(_("Recover the Collective commander's cargo"));

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(2, 2, CAM_HUMAN_PLAYER);
	setTransporterExit(2, 2, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetArtifacts({
		"colCommander": { tech: "R-Wpn-MG4" }, // Assault Gun
	});

	camSetEnemyBases({
		"infestedScavDepot": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedOverlook": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedCollectiveBase": {
			cleanup: "infBase3",
			detectMsg: "INF_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
	});

	// These are only activated after the player can leave
	camSetFactories({
		"infFactory": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [ cTempl.infbuscan, cTempl.infkevbloke, cTempl.infminitruck, cTempl.infbuggy, cTempl.infkevlance ]
		},
		"infCybFactory": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			templates: [ cTempl.infcybca, cTempl.infcybgr, cTempl.infcybhg, cTempl.infcybmr ]
		},
	});

	// Set the commander's rank and start managing it
	const COMMANDER_RANK = (difficulty <= MEDIUM) ? "Green" : "Trained";
	camSetDroidRank(getObject("colCommander"), COMMANDER_RANK);

	camManageGroup(camMakeGroup("colCommandGroup"), CAM_ORDER_FOLLOW, {
		leader: "colCommander",
		suborder: CAM_ORDER_ATTACK, // Attack the player when the commander dies
		targetPlayer: CAM_HUMAN_PLAYER,
		leaderOrder: CAM_ORDER_DEFEND,
		data: {
			pos: camMakePos("colCommandGroup"),
			radius: 10
		}
	});

	hackAddMessage("COL_CONVOY", PROX_MSG, CAM_HUMAN_PLAYER);

	infGroupIdx = 0;
	exitRemoveGroups = [
		null, // idx 0
		[],
		[],
		[],
		[],
		[],
		[],
	];

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Also pre-damage the Collective convoy
	camSetPreDamageModifier(CAM_THE_COLLECTIVE, [60, 70]);

	setTimer("sendInfestedGroup", camChangeOnDiff(camSecondsToMilliseconds(50)));

	camSetWeather(CAM_WEATHER_RAINSTORM);
	camSetSkyType(CAM_SKY_NIGHT);
	// Give the fog a dark purple hue
	camSetFog(32, 12, 64);
	// Add a purple-blue tint
	camSetSunIntensity(.45, .35, .45);
}