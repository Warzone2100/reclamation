include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_TEAM_GOLF = 1;

var allowExtraWaves; // Increases the amount of Infested reinforcements as the level progresses
var infFactoryOnlyWave; // If true, ONLY spawn Infested units from entrances "bound" to a factory

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage04", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials04", 
	"R-Defense-WallUpgrade04", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04", "R-Wpn-AAGun-Accuracy01",
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

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function vtolAttack()
{
	if (getObject("colCC") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}
	
	// Phosphor Bombs, Assault Guns, and Lancers
	const templates = [cTempl.colphosv, cTempl.colagv, cTempl.colatv];
	const ext = {
		limit: [2, 3, 2],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC", ext);
}

function eventPickup(feature, droid)
{
	// THESE COORDINATES NEED TO BE UPDATED IF THE ARTIFACT IS MOVED
	if (feature.stattype === ARTIFACT && droid.player === CAM_HUMAN_PLAYER && feature.x === 83 && feature.y === 35)
	{
		// Donate Golf's convoy to the player once they collect the artifact
		const droids = enumDroid(MIS_TEAM_GOLF);
		camEnsureDonateObject(droids, CAM_HUMAN_PLAYER);

		playSound(cam_sounds.rescue.groupRescued);
		camSetExtraObjectiveMessage();
	}
}

function camEnemyBaseEliminated()
{
	camCallOnce("charlieDialogue");
}

// Commander Charlie questions Clayde about using the Infested
function charlieDialogue()
{
	camQueueDialogue([
		{text: "CHARLIE: General Clayde, if I can ask?", delay: 6, sound: CAM_RCLICK},
		{text: "CHARLIE: How long are we going to keep using the Infested for?", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: We've already freed all of our guys from the Collective and...", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: It feels... wrong.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: To use something like this against other people.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: First of all, Commander Charlie,", delay: 4, sound: CAM_RCLICK},
		{text: "however you may \"feel\" about Project X is irrelevant.", delay: 0},
		{text: "CLAYDE: We can use the Lures to control the Infested;", delay: 4, sound: CAM_RCLICK},
		{text: "but the Collective is a grave threat to us all.", delay: 0},
		{text: "CLAYDE: So we will use Project X for however long we need it.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: And second, it's \"Supreme General Clayde\" to you, Commander Charlie.", delay: 4, sound: CAM_RCLICK},
	]);
}

// Enable the main Collective factory and the south cyborg factory
function activateAllFactories()
{
	camEnableFactory("colFactory");
	camEnableFactory("colCybFactory1");

	allowExtraWaves = true;
}

function sendInfestedReinforcements()
{	
	const coreDroids = [
		[ // Scavs & crawlers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, // Boom Ticks
			cTempl.infmoncan, cTempl.infmoncan, // Bus Tanks
			cTempl.infmonhmg,
			cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance,
		].concat((difficulty >= MEDIUM) ? cTempl.vilestinger : []), // Add a Vile Stinger
		[ // Light tanks & cyborgs + some scav stuff
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcolpodt, // MRPs
			cTempl.infcolhmght, // HMGs
			cTempl.infcolcanht, // Light Cannons
			cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, cTempl.inftrike, cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		].concat((difficulty >= MEDIUM) ? cTempl.infcommcant : []), // Add a Medium Cannon tank
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 14;
	let bChance = 0;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	// North east & south canal entrance
	const entrances = [];
	if (infFactoryOnlyWave)
	{
		// If it's a factory-only wave, ONLY these entrances may spawn
		if (allowExtraWaves && getObject("infFactory1") !== null)
		{	
			// South trench entrance
			entrances.push("infEntry4");
		}
		if (allowExtraWaves && getObject("infFactory2") !== null)
		{	
			// North trench entrances
			entrances.push("infEntry7", "infEntry8");
		}
	}
	else
	{
		// Entrances from A3L1
		entrances.push("infEntry2", "infEntry3");
		// North & south trench entrances
		if (allowExtraWaves) entrances.push("infEntry4", "infEntry7", "infEntry8");
		// South west trench entrance
		// Only starts when the south Collective base is destroyed
		if (camBaseIsEliminated("colSouthBase")) entrances.push("infEntry5");
		// North west road entrance
		// Only starts when the main Collective base is destroyed
		if (camBaseIsEliminated("colMainBase")) entrances.push("infEntry9");
	}

	const NUM_GROUPS = difficulty + 2;
	const NUM_ENTRANCES = entrances.length;
	for (let i = 0; i < (Math.min(NUM_ENTRANCES, NUM_GROUPS)); i++)
	{
		// Spawn units at a random entrance
		const INDEX = camRand(entrances.length);

		// Special case player targeting
		let targetPlayer;
		if ((entrances[INDEX] === "infEntry4" && getObject("infFactory1") !== null)
			|| ((entrances[INDEX] === "infEntry7" || entrances[INDEX] === "infEntry8") && getObject("infFactory2") !== null))
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

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L3S", {
		ignoreInfestedUnits: true
	});
	camSetExtraObjectiveMessage(_("Locate team Golf's missing convoy"));

	setAlliance(MIS_TEAM_GOLF, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_GOLF, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_TEAM_GOLF, CAM_INFESTED, true);

	changePlayerColour(MIS_TEAM_GOLF, (playerData[0].colour !== 7) ? 7 : 12); // Golf to cyan or neon green

	camSetArtifacts({
		"colFactory": { tech: "R-Wpn-Rocket02-MRLHvy" }, // Heavy Rocket Array
		"colPower": { tech: "R-Struc-Power-Upgrade01" }, // Gas Turbine Generator
		"convoyCrate": { tech: "R-Wpn-Mortar3" }, // Pepperpot
		"colResearch": { tech: "R-Wpn-Bomb-Damage01" }, // HE Bomb Shells
	});

	camCompleteRequiredResearch(camAct3StartResearch, MIS_TEAM_GOLF);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetEnemyBases({
		"colSouthBase": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colOverlook": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colMainBase": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infEastBase": {
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
	});

	camSetFactories({
		"colFactory": {
			assembly: "colAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(115)),
			// Medium and heavy tanks
			templates: [ cTempl.cohhrat, cTempl.commcant, cTempl.cominft, cTempl.comhmgt, cTempl.comatt, cTempl.comhmgt, cTempl.comhpvt, cTempl.cohhcant ]
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Heavy cyborg support
			templates: [ cTempl.scymc, cTempl.scyhr, cTempl.scyhr, cTempl.scymc ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 9,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Light crowd-killers
			templates: [ cTempl.cybhg, cTempl.cybth, cTempl.cybhg ]
		},
		"infFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Light scav vehicles
			templates: [cTempl.infbloke, cTempl.inftrike, cTempl.infrbuggy, cTempl.inflance, cTempl.infgbjeep, cTempl.infbjeep, cTempl.infbuggy, cTempl.infbuscan]
		},
		"infFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			// Heavy scav vehicles
			templates: [cTempl.infmoncan, cTempl.infkevlance, cTempl.infmonsar, cTempl.infkevbloke, cTempl.infflatmrl, cTempl.infbuscan, cTempl.infkevbloke]
		},
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck1"),
			structset: camAreaToStructSet("colBase1")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colOverlook",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck2"),
			structset: camAreaToStructSet("colBase2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck3"),
			structset: camAreaToStructSet("colBase3")
	});

	if (tweakOptions.rec_timerlessMode)
	{
		// NOTE: No scav cranes on this mission!
		// Add a second truck to the Collective's main base
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colMainBase",
				respawnDelay: TRUCK_TIME,
				rebuildBase: true,
				template: cTempl.comtruckt,
				structset: camAreaToStructSet("colBase3")
		});
	}
	else
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(70)));
	}

	// Upgrade Collective structures on higher difficulties
	if (difficulty == HARD)
	{
		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MRL-pit", "Emplacement-MRLHvy-pit", true); // MRA Emplacements
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof", true); // AA Sites
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MortarPit01", "Emplacement-MortarPit02", true); // Mortar Pits
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "PillBox5", "Tower-Projector", true); // Flamer Bunkers
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MRL-pit", "Emplacement-MRLHvy-pit"); // MRA Emplacements
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof"); // AA Sites
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MortarPit01", "Emplacement-MortarPit02"); // Mortar Pits
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "PillBox5", "Tower-Projector"); // Flamer Bunkers
	}

	// Rank and assign the Collective commander
	// Set the commander's rank (ranges from Professional to Elite)
	const COMMANDER_RANK = (difficulty <= EASY) ? 5 : (difficulty + 3);
	camSetDroidRank(getObject("colCommander"), COMMANDER_RANK);
	camManageGroup(camMakeGroup("colCommander"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos1"),
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3")
		],
		interval: camSecondsToMilliseconds(46),
		repair: 70
	});
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup"), {
			templates: [
				cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
				cTempl.comhpvt, cTempl.comhpvt, // 2 HVCs
				cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
				cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 4 HMGs
				cTempl.cominft, cTempl.cominft, // 2 Infernos
				cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
				cTempl.cominft, cTempl.cominft, // 2 Infernos (Hard+)
				cTempl.comhpvt, cTempl.comhpvt, // 2 HVCs (Insane)
			],
			factories: ["colFactory"],
			obj: "colCommander" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander",
			repair: 50,
			suborder: CAM_ORDER_ATTACK,
			data:
			{
				targetPlayer: CAM_HUMAN_PLAYER				
			}
	});

	camManageGroup(camMakeGroup("colRippleGroup"), CAM_ORDER_FOLLOW, {
		leader: "colSensorTower",
		suborder: CAM_ORDER_DEFEND, // If the sensor is destroyed, sit around in their own little spot
		data: {
			pos: camMakePos("colRippleGroup")
		}
	});

	allowExtraWaves = false;
	infFactoryOnlyWave = true;

	camAutoReplaceObjectLabel(["colCC", "colSensorTower"]);
	// Most factories are enabled immediately on this mission...
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("colCybFactory2");

	queue("activateAllFactories", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(60)));

	// Give player briefing.
	camPlayVideos({video: "A3L2_BRIEF", type: MISS_MSG});

	// Additional dialogue
	camQueueDialogue([
		{text: "CLAYDE: One more thing, Commander Bravo.", delay: 12, sound: CAM_RCLICK},
		{text: "CLAYDE: Team Golf lost contact with a group somewhere near your position.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: They were returning with a prototype for some kind of unique artillery weapon.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: If you can, find Golf's missing group and recover their cargo.", delay: 3, sound: CAM_RCLICK},
	]);

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Also rank and pre-damage team Golf's convoy
	camSetPreDamageModifier(MIS_TEAM_GOLF, [60, 80]);
	const golfDroids = enumDroid(MIS_TEAM_GOLF);
	camSetDroidRank(golfDroids, "Regular");

	// Give the fog a pink hue
	camSetFog(24, 16, 64);
	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .5);
}