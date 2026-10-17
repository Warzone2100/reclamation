include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const MIS_NASDA = 1;
const MIS_NASDA_POWER = 3;
const MIS_CLAYDE = 5;
const MIS_TEAM_DELTA = 7;

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage01", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-ROF01", "R-Vehicle-Metals01", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade01", "R-Wpn-Flamer-Damage03", "R-Sys-Engineering01",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy01",
];

var phaseTwo;
var phaseTwoTime;
var deltaTruckJob;
var colTruckJob1;
var colTruckJob2;
var colTruckJob3;
var nasdaCentralStructSet;
var waveIndex;
var powerDestroyed;
var structsDonated;
// Refillable Groups...
var deltaPatrolGroup;
var deltaMortarGroup;
var deltaVtolGroup;
var zuluPatrolGroup;
var zuluNorthPatrolGroup;
var zuluVtolGroupNW;
var zuluVtolGroupNE;
var zuluVtolGroupSouth;

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function heliAttack()
{
	// Attack anything
	const templates = [cTempl.helcan, cTempl.helhmg, cTempl.helpod];
	const ext = {
		limit: [1, 1, 1],
		alternate: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, undefined, "vtolRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(50)), undefined, ext);
}

// Real VTOLs !!! (scary)
function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);

	// Send a one-time bomber squadron from the northeast
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos1", "vtolRemoveZone", [cTempl.colbombv], undefined, // These VTOLs don't come back
		undefined, {limit: 2}
	);

	// Focus towards NASDA Central
	const templates = [cTempl.colatv, cTempl.colhmgv]; // Lancers and HMGs
	const ext = {
		limit: [2, 3],
		alternate: true,
		targetPlayer: MIS_CLAYDE,
		pos: camMakePos("landingZoneZulu")
	};
	camSetVtolData(CAM_THE_COLLECTIVE, ["vtolAttackPos2", "vtolAttackPos3"], "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(1.5)), undefined, ext);

	// Dialogue about VTOLs
	camQueueDialogue([
		{text: "LIEUTENANT: General! Sir!", delay: 0, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Enemy air units closing in fast!", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Hold your positions!", delay: 8, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But sir, we don't have enough firepower to deal with those VTOLs!", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I said HOLD!", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: NASDA Central is NOT for the taking.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commanders Charlie, Golf, Echo. Bring your forces to NASDA Central ASAP.", delay: 8, sound: CAM_RCLICK},
		{text: "CLAYDE: We cannot lose this site so easily!", delay: 3, sound: CAM_RCLICK},
	]);
}

// Send Collective-scavengers at team Delta while the transport flies over
function introAttack()
{
	camManageGroup(camMakeGroup("introAttackGroup"), CAM_ORDER_ATTACK, {
		targetPlayer: MIS_TEAM_DELTA
	});
}

// Remove and damage defenses around NASDA Central
// Clayde's trucks will rebuild and repair them over time.
function weakenZuluDefenses()
{
	const structs = enumArea("claydeStructSetArea", MIS_CLAYDE, false).filter((obj) => (obj.type === STRUCTURE));
	for (const structure of structs)
	{
		if (structure.name === "Heavy Machinegun Guard Tower" || structure.name === "Tank Traps"
			|| structure.name === "Sarissa Guard Tower" || structure.name === "Mini-Rocket Battery")
		{
			camSafeRemoveObject(structure);
		}
		else
		{
			setHealth(structure, 80 + camRand(10));
		}
	}
}

function sendDeltaTransporter()
{
	// Make a list of droids to bring in in order of importance
	// Truck -> Mortar -> VTOL -> Patrol
	let droidQueue = [];

	if (!camDef(camGetTruck(deltaTruckJob))) droidQueue.push(cTempl.plltruckht);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([deltaMortarGroup, deltaVtolGroup, deltaPatrolGroup]));

	const droids = [];
	// Get (up to) the first 10 units in the queue
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_DELTA, camMakePos("landingZoneDelta"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camMakePos("transportEntryPosDelta"),
				exit: camMakePos("transportEntryPosDelta")
			}
		);
	}
}

// Land extra Collective tanks at a random built LZ
function sendCollectiveTransporter()
{
	// Set reinforcement droids
	const droids = [
		cTempl.colpodt, cTempl.colpodt,
		cTempl.colcanht, cTempl.colcanht,
		cTempl.colhmght, cTempl.colhmght,
	];
	// Add Medium Cannon(s) on Normal+
	if (difficulty >= MEDIUM && difficulty !== INSANE) droids.push(cTempl.colmcant); // Leopard
	if (difficulty === INSANE) droids.push(cTempl.commcant); // Panther

	// Get all available LZs
	const lzPool = [];
	if (!camBaseIsEliminated("colLZ1")) lzPool.push(camMakePos("collectiveLZ1"));
	if (!camBaseIsEliminated("colLZ2")) lzPool.push(camMakePos("collectiveLZ2"));
	if (!camBaseIsEliminated("colLZ3")) lzPool.push(camMakePos("collectiveLZ3"));

	// If we have a valid LZ, send the transport
	if (lzPool.length > 0)
	{
		camSendReinforcement(CAM_THE_COLLECTIVE, camRandFrom(lzPool), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camGenerateRandomMapEdgeCoordinate(),
				exit: camGenerateRandomMapEdgeCoordinate(),
				order: CAM_ORDER_ATTACK,
				data: {targetPlayer: CAM_HUMAN_PLAYER}
			}
		);
	}
}

// Send transports to evacuate allied units
function sendEvacTransporter()
{
	if (enumArea("deltaEvacZone", MIS_TEAM_DELTA, false).filter((obj) => (obj.type === DROID)).length > 0)
	{
		camSendReinforcement(MIS_TEAM_DELTA, camMakePos("landingZoneDelta"), [cTempl.truck],
			CAM_REINFORCE_TRANSPORT, {
				entry: camMakePos("transportEntryPosDelta"),
				exit: camMakePos("transportEntryPosDelta")
			}
		);
	}
	if (enumArea("zuluEvacZone", MIS_CLAYDE, false).filter((obj) => (obj.type === DROID)).length > 0)
	{
		camSendReinforcement(MIS_CLAYDE, camMakePos("landingZoneZulu"), [cTempl.truck],
			CAM_REINFORCE_TRANSPORT, {
				entry: camMakePos("transportEntryPosZulu"),
				exit: camMakePos("transportEntryPosZulu")
			}
		);
	}
}

function eventTransporterLanded(transport)
{
	if (!structsDonated && transport.player === CAM_HUMAN_PLAYER)
	{
		// Donate some defenses to the player, and also assign some engineers
		const structs = enumArea("donateArea", MIS_CLAYDE, false).filter((obj) => (obj.type === STRUCTURE));
		for (const structure of structs)
		{
			donateObject(structure, CAM_HUMAN_PLAYER);
		}

		camManageTrucks(
			MIS_CLAYDE, {
				label: "nasdaCentral",
				rebuildBase: true,
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(40), true),
				truckDroid: getObject("zuluEngineer1"),
				structset: nasdaCentralStructSet
		});
		camManageTrucks(
			MIS_CLAYDE, {
				label: "nasdaCentral",
				rebuildBase: true,
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(40), true),
				truckDroid: getObject("zuluEngineer2"),
				structset: nasdaCentralStructSet
		});

		structsDonated = true;
	}


	if (!phaseTwo && transport.player === MIS_TEAM_DELTA)
	{
		// Assign Delta reinforcements
		const transDroids = camGetTransporterDroids(transport.player);
		const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
		const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

		// Assign the truck
		// Check if the LZ truck is missing
		if (!camDef(camGetTruck(deltaTruckJob)) && camDef(transTrucks[0]))
		{
			// Assign this truck!
			camAssignTruck(transTrucks[0], deltaTruckJob);
		}

		// Assign other units to their refillable groups
		camAssignToRefillableGroups(transOther, [deltaMortarGroup, deltaVtolGroup, deltaPatrolGroup]);
	}
	else if (phaseTwo)
	{
		if (transport.player === MIS_TEAM_DELTA)
		{
			// Evacuate Delta units
			let evacDroids = enumArea("deltaEvacZone", MIS_TEAM_DELTA, false).filter((obj) => (obj.type === DROID && obj.droidType !== DROID_SUPERTRANSPORTER));
			evacDroids = evacDroids.concat(camGetTransporterDroids(MIS_TEAM_DELTA)); // Include the dummy truck brought by the transporter
			for (const droid of evacDroids)
			{
				camSafeRemoveObject(droid);
			}
		}
		else if (transport.player === MIS_CLAYDE)
		{
			// Evacuate Zulu units
			let evacDroids = enumArea("zuluEvacZone", MIS_CLAYDE, false).filter((obj) => (obj.type === DROID && obj.droidType !== DROID_SUPERTRANSPORTER));
			evacDroids = evacDroids.concat(camGetTransporterDroids(MIS_CLAYDE));
			for (const droid of evacDroids)
			{
				camSafeRemoveObject(droid);
			}
		}
		// Yes, I KNOW that transports are only supposed to hold up to ten units.
	}
}

// Bring in Collective and Collective-affiliated scavengers
// NOTE: The Collective and their scavengers are represented by the same player (CAM_THE_COLLECTIVE)
// The Collective-scavengers will usually be referred to as "C-Scavs".
function collectiveAttackWaves()
{
	waveIndex++;

	/*
		The waves of Collective and C-Scav units will spawn 8 different "entrances" around the edges of the map
		As the level progresses, more entrances will "activate", allowing enemies to spawn from those.
		Each wave, a set number of random entrances will spawn units, with the number of entrances being chosen depending on the difficulty
		> Waves 1+ will activate the northwest ridge
		> Waves 3+ will activate the north city entrance
		> Waves 6+ will activate the northeast valley entrance
		> Waves 10+ will activate the northeast plateau entrance
		> Waves 14+ will activate the east plateau entrance
		> Waves 18+ will activate the northwest crater entrance
		> Waves 22+ will activate the east valley entrance
		NOTE: The south entrance is always active
	*/

	// Each entrance has a unit set composition, mostly of C-Scavs. 
	const nwRidgeDroids = [cTempl.bloke, cTempl.buggy, cTempl.buscan, cTempl.lance, cTempl.rbuggy];

	const northCityDroids = [cTempl.rbjeep, cTempl.bloke, cTempl.bjeep, cTempl.lance];

	const neValleyDroids = [cTempl.firetruck, cTempl.gbjeep, cTempl.lance, cTempl.trike, cTempl.kevbloke, cTempl.kevlance];

	const nePlateauDroids = [cTempl.bjeep, cTempl.minitruck, cTempl.buscan, cTempl.sartruck, cTempl.kevbloke];

	const eastPlateauDroids = [cTempl.gbjeep, cTempl.kevbloke, cTempl.kevlance, cTempl.buggy, cTempl.rbuggy];

	const nwCraterDroids = [cTempl.gbjeep, cTempl.minitruck, cTempl.kevlance, cTempl.bjeep, cTempl.bloke];

	const eastValleyDroids = [cTempl.minitruck, cTempl.gbjeep, cTempl.trike, cTempl.bloke];

	const southDroids = [cTempl.bjeep, cTempl.bloke, cTempl.minitruck, cTempl.buggy];

	// Special scavenger templates
	const scavSpecialDroids = [cTempl.flatmrl, cTempl.flatat, cTempl.moncan, cTempl.monhmg, cTempl.monsar, cTempl.monmrl];

	// Occasionally, entrance templates will be overwritten with these purely Collective units.
	const colOverrideDroids = [
		cTempl.colpodt, cTempl.colpodt, // MRP
		cTempl.colmrat, cTempl.colmrat, // MRA
		cTempl.colhmght, cTempl.colhmght, // HMG
		cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, // Light Cannon
		cTempl.colflamt, cTempl.colflamt, // Flamer
	];
	if (!phaseTwo && waveIndex >= 10) colOverrideDroids.push(cTempl.colmcant); // Add chance for Medium Cannon (Leopard)
	if (phaseTwo && difficulty >= HARD) colOverrideDroids.push(cTempl.commcant); // Add chance for Medium Cannon (Panther)
	if (phaseTwo && difficulty === INSANE) colOverrideDroids.push(cTempl.comatt); // Add chance for Lancer

	// This block handles activating new entrances
	const waveEntrances = [];
	const waveTemplates = [];
	if (waveIndex >= 1)
	{
		waveEntrances.push("colEntrance1");
		waveTemplates.push(nwRidgeDroids);
	}
	if (waveIndex >= 3)
	{
		waveEntrances.push("colEntrance2");
		waveTemplates.push(northCityDroids);
	}
	if (waveIndex >= 6)
	{
		waveEntrances.push("colEntrance3");
		waveTemplates.push(neValleyDroids);
		camCallOnce("collectiveDialogue");
	}
	if (waveIndex >= 10)
	{
		waveEntrances.push("colEntrance4");
		waveTemplates.push(nePlateauDroids);
	}
	if (waveIndex >= 14)
	{
		waveEntrances.push("colEntrance5");
		waveTemplates.push(eastPlateauDroids);
	}
	if (waveIndex >= 18)
	{
		waveEntrances.push("colEntrance6");
		waveTemplates.push(nwCraterDroids);
	}
	if (waveIndex >= 22)
	{
		waveEntrances.push("colEntrance7");
		waveTemplates.push(eastValleyDroids);
	}

	// Determine the number of separate groups to spawn at once
	let numGroups = 3;
	if (difficulty >= MEDIUM) numGroups++; // 4 on Normal
	if (difficulty >= HARD) numGroups++; // 5 on Hard
	if (difficulty >= INSANE) numGroups++; // 6 on Insane

	// Determine how many groups should be replaced with stronger Collective templates
	let numColOverrides = 0;
	if (waveIndex >= 6 && waveIndex % 3 == 0)
	{
		numColOverrides++;
	}
	if (waveIndex >= 16 && waveIndex % 2 == 0)
	{
		numColOverrides++;
	}
	if (phaseTwo)
	{
		numColOverrides++;
	}

	if (phaseTwo && gameTime < phaseTwoTime + camMinutesToMilliseconds(1.5))
	{
		// Don't spawn Collective override groups for about 1.5 minutes when the player is told to evac
		// This should give the player enough breathing room to destroy the power systems and regroup

		numColOverrides = 0;
	}

	const COLLECTIVE_ACTIVE = numColOverrides > 0;

	// Choose from among the active entrances and spawn units
	// NOTE: The south entrance is always active
	const chosenEntrances = ["colEntrance8"];
	const southTemplates = (numColOverrides > 0) ? ((camRand(2) === 0) ? colOverrideDroids : southDroids) : southDroids;
	const chosenTemplates = [southTemplates];
	for (let i = 0; i < Math.min(waveEntrances.length, numGroups); i++)
	{
		const INDEX = camRand(waveEntrances.length);

		chosenEntrances.push(waveEntrances[INDEX]);
		waveEntrances.splice(INDEX, 1);
		if (numColOverrides > 0)
		{
			chosenTemplates.push(colOverrideDroids);
			numColOverrides--;
		}
		else
		{
			chosenTemplates.push(waveTemplates[INDEX]);
			waveTemplates.splice(INDEX, 1);
		}
	}

	// Spawn units at the chosen entrance(s) with the corresponding templates
	const NUM_DROIDS = 4;
	for (let i = 0; i < chosenEntrances.length; i++)
	{
		const droids = [];
		for (let j = 0; j < NUM_DROIDS; j++)
		{
			const templateList = chosenTemplates[i];
			droids.push(camRandFrom(templateList));
		}
		// Chance of inserting a tough scavenger unit
		if (camRand(6 - difficulty) === 0)
		{
			droids.push(camRandFrom(scavSpecialDroids));
		}
		// Chance of inserting a Hurricane
		if (difficulty >= MEDIUM && COLLECTIVE_ACTIVE && camRand(7 - difficulty) === 0)
		{
			droids.push(cTempl.colaaht);
		}

		camSendReinforcement(CAM_THE_COLLECTIVE, getObject(chosenEntrances[i]), droids, CAM_REINFORCE_GROUND, {
			data: {targetPlayer: MIS_CLAYDE}
		});
	}

	// Lastly, send a truck to attempt building a Collective LZ
	// NOTE: During phase two, trucks are sent every other wave
	if (!camDef(camGetTruck(colTruckJob1)) && waveIndex >= 8 && (waveIndex % 4 == 0 || (phaseTwo && waveIndex % 2 == 0)))
	{
		const tPos = camMakePos("colEntrance5");
		const tTemp = (phaseTwo || difficulty === INSANE) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob1);
	}
	if (!camDef(camGetTruck(colTruckJob2)) && waveIndex >= 16 && (waveIndex % 8 == 0 || (phaseTwo && waveIndex % 2 == 0)))
	{
		const tPos = camMakePos("colEntrance4");
		const tTemp = (phaseTwo || difficulty >= HARD) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob2);
	}
	if (!camDef(camGetTruck(colTruckJob3)) && waveIndex >= 24 && (waveIndex % 6 == 0 || (phaseTwo && waveIndex % 2 == 0)))
	{
		const tPos = camMakePos("colEntrance7");
		const tTemp = (phaseTwo || difficulty >= MEDIUM) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob3);
	}
}

// Dialogue about approaching Collective tanks
function collectiveDialogue()
{
	camQueueDialogue([
		{text: "FOXTROT: General, sir!", delay: 0, sound: CAM_RCLICK},
		{text: "FOXTROT: We're spotting groups of enemy tanks rolling over the hills.", delay: 2, sound: CAM_RCLICK},
		{text: "FOXTROT: They look...", delay: 3, sound: CAM_RCLICK},
		{text: "FOXTROT: ...A lot tougher than scavengers, sir.", delay: 2, sound: CAM_RCLICK},
		// Long delay...
		{text: "LIEUTENANT: General!", delay: 24, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Sir, those are Collective vehicles!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It looks like they're leading these scavenger attacks!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...But how?", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: It doesn't matter.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: If they're here for NASDA Central, then they're not going to get it.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commanders, your previous orders still stand.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: These \"Collective\" units are to be considered hostile, and attacked on sight.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: NASDA Central is to be defended at all costs.", delay: 4, sound: CAM_RCLICK},
	]);
}

function setPhaseTwo()
{
	phaseTwo = true;
	phaseTwoTime = gameTime;

	// Attack waves come faster
	removeTimer("collectiveAttackWaves");
	setTimer("collectiveAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(25)));

	// Disable the mission timer
	setMissionTime(-1);

	// Switch the teams of the NASDA power structures (so the player can destroy them)
	const structs = enumArea("nasdaPowerArea", MIS_NASDA, false).filter((obj) => (obj.type === STRUCTURE));
	for (const structure of structs)
	{
		donateObject(structure, MIS_NASDA_POWER);
	}

	camSetExtraObjectiveMessage(["Destroy NASDA's power systems", "Escape NASDA Central"]);
	hackAddMessage("NASDA_POWER", PROX_MSG, CAM_HUMAN_PLAYER);

	evacuateAllies();
	queue("spawnCollectiveCommander", camSecondsToMilliseconds(40));

	// Tell the player evacuate (and destroy NASDA's power systems)
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "A1L4_EVAC", type: MISS_MSG}]);
}

// Teams Delta and Zulu practice the time-honored strategy known as:
// "Drop Everything and Run for Your Lives"
function evacuateAllies()
{
	// Disable allied truck management
	camDisableTruck("deltaLZ");
	camDisableTruck("nasdaCentral");

	// Place all allied units into two groups
	const deltaDroids = enumDroid(MIS_TEAM_DELTA);
	// We don't actually care about the group, we just don't want the campaign library to order these units around anymore.
	camMakeGroup(deltaDroids);
	const zuluDroids = enumDroid(MIS_CLAYDE);
	camMakeGroup(zuluDroids);

	// Move all units towards their respective LZs
	for (const droid of deltaDroids)
	{
		const lz = camMakePos("landingZoneDelta");
		orderDroidLoc(droid, DORDER_MOVE, lz.x, lz.y);
	}
	for (const droid of zuluDroids)
	{
		const lz = camMakePos("landingZoneZulu");
		orderDroidLoc(droid, DORDER_MOVE, lz.x, lz.y);
	}

	// Replace reinforcements with evac transports.
	removeTimer("sendDeltaTransporter");
	setTimer("sendEvacTransporter", camSecondsToMilliseconds(20));
}

// Spawn a Collective command tank from the southern entrance
function spawnCollectiveCommander()
{
	// Spawn a Collective commander
	const commanderPos = camMakePos("colEntrance8");
	const commanderTemp = cTempl.comcomt;
	const commDroid = camAddDroid(CAM_THE_COLLECTIVE, commanderPos, commanderTemp);
	addLabel(commDroid, "colCommander");
	// Set the commander's rank (ranges from Trained to Professional)
	const COMMANDER_RANK = (difficulty <= EASY) ? 2 : (difficulty);
	camSetDroidRank(commDroid, COMMANDER_RANK);
	// Order the commander to attack
	camManageGroup(camMakeGroup(commDroid), CAM_ORDER_ATTACK, {repair: 25, repairPos: commanderPos});

	// Spawn the commander's escorts
	const commanderTemplates = [ // 2 Repair Turrets, 2 Medium Cannons, 4 Mini-Rocket Arrays, 1 Hurricane, 1 Lancer
		cTempl.colrepht, cTempl.colrepht,
		cTempl.commcant, cTempl.commcant,
		cTempl.colmrat, cTempl.colmrat, cTempl.colmrat, cTempl.colmrat,
		cTempl.colaaht,
		cTempl.comatt,
	];
	const colCommanderGroup = camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntrance8"), commanderTemplates, CAM_REINFORCE_GROUND);
	camManageGroup(colCommanderGroup, CAM_ORDER_FOLLOW, {leader: "colCommander", suborder: CAM_ORDER_ATTACK});
}

function eventDestroyed(obj)
{
	if (obj.player === MIS_NASDA_POWER && obj.type === STRUCTURE && obj.name === "Nuclear Reactor")
	{
		powerDestroyed = true;
		hackRemoveMessage("NASDA_POWER", PROX_MSG, CAM_HUMAN_PLAYER);

		camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A1L5S", {
			message: "RET_LZ",
			area: "compromiseZoneExtended", // Use a bigger area
			retlz: true,
			reinforcements: camMinutesToSeconds(1),
			victoryVideo: {video: "A1L4_ESCAPE", type: CAMP_MSG},
			callback: "canEscape"
		});
	}
}

// Used to prevent Zulu's groups from refilling during the evacuation phase
function allowZuluRefilling()
{
	return !phaseTwo;
}

// Returns true if the player should be allowed to escape (and end the level)
function canEscape()
{
	if (phaseTwo && powerDestroyed) return true;
	return undefined;
}

function eventStartLevel()
{
	const startPos = camMakePos("transportEntryPos");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A1L5S", {
		message: "RET_LZ",
		area: "compromiseZone", // Extended later
		retlz: true,
		reinforcements: camMinutesToSeconds(1),
		victoryVideo: {video: "A1L4_ESCAPE", type: CAMP_MSG},
		callback: "canEscape"
	});
	camSetExtraObjectiveMessage("Defend NASDA Central");
	setMissionTime(camMinutesToSeconds(30)); // This will be overwritten later

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(startPos.x, startPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(startPos.x, startPos.y, CAM_HUMAN_PLAYER);

	// Get the camera to follow the transporter
	// Transporter is the only droid of the player's on the map at this point
	const transporter = enumDroid();
	cameraTrack(transporter[0]);

	// Make sure the scavengers/allies aren't choosing conflicting colors with the player
	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(MIS_NASDA, 10); // NASDA is white in all cases
	changePlayerColour(MIS_NASDA_POWER, 10);
	changePlayerColour(MIS_CLAYDE, (PLAYER_COLOR !== 15) ? 15 : 0); // Clayde to brown or green
	changePlayerColour(MIS_TEAM_DELTA, (PLAYER_COLOR !== 1) ? 1 : 8); // Delta to orange or yellow
	// NOTE: The Collective keep their color from the previous mission

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(camA1L4AllyResearch, MIS_CLAYDE);
	camCompleteRequiredResearch(camA1L4AllyResearch, MIS_TEAM_DELTA);

	// Set alliances...
	setAlliance(MIS_NASDA, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_NASDA, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_NASDA, MIS_CLAYDE, true);
	setAlliance(MIS_NASDA, MIS_TEAM_DELTA, true);
	setAlliance(MIS_NASDA_POWER, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_NASDA_POWER, MIS_CLAYDE, true);
	setAlliance(MIS_NASDA_POWER, MIS_TEAM_DELTA, true);
	setAlliance(MIS_CLAYDE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CLAYDE, MIS_TEAM_DELTA, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_DELTA, true);

	// Grant vision of allied objects
	camSetObjectVision(MIS_TEAM_DELTA);
	camSetObjectVision(MIS_CLAYDE);
	camSetObjectVision(MIS_NASDA);
	camSetObjectVision(MIS_NASDA_POWER);

	camSetEnemyBases({
		// These are mostly here to simplify truck logic
		"nasdaCentral": {
			cleanup: "claydeTruckZone",
			friendly: true,
			player: MIS_CLAYDE
		},
		"deltaLZ": {
			cleanup: "deltaStructSetArea",
			friendly: true,
			player: MIS_TEAM_DELTA
		},
		// These LZs can be built later by enemy trucks:
		"colLZ1": {
			cleanup: "colLZBase1",
			detectMsg: "COL_LZBASE1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colLZ2": {
			cleanup: "colLZBase2",
			detectMsg: "COL_LZBASE2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colLZ3": {
			cleanup: "colLZBase3",
			detectMsg: "COL_LZBASE3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
	});

	// NOTE: These factories serve only to resupply refillable groups and trucks
	// The template lists of these factories are empty!
	camSetFactories({
		"zuluFactory1": {
			assembly: "zuluAssembly",
			order: CAM_ORDER_ATTACK, // The order and group size should go unused
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80), true), // NOTE: These get SLOWER on higher difficulties!
			templates: [ ]
		},
		"zuluFactory2": {
			assembly: "zuluAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80), true),
			templates: [ ]
		},
		"zuluCyborgFactory1": {
			assembly: "zuluAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80), true),
			templates: [ ]
		},
		"zuluCyborgFactory2": {
			assembly: "zuluAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(80), true),
			templates: [ ]
		},
		"zuluVtolFactory": {
			assembly: "zuluVtolAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90), true),
			templates: [ ]
		},
	});

	// Set up refillable groups for the player's allies
	// Also set up allied and Collective trucks

	// Delta patrol group (5 Light Cannons, 3 Mechanics, 4 Grenadiers)
	deltaPatrolGroup = camMakeRefillableGroup(
		camMakeGroup("deltaPatrolGroup"), {
			templates: [
				cTempl.pllcanht, cTempl.pllcanht, cTempl.pllcanht, cTempl.pllcanht, cTempl.pllcanht,
				cTempl.cybrp, cTempl.cybrp, cTempl.cybrp,
				cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, cTempl.cybgr,
		]}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos1"),
				camMakePos("patrolPos2"),
				camMakePos("patrolPos5")
			],
			interval: camSecondsToMilliseconds(28),
			count: 10,
			// morale: 80,
			repair: 50
	});
	// Delta Mortar group
	deltaMortarGroup = camMakeRefillableGroup(
		camMakeGroup("deltaMortarGroup"), {
			templates: [
				cTempl.pllmortw, cTempl.pllmortw, cTempl.pllmortw, cTempl.pllmortw,
			]
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaSensorTower",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("deltaMortarGroup") // Defend this position if the tower is destroyed.
			}
	});
	// Delta VTOL group (3 Light Cannons, 2 HMGs)
	deltaVtolGroup = camMakeRefillableGroup(
		camMakeGroup("deltaVtolGroup"), {
			templates: [
				cTempl.pllcanv, cTempl.pllcanv, cTempl.pllcanv,
				cTempl.pllhmgv, cTempl.pllhmgv,
			]
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaVtolTower",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("zuluVtolAssembly")
			}
	});
	// Delta truck
	deltaTruckJob = camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaLZ",
			structset: camAreaToStructSet("deltaStructSetArea", MIS_TEAM_DELTA),
			truckDroid: getObject("deltaTruck")
	});

	// Zulu central patrol group (4 Heavy Machineguns, 2 Light Cannons, 2 Mechanic Cyborgs, 2 Flamer Cyborgs)
	zuluPatrolGroup = camMakeRefillableGroup(
		camMakeGroup("zuluPatrolGroup"), {
			templates: [
				cTempl.pllhmght, cTempl.pllhmght,
				cTempl.pllcanht,
				cTempl.cybfl,
				cTempl.cybrp, cTempl.cybrp,
				cTempl.pllhmght, cTempl.pllhmght,
				cTempl.pllcanht,
				cTempl.cybfl,
			],
			globalFill: true, // Use all available factories to replenish this group
			callback: "allowZuluRefilling" // Stop refilling during the evac phase
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos3"),
				camMakePos("patrolPos4"),
				camMakePos("patrolPos5")
			],
			interval: camSecondsToMilliseconds(32),
			repair: 50,
	});
	// Zulu northern patrol group (4 Heavy Machineguns, 2 Light Cannons, 2 Mechanic Cyborgs, 2 Flamer Cyborgs)
	zuluNorthPatrolGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.pllhmght, cTempl.pllhmght,
				cTempl.pllcanht,
				cTempl.cybfl,
				cTempl.cybrp, cTempl.cybrp,
				cTempl.pllhmght, cTempl.pllhmght,
				cTempl.pllcanht,
				cTempl.cybfl,
			],
			globalFill: true,
			callback: "allowZuluRefilling"
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos6"),
				camMakePos("patrolPos7"),
				camMakePos("patrolPos8")
			],
			interval: camSecondsToMilliseconds(32),
			repair: 50,
	});
	// Zulu northwest VTOL group (2 Mini-Rockets, 2 Heavy Machineguns)
	zuluVtolGroupNW = camMakeRefillableGroup(
		camMakeGroup("zuluVtolGroup1"), {
			templates: [
				cTempl.pllpodv, cTempl.pllpodv, cTempl.pllhmgv, cTempl.pllhmgv,
			],
			globalFill: true,
			callback: "allowZuluRefilling"
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluVtolTower1",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("zuluVtolAssembly")	
			}
	});
	// Zulu northeast VTOL group (2 Mini-Rockets, 2 Heavy Machineguns)
	zuluVtolGroupNE = camMakeRefillableGroup(
		camMakeGroup("zuluVtolGroup2"), {
			templates: [
				cTempl.pllpodv, cTempl.pllpodv, cTempl.pllhmgv, cTempl.pllhmgv,
			],
			globalFill: true,
			callback: "allowZuluRefilling"
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluVtolTower2",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("zuluVtolAssembly")	
			}
	});
	// Zulu south VTOL group (2 Mini-Rockets)
	zuluVtolGroupSouth = camMakeRefillableGroup(
		camMakeGroup("zuluVtolGroup3"), {
			templates: [
				cTempl.pllpodv, cTempl.pllpodv,
			],
			globalFill: true,
			callback: "allowZuluRefilling"
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluVtolTower3",
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("zuluVtolAssembly")	
			}
	});
	// Trucks
	nasdaCentralStructSet = camAreaToStructSet("claydeStructSetArea", MIS_CLAYDE);
	camManageTrucks(
		MIS_CLAYDE, {
			label: "nasdaCentral",
			rebuildBase: true,
			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70), true),
			truckDroid: getObject("zuluTruck1"),
			structset: nasdaCentralStructSet
	});
	camManageTrucks(
		MIS_CLAYDE, {
			label: "nasdaCentral",
			rebuildBase: true,
			respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70), true),
			truckDroid: getObject("zuluTruck2"),
			structset: nasdaCentralStructSet
	});

	// Collective trucks
	colTruckJob1 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZ1",
			rebuildBase: true,
			structset: camA1L4ColLZ1Structs
	});
	colTruckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZ2",
			rebuildBase: true,
			structset: camA1L4ColLZ2Structs
	});
	colTruckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZ3",
			rebuildBase: true,
			structset: camA1L4ColLZ3Structs
	});

	// Downgrade Collective structures on lower difficulties
	if (difficulty <= EASY)
	{
		// Emplacements instead of bunkers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "PillBox4", "Cannon-Emplacement"); // Cannon Bunkers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "PillBox1", "Cannon-Emplacement"); // HMG Bunkers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "PillBox5", "Flamer-Emplacement"); // Flamer Bunkers
	}
	if (difficulty == SUPEREASY)
	{
		// Un-hardened towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "GuardTower3", "GuardTower1"); // HMG Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "GuardTower6H", "GuardTower6"); // MRP Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower02", "Sys-SensoTower01"); // Sensor Towers
	}

	phaseTwo = false;
	phaseTwoTime = 0;
	waveIndex = 0;
	powerDestroyed = false;
	structsDonated = false;

	// Automatically re-label these structures if they're destroyed and rebuilt
	camAutoReplaceObjectLabel(["deltaSensorTower", "deltaVtolTower", "zuluVtolTower1", "zuluVtolTower2", "zuluVtolTower3"]);

	// Do these immediately
	camEnableFactory("zuluFactory1");
	camEnableFactory("zuluFactory2");
	camEnableFactory("zuluCyborgFactory1");
	camEnableFactory("zuluCyborgFactory2");
	camEnableFactory("zuluVtolFactory");
	heliAttack();
	introAttack();
	weakenZuluDefenses();

	queue("vtolAttack", camMinutesToMilliseconds(20));
	queue("setPhaseTwo", camMinutesToMilliseconds(22));

	setTimer("collectiveAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(40)));
	setTimer("sendDeltaTransporter", camChangeOnDiff(camMinutesToMilliseconds(1.5), true));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(2.25)));

	// Dialogue when arriving
	camQueueDialogue([
		{text: "CLAYDE: Commander Bravo, and not a moment too soon!", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: My engineers have set up an LZ for you outside of NASDA Central.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Teams Foxtrot and Delta have already", delay: 3, sound: CAM_RCLICK},
		{text: "taken up positions to the southwest and southeast.", delay: 0},
		{text: "CLAYDE: Use your forces and defend the northern approach.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: We must hold NASDA Central at all costs!", delay: 3, sound: CAM_RCLICK},
	]);

	// Darken the fog to 1/2 default brightness
	camSetFog(8, 8, 32);
	// Darken the lighting and add a slight blue hue
	camSetSunIntensity(.4, .4, .45);
	camSetWeather(CAM_WEATHER_RAINSTORM);
	camSetSkyType(CAM_SKY_NIGHT);
}