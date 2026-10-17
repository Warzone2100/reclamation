include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage06", "R-Wpn-Rocket-Damage06", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage06", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Sys-Engineering02", "R-Cyborg-Metals04",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF02",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine05", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade01", "R-Wpn-Howitzer-Damage01",
	"R-Wpn-Howitzer-ROF01", "R-Wpn-Mortar-Acc01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02", 
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];

const MIS_UPLINK = 1;
const MIS_TEAM_DELTA = 3;

const MIS_DELTA_COMMANDER_RANK = "Professional";
const MIS_DELTA_RANK = "Trained";

var luresActive; // Whether the Infested can launch launch large attack waves against the Collective
var infestedOnslaught; // Whether the Infested are currently attacking the Collective in large numbers
var onslaughtIdx;
var numUplinkStructs; // The number of non-wall structures in the final Collective base
var deltaEntranceSide;

var colSensorGroup;
var colCommanderGroup;
var deltaCommander;
var deltaCommandGroup;

var beacon1Placed;
var beacon2Placed;
var beacon3Placed;
var beacon4Placed;
var beacon5Placed;
var beacon6Placed;
var beacon7Placed;

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
	camSetVtolData(CAM_INFESTED, undefined, "heliRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(45)), undefined, ext);
}

// Assign a label to the Collective's sensor droid
function eventDroidBuilt(droid, structure)
{
	if (droid.player === CAM_THE_COLLECTIVE && camDroidMatchesTemplate(droid, cTempl.comsensht))
	{
		addLabel(droid, "colSensor");
	}
}

// Normal infested waves unrelated to the onslaught waves
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
			cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		],
		[ // Light tanks & cyborgs + some scav stuff
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybhg, cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcybmr, cTempl.infcybmr, // Mini-Rocket Cyborgs
			cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infcolhmght, cTempl.infcolhmght, // HMGs
			cTempl.infcolcanht, cTempl.infcolcanht, // Light Cannons
			cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, // Lancers
			cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		],
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
	let bChance = 5;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	// If there's an onslaught occurring, target the player instead of the Collective
	const data = {order: CAM_ORDER_ATTACK, data: {targetPlayer: (infestedOnslaught) ? CAM_HUMAN_PLAYER : CAM_THE_COLLECTIVE}};
	const entrances = ["infEntry6", "infEntry7"];
	// South/southeast entrances
	if (!camBaseIsEliminated("colEastOutpost")) entrances.push("infEntry1", "infEntry2");
	// Canal entrance
	if (!camBaseIsEliminated("colNorthBase")) entrances.push("infEntry3");
	// Southwest entrance
	if (!camBaseIsEliminated("colWestOutpost")) entrances.push("infEntry4");
	// West entrance (only if west base is destroyed)
	if (camBaseIsEliminated("colWestOutpost") && !camBaseIsEliminated("colTrenchOutpost")) entrances.push("infEntry5");
	
	// Spawn from every entrance
	for (const entrance of entrances)
	{
		camSendReinforcement(CAM_INFESTED, getObject(entrance), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance), CAM_REINFORCE_GROUND, data);
	}
}

// Count the number of (non-wall) structures remaining in the final base
// If the number of structures falls below 3/4 of the original amount, disable the large Infested attacks
function eventDestroyed(obj)
{
	if (luresActive && obj.player === CAM_THE_COLLECTIVE)
	{
		// Count the remaining wall-type structures in the uplink base
		const STRUCTS_REMAINING = countUplinkStructs();

		if (STRUCTS_REMAINING < (numUplinkStructs * 3/4))
		{
			// Disable the Infested lures, preventing any further large Infested waves
			// If any Collective trucks are trying to rebuild destroyed outposts, order them to give up
			// NOTE: There aren't any actual lure structures on the map, it's all just pretend

			camQueueDialogue([
				{text: "CLAYDE: Attention Commanders, I'm deactivating the nearby Lures.", delay: 0, sound: CAM_RCLICK},
				{text: "CLAYDE: We can't risk letting the Infested damage the uplink itself.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: You'll both need to finish this on your own.", delay: 3, sound: CAM_RCLICK},
			]);

			luresActive = false;
			removeTimer("startInfestedOnslaught");

			// Disable trucks
			if (camBaseIsEliminated("colEastOutpost")) camDisableTruck("colEastOutpost", true);
			if (camBaseIsEliminated("colWestOutpost")) camDisableTruck("colWestOutpost", true);
			if (camBaseIsEliminated("colNorthBase")) camDisableTruck("colNorthBase", true);
			if (camBaseIsEliminated("colTrenchOutpost")) camDisableTruck("colTrenchOutpost", true);
			if (camBaseIsEliminated("colLZBase")) camDisableTruck("colLZBase", true);

			// If there's currently an onslaught, end it immediately
			if (infestedOnslaught)
			{
				endInfestedOnslaught();
			}

			// Make sure all Collective factories are enabled
			camEnableFactory("colFactory2");
			// camEnableFactory("colFactory3");
			camEnableFactory("colCybFactory2");
			camEnableFactory("colCybFactory3");
		}
	}
}

// Disable Collective trucks if these bases are destroyed after the lures are disabled
function camEnemyBaseEliminated_colEastOutpost()
{
	if (!luresActive) camDisableTruck("colEastOutpost", true);
}

function camEnemyBaseEliminated_colWestOutpost()
{
	if (!luresActive) camDisableTruck("colWestOutpost", true);
}

function camEnemyBaseEliminated_colNorthBase()
{
	if (!luresActive) camDisableTruck("colNorthBase", true);
}

function camEnemyBaseEliminated_colTrenchOutpost()
{
	if (!luresActive) camDisableTruck("colTrenchOutpost", true);
}

function camEnemyBaseEliminated_colLZBaseOutpost()
{
	if (!luresActive) camDisableTruck("colLZBaseOutpost", true);
}

function startInfestedOnslaught()
{
	queue("endInfestedOnslaught", camSecondsToMilliseconds(90));
	infestedOnslaught = true;
	onslaughtIdx++;
	setTimer("spawnOnslaughtWaves", camSecondsToMilliseconds(15));
	onslaughtDialogue();

	// Hunker down Collective groups
	camManageGroup(colCommanderGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("colCommandPos"),
		radius: 12,
		repair: 50,
		removable: false
	});
	camManageGroup(colSensorGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("colArtilleryPos"),
		radius: 12,
		repair: 40
	});

	// South entrance (disabled when the east base falls)
	if (!camBaseIsEliminated("colEastOutpost"))
	{
		beacon1Placed = true;
		hackAddMessage("INF_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	// Southeast entrance (disabled when the east base falls)
	if (!camBaseIsEliminated("colEastOutpost"))
	{
		beacon2Placed = true;
		hackAddMessage("INF_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	// Southwest entrance (disabled when the west base falls)
	if (!camBaseIsEliminated("colWestOutpost"))
	{
		beacon4Placed = true;
		hackAddMessage("INF_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	if (onslaughtIdx >= 2)
	{
		// Canal entrance (disabled when the north base falls)
		if (!camBaseIsEliminated("colNorthBase"))
		{
			beacon3Placed = true;
			hackAddMessage("INF_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
		}

		// West entrance (disabled when the north base falls)
		if (!camBaseIsEliminated("colNorthBase"))
		{
			beacon5Placed = true;
			hackAddMessage("INF_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);
		}
	}
	if (onslaughtIdx >= 3)
	{
		beacon6Placed = true;
		hackAddMessage("INF_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		beacon7Placed = true;
		hackAddMessage("INF_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	// TODO: Adjust fog + lighting?
}

function endInfestedOnslaught()
{
	if (!infestedOnslaught)
	{
		return;
	}

	infestedOnslaught = false;
	removeTimer("spawnOnslaughtWaves");

	removeEntryBeacons();
	onslaughtEndDialogue();

	// Order Collective groups to resume attacking the player
	if (onslaughtIdx >= 3)
	{
		// Commander only becomes aggressive after the third onslaught
		camManageGroup(colCommanderGroup, CAM_ORDER_ATTACK, {
			repair: 50,
			targetPlayer: CAM_HUMAN_PLAYER,
			removable: false
		});
	}
	camManageGroup(colSensorGroup, CAM_ORDER_ATTACK, {
		repair: 40,
		targetPlayer: CAM_HUMAN_PLAYER
	});

	// Enable more factories
	if (onslaughtIdx === 1)
	{
		// camEnableFactory("colFactory3");
		camEnableFactory("colCybFactory2");
	}
	else if (onslaughtIdx === 2)
	{
		camEnableFactory("colFactory2");
		camEnableFactory("colCybFactory3");
	}

	// TODO: Adjust fog + lighting?
}

// Play dialogue informing the player of the incoming Infested
function onslaughtDialogue()
{
	if (!luresActive)
	{
		return;
	}

	switch (onslaughtIdx)
	{
	case 1:
		camQueueDialogue([
			{text: "--- ANOMALOUS SIGNAL DETECTED ---", delay: 0, sound: cam_sounds.beacon},
			{text: "CLAYDE: Commander Bravo, I've activated the Lures.", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: The Infested will begin attacking the Collective soon.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: For now, hold your position and let the Infested fight for us...", delay: 4, sound: CAM_RCLICK},
		]);
		break;
	case 2:
		camQueueDialogue([
			{text: "CLAYDE: Commander Bravo, the Infested will attack again soon.", delay: 0, sound: CAM_RCLICK},
			{text: "CLAYDE: You should pull your forces back and be ready to defend.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Let the Infested keep the Collective occupied.", delay: 3, sound: CAM_RCLICK},
		]);
		break;
	case 3:
		camQueueDialogue([
			{text: "CLAYDE: The Infested are amassing once again, Commander Bravo.", delay: 0, sound: CAM_RCLICK},
			{text: "CLAYDE: Pull back and hunker down while they assault the Collective.", delay: 3, sound: CAM_RCLICK},
		]);
		break;
	default: // Repeat after the 3rd onslaught
		camQueueDialogue([
			{text: "CLAYDE: Another Infested onslaught is approaching, Commander Bravo.", delay: 0, sound: CAM_RCLICK},
		]);
		break;
	}
}

// Play dialogue informing the player that the Infested onslaught has ended for now
function onslaughtEndDialogue()
{
	if (!luresActive)
	{
		return;
	}

	switch (onslaughtIdx)
	{
	case 1:
		camQueueDialogue([
			{text: "CLAYDE: Commander Bravo, the Infested attacks are subsiding.", delay: 0, sound: CAM_RCLICK},
			{text: "CLAYDE: If you're ready, consider attacking the Collective's bases soon.", delay: 3, sound: CAM_RCLICK},
		]);
		break;
	case 2:
		camQueueDialogue([
			{text: "CLAYDE: Commander Bravo, the Infested onslaught is dissipating.", delay: 0, sound: CAM_RCLICK},
			{text: "CLAYDE: Now's your chance to attack the Collective,", delay: 3, sound: CAM_RCLICK},
			{text: "while they're busy dealing with the stragglers.", delay: 0},
		]);
		break;
	case 3:
		camQueueDialogue([
			{text: "CLAYDE: The large attack waves are passing, Commander Bravo.", delay: 0, sound: CAM_RCLICK},
			{text: "CLAYDE: Move out and assault the Collective before", delay: 3, sound: CAM_RCLICK},
			{text: "they can repair any damage they've sustained.", delay: 0},
		]);
		break;
	default: // Repeat after the 3rd onslaught
		camQueueDialogue([
			{text: "CLAYDE: The Infested onslaught is passing.", delay: 0, sound: CAM_RCLICK},
		]);
		break;
	}
}

function removeEntryBeacons()
{
	if (beacon1Placed) 
	{
		hackRemoveMessage("INF_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
		beacon1Placed = false;
	}
	if (beacon2Placed) 
	{
		hackRemoveMessage("INF_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
		beacon2Placed = false;
	}
	if (beacon3Placed) 
	{
		hackRemoveMessage("INF_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
		beacon3Placed = false;
	}
	if (beacon4Placed) 
	{
		hackRemoveMessage("INF_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
		beacon4Placed = false;
	}
	if (beacon5Placed) 
	{
		hackRemoveMessage("INF_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);
		beacon5Placed = false;
	}
	if (beacon6Placed) 
	{
		hackRemoveMessage("INF_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		beacon6Placed = false;
	}
	if (beacon7Placed) 
	{
		hackRemoveMessage("INF_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
		beacon7Placed = false;
	}
}

// Spawn large waves targeting the Collective's bases
function spawnOnslaughtWaves()
{
	const entrances = [];

	// South entrance (disabled when the east base falls)
	if (!camBaseIsEliminated("colEastOutpost"))
	{
		entrances.push("infEntry1");
	}

	// Southeast entrance (disabled when the east base falls)
	if (!camBaseIsEliminated("colEastOutpost"))
	{
		entrances.push("infEntry2");
	}

	// Southwest entrance (disabled when the west base falls)
	if (!camBaseIsEliminated("colWestOutpost"))
	{
		entrances.push("infEntry4");
	}

	if (onslaughtIdx >= 2)
	{
		// Canal entrance (disabled when the north base falls)
		if (!camBaseIsEliminated("colNorthBase"))
		{
			entrances.push("infEntry3");
		}

		// West entrance (disabled when the north base falls)
		if (!camBaseIsEliminated("colNorthBase"))
		{
			entrances.push("infEntry5");
		}
	}
	if (onslaughtIdx >= 3)
	{
		// These entrances never stop...
		entrances.push("infEntry6"); // East entrance
		entrances.push("infEntry7"); // West trench entrance
	}

	// BIG and SCARY waves!!!
	const CORE_SIZE = 16;
	const FODDER_SIZE = 24;
	const B_CHANCE = 10;

	const coreTemplates = [ // Waves can choose from a selection of templates
		[ // Collective tanks + Stingers + Boom Ticks
			cTempl.boomtick, // Boom Ticks
			cTempl.infcohhcant, // Heavy Cannons
			cTempl.infcommcant, cTempl.infcommcant, cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, cTempl.infcomatt, // Lancers
			cTempl.infcolpodt, cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.infbloke, cTempl.infbloke, // Lances
			cTempl.infkevbloke, cTempl.infkevbloke,
		],
		[ // Cyborgs + Trucks + Vile Stingers
			cTempl.vilestinger, // Vile Stingers
			cTempl.infcomtruckt, // Trucks
			cTempl.infcybhg, cTempl.infcybhg, cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybmr, cTempl.infcybmr, // Mini-Rocket Cyborgs
			cTempl.infcybla, cTempl.infcybla, // Lancers
			cTempl.infscymc, // Super Heavy Gunners
			cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.infbloke, cTempl.infbloke, // Lances
			cTempl.infkevbloke, cTempl.infkevbloke,
		],
		[ // Scavenger stuff + Bashers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.infmoncan, cTempl.infmoncan, // Bus Tanks
			cTempl.infmonhmg, cTempl.infmonhmg,
			cTempl.infmonmrl,
			cTempl.infmonlan,
			cTempl.infflatmrl, cTempl.infflatmrl, // Flatbeds
			cTempl.infflatat,
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.infminitruck, cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.inffiretruck, // Fire Trucks
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.infbloke, // Lances
			cTempl.infkevbloke,
		],
	];

	for (const entrance of entrances)
	{
		const data = {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_THE_COLLECTIVE}};
		// Extra position data for specific entrances
		if (entrance === "infEntry1") data.data.pos = camMakePos("colBase1");
		if (entrance === "infEntry6" && !camBaseIsEliminated("colNorthBase")) data.data.pos = camMakePos("colBase3");

		// Send them in!
		camSendReinforcement(CAM_INFESTED, getObject(entrance), 
			camRandInfTemplates(camRandFrom(coreTemplates), CORE_SIZE, FODDER_SIZE, B_CHANCE), CAM_REINFORCE_GROUND, data);
	}
}

function countUplinkStructs()
{
	return enumArea("colBase5", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === STRUCTURE && obj.stattype !== WALL && obj.stattype !== GATE
	)).length;
}

function checkDeltaEntranceStructs()
{
	if (luresActive)
	{
		return;
	}

	const ENTRANCE1_STRUCTS = enumArea("deltaEntranceStructs1", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === STRUCTURE && obj.stattype !== WALL
	)).length;
	const ENTRANCE2_STRUCTS = enumArea("deltaEntranceStructs2", CAM_THE_COLLECTIVE, false).filter((obj) => (
		obj.type === STRUCTURE && obj.stattype !== WALL
	)).length;

	if (ENTRANCE1_STRUCTS === 0)
	{
		deltaEntranceSide = "LEFT";
	}
	else if (ENTRANCE2_STRUCTS === 0)
	{
		deltaEntranceSide = "RIGHT";
	}

	if (camDef(deltaEntranceSide))
	{
		// If one of the entrances is clear, stop checking and start spawning
		const entryPos = (deltaEntranceSide === "LEFT") ? camMakePos("deltaEntry1") : camMakePos("deltaEntry2");
		// Set up Delta's uplink attack groups as well
		deltaCommander = camMakeRefillableGroup(
			undefined, {
				templates: [cTempl.plmcomht]
			}, CAM_ORDER_COMPROMISE, {
				pos: camMakePos("colBase5"),
				radius: 20,
				repair: 50,
				repairPos: entryPos,
				targetPlayer: CAM_THE_COLLECTIVE
		});
		deltaCommandGroup = camMakeRefillableGroup(
			undefined, {
				templates: [ 
					cTempl.plmacanht, cTempl.plmacanht, cTempl.plmacanht, cTempl.plmacanht, cTempl.plmacanht, cTempl.plmacanht, // 6 Assault Cannons
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 4 Super Auto Cannon Cyborgs
					cTempl.plmrepht, cTempl.plmrepht, // 2 Repair Turrets
					cTempl.plmhaaht, cTempl.plmhaaht, // 2 Cyclones
				],
			}, CAM_ORDER_FOLLOW, {
				leader: "deltaCommander",
				repair: 50,
				repairPos: entryPos,
				suborder: CAM_ORDER_DEFEND,
				data: {
					pos: entryPos,
					radius: 20
				}
		});

		removeTimer("checkDeltaEntranceStructs");
		// NOTE: This gets SLOWER on higher difficulties
		setTimer("sendDeltaReinforcements", camChangeOnDiff(camMinutesToMilliseconds(2.5), true));

		// Tell the player that Delta is approaching
		camQueueDialogue([
			{text: "DELTA: Bravo, this is Commander Delta.", delay: 0, sound: CAM_RCLICK},
			{text: "DELTA: We're approaching the uplink from the northern side.", delay: 3, sound: CAM_RCLICK},
			{text: "DELTA: We'll be able to reinforce you in a moment...", delay: 3, sound: CAM_RCLICK},
		]);
	}
}

// Send in allied forces if the player has cleared enough of the defensive structures
function sendDeltaReinforcements()
{
	let entryArea;

	if (deltaEntranceSide === "LEFT")
	{
		// Send in Delta units from the west entrance
		entryArea = getObject("deltaEntry1");
	}
	else // Assume (deltaEntranceSide === "RIGHT")
	{
		// Send in Delta units from the east entrance
		entryArea = getObject("deltaEntry2");
	}

	const deltaDroids = camGetRefillableGroupTemplates([deltaCommander, deltaCommandGroup]);

	if (deltaDroids.length == 0)
	{
		return; // Don't send anything if the groups are already full
	}

	const droids = enumGroup(camSendReinforcement(MIS_TEAM_DELTA, entryArea, deltaDroids, CAM_REINFORCE_GROUND));

	for (const droid of droids)
	{
		// Make sure the reinforcements have the appropriate rank
		if (droid.droidType === DROID_COMMAND)
		{
			camSetDroidRank(droid, MIS_DELTA_COMMANDER_RANK);
			addLabel(droid, "deltaCommander"); // Also label the command droid
		}
		else
		{
			camSetDroidRank(droid, MIS_DELTA_RANK);
		}
	}

	camAssignToRefillableGroups(droids, [deltaCommander, deltaCommandGroup]);
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
	const TRANSPORT_SIZE = (difficulty <= MEDIUM) ? 8 : 10;
	const droidPool = [
		cTempl.cominft, // Inferno
		cTempl.comagt, // Assault Gun
		cTempl.comacant, // Assault Cannon
		cTempl.cybth, // Thermite Flamer
		cTempl.cybag, // Assault Gunner
		cTempl.scygr, // Super Grenadier
		cTempl.scyac, // Super Auto Cannon
	];
	const droids = [];
	for (let i = 0; i < TRANSPORT_SIZE; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	// Send the transport!
	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: {x: 2, y: 2},
			exit: {x: 2, y: 2},
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 20
			}
		}
	);
}

function removeUplinkBlip()
{
	playSound(cam_sounds.objective.primObjectiveCompleted);

	hackRemoveMessage("UPLINK_BEACON", PROX_MSG, CAM_HUMAN_PLAYER);
}

function allowSensorRebuilding()
{
	return luresActive;
}

// Returns true if the final Collective base is destroyed
// Returns false if the Uplink itself is destroyed
function uplinkSecure()
{
	// Fail if Uplink is destroyed
	if (enumStruct(MIS_UPLINK).length == 0)
	{
		return false;
	}

	if (camBaseIsEliminated("colUplinkBase"))
	{
		camCallOnce("removeUplinkBlip");
		return true;
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz
	const transportEntryPos = camMakePos("transportEntryPos");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A3L8", {
		message: "RET_LZ",
		reinforcements: camMinutesToSeconds(3),
		area: "compromiseZone",
		callback: "uplinkSecure",
		enableLastAttack: false,
		ignoreInfestedUnits: true
	});
	camSetExtraObjectiveMessage(_("Secure the satellite uplink station"));

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_collectiveResearch, MIS_UPLINK);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(camA3L7AllyResearch, MIS_TEAM_DELTA);

	setAlliance(MIS_UPLINK, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_UPLINK, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_UPLINK, CAM_INFESTED, true);
	setAlliance(MIS_UPLINK, MIS_TEAM_DELTA, true);
	setAlliance(MIS_TEAM_DELTA, CAM_HUMAN_PLAYER, true);

	camSetObjectVision(MIS_TEAM_DELTA);

	changePlayerColour(MIS_UPLINK, 10); // Change the Uplink to white
	changePlayerColour(MIS_TEAM_DELTA, (playerData[0].colour !== 1) ? 1 : 8); // Delta to orange or yellow

	camSetArtifacts({
		"colResearch": { tech: "R-Wpn-MG-ROF03" }, // Hyper Fire Chaingun Upgrade
		"colFactory1": { tech: "R-Wpn-Rocket07-Tank-Killer" }, // Tank Killer
		"colFactory2": { tech: "R-Wpn-Flamer-Damage05" }, // Superhot Flamer Gel Mk2
		"colAAEmp": { tech: "R-Wpn-AAGun-ROF02" }, // AA Ammunition Hopper Mk2
		// "colPower": { tech: "R-Struc-Power-Upgrade02" }, // Gas Turbine Generator Mk2
	});

	camSetEnemyBases({
		"colLZBase": {
			cleanup: "colLzStructs",
			detectMsg: "COL_LZBASE",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colEastOutpost": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colWestOutpost": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colNorthBase": {
			cleanup: "colBase3",
			detectMsg: "COL_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colTrenchOutpost": {
			cleanup: "colBase4",
			detectMsg: "COL_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colUplinkBase": {
			cleanup: "colBase5",
			detectMsg: "COL_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_THE_COLLECTIVE
		},
	});

	camSetFactories({
		"colFactory1": {
			assembly: "colAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(90)),
			// Medium tanks
			templates: [ cTempl.comatt, cTempl.cominft, cTempl.comagt, cTempl.commrat, cTempl.cominft ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(145)),
			// Heavy tanks
			templates: [ cTempl.cohhcant, cTempl.cohacant, cTempl.cohhrat, cTempl.cohhcant, cTempl.cohbbt ]
		},
		// "colFactory3": {
		// 	assembly: "colAssembly3",
		// 	order: CAM_ORDER_ATTACK,
		// 	data: {
		// 		targetPlayer: CAM_HUMAN_PLAYER,
		// 		repair: 35
		// 	},
		// 	groupSize: 4,
		// 	throttle: camChangeOnDiff(camSecondsToMilliseconds(95)),
		// 	// Medium and heavy tanks
		// 	templates: [ cTempl.cohacant, cTempl.comhaat, cTempl.comacant, cTempl.comhatt, cTempl.comacant, cTempl.comhatt ]
		// },
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(55)),
			// Assault Gunners + Thermite Flamers
			templates: [ cTempl.cybag, cTempl.cybth ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(95)),
			// Super Cannons and Grenadiers
			templates: [ cTempl.scyac, cTempl.scygr ]
		},
		"colCybFactory3": {
			assembly: "colCybAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			// Assault Gunners + Rocket Cyborgs
			templates: [ cTempl.cybag, cTempl.scyhr, cTempl.cybag, cTempl.scytk ]
		},
		"colVtolFactory": {
			assembly: "colVtolAssembly",
			order: CAM_ORDER_ATTACK,
			groupSize: 2,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			templates: [ cTempl.colatv, cTempl.colatv, cTempl.comhbombv, cTempl.colphosv ]
		},
	});

	hackAddMessage("UPLINK_BEACON", PROX_MSG, CAM_HUMAN_PLAYER);

	luresActive = true;
	infestedOnslaught = false;
	onslaughtIdx = 0;
	numUplinkStructs = countUplinkStructs();
	deltaEntranceSide = undefined;

	// Manage Collective VTOL groups...
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Assault Guns, 2 Phosphor Bombs
				cTempl.colagv, cTempl.colphosv,
				cTempl.colagv, cTempl.colphosv,
			],
			factories: ["colVtolFactory"],
			obj: "colVtolTower1", // Southeast tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower1",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 HEAP Bombs
				cTempl.comhatv, cTempl.comhbombv,
				cTempl.comhatv, cTempl.comhbombv,
			],
			factories: ["colVtolFactory"],
			obj: "colVtolTower2", // North outpost tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower2",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Assault Guns, 2 Phosphor Bombs
				cTempl.colagv, cTempl.colphosv,
				cTempl.colagv, cTempl.colphosv,
			],
			factories: ["colVtolFactory"],
			obj: "colVtolTower3", // LZ tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolTower3",
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
			factories: ["colVtolFactory"],
			obj: "colVtolTower4", // Trench outpost tower
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
			factories: ["colVtolFactory"],
			obj: "colVtolCBTower", // Howitzer VTOL CB tower
		}, CAM_ORDER_FOLLOW, {
			leader: "colVtolCBTower",
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});

	// Rank and assign the Collective commander...
	// Set the commander's rank (ranges from Regular to Veteran)
	const COMMANDER_RANK = (difficulty <= EASY) ? 3 : (difficulty + 1);
	camSetDroidRank(getObject("colCommander"), COMMANDER_RANK);
	colCommanderGroup = camMakeGroup("colCommander");
	camManageGroup(colCommanderGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("colCommandPos"),
		radius: 12,
		repair: 50
	});
	camMakeRefillableGroup(
		camMakeGroup("colCommandGroup"), {
			templates: [
				cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
				cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
				cTempl.cominft, cTempl.cominft, // 2 Infernos
				cTempl.scyac, cTempl.scyac, // 2 Super Auto-Cannons
				cTempl.scytk, cTempl.scytk, // 2 Super Tank Killers
				cTempl.cohraat, // 1 Whirlwind
				cTempl.comrept, // 1 Repair Turret
				cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons (Hard+)
				cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters (Insane)
			],
			globalFill: true,
			player: CAM_THE_COLLECTIVE,
			obj: "colCommander" // Stop refilling this group when the commander dies
		}, CAM_ORDER_FOLLOW, {
			leader: "colCommander",
			repair: 50,
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
	});

	// Also make refillable mortar/sensor groups
	colSensorGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.comsensht, // 1 Sensor
			],
			callback: "allowSensorRebuilding", // Stop rebuilding once the lures are disabled
			factories: ["colFactory2"]
		}, CAM_ORDER_ATTACK, {
			repair: 40,
			targetPlayer: CAM_HUMAN_PLAYER
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 4 Bombards
				cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
			],
			factories: ["colFactory2"],
			obj: "colSensor"
		}, CAM_ORDER_FOLLOW, {
			leader: "colSensor",
			repair: 60,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("colArtilleryPos")
			}
	});

	// Manage trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 45 : 90));
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("colLzStructs"),
			truckDroid: getObject("colTruckLz")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colEastOutpost",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("colBase1"),
			truckDroid: getObject("colTruck1")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colWestOutpost",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("colBase2"),
			truckDroid: getObject("colTruck2")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("colBase3"),
			truckDroid: getObject("colTruck3")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colTrenchOutpost",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("colBase4"),
			truckDroid: getObject("colTruck4")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colUplinkBase",
			respawnDelay: TRUCK_TIME,
			structset: camAreaToStructSet("colBase5"),
			truckDroid: getObject("colTruck5")
	});
	camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colUplinkBase",
			respawnDelay: TRUCK_TIME,
			structset: camAreaToStructSet("colBase5"),
			truckDroid: getObject("colTruck6")
	});

	if (tweakOptions.rec_timerlessMode && difficulty >= HARD)
	{
		// Add another uplink base truck
		camManageTrucks(
			CAM_THE_COLLECTIVE, {
				label: "colUplinkBase",
				respawnDelay: TRUCK_TIME * 2,
				structset: camAreaToStructSet("colBase5"),
				template: cTempl.comtruckt
		});

		if (difficulty === INSANE)
		{
			// Add another north base truck
			camManageTrucks(
				CAM_THE_COLLECTIVE, {
					label: "colNorthBase",
					respawnDelay: TRUCK_TIME,
					rebuildBase: tweakOptions.rec_timerlessMode,
					structset: camAreaToStructSet("colBase3"),
					template: cTempl.comtruckt
			});
		}
	}

	// Upgrade Collective structures on higher difficulties
	if (difficulty == HARD)
	{
		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower03", "Wall-VulcanCan", true); // Cannon Hardpoints
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof", true); // AA Sites
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadMg1", "AASite-QuadBof"); // AA Sites

		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "WallTower03", "Wall-VulcanCan", true); // Cannon Hardpoints
	}

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camAutoReplaceObjectLabel(["colVtolTower1", "colVtolTower2", "colVtolTower3", "colVtolTower4", "colVtolCBTower"]);

	camEnableFactory("colVtolFactory");
	camEnableFactory("colCybFactory1");
	camEnableFactory("colFactory1");

	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(2)));
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(75)));
	setTimer("startInfestedOnslaught", camMinutesToMilliseconds(6));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(8)));
	setTimer("checkDeltaEntranceStructs", camSecondsToMilliseconds(30));

	camSetSkyType(CAM_SKY_NIGHT);
	// Give the fog a dark purple hue
	camSetFog(32, 12, 64);
	// Add a purple-blue tint
	camSetSunIntensity(.45, .4, .45);
}