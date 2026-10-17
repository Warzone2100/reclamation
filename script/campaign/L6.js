include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_scavRes = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03",
	"R-Wpn-Mortar-Damage02", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Vehicle-Metals01", "R-Struc-Materials01",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy01",
];
const mis_infestedRes = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Vehicle-Metals01", "R-Struc-Materials01",
];

// Player values
const MIS_CYAN_SCAVS = 2;

// Keep track of how many waves have spawned for the second part of the level
var numWaves;
var wavePhase;

// Keep track of which AA sites have been destroyed
var southAADestroyed;
var nwAADestroyed;
var eastAADestroyed;

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

function camEnemyBaseDetected_infestedHighwayCamp()
{
	// Activate both infested factories and the western scav factory
	camEnableFactory("westInfestedFactory");
	camEnableFactory("westScavFactory");
}

function activateNorthInfested()
{
	// Activate the north infested base
	camEnableFactory("northInfestedFactory");
	setTimer("infestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(35)));

	// Also activate the eastern scav factory
	camEnableFactory("eastScavFactory");

	// Message the player about infested outside of the area
	camQueueDialogue([
		{text: "ASSOCIATE: Commander Alpha be advised; we have detected a", delay: 0, sound: CAM_RCLICK},
		{text: "massive infested presence just outside your area of operation.", delay: 0},
		{text: "ASSOCIATE: It's likely that they will soon descend upon your position.", delay: 4, sound: CAM_RCLICK},
		{text: "ASSOCIATE: Please work quickly.", delay: 3, sound: CAM_RCLICK},
		{text: "ASSOCIATE: Once the infested start moving en masse", delay: 2, sound: CAM_RCLICK},
		{text: "this area will likely be overwhelmed rapidly.", delay: 0},
	]);
}

function infestedReinforcements()
{
	// Stop if the level is in its ending phase
	if (wavePhase)
	{
		removeTimer("infestedReinforcements");
		return;
	}

	// If the player hasn't destroyed an objective/factory yet, only spawn a wave from 1 place at a time
	randValue = undefined;
	if (!southAADestroyed && !eastAADestroyed && !nwAADestroyed
		&& getObject("westInfestedFactory") !== null && getObject("northInfestedFactory") !== null)
	{
		// Generate a random value of 0 or 1
		randValue = camRand(2);
	}

	const CORE_SIZE = 4 + camRand(3); // Maximum of 6 core units.
	const FODDER_SIZE = 14 + camRand(3); // 14 - 16 extra Infested Civilians to the swarm.

	if (getObject("westInfestedFactory") !== null && (!camDef(randValue) || randValue == 0))
	{
		const westDroids = [cTempl.stinger, cTempl.infbuscan, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infbloke];
		camSendReinforcement(CAM_INFESTED, camMakePos("wHighwayEntry"), camRandInfTemplates(westDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}
	if (getObject("northInfestedFactory") !== null && (!camDef(randValue) || randValue == 1))
	{
		const northDroids = [cTempl.stinger, cTempl.boomtick, cTempl.infminitruck, cTempl.inftrike, cTempl.infrbuggy, cTempl.inflance];
		camSendReinforcement(CAM_INFESTED, camMakePos("neRoadEntry"), camRandInfTemplates(northDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}
}

// Triggered when moving north along the road towards the scavenger bases
camAreaEvent("scavAttackTrigger", function(droid)
{
	// Trigger only if it's a player unit
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Enable the remaining scav factories
		camEnableFactory("nwScavFactory1");
		camEnableFactory("nwScavFactory2");

		// Start sending helicopters from the west
		westHeliAttack();

		// Remind the player that the AA sites are the primary target
		camQueueDialogue([
			{text: "ASSOCIATE: Commander Alpha, a reminder to not allow yourself to be distracted from your goal.", delay: 0, sound: CAM_RCLICK},
			{text: "ASSOCIATE: Your primary objective is to neutralize the designated", delay: 5, sound: CAM_RCLICK},
			{text: "anti-aircraft batteries, and then return to base.", delay: 0},
			{text: "ASSOCIATE: This air route must be clear ASAP, Commander.", delay: 5, sound: CAM_RCLICK},
			{text: "ASSOCIATE: We cannot afford to have you waste time out there.", delay: 3, sound: CAM_RCLICK},
		]);
	}
	else
	{
		resetLabel("scavAttackTrigger", CAM_HUMAN_PLAYER);
	}
});

// Helicopter attack waves from the northwestern side of the map
function westHeliAttack()
{
	const list = [cTempl.helhmg, cTempl.helcan];
	const ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0,
		targetPlayer: CAM_HUMAN_PLAYER
	};

	// The helicopter attacks stop when the northwest VTOL radar tower is destroyed.
	camSetVtolData(MIS_CYAN_SCAVS, "nwHeliSpawn", "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "nwRadarTower", ext);
}

// Helicopter attack waves from the eastern side of the map
function eastHeliAttack()
{
	const list = [cTempl.helcan, cTempl.helhmg];
	const ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0,
		targetPlayer: CAM_HUMAN_PLAYER
	};

	// The helicopter attacks stop when the east VTOL radar tower is destroyed.
	camSetVtolData(MIS_CYAN_SCAVS, "eHeliSpawn", "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(1.5)), "eRadarTower", ext);
}

// Set up patrols
function patrolSetUp()
{
	// South patrol
	camManageGroup(camMakeGroup("scavSouthPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("southPatrolPos1"),
			camMakePos("southPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(20)
	});

	// West mountain patrol
	camManageGroup(camMakeGroup("wPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("wPatrolPos1"),
			camMakePos("wPatrolPos2"),
			camMakePos("wPatrolPos3"),
		],
		interval: camSecondsToMilliseconds(15)
	});

	// North West base patrol
	camManageGroup(camMakeGroup("nwPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("nwPatrolPos1"),
			camMakePos("nwPatrolPos2"),
		],
		interval: camSecondsToMilliseconds(10)
	});

	// North East patrol
	camManageGroup(camMakeGroup("nePatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("nePatrolPos1"),
			camMakePos("nePatrolPos2"),
		],
		interval: camSecondsToMilliseconds(20)
	});

	// East Base patrol
	camManageGroup(camMakeGroup("ePatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("ePatrolPos1"),
			camMakePos("ePatrolPos2"),
		],
		interval: camSecondsToMilliseconds(10)
	});

	// Crawler patrol
	camManageGroup(camMakeGroup("infestedHighwayPatrol"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("highwayAssembly"),
			camMakePos("highwayPatrolPos"),
		],
		interval: camSecondsToMilliseconds(20)
	});
}

// Check if there are any remaining AA emplacements
function checkAA()
{
	// Check the southern base
	if (!southAADestroyed && enumArea("swScavBase", MIS_CYAN_SCAVS, false).filter(
		function(object) {
			// NOTE: We DON'T want to wrap this name with "_()", since the .name field does NOT change with language settings!
			return object.name === "Rusty Cyclone AA Flak Site";
		}).length === 0)
	{
		southAADestroyed = true;
		hackRemoveMessage("AA_SITE_S", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	// Check the eastern base
	if (!eastAADestroyed && enumArea("eScavBase", MIS_CYAN_SCAVS, false).filter(
		function(object) {
			return object.name === "Rusty Cyclone AA Flak Site";
		}).length === 0)
	{
		eastAADestroyed = true;
		hackRemoveMessage("AA_SITE_E", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	// Check the northwest base
	if (!nwAADestroyed && enumArea("nwScavFactoryBase", MIS_CYAN_SCAVS, false).filter(
		function(object) {
			return object.name === "Rusty Cyclone AA Flak Site";
		}).length === 0)
	{
		nwAADestroyed = true;
		hackRemoveMessage("AA_SITE_NW", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	if (southAADestroyed && eastAADestroyed && nwAADestroyed)
	{
		return true; // None remaining
	}
}

// Start the next phase of the level if the player has collected all artifacts and destroyed all AA
function checkForLZReturn()
{
	if (camAllArtifactsPickedUp() && checkAA())
	{
		removeTimer("checkForLZReturn");

		// playSound(cam_sounds.objective.primObjectiveCompleted);
		camGrantBonusPower(); // Grant bonus power here since the timer is about to be overridden

		// Set the mission to timer to 10 minutes and get ready to start sending waves of infested
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(10)));
		queue("startInfestedEndWaves", camSecondsToMilliseconds(12));
		wavePhase = true;

		// Give a message about the imminent infested waves
		camPlayVideos([cam_sounds.incoming.incomingIntelligenceReport, {video: "L6_WAVEMSG", type: MISS_MSG}]);
		camSetExtraObjectiveMessage(_("Escape the incoming infested waves"));

		// Change the fog colour to a half-light thick purple
		camGradualFog(camSecondsToMilliseconds(12), 57, 36, 78);
		// Give the lighting a stronger purple hue
		camGradualSunIntensity(camSecondsToMilliseconds(12), .4,.35,.4);
		// Constant snow
		camSetWeather(CAM_WEATHER_SNOWSTORM);
	}
}

function startInfestedEndWaves()
{
	camQueueDialogue({text: "--- ANOMALOUS SIGNAL DETECTED ---", delay: 0, sound: cam_sounds.beacon});
	setTimer("infestedEndWaves", camChangeOnDiff(camSecondsToMilliseconds(20)));
}

// Large waves of infested that appear after the main objective is complete
function infestedEndWaves()
{
	numWaves++;

	/*
		The waves of infested will start spawning from the various map "entrances" after the player finishes the main mission objectives
		Waves will spawn from more locations the longer the player spends on the map
		> Waves 1+ will spawn from the entrances inside the north scav base and the northeast infested base
		> Waves 6+ will spawn additional waves from outside the north scav base
		> Waves 12+ will spawn additional waves from the west and east highway entrances
	*/

	// Each entrance has it's own "core" unit compositions, with a bunch of Infested Civilians added on top:
	const nBaseDroids = [cTempl.stinger, cTempl.stinger, cTempl.infbloke, cTempl.infbloke, cTempl.inflance, cTempl.infbuggy];
	const neRoadDroids = [cTempl.stinger, cTempl.stinger, cTempl.infbuggy, cTempl.infbuggy, cTempl.infrbuggy, cTempl.inftrike];

	const nwRoadDroids = [cTempl.inftrike, cTempl.infminitruck, cTempl.infbuggy, cTempl.infrbuggy, cTempl.infbuscan, cTempl.inffiretruck];

	const wHighwayDroids = [cTempl.stinger, cTempl.infbjeep, cTempl.infrbjeep, cTempl.infminitruck, cTempl.infkevbloke, cTempl.infkevlance];
	const eHighwayDroids = [cTempl.stinger, cTempl.infbjeep, cTempl.infrbjeep, cTempl.infsartruck, cTempl.infkevbloke, cTempl.infkevlance];

	const CORE_SIZE = 4 + camRand(3); // Maximum of 6 core units.
	const FODDER_SIZE = 14 + camRand(3); // 14 - 16 extra Infested Civilians to the swarm.

	// Don't spawn another wave if there's already too many units on the map
	if (enumDroid(CAM_INFESTED).length < 500)
	{		
		camSendReinforcement(CAM_INFESTED, camMakePos("nBaseEntry"), camRandInfTemplates(nBaseDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
		camSendReinforcement(CAM_INFESTED, camMakePos("neRoadEntry"), camRandInfTemplates(neRoadDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);

		if (numWaves > 5)
		{
			camSendReinforcement(CAM_INFESTED, camMakePos("nwRoadEntry"), camRandInfTemplates(nwRoadDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
		}
		if (numWaves > 11)
		{
			camSendReinforcement(CAM_INFESTED, camMakePos("wHighwayEntry"), camRandInfTemplates(wHighwayDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
			camSendReinforcement(CAM_INFESTED, camMakePos("eHighwayEntry"), camRandInfTemplates(eHighwayDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
		}
	}

	if (numWaves === 16)
	{
		// Give the player an angry message about how slow they are
		camQueueDialogue([
			{text: "ASSOCIATE: What are you still doing out there?!", delay: 0, sound: CAM_RCLICK},
			{text: "ASSOCIATE: Are you searching for more glory?", delay: 3, sound: CAM_RCLICK},
			{text: "ASSOCIATE: More trial by combat??", delay: 2, sound: CAM_RCLICK},
			{text: "ASSOCIATE: Commander Alpha, by delaying your orders to retreat,", delay: 3, sound: CAM_RCLICK},
			{text: "not only are you putting your own troops at risk...", delay: 0},
			{text: "ASSOCIATE: But you are also endangering our entire evacuation!", delay: 4, sound: CAM_RCLICK},
			{text: "ASSOCIATE: Regroup at the LZ for evac, at once!", delay: 3, sound: CAM_RCLICK},
			{text: "ASSOCIATE: ...Unless you'd rather we call off the transports and leave you behind.", delay: 3, sound: CAM_RCLICK},
		]);
	}
}

// Change the transport's entry position to be closer to the LZ (and away from the AA)
function rerouteTransport()
{
	startTransporterEntry(68, 110, CAM_HUMAN_PLAYER);
}

function eventStartLevel()
{
	const lz = getObject("LZ");
	const tent = getObject("transporterEntry");
	const text = camMakePos(68, 110);

	numWaves = 0;
	wavePhase = false;
	southAADestroyed = false;
	nwAADestroyed = false;
	eastAADestroyed = false;

	// In order to win, the player must destroy all AA sites and collect any artifacts, then return to LZ
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "L7", {
		message: "RET_LZ",
		area: "compromiseZone",
		reinforcements: camMinutesToSeconds(2),
		callback: "checkAA",
		retlz: true
	});
	camSetExtraObjectiveMessage(_("Destroy the AA emplacements"));

	centreView(tent.x, tent.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(tent.x, tent.y, CAM_HUMAN_PLAYER);
	setTransporterExit(text.x, text.y, CAM_HUMAN_PLAYER);

	// Get the camera to follow the transporter
	// Transporter is the only droid of the player's on the map at this point
	const transporter = enumDroid();
	cameraTrack(transporter[0]);

	// Give research upgrades
	camCompleteRequiredResearch(mis_scavRes, MIS_CYAN_SCAVS);
	camCompleteRequiredResearch(mis_infestedRes, CAM_INFESTED);

	camSetArtifacts({
		"eastScavFactory": { tech: "R-Wpn-Rocket02-MRL" }, // Mini-Rocket Array
		"nwScavFactory2": { tech: "R-Wpn-Rocket-Damage04" }, // HEAT Rocket Warhead
	});

	// Set up bases
	camSetEnemyBases({
		"northWestScavOutpost": {
			cleanup: "wScavOutpost",
			detectMsg: "SCAV_OUTPOST1",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"northEastScavOutpost": {
			cleanup: "neScavOutpost",
			detectMsg: "SCAV_OUTPOST2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"northWestScavBase": {
			cleanup: "nwScavFactoryBase",
			detectMsg: "SCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"westScavBase": {
			cleanup: "wScavMountainBase",
			detectMsg: "SCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"eastScavBase": {
			cleanup: "eScavBase",
			detectMsg: "SCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"southWestScavBase": {
			cleanup: "swScavBase",
			detectMsg: "SCAV_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"infestedHighwayCamp": {
			cleanup: "infestedHighwayBase",
			detectMsg: "INFESTED_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"infestedRoadCamp": {
			cleanup: "infestedRoadBase",
			detectMsg: "INFESTED_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
	});

	let southTemplates = [cTempl.bloke, cTempl.bjeep, cTempl.lance, cTempl.bloke, cTempl.rbjeep, cTempl.moncan, cTempl.firetruck, cTempl.minitruck];
	if (difficulty >= HARD)
	{
		// Armor-up the south factory blokes
		southTemplates = camArrayReplaceWith(southTemplates, cTempl.bloke, cTempl.kevbloke);
		southTemplates = camArrayReplaceWith(southTemplates, cTempl.lance, cTempl.kevlance);
	}
	camSetFactories({
		"southScavFactory": {
			assembly: "southAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("southAssembly"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: southTemplates // Mixed units
		},
		"westScavFactory": {
			assembly: "wMountainAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("wMountainAssembly"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.kevbloke, cTempl.bjeep, cTempl.kevlance, cTempl.kevbloke, cTempl.rbjeep, cTempl.minitruck, cTempl.firetruck] // Mixed units
		},
		"nwScavFactory1": {
			assembly: "nwAssembly1",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			data: {
				morale: 50,
				fallback: camMakePos("nwAssembly1"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.kevbloke, cTempl.monhmg, cTempl.moncan, cTempl.kevlance, cTempl.kevbloke, cTempl.monsar, cTempl.monmrl, cTempl.kevlance] // Heavy vehicles + infantry
		},
		"nwScavFactory2": {
			assembly: "nwAssembly2",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("nwAssembly2"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.buscan, cTempl.firetruck, cTempl.bjeep, cTempl.minitruck, cTempl.rbjeep, cTempl.sartruck, cTempl.firetruck] // Only vehicles
		},
		"eastScavFactory": {
			assembly: "eAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			data: {
				morale: 50,
				fallback: camMakePos("eAssembly"),
				regroup: true,
				count: -1,
				targetPlayer: CAM_HUMAN_PLAYER
			},
			templates: [cTempl.kevbloke, cTempl.buscan, cTempl.monmrl, cTempl.kevlance, cTempl.minitruck, cTempl.kevbloke, cTempl.bjeep, cTempl.rbjeep, cTempl.sartruck, cTempl.monhmg] // Mixed units (cool)
		},
		"westInfestedFactory": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(15)),
			templates: [cTempl.infkevlance, cTempl.infminitruck, cTempl.infmoncan, cTempl.infbjeep, cTempl.infkevbloke, cTempl.infrbjeep, cTempl.infkevbloke] // Mixed units
		},
		"northInfestedFactory": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(10)),
			templates: [cTempl.infkevlance, cTempl.infbjeep, cTempl.infkevbloke, cTempl.inffiretruck, cTempl.infrbjeep, cTempl.infkevbloke] // Mixed units
		},
	});

	// Set up patrol groups across the map
	queue("patrolSetUp", camSecondsToMilliseconds(2));

	// Make the transport take a route closer to the LZ
	queue("rerouteTransport", camSecondsToMilliseconds(4));

	// Queue eastern helicopter attacks
	queue("eastHeliAttack", camChangeOnDiff(camMinutesToMilliseconds(3.5)));

	// Queue the northern infested base to activate
	queue("activateNorthInfested", camChangeOnDiff(camMinutesToMilliseconds(5)));

	// Enable the south west scav factory right away
	camEnableFactory("southScavFactory");

	// Set a timer for checking when the player is "ready" to return to LZ
	setTimer("checkForLZReturn", camSecondsToMilliseconds(3));

	// All infested structures start out partially damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// If we're in Timerless mode, set up scavenger Cranes
	if (tweakOptions.rec_timerlessMode)
	{
		// Large scavenger bases (with AA sites)
		camManageTrucks(
			MIS_CYAN_SCAVS, {
				label: "northWestScavBase",
				rebuildBase: (difficulty >= HARD),
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
				template: cTempl.crane,
				// Don't try to rebuild the AA sites
				structset: camAreaToStructSet("nwScavFactoryBase").filter((struct) => (struct.stat !== "AASite-RustQuadBof"))
		});
		camManageTrucks(
			MIS_CYAN_SCAVS, {
				label: "eastScavBase",
				rebuildBase: (difficulty >= HARD),
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
				template: cTempl.crane,
				structset: camAreaToStructSet("eScavBase").filter((struct) => (struct.stat !== "AASite-RustQuadBof"))
		});
		camManageTrucks(
			MIS_CYAN_SCAVS, {
				label: "southWestScavBase",
				rebuildBase: (difficulty >= INSANE),
				respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
				template: cTempl.crane,
				structset: camAreaToStructSet("swScavBase").filter((struct) => (struct.stat !== "AASite-RustQuadBof"))
		});
		if (difficulty >= EASY)
		{
			// Scav mountain base
			camManageTrucks(
				MIS_CYAN_SCAVS, {
					label: "westScavBase",
					rebuildBase: (difficulty >= MEDIUM),
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
					template: cTempl.crane,
					structset: camAreaToStructSet("wScavMountainBase")
			});
		}
		if (difficulty >= MEDIUM)
		{
			// Scav outposts
			camManageTrucks(
				MIS_CYAN_SCAVS, {
					label: "northWestScavOutpost",
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(90)),
					template: cTempl.crane,
					structset: camAreaToStructSet("wScavOutpost")
			});
			camManageTrucks(
				MIS_CYAN_SCAVS, {
					label: "northEastScavOutpost",
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(90)),
					template: cTempl.crane,
					structset: camAreaToStructSet("neScavOutpost")
			});
		}
	}

	// Set the sky to night
	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the lighting somewhat and give a SLIGHT pink/purple hue
	camSetSunIntensity(.4,.38,.4);
	// Change the fog to half-light pink/purple
	camSetFog(90, 90, 118);

	// Place beacons near the AA emplacements
	hackAddMessage("AA_SITE_S", PROX_MSG, CAM_HUMAN_PLAYER, false);
	hackAddMessage("AA_SITE_E", PROX_MSG, CAM_HUMAN_PLAYER, false);
	hackAddMessage("AA_SITE_NW", PROX_MSG, CAM_HUMAN_PLAYER, false);

	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_CYAN_SCAVS);
	camUpgradeOnMapStructures("Sys-VTOL-RadarTower01", "Sys-VTOL-RustyRadarTower01", MIS_CYAN_SCAVS);

	camAutoReplaceObjectLabel(["nwRadarTower", "eRadarTower"]);
}
