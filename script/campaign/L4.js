include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const CYAN_SCAV_RES = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF01",
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
const RESEARCH_FACILITY = 1;
const CYAN_SCAVS = 2;
const AMBIENT = 3;
const FAUX_INFESTED = 5;

// Used to determine which entrances can spawn infested waves
var infestedTier2;
var infestedTier3;

// Used to remember if the research blip was removed
var researchDestroyed;

// All factory-produced infested units are automatically assigned to this group
var infGlobalAttackGroup;

// Remove units exiting the map.
camAreaEvent("exitRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		camSafeRemoveObject(droid, false);
	}

	resetLabel("exitRemoveZone", ALL_PLAYERS);
});

// This function is called after a video is played, a delay is required for the 'alert' sound to play properly in all cases
function messageAlert()
{
	playSound("beep7.ogg"); // Play a little noise to notify the player that they have a new message
}

function eventDestroyed(obj)
{
	var label = getLabel(obj);
	if (!camDef(label))
	{
		return false;
	}

	if (label === "infestedFactory1" || label === "infestedFactory2") // River factories
	{
		camCallOnce("infestedAmbush2");
		return;
	}
	else if (label === "infestedFactory3") // NE factory
	{
		camCallOnce("infestedAmbush3");
	}
}

// Damage infested units when they're built
function eventDroidBuilt(droid, structure)
{
	if (droid.player === INFESTED)
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

// Damage infested stuff
function preDamageInfested()
{
	var structures = enumStruct(INFESTED);
	for (var i = 0; i < structures.length; ++i)
	{
		// 60% to 90% base HP
		setHealth(structures[i], 60 + camRand(31));
	}

	var units = enumDroid(INFESTED);
	for (var i = 0; i < units.length; ++i)
	{
		if (units[i].body !== "CrawlerBody") // Don't damage crawlers
		{
			// 50% to 80% base HP
			setHealth(units[i], 50 + camRand(31));
		}
	}
}

// Damage infested reinforcements
function preDamageInfestedGroup(group)
{
	var units = enumGroup(group);
	for (var i = 0; i < units.length; ++i)
	{
		if (units[i].body !== "CrawlerBody") // Don't damage crawlers
		{
			// 50% to 80% base HP
			setHealth(units[i], 50 + camRand(31));
		}
	}
}

// Damage some scav stuff
function preDamageScavs()
{
	var scavStuff = enumArea("scavDamagedDefenses", CYAN_SCAVS, false);
	scavStuff = scavStuff.concat(enumArea("scavRefugees", CYAN_SCAVS, false));
	scavStuff = scavStuff.concat(enumArea("scavBase2", CYAN_SCAVS, false));
	for (var i = 0; i < scavStuff.length; ++i)
	{
		// 65% to 75% base HP
		setHealth(scavStuff[i], 65 + camRand(11));
	}
}

function eventAttacked(victim, attacker) 
{
	if (camDef(victim) && victim.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("warnPlayer");
	}
}

function camEnemyBaseDetected_scavCamp()
{
	camEnableFactory("scavFactory");
	camManageGroup(camMakeGroup("scavBase2"), CAM_ORDER_DEFEND, {pos: camMakePos("scavBase2"), radius: 5});
}

// Triggered when exiting the scav's base
camAreaEvent("scavDamagedDefenses", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camManageGroup(camMakeGroup("scavRefugees"), CAM_ORDER_DEFEND, {pos: camMakePos("scavBase1"), radius: 8});
	}
	else
	{
		resetLabel("scavDamagedDefenses", CAM_HUMAN_PLAYER);
	}
});

// Triggered when entering the dried river
camAreaEvent("infestedAmbushTrigger1", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("infestedAmbush1");
	}
	else
	{
		resetLabel("infestedAmbushTrigger1", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("infestedAmbushTrigger2", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("infestedAmbush1");
	}
	else
	{
		resetLabel("infestedAmbushTrigger2", CAM_HUMAN_PLAYER);
	}
});

function infestedAmbush1()
{
	// Enable the first batch of infested factories
	camEnableFactory("infestedFactory1");
	camEnableFactory("infestedFactory2");
	camEnableFactory("infestedFactory3");
	camEnableFactory("infestedFactory5");

	// Unleash the Infested ambush groups
	camManageGroup(camMakeGroup("infestedAmbushGroup1"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
	camManageGroup(camMakeGroup("infestedAmbushGroup2"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});

	// Message about incoming units
	camPlayVideos({video: "L4_AMBUSHMSG", type: MISS_MSG});
	queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Set up additional waves
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(45)));
}

// Triggered when approaching the NE infested base
camAreaEvent("infestedAmbushTrigger3", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("infestedAmbush2");

		// Activate the group hiding in the northern mountains
		camManageGroup(camMakeGroup("infestedAmbushGroup3"), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
	}
	else
	{
		resetLabel("infestedAmbushTrigger3", CAM_HUMAN_PLAYER);
	}
});

// The player has approached the NE base or has destroyed an infested factory
function infestedAmbush2()
{
	// Enable two more factories
	camEnableFactory("infestedFactory4");
	camEnableFactory("infestedFactory6");

	// Message about destroying the research facility and containing the outbreak
	camPlayVideos(["pcv455.ogg", {video: "L4_KILLMSG", type: MISS_MSG}]);
	queue("messageAlert", camSecondsToMilliseconds(3.4));
	camSetExtraObjectiveMessage("Destroy the Research Facility");

	if (getObject("researchFacility") !== null)
	{
		// Place a (red) dot on the research facility
		hackAddMessage("RESEARCH_KILL", PROX_MSG, CAM_HUMAN_PLAYER, false);
		// Remove the old green dot
		hackRemoveMessage("RESEARCH_GO", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	infestedTier2 = true;
}

// Triggered when approaching the SE infested base
camAreaEvent("infestedAmbushTrigger4", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("infestedAmbush3");
	}
	else
	{
		resetLabel("infestedAmbushTrigger4", CAM_HUMAN_PLAYER);
	}
});

// The player has approached the SE base or has destroyed the NE factory
function infestedAmbush3()
{
	// Enable the final infested factory
	camEnableFactory("infestedFactory7");

	infestedTier3 = true;

	// Spawn a one-time group of infested
	var droids = [cTempl.inftrike, cTempl.stinger, cTempl.inftrike, cTempl.stinger, cTempl.stinger];
	for (var i = 0; i < 20; i++)
	{
		droids.push(cTempl.infciv);
	}
	if (difficulty >= HARD) // Add a single Boom Tick on Hard+
	{
		dorids.push(cTempl.boomtick);
	}
	preDamageInfestedGroup(camSendReinforcement(INFESTED, camMakePos("infestedEntryPos6"), droids, CAM_REINFORCE_GROUND, 
		{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
	));
}

// Off-map infested reinforcements, disabled when the corresponding factory is destroyed
function sendInfestedReinforcements()
{
	// NW entrance
	if (getObject("infestedFactory1") !== null) // Stop if the infested factory was destroyed
	{
		var droids = [cTempl.stinger, cTempl.infbloke];
		preDamageInfestedGroup(camSendReinforcement(INFESTED, camMakePos("infestedEntryPos1"), randomTemplates(droids), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		));
	}

	// SW entrance
	if (getObject("infestedFactory2") !== null)
	{
		var droids = [cTempl.stinger, cTempl.infbloke, cTempl.infbjeep];
		preDamageInfestedGroup(camSendReinforcement(INFESTED, camMakePos("infestedEntryPos2"), randomTemplates(droids), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		));
	}

	// NE entrance
	if (getObject("infestedFactory3") !== null)
	{
		var droids = [cTempl.stinger, cTempl.infbjeep, cTempl.infrbjeep];
		preDamageInfestedGroup(camSendReinforcement(INFESTED, camMakePos("infestedEntryPos3"), randomTemplates(droids), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		));
	}

	// SE entrance 1
	if (getObject("infestedFactory4") !== null && infestedTier2)
	{
		var droids = [cTempl.stinger, cTempl.stinger, cTempl.infbjeep, cTempl.infbloke];
		preDamageInfestedGroup(camSendReinforcement(INFESTED, camMakePos("infestedEntryPos4"), randomTemplates(droids), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		));
	}

	// SE entrance 2
	if (getObject("infestedFactory4") !== null && infestedTier3)
	{
		var droids = [cTempl.stinger, cTempl.inflance, cTempl.infbuscan, cTempl.infrbjeep, cTempl.infbjeep];
		preDamageInfestedGroup(camSendReinforcement(INFESTED, camMakePos("infestedEntryPos5"), randomTemplates(droids), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		));
	}
}

// Randomize the provided list of units and tack on a bunch of extra rocket fodder
function randomTemplates(coreUnits)
{
	var i = 0;
	var droids = [];
	var coreSize = camRand(3); // 0 - 2 core units.
	if (infestedTier2) coreSize += 2; // 2 - 4 core units.
	if (infestedTier3 && difficulty >= HARD) coreSize += 2; // 4 - 6 core units.
	var fodderSize = 10 + camRand(5); // 10 - 14 extra Infested Civilians to the swarm.

	for (i = 0; i < coreSize; ++i)
	{
		droids.push(coreUnits[camRand(coreUnits.length)]);
	}

	// Add a bunch of Infested Civilians.
	for (i = 0; i < fodderSize; ++i)
	{
		droids.push(cTempl.infciv);
	}

	return droids;
}

// Warn the player about scavs at the research facility
function warnPlayer()
{
	camPlayVideos(["pcv455.ogg", {video: "L4_WARNMSG", type: MISS_MSG}]);
	queue("messageAlert", camSecondsToMilliseconds(3.4));
	queue("enableReinforcements", camSecondsToMilliseconds(6));
}

function enableReinforcements()
{
	playSound("pcv440.ogg"); // Reinforcements are available.
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L5S", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(1.5),
		callback: "checkResearchFacility",
		annihilate: true
	});

	camEnableFactory("scavFactory");
}

// Move the "fake" infested away from the LZ
function clearLZ()
{
	var exit = camMakePos("exitPos");
	var units = enumDroid(FAUX_INFESTED);
	for (var i = 0; i < units.length; ++i)
	{
		orderDroidLoc(units[i], DORDER_MOVE, exit.x, exit.y);
	}
}

// Send scav scouts to the player LZ.
function sendScouts()
{
	camManageGroup(camMakeGroup("scavScoutGroup"), CAM_ORDER_ATTACK, {
			pos: "exitPos",
			morale: 20, // Will run away after losing a few people.
			fallback: camMakePos("scavBase1"),
			targetPlayer: CAM_HUMAN_PLAYER
	});
}

// Make sure the research facility is destroyed (and remove the beacon if it is)
function checkResearchFacility()
{
	if (!researchDestroyed && getObject("researchFacility") === null)
	{
		// Remove the blip over the research facility
		if (!infestedTier2)
		{
			hackRemoveMessage("RESEARCH_GO", PROX_MSG, CAM_HUMAN_PLAYER);
		}
		else
		{
			hackRemoveMessage("RESEARCH_KILL", PROX_MSG, CAM_HUMAN_PLAYER);
		}

		researchDestroyed = true;
		return true;
	}
	else if (researchDestroyed)
	{
		return true;
	}
}

function eventStartLevel()
{
	var startpos = camMakePos("LZ");
	var lz = getObject("LZ");
	var tent = camMakePos(21, 4);
	var text = camMakePos(21, 4);

	infestedTier2 = false;
	infestedTier3 = false;
	researchDestroyed = false;

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L5S", {
		area: "compromiseZone",
		reinforcements: -1, // will override later
		callback: "checkResearchFacility",
		annihilate: true
	});
	camSetExtraObjectiveMessage(["Investigate the Research Facility"]);

	// set up alliances
	setAlliance(RESEARCH_FACILITY, CYAN_SCAVS, true);
	setAlliance(RESEARCH_FACILITY, INFESTED, true);

	setAlliance(AMBIENT, CAM_HUMAN_PLAYER, true);
	setAlliance(AMBIENT, CYAN_SCAVS, true);
	setAlliance(AMBIENT, INFESTED, true);

	setAlliance(FAUX_INFESTED, CAM_HUMAN_PLAYER, true); // Don't compromise LZ or aggro transport

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Give research upgrades
	camCompleteRequiredResearch(CYAN_SCAV_RES, CYAN_SCAVS);
	camCompleteRequiredResearch(INFESTED_RES, INFESTED);

	changePlayerColour(RESEARCH_FACILITY, 10); // Set the research facility to white
	changePlayerColour(AMBIENT, 10);
	if (playerData[0].colour != 9)
	{
		changePlayerColour(INFESTED, 9); // Set infested to purple
		changePlayerColour(FAUX_INFESTED, 9); // Set fake infested to the same color as the real infested
	}
	else
	{
		changePlayerColour(INFESTED, 4); // Set infested to red if the player is already purple
		changePlayerColour(FAUX_INFESTED, 4);
	}

	camSetArtifacts({
		"scavFactory": { tech: "R-Wpn-MG-ROF01" }, // Chaingun Upgrade
		"researchFacility": { tech: "R-Struc-Research-Module" }, // Research module
		"mgCrate": { tech: "R-Wpn-MG3Mk1" }, // Heavy Machinegun
	});

	// Set up bases
	camSetEnemyBases({
		"scavCamp": {
			cleanup: "scavBase1",
			detectMsg: "SCAV_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"scavHoldout": {
			cleanup: "scavBase2",
			detectMsg: "SCAV_BASE2",
			detectSnd: "pcv375.ogg",
			eliminateSnd: "pcv391.ogg"
		},
		"infestedCampNW": {
			cleanup: "infestedBase1",
			detectMsg: "INFESTED_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"infestedCampSW": {
			cleanup: "infestedBase2",
			detectMsg: "INFESTED_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"infestedCampNE": {
			cleanup: "infestedBase3",
			detectMsg: "INFESTED_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"infestedCampSE": {
			cleanup: "infestedBase4",
			detectMsg: "INFESTED_BASE4",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"infestedResearchBase": {
			cleanup: "infestedBase5",
			detectMsg: "INFESTED_BASE5",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
	});

	camSetFactories({
		"scavFactory": {
			assembly: "scavAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			data: {
				morale: 50,
				fallback: camMakePos("scavAssembly"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.bloke, cTempl.firetruck, cTempl.lance, cTempl.bloke, cTempl.bjeep, cTempl.rbjeep, cTempl.moncan] // Variety
		},
		// These infested factories build units very fast, and then send against the player without retreating.
		"infestedFactory1": {
			assembly: "infestedAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.infciv, cTempl.infbloke, cTempl.infciv] // Only infested civilians/infantry
		},
		"infestedFactory2": {
			assembly: "infestedAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(9)),
			templates: [cTempl.infciv, cTempl.infbloke, cTempl.infciv] // Only infested civilians/infantry
		},
		"infestedFactory3": {
			assembly: "infestedAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbuscan]
		},
		"infestedFactory4": {
			assembly: "infestedAssembly4",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.inflance, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.inffiretruck]
		},
		"infestedFactory5": {
			assembly: "infestedAssembly5",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Light Infested vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbjeep]
		},
		"infestedFactory6": {
			assembly: "infestedAssembly6",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(8)),
			// Infested infantry
			templates: [cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.inflance]
		},
		"infestedFactory7": {
			assembly: "infestedAssembly7",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(18)),
			// Large Infested vehicles
			templates: [cTempl.infciv, cTempl.inffiretruck, cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbuscan, cTempl.infciv, cTempl.infbjeep]
		},
	});

	// Send scouts to the player LZ after a few seconds
	queue("sendScouts", camSecondsToMilliseconds(14));

	// Spawn a scav Monster Bus tank
	var busPos = camMakePos("scavBase2");
	addDroid(CYAN_SCAVS, busPos.x, busPos.y, "Battle Bus 3",
		"MonsterBus", "tracked01", "", "", "RustMG3Mk1");

	// Infested start out partially damaged
	preDamageInfested();

	// Some scavs start out damaged too
	preDamageScavs();

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);

	// Clear the infested from the LZ
	queue("clearLZ", camSecondsToMilliseconds(0.1));

	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", CYAN_SCAVS);

	// Place a (green) dot on the research facility
	hackAddMessage("RESEARCH_GO", PROX_MSG, CAM_HUMAN_PLAYER, false);
}
