include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage05", "R-Wpn-Rocket-Damage06", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage05", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals04", "R-Struc-Materials04", 
	"R-Defense-WallUpgrade04", "R-Sys-Engineering02", "R-Cyborg-Metals04",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine05", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade02", "R-Wpn-Mortar-Acc01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials04", 
	"R-Defense-WallUpgrade04", "R-Cyborg-Metals03", "R-Wpn-AAGun-ROF01", 
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03",
];

const MIS_RESEARCH_FACILITY = 1;

var playerHasArtifact; // True when the player has collected the artifact (and can escape)
var enemyStoleArtifact; // True when the Collective have successfully escaped with the artifact
var artiGroupActive; // True when the Collective artifact group can start moving

var colTruckJob; // Maintains the Collective's LZ
var colArtiGroup; // Tries to escape with the artifact
var colPatrolGroup; // Defends the Collective LZ

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_INFESTED);
});

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, ["heliAttackPos1", "heliAttackPos2"], "heliRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(1.25)), undefined, ext);
}

function sendInfestedReinforcements()
{	
	const coreDroids = [
		[ // Scavs & crawlers
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, // Boom Ticks
			cTempl.infmoncan, cTempl.infmoncan, // Bus Tanks
			cTempl.infmonhmg,
			cTempl.infmonmrl,
			cTempl.infflatmrl, // Flatbeds
			cTempl.infflatat,
			cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.inffiretruck, // Fire Trucks
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		],
		[ // Light tanks & cyborgs + some scav stuff
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcybmr, // Mini-Rocket Cyborgs
			cTempl.infcolpodt, // MRPs
			cTempl.infcolhmght, // HMGs
			cTempl.infcolcanht, // Light Cannons
			cTempl.infcommcant, // Medium Cannons
			cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, cTempl.inftrike, cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		].concat((difficulty >= MEDIUM) ? cTempl.infcomatt : []), // Add a Lancer tank
		[ // Bashers, Stingers, and Infantry
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		],
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;
	let bChance = 0;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	// South west entrance
	if (getObject("infFactory1") !== null)
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry1"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);
	}

	// South east entrance
	if (getObject("infFactory3") !== null)
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry2"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);
	}

	// North east entrance
	if (getObject("infFactory8") !== null)
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);
	}
	
	// North west entrance
	// (Only spawns units if the nearby Collective structures are cleared)
	const BLOCKADE_STRUCTURES = enumArea("blockadeStructs", CAM_THE_COLLECTIVE, false).filter((obj) => (obj.type === STRUCTURE)).length;
	if (!BLOCKADE_STRUCTURES)
	{
		camSendReinforcement(CAM_INFESTED, getObject("infEntry4"), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND);
	}
}

// Enable the Infested factories and start sending helicopters
function activateInfested()
{
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("infFactory3");
	camEnableFactory("infFactory4");
	camEnableFactory("infFactory5");
	camEnableFactory("infFactory6");
	camEnableFactory("infFactory7");
	camEnableFactory("infFactory8");
	heliAttack();
}

function enemyBaseDetected_colLZBase()
{
	camCallOnce("detectCollective");
}

function enemyBaseDetected_colLZBase()
{
	camCallOnce("detectCollective");
}

function detectCollective()
{
	camDetectEnemyBase("colLZBase");
	artiGroupActive = true;
	if (!playerHasArtifact)
	{
		camSetExtraObjectiveMessage(_("Do not allow the Collective to escape with the artifact"));
	}

	// Transmission about the Collective
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "A3L5_COLLECTIVE", type: MISS_MSG}]);
}

function eventAttacked(victim, attacker)
{
	if (victim.player === CAM_THE_COLLECTIVE && attacker.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("detectCollective");
	}
}

function eventDestroyed(obj)
{
	if (obj.player === MIS_RESEARCH_FACILITY)
	{
		camCallOnce("removeResearchBeacon");
	}
}

function removeResearchBeacon()
{
	hackRemoveMessage("RESEARCH_FACILITY", PROX_MSG, CAM_HUMAN_PLAYER);
}

// Handles order logic for the Collective's artifact group
// Also picks up the artifact if the Collective group is close enough
function manageArtifactGroup()
{
	// The Collective artifact group has different orders depending on the state of the mission...
	// If the player hasn't detected the Collective or the research base yet, defend the start position.
	// If the research facility is still standing (and the artifact hasn't dropped), attack towards it.
	// If the artifact is dropped on the ground, move towards it.
	// If the player has the artifact, attack the player.
	// If the Collective have the artifact, also attack the player (to cover the artifact holder's escape).
	// If a Collective unit is holding the artifact, break it from the rest of the group and run to the LZ.

	if (!artiGroupActive)
	{
		return; // Group is defending by default
	}

	if (playerHasArtifact || getObject("colArtiHolder") !== null)
	{
		// Attack the player
		camManageGroup(colArtiGroup, CAM_ORDER_ATTACK, {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 25,
			removable: false
		});

		if (playerHasArtifact)
		{
			// Player can't drop the artifact; no need to keep checking anymore
			removeTimer("manageArtifactGroup");
		}
		return;
	}

	const artifacts = enumFeature(ALL_PLAYERS, "Crate");

	if (getObject("infResearch") !== null)
	{
		// If the research facility exists, attack it
		camManageGroup(colArtiGroup, CAM_ORDER_ATTACK, {
			targetPlayer: MIS_RESEARCH_FACILITY,
			pos: camMakePos("infResearch"),
			removable: false
		});

		return;
	}
	else if (artifacts.length > 0) // Artifact dropped
	{
		const realCrate = artifacts[0];
		const artiLoc = camMakePos(realCrate);

		// Move towards the artifact crate
		camManageGroup(colArtiGroup, CAM_ORDER_DEFEND, {
			pos: camMakePos(realCrate),
			radius: 0,
			removable: false
		});

		// Also check if we're close enough to pick it up...
		const GRAB_RADIUS = 2;

		//Find the one closest to the artifact so that one can "hold" it
		let closestDroid;
		let closestDist = Infinity;

		for (const droid of enumGroup(colArtiGroup))
		{
			const DR_DIST = camDist(droid, artiLoc);
			if (DR_DIST < closestDist)
			{
				closestDroid = droid;
				closestDist = DR_DIST;
			}
		}

		// Now take it if close enough
		if (closestDist < GRAB_RADIUS)
		{
			// Clear older artifacts if found.
			camDeleteArtifact("infResearch", false); 
			camDeleteArtifact("colArtiHolder", false);

			// Place the artifact in the nearest droid
			addLabel(closestDroid, "colArtiHolder");
			camAddArtifact({"colArtiHolder": { tech: "R-Wpn-Rocket08-Ballista" }}); // Ballista

			camSafeRemoveObject(realCrate);

			// Remove the artifact holder from the main group
			// Tell it to return to the LZ instead
			camManageGroup(camMakeGroup("colArtiHolder"), CAM_ORDER_DEFEND, {pos: camMakePos("landingZoneCollective")});

			camCallOnce("collectiveArtifactDialogue");
		}
		else
		{
			return;
		}
	}
}

// Put a red dot on the minimap over the artifact holder's current position
function trackArtiHolder()
{
	const artiHolder = getObject("colArtiHolder");
	if (artiHolder !== null && !enemyStoleArtifact)
	{
		playSound(cam_sounds.tracker, artiHolder.x, artiHolder.y, artiHolder.z);
	}
}

// Alert the player that the Collective is trying to steal the artifact
// Called the first time a Collective unit picks up the artifact
function collectiveArtifactDialogue()
{
	camQueueDialogue([
		{text: "CLAYDE: Commander Bravo, the Collective has taken an artifact from the research facility.", delay: 0, sound: CAM_RCLICK},
		{text: "CLAYDE: Do not let them bring it to their landing zone.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Destroy that unit before it can escape!", delay: 3, sound: CAM_RCLICK},
	]);
}

function sendCollectiveTransporter()
{
	camCallOnce("detectCollective");
	// First, check if the LZ is still alive
	if (camBaseIsEliminated("colLZBase"))
	{
		// Try again next time...
		return;
	}

	// Make a list of droids to bring in in order of importance
	// Truck -> Patrol -> Artifact
	let droidQueue = [];

	if (!camDef(camGetTruck(colTruckJob))) droidQueue.push(cTempl.comtruckt);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([colPatrolGroup, colArtiGroup]));

	// Next, add grab some droids for the transport
	const TRANSPORT_SIZE = ((difficulty <= MEDIUM) ? 8 : 10);
	const droids = [];
	// Push droids from the queue into the transporter
	for (let i = 0; i < Math.min(droidQueue.length, TRANSPORT_SIZE); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: {x: 2, y: 2},
				exit: {x: 2, y: 2}
			}
		);
	}
}

// Assign Collective units to their respective groups, and steal the artifact if it is nearby
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_THE_COLLECTIVE)
	{
		// Assign Collective reinforcements
		const transDroids = camGetTransporterDroids(transport.player);
		const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
		const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

		// Assign the truck
		// Check if the LZ truck is missing
		if (!camDef(camGetTruck(colTruckJob)) && camDef(transTrucks[0]))
		{
			// Assign this truck!
			camAssignTruck(transTrucks[0], colTruckJob);
		}

		// Assign other units to their refillable groups
		camAssignToRefillableGroups(transOther, [colPatrolGroup, colArtiGroup]);

		// Check if the artifact holder is nearby
		const artiHolder = getObject("colArtiHolder");
		if (artiHolder !== null && camWithinArea(camMakePos(artiHolder), "colLzStructs"))
		{
			// The Collective has escaped with the artifact!
			camDeleteArtifact("colArtiHolder");
			enemyStoleArtifact = true; // Mission failure imminent
			playSound(cam_sounds.enemyEscaping);
		}
	}
}

function eventPickup(feature, droid)
{
	if (feature.stattype === ARTIFACT && droid.player === CAM_HUMAN_PLAYER)
	{
		playerHasArtifact = true;
		camSetExtraObjectiveMessage();
	}
}

// Returns true if the player has or can still get the artifact
function artifactReachable()
{
	if (playerHasArtifact)
	{
		return true; // Player already has the artifact
	}

	let colTransportFound = false;
	enumDroid(CAM_THE_COLLECTIVE).forEach((dr) => {
		if (camIsTransporter(dr))
		{
			colTransportFound = true;
		}
	});

	// Fail if they stole it and the transporter is not on map anymore
	if (enemyStoleArtifact && !colTransportFound)
	{
		return false;
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A3L6", {
		message: "RET_LZ",
		reinforcements: camMinutesToSeconds(1.5),
		retlz: true,
		area: "compromiseZone",
		callback: "artifactReachable",
		enableLastAttack: false
	});

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(62, 74, CAM_HUMAN_PLAYER);
	setTransporterExit(62, 74, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	setAlliance(MIS_RESEARCH_FACILITY, CAM_INFESTED, true);
	changePlayerColour(MIS_RESEARCH_FACILITY, 10); // Change the research facility to white

	camSetArtifacts({
		"infResearch": { tech: "R-Wpn-Rocket08-Ballista" }, // Ballista
	});

	camSetEnemyBases({
		"colLZBase": {
			cleanup: "colLzStructs",
			detectMsg: "COL_LZBASE",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"infestedSouthBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedTrenchRidgeBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedOverlookBase": {
			cleanup: "infBase3",
			detectMsg: "INF_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedMainBase": {
			cleanup: "infBase4",
			detectMsg: "INF_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedNorthEastBase": {
			cleanup: "infBase5",
			detectMsg: "INF_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
	});

	camSetFactories({
		"infFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Light scav vehicles + infantry
			templates: [cTempl.infkevbloke, cTempl.infbjeep, cTempl.infbloke, cTempl.infciv, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbuscan]
		},
		"infFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Misc. scav vehicles
			templates: [cTempl.infrbuggy, cTempl.inflance, cTempl.infmoncan, cTempl.infbjeep, cTempl.infminitruck, cTempl.infbloke]
		},
		"infFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(14)),
			// Light Infested vehicles
			templates: [cTempl.infgbjeep, cTempl.inftrike, cTempl.infbjeep, cTempl.infgbjeep, cTempl.infkevbloke, cTempl.infrbjeep]
		},
		"infFactory4": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Misc. scav vehicles
			templates: [cTempl.infbuscan, cTempl.infgbjeep, cTempl.infkevbloke, cTempl.infmonsar, cTempl.inffiretruck, cTempl.inftrike]
		},
		"infFactory5": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Jeeps + infantry
			templates: [cTempl.infkevbloke, cTempl.infrbjeep, cTempl.infkevlance, cTempl.infgbjeep, cTempl.infkevbloke, cTempl.infbjeep]
		},
		"infFactory6": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(14)),
			// Misc. scav vehicles
			templates: [cTempl.inffiretruck, cTempl.infgbjeep, cTempl.infkevbloke, cTempl.infbuscan, cTempl.infminitruck]
		},
		"infFactory7": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(26)),
			// Heavy scav vehicles
			templates: [cTempl.infmoncan, cTempl.infflatmrl, cTempl.infmonhmg, cTempl.infbuscan, cTempl.infmonmrl, cTempl.infminitruck, cTempl.infciv, cTempl.infbjeep]
		},
		"infFactory8": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			// Evil vehicles
			templates: [cTempl.inffiretruck, cTempl.infmonlan, cTempl.inftrike, cTempl.infbuscan, cTempl.infflatat, cTempl.infgbjeep, cTempl.infminitruck]
		},
	});

	hackAddMessage("RESEARCH_FACILITY", PROX_MSG, CAM_HUMAN_PLAYER);

	playerHasArtifact = false;
	enemyStoleArtifact = false;
	artiGroupActive = false;

	// Manage Collective groups...
	colArtiGroup = camMakeRefillableGroup(
		camMakeGroup("colArtiGroup"), {
			templates: [
				cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
				cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
				cTempl.cominft, cTempl.cominft, cTempl.cominft, // 3 Infernos
				cTempl.comhatt, cTempl.comhatt, // 2 Tank Killers
				cTempl.comagt, cTempl.comagt, cTempl.comagt, // 3 Assault Guns
				cTempl.comrept, // 1 Repair Turret
				cTempl.cybth, cTempl.cybth, cTempl.cybth, // 3 Thermite Flamers
				cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, // 3 Super HRAs
			]
		}, CAM_ORDER_DEFEND, { // Wait for further orders...
			pos: camMakePos("colArtiGroup")
	});
	colPatrolGroup = camMakeRefillableGroup(
		camMakeGroup("colPatrolGroup"), {
			templates: [
				cTempl.cohraat, // 1 Whirlwind
				cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamer Cyborgs
				cTempl.scytk, cTempl.scytk, // 2 Super Tank Killer Cyborgs
				cTempl.scyhr, cTempl.scyhr, // 2 Super Heavy Rocket Cyborgs
			]
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos1"),
				camMakePos("patrolPos2"),
			],
			interval: camSecondsToMilliseconds(42),
			repair: 75
	});

	colTruckJob = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZBase",
			rebuildBase: true,
			structset: camAreaToStructSet("colLzStructs"),
			truckDroid: getObject("colTruck")
	});

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);
	// Pre-damage the facility too...
	camSetPreDamageModifier(MIS_RESEARCH_FACILITY, [60, 90]);

	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3.25)));
	queue("activateInfested", camChangeOnDiff(camSecondsToMilliseconds(30)));
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(45)));
	setTimer("manageArtifactGroup", camSecondsToMilliseconds(1));
	setTimer("trackArtiHolder", camSecondsToMilliseconds(3));

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
}