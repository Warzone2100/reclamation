include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const CYAN_SCAV_RES = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
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
const RESEARCH_FACILITY = 1;
const CYAN_SCAVS = 2;
const CIVILIANS = 3;
const INFESTED = 4; // New enemy faction!

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

function eventAttacked(victim, attacker) 
{
	if (camDef(victim) && victim.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("warnPlayer");
	}
}

function camEnemyBaseDetected_ScavStation()
{
	camEnableFactory("scavFactory1");
}

// Triggered when approaching the first infested base
camAreaEvent("ambush1Trigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Enable the first infested factory
		camEnableFactory("infestedFactory1");

		// Send out the infested civilians
		camManageGroup(camMakeGroup("ambushGroup"), CAM_ORDER_ATTACK);

		// Message about incoming units
		camPlayVideos({video: "L4_AMBUSHMSG", type: MISS_MSG});
		queue("messageAlert", camSecondsToMilliseconds(0.2));
	}
	else
	{
		resetLabel("ambush1Trigger", CAM_HUMAN_PLAYER);
	}
});

// Triggered when approaching the second infested base
camAreaEvent("ambush2Trigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Enable the second infested factory
		camEnableFactory("infestedFactory2");

		// Spawn a wave of infested
		var units = [cTempl.stinger, cTempl.infbjeep, cTempl.infbjeep];

		// Most of the wave is Infested Civilians
		for (var i = 0; i < 20; i++)
		{
			units.push(cTempl.infciv);
		}

		camSendReinforcement(INFESTED, camMakePos("ambushEntry"), units,
			CAM_REINFORCE_GROUND, {
				data: {regroup: false, count: -1,},
			}
		);

		// Set up additional waves
		setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(40)));
	}
	else
	{
		resetLabel("ambush2Trigger", CAM_HUMAN_PLAYER);
	}
});

// Triggered after leaving the second infested base
camAreaEvent("finalFactoryTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Enable the remaining factories
		camEnableFactory("infestedFactory3");
		camEnableFactory("scavFactory2");

		// Message about destroying the research facility
		camPlayVideos(["pcv455.ogg", {video: "L4_KILLMSG", type: MISS_MSG}]);
		queue("messageAlert", camSecondsToMilliseconds(3.4));
	}
	else
	{
		resetLabel("finalFactoryTrigger", CAM_HUMAN_PLAYER);
	}
});

// NW infested reinforcements, disabled when factory is destroyed
function sendInfestedReinforcements()
{
	// Stop if the infested factory was destroyed
	if (getObject("infestedFactory2") === null)
	{
		removeTimer("sendInfestedReinforcements");
		return;
	}

	var droids = [cTempl.infbjeep, cTempl.infrbjeep, cTempl.infbuggy];

	for (var i = 0; i < 20; i++)
		{
			droids.push(cTempl.infciv);
		}

	camSendReinforcement(INFESTED, camMakePos("ambushEntry"), droids,
		CAM_REINFORCE_GROUND, {
			data: {regroup: false, count: -1,},
		}
	);
}

// Warn the player about scavs at the research facility
function warnPlayer()
{
	camPlayVideos(["pcv455.ogg", {video: "L4_WARNMSG", type: MISS_MSG}]);
	queue("messageAlert", camSecondsToMilliseconds(3.4));
}

// Send scav scouts to the player LZ.
function sendScouts()
{
	camManageGroup(camMakeGroup("scoutGroup"), CAM_ORDER_ATTACK, {
			morale: 50, // Will run away after losing a few people.
			fallback: camMakePos("scoutFallbackPos")
	});
}

function eventStartLevel()
{
	var startpos = getObject("startPosition");
	var lz = getObject("LZ");
	var tent = getObject("transporterEntry");
	var text = getObject("transporterExit");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L5S", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(1.5),
		annihilate: true
	});

	// set up alliances
	setAlliance(RESEARCH_FACILITY, CYAN_SCAVS, true);
	setAlliance(RESEARCH_FACILITY, INFESTED, true);

	setAlliance(CIVILIANS, CAM_HUMAN_PLAYER, true);
	setAlliance(CIVILIANS, CYAN_SCAVS, true);
	setAlliance(CIVILIANS, INFESTED, true);

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Give research upgrades
	// Infested have the same upgrades minus unit armor
	camCompleteRequiredResearch(CYAN_SCAV_RES, CYAN_SCAVS);
	camCompleteRequiredResearch(INFESTED_RES, INFESTED);

	changePlayerColour(RESEARCH_FACILITY, 10); // Set the research facility to white
	changePlayerColour(CIVILIANS, 10); // Set civilians to white
	changePlayerColour(INFESTED, 9); // Set infested to purple

	camSetArtifacts({
		"researchFacility": { tech: "R-Struc-Research-Module" }, // Research module
		"scavFactory2": { tech: "R-Wpn-MG3Mk1" }, // Heavy Machinegun
	});

	// Set up bases
	camSetEnemyBases({
		"ScavStation": {
			cleanup: "scavBase1",
			detectMsg: "SCAV_BASE1",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"ScavHoldout": {
			cleanup: "scavBase2",
			detectMsg: "SCAV_BASE2",
			detectSnd: "pcv374.ogg",
			eliminateSnd: "pcv392.ogg"
		},
		"InfestedCamp": {
			cleanup: "infestedBase1",
			detectMsg: "INFESTED_BASE1",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"InfestedRoadblock": {
			cleanup: "infestedBase2",
			detectMsg: "INFESTED_BASE2",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
		"InfestedCentralBase": {
			cleanup: "infestedBase3",
			detectMsg: "INFESTED_BASE3",
			detectSnd: "pcv379.ogg",
			eliminateSnd: "pcv394.ogg"
		},
	});

	camSetFactories({
		"scavFactory1": {
			assembly: "scavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("scavAssembly1"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.firetruck, cTempl.lance, cTempl.bloke, cTempl.bjeep, cTempl.rbjeep] // Variety
		},
		"scavFactory2": {
			assembly: "scavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 60,
				fallback: camMakePos("scavAssembly2"),
				regroup: true,
				count: -1,
			},
			templates: [cTempl.bloke, cTempl.minitruck, cTempl.lance, cTempl.bloke, cTempl.moncan, cTempl.bjeep, cTempl.firetruck] // Variety plus bus tanks
		},
		// These infested factories build units very fast, and then send against the player without retreating.
		"infestedFactory1": {
			assembly: "infestedAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 1,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(2)),
			templates: [cTempl.infciv] // Only infested civilians
		},
		"infestedFactory2": {
			assembly: "infestedAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 1,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(4)),
			// Infested civilians, with some occasional other units
			templates: [cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infciv] 
		},
		"infestedFactory3": {
			assembly: "infestedAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 1,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(5)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.inffiretruck]
		},
	});

	// Send scouts to the player LZ after a few seconds
	queue("sendScouts", camSecondsToMilliseconds(5));

	// All infested structures start out partially damaged
	preDamageInfestedStructs();

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);
}
