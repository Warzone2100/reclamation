include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_infestedResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals03", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals03", "R-Wpn-AAGun-ROF01", 
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine04",
];
const infEntry1 = {x: 106, y: 1, x2: 111, y2: 2};
const infEntry2 = {x: 128, y: 1, x2: 133, y2: 2};
// const infEntry3 = {x: 197, y: 6, x2: 198, y2: 11};
const infEntry4 = {x: 197, y: 21, x2: 198, y2: 25};
const infEntry5 = {x: 197, y: 94, x2: 198, y2: 100};
const infEntry6 = {x: 197, y: 117, x2: 198, y2: 121};
const infEntry7 = {x: 157, y: 133, x2: 160, y2: 134};
const infEntry8 = {x: 134, y: 133, x2: 137, y2: 134};
const infEntry9 = {x: 108, y: 133, x2: 116, y2: 134};
const infEntry10 = {x: 83, y: 133, x2: 87, y2: 134};
const infEntry11 = {x: 81, y: 7, x2: 82, y2: 10};

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, undefined, {x: 193, y: 73}, templates, camChangeOnDiff(camMinutesToMilliseconds(0.75)), undefined, ext);
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
	const CORE_SIZE = 2;
	const FODDER_SIZE = 8;
	let bChance = 5;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	const entrances = [
		infEntry1, infEntry2, infEntry4,
		infEntry5, infEntry6, infEntry7,
		infEntry8, infEntry9, infEntry10,
		infEntry11,
	];

	const NUM_GROUPS = difficulty + 2;
	const NUM_ENTRANCES = entrances.length;
	for (let i = 0; i < (Math.min(NUM_ENTRANCES, NUM_GROUPS)); i++)
	{
		// Spawn units at a random entrance
		const INDEX = camRand(entrances.length);

		camSendReinforcement(CAM_INFESTED, entrances[INDEX], camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance),
			CAM_REINFORCE_GROUND);

		entrances.splice(INDEX, 1);
	}
}

function eventStartLevel()
{
	camSetupTransporter(193, 73, 196, 60);
	centreView(193, 73);
	setNoGoArea(192, 72, 194, 74, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A3L7");

	// Give player briefing.
	camPlayVideos({video: "A3L7_BRIEF", type: MISS_MSG});

	// Additional dialogue
	camQueueDialogue([
		{text: "DELTA: Commander Bravo!", delay: 12, sound: CAM_RCLICK},
		{text: "DELTA: Thanks for helping us with our little uplink problem.", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: But the uplink itself is far away from your main base.", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: It'll take a long time for your transports to go back and forth with reinforcements.", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: So think carefully about the units to choose to take with you.", delay: 3, sound: CAM_RCLICK},
	]);

	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(115)));
	heliAttack();

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camSetSkyType(CAM_SKY_NIGHT);
	// Give the fog a dark purple hue
	camSetFog(32, 12, 64);
	// Add a purple-blue tint
	camSetSunIntensity(.45, .4, .45);
}