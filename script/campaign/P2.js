include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_scavResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];
const mis_infestedRes = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];

// Player values
const MIS_CIVS = 1;
const MIS_CYAN_SCAVS = 2;
const MIS_TEAM_CHARLIE = 3;
// Order number for guarding an droid/structure
const DORDER_GUARD = 25;
const MIS_MAX_THREAT = 30;

var sensorFound;
var infestedActive;
var depositBeaconActive;
var trucksLost;
var infestedThreatFactor;
var infestedThreatFactorMin;
var truckLostThreshold;
var scavWestStructSet;
var scavOilStructSet;
var infestedAggroCombo;

// Civilian holdout groups
var civGroups;

// Whether each civilian group has been loaded onto a truck
var civsLoaded;

// Whether each truck has arrived the deposit zone
var truck1Safe;
var truck2Safe;
var truck3Safe;
var truck4Safe;

//Remove scav helicopters.
camAreaEvent("heliRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		if (isVTOL(droid))
		{
			camSafeRemoveObject(droid, false);
		}
	}

	resetLabel("heliRemoveZone", MIS_CYAN_SCAVS);
});

// Setup helicopter attacks.
function heliAttack()
{
	const list = [cTempl.helcan, cTempl.helhmg];
	const ext = {
		limit: [1, 1],
		alternate: true,
		callback: "strikeTargets", // Focus only on the player
		altOrder: CAM_ORDER_ATTACK,
	};

	// A helicopter will attack the player every 2 minutes.
	// The helicopter attacks stop when the VTOL radar tower is destroyed.
	camSetVtolData(MIS_CYAN_SCAVS, "heliAttackPos", "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(2)), "heliTower", ext);
}

// Setup hunter helicopter attacks.
function hunterAttack()
{
	const list = [cTempl.helcan];
	const ext = {
		limit: [1],
		alternate: true,
		callback: "truckTargets", // Focus only on the player's trucks
		altOrder: CAM_ORDER_ATTACK,
	};

	camSetVtolData(MIS_CYAN_SCAVS, "heliAttackPos", "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(2)), "heliTower", ext);
}

// Triggered when the player moves towards the haven
camAreaEvent("ambushTrigger", function(droid)
{
	// Only trigger if the player move a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camManageGroup(camMakeGroup("scavAmbushGroup"), CAM_ORDER_ATTACK, {
			morale: 50,
			fallback: camMakePos("scavBase1"),
			targetPlayer: CAM_HUMAN_PLAYER
		});
		camManageGroup(camMakeGroup("charlieDefenseGroup"), CAM_ORDER_DEFEND, {
			radius: 12,
			pos: camMakePos("charlieDefensePos")
		});
	}
	else
	{
		resetLabel("ambushTrigger", CAM_HUMAN_PLAYER);
	}
});

// Triggered when the player enters the haven's safe zone
camAreaEvent("safeZone", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Play dialogue, then donate the base to the player
		camQueueDialogue([
			{text: "CHARLIE: General, Commander Bravo has arrived at the haven.", delay: 2, sound: CAM_RCLICK},
			{text: "CLAYDE: Right on time.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Let's get down to business.", delay: 2, sound: CAM_RCLICK},
			{delay: 3, callback: "donateBase"},
		]);

		hackRemoveMessage("SAFE_HAVEN", PROX_MSG, CAM_HUMAN_PLAYER);
	}
	else
	{
		resetLabel("safeZone", CAM_HUMAN_PLAYER);
	}
});

function donateBase()
{
	restoreLimboMissionData();

	// Donate all of team Charlie's things in the haven
	const charlieObjects = enumArea("safeZone", MIS_TEAM_CHARLIE, false).filter((obj) => (obj.type === STRUCTURE)).concat(enumDroid(MIS_TEAM_CHARLIE));

	for (const obj of charlieObjects)
	{
		donateObject(obj, CAM_HUMAN_PLAYER);
	}

	// Enable basic base structures for the player
	for (let i = 0; i < camBasicStructs.length; ++i)
	{
		enableStructure(camBasicStructs[i], CAM_HUMAN_PLAYER);
	}

	setPower(playerPower(CAM_HUMAN_PLAYER) + camChangeOnDiff(1000), CAM_HUMAN_PLAYER);

	const lz = getObject("landingZone");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Transmission about the new objective
	camPlayVideos({video: "P2_CIVS", type: MISS_MSG});

	// queue("expandMap", camSecondsToMilliseconds(29));
	expandMap();

	setTimer("sendCharlieTransport", camMinutesToMilliseconds(2));
}

function sendCharlieTransport()
{
	camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZone"), [cTempl.truck],
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 56, y: 61 },
			exit: { x: 56, y: 61 }
		}
	);
}

function expandMap()
{
	// Expand the map to full size
	setScrollLimits(0, 0, 96, 64);

	// Place beacons on each holdout
	hackAddMessage("CIVS1", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS2", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS3", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS4", PROX_MSG, CAM_HUMAN_PLAYER);

	// Queue the start of the infested waves and scavenger bases
	queue("startInfestedWaves", camSecondsToMilliseconds(60));
	queue("revealEastBase", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("revealWestBase", camChangeOnDiff(camMinutesToMilliseconds(10)));

	// Start some scavenger patrols
	camManageGroup(camMakeGroup("eastPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("eastPatrolPos1"),
			camMakePos("eastPatrolPos2"),
			camMakePos("eastPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(18)
	});
	camManageGroup(camMakeGroup("westPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("westPatrolPos1"),
			camMakePos("westPatrolPos2"),
			camMakePos("westPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(24)
	});

	// Set the mission time
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camMinutesToSeconds(45));
	}
	else
	{
		// Set up scavenger cranes...
		camManageTrucks(
			MIS_CYAN_SCAVS, {
				label: "eastScavBase",
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(100)),
				template: cTempl.crane,
				structset: camAreaToStructSet("scavBase1")
		});

		// Store these structure sets for later
		scavWestStructSet = camAreaToStructSet("scavBase3");
		scavOilStructSet = camAreaToStructSet("scavBase2");
	}

	queue("setVictory", camSecondsToMilliseconds(1));
}

// Set victory data
// Called on a delay to avoid failing the player if Charlie's units aren't transferred fast enough
function setVictory()
{
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "A1L1", {showArtifacts: false});
	camSetExtraObjectiveMessage(["Use Trucks to escort civilians back to the haven", "Don't lose " + truckLostThreshold + " Transport Trucks (0 LOST)"]);
}

function startInfestedWaves()
{
	infestedActive = true;
	setTimer("sendInfestedReinforcements", camSecondsToMilliseconds((difficulty >= MEDIUM) ? 40 : 60));

	// Dialogue about the infested groups along the highway
	camQueueDialogue([
		{text: "--- ANOMALOUS SIGNAL DETECTED ---", delay: 0, sound: cam_sounds.beacon},
		{text: "CHARLIE: General!", delay: 30, sound: CAM_RCLICK},
		{text: "CHARLIE: We've detected groups of infested moving south along the roads nearby!", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: There's no need for alarm, Commander Charlie.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Those infested are being drawn away by a Lure.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: They shouldn't pose a threat to your mission.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, try to avoid the Infested if you can.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Focus on escorting those civilians back to the haven.", delay: 5, sound: CAM_RCLICK},
		{text: "CLAYDE: The Infested should be avoidable if you can maintain your distance from them.", delay: 3, sound: CAM_RCLICK},
	]);
}

function revealEastBase()
{
	camDetectEnemyBase("eastScavBase");
}

function revealWestBase()
{
	camDetectEnemyBase("westScavBase");
}

// Triggered when the player moves near Charlie's lone sensor tower
camAreaEvent("sensorZone", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		sensorFound = true;
		setTimer("donateSensor", camSecondsToMilliseconds(3));
	}
	else
	{
		resetLabel("sensorZone", CAM_HUMAN_PLAYER);
	}
});

function donateSensor()
{
	if (!sensorFound || !infestedActive)
	{
		return;
	}

	removeTimer("donateSensor");

	// Donate all of team Charlie's things in the haven
	const charlieObjects = enumArea("sensorZone", MIS_TEAM_CHARLIE, false).filter((obj) => (obj.type === STRUCTURE));

	for (const obj of charlieObjects)
	{
		// There really should only be one object here...
		donateObject(obj, CAM_HUMAN_PLAYER);
	}

	// Dialogue about the using the sensor to spot the Infested
	camQueueDialogue([
		{text: "CHARLIE: Commander Bravo, we can use sensors like this one", delay: 2, sound: CAM_RCLICK},
		{text: "to monitor enemies from a safe distance.", delay: 0},
		{text: "CHARLIE: That should make it easier to avoid the Infested.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Triggered when the player moves into the first civilian holdout
camAreaEvent("civZone1", function(droid)
{
	// Only trigger if the player moves a Truck (NOT engineer) in which isn't already carrying civilians
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroups[1]))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck", camSecondsToMilliseconds(3), "1");

	}
	else
	{
		resetLabel("civZone1", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("civZone2", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroups[2]))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck", camSecondsToMilliseconds(3), "2");

	}
	else
	{
		resetLabel("civZone2", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("civZone3", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroups[3]))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck", camSecondsToMilliseconds(3), "3");

	}
	else
	{
		resetLabel("civZone3", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("civZone4", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroups[4]))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck", camSecondsToMilliseconds(3), "4");

	}
	else
	{
		resetLabel("civZone4", CAM_HUMAN_PLAYER);
	}
});

function loadTruck(index)
{
	const civArea = "civZone" + index;

	const trucks = enumArea(civArea, CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));
	// Abort if there's no longer a truck in the civilian zone
	if (trucks.length == 0)
	{
		const pos = camMakePos(civArea);
		for (const civ of enumGroup(civGroups[index]))
		{
			// Move the civs back into their holdout
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		resetLabel(civArea, CAM_HUMAN_PLAYER);
		return;
	}
	else
	{
		// Just change the first truck we find into a Transport Truck
		const transTruck = convertToTransport(trucks[0], "civTruck" + index);

		for (const droid of enumGroup(civGroups[index]))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				// If we have a simple civilian, remove them quietly
				// (They've "boarded" the truck)
				camSafeRemoveObject(droid);
			}
			else
			{
				// If we have an armed civilian escort, (e.g. a Jeep), tell it to guard the player's transport truck
				orderDroidObj(droid, DORDER_GUARD, transTruck);
			}
		}

		camCallOnce("truckLoadedDialogue");

		civsLoaded[index] = true;

		hackRemoveMessage("CIVS" + index, PROX_MSG, CAM_HUMAN_PLAYER);
		if (!depositBeaconActive)
		{
			hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
			depositBeaconActive = true;
		}
	}
}

// Replaces the given truck droid with a transport truck
function convertToTransport(truck, transportLabel)
{
	const oldTruckName = truck.name;
	const tBody = truck.body;
	const tProp = truck.propulsion;
	const tPos = camMakePos(truck);

	// Get the un-modified name of this truck
	const standardName = _("Truck") + " " + camGetCompNameFromId(tBody, "Body") + " " + camGetCompNameFromId(tProp, "Propulsion");

	let newName;
	if (oldTruckName === standardName)
	{
		// The player hasn't renamed this truck.
		// Give it the default template name
		newName = camNameTemplate("Spade1Trans", tBody, tProp);
	}
	else
	{
		// The player has renamed this truck
		// Just slap "Transport" in front of the player's goofy name
		newName = _("Transport") + " " + oldTruckName;
	}

	// Create the new truck
	const newTruck = camAddDroid(CAM_HUMAN_PLAYER, tPos, {body: tBody, prop: tProp, weap: "Spade1Trans"}, newName);
	addLabel(newTruck, transportLabel);

	// Quietly remove the old truck...
	camSafeRemoveObject(truck);

	return newTruck;
}

// Triggered when something enters the deposit zone
camAreaEvent("depositZone", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		const label = getLabel(droid);
		if (camDef(label) && label === "civTruck1")
		{
			truck1Safe = true;
		}
		else if (camDef(label) && label === "civTruck2")
		{
			truck2Safe = true;
		}
		else if (camDef(label) && label === "civTruck3")
		{
			truck3Safe = true;
		}
		else if (camDef(label) && label === "civTruck4")
		{
			truck4Safe = true;
		}

		if (camDef(label))
		{
			infestedThreatFactorMin += 2;
			infestedThreatFactor += 2;

			convertToTruck(droid);

			playSound(cam_sounds.rescue.civilianRescued);
		}
	}
	else if (droid.player === MIS_CIVS)
	{
		if (camDroidMatchesTemplate(droid, cTempl.civ))
		{
			// If we have a normal civilian, just remove it
			camSafeRemoveObject(droid);
		}
	}
	resetLabel("depositZone", ALL_PLAYERS);
});

// Replaces the given transport truck droid with a normal truck
function convertToTruck(transTruck)
{
	const oldTruckName = transTruck.name;
	const tBody = transTruck.body;
	const tProp = transTruck.propulsion;
	const tPos = camMakePos(transTruck);

	// Get the un-modified name of this truck
	const standardName = _("Transport Truck") + " " + camGetCompNameFromId(tBody, "Body") + " " + camGetCompNameFromId(tProp, "Propulsion");

	let newName;
	if (oldTruckName === standardName)
	{
		// The player didn't renamed the original truck.
		// Give it the default template name
		newName = camNameTemplate("Spade1Mk1", tBody, tProp);
	}
	else
	{
		// The player renamed the original truck.
		// Remove the first instance of "Transport " we find
		const prefix = _("Transport") + " ";
		newName = oldTruckName.slice(prefix.length);
	}

	// Create the new truck
	camAddDroid(CAM_HUMAN_PLAYER, tPos, {body: tBody, prop: tProp, weap: "Spade1Mk1"}, newName);

	// Quietly remove the transport truck...
	camSafeRemoveObject(transTruck);
}

// Dialogue when civilians are first loaded onto a Truck
function truckLoadedDialogue()
{
	camQueueDialogue([
		{text: "CHARLIE: Alright, the civilians are on board.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Now, drive that Truck back to the haven.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: I've marked the drop off point.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Just move the Truck there and the civilians will be safe.", delay: 2, sound: CAM_RCLICK},
	]);
}

// Activate the eastern factory
function camEnemyBaseDetected_eastScavBase()
{
	camEnableFactory("scavFactory1");

	// Dialogue
	camQueueDialogue([
		{text: "CHARLIE: General! We've detected some hostile scavengers that have set up near our base.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Ignore them if possible, Commanders.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: But if they interfere with our objective, you are authorized to clear them out.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Just get as many of those civilians back as you can.", delay: 5, sound: CAM_RCLICK},
	]);
}

// Activate the western factory and VTOL tower
function camEnemyBaseDetected_westScavBase()
{
	camEnableFactory("scavFactory2");
	queue("heliAttack", camChangeOnDiff(camSecondsToMilliseconds(70)));

	// Set these up now so that they don't drive across the map when the first factory activates
	if (tweakOptions.rec_timerlessMode)
	{
		camManageTrucks(
			MIS_CYAN_SCAVS, {
				label: "westScavBase",
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(100)),
				template: cTempl.crane,
				structset: scavWestStructSet
		});
		if (difficulty >= HARD)
		{
			camManageTrucks(
				MIS_CYAN_SCAVS, {
					label: "oilOutpost",
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(100)),
					template: cTempl.crane,
					structset: scavOilStructSet
			});
		}
	}
}

// Off-map infested reinforcements from the north, bearing south.
// As the infested threat level rises, the infested groups become more dangerous.
function sendInfestedReinforcements()
{
	// Divide infested templates based on spiciness...
	const fodderTemplates = [cTempl.infciv]; // Infested Civilians only
	const mildTemplates = [ // Light vehicles and infantry
		cTempl.infbuggy, cTempl.infrbuggy, cTempl.inftrike, cTempl.infbjeep, cTempl.infrbjeep, 
		cTempl.infbloke, cTempl.inflance, cTempl.infkevbloke, cTempl.infkevlance,
	];
	const spicyTemplates = [ // Large vehicles + Stingers
		cTempl.infbuscan, cTempl.inffiretruck, cTempl.infminitruck, cTempl.infsartruck,
		cTempl.stinger,
	];
	const hotTemplates = [ // Bus tanks + Vile Stingers
		cTempl.infmoncan, cTempl.infmonhmg, cTempl.infmonmrl, cTempl.infmonsar,
		cTempl.vilestinger,
	];

	const droids = [];
	const NUM_DROIDS = 8 + Math.floor(infestedThreatFactor / 4);
	for (let i = 0; i < NUM_DROIDS; i++)
	{
		const RAND_NUM = camRand(11) + infestedThreatFactor - 5;
		// Choose a random number that is infestedThreatFactor +/- 5.
		// Then we add template to the Infested group based on the number chosen.
		// The templates chosen based on the following rules:
		// If [0:7], choose from the "fodder" templates (which is just infested civs)
		// If [8:14], choose from the "mild" templates
		// If [15:24], choose from the "spicy" templates
		// If >25, choose from the "hot" templates
		// As the threat factor rises, this will choose larger and larger numbers, which in
		// turn add more threatening units to the Infested groups. 

		if (RAND_NUM <= 7)
		{
			droids.push(camRandFrom(fodderTemplates));
		}
		else if (RAND_NUM >= 8 && RAND_NUM <= 14)
		{
			droids.push(camRandFrom(mildTemplates));
		}
		else if (RAND_NUM >= 15 && RAND_NUM <= 24)
		{
			droids.push(camRandFrom(spicyTemplates));
		}
		else
		{
			droids.push(camRandFrom(hotTemplates));
		}
	}

	// Choose one of the entrances to spawn from
	if (camRand(2) == 0)
	{
		// East entrance
		camSendReinforcement(CAM_INFESTED, getObject("infEntry1"), droids, CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_DEFEND, data: {pos: camMakePos("infExit"), radius: 0}}
		);
	}
	else
	{
		// West entrance
		camSendReinforcement(CAM_INFESTED, getObject("infEntry2"), droids, CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_DEFEND, data: {pos: camMakePos("infExit"), radius: 0}}
		);
	}

	// Decrease the threat factor over time if it's above the minimum
	if (infestedThreatFactor > infestedThreatFactorMin)
	{
		infestedThreatFactor--;
	}
}

// Remove infested units once they reach the end of the road
camAreaEvent("infExit", function(droid)
{
	if (droid.player === CAM_INFESTED)
	{
		const droids = enumArea("infExit", CAM_INFESTED, false);
		for (droid of droids)
		{
			camSafeRemoveObject(droid);
		}
		infestedAggroCombo = 0;
	}
	resetLabel("infExit", CAM_INFESTED);
});

function eventAttacked(victim, attacker)
{
	if (victim.player === CAM_INFESTED && attacker.player === CAM_HUMAN_PLAYER && victim.group !== null)
	{
		if (camGetGroupOrder(victim.group) === CAM_ORDER_DEFEND)
		{
			// The player has attacked one of the meandering Infested groups
			// Re-order the Infested group to attack the player instead
			camManageGroup(victim.group, CAM_ORDER_STRIKE, {
				callback: "strikeTargets", // Focus only on the player
				altOrder: CAM_ORDER_ATTACK,
			});

			// Increase the spiciness of future Infested waves
			infestedThreatFactor += difficulty;
			if (infestedThreatFactor > MIS_MAX_THREAT)
			{
				// Cap the threat factor
				infestedThreatFactor = MIS_MAX_THREAT;
			}

			if (infestedThreatFactor >= 20)
			{
				camCallOnce("infestedThreatDialogue1");
			}
			if (infestedThreatFactor >= MIS_MAX_THREAT)
			{
				camCallOnce("infestedThreatDialogue2");
			}

			infestedAggroCombo++;

			if (infestedAggroCombo >= 6 && infestedThreatFactor >= MIS_MAX_THREAT)
			{
				// If the player has engaged 6 Infested groups in a row and the threat is at the maximum, stop sending the infested altogether
				camCallOnce("stopInfested");
			}
		}
	}
}

// Dialogue if the Infested threat level gets too high
function infestedThreatDialogue1()
{
	camQueueDialogue([
		{text: "CLAYDE: Commander Bravo, we don't have time to waste fighting the Infested.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Try to AVOID confronting the groups traveling along the road.", delay: 3, sound: CAM_RCLICK},
	]);
}

// More dialogue if the Infested threat level reaches the maximum
function infestedThreatDialogue2()
{
	camQueueDialogue([
		{text: "CLAYDE: Commander Bravo, stay AWAY from the Infested!", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: They're being drawn away by one of the Lures we recovered.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: We can't afford to waste time holding them back, so let them pass us by.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Stop the Infested attacks, but make the remaining scavengers more aggressive
function stopInfested()
{
	if (!infestedActive)
	{
		return;
	}

	removeTimer("sendInfestedReinforcements");
	infestedActive = false;

	// Same templates as before, but with a much faster throttle
	camSetFactories({
		"scavFactory1": {
			assembly: "scavAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 7,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			// Infantry, light vehicles, with the occasional bus tank
			templates: [
				cTempl.monhmg, cTempl.kevbloke, cTempl.bjeep, cTempl.kevlance, cTempl.kevbloke, cTempl.kevbloke, cTempl.bjeep,
				cTempl.rbjeep, cTempl.kevlance, cTempl.kevbloke, cTempl.minitruck
			]
		},
		"scavFactory2": {
			assembly: "scavAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 5,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(14)),
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			// Mostly vehicles
			templates: [
				cTempl.firetruck, cTempl.bjeep, cTempl.kevlance, cTempl.buscan, cTempl.minitruck,
				cTempl.sartruck, cTempl.rbjeep, cTempl.bjeep, cTempl.bjeep, cTempl.firetruck
			]
		},
	});
	camEnableFactory("scavFactory1");
	camEnableFactory("scavFactory2");

	// Special chopper that hunts down the player's trucks
	hunterAttack();

	camSkipDialogue();
	camQueueDialogue([
		{text: "CLAYDE: Commander Bravo...", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: ...I'm re-routing the Infested using the Lures.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Hurry up and secure any remaining civilians.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: We can't waste any more time out there.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Drop off civilians at the haven
function eventTransporterLanded(transport)
{
	// Count all Charlie units
	const units = enumDroid(MIS_TEAM_CHARLIE);

	for (const droid of units)
	{
		if (!camIsTransporter(droid))
		{
			camSafeRemoveObject(droid);
		}
	}

	// Add some civilians to the LZ
	const NUM_CIVS = camRand(5) + 6; // 6 to 10 civilians
	const civDroids = [];
	for (let i = 0; i < NUM_CIVS; i++)
	{
		// Spawn civilians
		civDroids.push(camAddDroid(MIS_CIVS, camRandPosIn("landingZone"), cTempl.civ, _("Civilian")));
	}
	// ...and then move them towards the deposit zone
	camManageGroup(camMakeGroup(civDroids), CAM_ORDER_DEFEND, {pos: camMakePos("depositZone")});
}

function eventDestroyed(obj)
{
	if (obj.type === DROID && obj.player === CAM_HUMAN_PLAYER && obj.droidType === DROID_CONSTRUCT)
	{
		const label = getLabel(obj);
		if (!camDef(label))
		{
			return; // Don't care
		}

		if (label === "civTruck1" && !truck1Safe)
		{
			// Transport Truck destroyed before reaching the deposit zone
			trucksLost++;
			playSound(cam_sounds.objective.objectiveDestroyed);
		}
		if (label === "civTruck2" && !truck2Safe)
		{
			trucksLost++;
			playSound(cam_sounds.objective.objectiveDestroyed);
		}
		if (label === "civTruck3" && !truck3Safe)
		{
			trucksLost++;
			playSound(cam_sounds.objective.objectiveDestroyed);
		}
		if (label === "civTruck4" && !truck4Safe)
		{
			trucksLost++;
			playSound(cam_sounds.objective.objectiveDestroyed);
		}

		if (getObject("civTruck1") === null && getObject("civTruck2") === null
		&& getObject("civTruck3") === null && getObject("civTruck4") === null) 
		{
			// If there are no transport trucks active, remove the deposit beacon
			hackRemoveMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
			depositBeaconActive = false;
		}

		// Update the objective message
		camSetExtraObjectiveMessage(
			["Use Trucks to escort civilians back to the haven",
				"Don't lose " + truckLostThreshold + " Transport Trucks (" + trucksLost + " LOST)"]
		);

		checkTrucksLost();
		checkCivsDone();
	}
}

// Check if all civs are accounted for and the mission can move into its final phase
function checkCivsDone()
{
	// Allow the player to move on if:
	// The player has not lost too many Transport Trucks
	// The player has loaded all civilians into Transport Trucks
	// The player does not currently have any Transport Trucks
	if (trucksLost < truckLostThreshold 
		&& civsLoaded[1] && civsLoaded[2] && civsLoaded[3] && civsLoaded[4]
		&& getObject("civTruck1") === null && getObject("civTruck2") === null
		&& getObject("civTruck3") === null && getObject("civTruck4") === null)
	{
		playSound(cam_sounds.objective.primObjectiveCompleted);

		if (!tweakOptions.rec_timerlessMode)
		{
			setMissionTime(camMinutesToSeconds(5));
		}

		// Tell the player to hunker down in the haven
		camQueueDialogue([
			{text: "CHARLIE: General Clayde, Bravo has escorted as many civilians as they can.", delay: 6, sound: CAM_RCLICK},
			{text: "CLAYDE: Well done, Commander Bravo.", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: Now, take all of your forces, and fall back to the safe haven as soon as possible.", delay: 4, sound: CAM_RCLICK},
			{text: "CHARLIE: You heard the man, Bravo.", delay: 8, sound: CAM_RCLICK},
			{text: "CHARLIE: Bring your guys back home!", delay: 2, sound: CAM_RCLICK},
		]);

		setTimer("checkHaven", camSecondsToMilliseconds(2));
		removeTimer("sendCharlieTransport");

		// Re-place a beacon in Charlie's safe haven
		hackAddMessage("SAFE_HAVEN", PROX_MSG, CAM_HUMAN_PLAYER);
		camSetExtraObjectiveMessage(_("Move all units into the haven"));
	}
}

// Check if all the player's units are within the safe haven
function checkHaven()
{
	const safeDroids = enumArea("safeZone", CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID
	));
	const allDroids = enumArea(0, 0, mapWidth, mapHeight, CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID
	));

	if (safeDroids.length === allDroids.length)
	{
		// All of the player's units are in the haven!
		removeTimer("checkHaven");
		if (infestedActive)
		{
			removeTimer("sendInfestedReinforcements");
			infestedActive = false;
		}

		// Shrink the map boundaries again
		setScrollLimits(39, 42, 78, 63);

		// Dialogue...
		camSkipDialogue(); // Stop any previous conversations
		camQueueDialogue([
			{text: "CHARLIE: General, Bravo has regrouped at the haven.", delay: 2, sound: CAM_RCLICK},
			{text: "CHARLIE: What are our-", delay: 3, sound: CAM_RCLICK},
			{delay: 1, callback: "nukeMap"},
		]);

		camSetExtraObjectiveMessage();
		setMissionTime(-1);

		hackRemoveMessage("SAFE_HAVEN", PROX_MSG, CAM_HUMAN_PLAYER);
	}
}

// Blow up everything on the map that's not in the safe haven
function nukeMap()
{
	// Remove the enemy bases.
	camSetEnemyBases({});
	const nukedObjs = enumArea(0, 0, mapWidth, mapHeight, ALL_PLAYERS, false);
	const safeObjs = enumArea("safeZone", ALL_PLAYERS, false).filter((obj) => (!(obj.type === DROID && isVTOL(obj))));

	// Blow up everything outside of the safe haven
	for (let i = 0, len = nukedObjs.length; i < len; ++i)
	{
		let nukeIt = true;
		const obj1 = nukedObjs[i];

		// Check if it's in the safe area.
		for (let j = 0, len2 = safeObjs.length; j < len2; ++j)
		{
			const obj2 = safeObjs[j];

			if (obj1.id === obj2.id)
			{
				nukeIt = false;
				break;
			}
		}

		if (nukeIt && obj1 !== null && obj1.id !== 0)
		{
			// Kaboom!
			camSafeRemoveObject(obj1, true);
		}
	}

	// Make a big explosion south of the haven
	fireWeaponAtLoc("LargeExplosion", 54, 62, CAM_HUMAN_PLAYER);

	// Make the world go red
	camSetSunPos(0, -0.2, 0.3);
	camSetSunIntensity(0.7, 0.5, 0.5, 1.4, 0.6, 0.6);
	camSetFog(140, 100, 100);
	camSetWeather(CAM_WEATHER_CLEAR);

	// Don't keep this debuff around for later missions
	camCompleteRequiredResearch(["R-Script-InfSensor-Debuff-Undo"], CAM_INFESTED);

	// End-mission dialogue
	camQueueDialogue([
		{text: "CHARLIE: WOAH!", delay: 1, sound: CAM_RCLICK},
		{text: "CLAYDE: And THAT....", delay: 5, sound: CAM_RCLICK},
		{text: "CLAYDE: Means we're done here.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: And what about Commander Alpha?", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Team Alpha is dead.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: The Infested have been eradicated.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: There's nothing left here but smoldering ruins.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: If it's all gone...", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: Then what was the point in all of this?", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: ...We may have have been set back today.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: But.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: This operation was not in vain.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Before those traitors in Team Alpha were atomized...", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: We were able to pull all the data from the NASDA site that they had set up around.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: And I believe we may have found something even more", delay: 3, sound: CAM_RCLICK},
		{text: "important than any warhead or secret weapon.", delay: 0},
		{text: "CLAYDE: ...Commanders Bravo and Charlie, make preparations for transport by the end of the day.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Our next operation is about to begin...", delay: 4, sound: CAM_RCLICK},
		{delay: 3, callback: "camEndMission"}, // End the mission after the dialogue is finished
	]);

	// Used to allow the player to bring prologue units into A1L1
	camCompleteRequiredResearch(["R-Script-ProloguePlayed"], CAM_HUMAN_PLAYER);
	setReticuleFlash(2, false);
}

function checkTrucksLost()
{
	if (trucksLost < truckLostThreshold)
	{
		return undefined;
	}
	else
	{
		// Player has lost too many Transport Trucks
		return false;
	}
}

// Returns false if the player if the player has no units, true otherwise
// Used until the player gains access to Charlie's base
function playerReallyAlive()
{
	return enumDroid(DROID_ANY, CAM_HUMAN_PLAYER).length > 0;
}

function strikeTargets()
{
	return enumStruct(CAM_HUMAN_PLAYER).concat(enumDroid(CAM_HUMAN_PLAYER));
}

function truckTargets()
{
	return enumDroid(CAM_HUMAN_PLAYER, DROID_CONSTRUCT).filter((droid) => (droid.propulsion !== "CyborgLegs"));
}

function eventStartLevel()
{
	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(MIS_CYAN_SCAVS, (PLAYER_COLOR !== 7) ? 7 : 12); // Scavs to cyan or neon green
	// All other factions should retain their color from the previous mission

	// The player only loses if they run out of units
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "A1L1", {
		showArtifacts: false,
		defeatOnDeath: false, // Player doesn't have any trucks or factories for the first section
		callback: "playerReallyAlive"
	});
	camSetExtraObjectiveMessage(_("Regroup with Team Charlie"));

	// Set alliances
	setAlliance(MIS_CIVS, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CIVS, MIS_TEAM_CHARLIE, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_CHARLIE, true);

	const startpos = getObject("playerEntry");
	centreView(startpos.x, startpos.y);

	// Place the droids from the previous mission
	setNoGoArea(startpos.x, startpos.y, startpos.x2, startpos.y2, ALL_PLAYERS);

	camCompleteRequiredResearch(mis_infestedRes, CAM_INFESTED);
	camCompleteRequiredResearch(mis_scavResearch, MIS_CYAN_SCAVS);
	camCompleteRequiredResearch(camRec2StartResearch, MIS_CIVS);
	camCompleteRequiredResearch(camRec2StartResearch, MIS_TEAM_CHARLIE);

	// Make the Infested groups easier to bypass by nerfing their vision range
	camCompleteRequiredResearch(["R-Script-InfSensor-Debuff"], CAM_INFESTED);

	// Set up bases
	camSetEnemyBases({
		"eastScavBase": {
			cleanup: "scavBase1",
			detectMsg: "SCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"oilOutpost": {
			cleanup: "scavBase2",
			detectMsg: "SCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"westScavBase": {
			cleanup: "scavBase3",
			detectMsg: "SCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
	});

	// Set up factories
	camSetFactories({
		"scavFactory1": {
			assembly: "scavAssembly1",
			order: CAM_ORDER_STRIKE,
			groupSize: 7,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			data: {
				callback: "strikeTargets", // Focus only on the player
				altOrder: CAM_ORDER_ATTACK,
			},
			// Infantry, light vehicles, with the occasional bus tank
			templates: [
				cTempl.monhmg, cTempl.kevbloke, cTempl.bjeep, cTempl.kevlance, cTempl.kevbloke, cTempl.kevbloke, cTempl.bjeep,
				cTempl.rbjeep, cTempl.kevlance, cTempl.kevbloke, cTempl.minitruck
			]
		},
		"scavFactory2": {
			assembly: "scavAssembly2",
			order: CAM_ORDER_STRIKE,
			groupSize: 5,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			data: {
				callback: "strikeTargets",
				altOrder: CAM_ORDER_ATTACK,
			},
			// Mostly vehicles
			templates: [
				cTempl.firetruck, cTempl.bjeep, cTempl.kevlance, cTempl.buscan, cTempl.minitruck,
				cTempl.sartruck, cTempl.rbjeep, cTempl.bjeep, cTempl.bjeep, cTempl.firetruck
			]
		},
	});

	camSetArtifacts({
		"scavFactory1": { tech: "R-Wpn-Rocket-LtA-TMk1" }, // Sarissa
		"scavFactory2": { tech: "R-Wpn-Rocket02-MRL" }, // Mini-Rocket Array
	});

	// Place a beacon in Charlie's safe haven
	hackAddMessage("SAFE_HAVEN", PROX_MSG, CAM_HUMAN_PLAYER);

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);
	// Increase the lighting, and give it a SLIGHT pink/purple hue
	camSetSunIntensity(.6,.58,.6);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);

	// All Infested start out partially damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	setMissionTime(-1);

	sensorFound = false;
	infestedActive = false;
	depositBeaconActive = false;
	truck1Safe = false;
	truck2Safe = false;
	truck3Safe = false;
	truck4Safe = false;
	trucksLost = 0;
	civGroups = [
		null,
		camNewGroup(), // #1
		camNewGroup(), // #2
		camNewGroup(), // #3
		camNewGroup()  // #4
	];
	civsLoaded = [
		null,
		false, // #1
		false, // #2
		false, // #3
		false  // #4
	];
	infestedThreatFactor = 5;
	infestedThreatFactorMin = 5;
	truckLostThreshold = (difficulty >= MEDIUM) ? 2 : 3;
	infestedAggroCombo = 0;

	// Populate the civilian holdouts
	const civ1Templates = [
		cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
		cTempl.bjeep,
	];
	const civ2Templates = [
		cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
		cTempl.bjeep, cTempl.bjeep,
		cTempl.buscan,
	];
	const civ3Templates = [
		cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
		cTempl.buggy, cTempl.buggy, cTempl.trike,
		cTempl.firetruck,
	];
	const civ4Templates = [
		cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
		cTempl.bjeep, cTempl.bjeep, cTempl.bjeep,
		cTempl.moncan,
	];

	// These lists "start" at index 1
	const templateLists = [null, civ1Templates, civ2Templates, civ3Templates, civ4Templates];
	const civZones = [null, "civZone1", "civZone2", "civZone3", "civZone4"];
	for (let i = 1; i <= 4; i++)
	{
		const templates = templateLists[i];
		const zone = getObject(civZones[i]);

		for (const template of templates)
		{
			// Make some clean-looking names for the spawned units
			// ("Weapon Body Propulsion" doesn't look very good for scavenger units)
			let droidName = "";
			switch (template.body)
			{
				case "CivilianBody": 
					droidName = _("Civilian");
					break;
				case "B2JeepBody": 
					droidName = _("Jeep");
					break;
				case "B4body-sml-trike01": 
					droidName = _("Trike");
					break;
				case "B3body-sml-buggy01": 
					droidName = _("Buggy");
					break;
				case "BusBody": 
					droidName = _("School Bus");
					break;
				case "FireBody": 
					droidName = _("Fire Truck");
					break;
				case "MonsterBus": 
					droidName = _("Big Bertha");
					break;
			}

			const newDroid = camAddDroid(MIS_CIVS, camRandPosIn(zone), template, droidName);
			groupAdd(civGroups[i], newDroid);
		}
	}

	// Shrink the map temporarily
	setScrollLimits(42, 40, 96, 64);

	// HACK: Remove any player structures that are on the map
	for (const struct of enumStruct(CAM_HUMAN_PLAYER))
	{
		camSafeRemoveObject(struct);
	}

	camAutoReplaceObjectLabel("heliTower");

	// Give player briefing.
	camPlayVideos({video: "P2_BRIEF", type: MISS_MSG});
}
