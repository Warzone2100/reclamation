include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_CYAN_SCAVS = 5;

const mis_scavResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade02", "R-Sys-Engineering01",
];
const mis_collectiveResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals02", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering01", "R-Cyborg-Metals02",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy01", "R-Vehicle-Engine02",
	"R-Struc-RprFac-Upgrade01", "R-Wpn-AAGun-Damage01",
];

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function heliAttack1()
{
	const ext = {
		limit: 1,
	};
	camSetVtolData(MIS_CYAN_SCAVS, "heliAttackPos1", "vtolRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(1.5)), "scavHeliTower", ext);
}

function heliAttack2()
{
	// Focus on the player
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
		// pos: camMakePos("landingZone")
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos2", "vtolRemoveZone", [cTempl.helpod, cTempl.helhmg, cTempl.helcan], camChangeOnDiff(camMinutesToMilliseconds(1.25)), "cScavHeliTower", ext);
}

function vtolAttack()
{
	if (getObject("colCC") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	// Focus towards the player's LZ
	const templates = [cTempl.colatv, cTempl.colhmgv]; // Lancers and HMGs
	const ext = {
		limit: [2, 3],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "colCC", ext);
}

// Start moving scavenger patrol groups
function groupPatrol()
{
	camManageGroup(camMakeGroup("scavPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos6"),
			camMakePos("patrolPos7")
		],
		interval: camSecondsToMilliseconds(15)
	});

	camManageGroup(camMakeGroup("cyborgPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos4"),
			camMakePos("patrolPos5")
		],
		interval: camSecondsToMilliseconds(15)
	});
	camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2")
			// More positions are added later
		],
		interval: camSecondsToMilliseconds(28),
		repair: 60
	});
}

function startCollectiveTransports()
{
	sendCollectiveTransporter();
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3)));
}

function sendCollectiveTransporter() 
{
	// First, check if the LZ is still alive
	if (camBaseIsEliminated("colLZBase"))
	{
		// Try again next time...
		return;
	}

	// Next, add grab some droids for the transport
	const TRANSPORT_SIZE = ((difficulty <= EASY) ? 6 : ((difficulty < INSANE) ? 8 : 10));
	const droidPool = [
		cTempl.cybmr, cTempl.cybgr, cTempl.colaaht, cTempl.colflamt,
		cTempl.colmrat, cTempl.colcanht, cTempl.cybla
	];
	if (difficulty >= MEDIUM) droidPool.push(cTempl.commcant);

	const droids = [];
	for (let i = 0; i < TRANSPORT_SIZE; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	// Send the transport!
	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("heliAttackPos2"),
			exit: camMakePos("heliAttackPos2"),
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 20
			}
		}
	);
}

// Enable all remaining scav/Collective factories
// By this point in the campaign, the scavengers shouldn't pose that much of a hazard to the player
function enableAllFactories()
{
	camEnableFactory("scavFactory3");
	camEnableFactory("scavFactory4");
	camEnableFactory("colFactory");
	camEnableFactory("colCybFactory");

	// Also expand the Collective commander's patrol region
	if (getObject("colCommander") !== null)
	{
		// Collective commander still alive
		camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos1"),
				camMakePos("patrolPos2"),
				camMakePos("patrolPos3")
			],
			interval: camSecondsToMilliseconds(34),
			repair: 60
		});
	}

	camQueueDialogue([
		{text: "CLAYDE: Hmm. It seems that there's still a significant", delay: 0, sound: CAM_RCLICK},
		{text: "amount of scavengers opposing the Collective.", delay: 0},
		{text: "CLAYDE: I wonder if we can work this to our advantage...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Do you think we could form some sort of alliance with them, General?", delay: 6, sound: CAM_RCLICK},
		{text: "CLAYDE: Hmm...", delay: 5, sound: CAM_RCLICK},
		{text: "CLAYDE: Perhaps... in a manner of speaking.", delay: 2},
		{text: "LIEUTENANT: I don't see what you mean, sir.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: I'll discuss it with you later, Lieutenant.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: As for you, Bravo, continue with your mission.", delay: 3, sound: CAM_RCLICK},
	]);
}

// If the Collective commander is still alive, order it to attack the player directly (no more patrolling)
function aggroCommander()
{
	if (getObject("colCommander") !== null)
	{
		// Collective commander still alive
		camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_ATTACK, {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 60
		});
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A2L4S");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camSetArtifacts({
		"colFactory": { tech: "R-Vehicle-Prop-Hover" }, // Hover Propulsion
		"colResearch": { tech: "R-Wpn-Cannon-ROF02" }, // Cannon Autoloader Mk2
		"colCybFactory": { tech: "R-Wpn-MG-Damage04" }, // APDSB MG Bullets Mk3
	});

	camCompleteRequiredResearch(mis_scavResearch, MIS_CYAN_SCAVS);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);

	camSetEnemyBases({
		"scavCityBase": {
			cleanup: "scavBase1",
			detectMsg: "CYAN_SCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"scavBasinBase": {
			cleanup: "scavBase2",
			detectMsg: "CYAN_SCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"cScavMarshBase": {
			cleanup: "cScavBase",
			detectMsg: "CSCAV_BASE",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"colLZBase": {
			cleanup: "colLzStructs",
			detectMsg: "COL_LZ",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colHydroBase": {
			cleanup: "colBase",
			detectMsg: "COL_BASE",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_THE_COLLECTIVE,
		},
	});

	camSetFactories({
		"scavFactory1": {
			assembly: "scavAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				// Target the player
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(18)),
			templates: [ cTempl.buscan, cTempl.bjeep, cTempl.sartruck, cTempl.kevbloke ]
		},
		"scavFactory2": {
			assembly: "scavAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.gbjeep, cTempl.kevbloke, cTempl.gbjeep, cTempl.kevlance, cTempl.kevbloke ]
		},
		"scavFactory3": {
			assembly: "scavAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				// Target the Collective
				targetPlayer: CAM_THE_COLLECTIVE
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(18)),
			templates: [ cTempl.bjeep, cTempl.kevbloke, cTempl.kevlance, cTempl.buscan, cTempl.minitruck, cTempl.kevlance ]
		},
		"scavFactory4": {
			assembly: "scavAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.flatmrl, cTempl.monsar, cTempl.minitruck, cTempl.gbjeep, cTempl.rbjeep, cTempl.kevlance, cTempl.buscan ]
		},
		"cScavFactory": {
			assembly: "cScavAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.flatat, cTempl.buscan, cTempl.moncan, cTempl.gbjeep, cTempl.rbuggy ]
		},
		"colFactory": {
			assembly: "colAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 20
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			templates: [ cTempl.commcant, cTempl.colaaht, cTempl.comatt, cTempl.commcant, cTempl.comhmgt ]
		},
		"colCybFactory": {
			assembly: "colCybAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 20
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [ cTempl.cybhg, cTempl.cybmr, cTempl.cybhg, cTempl.scymc ]
		},
	});

	const COMMANDER_RANK = (difficulty <= MEDIUM) ? "Regular" : "Professional";
	camSetDroidRank(getObject("colCommander"), COMMANDER_RANK);

	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup"), {
			templates: [ // (2 Mini-Rocket Pods, 2 Medium Cannons, 3 Super-Heavy Gunners, 3 Heavy Machinegunners, 1 Heavy Machinegun, 1 Cyclone AA)
				cTempl.colpodt, cTempl.colpodt,
				cTempl.commcant, cTempl.commcant,
				cTempl.scymc, cTempl.scymc, cTempl.scymc,
				cTempl.cybhg, cTempl.cybhg, cTempl.cybhg,
				cTempl.comhmgt,
				cTempl.comhaat,
				cTempl.cybla, cTempl.cybla, // 2 Lancers (Hard+)
			],
			factories: ["colFactory", "colCybFactory"],
			obj: "colCommander" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander",
			repair: 60,
			suborder: CAM_ORDER_ATTACK
	});
	// Hover patrol group
	const hoverTemplates = [ // 2 Lancers, 2 MRAs
		cTempl.comath, cTempl.comath,
		cTempl.commrah, cTempl.commrah,
	];
	if (difficulty >= HARD)
	{
		// Add a Bunker Buster >:)
		hoverTemplates.push(cTempl.combbh);
	}
	camMakeRefillableGroup(
		undefined, {
			templates: hoverTemplates,
			factories: ["colFactory"],
			obj: "colCC" // Stop refilling this group if the CC dies
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("hoverPatrolPos2"),
				camMakePos("hoverPatrolPos3"),
				camMakePos("hoverPatrolPos4"),
				camMakePos("hoverPatrolPos5")
			],
			interval: camSecondsToMilliseconds(28),
			repair: 60
	});
	// Trucks
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(70));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colHydroBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= EASY),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck"),
			structset: camAreaToStructSet("colBase")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(70));
		camManageTrucks(
			MIS_CYAN_SCAVS, {
				label: "scavCityBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("scavBase1")
		});
		camManageTrucks(
			MIS_CYAN_SCAVS, {
				label: "scavBasinBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("scavBase2")
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavMarshBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct.stat)))
		});

		if (difficulty >= MEDIUM)
		{
			// Collective main base (again)
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colHydroBase",
					respawnDelay: TRUCK_TIME,
					rebuildBase: true,
					template: cTempl.comtruckt,
					structset: camAreaToStructSet("colBase")
			});
		}
		if (difficulty >= HARD)
		{
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colLZBase",
					respawnDelay: TRUCK_TIME,
					rebuildBase: true,
					template: cTempl.comtruckt,
					structset: camAreaToStructSet("colLzStructs")
			});
		}
	}
	else
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.25)));
	}

	// Upgrade Collective structures on higher difficulties
	if (difficulty == HARD)
	{
		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower01", "Sys-SensoTower02", true); // Sensor Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower02", "WallTower03", true); // Cannon Hardpoints
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower01", "Sys-SensoTower02"); // Sensor Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower02", "WallTower03"); // Cannon Hardpoints

		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MortarPit01", "Emplacement-MortarPit02", true); // Mortar Pits
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof", true); // AA Sites
	}

	camAutoReplaceObjectLabel(["scavHeliTower", "cScavHeliTower", "colCC"]);

	// These factories are active immediately
	camEnableFactory("cScavFactory");
	camEnableFactory("scavFactory1");
	camEnableFactory("scavFactory2");

	queue("groupPatrol", camSecondsToMilliseconds(5));
	queue("heliAttack2", camChangeOnDiff(camSecondsToMilliseconds(80)));
	queue("heliAttack1", camChangeOnDiff(camMinutesToMilliseconds(5)));
	queue("enableAllFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("startCollectiveTransports", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(10)));
	queue("aggroCommander", camChangeOnDiff(camMinutesToMilliseconds(12)));

	// Give player briefing.
	camPlayVideos({video: "A2L3_BRIEF", type: MISS_MSG});

	// Lighten the fog to *more or less* 2x default brightness
	camSetFog(32, 32, 96);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Increase the lighting
	camSetSunIntensity(.6,.6,.6);
	camSetWeather(CAM_WEATHER_CLEAR);
}