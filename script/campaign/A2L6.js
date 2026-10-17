include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include("script/campaign/structSets.js");

const MIS_LZ_SCAVS = 1;
const MIS_TEAM_CHARLIE = 5;
const MIS_TEAM_GOLF = 6;
const transportEntryPosCharlie = { x: 2, y: 2 };
const transportEntryPosGolf = { x: 30, y: 2 };
const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine03", "R-Wpn-AAGun-Accuracy01",
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

var stealthPhase;
var playerHidden;
var survivedInfested;
var storedMissionTime;

var charlieCommander;
var charlieCommandGroup;
var golfSensor;
var golfSensorGroup;
var golfAttackGroup;
var golfVtolGroup;
var charlieTruckJob1;
var charlieTruckJob2;
var charlieTruckJob3;
var golfTruckJob1;
var golfTruckJob2;
var golfTruckJob3;
var golfTruckJob4;

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

// Called shortly after the player breaks stealth
function heliAttack()
{
	const ext = {
		limit: [1, 1, 1],
		targetPlayer: CAM_HUMAN_PLAYER,
		alternate: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos1", "vtolRemoveZone", [cTempl.helcan, cTempl.helhmg, cTempl.helpod], camChangeOnDiff(camSecondsToMilliseconds(30)), "heliTower", ext);
}

// Called shortly after the player breaks stealth
function vtolAttack1()
{
	if (getObject("colCC1") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	const templates = [cTempl.colatv, cTempl.colhmgv]; // Lancers and HMGs
	const ext = {
		limit: [2, 3],
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos1", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "colCC1", ext);
}

// Called after a long delay or when the player advances far enough
function vtolAttack2()
{
	if (getObject("colCC2") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	const templates = [cTempl.colatv, cTempl.combombv]; // Lancers and Cluster Bombs
	const ext = {
		limit: [((difficulty >= HARD) ? 3 : 2), 2],
		targetPlayer: CAM_HUMAN_PLAYER,
		alternate: true,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC2", ext);
}

// Break "stealth" when the player attacks certain enemies
// If the player engages the LZ scavs, start a 1 minute timer and remove their sensor debuff.
// If the player engages Collective after the stealth section, remove the sensor debuff from everyone and start the mission proper.
// If the player engages Collective during the stealth section, fail the player.
function eventAttacked(victim, attacker)
{
	if (victim.player !== CAM_HUMAN_PLAYER && attacker.player !== CAM_HUMAN_PLAYER)
	{
		// If the player is neither the attacker nor victim, we don't care about it.
		return;
	}

	if (victim.player === MIS_LZ_SCAVS || attacker.player === MIS_LZ_SCAVS)
	{
		camCallOnce("activateLzScavs");
	}
	if (victim.player === CAM_THE_COLLECTIVE || attacker.player === CAM_THE_COLLECTIVE)
	{
		playerHidden = false;
		if (stealthPhase)
		{
			// The player has been detected by the Collective! (early!!!!)
			camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], CAM_THE_COLLECTIVE);
		}
		else
		{
			// Begin the assault!
			camCallOnce("activateCollective");
		}
	}
}

function eventDestroyed(obj)
{
	if (!allianceExistsBetween(CAM_HUMAN_PLAYER, MIS_LZ_SCAVS))
	{
		return;
	}

	if (obj.type === STRUCTURE && obj.player === MIS_LZ_SCAVS)
	{
		// Prison safehouse destroyed; queitly replace it (shhhh)
		addStructure("CivWarehouse1", MIS_LZ_SCAVS, obj.x * 128, obj.y * 128);
	}
}

function activateLzScavs()
{
	// Undo the sensor debuff
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], MIS_LZ_SCAVS);
	// NOTE: This part is timed even in timerless mode!
	storedMissionTime = getMissionTime();
	setMissionTime(camChangeOnDiff(70));
	camEnableFactory("lzScavFactory");
}

// Place a new LZ, enable reinforcements, and queue the end of the stealth phase
function camEnemyBaseEliminated_scavLZBase()
{
	// const lz = getObject("landingZone2");
	// setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	hackRemoveMessage("CLEAR_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
	

	if (!tweakOptions.rec_timerlessMode)
	{
		// Set to the "real" mission time
		setMissionTime(storedMissionTime + camChangeOnDiff(camHoursToSeconds(1.75)));
	}
	else
	{
		// Remove the timer
		setMissionTime(-1);
	}

	// Dialogue about cleared LZs
	camQueueDialogue([
		{text: "LIEUTENANT: Good job, Bravo. Your LZ is secure.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Call in the reinforcements you need, but don't attack the Collective yet.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We need to wait until the other teams are ready and in place.", delay: 3, sound: CAM_RCLICK},
		// Long delay...
		{text: "CHARLIE: Team Charlie here; our LZ is secure.", delay: 16, sound: CAM_RCLICK},
		{text: "CHARLIE: We're standing by for your signal, Lieutenant.", delay: 3, sound: CAM_RCLICK},
		// Long delay...
		{text: "GOLF: Team Golf here, we're ready to go.", delay: 12, sound: CAM_RCLICK},
		{text: "GOLF: Let's break that prison and get everyone home in one piece.", delay: 3, sound: CAM_RCLICK},
		{delay: 5, callback: "endStealthPhase"},
	]);

	// Allow the player to call reinforcements
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L7", {
		reinforcements: camMinutesToSeconds(1.75),
		area: "compromiseZone",
		callback: "playerDetected", // Will change once the stealth phase is officially "ended"
		retlz: true,
	});
	setReinforcementTime(30); // The first transport extra fast
	camSetExtraObjectiveMessage("Avoid detection by the Collective");

	// queue("endStealthPhase", camSecondsToMilliseconds(60));
}

function camEnemyBaseEliminated_colMainBase()
{
	camCallOnce("campCleared");
}

function resetReinforcementTime()
{
	setReinforcementTime(camMinutesToSeconds(1.75)); // Revert to standard reinforcement time after the first transport
}

// Sends a scout group searching for the player
// This group will break the player's stealth and start the mission proper
// Basically just to prevent the player from sitting around too long before attacking
// This function is also called when the player is revealed
function sendCollectiveScouts()
{
	camManageGroup(camMakeGroup("colScoutGroup"), CAM_ORDER_COMPROMISE, {
		pos: camMakePos("landingZone1"),
		morale: 20,
		fallback: camMakePos("cScavAssembly1"),
	});

	if (!playerHidden) return; // Don't play dialogue if the player has already been revealed
	// Dialogue warning of Collective scouts
	camQueueDialogue([
		{text: "LIEUTENANT: Team Bravo, I'm detecting increased comms traffic near your position.", delay: 0, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Seems like they're wondering why that outpost hasn't reported back.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Your cover won't last much longer, get ready to fight!", delay: 3, sound: CAM_RCLICK},
	]);
}

// End the stealth phase and expand the map
function endStealthPhase()
{
	// Transmission about Clayde's "diversion"
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "A2L6_DIVERSION", type: MISS_MSG}]);

	stealthPhase = false;
	queue("sendCollectiveScouts", camChangeOnDiff(camMinutesToMilliseconds(3.5)));

	camCallOnce("stealthBreakDialogue");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L7", {
		message: "RET_LZ",
		reinforcements: camMinutesToSeconds(1.75),
		area: "compromiseZone",
		retlz: true,
		callback: "canLeave", // No longer fail when detected
	});
	camSetExtraObjectiveMessage("Clear the Collective prison camp");

	// Expand the map boundaries
	setScrollLimits(0, 0, 160, 56);

	// HACK: Move the sun position slightly to avoid weird shadows when expanding the map
	camSetSunPos(225.0, -601.0, 450.0);
}

// Activate the Collective and all allies
// Also queue up a bunch of events for later
function activateCollective()
{
	// Send scouts if they haven't been sent already
	sendCollectiveScouts();

	// Remove the sensor debuff from everyone
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff-Undo"], MIS_TEAM_GOLF);

	// Set up groups
	// Collective patrols
	camManageGroup(camMakeGroup("cScavPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
		],
		interval: camSecondsToMilliseconds(28)
	});
	camManageGroup(camMakeGroup("colCommander1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3"),
			camMakePos("patrolPos4"),
		],
		interval: camSecondsToMilliseconds(32),
		repair: 75
	});
	camManageGroup(camMakeGroup("colCommander2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos5"),
			camMakePos("patrolPos6"),
			camMakePos("patrolPos7"),
			camMakePos("patrolPos8"),
			camMakePos("patrolPos9"),
		],
		interval: camSecondsToMilliseconds(32),
		repair: 75
	});
	// Collective refillable groups
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup1"), {
			templates: [ // 4 MR Cyborgs, 2 Lancers, 2 Medium Cannons, 2 Hurricanes
				cTempl.cybmr, cTempl.cybmr, cTempl.cybmr, cTempl.cybmr,
				cTempl.comatt, cTempl.comatt,
				cTempl.commcant, cTempl.commcant,
				cTempl.colaaht, cTempl.colaaht,
				cTempl.scymc, cTempl.scymc, // 2 Super Heavy Gunners (Hard+)
			],
			factories: ["colFactory4", "colCybFactory5"],
			obj: "colCommander1" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander1",
			repair: 60,
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup2"), {
			templates: [ // 2 HVCs, 2 HMGs, 2 Lancer Cyborgs, 2 Super Heavy-Gunners, 2 Heavy Cannons, 1 Cyclone, 1 Repair Turret
				cTempl.comhpvt, cTempl.comhpvt,
				cTempl.comhmgt, cTempl.comhmgt,
				cTempl.cybla, cTempl.cybla,
				cTempl.scymc, cTempl.scymc,
				cTempl.cohhcant, cTempl.cohhcant,
				cTempl.comhaat,
				cTempl.comrept,
				cTempl.cybla, cTempl.cybla,  // 2 Lancer Cyborgs (Hard+)
			],
			factories: ["colFactory4", "colCybFactory5"],
			obj: "colCommander2"
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander2",
			repair: 60,
			suborder: CAM_ORDER_ATTACK
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Lancers, 2 MRAs, 2 HVCs
				cTempl.comath, cTempl.commrah, cTempl.comhpvh,
				cTempl.comath, cTempl.commrah, cTempl.comhpvh,
			],
			factories: ["colFactory3"],
			obj: "colCC1"
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("hoverPatrolPos2"),
				camMakePos("hoverPatrolPos3"),
			],
			interval: camSecondsToMilliseconds(18),
			repair: 80
	});
	// Allied refillable groups
	charlieCommander = camMakeRefillableGroup(
		camMakeGroup("charlieCommander"), {
			templates: [cTempl.plmcomht]
		}, CAM_ORDER_ATTACK, {
			repair: 50
	});
	charlieCommandGroup = camMakeRefillableGroup(
		camMakeGroup("charlieCommandGroup"), {
			templates: [ // 2 Lancers, 2 Bunker Busters, 4 Heavy Machinegunners, 2 Super Heavy-Gunners
				cTempl.plmatht, cTempl.plmatht,
				cTempl.plmbbht, cTempl.plmbbht,
				cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, cTempl.cybhg,
				cTempl.scymc, cTempl.scymc,
			],
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieCommander",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {pos: camMakePos("landingZoneCharlie")}
	});
	golfSensor = camMakeRefillableGroup(
		camMakeGroup("golfSensor"), {
			templates: [cTempl.plmsenst]
		}, CAM_ORDER_ATTACK, {
			pos: camMakePos("patrolPos8"), // Focus on the northern route
			repair: 50
	});
	golfSensorGroup = camMakeRefillableGroup(
		camMakeGroup("golfSensorGroup"), {
			templates: [cTempl.plmhmortt, cTempl.plmhmortt, cTempl.plmhmortt, cTempl.plmhmortt]
		}, CAM_ORDER_FOLLOW, {
			leader: "golfSensor",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {pos: camMakePos("landingZoneGolf")}
	});
	golfAttackGroup = camMakeRefillableGroup(
		camMakeGroup("golfAttackGroup"), {
			templates: [
				cTempl.plmmcant, cTempl.plmmcant, cTempl.plmmcant, cTempl.plmmcant,
				cTempl.plmmrat, cTempl.plmmrat, cTempl.plmmrat, cTempl.plmmrat,
				cTempl.plmhaat, cTempl.plmhaat,
			]
		}, CAM_ORDER_ATTACK, {
			pos: camMakePos("patrolPos8"), // Focus on the northern route
			repair: 50
	});
	golfVtolGroup = camMakeRefillableGroup(
		camMakeGroup("golfVtolGroup"), {
			templates: [cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv, cTempl.pllbombv]
		}, CAM_ORDER_ATTACK, {
			repair: 50
	});

	// Set up trucks
	// Collective trucks
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 35 : 70));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colBasinOutpost",
			respawnDelay: TRUCK_TIME,
			template: cTempl.coltruckht,
			structset: camAreaToStructSet("colBase1").filter((struct) => (!camIsScavStruct(struct.stat)))
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthCanalRoadblock",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.coltruckht,
			structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthCanalBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase3")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthCanalBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase4")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colEastCanalBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase5")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCraterBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.coltruckht,
			structset: camAreaToStructSet("colBase6")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			respawnDelay: TRUCK_TIME / 2,
			rebuildBase: tweakOptions.rec_timerlessMode,
			template: cTempl.comtruckt,
			structset: camAreaToStructSet("colBase7")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(70));
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colBasinOutpost",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("colBase1").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavCanalBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		if (difficulty >= MEDIUM)
		{
			// Add another crane to the central scav base
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "cScavCanalBase",
					rebuildBase: true,
					respawnDelay: CRANE_TIME,
					template: cTempl.crane,
					structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct.stat)))
			});
		}
		if (difficulty >= HARD)
		{
			// Add even more trucks...
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colNorthCanalBase",
					respawnDelay: TRUCK_TIME * 2,
					rebuildBase: tweakOptions.rec_timerlessMode,
					template: cTempl.comtruckht,
					structset: camAreaToStructSet("colBase3")
			});
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colMainBase",
					respawnDelay: TRUCK_TIME,
					rebuildBase: tweakOptions.rec_timerlessMode,
					template: cTempl.comtruckht,
					structset: camAreaToStructSet("colBase7")
			});
		}
	}

	// Upgrade Collective structures on higher difficulties
	if (difficulty == HARD)
	{
		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "GuardTower1", "GuardTower3", true); // HMG Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower01", "Sys-SensoTower02", true); // Sensor Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower02", "WallTower03", true); // Cannon Hardpoints
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MRL-pit", "Emplacement-MRLHvy-pit", true); // MRA Emplacements
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof", true); // AA Sites
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MortarPit01", "Emplacement-MortarPit02", true); // Mortar Pits
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MRL-pit", "Emplacement-MRLHvy-pit"); // MRA Emplacements
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof"); // AA Sites
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MortarPit01", "Emplacement-MortarPit02"); // Mortar Pits

		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower02", "WallTower03", true); // Cannon Hardpoints
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "PillBox4", "PillBoxHPC", true); // Cannon Bunkers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower01", "Sys-SensoTower02", true); // Sensor Towers
	}

	// Allied Trucks
	charlieTruckJob1 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieLZ",
			rebuildBase: true,
			truckDroid: getObject("charlieEngineer"),
			structset: camAreaToStructSet("charlieStructZone")
	});
	charlieTruckJob2 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieForward",
			rebuildBase: true,
			structset: camA2L6CharlieForwardStructs1
	});
	charlieTruckJob3 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charliePrison",
			rebuildBase: true,
			structset: camA2L6CharlieForwardStructs2
	});
	golfTruckJob1 = camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfLZ",
			rebuildBase: true,
			truckDroid: getObject("golfTruck1"),
			structset: camAreaToStructSet("golfStructZone")
	});
	golfTruckJob2 = camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfLZ",
			rebuildBase: true,
			truckDroid: getObject("golfTruck2"),
			structset: camAreaToStructSet("golfStructZone")
	});
	golfTruckJob3 = camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfForward",
			rebuildBase: true,
			structset: camA2L6GolfForwardStructs
	});
	golfTruckJob4 = camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfForward",
			rebuildBase: true,
			structset: camA2L6GolfForwardStructs
	});

	// Start timers and queues
	setTimer("sendCharlieTransporter", camMinutesToMilliseconds(1.75));
	setTimer("sendGolfTransporter", camMinutesToMilliseconds(1.75));
	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(1.25)));
	queue("vtolAttack1", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("enableMoreFactories", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("golfBodyCheck", camChangeOnDiff(camMinutesToMilliseconds(10)));
	queue("vtolAttack2", camChangeOnDiff(camMinutesToMilliseconds(12)));
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(16)));

	// Activate some factories immediately
	camEnableFactory("cScavFactory1");
	camEnableFactory("colFactory1");
	camEnableFactory("colFactory2");
	camEnableFactory("colCybFactory1");
	camEnableFactory("colCybFactory2");
	// NOTE: These factories only resupply refillable groups for now
	camEnableFactory("colFactory4");
	camEnableFactory("colCybFactory5");

	// Dialogue when the cool epic awesome fighting starts
	camSkipDialogue(); // If anyone was already talking; shut up :P
	camQueueDialogue([
		{text: "GOLF: Fire at will!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Let's move!", delay: 1, sound: CAM_RCLICK},
		{text: "GOLF: We can't stop until we breach that camp!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Push up; move before they can regroup!", delay: 5, sound: CAM_RCLICK},
	]);

	// Grant vision of allied objects to the player
	camSetObjectVision(MIS_TEAM_CHARLIE);
	camSetObjectVision(MIS_TEAM_GOLF);

	// Ensure the player can't attack the prisoner safehouses
	setAlliance(MIS_LZ_SCAVS, CAM_HUMAN_PLAYER, true);
}

function sendCharlieTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Charlie, this is:
	// Trucks -> Commander -> Command Group
	let droidQueue = [];

	if (!camDef(camGetTruck(charlieTruckJob1))) droidQueue.push(cTempl.cyben);
	if (camBaseIsEliminated("colNorthCanalBase") && !camDef(camGetTruck(charlieTruckJob2))) droidQueue.push(cTempl.plmtruckht);
	if (camBaseIsEliminated("colMainBase") && !camDef(camGetTruck(charlieTruckJob3))) droidQueue.push(cTempl.plmtruckht);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([charlieCommander, charlieCommandGroup]));

	const droids = [];
	// Get (up to) the first 10 units in the queue
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZoneCharlie"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: transportEntryPosCharlie,
				exit: transportEntryPosCharlie
			}
		);
	}
}

function sendGolfTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Golf, this is:
	// Trucks -> Sensor -> Sensor Group -> Attack Group -> VTOL Group
	let droidQueue = [];

	if (!camDef(camGetTruck(golfTruckJob1))) droidQueue.push(cTempl.plmtruckt);
	if (!camDef(camGetTruck(golfTruckJob2))) droidQueue.push(cTempl.plmtruckt);
	if (camBaseIsEliminated("colNorthCanalBase") && !camDef(camGetTruck(golfTruckJob3))) droidQueue.push(cTempl.plmtruckt);
	if (camBaseIsEliminated("colNorthCanalBase") && !camDef(camGetTruck(golfTruckJob4))) droidQueue.push(cTempl.plmtruckt);


	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([golfSensor, golfSensorGroup, golfAttackGroup, golfVtolGroup]));

	const droids = [];
	// Get (up to) the first 10 units in the queue
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_GOLF, camMakePos("landingZoneGolf"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: transportEntryPosGolf,
				exit: transportEntryPosGolf
			}
		);
	}
}

// Assign allied reinforcements
function eventTransporterLanded(transport)
{
	if (transport.player == CAM_HUMAN_PLAYER)
	{
		camCallOnce("landingDialogue");

		if (camBaseIsEliminated("scavLZBase"))
		{
			camCallOnce("resetReinforcementTime");
		}
		return; // don't care afterwards
	}

	const transDroids = camGetTransporterDroids(transport.player);
	let truckJobs = [];
	let otherGroups = [];
	switch (transport.player)
	{
		case MIS_TEAM_CHARLIE:
		{
			truckJobs = [charlieTruckJob1, charlieTruckJob2, charlieTruckJob3];
			otherGroups = [charlieCommander, charlieCommandGroup];
			break;
		}
		case MIS_TEAM_GOLF:
		{
			truckJobs = [golfTruckJob1, golfTruckJob2, golfTruckJob3, golfTruckJob4];
			otherGroups = [golfSensor, golfSensorGroup, golfAttackGroup, golfVtolGroup];
			break;
		}
		default:
		{
			// How did we get here?
			return;
		}
	}

	const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
	const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

	// Assign any trucks/engineers
	let truckIndex = 0;
	for (const job of truckJobs)
	{
		// Check if we have an open job and an available truck
		if (!camDef(camGetTruck(job)) && camDef(transTrucks[truckIndex]))
		{
			// Assign this truck!
			camAssignTruck(transTrucks[truckIndex], job);
			truckIndex++;
		}
	}

	// Next, check if any new commander/sensor unit has landed
	// If so, apply the appropriate label
	for (const droid of transOther)
	{
		if (droid.droidType === DROID_COMMAND)
		{
			// New Charlie command tank
			addLabel(droid, "charlieCommander");
			// Also rank the commander to the appropriate level
			const CHARLIE_RANK = "Trained";
			camSetDroidRank(droid, CHARLIE_RANK);

		}
		else if (droid.droidType === DROID_SENSOR)
		{
			// New Golf sensor tank
			addLabel(droid, "golfSensor");
		}

		if (droid.droidType !== DROID_COMMAND)
		{
			// Give standard combat units some rank
			const STANDARD_RANK = "Trained";
			camSetDroidRank(droid, STANDARD_RANK);
		}
	}

	// Assign other units to their refillable groups
	camAssignToRefillableGroups(transOther, otherGroups);
}

// Triggers for if the player is very fast
function camEnemyBaseEliminated_colNorthCanalBase()
{
	camCallOnce("enableMoreFactories");
}

function camEnemyBaseEliminated_colSouthCanalBase()
{
	camCallOnce("enableMoreFactories");
}

// Enable the remaining idle factories
function enableMoreFactories()
{
	camEnableFactory("cScavFactory2");
	camEnableFactory("cScavFactory3");
	camEnableFactory("colFactory3");
	camEnableFactory("colCybFactory3");
	camEnableFactory("colCybFactory4");

	camCallOnce("diversionDialogue1");
}

// Dialogue about Clayde's diversion
function diversionDialogue1()
{
	camQueueDialogue([
		{text: "CHARLIE: Lieutenant! The General's plan is working!", delay: 0, sound: CAM_RCLICK},
		{text: "CHARLIE: The Collective aren't bringing in any reinforcements!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Yes, I haven't detected any Collective transports in the area.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But be careful, the Collective are likely to", delay: 3, sound: CAM_RCLICK},
		{text: "regroup their local forces and counter attack soon.", delay: 0},
	]);
}

function camEnemyBaseEliminated_colEastCanalBase()
{
	camCallOnce("enableFinalFactories");
}

function camEnemyBaseEliminated_colCraterBase()
{
	camCallOnce("enableFinalFactories");
}

// Allow the final factories to start making their "own" units
function enableFinalFactories()
{
	camSetFactories({
		"colFactory4": {
			assembly: "colAssembly4",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			templates: [ cTempl.cohhcant, cTempl.comhatt, cTempl.comhpvt, cTempl.comhmgt ] // Scary tanks
		},
		"colCybFactory5": {
			assembly: "colCybAssembly5",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.scymc, cTempl.scyhr ] // Supers
		},
	});

	camEnableFactory("colFactory4");
	camEnableFactory("colCybFactory5");
	camCallOnce("diversionDialogue2");
}

// Check how many "Collective" bodies the player is using
function golfBodyCheck()
{
	const playerDroids = enumDroid(CAM_HUMAN_PLAYER);
	let vehicleNum = 0;
	let colNum = 0;
	for (const droid of playerDroids)
	{
		if (droid.droidType === DROID_WEAPON)
		{
			// NOTE: This doesn't count trucks!
			vehicleNum++;
			if (droid.body === "Body2SUP"
				|| droid.body === "Body6SUPP"
				|| droid.body === "Body9REC")
			{
				colNum++;
			}
		}
	}

	// If the player has >= 40% Collective bodies on their vehicles, have Golf comment about it
	if ((colNum / vehicleNum) >= 0.4)
	{
		camQueueDialogue([
			{text: "GOLF: Hey, Bravo!", delay: 0, sound: CAM_RCLICK},
			{text: "GOLF: Why're you using the Collective's vehicle bodies?", delay: 3, sound: CAM_RCLICK},
			{text: "GOLF: Our chassis just aren't cutting it for you, huh?", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: Commander Bravo has a right to use any vehicle design they want.", delay: 4, sound: CAM_RCLICK},
			{text: "LIEUTENANT: Just like you and Commander Charlie.", delay: 3, sound: CAM_RCLICK},
			{text: "GOLF: Oh yeah?", delay: 4, sound: CAM_RCLICK},
			{text: "GOLF: Well, I think I'll stick with OUR vehicle bodies.", delay: 3, sound: CAM_RCLICK},
			{text: "GOLF: Thank-you-very-much!", delay: 3, sound: CAM_RCLICK},
			{text: "CHARLIE: Whatever you say, Golf.", delay: 5, sound: CAM_RCLICK},
		]);
	}
}

// Dialogue telling the player to clear the LZ
function landingDialogue()
{
	camQueueDialogue([
		{text: "LIEUTENANT: Commander Bravo, you'll need to neutralize the small outpost next to your LZ.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Remember that once you attack, you'll only have a small window of time before that outpost alerts the main base to our presence.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Make sure that you destroy it before it can sound the alarm.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We can't let the Collective know we're here yet.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Dialogue telling the player that they can break stealth
function stealthBreakDialogue()
{
	if (!playerHidden) return; // Don't play if the player has already been revealed
	camQueueDialogue([
		{text: "LIEUTENANT: Commander Bravo, I'll leave the first strike to you.", delay: 10, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Once you open fire, Commanders Charlie and Golf will support you.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Remember; even though Clayde's diversion should prevent enemy reinforcements, the Collective are sure to have a large force stationed here.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Make sure you're ready when you attack, because there's no turning back now...", delay: 4, sound: CAM_RCLICK},
	]);
}

// Dialogue on Clayde's mysteriously effective diversion
// Called when the final factories activate
function diversionDialogue2()
{
	camQueueDialogue([
		{text: "GOLF: The General must be putting on one hell of a diversion.", delay: 0, sound: CAM_RCLICK},
		{text: "GOLF: The Collective aren't reinforcing this place at all!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I'm detecting a huge spike in Collective comms traffic.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Whatever the General's been doing, it surely is working...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...But where did Clayde get the manpower to attack all of these places at once?", delay: 5, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Unless, he...", delay: 5, sound: CAM_RCLICK},
		{text: "LIEUTENANT: No, no. He wouldn't.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: He ASSURED me that he wouldn't!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Uh, Lieutenant?", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: What's going on?", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Excuse me, Commanders.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I need to go check on something...", delay: 3, sound: CAM_RCLICK},
		// Delay...
		{text: "GOLF: Hey, wasn't he supposed to be leading us?", delay: 10, sound: CAM_RCLICK},
		{text: "CHARLIE: Beats me.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Whatever it is, it must be important.", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: More important than this?!", delay: 3, sound: CAM_RCLICK},
	]);
}

// Dialogue when the main camp is secure
function campCleared()
{
	hackRemoveMessage("PRISON_SITE", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.objective.primObjectiveCompleted);
	// Remove the mission timer and grant bonus power as if the mission ended
	camGrantBonusPower();

	// Order Charlie's group to defend the prison
	camManageGroup(charlieCommander, CAM_ORDER_DEFEND, {
		removable: false,
		pos: camMakePos("colBase7"),
		repair: 50
	});

	camQueueDialogue([
		{text: "CHARLIE: We did it!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: Hey Lieutenant, the camp is clear!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Lieutenant?", delay: 5, sound: CAM_RCLICK},
		{text: "CHARLIE: Are you there?", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: Charlie, I'm picking up a lot of movement.", delay: 4, sound: CAM_RCLICK},
		{text: "GOLF: From...", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: ...Every direction!?", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Huh? Is the Collective counter-attacking?", delay: 3, sound: CAM_RCLICK, callback: "startInfestedAttacks"},
		{text: "GOLF: I don't know...", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: But they're almost on top of us!", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: Charlie, Bravo, look alive!", delay: 3, sound: CAM_RCLICK},
	]);
}

function startInfestedAttacks()
{
	// Darken the fog to 1/4 default brightness
	camGradualFog(camSecondsToMilliseconds(8), 4, 1, 16);
	// Add a slight purple-blue tint
	camGradualSunIntensity(camSecondsToMilliseconds(8), .43, .37, .45);
	camSetWeather(CAM_WEATHER_CLEAR);

	// Queue up a swarm of Infested
	queue("sendInfestedReinforcements", camSecondsToMilliseconds(10));
	queue("sendInfestedReinforcements", camSecondsToMilliseconds(15));
	queue("sendInfestedReinforcements", camSecondsToMilliseconds(20));
	queue("sendInfestedReinforcements", camSecondsToMilliseconds(30));
	queue("allowLeave", camSecondsToMilliseconds(60));

	// Also set up continuous Infested waves
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(60)));
}

// Allow the player to escape the mission
function allowLeave()
{
	survivedInfested = true;

	camQueueDialogue([
		{text: "GOLF: That...", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: That was NOT the Collective!", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: Where the hell is the Lieutenant?!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: These things look like...", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: ...Listen, Bravo.", delay: 5, sound: CAM_RCLICK},
		{text: "CHARLIE: You've gotta get back to base!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Golf and I will stay here and keep the prisoners safe.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Get going!", delay: 3, sound: CAM_RCLICK},
		// Long delay...
		{text: "CHARLIE: Oh man, Clayde...", delay: 18, sound: CAM_RCLICK},
		{text: "CHARLIE: What the hell did you just do?", delay: 4, sound: CAM_RCLICK},
	]);
}

// Start sending Infested waves once the player progresses far enough
function sendInfestedReinforcements()
{
	const entrances = [
		"infestedEntry1", "infestedEntry2", "infestedEntry3",
		"infestedEntry4", "infestedEntry5", "infestedEntry6",
		"infestedEntry7", "infestedEntry8",
	];
	const coreDroids = [ // Just scavs and crawlers
		cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
		cTempl.boomtick, // Boom Ticks
		cTempl.infmoncan, // Bus Tanks
		cTempl.infminitruck, // MRP Trucks
		cTempl.infsartruck, // Sarissa Trucks
		cTempl.infbuscan, // School Buses
		cTempl.infbjeep, cTempl.infbjeep, // Jeeps
		cTempl.infrbjeep, // Rocket Jeeps
		cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, // Buggies
		cTempl.infrbuggy, cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
		cTempl.inftrike, cTempl.inftrike, // Trikes
		cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
		cTempl.infkevbloke,
		cTempl.inflance, cTempl.inflance, // Lances
		cTempl.infkevlance,
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;
	// Spawn Infested groups from random entrances
	for (let i = 0; i < entrances.length; i++)
	{
		camSendReinforcement(CAM_INFESTED, getObject(entrances[i]), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}
}

function playerDetected()
{
	if (!playerHidden)
	{
		return false; // Player detected
	}
	return undefined; // Player undetected
}

function canLeave()
{
	if (survivedInfested)
	{
		return true; // Camp is cleared, and the Infested have been re-introduced
	}
	return undefined; // Can't leave yet
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone1");
	const lz = getObject("landingZone1");
	const transportEntryPos = {x: 2, y: 48};

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L7", {
		area: "landingZone1",
		reinforcements: -1, // will override later
		callback: "playerDetected",
	});
	camSetExtraObjectiveMessage(["Clear a landing zone", "Avoid detection by the Collective"]);

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	// Make sure the scavengers/allies aren't choosing conflicting colors with the player
	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(CAM_INFESTED, (PLAYER_COLOR !== 9) ? 9 : 4); // Infested to purple or red
	changePlayerColour(MIS_LZ_SCAVS, (PLAYER_COLOR !== 2) ? 2 : 10); // Scavs to gray or white
	changePlayerColour(MIS_TEAM_CHARLIE, (PLAYER_COLOR !== 11) ? 11 : 5); // Charlie to bright blue or blue
	changePlayerColour(MIS_TEAM_GOLF, (PLAYER_COLOR !== 7) ? 7 : 12); // Golf to cyan or neon green

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_collectiveResearch, MIS_LZ_SCAVS);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(camA2L6AllyResearch, MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(camA2L6AllyResearch, MIS_TEAM_GOLF);

	// Apply a -75% sensor range debuff on all allies and enemies for the "stealth" section
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff"], CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff"], MIS_LZ_SCAVS);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff"], MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(["R-Script-Sensor-Debuff"], MIS_TEAM_GOLF);

	setAlliance(MIS_TEAM_CHARLIE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_GOLF, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_CHARLIE, MIS_TEAM_GOLF, true);
	setAlliance(MIS_LZ_SCAVS, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_LZ_SCAVS, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_LZ_SCAVS, MIS_TEAM_GOLF, true);
	setAlliance(MIS_LZ_SCAVS, CAM_INFESTED, true);

	camSetArtifacts({
		"colResearch": { tech: "R-Wpn-Rocket-Accuracy03" }, // Rocket Laser Designator
		"colFactory3": { tech: "R-Wpn-Cannon4AMk1" }, // Hyper Velocity Cannon
		"colCC2": { tech: "R-Sys-Engineering02" }, // Improved Engineering
		// "colPower": { tech: "R-Struc-Power-Upgrade01" }, // Gas Turbine Generator
	});

	camSetEnemyBases({
		"scavLZBase": {
			cleanup: "lzScavBase",
			detectMsg: "CSCAV_BASE_LZ",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"colBasinOutpost": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"colSouthCanalRoadblock": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"colNorthCanalBase": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colSouthCanalBase": {
			cleanup: "colBase4",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colEastCanalBase": {
			cleanup: "colBase5",
			detectMsg: "COL_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colCraterBase": {
			cleanup: "colBase6",
			detectMsg: "COL_BASE6",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colMainBase": {
			cleanup: "colBase7",
			detectMsg: "COL_BASE7",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"cScavCanalBase": {
			cleanup: "cScavBase",
			detectMsg: "CSCAV_BASE",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		// Allied LZs:
		"charlieLZ": {
			cleanup: "charlieStructZone",
			friendly: true,
			player: MIS_TEAM_CHARLIE
		},
		"golfLZ": {
			cleanup: "golfStructZone",
			friendly: true,
			player: MIS_TEAM_GOLF
		},
		// Allied forward bases:
		"charlieForward": {
			cleanup: "colBase3",
			player: MIS_TEAM_CHARLIE,
			friendly: true
		},
		"golfForward": {
			cleanup: "colBase3",
			player: MIS_TEAM_GOLF,
			friendly: true
		},
		"charliePrison": {
			cleanup: "colBase7",
			player: MIS_TEAM_CHARLIE,
			friendly: true
		},
	});

	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 65
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.commcant, cTempl.comhmgt, cTempl.colmrat, cTempl.colaaht ] // Various light/medium units
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 65
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.commcant, cTempl.colhmght, cTempl.colmrat, cTempl.colflamt ] // Various light/medium units
		},
		"colFactory3": {
			assembly: "colAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 65
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			templates: [ cTempl.combbh, cTempl.commrah, cTempl.comhpvh ] // Hovers
		},
		"colFactory4": {
			assembly: "colAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [  ] // Empty for now
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.cybgr, cTempl.cybhg ] // Grenadiers and Heavy Machinegunners
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(42)),
			templates: [ cTempl.cybla, cTempl.cybfl ] // Lancers and Flamers
		},
		"colCybFactory3": {
			assembly: "colCybAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(36)),
			templates: [ cTempl.cybmr, cTempl.cybhg ] // MRAs and Heavy Machinegunners
		},
		"colCybFactory4": {
			assembly: "colCybAssembly4",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(34)),
			templates: [ cTempl.cybgr, cTempl.cybgr, cTempl.scygr ] // Grenadiers and Super Heavy Grenadiers
		},
		"colCybFactory5": {
			assembly: "colCybAssembly5",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [  ] // Empty for now
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 2,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			templates: [ cTempl.bloke, cTempl.buggy, cTempl.rbjeep, cTempl.lance, cTempl.buscan ] // Random stuff
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(42)),
			templates: [ cTempl.buscan, cTempl.monhmg, cTempl.minitruck, cTempl.gbjeep, cTempl.monfire, cTempl.monmrl ] // Durable stuff (at least in terms of scavenger stuff)
		},
		"cScavFactory3": {
			assembly: "cScavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.minitruck, cTempl.flatmrl, cTempl.firetruck, cTempl.kevlance, cTempl.rbuggy, cTempl.gbjeep, cTempl.flatat ] // Stuff that hurts
		},
		"lzScavFactory": {
			assembly: "lzAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 1,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(8)),
			templates: [ cTempl.bloke, cTempl.lance, cTempl.bloke, cTempl.trike ]
		},
	});

	camAutoReplaceObjectLabel(["heliTower", "colCC1"]);

	stealthPhase = true;
	playerHidden = true;
	survivedInfested = false;

	// Add beacons for the player's objectives
	hackAddMessage("CLEAR_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("PRISON_SITE", PROX_MSG, CAM_HUMAN_PLAYER);

	// Shrink the map boundaries
	setScrollLimits(0, 32, 32, 56);

	// Rank up the commanders on the map
	const CHARLIE_RANK = "Trained";
	const COL_RANK1 = (difficulty < HARD) ? "Trained" : "Regular";
	const COL_RANK2 = (difficulty < HARD) ? "Regular" : "Professional";
	camSetDroidRank(getObject("charlieCommander"), CHARLIE_RANK);
	camSetDroidRank(getObject("colCommander1"), COL_RANK1);
	camSetDroidRank(getObject("colCommander2"), COL_RANK2);

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the fog to 1/4 default brightness
	camSetFog(4, 4, 16);
	camSetSunIntensity(.4, .4, .45);
	camSetWeather(CAM_WEATHER_RAINSTORM);
}