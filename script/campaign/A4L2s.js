include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_infestedResearch = [
	"R-Wpn-MG-Damage05", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage05", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02", 
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];
const infEntry1 = {x: 4, y: 1, x2: 7, y2: 2};
const infEntry2 = {x: 24, y: 1, x2: 27, y2: 2};
const infEntry3 = {x: 39, y: 1, x2: 43, y2: 2};
const infEntry4 = {x: 84, y: 1, x2: 92, y2: 2};
const infEntry5 = {x: 107, y: 1, x2: 109, y2: 2};
const infEntry6 = {x: 117, y: 15, x2: 118, y2: 22};
const infEntry7 = {x: 117, y: 40, x2: 118, y2: 43};
const infEntry8 = {x: 117, y: 82, x2: 118, y2: 87};
const infEntry9 = {x: 106, y: 117, x2: 109, y2: 118};
const infEntry10 = {x: 74, y: 117, x2: 81, y2: 118};
const infEntry11 = {x: 35, y: 117, x2: 44, y2: 118};
const infEntry12 = {x: 1, y: 98, x2: 2, y2: 101};
const infEntry13 = {x: 1, y: 85, x2: 2, y2: 89};
const infEntry14 = {x: 1, y: 71, x2: 2, y2: 76};

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
	const CORE_SIZE = 2;
	const FODDER_SIZE = 8;
	const B_CHANCE = (difficulty * 5) + 5;

	const entrances = [
		infEntry1, infEntry2, infEntry3,
		infEntry4, infEntry5, infEntry6,
		infEntry7, infEntry8, infEntry9,
		infEntry10, infEntry11, infEntry12,
		infEntry13, infEntry14,
	];

	const NUM_GROUPS = difficulty + 3;
	for (let i = 0; i < NUM_GROUPS; i++)
	{
		// Spawn units at a random entrance
		const INDEX = camRand(entrances.length);
		camSendReinforcement(CAM_INFESTED, entrances[INDEX], camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, B_CHANCE), CAM_REINFORCE_GROUND);
		entrances.splice(INDEX, 1);
	}
}

function eventStartLevel()
{
	camSetupTransporter(68, 66, 54, 82);
	centreView(68, 66);
	setNoGoArea(67, 65, 69, 67, CAM_HUMAN_PLAYER);
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.75)));
	}
	else
	{
		setMissionTime(-1);
	}
	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A4L2");

	// Give player briefing.
	camPlayVideos({video: "A4L2_BRIEF", type: MISS_MSG});

	// Hint that the player should build defenses to the east and south
	camQueueDialogue([
		{text: "LIEUTENANT: Another thing, Bravo.", delay: 6, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I'm still picking up a lot of movement around your area.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Most of it is probably just wandering groups of Infested.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But still, try to make sure that your", delay: 3, sound: CAM_RCLICK},
		{text: "defenses are in good condition before taking off.", delay: 0},
		{text: "LIEUTENANT: Especially in the east and in the south,", delay: 4, sound: CAM_RCLICK},
		{text: "I'm detecting extra activity in those directions.", delay: 0},
	]);

	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(160)));
	heliAttack();

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Give the fog a pink hue
	camSetFog(24, 16, 64);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Add a purple-blue tint
	camSetSunIntensity(.55, .5, .6);
}