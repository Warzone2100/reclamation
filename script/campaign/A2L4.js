include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals02", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering01", "R-Cyborg-Metals02",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Vehicle-Engine02", "R-Struc-RprFac-Upgrade01", "R-Wpn-AAGun-Damage01",
];

var lzCyborgGroup;
var lzCScavGroup;
var site1Clear;
var site2Clear;
var site3Clear;
var vtolsCalled;
var factoriesEnabled;

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function heliAttack()
{
	const ext = {
		limit: [1, 1],
		alternate: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos", "vtolRemoveZone", [cTempl.helcan, cTempl.helhmg], camChangeOnDiff(camSecondsToMilliseconds(45)), "heliTower", ext);
}

// Called after a set delay or if the player advances VERY quickly
function vtolAttack()
{
	if (vtolsCalled)
	{
		return;
	}

	if (getObject("colCC") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	const templates = [cTempl.colatv, cTempl.colhmgv, cTempl.colbombv]; // Lancers, HMGs, and Cluster Bombs
	const ext = {
		limit: [2, 3, ((difficulty >= MEDIUM) ? 2 : 1)],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC", ext);
	vtolsCalled = true;
}

function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("landingDialogue");
	}
}

// Dialogue after landing next to a bunch of enemy cyborgs
function landingDialogue()
{
	camQueueDialogue([
		{text: "CLAYDE: Well...", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: So much for the element of surprise.", delay: 4, sound: CAM_RCLICK},
	]);
}

// Dialogue after all AA sites are neutralized
function clearDialogue()
{
	playSound(cam_sounds.objective.primObjectiveCompleted);
	camGrantBonusPower();

	camQueueDialogue([
		{text: "CLAYDE: Well done, Commander Bravo.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: We'll begin reinforcing Team Golf's position shortly.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Your objective has been accomplished.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Have the Collective ambush the player's LZ
// Queued to occur roughly after the player's second transport arrives
// Activates several factories, and immediately attacks the player's LZ with a Helicopter, Cyborgs, C-Scavs, and Hovers
function lzAmbush()
{
	camEnableFactory("colCybFactory1");
	camEnableFactory("colFactory2");
	camEnableFactory("cScavFactory");
	heliAttack();

	camManageGroup(lzCyborgGroup, CAM_ORDER_ATTACK, {repair: 75});
	camManageGroup(lzCScavGroup, CAM_ORDER_ATTACK, {morale: 50, fallback: camMakePos("cyborgRallyPos")});
	camManageGroup(camMakeGroup("hoverLzGroup"), CAM_ORDER_ATTACK, {repair: 75});

	// Also set a proper compromise zone for the player's LZ
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L5", {
		message: "RET_LZ",
		reinforcements: camMinutesToSeconds(2),
		callback: "antiAirSitesClear",
		area: "compromiseZone"
	});
}

// Enables the remaining Collective factories
// Called after a set delay or if the player advances quickly
function enableAllFactories()
{
	if (factoriesEnabled)
	{
		return;
	}

	camEnableFactory("colFactory1");
	camEnableFactory("colCybFactory2");

	// Enable the remaining Collective trucks
	camEnableTruck(["colAABase1", "colAABase2", "colAABase3"]);

	factoriesEnabled = true;
}

// Returns true if all main AA sites have been cleared
function antiAirSitesClear()
{
	const AA_SITES1 = enumArea("colBase1", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.name === "Hurricane AA Site"
		|| obj.name === "Cyclone AA Flak Site")
	).length;
	const AA_SITES2 = enumArea("colBase2", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.name === "Hurricane AA Site"
		|| obj.name === "Cyclone AA Flak Site")
	).length;
	const AA_SITES3 = enumArea("checkZone3", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.name === "Hurricane AA Site"
		|| obj.name === "Cyclone AA Flak Site")
	).length;

	// Add/remove objective blips
	if (AA_SITES1 === 0)
	{
		// Site 1 is clear
		if (!site1Clear)
		{
			hackRemoveMessage("AA_SITE1", PROX_MSG, CAM_HUMAN_PLAYER);
			site1Clear = true;
			camCallOnce("enableAllFactories");
		}
	}
	else
	{
		// Site 1 is no longer clear
		if (site1Clear)
		{
			hackAddMessage("AA_SITE1", PROX_MSG, CAM_HUMAN_PLAYER);
			site1Clear = false;
		}
	}

	if (AA_SITES2 === 0)
	{
		// Site 2 is clear
		if (!site2Clear)
		{
			hackRemoveMessage("AA_SITE2", PROX_MSG, CAM_HUMAN_PLAYER);
			site2Clear = true;
			camCallOnce("vtolAttack");
		}
	}
	else
	{
		// Site 2 is no longer clear
		if (site2Clear)
		{
			hackAddMessage("AA_SITE2", PROX_MSG, CAM_HUMAN_PLAYER);
			site2Clear = false;
		}
	}

	if (AA_SITES3 === 0)
	{
		// Site 3 is clear
		if (!site3Clear)
		{
			hackRemoveMessage("AA_SITE3", PROX_MSG, CAM_HUMAN_PLAYER);
			site3Clear = true;
		}
	}
	else
	{
		// Site 3 is no longer clear
		if (site3Clear)
		{
			hackAddMessage("AA_SITE3", PROX_MSG, CAM_HUMAN_PLAYER);
			site3Clear = false;
		}
	}

	if (AA_SITES1 === 0 && AA_SITES2 === 0 && AA_SITES3 === 0)
	{
		// All clear!
		camCallOnce("clearDialogue");
		return true;
	}
	else
	{
		return undefined;
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone");
	const transportEntryPos = {x: 23, y: 85};

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L5", {
		message: "RET_LZ",
		reinforcements: camMinutesToSeconds(2),
		callback: "antiAirSitesClear",
		area: "landingZone" // will add bigger compromise zone later
	});
	camSetExtraObjectiveMessage("Destroy the AA sites");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);

	camSetArtifacts({
		"colFactory1": { tech: "R-Vehicle-Body06" }, // Panther
		"colCBTower": { tech: "R-Sys-CBSensor-Turret01" }, // CB Turret
		"colCybFactory2": { tech: "R-Cyborg-Hvywpn-Mcannon" }, // Super Heavy-Gunner
		"colAAEmp": { tech: "R-Wpn-AAGun-ROF01" }, // AA Ammunition Hopper
		"colBombardPit": { tech: "R-Wpn-Mortar02Hvy" }, // Bombard
	});

	camSetEnemyBases({
		"cScavSEBase": {
			cleanup: "cScavBase",
			detectMsg: "CSCAV_BASE",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"colAABase1": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"colAABase2": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"colAABase3": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colHoverBase": {
			cleanup: "colBase4",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	const hoverTemplates = [ cTempl.comath, cTempl.commrah, cTempl.comath ];
	if (difficulty >= MEDIUM) hoverTemplates.push(cTempl.combbh); // Add Bunker Buster
	if (difficulty >= HARD) hoverTemplates.push(cTempl.comhpvh); // Add Hyper Velocity Cannon

	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(75)),
			templates: [ cTempl.comhmgt, cTempl.colpodt, cTempl.commcant, cTempl.colmrat, cTempl.comatt ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_PATROL,
			data: {
				// Hovers that patrol the map and harass the player's forces
				repair: 50,
				pos: [
					camMakePos("hoverPatrolPos1"),
					camMakePos("hoverPatrolPos2"),
					camMakePos("hoverPatrolPos3"),
					camMakePos("hoverPatrolPos4"),
					camMakePos("hoverPatrolPos5"),
					camMakePos("hoverPatrolPos6"),
				],
				interval: camSecondsToMilliseconds(28)
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			templates: hoverTemplates
		},
		"colCybFactory1": {
			assembly: "colCybAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			templates: [ cTempl.cybfl, cTempl.cybhg, cTempl.cybgr, cTempl.cybhg ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			templates: [ cTempl.cybla, cTempl.scymc, cTempl.cybla ]
		},
		"cScavFactory": {
			assembly: "cScavAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.monmrl, cTempl.buscan, cTempl.kevbloke, cTempl.gbjeep, cTempl.firetruck, cTempl.monlan, cTempl.lance, cTempl.buggy, cTempl.kevbloke ]
		},
	});

	// Set up trucks
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 70 : 140));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colHoverBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase4")
	});	
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colAABase1",
			enabled: false, // Enabled later...
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.coltruckht,
			structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colAABase2",
			enabled: false, // Enabled later...
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= HARD),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: ((difficulty >= MEDIUM) ? cTempl.comtruckt : cTempl.coltruckht),
			structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colAABase3",
			enabled: false, // Enabled later...
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= MEDIUM),
			respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase3")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(70));
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavSEBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct.stat)))
		});

		if (difficulty >= HARD)
		{
			// Collective main base (again)
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colAABase3",
					respawnDelay: TRUCK_TIME * 2,
					rebuildBase: true,
					template: cTempl.comtruckht,
					structset: camAreaToStructSet("colBase3")
			});
		}
	}

	// Upgrade Collective structures on higher difficulties
	if (difficulty == HARD)
	{
		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower01", "Sys-SensoTower02", true); // Sensor Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower02", "WallTower03", true); // Cannon Hardpoints
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof", true); // AA Sites
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower01", "Sys-SensoTower02"); // Sensor Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower02", "WallTower03"); // Cannon Hardpoints
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof"); // AA Sites

		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MortarPit01", "Emplacement-MortarPit02", true); // Mortar Pits
	}

	camManageGroup(camMakeGroup("cyborgPatrolGroup"), CAM_ORDER_PATROL, {
		repair: 60,
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3")
		],
		interval: camSecondsToMilliseconds(24)
	});

	vtolsCalled = false;
	site1Clear = false;
	site2Clear = false;
	site3Clear = false;
	factoriesEnabled = false;

	hackAddMessage("AA_SITE1", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("AA_SITE2", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("AA_SITE3", PROX_MSG, CAM_HUMAN_PLAYER);

	// Move the Collective Cyborgs away from the player's LZ
	lzCyborgGroup = camMakeGroup("cyborgLzGroup");
	camManageGroup(lzCyborgGroup, CAM_ORDER_DEFEND, {pos: camMakePos("cyborgRallyPos"), radius: 10});
	// Also rally some C-Scavs
	lzCScavGroup = camMakeGroup("cScavLzGroup");
	camManageGroup(lzCScavGroup, CAM_ORDER_DEFEND, {pos: camMakePos("cyborgRallyPos"), radius: 10});

	queue("lzAmbush", camMinutesToMilliseconds(2.5));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(10)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(16)));

	camSetSunIntensity(.35, .35, .45);
	camSetWeather(CAM_WEATHER_RAINSTORM);
}