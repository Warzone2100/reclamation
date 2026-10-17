include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_TEAM_ZULU = 1;
const transportEntryPos = { x: 180, y: 2 }; // Cinematic transport entry position
const colTransportEntryPos = { x: 138, y: 30 };

var firstTransport; // Whether the player's first transport has landed
var startedFromMenu;
var playerColour;
var allowExtraWaves; // Increases the amount of Infested reinforcements as the level progresses
var infFactoryOnlyWave; // If true, ONLY spawn Infested units from entrances "bound" to a factory

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage04", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine04", "R-Wpn-AAGun-Accuracy01",
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

function heliAttack()
{
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "heliAttackPos", "vtolRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(2.25)), "heliTower", ext);
}

function vtolAttack()
{
	if (getObject("colCC") !== null)
	{
		playSound(cam_sounds.enemyVtolsDetected);
	}

	// MGs and Phosphor Bombs
	const templates = [cTempl.colphosv];
	if (difficulty < INSANE)
	{
		templates.push(cTempl.colhmgv);
	}
	else
	{
		// If we're on Insane, replace HMG VTOLs with Assault Guns
		templates.push(cTempl.colagv);
	}
	const ext = {
		limit: [2, 3],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2.5)), "colCC", ext);
}

//Gives starting tech and research.
function grantPlayerTech()
{
	for (let x = 0, l = camBasicStructs.length; x < l; ++x)
	{
		enableStructure(camBasicStructs[x], CAM_HUMAN_PLAYER);
	}

	camCompleteRequiredResearch(camAct3StartResearch, CAM_HUMAN_PLAYER);
}

// Bump the rank of the first batch of transport droids (if starting from the menu).
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		if (firstTransport)
		{			
			// Transfer all Zulu units/structures to the player
			const objs = enumDroid(MIS_TEAM_ZULU).concat(enumStruct(MIS_TEAM_ZULU));
			camEnsureDonateObject(objs, CAM_HUMAN_PLAYER);

			queue("setVictory", camSecondsToMilliseconds(1));
		}

		if (startedFromMenu)
		{
			camSetDroidRank(enumCargo(transport), (firstTransport) ? "Elite" : "Professional");
		}

		firstTransport = false;
	}
}

// Set victory data
// Called on a delay to avoid failing the player if Zulu's units aren't transferred fast enough
function setVictory()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L2", {
		ignoreInfestedUnits: true // The Infested never stop spawning; their units don't need to be wiped out to win
	});
}

// Enable the main Collective factory and all Infested factories
// Also sends a group of Infested towards the player's base
function activateFirstFactories()
{
	camEnableFactory("colFactory");
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("infFactory3");

	// Send a group of Bashers towards the player's base
	camSendReinforcement(CAM_INFESTED, getObject("infEntry5"), camRandInfTemplates([cTempl.basher], 8, 6), CAM_REINFORCE_GROUND,
		{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
	);

	// Start spawning additional waves of infested
	allowExtraWaves = true;
}

// Enable the Collective's cyborg factory and start bringing in transports
function startCollectiveTransports()
{
	camEnableFactory("colCybFactory");
	sendCollectiveTransporter();
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(8)));
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
	const TRANSPORT_SIZE = ((difficulty <= EASY) ? 6 : ((difficulty === MEDIUM) ? 8 : 10));
	const droidPool = [
		cTempl.cominft, // Inferno
		cTempl.cybth, // Thermite Flamer
	];
	if (difficulty <= EASY)
	{
		droidPool.push(cTempl.comhmgt); // Heavy Machinegun
		droidPool.push(cTempl.cybhg); // Heavy Machinegunner
		droidPool.push(cTempl.cybgr); // Grenadier
	}
	else if (difficulty >= MEDIUM)
	{
		droidPool.push(cTempl.comagt); // Assault Gun
		droidPool.push(cTempl.cybag); // Assault Gunner
		droidPool.push(cTempl.scygr); // Super Grenadier
	}

	const droids = [];
	for (let i = 0; i < TRANSPORT_SIZE; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	// Send the transport!
	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: colTransportEntryPos,
			exit: colTransportEntryPos,
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 20
			}
		}
	);
}

function sendInfestedReinforcements()
{	
	const coreDroids = [ // Just basic scavs and crawlers
		cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
		cTempl.basher, cTempl.basher, // Bashers
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
	const CORE_SIZE = 4; // Number of "core" units listed above to include
	const FODDER_SIZE = 14; // Number of "fodder" units to include (Infested Civilians)
	let bChance = 0; // Chance to replace Infested Civilians with Bashers (default 0% chance)
	if (difficulty >= HARD) bChance += 5; // +5% chance
	if (difficulty === INSANE) bChance += 5; // +5% chance

	const entrances = [];

	// South road entrance
	// (Stops entirely when factory is destroyed)
	if (getObject("infFactory1") !== null) entrances.push("infEntry1");
	// East base entrance
	if (getObject("infFactory2") !== null && allowExtraWaves) entrances.push("infEntry3");
	// East road entrance
	if (getObject("infFactory3") !== null && allowExtraWaves) entrances.push("infEntry5");

	if (!infFactoryOnlyWave && allowExtraWaves)
	{
		// South canal & east trench entrances
		// (Does NOT stop for the entire mission!)
		entrances.push("infEntry2", "infEntry4");
	}

	const NUM_GROUPS = difficulty + 2;
	const NUM_ENTRANCES = entrances.length;
	for (let i = 0; i < (Math.min(NUM_ENTRANCES, NUM_GROUPS)); i++)
	{
		// Spawn units at a random entrance
		const INDEX = camRand(entrances.length);

		// Special case player targeting
		let targetPlayer;
		if (((entrances[INDEX] === "infEntry1" || entrances[INDEX] === "infEntry2") && !camBaseIsEliminated("colSouthRoadblock"))
			|| ((entrances[INDEX] === "infEntry4" || entrances[INDEX] === "infEntry4") && !camBaseIsEliminated("colEastRoadblock")))
		{
			// Prioritize the closest Collective base
			targetPlayer = CAM_THE_COLLECTIVE;
		}

		camSendReinforcement(CAM_INFESTED, getObject(entrances[INDEX]), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND,
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: targetPlayer}});

		entrances.splice(INDEX, 1);
	}

	// Flip this between each wave
	infFactoryOnlyWave = !infFactoryOnlyWave;
}

// Spawns a player unit at the LZ, and then removes it.
// If the unit had any EXP, repeat the cycle.
// Do this until the spawned unit has no EXP
function drainPlayerExp()
{
	let droidExp = -1;
	while (droidExp != 0)
	{
		const droid = camAddDroid(CAM_HUMAN_PLAYER, "landingZone", cTempl.plmgw, "EXP Sink");
		droidExp = droid.experience;
		camSafeRemoveObject(droid);
	}
}

// Allow the player to change to colors that are hard-coded to be unselectable
function eventChat(from, to, message)
{
	let colour = 0;
	switch (message)
	{
		case "green me":
			colour = 0; // Green
			break;
		case "orange me":
			colour = 1; // Orange
			break;
		case "grey me":
		case "gray me":
			colour = 2; // Gray
			break;
		case "black me":
			colour = 3; // Black
			break;
		case "red me":
			colour = 4; // Red
			break;
		case "blue me":
			colour = 5; // Blue
			break;
		case "pink me":
			colour = 6; // Pink
			break;
		case "aqua me":
		case "cyan me":
			colour = 7; // Cyan
			break;
		case "yellow me":
			colour = 8; // Yellow
			break;
		case "purple me":
			colour = 9; // Purple
			break;
		case "white me":
			colour = 10; // White
			break;
		case "bright blue me":
		case "bright me":
			colour = 11; // Bright Blue
			break;
		case "neon green me":
		case "neon me":
		case "bright green me":
			colour = 12; // Neon Green
			break;
		case "infrared me":
		case "infra red me":
		case "infra me":
		case "dark red me":
			colour = 13; // Infrared
			break;
		case "ultraviolet me":
		case "ultra violet me":
		case "ultra me":
		case "uv me":
		case "dark blue me":
			colour = 14; // Ultraviolet
			break;
		case "brown me":
		case "dark green me":
			colour = 15; // Brown
			break;
		default:
			return; // Some other message; do nothing
	}

	playerColour = colour;
	changePlayerColour(CAM_HUMAN_PLAYER, colour);
	adaptColors();
	playSound("beep6.ogg");
}

function adaptColors()
{
	// Make sure the other factions aren't choosing conflicting colors with the player
	changePlayerColour(CAM_THE_COLLECTIVE, (playerColour !== 2) ? 2 : 10); // Set to gray or white
	changePlayerColour(CAM_INFESTED, (playerColour !== 9) ? 9 : 4); // Infested to purple or red
	changePlayerColour(MIS_TEAM_ZULU, (playerColour !== 15) ? 15 : 0); // Zulu to brown or green
}

function trackTransporter()
{
	// Get the camera to follow the transporter
	// Transporter is the only droid of the player's on the map at this point
	const transporter = enumDroid();
	cameraTrack(transporter[0]);
}

function eventStartLevel()
{
	const lz = getObject("landingZone"); //player lz

	centreView(transportEntryPos.x, transportEntryPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_ZULU, true);

	playerColour = playerData[0].colour;
	adaptColors();

	camSetArtifacts({
		"colCC": { tech: "R-Wpn-Flame2" }, // Inferno
		"colFactory": { tech: "R-Vehicle-Engine04" }, // Turbo-Charged Engine
	});

	grantPlayerTech();
	camCompleteRequiredResearch(camAct3StartResearch, MIS_TEAM_ZULU);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetEnemyBases({
		"colMainBase": {
			cleanup: "colBase",
			detectMsg: "COL_BASE",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colLZBase": {
			cleanup: "colLZ",
			detectMsg: "COL_LZ",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colSouthRoadblock": {
			cleanup: "colRoadblock1",
			detectMsg: "COL_ROADBLOCK1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colEastRoadblock": {
			cleanup: "colRoadblock2",
			detectMsg: "COL_ROADBLOCK2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthEastBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNorthEastBase": {
			cleanup: "infBase3",
			detectMsg: "INF_BASE3",
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
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(135)),
			// Light and medium tanks
			templates: [ cTempl.colpodt, cTempl.commcant, cTempl.colflamt, cTempl.commrat, cTempl.colhmght ]
		},
		"colCybFactory": {
			assembly: "colCybAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			templates: [ cTempl.cybhg, cTempl.cybca, cTempl.cybmr ]
		},
		"cScavFactory1": {
			assembly: "cScavAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.bjeep, cTempl.rbjeep, cTempl.kevbloke, cTempl.buscan, cTempl.monhmg]
		},
		"cScavFactory2": {
			assembly: "cScavAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.gbjeep, cTempl.minitruck, cTempl.kevlance, cTempl.sartruck, cTempl.bjeep, cTempl.monmrl ]
		},
		"infFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbuscan]
		},
		"infFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.inflance, cTempl.infciv, cTempl.infbjeep, cTempl.infciv]
		},
		"infFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Light Infested vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbjeep]
		},
	});

	// Set up Collective trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthRoadblock",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck1"),
			structset: camAreaToStructSet("colRoadblock1").filter((struct) => (!camIsScavStruct(struct.stat)))
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colEastRoadblock",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck2"),
			structset: camAreaToStructSet("colRoadblock2").filter((struct) => (!camIsScavStruct(struct.stat)))
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colMainBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			truckDroid: getObject("colTruck3"),
			structset: camAreaToStructSet("colBase")
	});
	if (tweakOptions.rec_timerlessMode || difficulty >= HARD)
	{
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colLZBase",
				respawnDelay: TRUCK_TIME,
				rebuildBase: true,
				template: cTempl.coltruckht,
				structset: camAreaToStructSet("colLZ")
		});
	}

	if (tweakOptions.rec_timerlessMode)
	{
		// If we're in Timerless mode, set up scavenger Cranes instead of adding a timer
		const CRANE_TIME = camChangeOnDiff(camSecondsToMilliseconds(70));
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colSouthRoadblock",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("colRoadblock1").filter((struct) => (camIsScavStruct(struct.stat)))
		});
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colEastRoadblock",
				rebuildBase: true,
				respawnDelay: CRANE_TIME,
				template: cTempl.crane,
				structset: camAreaToStructSet("colRoadblock2").filter((struct) => (camIsScavStruct(struct.stat)))
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
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof", true); // AA Sites
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MortarPit01", "Emplacement-MortarPit02", true); // Mortar Pits
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof"); // AA Sites
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Emplacement-MortarPit01", "Emplacement-MortarPit02"); // Mortar Pits

		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "PillBox4", "PillBoxHPC", true); // Cannon Bunkers
	}

	// 3 Transports on INSANE
	// 4 Transports on HARD
	// 5 Transports on all other difficulties
	const NUM_TRANSPORTS = Math.min(7 - difficulty, 5);
	startedFromMenu = false;

	// Only if starting Act 3 directly from the menu
	if (!getResearch("R-Script-A2Played", CAM_HUMAN_PLAYER).done)
	{
		startedFromMenu = true;
		
		// Subsequent transport droids are randomly chosen from this pool
		const attackPool = [ // Misc. cyborgs and tanks
			cTempl.cybfl, cTempl.scyhc,
			cTempl.plmhpvht, cTempl.plmhmght, cTempl.comatht, cTempl.combbht, cTempl.compodht,
		];

		const artPool = [ // Bombards, MRAs and Super Grenadiers
			cTempl.plmhmortw, cTempl.commraht, cTempl.cybmr, cTempl.scygr,
		];

		const vtolPool = [ // Misc. VTOLs
			cTempl.colbombv, cTempl.colhmgv, cTempl.colatv, cTempl.colhpvv,
		];

		// Store units "offworld", so that the player can bring them in via transport.
		// The chosen units are distributed (roughly) as: 1/2 "attack" units, 1/4 artillery, 1/4 VTOLs
		// Since the player started from the menu, the number of units to store 
		// (AKA, the ones "safely evacuated" from the previous level) is based on difficulty (NUM_TRANSPORTS).
		const NUM_DROIDS = (NUM_TRANSPORTS - 1) * 10; // "- 1" because of the starting transport
		let numAttackDroids = (NUM_DROIDS / 2) + NUM_DROIDS % 4;
		let numArtilleryDroids = Math.floor(NUM_DROIDS / 4);
		let numVtolDroids = Math.floor(NUM_DROIDS / 4);
		for (let i = 0; i < NUM_DROIDS; i++)
		{
			const choice = [];
			let template;
			if (numAttackDroids > 0) choice.push("attack");
			if (numArtilleryDroids > 0) choice.push("artillery");
			if (numVtolDroids > 0) choice.push("vtol");
			switch (camRandFrom(choice))
			{
				case "attack":
				{
					// Choose a random attack template
					template = camRandFrom(attackPool);
					break;
				}
				case "artillery":
				{
					// Choose a random artillery template
					template = camRandFrom(artPool);
					break;
				}
				case "vtol":
				{
					// Choose a random vtol template
					template = camRandFrom(vtolPool);
					break;
				}
			}

			// Create the droid
			camAddDroid(CAM_HUMAN_PLAYER, -1, template);
			// NOTE: We can't give the offworld droid XP here, since the scripting API can't find it.
			// Instead, we'll grant XP when the transport drops it off.
		}
	}

	// If the player has no transport (either destroyed in A2L7 or started from the menu)
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		// Send a transport with a commander and some high-rank droids
		const firstTransportDroids = [ // 1 Command Turret, 2 HMGs, 4 Flamer Cyborgs, 3 HVCs
			cTempl.plmcomht,
			cTempl.plmhmght, cTempl.plmhmght,
			cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl,
			cTempl.plmhpvht, cTempl.plmhpvht, cTempl.plmhpvht,
		];

		camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), firstTransportDroids,
			CAM_REINFORCE_TRANSPORT, {
				entry: transportEntryPos,
				exit: transportEntryPos
			}
		);
	}

	setPower(NUM_TRANSPORTS * 2000, CAM_HUMAN_PLAYER);
	setReinforcementTime(camMinutesToSeconds(1)); // 1 minute

	firstTransport = true;
	allowExtraWaves = false;
	infFactoryOnlyWave = true;

	camAutoReplaceObjectLabel(["colCC", "heliTower"]);
	camEnableFactory("cScavFactory1");
	camEnableFactory("cScavFactory2");

	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(5)));
	queue("startCollectiveTransports", camChangeOnDiff(camMinutesToMilliseconds(10)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(14)));
	sendInfestedReinforcements();
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(45)));
	if (!startedFromMenu)
	{
		// Prevent the player from bringing recycled unit EXP from Act 2
		drainPlayerExp();
	}

	// Give player briefing.
	camPlayVideos({video: "A3L1_BRIEF", type: MISS_MSG});

	// Additional dialogue
	camQueueDialogue([
		{text: "CLAYDE: Commander Bravo.", delay: 30, sound: CAM_RCLICK},
		{text: "CLAYDE: The Infested have spread explosively, even faster than I originally expected.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: I can direct their movements against the Collective using the Lures under my command.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: But you may encounter some... \"runoff\".", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: So be alert, and keep your defenses in check.", delay: 4, sound: CAM_RCLICK},
	]);

	queue("trackTransporter", camSecondsToMilliseconds(0.25));

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camManageGroup(camMakeGroup("infIntroGroup"), CAM_ORDER_ATTACK, {targetPlayer: CAM_THE_COLLECTIVE});

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
}