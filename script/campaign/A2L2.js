include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_TEAM_DELTA = 1;

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade02", "R-Sys-Engineering01", "R-Cyborg-Metals02",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy01", "R-Vehicle-Engine02",
	"R-Wpn-AAGun-Damage01",
];

var mapExpanded;
var lzAmbushGroup;
var echoStrikeGroup;
var echoDiscovered;
var spySensorST;

var echoCommander;
var echoCommanderDeathTime;
var echoRank;
var echoCommanderDelay;

// Needed to ensure the spy sensor fleeing scene can be triggered after a save/load
function eventGameLoaded()
{
	if (groupSize(spySensorST) > 0)
	{
		addLabel({type: GROUP, id: spySensorST}, "echoSpySensorST", false);
		resetLabel("echoSpySensorST", CAM_HUMAN_PLAYER); // subscribe for eventGroupSeen
	}
}

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_THE_COLLECTIVE);
});

camAreaEvent("ambushTrigger", function(droid)
{
	// Begin the Collective's attacks against team Delta
	if (droid.player == CAM_HUMAN_PLAYER)
	{
		lzAmbushGroup = camMakeGroup("colAmbushGroup");
		camManageGroup(lzAmbushGroup, CAM_ORDER_ATTACK, {
			targetPlayer: MIS_TEAM_DELTA,
			repair: 40,
			repairPos: camMakePos("colFallbackPos")
		});
		camManageGroup(camMakeGroup("colAmbushRepairGroup"), CAM_ORDER_DEFEND, {
			pos: camMakePos("colFallbackPos"),
			radius: 6
		});

		camManageGroup(camMakeGroup("deltaDefenseGroup"), CAM_ORDER_DEFEND, {
			pos: camMakePos("deltaDefensePos"),
			radius: 10
		});

		setTimer("checkLzAmbushGroup", camSecondsToMilliseconds(1)); // Check when the LZ is safe
	}
	else
	{
		resetLabel("ambushTrigger", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("spyEscapeTrigger", function(droid)
{
	// Remove the fleeing spy
	if (droid.player === CAM_THE_COLLECTIVE && getLabel(droid) === "echoSpySensor")
	{
		camSafeRemoveObject(droid, false);
	}
	else
	{
		resetLabel("spyEscapeTrigger", CAM_THE_COLLECTIVE);
	}
});

function checkLzAmbushGroup()
{
	if (groupSize(lzAmbushGroup) === 0)
	{
		camCallOnce("evacDelta");
		removeTimer("checkLzAmbushGroup");

		camSetObjectVision(MIS_TEAM_DELTA);

		// Tell the player to investigate Echo's base (and call reinforcements)
		camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "A2L2_DELTA", type: MISS_MSG}]);

		queue("echoDialogue", camMinutesToMilliseconds(4));

		// If the spy sensor hasn't already fled, do that now
		camCallOnce("spyFlee");
	}
}

// Dialogue speculating what happened to team Echo
function echoDialogue()
{
	if (echoDiscovered) return; // Don't speculate when we already know :)
	camQueueDialogue([
		{text: "LIEUTENANT: General, do you think that Echo's been captured by the Collective?", delay: 0, sound: CAM_RCLICK},
		{text: "CLAYDE: Maybe...", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: But the only way to find out now is to investigate their base.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: If they have been captured, we may find some intel on where they're being held.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Do you think the Collective...", delay: 12, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...wiped them out?", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: We know the Collective have captured Team Foxtrot.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: They also briefly held me captive as well.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: ...And they seem to be in the business of recruiting scavengers as well.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: We still don't know what their end-goal is, but for now,", delay: 3, sound: CAM_RCLICK},
		{text: "we can at least assume that team Echo is alive.", delay: 0},
		{text: "CLAYDE: The first step to finding them is securing that base.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Call in a transport and move all Delta units to their LZ
function evacDelta()
{
	const deltaDroids = enumDroid(MIS_TEAM_DELTA);
	const evacPos = camMakePos("landingZone2");
	camMakeGroup(deltaDroids); // Put them in a new group so they stop being managed by libcampaign
	for (const droid of deltaDroids)
	{
		// Move every droid towards the LZ
		orderDroidLoc(droid, DORDER_MOVE, evacPos.x, evacPos.y);
	}

	// Call in an evac transport
	const transportEntryPos = camMakePos("transportEntryPos");
	camSendReinforcement(MIS_TEAM_DELTA, camMakePos("landingZone2"), [cTempl.plltruckht],
		CAM_REINFORCE_TRANSPORT, {
			entry: transportEntryPos,
			exit: transportEntryPos
		}
	);

	const lz = getObject("landingZone2"); // New player LZ
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	hackRemoveMessage("DELTA_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
}

// Expand the map, donate remaining Delta objects to the player, let the player call in reinforcements, set up enemy groups, and queue up events for later
// A whole lotta stuff...
function expandMap()
{
	mapExpanded = true;

	// Donate Delta objects
	const deltaObjs = enumDroid(MIS_TEAM_DELTA).filter((droid) => (droid.droidType !== DROID_SUPERTRANSPORTER)).concat(enumStruct(MIS_TEAM_DELTA));
	camEnsureDonateObject(deltaObjs, CAM_HUMAN_PLAYER);

	// Adjust the victory conditions and enable reinforcements
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L3", {
		area: "compromiseZone",
		message: "DELTA_LZ",
		reinforcements: camMinutesToSeconds(1.75), // Reinforcements enabled
		callback: "echoEradicated"
	});

	setReinforcementTime(camMinutesToSeconds(1)); // The first transport is a bit faster
	camSetExtraObjectiveMessage("Investigate team Echo's base");
	playSound(cam_sounds.reinforcementsAreAvailable);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(getMissionTime() + camChangeOnDiff(camHoursToSeconds(1.25)));
	}

	// Expand the map boundaries
	setScrollLimits(0, 0, 64, 96);

	// Set up "some" groups...
	// Simple patrols
	camManageGroup(camMakeGroup("scavPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("cScavAssembly2"), camMakePos("patrolPos7"), camMakePos("patrolPos8")
		],
		interval: camSecondsToMilliseconds(18),
	});
	camManageGroup(camMakeGroup("colHoverGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("hoverPatrolPos1"), camMakePos("hoverPatrolPos2"), camMakePos("hoverPatrolPos3"),
			camMakePos("hoverPatrolPos4"),
		],
		interval: camSecondsToMilliseconds(22),
		repair: 80
	});

	// Set up refillable groups and trucks
	// Echo patrol group (2 Lancer Cyborgs, 2 MRA Cyborgs, 1 Hurricane)
	camMakeRefillableGroup(
		camMakeGroup("echoPatrolGroup"), {
			templates: [
				cTempl.cybla, cTempl.cybla,
				cTempl.cybmr, cTempl.cybmr,
				cTempl.pllaaw,
			],
			factories: ["colFactory1", "colCybFactory1"],
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos1"), camMakePos("patrolPos2"), camMakePos("patrolPos3")
			],
			interval: camSecondsToMilliseconds(28),
			repair: 75
	});
	// Echo commander group (escorts)
	echoCommander = camMakeRefillableGroup(
		camMakeGroup("echoCommander"), {
			templates: [cTempl.pllcomht],
			factories: ["colFactory2"],
			callback: "allowEchoCommanderRebuild"
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos2"), camMakePos("patrolPos3"), camMakePos("patrolPos4")
				// More positions are added later
			],
			interval: camSecondsToMilliseconds(28),
			repair: 75
	});	
	camMakeRefillableGroup(
		camMakeGroup("echoCommandGroup"), {
			templates: [ // (3 Lancer Cyborgs, 3 HMG Cyborgs, 2 Hurricanes)
				cTempl.cybla, cTempl.cybla, cTempl.cybla,
				cTempl.cybhg, cTempl.cybhg, cTempl.cybhg,
				cTempl.pllaaw, cTempl.pllaaw,
				cTempl.cybmr, cTempl.cybmr, // MRAs (Hard+)
			],
			factories: ["colFactory2", "colCybFactory2"],
			obj: "echoCommander" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "echoCommander",
			repair: 50,
			suborder: CAM_ORDER_ATTACK
	});
	// Strike "group" consisting of a single VTOL strike turret
	echoStrikeGroup = camMakeRefillableGroup(
		camMakeGroup("echoVtolSensor"), {
			templates: [
				cTempl.pllstrikeht,
			],
			factories: ["colFactory1", "colFactory2"],
			obj: "colVtolFactory" // Don't rebuild the VTOL sensor if we can't produce any more VTOLs
		}, CAM_ORDER_DEFEND, { // This order is overwritten later...
			pos: camMakePos("patrolPos3"),
			repair: 40
	});
	// Echo VTOL groups
	// Strike tower 1 (2 HMGs, 2 MRPs)
	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.pllpodv, cTempl.pllhmgv,
				cTempl.pllpodv, cTempl.pllhmgv,
			],
			factories: ["colVtolFactory"],
			obj: "echoVtolTower1", // Only refill this group if the tower is still alive
		}, CAM_ORDER_FOLLOW, {
			leader: "echoVtolTower1",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly")
			}
	});
	// Strike tower 2 (2 HMGs, 2 MRPs)
	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.pllpodv, cTempl.pllhmgv,
				cTempl.pllpodv, cTempl.pllhmgv,
			],
			factories: ["colVtolFactory"],
			obj: "echoVtolTower2",
		}, CAM_ORDER_FOLLOW, {
			leader: "echoVtolTower2",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly")
			}
	});
	// Strike tower 3 (2 HMGs, 2 MRPs)
	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.pllpodv, cTempl.pllhmgv,
				cTempl.pllpodv, cTempl.pllhmgv,
			],
			factories: ["colVtolFactory"],
			obj: "echoVtolTower3",
		}, CAM_ORDER_FOLLOW, {
			leader: "echoVtolTower3",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colVtolAssembly")
			}
	});
	// Strike turret (2 Lancers, 2 Cluster Bombs)
	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.pllbombv, cTempl.plllanv,
				cTempl.pllbombv, cTempl.plllanv,
			],
			factories: ["colVtolFactory"],
			obj: "echoVtolSensor",
		}, CAM_ORDER_FOLLOW, {
			leader: "echoVtolSensor",
			suborder: CAM_ORDER_ATTACK
	});
	// Trucks
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 60 : 120));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "echoSWBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= MEDIUM),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("echoTruck1"),
			structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "echoMainBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode || difficulty >= EASY),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("echoTruck2"),
			structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZBase",
			rebuildTruck: (tweakOptions.rec_timerlessMode),
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("echoTruck3"),
			structset: camAreaToStructSet("echoLZStructs")
	});

	// If we're in Timerless mode, set up scavenger Cranes
	if (tweakOptions.rec_timerlessMode)
	{
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(70));
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavNEBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase1").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavWestBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase2")
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavNorthCanalBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase3").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavSouthCanalBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase4").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		if (difficulty >= MEDIUM)
		{
			// Echo main base (again)
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "echoMainBase",
					respawnDelay: TRUCK_TIME / 2,
					rebuildBase: true,
					template: cTempl.cyben,
					structset: camAreaToStructSet("colBase2")
			});
		}
	}

	// Queue up enemy events
	queue("enableFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(1.75)));
	queue("heliAttack1", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("advanceTeamEcho", camChangeOnDiff(camMinutesToMilliseconds(7)));
	queue("heliAttack2", camChangeOnDiff(camMinutesToMilliseconds(7)));
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(12)));
	queue("startCollectiveTransports", camChangeOnDiff(camMinutesToMilliseconds(16)));

	// If the spy sensor is still on the map, remove it now
	camSafeRemoveObject("echoSpySensor");

	// Hack to prevent the south half of the map from being dark after the expansion
	camSetSunPos(-225.0, -601.0, 450.0); // Move the sun just a wee bit
}

function enableFirstFactories()
{
	camEnableFactory("cScavFactory2");
	camEnableFactory("cScavFactory3");
	camEnableFactory("colVtolFactory");
}

function advanceTeamEcho()
{
	camEnableFactory("colCybFactory2");
	camEnableFactory("colFactory2");

	// Make Echo's VTOL Strike sensor and commander more aggressive
	if (getObject("echoCommander") !== null)
	{
		camManageGroup(echoCommander, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos4"),
				camMakePos("patrolPos5"), camMakePos("patrolPos6"), camMakePos("deltaDefensePos")
			],
			interval: camSecondsToMilliseconds(24),
			repair: 75,
			removable: false
		});
	}
	camManageGroup(echoStrikeGroup, CAM_ORDER_ATTACK, {repair: 40, removable: false});
}

function enableFinalFactories()
{
	camEnableFactory("cScavFactory1");
	camEnableFactory("cScavFactory4");
	camEnableFactory("colCybFactory1");
	camEnableFactory("colFactory1");
}

function heliAttack1()
{
	const ext = {
		limit: [1, 1],
		alternate: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos2", "heliRemoveZone", [cTempl.helcan, cTempl.helhmg], camChangeOnDiff(camMinutesToMilliseconds(1)), "heliTower2", ext);
}

function heliAttack2()
{
	const ext = {
		limit: 1
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos1", "heliRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(1.25)), "heliTower1", ext);
}

function startCollectiveTransports()
{
	sendCollectiveTransporter();
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(6)));
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
	const TRANSPORT_SIZE = ((difficulty <= MEDIUM) ? 6 : ((difficulty === HARD) ? 8 : 10));
	const droidPool = [
		cTempl.cybca, cTempl.cybgr, cTempl.colaaht, cTempl.colflamt,
		cTempl.colmrat, cTempl.colcanht,
	];
	if (difficulty >= MEDIUM) droidPool.push(cTempl.commcant);

	const droids = [];
	for (let i = 0; i < TRANSPORT_SIZE; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	// Send the transport!
	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneEcho"), droids,
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

// Reassign the VTOL strike turret's label when it's rebuilt
function eventDroidBuilt(droid, structure)
{
	if (droid.player !== CAM_THE_COLLECTIVE)
	{
		return;
	}

	if (camDroidMatchesTemplate(droid, cTempl.pllstrikeht))
	{
		addLabel(droid, "echoVtolSensor");
	}
	else if (camDroidMatchesTemplate(droid, cTempl.pllcomht))
	{
		// Echo commander rebuilt
		addLabel(droid, "echoCommander");
		camSetDroidRank(droid, echoRank);
	}
}

// If an Echo unit is attacked after the map expands, play some dialogue
function eventAttacked(victim, attacker) 
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (victim.player == CAM_THE_COLLECTIVE && attacker.player == CAM_HUMAN_PLAYER)
	{
		// Check if the victim was any Echo vehicle
		if (mapExpanded && victim.type === DROID && (victim.body === "Body1REC" || victim.body === "Body5REC"))
		{
			camCallOnce("discoverEcho");
		}
	}
}

// If the spy sensor is spotted, make it flee
function eventGroupSeen(viewer, group)
{
	if (group === spySensorST)
	{
		// Run away!
		camCallOnce("spyFlee");
	}
}

function eventDestroyed(obj)
{
	if (obj.player === CAM_THE_COLLECTIVE && obj.type === DROID && obj.droidType === DROID_COMMAND)
	{
		// Mark the time that the Echo commander died
		echoCommanderDeathTime = gameTime;
	}
}

// Make the "spy" sensor try to run away
function spyFlee()
{
	const spyDroid = getObject("echoSpySensor");
	if (spyDroid !== null)
	{
		const escapePos = camMakePos("spyEscapeTrigger");
		orderDroidLoc(spyDroid, DORDER_MOVE, escapePos.x, escapePos.y);
	}
}

// omg echo betrayed us!!!! :((((
function discoverEcho()
{
	echoDiscovered = true;

	camSkipDialogue(); // Stop any ongoing dialogue

	// Tell the player to KILL Echo's base
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "A2L2_ECHO", type: MISS_MSG}]);

	camSetExtraObjectiveMessage("Eradicate team Echo");
}

// Dialogue about team Delta and Echo
function landingDialogue()
{
	camQueueDialogue([
		{text: "LIEUTENANT: Commander Bravo, teams Delta and Echo were", delay: 3, sound: CAM_RCLICK},
		{text: "assigned together, and they shared a single base.", delay: 0},
		{text: "LIEUTENANT: Delta's distress signal indicated that it was overrun by the Collective.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We still don't know what happened with Team Echo,", delay: 3, sound: CAM_RCLICK},
		{text: "but at least we still have a shot at saving Delta.", delay: 0},
		{text: "LIEUTENANT: Move fast, and be prepared for anything.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Dialogue once Echo has been dealt with appropriately
function echoEradicatedDialogue()
{
	playSound(cam_sounds.objective.primObjectiveCompleted);
	camGrantBonusPower();

	camQueueDialogue([
		{text: "LIEUTENANT: Sir... They're gone sir.", delay: 6, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Team Echo has been eradicated.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Good.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...General?", delay: 6, sound: CAM_RCLICK},
		{text: "CLAYDE: ...If we're to survive this ordeal, we'll all need to work together.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: To trust each other.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: To be loyal to each other.", delay: 1, sound: CAM_RCLICK},
		{text: "CLAYDE: There's no room for traitors and turncoats among us.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Destroying those defectors was the only option.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: ...They're no better than Team Alpha.", delay: 8, sound: CAM_RCLICK},
	]);
}

// Remove team Delta from the map
function eventTransporterLanded(transport)
{
	if (transport.player === MIS_TEAM_DELTA)
	{
		const deltaDroids = enumDroid(MIS_TEAM_DELTA).filter((droid) => (droid.droidType !== DROID_SUPERTRANSPORTER));
		let truckRemaining = 1; // Leave up to 1 truck and 2 repair droids behind for the player to use
		let repairRemaining = 2;
		for (const droid of deltaDroids)
		{
			if (truckRemaining > 0 && droid.droidType === DROID_CONSTRUCT)
			{
				truckRemaining--;
				continue; // Skip this droid (and leave it behind)
			}
			if (repairRemaining > 0 && droid.droidType === DROID_REPAIR)
			{
				repairRemaining--;
				continue;
			}
			camSafeRemoveObject(droid); // "Evacuate" this droid
		}

		queue("expandMap", camSecondsToMilliseconds(1));
	}
	else if (transport.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("landingDialogue");
	}
}

// Returns true if all of team Echo's bases and trucks are eradicated
function echoEradicated()
{
	if (camBaseIsEliminated("echoSWBase") && camBaseIsEliminated("echoMainBase"))
	{
		// Check if any trucks are alive
		const trucks = enumDroid(CAM_THE_COLLECTIVE, DROID_CONSTRUCT).filter((obj) => (obj.body === "Body1REC"));
		if (trucks.length === 0)
		{
			camCallOnce("echoEradicatedDialogue");
			return true;
		}

	} 
	return undefined;
}

// Delay when Echo can rebuild their commander (if they can at all...)
function allowEchoCommanderRebuild()
{	
	// Allow Echo to rebuild their commander if we're on Hard+ (and enough time has passed)
	return (difficulty >= HARD) && (gameTime >= echoCommanderDeathTime + echoCommanderDelay) && (enumStruct(CAM_THE_COLLECTIVE, COMMAND_CONTROL).length > 0);
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone1");
	const lz = getObject("landingZone1"); //player lz
	const transportEntryPos = camMakePos("transportEntryPos");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A2L3", {
		message: "DELTA_LZ",
		reinforcements: -1, // will override later
		callback: "echoEradicated",
		area: "landingZone1"
	});
	camSetExtraObjectiveMessage("Investigate the distress signal");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	// Make sure team delta isn't choosing conflicting colors with the player
	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(MIS_TEAM_DELTA, (PLAYER_COLOR !== 1) ? 1 : 8); // orange or yellow

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(camA2L2AllyResearch, MIS_TEAM_DELTA);

	setAlliance(MIS_TEAM_DELTA, CAM_HUMAN_PLAYER, true);

	camSetArtifacts({
		"colVtolFactory": { tech: "R-Wpn-Bomb01" }, // Cluster Bomb Bay
		"colResearch1": { tech: "R-Wpn-Rocket-Accuracy02" }, // Improved Rocket Wire Guidance
		"colResearch2": { tech: "R-Wpn-MG-ROF02" }, // Rapid Fire Chaingun Upgrade
		"colFactory1": { tech: "R-Wpn-Rocket-ROF02" }, // Rocket Autoloader Mk2
		"colFactory2": { tech: "R-Struc-Factory-Upgrade01" }, // Automated Manufacturing
	});

	camSetEnemyBases({
		"cScavNEBase": {
			cleanup: "cScavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"cScavWestBase": {
			cleanup: "cScavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"cScavNorthCanalBase": {
			cleanup: "cScavBase3",
			detectMsg: "CSCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"cScavSouthCanalBase": {
			cleanup: "cScavBase4",
			detectMsg: "CSCAV_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"echoSWBase": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"echoMainBase": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colLZBase": {
			cleanup: "echoLZStructs",
			detectMsg: "COL_LZ",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
	});

	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 60
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(50)),
			templates: [ cTempl.pllhmght, cTempl.pllpodht, cTempl.pllhmght, cTempl.pllmraht ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 40
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(70)),
			templates: [ cTempl.pllpodt, cTempl.plllant, cTempl.pllpodt ] // Rocket hell
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			templates: [ cTempl.cybhg, cTempl.cybla, cTempl.cybhg ] // MGs and Lancers
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 35
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			templates: [ cTempl.cybmr, cTempl.cybhg, cTempl.cybmr ] // MGs and MRAs
		},
		"colVtolFactory": {
			assembly: "colVtolAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [] // Only resupplies VTOL groups
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(75)),
			templates: [ cTempl.monfire, cTempl.rbjeep, cTempl.buscan, cTempl.bjeep, cTempl.flatmrl, cTempl.lance, cTempl.monhmg ]
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [ cTempl.buggy, cTempl.kevlance, cTempl.kevbloke, cTempl.buscan, cTempl.minitruck ]
		},
		"cScavFactory3": {
			assembly: "cScavAssembly3",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			templates: [ cTempl.gbjeep, cTempl.rbjeep, cTempl.bjeep ] // Super Jeep Bros.
		},
		"cScavFactory4": {
			assembly: "cScavAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			templates: [ cTempl.flatat, cTempl.buscan, cTempl.bloke, cTempl.kevlance, ]
		},
	});

	mapExpanded = false;
	echoDiscovered = false;
	echoCommanderDeathTime = 0;

	echoRank = (difficulty <= MEDIUM) ? "Green" : "Trained";
	echoCommanderDelay = (difficulty < INSANE) ? camMinutesToMilliseconds(12) : camMinutesToMilliseconds(8);
	camSetDroidRank(getObject("echoCommander"), echoRank);

	// NOTE: The unit with the label "echoVtolSensor" should also be auto-replaced, but we have to do that manually in this level script
	camAutoReplaceObjectLabel(["heliTower1", "heliTower2", "echoVtolTower1", "echoVtolTower2", "echoVtolTower3"]);

	// Hide most of the map
	setScrollLimits(0, 0, 42, 48);

	hackAddMessage("DELTA_LZ", PROX_MSG, CAM_HUMAN_PLAYER);

	spySensorST = camMakeGroup(getObject("echoSpySensor"));
	addLabel({type: GROUP, id: spySensorST}, "echoSpySensorST", false);
	resetLabel("echoSpySensorST", CAM_HUMAN_PLAYER); // subscribe for eventGroupSeen

	// Darken the fog to 1/2 default brightness
	camSetFog(8, 8, 32);
	// Darken the lighting and add a blue hue
	camSetSunIntensity(.35, .35, .45);
	camSetSunPos(-225.0, -600.0, 450.0);
	camSetSkyType(CAM_SKY_NIGHT);
}