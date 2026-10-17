include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage06", "R-Wpn-Rocket-Damage06", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage06", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals05", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Sys-Engineering02", "R-Cyborg-Metals05",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF02",
	"R-Wpn-AAGun-Damage03", "R-Vehicle-Engine05", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade01", "R-Sys-Sensor-Upgrade01",
	"R-Vehicle-Armor-Heat01", "R-Cyborg-Armor-Heat01", "R-Wpn-Howitzer-Damage02",
	"R-Wpn-Howitzer-ROF01", "R-Wpn-Mortar-Acc01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage04", "R-Wpn-Mortar-Damage04",
	"R-Wpn-Flamer-Damage04", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];

var colCommanderGroup1;
var colCommanderGroup2;
var colCommanderGroup3;
var colHoverGroup;

var numBasesElim;
var infFactoryOnlyWave; // If true, ONLY spawn Infested units from entrances "bound" to a factory

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_THE_COLLECTIVE);
});

function heliAttack()
{
	const templates = [cTempl.helcan, cTempl.helhmg, cTempl.helpod];
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos", "heliRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(1)), "heliTower", ext);
}

function infHeliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1
	};
	camSetVtolData(CAM_INFESTED, undefined, "heliRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(45)), undefined, ext);
}

// Assign a label to the Collective's VTOL Strike droid
function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_THE_COLLECTIVE && camDroidMatchesTemplate(droid, cTempl.comstriket))
	{
		addLabel(droid, "colVtolSensor");
	}
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
			cTempl.infflatmrl, cTempl.infflatmrl, // Flatbeds
			cTempl.infflatat,
			cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.inffiretruck, // Fire Trucks
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		],
		[ // Light tanks & cyborgs + some scav stuff
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybhg, cTempl.infcybhg, cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcybmr, cTempl.infcybmr, // Mini-Rocket Cyborgs
			cTempl.infcybla, // Lancers
			cTempl.infcolpodt, cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infcolhmght, cTempl.infcolhmght, cTempl.infcolhmght, // HMGs
			cTempl.infcolcanht, cTempl.infcolcanht, cTempl.infcolcanht, // Light Cannons
			cTempl.infcommcant, cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, // Lancers
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		].concat((difficulty >= MEDIUM) ? cTempl.infcohhcant : []), // Add a Heavy Cannon tank 
		[ // Bashers, Stingers, and Infantry
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		].concat((difficulty >= MEDIUM) ? cTempl.infcomtruckt : []), // Add an Infested Truck
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;
	let bChance = 5;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	const entrances = [];
	if (!infFactoryOnlyWave)
	{
		entrances.push(
		"infEntry1", "infEntry2", "infEntry3",
		"infEntry4", "infEntry5", "infEntry6",
		"infEntry7", "infEntry8", "infEntry9",
		"infEntry15", "infEntry17");

		// Southwest corner entrances
		// Only if southwest base is destroyed
		if (camBaseIsEliminated("colMainBase")) entrances.push("infEntry11", "infEntry12", "infEntry13");
		// West small trench entrance
		// Only if the VTOL base is destroyed
		if (camBaseIsEliminated("colVtolBase")) entrances.push("infEntry14");
	}
	// South trench entrance
	// Only if the south Infested factory is alive
	if (getObject("infFactory") !== null) entrances.push("infEntry10");
	// Northwest small trench entrance
	// Only if the northwest Infested heavy factory is alive
	if (getObject("infHvyFactory2") !== null) entrances.push("infEntry16");
	// North small trench entrance
	// Only if the north Infested heavy factory is alive
	if (getObject("infHvyFactory1") !== null) entrances.push("infEntry18");

	const NUM_GROUPS = difficulty + 2;
	const NUM_ENTRANCES = entrances.length;
	for (let i = 0; i < (Math.min(NUM_ENTRANCES, NUM_GROUPS)); i++)
	{
		// Spawn units at a random entrance
		const INDEX = camRand(entrances.length);

		// Special case player targeting
		let targetPlayer;
		if (entrances[INDEX] === "infEntry10" && getObject("infFactory") !== null)
		{
			// Prioritize the player's stuff
			targetPlayer = CAM_HUMAN_PLAYER;
		}

		camSendReinforcement(CAM_INFESTED, getObject(entrances[INDEX]), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance),
			CAM_REINFORCE_GROUND, {order: CAM_ORDER_ATTACK, data: {targetPlayer: targetPlayer}});

		entrances.splice(INDEX, 1);
	}

	infFactoryOnlyWave = !infFactoryOnlyWave;
}

// Activate more factories...
function activateFirstFactories()
{
	camEnableFactory("infHvyFactory1"); // North Infested vehicle factory
	camEnableFactory("infHvyFactory2"); // Northwest Infested vehicle factory
	camEnableFactory("colCybFactory2"); // West cyborg factory
	camEnableFactory("colFactory1"); // Hover factory
	camEnableFactory("cScavFactory1");

	heliAttack();
}

function activateSecondFactories()
{
	camEnableFactory("colFactory2"); // Heavy factory
	camEnableFactory("colCybFactory3"); // Southwest cyborg factory
	camEnableFactory("cScavFactory2");

	// Also order the the eastern commander to attack
	camManageGroup(colCommanderGroup1, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		repair: 75
	});
}

function activateFinalFactories()
{
	camEnableFactory("colVtolFactory2");

	// Also order the the west commander to attack
	camManageGroup(colCommanderGroup2, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		repair: 75
	});
}

function camEnemyBaseEliminated()
{
	numBasesElim++;

	if (numBasesElim == 5)
	{
		camCallOnce("charlieDialogue");
	}
}

// Ominous request from Commander Charlie
function charlieDialogue()
{
	camQueueDialogue([
		{text: "CHARLIE: Commander Bravo?", delay: 6, sound: CAM_RCLICK},
		{text: "CHARLIE: Hey, Bravo, are you reading this?", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Listen, I'm not sure what Clayde's got you doing out there...", delay: 5, sound: CAM_RCLICK},
		{text: "CHARLIE: But whenever you're done, there's something we need to show you.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: It's...", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: It's important.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: ...And you're only going believe it when you see it.", delay: 4, sound: CAM_RCLICK},
	]);
}

function camEnemyBaseEliminated_colVtolBase()
{
	camCallOnce("swCommanderAttack");
}

function camEnemyBaseEliminated_colMainBase()
{
	camCallOnce("swCommanderAttack");
}

function swCommanderAttack()
{
	// Order the the southwest commander to attack
	camManageGroup(colCommanderGroup3, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		repair: 75
	});
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L9", {
		ignoreInfestedUnits: true
	});

	camSetArtifacts({
		"colCC": { tech: "R-Sys-Sensor-Upgrade01" }, // Sensor Upgrade
		"colResearch": { tech: "R-Wpn-Howitzer-Accuracy01" }, // Target Acquisition Artillery Shells
		"colFactory2": { tech: "R-Vehicle-Body09" }, // Tiger
		"colVtolFactory2": { tech: "R-Wpn-Bomb02" }, // HEAP Bomb Bay
		"rippleEmp": { tech: "R-Wpn-Rocket06-IDF" }, // Ripple Rockets
	});

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetEnemyBases({
		"colEastBase": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colSoutheastBase": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		// Base 3 was taken out back and shot for being too annoying
		"colVtolBase": {
			cleanup: "colBase4",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colMainBase": {
			cleanup: "colBase5",
			detectMsg: "COL_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"cScavWaterBase": {
			cleanup: "cScavBase",
			detectMsg: "CSCAV_BASE",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"infSouthBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNorthBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNorthwestBase": {
			cleanup: "infBase3",
			detectMsg: "INF_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_PATROL,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 75,
				pos: [
					camMakePos("hoverPatrolPos3"),
					camMakePos("hoverPatrolPos4"),
					camMakePos("hoverPatrolPos5"),
					camMakePos("hoverPatrolPos6"),
					camMakePos("hoverPatrolPos7"),
					camMakePos("hoverPatrolPos8")
				],
				interval: camSecondsToMilliseconds(32)
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(135)),
			// Hovers
			templates: [ cTempl.cohbbh, cTempl.comhpvh, cTempl.comhath, cTempl.comhath, cTempl.comhpvh, cTempl.cohhrah ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(135)),
			// Heavy tanks
			templates: [ cTempl.cohhcant, cTempl.cohhcant, cTempl.cohbbt, cTempl.cohhrat, cTempl.cohhcant ]
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			// Super Cyborgs + Assault Gunners
			templates: [ cTempl.scyac, cTempl.cybag, cTempl.cybag ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			// Rocket cyborgs
			templates: [ cTempl.scyhr, cTempl.scytk ]
		},
		"colCybFactory3": {
			assembly: "colCybAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(65)),
			// Super cannons/grenadiers
			templates: [ cTempl.scyac, cTempl.scygr ]
		},
		"colVtolFactory1": {
			assembly: "colVtolAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			// Lancers + Assault Cannons
			templates: [ cTempl.colatv, cTempl.comacanv ]
		},
		"colVtolFactory2": {
			assembly: "colVtolAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(125)),
			// Bomber spam
			templates: [ cTempl.comhbombv, cTempl.colphosv ]
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(27)),
			// Basic vehicles + infantry
			templates: [ cTempl.bjeep, cTempl.rbjeep, cTempl.kevbloke, cTempl.buscan, cTempl.firetruck, cTempl.kevlance ]
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(33)),
			// Cool stuff
			templates: [ cTempl.monlan, cTempl.gbjeep, cTempl.monhmg, cTempl.flatmrl, cTempl.flatat, cTempl.moncan, cTempl.minitruck ]
		},
		"infFactory": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Misc. scav vehicles
			templates: [cTempl.infgbjeep, cTempl.infmonhmg, cTempl.infkevbloke, cTempl.infflatmrl, cTempl.infmonlan, cTempl.infminitruck, cTempl.infflatat]
		},
		"infCybFactory": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(25)),
			templates: [ cTempl.infcybca, cTempl.infcybmr, cTempl.infcybhg, cTempl.infscymc, cTempl.infcybla ]
		},
		"infHvyFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [ cTempl.infcommcant, cTempl.infcomatt, cTempl.infcolpodt, cTempl.infcomhmgt, cTempl.infcommcant ]
		},
		"infHvyFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(60)),
			templates: [ cTempl.infcommcant, cTempl.infcomatt, cTempl.infcomhmgt, cTempl.infcohhcant ]
		},
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colEastBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck1"),
			structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSoutheastBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck2"),
			structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colVtolBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck4"),
			structset: camAreaToStructSet("colBase4")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck5"),
			structset: camAreaToStructSet("colBase5")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		// Cranes and more trucks...
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(60));
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "cScavWaterBase",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		// Main base (again)
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colMainBase",
				respawnDelay: TRUCK_TIME,
				rebuildBase: tweakOptions.rec_timerlessMode,
				template: cTempl.comtruckt,
				structset: camAreaToStructSet("colBase5")
		});
		if (difficulty >= HARD)
		{
			// Another Crane for the scav base
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "cScavWaterBase",
					rebuildBase: true,
					respawnDelay: CRANE_TIME,
					template: cTempl.crane,
					structset: camAreaToStructSet("cScavBase").filter((struct) => (camIsScavStruct(struct.stat)))
			});
			// Another truck for the VTOL base
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colVtolBase",
					respawnDelay: TRUCK_TIME,
					rebuildBase: tweakOptions.rec_timerlessMode,
					template: cTempl.comtruckt,
					structset: camAreaToStructSet("colBase4")
			});
		}
		if (difficulty === INSANE)
		{
			// A THIRD truck for the main base!!!
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colMainBase",
					respawnDelay: TRUCK_TIME,
					rebuildBase: tweakOptions.rec_timerlessMode,
					template: cTempl.comtruckt,
					structset: camAreaToStructSet("colBase5")
			});
		}
	}
	else
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	}

	// Upgrade Collective structures on higher difficulties
	if (difficulty == HARD)
	{
		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower03", "Wall-VulcanCan", true); // Cannon Hardpoints
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MRL-pit", "Emplacement-MRLHvy-pit", true); // MRA Emplacements
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof", true); // AA Sites
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MRL-pit", "Emplacement-MRLHvy-pit"); // MRA Emplacements
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof"); // AA Sites

		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower03", "Wall-VulcanCan", true); // Cannon Hardpoints
	}

	// Rank and assign the Collective commanders
	// Set the commanders' rank 
	// Ranges from Trained to Professional:
	camSetDroidRank(getObject("colCommander1"), (difficulty <= EASY) ? 2 : (difficulty));
	colCommanderGroup1 = camMakeGroup("colCommander1");
	// Ranges from Professional to Elite:
	camSetDroidRank(getObject("colCommander2"), (difficulty <= EASY) ? 4 : (difficulty + 2));
	colCommanderGroup2 = camMakeGroup("colCommander2");
	// Ranges from Elite to Hero:
	camSetDroidRank(getObject("colCommander3"), (difficulty <= EASY) ? 6 : (difficulty + 4));
	colCommanderGroup3 = camMakeGroup("colCommander3");

	numBasesElim = 0;
	infFactoryOnlyWave = true;

	// Give the commanders orders and assign their subordinates
	// East base commander:
	camManageGroup(colCommanderGroup1, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3")
		],
		interval: camSecondsToMilliseconds(32),
		repair: 75
	});
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup1"), {
			templates: [
				cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 4 Super Auto-Cannons
				cTempl.comagt, cTempl.comagt, // 2 Assault Guns
				cTempl.cominft, cTempl.cominft, // 2 Infernos
				cTempl.comhaat, // 1 Cyclone
				cTempl.comrept, // 1 Repair Turret
				cTempl.comagt, cTempl.comagt, // 2 Assault Guns (Hard+)
				cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons (Insane)
			],
			factories: ["colFactory1", "colFactory2", "colCybFactory2", "colCybFactory1"],
			obj: "colCommander1" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander1",
			repair: 50,
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER				
			}
	});

	// VTOL base commander:
	camManageGroup(colCommanderGroup2, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos4"),
			camMakePos("patrolPos5"),
			camMakePos("patrolPos6")
		],
		interval: camSecondsToMilliseconds(46),
		repair: 75
	});
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup2"), {
			templates: [
				cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super Tank Killers
				cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
				cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
				cTempl.cohraat, // 1 Whirlwind
				cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				cTempl.comstriket, // 1 VTOL Strike Turret
				cTempl.comagt, cTempl.comagt, // 2 Assault Guns (Hard+)
				cTempl.scytk, cTempl.scytk, // 2 Super Tank Killers (Insane)
			],
			factories: ["colFactory1", "colFactory2", "colCybFactory2"],
			obj: "colCommander2"
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander2",
			repair: 50,
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER				
			}
	});

	// Southwest base commander:
	camManageGroup(colCommanderGroup3, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos7"),
			camMakePos("patrolPos8"),
			camMakePos("patrolPos9")
		],
		interval: camSecondsToMilliseconds(46),
		repair: 75
	});
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup3"), {
			templates: [
				cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
				cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
				cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
				cTempl.comagt, cTempl.comagt, // 2 Assault Guns
				cTempl.cominft, cTempl.cominft, // 2 Infernos
				cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				cTempl.comrept, // 1 Repair Turret
				cTempl.comsenst, // 1 Sensor Turret
				cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters (Hard+)
				cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons (Insane)
			],
			factories: ["colFactory1", "colFactory2"],
			obj: "colCommander3"
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander3",
			repair: 50,
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER				
			}
	});

	// Also assign a refillable hover group
	colHoverGroup = camMakeRefillableGroup(
		camMakeGroup("colHoverPatrolGroup"), {
			templates: [
				cTempl.cohhrah, cTempl.cohhrah, cTempl.cohhrah, cTempl.cohhrah, // 4 HRAs
				cTempl.comhath, cTempl.comhath, cTempl.comhath, cTempl.comhath, // 4 Tank Killers
			],
			factories: ["colFactory1"]
		}, CAM_ORDER_PATROL, {
			repair: 75,
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("hoverPatrolPos2"),
				camMakePos("hoverPatrolPos3"),
			],
			interval: camSecondsToMilliseconds(22)
	});

	// Manage Collective VTOL groups...
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Assault Guns, 2 Phosphor Bombs
				cTempl.colagv, cTempl.colphosv,
				cTempl.colagv, cTempl.colphosv,
			],
			globalFill: true,
			obj: "colVtolTower1", // East base tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower1",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Assault Guns, 2 Assault Cannons
				cTempl.colagv, cTempl.comacanv,
				cTempl.colagv, cTempl.comacanv,
			],
			globalFill: true,
			obj: "colVtolTower2", // Southeast outpost tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower2",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Phosphor Bombs
				cTempl.comhatv, cTempl.colphosv,
				cTempl.comhatv, cTempl.colphosv,
			],
			globalFill: true,
			obj: "colVtolTower3", // VTOL base tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower3",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 Assault Cannons, 2 Tank Killers
				cTempl.comacanv, cTempl.comacanv, cTempl.comhatv,
				cTempl.comacanv, cTempl.comacanv, cTempl.comhatv,
			],
			globalFill: true,
			obj: "colVtolTower4", // Southwest base tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower4",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Cannons
				cTempl.comhatv, cTempl.comacanv,
				cTempl.comhatv, cTempl.comacanv,
			],
			globalFill: true,
			obj: "colVtolCBTower1", // VTOL base CB tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolCBTower1",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 4 Assault Cannons
				cTempl.comhatv, cTempl.comacanv, cTempl.comacanv,
				cTempl.comhatv, cTempl.comacanv, cTempl.comacanv,
			],
			globalFill: true,
			obj: "colVtolCBTower2", // Southwest base CB tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolCBTower2",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 Tank Killers, 2 Assault Cannons, 4 Thermite Bombs
				cTempl.comhatv, cTempl.comhatv, cTempl.comacanv, cTempl.comthermv, cTempl.comthermv,
				cTempl.comhatv, cTempl.comhatv, cTempl.comacanv, cTempl.comthermv, cTempl.comthermv,
			],
			globalFill: true,
			obj: "colVtolSensor", // VTOL Strike Turret assigned to a commander
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolSensor",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});

	camAutoReplaceObjectLabel("heliTower");
	// Start these factories immediately...
	camEnableFactory("infFactory");
	camEnableFactory("infCybFactory");
	camEnableFactory("colCybFactory1");
	camEnableFactory("colVtolFactory1");

	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("activateFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(12)));
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(60)));
	infHeliAttack();

	// Give player briefing.
	camPlayVideos({video: "A3L8_BRIEF", type: MISS_MSG});

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Give the fog a pink hue
	camSetFog(24, 16, 64);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
}