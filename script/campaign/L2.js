include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_yellowScavRes = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01", "R-Wpn-Flamer-Damage01",
	"R-Wpn-Cannon-Damage01",
];
const mis_cyanScavRes = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01", "R-Wpn-Flamer-Damage01",
	"R-Wpn-Cannon-Damage01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
];

// Player values
const MIS_CIVILIANS = 1; // Civilian Team
const MIS_CYAN_SCAVS = 2; // Cyan Scavengers
const MIS_YELLOW_SCAVS = 3; // Yellow Scavengers

// Keep track of which civilian groups have been freed
var civGroup1Free = false;
var civGroup2Free = false;
var civGroup3Free = false;

//Remove rescued civilians
camAreaEvent("civilianRemoveZone", function(droid)
{
	if (droid.player === MIS_CIVILIANS)
	{
		camSafeRemoveObject(droid, false);
	}

	resetLabel("civilianRemoveZone", MIS_CIVILIANS);
});

// Triggered when approaching the yellow scavs
camAreaEvent("yScavAttack", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camEnableFactory("yScavFactory");

		// Message about scavengers being dug in
		camQueueDialogue([
			{text: "CLAYDE: These scavengers are proving to be more than a nuisance.", delay: 0, sound: CAM_RCLICK},
			{text: "CLAYDE: But the more they obstruct us...", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: The more destruction they will bring upon themselves.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Go on, Commander.", delay: 3, sound: CAM_RCLICK},
		]);
	}
	else
	{
		resetLabel("yScavAttack", CAM_HUMAN_PLAYER);
	}
});

// Triggered when approaching the cyan scavs
camAreaEvent("cScavAttack", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camEnableFactory("cScavFactory1");
		camEnableFactory("cScavFactory2");

		// Release the monster bus
		camManageGroup(camMakeGroup("monsterBusGroup"), CAM_ORDER_COMPROMISE, {
			pos: getObject("LZ"),
			radius: 6,
			removable: false,
		});

		// Message about scavengers being cool
		camQueueDialogue([
			{text: "CLAYDE: Once you've finished your work out there, I'll", delay: 0, sound: CAM_RCLICK},
			{text: "have some extra questions for our contacts.", delay: 0},
			{text: "CLAYDE: These scavengers seem to have an interest in them.", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: Which means that they may be after the same goal...", delay: 3, sound: CAM_RCLICK},
		]);
	}
	else
	{
		resetLabel("cScavAttack", CAM_HUMAN_PLAYER);
	}
});

// Check if a civilian guard structure has been destroyed
// If so, free that civilian group
function checkCivilianGuards()
{
	// Ruins group
	if (getObject("civGuard1") === null && !civGroup1Free)
	{
		const area = getObject("civGroup1");
		const civs = enumArea(area.x, area.y, area.x2, area.y2, MIS_CIVILIANS, false);
		camManageGroup(camMakeGroup(civs), CAM_ORDER_DEFEND, {pos: camMakePos("civilianExit")});
		civGroup1Free = true;
		playSound(cam_sounds.rescue.civilianRescued);
	}
	// Yellow scav group
	if (getObject("civGuard2") === null && !civGroup2Free)
	{
		const area = getObject("civGroup2");
		const civs = enumArea(area.x, area.y, area.x2, area.y2, MIS_CIVILIANS, false);
		camManageGroup(camMakeGroup(civs), CAM_ORDER_DEFEND, {pos: camMakePos("civilianExit")});
		civGroup2Free = true;
		playSound(cam_sounds.rescue.civilianRescued);
	}
	// Cyan scav group
	if (getObject("civGuard3") === null && !civGroup3Free)
	{
		const area = getObject("civGroup3");
		const civs = enumArea(area.x, area.y, area.x2, area.y2, MIS_CIVILIANS, false);
		camManageGroup(camMakeGroup(civs), CAM_ORDER_DEFEND, {pos: camMakePos("civilianExit")});
		civGroup3Free = true;
		playSound(cam_sounds.rescue.civilianRescued);
	}
}

// Spawn civilians in random positions inside of their group areas
function populateCivilians()
{
	for (let i = 0; i < 5; ++i) // Spawn 5 civilians in area 1
	{
		camAddDroid(MIS_CIVILIANS, camRandPosIn("civGroup1"), cTempl.civ, _("Civilian"));
	}

	for (let i = 0; i < 6; ++i) // Spawn 7 civilians in area 2
	{
		camAddDroid(MIS_CIVILIANS, camRandPosIn("civGroup2"), cTempl.civ, _("Civilian"));
	}

	for (let i = 0; i < 6; ++i) // Spawn 6 civilians in area 3
	{
		camAddDroid(MIS_CIVILIANS, camRandPosIn("civGroup3"), cTempl.civ, _("Civilian"));
	}
}

function eventStartLevel()
{
	const startpos = getObject("startPosition");
	const lz = getObject("LZ");
	const tent = getObject("transporterEntry");
	const text = getObject("transporterExit");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L3", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(1.5),
		annihilate: true
	});
	camSetExtraObjectiveMessage(_("Rescue the civilian hostages"));

	// ally scavengers with civilians
	setAlliance(MIS_CIVILIANS, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CIVILIANS, MIS_CYAN_SCAVS, true);
	setAlliance(MIS_CIVILIANS, MIS_YELLOW_SCAVS, true);

	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Give scavengers weapon upgrades
	// Cyan scavengers get ROF upgrades too
	camCompleteRequiredResearch(mis_cyanScavRes, MIS_CYAN_SCAVS);
	camCompleteRequiredResearch(mis_yellowScavRes, MIS_YELLOW_SCAVS);

	changePlayerColour(MIS_CIVILIANS, 10); // Civilians to white (The scavengers keep their colours from last mission)

	camSetArtifacts({
		"yScavFactory": { tech: "R-Wpn-Rocket-ROF01" }, // Rocket Autoloader
		"mortarPit": { tech: "R-Wpn-Mortar01Lt" }, // Mortar
		"cScavFactory2": { tech: "R-Wpn-Cannon1Mk1" }, // Light Cannon
	});

	// Set up bases
	camSetEnemyBases({
		"yellowBase": {
			cleanup: "yScavBase1",
			detectMsg: "YSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"mortarRidge": {
			cleanup: "yScavBase2",
			detectMsg: "YSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"roadblock": {
			cleanup: "yScavBase3",
			detectMsg: "YSCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"cyanDepot": {
			cleanup: "cScavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"bridgeDefences": {
			cleanup: "cScavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"cyanBase": {
			cleanup: "cScavBase3",
			detectMsg: "CSCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
	});

	let infantryTemplates = [cTempl.bloke, cTempl.lance, cTempl.bjeep];
	if (difficulty <= MEDIUM)
	{
		infantryTemplates.push(cTempl.bloke);
	}
	else
	{
		// Add a kevlar bloke on Medium+
		infantryTemplates.push(cTempl.kevbloke);
		if (difficulty >= HARD)
		{
			// Replace armor up all infantry on Hard+
			infantryTemplates = camArrayReplaceWith(infantryTemplates, cTempl.bloke, cTempl.kevbloke);
			infantryTemplates = camArrayReplaceWith(infantryTemplates, cTempl.lance, cTempl.kevlance);
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
				morale: 50,
				fallback: camMakePos("yScavAssembly"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.bloke, cTempl.buggy, cTempl.lance, cTempl.bloke, cTempl.rbuggy, cTempl.trike] // Variety
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
			templates: infantryTemplates // Mostly infantry
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			data: {
				morale: 50,
				fallback: camMakePos("cScavAssembly2"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.buscan, cTempl.bjeep, cTempl.kevbloke, cTempl.bjeep, cTempl.rbjeep, cTempl.firetruck] // Mostly vehicles
		},
	});

	// Set up patrol groups
	camManageGroup(camMakeGroup("yScavPatrol"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("yPatrolPos1"),
			camMakePos("yPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(16)
	});
	camManageGroup(camMakeGroup("cScavPatrol"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("cPatrolPos1"),
			camMakePos("cPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(16)
	});

	// Spawn the scav Monster Bus tank
	const busPos = getObject("monsterBusGroup");
	camAddDroid(MIS_CYAN_SCAVS, busPos, cTempl.moncan, "The Battle Bus");

	if (difficulty < HARD) {
		// If we're below hard, remove one of the 3 yellow mortar pits
		camSafeRemoveObject("removablePit");
	}

	// If we're in Timerless mode, set up scavenger Cranes
	if (tweakOptions.rec_timerlessMode)
	{
		if (difficulty >= EASY)
		{
			// Cyan scav main base
			camManageTrucks(
				MIS_CYAN_SCAVS, {
					label: "cyanBase",
					rebuildBase: true,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
					template: cTempl.crane,
					structset: camAreaToStructSet("cScavBase3")
			});
		}
		if (difficulty >= HARD)
		{
			// Cyan scav depot base
			camManageTrucks(
				MIS_CYAN_SCAVS, {
					label: "cyanDepot",
					rebuildBase: true,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(120)),
					template: cTempl.crane,
					structset: camAreaToStructSet("cScavBase1")
			});
		}
		if (difficulty >= INSANE)
		{
			// Yellow scav mountain base
			camManageTrucks(
				MIS_YELLOW_SCAVS, {
					label: "yellowBase",
					rebuildBase: false,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(120)),
					template: cTempl.crane,
					structset: camAreaToStructSet("yScavBase1")
			});
		}
	}

	// Spawn civilians in their zones
	populateCivilians();

	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_CYAN_SCAVS);
	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_YELLOW_SCAVS);

	// Check the civilian groups on loop
	setTimer("checkCivilianGuards", camSecondsToMilliseconds(2));
}
