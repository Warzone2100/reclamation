include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_CLAYDE = 5;

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage02", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-ROF01", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade01", "R-Wpn-Flamer-Damage03", "R-Sys-Engineering01",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy01", "R-Vehicle-Engine01",
];

var baitActive;
var ambushSprung;
var collectiveActive;
var commanderAggro;
var colAmbushGroup;

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_THE_COLLECTIVE);
});

camAreaEvent("colAmbushTrigger", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && !isVTOL(droid))
	{
		collectiveAmbush();
	}
	else
	{
		resetLabel("colAmbushTrigger", CAM_HUMAN_PLAYER);
	}
});

function heliAttack1()
{
	const templates = [cTempl.helhmg, cTempl.helpod];
	const ext = {
		limit: [1, 1],
		alternate: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos1", "heliRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(90)), "heliTower1", ext);
}

function heliAttack2()
{
	const templates = [cTempl.helcan];
	const ext = {
		limit: 1
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos2", "heliRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(60)), "heliTower2", ext);
}

function activateBait()
{
	if (!baitActive)
	{
		camManageGroup(camMakeGroup("scavBaitGroup"), CAM_ORDER_ATTACK, {
			morale: 10,
			fallback: camMakePos("baitFallbackPos"),
			radius: 6,
		});

		baitActive = true;
	}
}

// Ambush the player after they cross the canal
function collectiveAmbush()
{
	if (!ambushSprung)
	{
		camManageGroup(colAmbushGroup, CAM_ORDER_ATTACK);
		ambushSprung = true;
	}
}

// Order the Collective commander to stop patrolling and start attacking the player directly
function aggroCommander()
{
	commanderAggro = true;
	if (getObject("colCommander"))
	{
		camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_ATTACK, {
			repair: 40,
		});
	}
}

// Activate the two southern C-Scav factories
function activateFirstCScavFactories()
{
	camEnableFactory("scavFactory2");
	camEnableFactory("scavFactory3");
}

// Activate the southwestern C-Scav factory
function activateSecondCScavFactories()
{
	camEnableFactory("scavFactory1");
}

// Activate the northern C-Scav factory near the crashed transport
function activateFinalCScavFactories()
{
	camEnableFactory("scavFactory4");
}

// Send a Collective commander and hover units
// Also activate the Collective factory
function sendCollectiveTransporter()
{
	camEnableFactory("colFactory");

	// Set reinforcement droids
	const droids = [
		cTempl.comcomt, // Commander
		cTempl.commcant, cTempl.commcant, // Medium Cannons
		cTempl.comath, cTempl.comath, // Lancer Hovers
	];
	// Add more Hovers depending on difficulty
	if (difficulty >= MEDIUM) droids.push(cTempl.comath); // Lancer
	if (difficulty >= HARD) droids.push(cTempl.commrah); // MRA
	if (difficulty === INSANE) droids.push(cTempl.commrah); // MRA

	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("transportEntryPosCollective"),
			exit: camMakePos("transportEntryPosCollective"),
			order: CAM_ORDER_PATROL,
			data: {
				// The non-hover tanks will be reassigned when the transport lands
				pos: [camMakePos("hoverPatrolPos1"), camMakePos("hoverPatrolPos2")],
				interval: camSecondsToMilliseconds(22),
				repair: 75,
			}
		}
	);

	// Dialogue about Collective prisoners
	camQueueDialogue([
		{text: "LIEUTENANT: The Collective must be using this site to process their prisoners.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: With any luck, Clayde might still be detained inside.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commander Bravo, secure the area!", delay: 5, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We have to make sure the General is safe!", delay: 3, sound: CAM_RCLICK},
	]);
}

// Assign Collective units
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_THE_COLLECTIVE)
	{
		const transDroids = camGetTransporterDroids(transport.player);

		// Loop through the droids and reassign any non-hover units
		const COMMAND_GROUP = camNewGroup();
		for (const droid of transDroids)
		{
			// Assign the command droid
			if (droid.droidType === DROID_COMMAND)
			{
				addLabel(droid, "colCommander");
				// Set the commander's rank (ranges from Green to Professional)
				const COMMANDER_RANK = (difficulty <= EASY) ? 1 : (difficulty);
				camSetDroidRank(droid, COMMANDER_RANK);
			}
			// Assign Medium Cannons
			else if (camDroidMatchesTemplate(droid, cTempl.commcant))
			{
				camGroupAdd(COMMAND_GROUP, droid);
			}
		}

		camMakeRefillableGroup(
			COMMAND_GROUP, {
				templates: [ // NOTE: The two Medium Cannons aren't in this list, so they won't be rebuilt if destroyed.
					cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, // Light Cannons
					cTempl.colmrat, cTempl.colmrat, // MRA
					// The templates below are only built if the commander is ranked higher (or if the Medium Cannons die)
					cTempl.colpodt, cTempl.colpodt, // MRP (Medium+)
					cTempl.colaaht, cTempl.colaaht, // Hurricanes (Hard+)
				],
				factories: ["colFactory"], // Only refill from this factory
				obj: "colCommander", // Stop filling this group when the commander dies
			}, CAM_ORDER_FOLLOW, {
				leader: "colCommander",
				suborder: CAM_ORDER_ATTACK,
				repair: 40,
		});

		// Manage the actual commander droid
		camManageGroup(camMakeGroup("colCommander"),
			(commanderAggro) ? CAM_ORDER_ATTACK : CAM_ORDER_PATROL, {
			pos: [camMakePos("patrolPos3"), camMakePos("patrolPos5"), camMakePos("patrolPos6")],
			interval: camSecondsToMilliseconds(28),
			repair: 40,
		});
	}
}

// Try to bait the player across the canal
function eventAttacked(victim, attacker)
{
	if (!baitActive && victim.player === CAM_THE_COLLECTIVE && attacker.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("activateBait");
	}
}

// Trigger the ambush early if the player starts picking off ambush units
function eventGroupLoss(obj, group, newsize)
{
	// console("group " + group + " lost a member!")
	if (!ambushSprung && group === colAmbushGroup)
	{
		camCallOnce("collectiveAmbush");
	}
}

// Aggro the Collective early if the player attacks the Collective base
function eventDestroyed(obj)
{
	if (!commanderAggro && obj.player === CAM_THE_COLLECTIVE && camWithinArea(obj, "colBase") && obj.type === STRUCTURE)
	{
		camCallOnce("aggroCommander");
		camEnableFactory("colFactory");
	}
}

// Dialogue about the Collective
function camEnemyBaseDetected_colMainBase()
{
	// Dialogue about the Collective
	camQueueDialogue([
		{text: "LIEUTENANT: How did we not notice the Collective before?", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Were we so focused on our goal that we..?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Hopefully, there's still time to fix this.", delay: 8, sound: CAM_RCLICK},
	]);
}

function eventStartLevel()
{
	const transportEntryPos = camMakePos("transportEntryPos");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A1L6", {
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(1.5),
		annihilate: true
	});

	centreView(lz.x, lz.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);

	// Set alliances...
	setAlliance(MIS_CLAYDE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CLAYDE, CAM_THE_COLLECTIVE, true);

	camSetArtifacts({
		"colFactory": { tech: "R-Vehicle-Body02" }, // Leopard
		"colCommandCenter": { tech: "R-Defense-HardcreteWall" }, // Hardcrete
		"colResearchFacility": { tech: "R-Wpn-Rocket01-LtAT" }, // Lancer
		"colCommandRelay": { tech: "R-Struc-CommandRelay" }, // Command Relay Post
		"colAASite": { tech: "R-Wpn-AAGun03" }, // Hurricane AA
		// "colRepairFacility": { tech: "R-Struc-RepairFacility" }, // Repair Facility
	});

	camSetEnemyBases({
		"scavSWBase": {
			cleanup: "scavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"scavNEBase": {
			cleanup: "scavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colMainBase": {
			cleanup: "colBase",
			detectMsg: "COL_BASE",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_THE_COLLECTIVE
		},
	});

	camSetFactories({
		"scavFactory1": {
			assembly: "scavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(36)),
			templates: [cTempl.flatat, cTempl.rbjeep, cTempl.gbjeep, cTempl.kevlance, cTempl.minitruck]
		},
		"scavFactory2": {
			assembly: "scavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [cTempl.trike, cTempl.rbuggy, cTempl.bjeep, cTempl.kevbloke, cTempl.kevlance, cTempl.firetruck]
		},
		"scavFactory3": {
			assembly: "scavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(38)),
			templates: [cTempl.moncan, cTempl.kevbloke, cTempl.kevbloke, cTempl.buggy, cTempl.sartruck]
		},
		"scavFactory4": {
			assembly: "scavAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [cTempl.monfire, cTempl.buggy, cTempl.rbuggy, cTempl.trike, cTempl.flatmrl, cTempl.bloke, cTempl.lance]
		},
		"colFactory": {
			assembly: "colAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			templates: [cTempl.colcanht, cTempl.colcanht, cTempl.colflamt, cTempl.colmrat, cTempl.colhmght, cTempl.colmcant]
		},
	});

	// Set up Collective trucks
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(70));
	const colBaseStructs = camAreaToStructSet("colBase");
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= MEDIUM), // Don't rebuild this truck unless we're on timerless mode (or on Normal+)
			respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
			template: cTempl.coltruckht,
			structset: colBaseStructs
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			rebuildTruck: tweakOptions.rec_timerlessMode, // Don't rebuild this truck unless we're on timerless mode
			respawnDelay: ((tweakOptions.rec_timerlessMode) ? (TRUCK_TIME / 2) : TRUCK_TIME),
			template: cTempl.coltruckht,
			structset: colBaseStructs
	});

	// If we're in Timerless mode, set up scavenger Cranes
	if (tweakOptions.rec_timerlessMode)
	{
		// Filter out non-scavenger structures in the SW base
		const scavStructsSW = camAreaToStructSet("scavBase1").filter((struct) => (
			camIsScavStruct(struct.stat) && struct.stat !== "A0TankTrap"
		));
		// Southwest scav base
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "scavSWBase",
				rebuildBase: true,
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
				template: cTempl.crane,
				structset: scavStructsSW
		});
		if (difficulty >= MEDIUM)
		{
			// Northeast scav base
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "scavNEBase",
					rebuildBase: true,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
					template: cTempl.crane,
					structset: camAreaToStructSet("scavBase2")
			});
		}
		if (difficulty >= HARD)
		{
			// Southwest scav base (again)
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "scavSWBase",
					rebuildBase: true,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
					template: cTempl.crane,
					structset: scavStructsSW
			});
		}
	}

	// Upgrade Collective structures on higher difficulties
	if (difficulty == HARD)
	{
		// Hardened towers (only replace once destroyed)
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "GuardTower1", "GuardTower3", true); // HMG Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "GuardTower6", "GuardTower6H", true); // MRP Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower01", "Sys-SensoTower02", true); // Sensor Towers
	}
	else if (difficulty == INSANE)
	{
		// Hardened towers (also proactively demolish/replace them)
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "GuardTower1", "GuardTower3"); // HMG Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "GuardTower6", "GuardTower6H"); // MRP Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower01", "Sys-SensoTower02"); // Sensor Towers
	}

	camAutoReplaceObjectLabel(["heliTower1", "heliTower2"]);

	baitActive = false;
	ambushSprung = false;
	collectiveActive = false;
	commanderAggro = false;
	colAmbushGroup = camMakeGroup("colAmbushGroup"); // Will be managed later

	// Set up patrols
	camManageGroup(camMakeGroup("colPatrolGroup1"), CAM_ORDER_PATROL, {
		pos: [camMakePos("patrolPos1"), camMakePos("patrolPos2")],
		interval: camSecondsToMilliseconds(24)
	});
	camManageGroup(camMakeGroup("colPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: [camMakePos("patrolPos3"), camMakePos("patrolPos4")],
		interval: camSecondsToMilliseconds(38)
	});

	queue("activateBait", camMinutesToMilliseconds(1.75));
	queue("activateFirstCScavFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("heliAttack1", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("sendCollectiveTransporter", camMinutesToMilliseconds(3));
	queue("activateSecondCScavFactories", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("activateFinalCScavFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("heliAttack2", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("aggroCommander", camChangeOnDiff(camMinutesToMilliseconds(12)));

	// Add a slight blue hue to the lighting
	camSetSunIntensity(.5, .5, .6);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
}