include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_infestedResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Cyborg-Metals03", "R-Wpn-AAGun-ROF01", 
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03",
];
// const infEntry1 = {x: 197, y: 7, x2: 198, y2: 10};
const infEntry2 = {x: 197, y: 22, x2: 198, y2: 25};
const infEntry3 = {x: 157, y: 77, x2: 160, y2: 78};
const infEntry4 = {x: 134, y: 77, x2: 138, y2: 78};
const infEntry5 = {x: 102, y: 77, x2: 104, y2: 78};
// const infEntry6 = {x: 82, y: 49, x2: 83, y2: 53};
const infEntry7 = {x: 129, y: 1, x2: 133, y2: 2};
const infEntry8 = {x: 107, y: 1, x2: 111, y2: 2};
const infEntry9 = {x: 81, y: 7, x2: 82, y2: 10};

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
	const CORE_SIZE = 2;
	const FODDER_SIZE = 8;
	let bChance = 0;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	const entrances = [
		infEntry2, infEntry3, infEntry4,
		infEntry5, infEntry7, infEntry8,
		infEntry9,
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
	camSetupTransporter(193, 73, 198, 78);
	centreView(193, 73);
	setNoGoArea(192, 72, 194, 74, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(30)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A3L3");
	camSetExtraObjectiveMessage(_("Reinforcements will not be available"));

	// Tell the player that they won't be able to call reinforcements
	camQueueDialogue([
		{text: "CHARLIE: Hey, Bravo.", delay: 12, sound: CAM_RCLICK},
		{text: "CHARLIE: The section of the city that Clayde's sending you into is a ZOO.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: It's totally infested.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: And, you won't be able to call any reinforcements while you're there.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: So try to pack your transport wisely, since Clayde's only giving you one this time.", delay: 3, sound: CAM_RCLICK},
	]);

	// Give player briefing.
	camPlayVideos({video: "A3L3_BRIEF", type: MISS_MSG});

	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(120)));

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camSetSkyType(CAM_SKY_NIGHT);
	// Give the fog a dark purple hue
	camSetFog(32, 12, 64);
	// Add a purple-blue tint
	camSetSunIntensity(.45, .35, .45);
}