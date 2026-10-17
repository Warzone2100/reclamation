include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const MIS_NASDA = 1;
const MIS_CLAYDE = 5;
const MIS_YELLOW_SCAVS = 6;
const MIS_TEAM_CHARLIE = 7;
const MIS_TEAM_FOXTROT = 8;
const MIS_TEAM_GOLF = 9;
const transportEntryPos = { x: 62, y: 52 };
const transportEntryPosCharlie = { x: 20, y: 78 };
const transportEntryPosFoxtrot = { x: 2, y: 70 };
const transportEntryPosGolf = { x: 62, y: 20 };

const mis_scavResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage01", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-ROF01", "R-Vehicle-Metals01", "R-Struc-Materials01", 
	"R-Defense-WallUpgrade01", "R-Wpn-Flamer-Damage02",
];

var powerClear;
var powerCaptured;
var uplinkCaptured;
var vtolClear;
var vtolCaptured;
var ambushTriggered;
var charlieLZSecure;
var foxtrotLZSecure;
var golfLZSecure;
// Refillable Groups...
var charlieSlowAttackGroup;
var charlieFastAttackGroup;
var charlieRepairGroup;
var foxtrotAttackGroup;
var foxtrotRepairGroup;
var golfAttackGroup;
var golfMortarGroup;
var golfSensorGroup;
var golfRepairGroup;
var charlieTruckJob1;
var charlieTruckJob2;
var foxtrotTruckJob1;
var foxtrotTruckJob2;
var golfTruckJob;

// The chances of a helicopter actually using this is incredibly low
// but we should still have this
camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", MIS_YELLOW_SCAVS);
});

camAreaEvent("powerCaptureZone", function(droid)
{
	// Only the player's units can capture NASDA components
	if (droid.player == CAM_HUMAN_PLAYER && powerClear)
	{
		// No enemies left, and a player unit is here! Capture this component
		for (const object of enumArea("powerCaptureZone", MIS_NASDA, false))
		{
			donateObject(object, MIS_CLAYDE);
		}
		powerCaptured = true;
		playSound(cam_sounds.objective.objectiveCaptured);
		hackRemoveMessage("POWER_ZONE", PROX_MSG, CAM_HUMAN_PLAYER);
		// Also grant the Power Module
		enableResearch("R-Struc-PowerModuleMk1", CAM_HUMAN_PLAYER);

		camQueueDialogue([
			{text: "LIEUTENANT: That appears to be an in-house nuclear reactor.", delay: 4, sound: CAM_RCLICK},
			{text: "LIEUTENANT: ...It's a bit smaller than the ones usually hooked up to electrical grids.", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: It seems like its sole purpose was to power NASDA's core systems.", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: Thankfully, it appears to be mostly intact.", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: ...And what's this?", delay: 4, sound: CAM_RCLICK},
			{text: "LIEUTENANT: The auxiliary generators seem to have a special module that we can use as well!", delay: 3, sound: CAM_RCLICK},
		]);
	}
	else
	{
		resetLabel("powerCaptureZone", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("uplinkCaptureZone", function(droid)
{
	if (droid.player == CAM_HUMAN_PLAYER && uplinkClear)
	{
		for (const object of enumArea("uplinkCaptureZone", MIS_NASDA, false))
		{
			donateObject(object, MIS_CLAYDE);
		}
		uplinkCaptured = true;
		playSound(cam_sounds.objective.objectiveCaptured);
		hackRemoveMessage("UPLINK_ZONE", PROX_MSG, CAM_HUMAN_PLAYER);

		camQueueDialogue([
			{text: "CLAYDE: Well look at that. NASDA Central.", delay: 4, sound: CAM_RCLICK},
			{text: "LIEUTENANT: From the outside, it seems to be in decent condition.", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: But we won't know if it's operational until we can get a look at its interior.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Don't worry about that, Lieutenant.", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: Once these scavengers are cleared out, we'll have all the time in the world.", delay: 3, sound: CAM_RCLICK},
		]);
	}
	else
	{
		resetLabel("uplinkCaptureZone", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("vtolFactoryCaptureZone", function(droid)
{
	if (droid.player == CAM_HUMAN_PLAYER && vtolClear)
	{
		for (const object of enumArea("vtolFactoryCaptureZone", MIS_NASDA, false))
		{
			donateObject(object, MIS_CLAYDE);
		}
		vtolCaptured = true;
		playSound(cam_sounds.objective.objectiveCaptured);
		hackRemoveMessage("VTOL_ZONE", PROX_MSG, CAM_HUMAN_PLAYER);
		// Also grant VTOL Propulsion
		enableResearch("R-Vehicle-Prop-VTOL", CAM_HUMAN_PLAYER);

		camQueueDialogue([
			{text: "CLAYDE: Lieutenant, what am I looking at here?", delay: 4, sound: CAM_RCLICK},
			{text: "LIEUTENANT: That..!", delay: 4, sound: CAM_RCLICK},
			{text: "LIEUTENANT: THAT is a Pre-Collapse VTOL Factory!", delay: 2, sound: CAM_RCLICK},
			{text: "LIEUTENANT: I never thought I'd see one of these again!", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: These scavengers must have been using this to assemble and store their helicopters.", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: ...But with any luck, we should be able to...", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: Yes!", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: There are still Pre-Collapse designs inside this factory!", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: We'll be able to use them to design our own VTOL aircraft.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Excellent.", delay: 4, sound: CAM_RCLICK},
		]);
	}
	else
	{
		resetLabel("vtolFactoryCaptureZone", CAM_HUMAN_PLAYER);
	}
});

function heliAttack1()
{
	// Attack anything
	const ext = {
		limit: [1, 1],
		alternate: true,
		repair: 30
	};
	camSetVtolData(MIS_YELLOW_SCAVS, "heliAttackPos", "heliRemoveZone", [cTempl.helcan, cTempl.helhmg], camChangeOnDiff(camMinutesToMilliseconds(2)), "heliTower1", ext);
}

function heliAttack2()
{
	// Focus towards the player's LZ
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		repair: 40
	};
	camSetVtolData(MIS_YELLOW_SCAVS, "heliAttackPos", "heliRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(2.5)), "heliTower2", ext);
}

// Start moving scavenger patrol groups
function groupPatrol()
{
	camManageGroup(camMakeGroup("scavPatrolGroup1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("scavPatrolPos5"),
			camMakePos("scavPatrolPos6")
		],
		interval: camSecondsToMilliseconds(18)
	});

	camManageGroup(camMakeGroup("scavPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("scavPatrolPos7"),
			camMakePos("scavPatrolPos8"),
			camMakePos("scavPatrolPos9")
		],
		interval: camSecondsToMilliseconds(35)
	});

	camManageGroup(camMakeGroup("scavPatrolGroup3"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("scavPatrolPos10"),
			camMakePos("scavPatrolPos11")
		],
		interval: camSecondsToMilliseconds(20)
	});
}

// Send a squad to the player's LZ
function ambushLZ()
{
	if (ambushTriggered)
	{
		return;
	}

	camManageGroup(camMakeGroup("scavAmbushGroup"), CAM_ORDER_ATTACK, {
		pos: camMakePos("landingZone"),
		morale: 40,
		fallback: camMakePos("landingZoneCharlie")
	});
	ambushTriggered = true;
}

function enableFirstFactories()
{
	camEnableFactory("scavOuterFactory1");
	camEnableFactory("scavOuterFactory4");
}

function enableSecondFactories()
{
	camEnableFactory("scavOuterFactory2");
	camEnableFactory("scavOuterFactory3");
}

function enableThirdFactories()
{
	camEnableFactory("scavInnerFactory1");
	camEnableFactory("scavOuterFactory5");
}

function enableFinalFactories()
{
	camEnableFactory("scavInnerFactory2");
	camEnableFactory("scavInnerFactory3");
}

function sendCharlieTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Charlie, this is:
	// Trucks -> Repair -> Slow Attack -> Fast Attack
	let droidQueue = [];

	if (!camDef(camGetTruck(charlieTruckJob1))) droidQueue.push(cTempl.truck);
	if (!camDef(camGetTruck(charlieTruckJob2))) droidQueue.push(cTempl.truck);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([charlieRepairGroup, charlieSlowAttackGroup, charlieFastAttackGroup]));

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

function sendFoxtrotTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Foxtrot, this is:
	// Trucks -> Repair -> Attack
	let droidQueue = [];

	if (!camDef(camGetTruck(foxtrotTruckJob1))) droidQueue.push(cTempl.cyben);
	if (!camDef(camGetTruck(foxtrotTruckJob2))) droidQueue.push(cTempl.cyben);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([foxtrotRepairGroup, foxtrotAttackGroup]));

	const droids = [];
	// Get (up to) the first 10 units in the queue
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_FOXTROT, camMakePos("landingZoneFoxtrot"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: transportEntryPosFoxtrot,
				exit: transportEntryPosFoxtrot
			}
		);
	}
}

function sendGolfTransporter()
{
	// Make a list of droids to bring in in order of importance
	// For team Golf, this is:
	// Trucks -> Repair -> Attack -> Sensor -> Mortar
	let droidQueue = [];

	if (!camDef(camGetTruck(golfTruckJob))) droidQueue.push(cTempl.plltruckt);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([golfRepairGroup, golfAttackGroup, golfSensorGroup, golfMortarGroup]));

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
		return; // don't care
	}

	const transDroids = camGetTransporterDroids(transport.player);
	var truckJobs;
	switch (transport.player)
	{
		case MIS_TEAM_CHARLIE:
		{
			truckJobs = [charlieTruckJob1, charlieTruckJob2];
			otherGroups = [charlieRepairGroup, charlieSlowAttackGroup, charlieFastAttackGroup];
			break;
		}
		case MIS_TEAM_FOXTROT:
		{
			truckJobs = [foxtrotTruckJob1, foxtrotTruckJob2];
			otherGroups = [foxtrotRepairGroup, foxtrotAttackGroup];
			break;
		}
		case MIS_TEAM_GOLF:
		{
			truckJobs = [golfTruckJob];
			otherGroups = [golfRepairGroup, golfAttackGroup, golfSensorGroup, golfMortarGroup];
			break;
		}
		default:
		{
			// Scav transport??? How did we get here?
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

	// Next, check if a new (golf) sensor unit has landed
	// If so, apply its label
	if (transport.player === MIS_TEAM_GOLF)
	{
		for (const droid of transOther)
		{
			if (droid.droidType === DROID_SENSOR)
			{
				// New Golf sensor tank
				addLabel(droid, "golfSensor");
			}
		}
	}

	// Assign other units to their refillable groups
	camAssignToRefillableGroups(transOther, otherGroups);
}

// Trigger the ambush early if the player attacks
function eventAttacked(victim, attacker) 
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (victim.player == CAM_HUMAN_PLAYER || attacker.player == CAM_HUMAN_PLAYER)
	{
		camCallOnce("ambushLZ");

		if ((victim.type === STRUCTURE && isNasdaStructure(victim)) || (attacker.type === STRUCTURE && isNasdaStructure(attacker)))
		{
			camCallOnce("nasdaStructDialogue");
		}
	}
}

// Dialogue about scavengers using NASDA defenses
function nasdaStructDialogue()
{
	camQueueDialogue([
		{text: "LIEUTENANT: It seems that these scavengers are", delay: 2, sound: CAM_RCLICK},
		{text: "repurposing NASDA's Pre-Collapse defense systems.", delay: 0},
		{text: "LIEUTENANT: ...But they look like they're in rather poor condition.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: A few crumbling hardpoints aren't going to stop us today.", delay: 6, sound: CAM_RCLICK},
		{text: "CLAYDE: Continue your assault, Commanders.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Allow allies to start bringing reinforcements
function camEnemyBaseEliminated_charlieLZBase()
{
	// NOTE: For the simplicity's sake, allied LZ's cannot be compromised or permanently destroyed on this mission.
	sendCharlieTransporter();
	setTimer("sendCharlieTransporter", camMinutesToMilliseconds(2.5));
	hackRemoveMessage("CHARLIE_LZ", PROX_MSG, CAM_HUMAN_PLAYER);

	camQueueDialogue([
		{text: "CHARLIE: Good work clearing our LZ, Bravo.", delay: 6, sound: CAM_RCLICK},
		{text: "CHARLIE: We'll help keep the scavengers off your back while you clear the other LZs.", delay: 3, sound: CAM_RCLICK},
	]);

	charlieLZSecure = true;
	updateExtraObjectiveMessage();

	camCallOnce("enableFirstFactories");
	camCallOnce("enableSecondFactories");
}

function camEnemyBaseEliminated_foxtrotLZBase()
{
	sendFoxtrotTransporter();
	setTimer("sendFoxtrotTransporter", camMinutesToMilliseconds(2.5));
	hackRemoveMessage("FOXTROT_LZ", PROX_MSG, CAM_HUMAN_PLAYER);

	camQueueDialogue([
		{text: "FOXTROT: Thanks, Bravo.", delay: 6, sound: CAM_RCLICK},
		{text: "FOXTROT: We'll begin our assault in a moment.", delay: 3, sound: CAM_RCLICK},
	]);

	foxtrotLZSecure = true;
	updateExtraObjectiveMessage();

	camCallOnce("enableFirstFactories");
	camCallOnce("enableSecondFactories");
	camCallOnce("enableThirdFactories");
	if (difficulty >= HARD) camCallOnce("enableFinalFactories");
}

function camEnemyBaseEliminated_golfLZBase()
{
	sendGolfTransporter();
	setTimer("sendGolfTransporter", camMinutesToMilliseconds(2.5));
	hackRemoveMessage("GOLF_LZ", PROX_MSG, CAM_HUMAN_PLAYER);

	camQueueDialogue([
		{text: "GOLF: Good show, Bravo.", delay: 6, sound: CAM_RCLICK},
		{text: "GOLF: Now, let's show these scavs some REAL military muscle!", delay: 3, sound: CAM_RCLICK},
	]);

	golfLZSecure = true;
	updateExtraObjectiveMessage();

	camCallOnce("enableFirstFactories");
	camCallOnce("enableSecondFactories");
	camCallOnce("enableThirdFactories");
	camCallOnce("enableFinalFactories");
}

function updateExtraObjectiveMessage()
{
	const message = ["Capture NASDA Central"];
	if (!charlieLZSecure) message.push("Secure team Charlie's LZ");
	if (!foxtrotLZSecure) message.push("Secure team Foxtrot's LZ");
	if (!golfLZSecure) message.push("Secure team Golf's LZ");
	camSetExtraObjectiveMessage(message);

	if (charlieLZSecure && foxtrotLZSecure && golfLZSecure)
	{
		camQueueDialogue([
			{text: "LIEUTENANT: Excellent. All LZs secure.", delay: 6, sound: CAM_RCLICK},
			{text: "LIEUTENANT: Good work, Commander Bravo.", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: I'm sure the General will commend you once this battle is over.", delay: 3, sound: CAM_RCLICK},
		]);
	}
}

function eventDestroyed(obj)
{
	if (obj.type !== STRUCTURE)
	{
		return;
	}

	if (obj.player === MIS_YELLOW_SCAVS)
	{
		// Check if any of the component zones are clear (and ready for capture)
		if (!powerClear && enumArea("powerCaptureZone", MIS_YELLOW_SCAVS, false).filter((obj) => (obj.type === STRUCTURE)).length == 0)
		{
			powerClear = true;
			hackAddMessage("POWER_ZONE", PROX_MSG, CAM_HUMAN_PLAYER);
			camCallOnce("captureDialogue");
		}

		if (!uplinkClear && enumArea("uplinkCaptureZone", MIS_YELLOW_SCAVS, false).filter((obj) => (obj.type === STRUCTURE)).length == 0)
		{
			uplinkClear = true;
			hackAddMessage("UPLINK_ZONE", PROX_MSG, CAM_HUMAN_PLAYER);
			camCallOnce("captureDialogue");
		}

		if (!vtolClear && enumArea("vtolFactoryCaptureZone", MIS_YELLOW_SCAVS, false).filter((obj) => (obj.type === STRUCTURE)).length == 0)
		{
			vtolClear = true;
			hackAddMessage("VTOL_ZONE", PROX_MSG, CAM_HUMAN_PLAYER);
			camCallOnce("captureDialogue");
		}
	}
	else if (obj.player === MIS_NASDA || obj.player === MIS_CLAYDE)
	{
		// If an important structure is destroyed, just quietly replace it
		// NOTE: ".Id" is correct here!
		addStructure(camGetCompStats(obj.name, "Building").Id, obj.player, obj.x * 128, obj.y * 128);

		// This won't replace the modules on the power generators, but oh well :/
	}
}

function captureDialogue()
{
	camQueueDialogue([
		{text: "LIEUTENANT: Commander Bravo, one of NASDA Central's components is clear of hostiles.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Move your units nearby to capture it.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Pre-damage all NASDA stuff
function preDamageStuff()
{
	// Damage NASDA components
	let structs = enumStruct(MIS_NASDA);
	for (const struct of structs)
	{
		setHealth(struct, 50 + camRand(25));
	}

	// Damage NASDA defenses
	let defenses = enumStruct(MIS_YELLOW_SCAVS).filter((struct) => (isNasdaStructure(struct)));
	for (const struct of defenses)
	{
		setHealth(struct, camChangeOnDiff(60, true) + camRand(20));
	}
}

// Returns true if the given structure is considered belonging to NASDA
function isNasdaStructure(struct)
{
	return (struct.name == "Rusty Medium Cannon Hardpoint" ||
		struct.name == "Rusty Heavy Machinegun Tower" ||
		struct.name == "Rusty Mini-Rocket Tower" ||
		struct.name == "Old Hardcrete Wall" ||
		struct.name == "Old Hardcrete Corner Wall" ||
		struct.name == "Old Heavy Machinegun Bunker" ||
		struct.name == "Repair Facility" ||
		struct.name == "VTOL Rearming Pad");
}

// Victory dialogue
function finalDialogue()
{
	playSound(cam_sounds.objective.primObjectiveCompleted);
	camGrantBonusPower();

	camQueueDialogue([
		{text: "CLAYDE: Excellent work, Commanders.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: NASDA Central is ours.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, return to base.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Charlie, Foxtrot, Golf. You three secure the area.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I'll send some forces over shortly to fortify NASDA Central.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Good work, everyone.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Let today's victory mark the start of a bright new age.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: General Clayde, signing off.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Returns true if all NASDA components are captured
function nasdaCaptured()
{
	if (powerCaptured && uplinkCaptured && vtolCaptured && camAllArtifactsPickedUp())
	{
		camCallOnce("finalDialogue");

		if (!tweakOptions.rec_timerlessMode && getMissionTime() < camMinutesToSeconds(10))
		{
			// Disable the timer if the player is just waiting for dialogue to finish
			setMissionTime(-1);
		}

		if (camDialogueDone())
		{
			return true;
		}
	} 
	return undefined;
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A1L3", {
		message: "RET_LZ",
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(2.5),
		callback: "nasdaCaptured"
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	// Make sure the scavengers/allies aren't choosing conflicting colors with the player
	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(MIS_NASDA, 10); // NASDA is white in all cases
	changePlayerColour(MIS_CLAYDE, (PLAYER_COLOR !== 15) ? 15 : 0); // Clayde to brown or green
	changePlayerColour(MIS_YELLOW_SCAVS, (PLAYER_COLOR !== 8) ? 8 : 1); // Scavs to yellow or orange
	changePlayerColour(MIS_TEAM_CHARLIE, (PLAYER_COLOR !== 11) ? 11 : 5); // Charlie to bright blue or blue
	changePlayerColour(MIS_TEAM_FOXTROT, (PLAYER_COLOR !== 13) ? 13 : 4); // Foxtrot to infrared or red
	changePlayerColour(MIS_TEAM_GOLF, (PLAYER_COLOR !== 7) ? 7 : 12); // Golf to cyan or neon green

	camCompleteRequiredResearch(mis_scavResearch, MIS_YELLOW_SCAVS);
	camCompleteRequiredResearch(camA1L2AllyResearch, MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(camA1L2AllyResearch, MIS_TEAM_FOXTROT);
	camCompleteRequiredResearch(camA1L2AllyResearch, MIS_TEAM_GOLF);

	// Wow there's a lot of these...
	setAlliance(MIS_NASDA, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_NASDA, MIS_YELLOW_SCAVS, true);
	setAlliance(MIS_NASDA, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_NASDA, MIS_TEAM_FOXTROT, true);
	setAlliance(MIS_NASDA, MIS_TEAM_GOLF, true);
	setAlliance(MIS_CLAYDE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CLAYDE, MIS_YELLOW_SCAVS, true);
	setAlliance(MIS_CLAYDE, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_CLAYDE, MIS_TEAM_FOXTROT, true);
	setAlliance(MIS_CLAYDE, MIS_TEAM_GOLF, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_CHARLIE, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_FOXTROT, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_GOLF, true);
	setAlliance(MIS_TEAM_CHARLIE, MIS_TEAM_FOXTROT, true);
	setAlliance(MIS_TEAM_CHARLIE, MIS_TEAM_GOLF, true);
	setAlliance(MIS_TEAM_FOXTROT, MIS_TEAM_GOLF, true);

	// Allow the player to view allied objects
	camSetObjectVision(MIS_TEAM_CHARLIE);
	camSetObjectVision(MIS_TEAM_FOXTROT);
	camSetObjectVision(MIS_TEAM_GOLF);

	camSetArtifacts({
		"scavInnerFactory1": { tech: "R-Wpn-MG3Mk1" }, // Heavy Machinegun
		"scavInnerFactory2": { tech: "R-Wpn-Cannon-Accuracy01" }, // Cannon Laser Rangefinder
		"scavInnerFactory3": { tech: "R-Vehicle-Prop-Halftracks" }, // Half-Tracks
		"repairFacility": { tech: "R-Struc-RepairFacility" }, // Repair Facility
	});

	camSetEnemyBases({
		"charlieLZBase": {
			cleanup: "scavLZBase1",
			detectMsg: "SCAV_LZBASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
			// We need to designate a player here because allies will eventually build over this base
			player: MIS_YELLOW_SCAVS
		},
		"foxtrotLZBase": {
			cleanup: "scavLZBase2",
			detectMsg: "SCAV_LZBASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated,
			player: MIS_YELLOW_SCAVS
		},
		"golfLZBase": {
			cleanup: "scavLZBase3",
			detectMsg: "SCAV_LZBASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
			player: MIS_YELLOW_SCAVS
		},
		"scavHillBase": {
			cleanup: "scavOuterBase1",
			detectMsg: "SCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"scavMiniOutpost": {
			cleanup: "scavOuterBase2",
			detectMsg: "SCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated,
		},
		"scavCanalBase": {
			cleanup: "scavOuterBase3",
			detectMsg: "SCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"scavNEBase": {
			cleanup: "scavOuterBase4",
			detectMsg: "SCAV_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		// These are allied LZs:
		"charlieLZ": {
			cleanup: "scavLZBase1",
			friendly: true,
			player: MIS_TEAM_CHARLIE
		},
		"foxtrotLZ": {
			cleanup: "scavLZBase2",
			friendly: true,
			player: MIS_TEAM_FOXTROT
		},
		"golfLZ": {
			cleanup: "scavLZBase3",
			friendly: true,
			player: MIS_TEAM_GOLF
		},
	});

	camSetFactories({
		"scavOuterFactory1": {
			assembly: "scavOuterAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.buscan, cTempl.trike, cTempl.bloke, cTempl.rbuggy, cTempl.lance ]
		},
		"scavOuterFactory2": {
			assembly: "scavOuterAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				regroup: true
			},
			groupSize: 6,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.moncan, cTempl.gbjeep, cTempl.rbjeep, cTempl.monhmg, cTempl.sartruck, cTempl.lance, cTempl.bjeep, cTempl.bjeep ]
		},
		"scavOuterFactory3": {
			assembly: "scavOuterAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				regroup: true
			},
			groupSize: 4,
			maxSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.gbjeep, cTempl.buggy, cTempl.trike, cTempl.gbjeep, cTempl.minitruck, ]
		},
		"scavOuterFactory4": {
			assembly: "scavOuterAssembly4",
			order: CAM_ORDER_ATTACK,
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.buscan, cTempl.trike, cTempl.bloke, cTempl.lance, cTempl.bloke, cTempl.buggy, cTempl.rbuggy, cTempl.gbjeep, cTempl.firetruck ]
		},
		"scavOuterFactory5": {
			assembly: "scavOuterAssembly5",
			order: CAM_ORDER_COMPROMISE,
			data: {
				// This factory targets the player specifically
				targetPlayer: CAM_HUMAN_PLAYER,
				pos: camMakePos("landingZone")
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(36)),
			templates: [ cTempl.rbuggy, cTempl.trike, cTempl.bloke, cTempl.lance, cTempl.monfire, cTempl.sartruck, cTempl.flatmrl ]
		},
		"scavInnerFactory1": {
			assembly: "scavInnerAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 15 // This is the only mission in the game where scavengers can repair
			},
			groupSize: 6,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			templates: [ cTempl.monhmg, cTempl.kevbloke, cTempl.kevlance, cTempl.kevbloke, cTempl.kevlance, cTempl.kevbloke, cTempl.kevlance, cTempl.bjeep ]
		},
		"scavInnerFactory2": {
			assembly: "scavInnerAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 15
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(30)),
			templates: [ cTempl.moncan, cTempl.minitruck, cTempl.flatmrl, cTempl.monfire, cTempl.kevlance, cTempl.monmrl, cTempl.sartruck ]
		},
		"scavInnerFactory3": {
			assembly: "scavInnerAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				// This factory targets the player specifically
				targetPlayer: CAM_HUMAN_PLAYER,
				regroup: true,
				repair: 15
			},
			groupSize: 4,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.flatmrl, cTempl.monsar, cTempl.bjeep, cTempl.rbjeep, cTempl.firetruck, cTempl.monmrl, cTempl.gbjeep ]
		},
	});

	componentClear = false;
	powerCaptured = false;
	uplinkClear = false;
	uplinkCaptured = false;
	vtolClear = false;
	vtolCaptured = false;
	ambushTriggered = false;
	charlieLZSecure = false;
	foxtrotLZSecure = false;
	golfLZSecure = false;
	updateExtraObjectiveMessage();

	// Set up (new!) refillable groups
	// Also set up allied trucks

	// Scav patrol group (2 MRPs, 4 Grenade Jeeps)
	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.minitruck, cTempl.minitruck,
				cTempl.gbjeep, cTempl.gbjeep, cTempl.gbjeep, cTempl.gbjeep,
			],
			factories: ["scavOuterFactory3"]
		}, CAM_ORDER_PATROL, {
			// Patrol and harass the player's LZ
			pos: [ "scavPatrolPos1", "scavPatrolPos2", "scavPatrolPos3", "scavPatrolPos4" ],
			interval: camSecondsToMilliseconds(20),
			radius: 8
	});

	// Charlie slow attack group (6 Mini-Rockets, 4 Twin Machineguns)
	charlieSlowAttackGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.pllpodt, cTempl.pllpodt, cTempl.pllpodt, cTempl.pllpodt, cTempl.pllpodt, cTempl.pllpodt,
				cTempl.plltmgt, cTempl.plltmgt, cTempl.plltmgt, cTempl.plltmgt,
			]
		}, CAM_ORDER_ATTACK, {
			pos: camMakePos("vtolFactoryCaptureZone"),
			count: 10,
			morale: 80,
			fallback: camMakePos("scavOuterAssembly1"),
			repair: 75,
			repairPos: camMakePos("scavOuterAssembly1") // Wait here for repairs
	});
	// Charlie fast attack group (4 Machinegunner Cyborgs, 4 Light Cannons, 2 Mini-Rocket Arrays)
	charlieFastAttackGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.cybmg, cTempl.cybmg, cTempl.cybmg, cTempl.cybmg,
				cTempl.pllcanw, cTempl.pllcanw, cTempl.pllcanw, cTempl.pllcanw,
				cTempl.pllmraw, cTempl.pllmraw,
			]
		}, CAM_ORDER_ATTACK, {
			count: 10,
			morale: 80,
			fallback: camMakePos("scavOuterAssembly1"),
			// regroup: true,
			repair: 75,
			repairPos: camMakePos("scavOuterAssembly1")
	});
	// Charlie repair group (6 Mechanic Cyborgs)
	charlieRepairGroup = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.cybrp, cTempl.cybrp, cTempl.cybrp, cTempl.cybrp]
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("scavOuterAssembly1")
	});
	// Charlie gets 2 trucks
	charlieTruckJob1 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieLZ", // Label of Charlie's LZ base (which starts unbuilt)
			rebuildBase: true,
			structset: camCharlieA1L2Structs // See structSets.js
			// NOTE: We don't need any more data here, since we'll manually assign/rebuild the truck with transport reinforcements
	});
	charlieTruckJob2 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieLZ",
			rebuildBase: true,
			structset: camCharlieA1L2Structs
	});

	// Foxtrot attack group (8 Flamer Cyborgs, 6 Mini-Rockets, 6 Sarissa Cyborgs)
	foxtrotAttackGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl,
				cTempl.pllpodw, cTempl.pllpodw, cTempl.pllpodw, cTempl.pllpodw, cTempl.pllpodw, cTempl.pllpodw,
				cTempl.cybsa, cTempl.cybsa, cTempl.cybsa, cTempl.cybsa, cTempl.cybsa, cTempl.cybsa,
			]
		}, CAM_ORDER_ATTACK, {
			count: 20,
			morale: 90,
			fallback: camMakePos("scavLZBase2"),
			// regroup: true,
			repair: 75,
			repairPos: camMakePos("scavLZBase2") // Wait here for repairs
	});
	// Foxtrot repair group (4 Repair Turrets)
	foxtrotRepairGroup = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.pllrepw, cTempl.pllrepw, cTempl.pllrepw, cTempl.pllrepw]
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("scavLZBase2")
	});
	// Trucks
	foxtrotTruckJob1 = camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotLZ",
			rebuildBase: true,
			structset: camFoxtrotA1L2Structs
	});
	foxtrotTruckJob2 = camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotLZ",
			rebuildBase: true,
			structset: camFoxtrotA1L2Structs
	});

	// Golf attack group (8 MRA's)
	golfAttackGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.pllmrat, cTempl.pllmrat, cTempl.pllmrat, cTempl.pllmrat, cTempl.pllmrat, cTempl.pllmrat, cTempl.pllmrat, cTempl.pllmrat,
			]
		}, CAM_ORDER_ATTACK, {
			count: 8,
			morale: 80,
			fallback: camMakePos("scavOuterAssembly4"), // Prioritize this area
			repair: 50,
			repairPos: camMakePos("scavLZBase3") // Wait here for repairs
	});
	// Golf mortar group (6 Mortars)
	golfMortarGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.pllmortt, cTempl.pllmortt, cTempl.pllmortt, cTempl.pllmortt, cTempl.pllmortt, cTempl.pllmortt,
			]
		}, CAM_ORDER_FOLLOW, {
			leader: "golfSensor",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("scavLZBase3"), // Defend here if sensor dies
			},
			repairPos: camMakePos("scavLZBase3") // Wait here for repairs
	});
	// Golf sensor "group" (Just a single Sensor)
	golfSensorGroup = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.pllsenst]
		}, CAM_ORDER_ATTACK, {
		pos: camMakePos("scavOuterAssembly4") // Prioritize this area
	}); 
	// Golf repair group (2 Repair Turrets)
	golfRepairGroup = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.pllrept, cTempl.pllrept]
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("scavLZBase3")
	});
	// Truck
	golfTruckJob = camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfLZ",
			rebuildBase: true,
			structset: camGolfA1L2Structs
	});

	// If we're in Timerless mode, set up scavenger Cranes
	if (tweakOptions.rec_timerlessMode)
	{
		// Northeast scav base
		camManageTrucks(
			MIS_YELLOW_SCAVS, {
				label: "scavNEBase",
				rebuildBase: true,
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
				template: cTempl.crane,
				structset: camAreaToStructSet("scavOuterBase4")
		});
		if (difficulty >= MEDIUM)
		{
			// Southwest scav base
			camManageTrucks(
				MIS_YELLOW_SCAVS, {
					label: "scavHillBase",
					rebuildBase: true,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
					template: cTempl.crane,
					structset: camAreaToStructSet("scavOuterBase1")
			});
		}
		if (difficulty >= HARD)
		{
			// Southeast scav base
			camManageTrucks(
				MIS_YELLOW_SCAVS, {
					label: "scavCanalBase",
					rebuildBase: true,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
					template: cTempl.crane,
					structset: camAreaToStructSet("scavOuterBase3")
			});
		}
	}

	camAutoReplaceObjectLabel(["heliTower1", "heliTower2"]);

	queue("groupPatrol", camChangeOnDiff(camMinutesToMilliseconds(0.25)));
	queue("ambushLZ", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("enableFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("enableSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("enableThirdFactories", camChangeOnDiff(camMinutesToMilliseconds(12)));
	queue("enableFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(20)));
	queue("heliAttack1", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("heliAttack2", camChangeOnDiff(camMinutesToMilliseconds(12)));

	preDamageStuff();

	hackAddMessage("CHARLIE_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("FOXTROT_LZ", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("GOLF_LZ", PROX_MSG, CAM_HUMAN_PLAYER);

	// Lighten the fog to *more or less* 2x default brightness
	camSetFog(32, 32, 96);
	// Shift the sun slightly the east
	camSetSunPos(-225.0, -600.0, 450.0);
	// Increase the lighting
	camSetSunIntensity(.6,.6,.6);
	camSetWeather(CAM_WEATHER_CLEAR);
}