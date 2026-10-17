include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_cyanScavRes = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01",
];
const mis_infestedRes = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01",
];

// Player values
const MIS_RESEARCH_FACILITY = 1;
const MIS_CYAN_SCAVS = 2;
const MIS_FAUX_INFESTED = 5;

// Used to determine which entrances can spawn infested waves
var infestedTier2;
var infestedTier3;

// Used to remember if the research blip was removed
var researchDestroyed;

// Remove units exiting the map.
camAreaEvent("exitRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		camSafeRemoveObject(droid, false);
	}

	resetLabel("exitRemoveZone", ALL_PLAYERS);
});

function eventDestroyed(obj)
{
	const label = getLabel(obj);
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

// Damage some scav stuff
function preDamageScavs()
{
	let scavStuff = enumArea("scavDamagedDefenses", MIS_CYAN_SCAVS, false);
	scavStuff = scavStuff.concat(enumArea("scavRefugees", MIS_CYAN_SCAVS, false));
	scavStuff = scavStuff.concat(enumArea("scavBase2", MIS_CYAN_SCAVS, false));
	for (let i = 0; i < scavStuff.length; ++i)
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
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "L4_KILLMSG", type: MISS_MSG}]);
	camSetExtraObjectiveMessage(_("Destroy the Research Facility"));

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
	const droids = [cTempl.inftrike, cTempl.stinger, cTempl.inftrike, cTempl.stinger, cTempl.stinger];
	for (let i = 0; i < 20; i++)
	{
		droids.push(cTempl.infciv);
	}
	if (difficulty >= HARD) // Add a single Boom Tick on Hard+
	{
		droids.push(cTempl.boomtick);
	}
	camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntryPos6"), droids, CAM_REINFORCE_GROUND, 
		{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
	);
}

// Off-map infested reinforcements, disabled when the corresponding factory is destroyed
function sendInfestedReinforcements()
{
	let coreSize = camRand(3); // 0 - 2 core units.
	if (infestedTier2) coreSize += 2; // 2 - 4 core units.
	if (infestedTier3 && difficulty >= HARD) coreSize += 2; // 4 - 6 core units.
	const FODDER_SIZE = 10 + camRand(5); // 10 - 14 extra Infested Civilians to the swarm.

	// NW entrance
	if (getObject("infestedFactory1") !== null) // Stop if the infested factory was destroyed
	{
		const droids = [cTempl.stinger, cTempl.infbloke];
		camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntryPos1"), camRandInfTemplates(droids, coreSize, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}

	// SW entrance
	if (getObject("infestedFactory2") !== null)
	{
		const droids = [cTempl.stinger, cTempl.infbloke, cTempl.infbjeep];
		camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntryPos2"), camRandInfTemplates(droids, coreSize, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}

	// NE entrance
	if (getObject("infestedFactory3") !== null)
	{
		const droids = [cTempl.stinger, cTempl.infbjeep, cTempl.infrbjeep];
		camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntryPos3"), camRandInfTemplates(droids, coreSize, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}

	// SE entrance 1
	if (getObject("infestedFactory4") !== null && infestedTier2)
	{
		const droids = [cTempl.stinger, cTempl.stinger, cTempl.infbjeep, cTempl.infkevbloke];
		camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntryPos4"), camRandInfTemplates(droids, coreSize, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}

	// SE entrance 2
	if (getObject("infestedFactory4") !== null && infestedTier3)
	{
		const droids = [cTempl.stinger, cTempl.inflance, cTempl.infbuscan, cTempl.infrbjeep, cTempl.infbjeep];
		camSendReinforcement(CAM_INFESTED, camMakePos("infestedEntryPos5"), camRandInfTemplates(droids, coreSize, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}
}

// Warn the player about scavs at the research facility
function warnPlayer()
{
	camQueueDialogue([
		{text: "CLAYDE: Damnation!", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Those scavengers are already here.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Clear them out, and advance towards the research facility.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: We may still have enough time to stop them before they take what's inside.", delay: 3, sound: CAM_RCLICK},
	]);
	queue("enableReinforcements", camSecondsToMilliseconds(12));
}

function enableReinforcements()
{
	playSound(cam_sounds.reinforcementsAreAvailable); // Reinforcements are available.
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L5S", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(1),
		callback: "checkResearchFacility",
		annihilate: true,
		enableLastAttack: false
	});

	camEnableFactory("scavFactory");
}

// Move the "fake" infested away from the LZ
function clearLZ()
{
	const exit = camMakePos("exitPos");
	const units = enumDroid(MIS_FAUX_INFESTED);
	for (let i = 0; i < units.length; ++i)
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
	const startpos = camMakePos("LZ");
	const lz = getObject("LZ");
	const tent = camMakePos(21, 4);
	const text = camMakePos(21, 4);

	infestedTier2 = false;
	infestedTier3 = false;
	researchDestroyed = false;

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L5S", {
		area: "compromiseZone",
		reinforcements: -1, // will override later
		callback: "checkResearchFacility",
		annihilate: true,
		enableLastAttack: false
	});
	camSetExtraObjectiveMessage(_("Investigate the Research Facility"));

	// set up alliances
	setAlliance(MIS_RESEARCH_FACILITY, MIS_CYAN_SCAVS, true);
	setAlliance(MIS_RESEARCH_FACILITY, CAM_INFESTED, true);

	setAlliance(MIS_FAUX_INFESTED, CAM_HUMAN_PLAYER, true); // Don't compromise LZ or aggro transport

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Give research upgrades
	camCompleteRequiredResearch(mis_cyanScavRes, MIS_CYAN_SCAVS);
	camCompleteRequiredResearch(mis_infestedRes, CAM_INFESTED);

	changePlayerColour(MIS_RESEARCH_FACILITY, 10); // Set the research facility to white
	if (playerData[0].colour != 9)
	{
		changePlayerColour(CAM_INFESTED, 9); // Set infested to purple
		changePlayerColour(MIS_FAUX_INFESTED, 9); // Set fake infested to the same color as the real infested
	}
	else
	{
		changePlayerColour(CAM_INFESTED, 4); // Set infested to red if the player is already purple
		changePlayerColour(MIS_FAUX_INFESTED, 4);
	}

	camSetArtifacts({
		"scavFactory": { tech: "R-Wpn-MG-ROF01" }, // Chaingun Upgrade
		"researchFacility": { tech: "R-Struc-Research-Module" }, // Research module
		"mgCrate": { tech: "R-Vehicle-Prop-Halftracks" }, // Half-Tracks (it doesn't have the HMG anymore lol)
	});

	// Set up bases
	camSetEnemyBases({
		"scavCamp": {
			cleanup: "scavBase1",
			detectMsg: "SCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"scavHoldout": {
			cleanup: "scavBase2",
			detectMsg: "SCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"infestedCampNW": {
			cleanup: "infestedBase1",
			detectMsg: "INFESTED_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedCampSW": {
			cleanup: "infestedBase2",
			detectMsg: "INFESTED_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedCampNE": {
			cleanup: "infestedBase3",
			detectMsg: "INFESTED_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedCampSE": {
			cleanup: "infestedBase4",
			detectMsg: "INFESTED_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedResearchBase": {
			cleanup: "infestedBase5",
			detectMsg: "INFESTED_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
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
			templates: [cTempl.bloke, cTempl.firetruck, cTempl.kevlance, cTempl.kevbloke, cTempl.bjeep, cTempl.rbjeep, cTempl.moncan] // Variety
		},
		// These infested factories build units very fast, and then send against the player without retreating.
		// No need for any data except throttle and templates; infested units are automatically managed once built
		"infestedFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.infciv, cTempl.infbloke, cTempl.infciv] // Only infested civilians/infantry
		},
		"infestedFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(9)),
			templates: [cTempl.infciv, cTempl.infbloke, cTempl.infciv] // Only infested civilians/infantry
		},
		"infestedFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbuscan]
		},
		"infestedFactory4": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.inflance, cTempl.infciv, cTempl.infbjeep, cTempl.infciv]
		},
		"infestedFactory5": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Light Infested vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbjeep]
		},
		"infestedFactory6": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(8)),
			// Infested infantry
			templates: [cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infkevbloke, cTempl.infciv, cTempl.infkevbloke, cTempl.infciv, cTempl.inflance]
		},
		"infestedFactory7": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(18)),
			// Large Infested vehicles
			templates: [cTempl.infciv, cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbuscan, cTempl.infciv, cTempl.infbjeep]
		},
	});

	// Send scouts to the player LZ after a few seconds
	queue("sendScouts", camSecondsToMilliseconds(14));

	// Spawn a scav Monster Bus tank
	const busPos = camMakePos("scavBase2");
	camAddDroid(MIS_CYAN_SCAVS, busPos, cTempl.monhmg, "Battle Bus 3");

	// Infested start out partially damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Some scavs start out damaged too
	preDamageScavs();

	// Change the fog colour to a light pink/purple
	// camSetFog(185, 182, 236);
	// Set the sky to night
	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the lighting somewhat and give a SLIGHT pink/purple hue
	camSetSunIntensity(.4,.38,.4);
	// Change the fog to 1/4th-light pink/purple
	camSetFog(45, 45, 59);
	// Constant snow
	camSetWeather(CAM_WEATHER_SNOWSTORM);

	// If we're in Timerless mode, set up a scavenger crane
	if (tweakOptions.rec_timerlessMode && difficulty >= EASY)
	{
		// Cyan scav main base
		camManageTrucks(
			MIS_CYAN_SCAVS, {
				label: "scavCamp",
				rebuildBase: false,
				rebuildTruck: (difficulty >= MEDIUM),
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
				template: cTempl.crane,
				structset: camAreaToStructSet("scavBase1")
		});
	}

	// Clear the infested from the LZ
	queue("clearLZ", camSecondsToMilliseconds(0.1));

	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_CYAN_SCAVS);

	// Place a (green) dot on the research facility
	hackAddMessage("RESEARCH_GO", PROX_MSG, CAM_HUMAN_PLAYER, false);
}
