include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_TEAM_CHARLIE = 1;

var firstTransport; // Whether the player's first transport has landed
var startedFromMenu;
var playerColour;
var onslaughtIdx;
var infFactoryOnlyWave; // If true, ONLY spawn Infested units from entrances "bound" to a factory

const mis_infestedResearch = [
	"R-Wpn-MG-Damage05", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage05", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02", 
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];

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

//Gives starting tech and research.
function grantPlayerTech()
{
	for (let x = 0, l = camBasicStructs.length; x < l; ++x)
	{
		enableStructure(camBasicStructs[x], CAM_HUMAN_PLAYER);
	}

	camCompleteRequiredResearch(camAct4StartResearch, CAM_HUMAN_PLAYER);
}

// Bump the rank of the first batch of transport droids (if starting from the menu).
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		if (firstTransport)
		{			
			// Transfer all Charlie units/structures to the player
			const objs = enumDroid(MIS_TEAM_CHARLIE).concat(enumStruct(MIS_TEAM_CHARLIE));
			for (const obj of objs)
			{
				let rank = "Veteran";
				if (obj.type === DROID && obj.droidType === DROID_COMMAND)
				{
					rank = "Special";
				}
				camSetDroidRank(obj, rank);
			}
			camEnsureDonateObject(objs, CAM_HUMAN_PLAYER);

			queue("setVictory", camSecondsToMilliseconds(1));
			camCallOnce("infestedAmbush");
		}

		if (startedFromMenu)
		{
			camSetDroidRank(enumCargo(transport), (firstTransport) ? "Special" : "Veteran");
		}

		firstTransport = false;
	}
}

// Set victory data
// Called on a delay to avoid failing the player if Charlie's units aren't transferred fast enough
function setVictory()
{
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A4L2S", {
		ignoreInfestedUnits: true // The Infested never stop spawning; their units don't need to be wiped out to win
	});
}

function infestedAmbush()
{
	// Dialogue about infestation
	camQueueDialogue([
		{text: "CHARLIE: Lieutenant! We're picking up movement all around us!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Bravo's transport must have riled them up!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commander Bravo, make sure this site stays secure!", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: This whole place is infested, but it's the safest place away from Clayde for now.", delay: 3, sound: CAM_RCLICK},
		// Delay...
		{text: "CHARLIE: Lieutenant, we've uhh...", delay: 14, sound: CAM_RCLICK},
		{text: "CHARLIE: We've got a problem.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: What is it, Charlie?", delay: 2, sound: CAM_RCLICK, callback: "baseReveal"}, // Reveal the infested bases
		// Delay...
		{text: "LIEUTENANT: Oh.", delay: 12, sound: CAM_RCLICK},
		{text: "CHARLIE: Bravo, you've gotta clear out the area!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: They're just gonna keep coming until we can get some breathing room!", delay: 3, sound: CAM_RCLICK},
	]);

	// Move these groups against the player's base
	camManageGroup(camMakeGroup("northAmbushGroup"), CAM_ORDER_ATTACK, {simplified: true});
	camManageGroup(camMakeGroup("westAmbushGroup"), CAM_ORDER_ATTACK, {simplified: true});
	camManageGroup(camMakeGroup("seAmbushGroup"), CAM_ORDER_ATTACK, {simplified: true});
	camManageGroup(camMakeGroup("swAmbushGroup"), CAM_ORDER_ATTACK, {simplified: true});
}

// Dramatically reveal all the bases on the map
function baseReveal()
{
	const labels = [
		"infFactoryBase",
		"infNWMiniBase",
		"infNWUnMiniBase",
		"infNWRidgeBase",
		"infNWCraterBase",
		"infNorthPlateauBase",
		"infOverlookBase",
		"infNECanyonBase",
		"infNEMiniRidgeBase",
		"infNENondescriptBase",
		"infNECornerBase",
		"infNECraterBase",
		"infEastBase",
		"infEastRidgeBase",
		"infEastEdgeBase",
		"infSECraterBase",
		"infSECanalBase",
		"infSEOtherCraterBase",
		"infSERunningOutOfNamesBase",
		"infSouthRidgeBase",
		"infSouthCanalRuinsBase",
		"infSouthIsAnyoneEverGoingToReadTheseBase",
		"infSWCornerBase",
		"infSWCanalBase",
		"infSWCraterBase",
		"infWestBase",
		"infWestCanyonBase",
		"infWestCraterBase",
		"infNWRoadBase",
	];

	let delay = camSecondsToMilliseconds(3);
	for (const label of labels)
	{
		queue("camDetectEnemyBase", delay, label);
		delay += camSecondsToMilliseconds(0.1);
	}
}

// Enable the factories closest to the center
// Also starts sending some helicopters
function activateFirstFactories()
{
	camEnableFactory("infCybFactory3");
	camEnableFactory("infFactory2");
	camEnableFactory("infFactory3");
	camEnableFactory("infHvyFactory3");
	camEnableFactory("infFactory4");
	camEnableFactory("infFactory5");
	camEnableFactory("infFactory6");
	camEnableFactory("infFactory7");
	camEnableFactory("infFactory9");
	camEnableFactory("infFactory11");
	camEnableFactory("infCybFactory4");
	camEnableFactory("infFactory12");
	camEnableFactory("infCybFactory4");
	camEnableFactory("infFactory13");
	camEnableFactory("infFactory14");
	camEnableFactory("infFactory17");
	camEnableFactory("infFactory19");
	camEnableFactory("infFactory20");
	camEnableFactory("infFactory21");
	camEnableFactory("infFactory22");
	camEnableFactory("infFactory23");
	camEnableFactory("infFactory24");
	camEnableFactory("infFactory25");

	heliAttack();
}

// Enable the remaining factories
// Also send some more helicopters
function activateAllFactories()
{
	camEnableFactory("infHvyFactory1");
	camEnableFactory("infHvyFactory2");
	camEnableFactory("infCybFactory1");
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory8");
	camEnableFactory("infFactory10");
	camEnableFactory("infHvyFactory4");
	camEnableFactory("infFactory15");
	camEnableFactory("infFactory16");
	camEnableFactory("infFactory18");
	camEnableFactory("infHvyFactory5");
	camEnableFactory("infCybFactory5");

	heliAttack();
}

// All infested groups pull from the same droid pool
function infestedGroupDroids(onslaught)
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
			cTempl.infmonlan,
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
			cTempl.infcybla, cTempl.infcybla, // Lancers
			cTempl.infscymc, // Super Heavy Gunners
			cTempl.infscyhr, // Super Heavy Rockets
			cTempl.infcybfl, // Flamers
			cTempl.infcolpodt, cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infcolaaht, // Hurricanes
			cTempl.infcommcant, cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, // Lancers
			cTempl.infcohhcant, // Heavy Cannon
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		].concat((difficulty >= MEDIUM) ? cTempl.infcohhrat : []), // Add a HRA tank
		[ // Bashers, Stingers, and Infantry
			cTempl.vilestinger, // Vile Stingers
			cTempl.infcomtruckt, // Infested Trucks
			cTempl.infcomtruckht,
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		].concat((difficulty >= HARD) ? cTempl.infcomhaat : []), // Add a Cyclone tank
	];
	const CORE_SIZE = (camDef(onslaught) && onslaught) ? 10 : 4; // Onslaught waves are much larger!
	const FODDER_SIZE = (camDef(onslaught) && onslaught) ? 18 : 14;
	const B_CHANCE = (difficulty * 5) + 5; // Ranges from 5% to 25%

	return camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, B_CHANCE);
}

function sendInfestedReinforcements()
{	
	const entrances = [];

	if (infFactoryOnlyWave)
	{
		// Behold the ominous if-statement obelisk!
		if (getObject("infHvyFactory1") !== null) entrances.push("infEntry1");
		if (getObject("infFactory1") !== null) entrances.push("infEntry2");
		if (getObject("infFactory2") !== null) entrances.push("infEntry3");
		if (getObject("infHvyFactory3") !== null) entrances.push("infEntry4");
		if (getObject("infFactory4") !== null) entrances.push("infEntry5");
		if (getObject("infFactory6") !== null) entrances.push("infEntry6");
		if (getObject("infFactory8") !== null) entrances.push("infEntry7");
		if (getObject("infFactory7") !== null) entrances.push("infEntry8");
		if (getObject("infFactory9") !== null) entrances.push("infEntry9");
		if (getObject("infFactory10") !== null) entrances.push("infEntry10");
		if (getObject("infFactory10") !== null) entrances.push("infEntry11");
		if (getObject("infHvyFactory4") !== null) entrances.push("infEntry12");
		if (getObject("infHvyFactory4") !== null) entrances.push("infEntry13");
		if (getObject("infFactory14") !== null) entrances.push("infEntry14");
		if (getObject("infFactory14") !== null) entrances.push("infEntry15");
		if (getObject("infFactory15") !== null) entrances.push("infEntry16");
		if (getObject("infFactory16") !== null) entrances.push("infEntry17");
		if (getObject("infFactory18") !== null) entrances.push("infEntry18");
		if (getObject("infHvyFactory5") !== null) entrances.push("infEntry19");
		if (getObject("infCybFactory5") !== null) entrances.push("infEntry20");
		if (getObject("infFactory19") !== null) entrances.push("infEntry21");
		if (getObject("infFactory22") !== null) entrances.push("infEntry22");
		if (getObject("infFactory23") !== null) entrances.push("infEntry23");
		if (getObject("infFactory24") !== null) entrances.push("infEntry24");
		if (getObject("infHvyFactory2") !== null) entrances.push("infEntry25");
		if (getObject("infFactory19") !== null) entrances.push("infEntry26");
	}
	else // Spawn from anywhere
	{
		entrances.push(
			"infEntry1", "infEntry2", "infEntry3",
			"infEntry5", "infEntry6", "infEntry8",
			"infEntry10", "infEntry13", "infEntry15",
			"infEntry17", "infEntry18", "infEntry21",
			"infEntry22", "infEntry26"
		);
	}

	const NUM_GROUPS = difficulty + 2;
	const NUM_ENTRANCES = entrances.length;
	for (let i = 0; i < (Math.min(NUM_ENTRANCES, NUM_GROUPS)); i++)
	{
		// Spawn units at a random entrance
		const INDEX = camRand(entrances.length);
		camSendReinforcement(CAM_INFESTED, getObject(entrances[INDEX]), infestedGroupDroids(), CAM_REINFORCE_GROUND);
		entrances.splice(INDEX, 1);
	}
	
	infFactoryOnlyWave = !infFactoryOnlyWave;
}

function startInfestedOnslaught()
{
	if (!camDef(onslaughtIdx))
	{
		onslaughtIdx = 0;
		heliAttack(); // Also send MORE helicopters
	}
	else
	{
		onslaughtIdx++;
	}
	
	// Spawn three large waves of Infested groups...
	spawnOnslaughtWaves();
	queue("spawnOnslaughtWaves", camChangeOnDiff(camSecondsToMilliseconds(15)));
	queue("spawnOnslaughtWaves", camChangeOnDiff(camSecondsToMilliseconds(30)));
}

// Get a list of all the entrances that units can enter from
// Direction is a number that corresponds to a cardinal direction:
// direction % 4 = 0: North
// direction % 4 = 1: East
// direction % 4 = 2: South
// direction % 4 = 3: West
function getOnslaughtEntrances(direction)
{
	const entrances = [];
	switch (direction % 4)
	{
		case 0:
		{
			if (getObject("infHvyFactory1") !== null) entrances.push("infEntry1");
			if (getObject("infHvyFactory2") !== null) entrances.push("infEntry25");
			if (getObject("infFactory1") !== null) entrances.push("infEntry2");
			if (getObject("infFactory2") !== null) entrances.push("infEntry3");
			if (getObject("infHvyFactory3") !== null) entrances.push("infEntry4");
			if (getObject("infFactory4") !== null) entrances.push("infEntry5");
			if (getObject("infFactory6") !== null) entrances.push("infEntry6");
			break;
		}
		case 1:
		{
			if (getObject("infFactory8") !== null) entrances.push("infEntry7");
			if (getObject("infFactory7") !== null) entrances.push("infEntry8");
			if (getObject("infFactory9") !== null) entrances.push("infEntry9");
			if (getObject("infFactory10") !== null) entrances.push("infEntry10");
			if (getObject("infFactory10") !== null) entrances.push("infEntry11");
			if (getObject("infHvyFactory4") !== null) entrances.push("infEntry12");
			if (getObject("infHvyFactory4") !== null) entrances.push("infEntry13");
			if (getObject("infFactory14") !== null) entrances.push("infEntry14");
			break;
		}
		case 2:
		{
			if (getObject("infFactory14") !== null) entrances.push("infEntry15");
			if (getObject("infFactory15") !== null) entrances.push("infEntry16");
			if (getObject("infFactory16") !== null) entrances.push("infEntry17");
			if (getObject("infFactory18") !== null) entrances.push("infEntry18");
			if (getObject("infHvyFactory5") !== null) entrances.push("infEntry19");
			if (getObject("infCybFactory5") !== null) entrances.push("infEntry20");
			break;
		}
		case 3:
		{
			if (getObject("infCybFactory5") !== null) entrances.push("infEntry20");
			if (getObject("infFactory19") !== null) entrances.push("infEntry21");
			if (getObject("infFactory19") !== null) entrances.push("infEntry26");
			if (getObject("infFactory22") !== null) entrances.push("infEntry22");
			if (getObject("infFactory23") !== null) entrances.push("infEntry23");
			if (getObject("infFactory24") !== null) entrances.push("infEntry24");
			break;
		}
	}

	return entrances;
}

function spawnOnslaughtWaves()
{
	let entrances = getOnslaughtEntrances(onslaughtIdx);
	if (difficulty >= HARD && onslaughtIdx >= 3)
	{
		// If we're on Hard+, also spawn groups from the opposite direction simultaneously >:)
		entrances = entrances.concat(getOnslaughtEntrances(onslaughtIdx + 2));
	}

	for (const entrance of entrances)
	{
		// Send them in!
		camSendReinforcement(CAM_INFESTED, getObject(entrance), infestedGroupDroids(true), CAM_REINFORCE_GROUND);
	}
}

// Generate a template list for an infested scavenger factory
function randInfestedFactoryTemplates()
{
	let templates = [];
	const lightTemplates = [
		cTempl.infbloke,
		cTempl.infkevbloke,
		cTempl.inflance,
		cTempl.infkevlance,
		cTempl.inftrike,
		cTempl.infbuggy,
		cTempl.infrbuggy,
		cTempl.infbjeep,
		cTempl.infrbjeep,
		cTempl.infgbjeep,
	];
	const mediumTemplates = [
		cTempl.infbuscan,
		cTempl.inffiretruck,
		cTempl.infminitruck,
		cTempl.infsartruck,
	];
	const heavyTemplates = [
		cTempl.infmonlan,
		cTempl.infmoncan,
		cTempl.infmonhmg,
		cTempl.infmonmrl,
		cTempl.infmonsar,
		cTempl.infflatmrl,
		cTempl.infflatat,
	];

	// Choose 3 light templates...
	templates.push(camRandFrom(lightTemplates));
	templates.push(camRandFrom(lightTemplates));
	templates.push(camRandFrom(lightTemplates));
	// Choose 2 medium templates...
	templates.push(camRandFrom(mediumTemplates));
	templates.push(camRandFrom(mediumTemplates));
	// Choose 1 heavy template...
	templates.push(camRandFrom(heavyTemplates));

	// Shuffle the template list so that they're built in a random order...
	for (let i = 0; i < templates.length; i++)
	{
		// Choose a random index and swap it with the current index's template
		const SWITCH_IDX = camRand(templates.length);
		const temp = templates[i];
		templates[i] = templates[SWITCH_IDX];
		templates[SWITCH_IDX] = temp;
	}

	return templates;
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
	// NOTE: The Collective aren't present on this level, but this color change will carry on to the rest of Act 4...
	changePlayerColour(CAM_THE_COLLECTIVE, (playerColour !== 2) ? 2 : 10); // Set to gray or white
	changePlayerColour(CAM_INFESTED, (playerColour !== 9) ? 9 : 4); // Infested to purple or red
	changePlayerColour(MIS_TEAM_CHARLIE, (playerColour !== 11) ? 11 : 5); // Charlie to bright blue or blue
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz
	const transportEntryPos = { x: 48, y: 58 };

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_TEAM_CHARLIE, CAM_INFESTED, true); // Don't fight each other until landing

	playerColour = playerData[0].colour;
	adaptColors();

	camSetArtifacts({
		"infHvyFactory1": { tech: "R-Wpn-Cannon3Mk1" }, // Heavy Cannon
		"infResearch": { tech: "R-Wpn-AAGun04" }, // Whirlwind AA
	});

	grantPlayerTech();
	camCompleteRequiredResearch(camAct4StartResearch, MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	// Holy cannoli

	camSetEnemyBases({
		"infFactoryBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected, // NOTE: Only one base has a detection sound!
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNWMiniBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNWUnMiniBase": {
			cleanup: "infBase3",
			detectMsg: "INF_BASE3",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNWRidgeBase": {
			cleanup: "infBase4",
			detectMsg: "INF_BASE4",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNWCraterBase": {
			cleanup: "infBase5",
			detectMsg: "INF_BASE5",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNorthPlateauBase": {
			cleanup: "infBase6",
			detectMsg: "INF_BASE6",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infOverlookBase": {
			cleanup: "infBase7",
			detectMsg: "INF_BASE7",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNECanyonBase": {
			cleanup: "infBase8",
			detectMsg: "INF_BASE8",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNEMiniRidgeBase": {
			cleanup: "infBase9",
			detectMsg: "INF_BASE9",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNENondescriptBase": {
			cleanup: "infBase10",
			detectMsg: "INF_BASE10",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNECornerBase": {
			cleanup: "infBase11",
			detectMsg: "INF_BASE11",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNECraterBase": {
			cleanup: "infBase12",
			detectMsg: "INF_BASE12",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infEastBase": {
			cleanup: "infBase13",
			detectMsg: "INF_BASE13",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infEastRidgeBase": {
			cleanup: "infBase14",
			detectMsg: "INF_BASE14",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infEastEdgeBase": {
			cleanup: "infBase15",
			detectMsg: "INF_BASE15",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSECraterBase": {
			cleanup: "infBase16",
			detectMsg: "INF_BASE16",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSECanalBase": {
			cleanup: "infBase17",
			detectMsg: "INF_BASE17",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSEOtherCraterBase": {
			cleanup: "infBase18",
			detectMsg: "INF_BASE18",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSERunningOutOfNamesBase": {
			cleanup: "infBase19",
			detectMsg: "INF_BASE19",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthRidgeBase": {
			cleanup: "infBase20",
			detectMsg: "INF_BASE20",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthCanalRuinsBase": {
			cleanup: "infBase21",
			detectMsg: "INF_BASE21",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthIsAnyoneEverGoingToReadTheseBase": {
			cleanup: "infBase22",
			detectMsg: "INF_BASE22",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSWCornerBase": {
			cleanup: "infBase23",
			detectMsg: "INF_BASE23",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSWCanalBase": {
			cleanup: "infBase24",
			detectMsg: "INF_BASE24",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSWCraterBase": {
			cleanup: "infBase25",
			detectMsg: "INF_BASE25",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infWestBase": {
			cleanup: "infBase26",
			detectMsg: "INF_BASE26",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infWestCanyonBase": {
			cleanup: "infBase27",
			detectMsg: "INF_BASE27",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infWestCraterBase": {
			cleanup: "infBase28",
			detectMsg: "INF_BASE28",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infNWRoadBase": {
			cleanup: "infBase29",
			detectMsg: "INF_BASE29",
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
	});

	camSetFactories({
		"infFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory4": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory5": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory6": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory7": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory8": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory9": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory10": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory11": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory12": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory13": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory14": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory15": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory16": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory17": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory18": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory19": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory20": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory21": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory22": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory23": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory24": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infFactory25": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: randInfestedFactoryTemplates()
		},
		"infCybFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(26)),
			templates: [ cTempl.infscymc, cTempl.infcybca, cTempl.infcybhg, cTempl.infcybgr, cTempl.infcybgr ]
		},
		"infCybFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(26)),
			templates: [ cTempl.infcybmr, cTempl.infcybfl, cTempl.infscyhr, cTempl.infcybhg, cTempl.infcybla ]
		},
		"infCybFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(26)),
			templates: [ cTempl.infscygr, cTempl.infcybhg, cTempl.infcybca, cTempl.infcybhg, cTempl.infcybgr ]
		},
		"infCybFactory4": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(26)),
			templates: [ cTempl.infcybag, cTempl.infcybca, cTempl.infcybmr, cTempl.infcybgr ]
		},
		"infCybFactory5": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(26)),
			templates: [ cTempl.infscytk, cTempl.infcybfl, cTempl.infcybca, cTempl.infscymc, cTempl.infcybgr ]
		},
		"infHvyFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.infcohhcant, cTempl.infcomhmgt, cTempl.infcomatt ]
		},
		"infHvyFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.infcommrat, cTempl.infcommcant, cTempl.infcolpodt ]
		},
		"infHvyFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.infcolcanht, cTempl.infcommrat, cTempl.infcolhmght, cTempl.infcommcant ]
		},
		"infHvyFactory4": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.infcomhaat, cTempl.infcolpodt, cTempl.infcomhpvt, cTempl.infcomatt, cTempl.infcomhmgt ]
		},
		"infHvyFactory5": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(48)),
			templates: [ cTempl.infcominft, cTempl.infcohhcant, cTempl.infcolpodt, cTempl.infcommcant, cTempl.infcommrat ]
		},
	});

	// NOTE: The Infested don't use trucks or cranes
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	}

	// 4 Transports on INSANE
	// 5 Transports on HARD
	// 6 Transports on all other difficulties
	const NUM_TRANSPORTS = Math.min(8 - difficulty, 6);
	startedFromMenu = false;

	// Only if starting Act 4 directly from the menu
	if (!getResearch("R-Script-A3Played", CAM_HUMAN_PLAYER).done)
	{
		startedFromMenu = true;
		
		// Subsequent transport droids are randomly chosen from this pool
		const attackPool = [ // Misc. cyborgs and tanks
			cTempl.cybag, cTempl.scytk, cTempl.cybth, cTempl.scyhc,
			cTempl.plhacanht, cTempl.cohasgnht, cTempl.cohhatht, cTempl.cohbbht, cTempl.plhinfht,
		];

		const artPool = [ // Pepperpots, Ballistas, and HRAs
			cTempl.plhrmortht, cTempl.plhbalht, cTempl.cohhraht, cTempl.scyhr,
		];

		const vtolPool = [ // Misc. VTOLs
			cTempl.comhbombv, cTempl.comphosv, cTempl.comhatv, cTempl.comacanv, cTempl.comagv, 
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

	// If the player has no transport (either destroyed in A3L9 or started from the menu)
	if (enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		// Send a transport with a commander and some high-rank droids
		const firstTransportDroids = [ // 1 Command Turret, 2 AG Cyborgs, 4 Super TK Cyborgs, 3 Assault Cannons
			cTempl.cohcomht,
			cTempl.cybag, cTempl.cybag,
			cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk,
			cTempl.plhacanht, cTempl.plhacanht, cTempl.plhacanht,
		];

		camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), firstTransportDroids,
			CAM_REINFORCE_TRANSPORT, {
				entry: transportEntryPos,
				exit: transportEntryPos
			}
		);
	}

	setPower(NUM_TRANSPORTS * 3000, CAM_HUMAN_PLAYER);
	setReinforcementTime(camMinutesToSeconds(1)); // 1 minute

	firstTransport = true;
	infFactoryOnlyWave = true;

	queue("activateFirstFactories", camChangeOnDiff(camMinutesToMilliseconds(1)));
	queue("activateAllFactories", camChangeOnDiff(camMinutesToMilliseconds(16)));
	setTimer("startInfestedOnslaught", camChangeOnDiff(camMinutesToMilliseconds(8)));
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(80)));
	if (!startedFromMenu)
	{
		// Prevent the player from bringing recycled unit EXP from Act 3
		drainPlayerExp();
	}

	// Give player briefing.
	camPlayVideos({video: "A4L1_BRIEF", type: MISS_MSG});

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camSetWeather(CAM_WEATHER_RAINSTORM);
	camSetSkyType(CAM_SKY_NIGHT);
	// Give the fog a dark purple hue
	camSetFog(32, 12, 64);
	// Add a purple-blue tint
	camSetSunIntensity(.45, .35, .45);
}