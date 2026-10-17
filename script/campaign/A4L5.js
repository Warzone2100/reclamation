include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const mis_infestedResearch = [
	"R-Wpn-MG-Damage05", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage05", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02", 
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];
const mis_collectiveResearch = [
	"R-Wpn-MG-Damage06", "R-Wpn-Rocket-Damage06", "R-Wpn-Mortar-Damage06", 
	"R-Wpn-Flamer-Damage06", "R-Wpn-Cannon-Damage06", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF03",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals06", "R-Struc-Materials06", 
	"R-Defense-WallUpgrade06", "R-Sys-Engineering02", "R-Cyborg-Metals06",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF03",
	"R-Wpn-AAGun-Damage03", "R-Vehicle-Engine06", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade01", "R-Sys-Sensor-Upgrade01",
	"R-Vehicle-Armor-Heat03", "R-Cyborg-Armor-Heat03", "R-Wpn-Howitzer-Damage03",
	"R-Wpn-Howitzer-ROF02", "R-Wpn-Howitzer-Accuracy01", "R-Wpn-Mortar-Acc01",
];

const MIS_TEAM_DELTA = 5;
const MIS_DELTA_COMMANDER_RANK = "Hero";
const MIS_DELTA_UNIT_RANK = "Regular";
const MIS_GROUND_ASSAULT_DELAY = camSecondsToMilliseconds(20);
const MIS_AIR_ASSAULT_DELAY = camSecondsToMilliseconds(15);

var heartbeatDarkness;
var killTeamsEnabled;
var trucksEnabled;
var infestedEnabled;
var transportPlaced;
var colCommanderIndex;
var colCommanderRank;

// Truck jobs
var colLZTruckJob1;
var colLZTruckJob2;
var colLZTruckJob3;
var colLZTruckJob4;
var colLZTruckJob5;
var colLZTruckJob6;
var colLZTruckJob7;
var colLZTruckJob8;
var colLZTruckJob9;
var colLZTruckJob10;

// Refillable groups
var deltaCommander;
var deltaCommandGroup;
var deltaGrenadierGroup;

// Track which assault blips are active
var groundBlips;
var airBlips;

camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.player === CAM_THE_COLLECTIVE || droid.player === MIS_TEAM_DELTA)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", ALL_PLAYERS);
});

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, undefined, "vtolRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(30)), undefined, ext);
}

function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);

	camSetVtolSpawnStateAll(false); // Disable Infested choppers
	
	// Assault Cannons, Tank Killers, Assault Guns
	const templates = [cTempl.comacanv, cTempl.comhatv, cTempl.colagv];
	const ext = {
		limit: [4, 3, 5],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		dynamic: true
	};

	const positions = [
		"vtolAttackPos1", "vtolAttackPos2", "vtolAttackPos3",
		"vtolAttackPos4", "vtolAttackPos5", "vtolAttackPos6",
	];

	camSetVtolData(CAM_THE_COLLECTIVE, positions, "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), undefined, ext);
}

// Send a Collective transport to one of the built LZs (if any exist)
function sendCollectiveTransporter()
{
	let landingZones = [];

	// Prioritize these LZs first:
	if (!camBaseIsEliminated("colWestLZ")) landingZones.push("landingZoneCollective10");
	if (!camBaseIsEliminated("colNWLZ")) landingZones.push("landingZoneCollective9");
	if (!camBaseIsEliminated("colNorthOverlookLZ")) landingZones.push("landingZoneCollective8");
	if (!camBaseIsEliminated("colWaterLZ")) landingZones.push("landingZoneCollective7");
	if (!camBaseIsEliminated("colCentralLZ")) landingZones.push("landingZoneCollective6");

	if (landingZones.length === 0)
	{
		// Choose any of these built LZs closest LZs are unbuilt
		if (!camBaseIsEliminated("colSELZ")) landingZones.push("landingZoneCollective5");
		if (!camBaseIsEliminated("colEastLZ")) landingZones.push("landingZoneCollective4");
		if (!camBaseIsEliminated("colSWLZ")) landingZones.push("landingZoneCollective3");
		if (!camBaseIsEliminated("colSouthLZ")) landingZones.push("landingZoneCollective2");
		if (!camBaseIsEliminated("colNELZ")) landingZones.push("landingZoneCollective1");
	}

	if (landingZones.length === 0)
	{
		return; // No LZs built; check again later
	}

	// Get a pool of possible templates
	const droidPool = [
		cTempl.cybth, // Thermite Flamer Cyborg
		cTempl.cybag, // Assault Gunner Cyborg
		cTempl.scytk, // Super TK Cyborg
		cTempl.scygr, // Super Grenadier Cyborg
		cTempl.scyhr, // Super Heavy Rocket Cyborg
		cTempl.scyac, // Super Auto Gunner Cyborg
		cTempl.comhaaht, // Cyclone
		cTempl.comhatht, // Tank Killer
		cTempl.comhpvht, // HVC
		cTempl.comaght, // Assault Gun
		cTempl.comrepht, // Repair Turret
	];

	// Generate a list of droids to send
	const droids = [];
	let numDroids = 6;
	if (difficulty === INSANE) numDroids = 10;
	else if (difficulty >= MEDIUM) numDroids = 8;

	for (let i = 0; i < numDroids; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	// Send the transport!
	camSendReinforcement(CAM_THE_COLLECTIVE, camRandFrom(landingZones), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: camGenerateRandomMapEdgeCoordinate(),
			exit: camGenerateRandomMapEdgeCoordinate(),
		}
	);
}

// Send Infested/Collective ground reinforcements
function sendReinforcements()
{	
	const entrances = [
		"infEntry1", "infEntry2", "infEntry3",
		"infEntry4", "infEntry5", "infEntry6",
		"infEntry7", "infEntry8", "infEntry9",
		"infEntry10", "infEntry11", "infEntry12",
		"infEntry13", "infEntry14", "infEntry15",
		"infEntry16", "infEntry17", "infEntry18",
		"infEntry19", "infEntry20",
	];

	if (infestedEnabled)
	{
		const coreInfDroids = [
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
			].concat((difficulty >= MEDIUM) ? cTempl.vilestinger : []), // Add a Vile Stinger,
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
				cTempl.infcohhrat, // HRA
				cTempl.infbuggy, cTempl.infbuggy, // Buggies
				cTempl.infrbuggy, // Rocket Buggies
				cTempl.inftrike, // Trikes
				cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
				cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
				cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
				cTempl.infkevlance, cTempl.infkevlance,
			].concat((difficulty >= MEDIUM) ? cTempl.infcomhatt : []), // Add a Tank Killer,
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
				cTempl.infcomhaat, // Cyclones
			].concat((difficulty >= MEDIUM) ? cTempl.vilestinger : []), // Add another Vile Stinger
		];
		const CORE_SIZE = 6;
		const FODDER_SIZE = 12;
		const B_CHANCE = (difficulty * 5) + 5;

		// Spawn Infested groups
		const NUM_INF_GROUPS = difficulty + 6;
		for (let i = 0; i < NUM_INF_GROUPS; i++)
		{
			// Spawn units at a random entrance
			const INDEX = camRand(entrances.length);
			camSendReinforcement(CAM_INFESTED, getObject(entrances[INDEX]), camRandInfTemplates(camRandFrom(coreInfDroids), CORE_SIZE, FODDER_SIZE, B_CHANCE), CAM_REINFORCE_GROUND);
			entrances.splice(INDEX, 1);
		}
	}
	
	if (killTeamsEnabled)
	{
		const coreColDroids = [ // Mostly flamers and MGs
			cTempl.cybth, cTempl.cybth, // Thermite Flamers
			cTempl.cybag, cTempl.cybag, // Assault Gunners
			cTempl.scyac, // Super Auto Cannon Cyborgs
			cTempl.cominft, // Infernos
			cTempl.comagt, // Assault Guns
		];

		// Collective kill teams
		const NUM_COL_GROUPS = difficulty + 3;
		const NUM_COL_DROIDS = 6;
		for (let i = 0; i < NUM_COL_GROUPS; i++)
		{
			const droids = [];
			for (let j = 0; j < NUM_COL_DROIDS; j++)
			{
				droids.push(camRandFrom(coreColDroids));
			}

			// Spawn units at a random entrance
			const INDEX = camRand(entrances.length);
			camSendReinforcement(CAM_THE_COLLECTIVE, getObject(entrances[INDEX]), droids, CAM_REINFORCE_GROUND, {order: CAM_ORDER_ATTACK, data: {
				targetPlayer: CAM_INFESTED // Prioritize attacking the Infested
			}});
			entrances.splice(INDEX, 1);
		}
	}

	// Also try to send in trucks
	if (trucksEnabled && !transportPlaced)
	{
		sendCollectiveTrucks();
	}
}

function sendCollectiveTrucks()
{
	// Northeast LZ
	if (!camDef(camGetTruck(colLZTruckJob1)) && getMissionTime() < camMinutesToSeconds(24))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry4", cTempl.comtruckht), colLZTruckJob1);
	}
	// South LZ
	if (!camDef(camGetTruck(colLZTruckJob2)) && getMissionTime() < camMinutesToSeconds(23))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry7", cTempl.comtruckht), colLZTruckJob2);
	}
	// Southwest LZ
	if (!camDef(camGetTruck(colLZTruckJob3)) && getMissionTime() < camMinutesToSeconds(21))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry8", cTempl.comtruckht), colLZTruckJob3);
	}
	// East LZ
	if (!camDef(camGetTruck(colLZTruckJob4)) && getMissionTime() < camMinutesToSeconds(19))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry5", cTempl.comtruckht), colLZTruckJob4);
	}
	// Southeast LZ
	if (!camDef(camGetTruck(colLZTruckJob5)) && getMissionTime() < camMinutesToSeconds(17))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry7", cTempl.comtruckht), colLZTruckJob5);
	}
	// Central LZ
	if (!camDef(camGetTruck(colLZTruckJob6)) && getMissionTime() < camMinutesToSeconds(15))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry7", cTempl.comtruckht), colLZTruckJob6);
	}
	// Water LZ
	if (!camDef(camGetTruck(colLZTruckJob7)) && getMissionTime() < camMinutesToSeconds(13))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry3", cTempl.comtruckht), colLZTruckJob7);
	}
	// Overlook LZ
	if (!camDef(camGetTruck(colLZTruckJob8)) && getMissionTime() < camMinutesToSeconds(11))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry3", cTempl.comtruckht), colLZTruckJob8);
	}
	// Northwest LZ
	if (!camDef(camGetTruck(colLZTruckJob9)) && getMissionTime() < camMinutesToSeconds(9))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry1", cTempl.comtruckht), colLZTruckJob9);
	}
	// West LZ
	if (!camDef(camGetTruck(colLZTruckJob10)) && getMissionTime() < camMinutesToSeconds(7))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "colEntry10", cTempl.comtruckht), colLZTruckJob10);
	}
}

function startKillTeams()
{
	killTeamsEnabled = true;
	trucksEnabled = true;

	// Dialogue about Collective activity
	camQueueDialogue([
		{text: "LIEUTENANT: Bravo, I'm detecting a lot of Collective nearby.", delay: 0, sound: CAM_RCLICK},
		{text: "LIEUTENANT: They're likely after the Infested, but they'll surely attack you too.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We're also picking up increasing Collective air traffic.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Their bomber squadrons are sweeping through the entire city.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Make sure you have enough defenses.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Charlie still needs to finish their evacuation.", delay: 3, sound: CAM_RCLICK},
	]);
}

function disableInfested()
{
	infestedEnabled = false;
}

function groundAssault1()
{
	// Mark the entry points that are about to be blitzed
	activateGroundBlip(3);
	activateGroundBlip(4);

	// Play a sound
	playSound(cam_sounds.enemyUnitDetected);
	
	// Queue the actual units
	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "1");

	// Dialogue about Collective ground assault
	camQueueDialogue([
		{text: "LIEUTENANT: Bravo, a large group of Collective vehicles is approaching from the north.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Hold the line!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I'll see if there's any way we can speed up the evacuation.", delay: 4, sound: CAM_RCLICK},
	]);
}

function groundAssault2()
{
	activateGroundBlip(6);
	activateGroundBlip(7);
	activateGroundBlip(8);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "2");

	// Dialogue about another Collective ground assault
	camQueueDialogue([
		{text: "LIEUTENANT: Bravo, we've detected another ground assault from the south.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Mobilize your forces, and take them down!", delay: 3, sound: CAM_RCLICK},
	]);
}

function groundAssault3()
{
	activateGroundBlip(1);
	activateGroundBlip(9);
	activateGroundBlip(10);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "3");

	// Dialogue about yet another Collective ground assault
	camQueueDialogue([
		{text: "LIEUTENANT: Another ground assault incoming!", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Charlie, Bravo's position is getting hot.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: When are those transports going to be ready?", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: We're working on it, Lieutenant!", delay: 4, sound: CAM_RCLICK},
	]);
}

function groundAssault4()
{
	activateGroundBlip(2);
	activateGroundBlip(3);
	activateGroundBlip(5);
	activateGroundBlip(6);
	activateGroundBlip(7);


	if (difficulty < INSANE)
	{
		killTeamsEnabled = false; // Stop spawning Collective kill teams
	}
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "4");

	// Dialogue about a Collective ground assault once again
	camQueueDialogue([
		{text: "LIEUTENANT: Charlie, Team Bravo's not gonna last much longer out there!", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Where are those transports?!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: We're moving as fast as we can!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: But we have to make up for the time we lost when we stopped to assault Clayde.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Just hold on for a bit longer, Bravo!", delay: 4, sound: CAM_RCLICK},
	]);
}

function groundAssault5()
{
	activateGroundBlip(4);
	activateGroundBlip(5);
	activateGroundBlip(8);
	activateGroundBlip(9);
	activateGroundBlip(11);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "5");

	// Dialogue about one more Collective ground assault
	camQueueDialogue([
		{text: "LIEUTENANT: Charlie, drop everything!", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We need those transports NOW!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: I'm trying, Lieutenant!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: The Collective is all over the place!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Do SOMETHING!", delay: 4, sound: CAM_RCLICK},
	]);
}

function groundAssault6()
{
	activateGroundBlip(1);
	activateGroundBlip(3);
	activateGroundBlip(4);
	activateGroundBlip(7);
	activateGroundBlip(9);
	activateGroundBlip(11);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "6");
}

// function groundAssault7()
// {
// 	activateGroundBlip(4);
// 	// activateGroundBlip(5);
// 	activateGroundBlip(6);
// 	activateGroundBlip(7);
// 	activateGroundBlip(10);
	
// 	playSound(cam_sounds.enemyUnitDetected);

// 	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "7");
// }

function activateGroundBlip(index)
{
	const names = [
		null,
		"COL_ENTRY1", "COL_ENTRY2", "COL_ENTRY3",
		"COL_ENTRY4", "COL_ENTRY5", "COL_ENTRY6",
		"COL_ENTRY7", "COL_ENTRY8", "COL_ENTRY9",
		"COL_ENTRY10", "COL_ENTRY11",
	];

	groundBlips[index] = true;
	hackAddMessage(names[index], PROX_MSG, CAM_HUMAN_PLAYER);
}

function groundAssaultWave(index)
{
	clearGroundBlips();

	switch (index)
	{
		case "1":
			const wave1Templates = [
				[ // Northeast entry templates
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 3 Heavy Cannons
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
					cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // 4 Assault Gunners
					cTempl.cominft, cTempl.cominft, // 2 Infernos
				],
				[ // Northeast corner entry templates
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Lancers
					cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, // 4 Super Heavy Rocket Cyborgs
					cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
				],
			];
			sendCollectiveGroundWave("colEntry3", wave1Templates[0]);
			sendCollectiveGroundWave("colEntry4", wave1Templates[1]);
			break;
		case "2":
			const wave2Templates = [
				[ // Southeast entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, // 6 Bombards
					cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, // 4 Lancer Cyborgs
					cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
				],
				[ // South entry templates
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
					cTempl.cominft, cTempl.cominft, // 2 Infernos
				],
				[ // Southwest corner entry templates
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 4 Tank Killers
					cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamers
					cTempl.comaght, cTempl.comaght, cTempl.comaght, // 3 Assault Guns
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 3 HVCs
				],
			];
			sendCollectiveGroundWave("colEntry6", wave2Templates[0]);
			sendCollectiveGroundWave("colEntry7", wave2Templates[1]);
			sendCollectiveGroundWave("colEntry8", wave2Templates[2]);
			break;
		case "3":
			const wave3Templates = [
				[ // Northwest corner entry
					cTempl.comsensht, cTempl.comsensht, // 2 Sensors
					cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 4 Bombards
					cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, // 3 Howitzers
				],
				[ // West entry (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				],
				[ // Southwest entry
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 6 Super Auto Cannon Cyborgs
					cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 6 Super Tank Killer Cyborgs
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave3Templates[1].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
			}
			if (difficulty >= HARD)
			{
				wave3Templates[1].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
			}
			if (difficulty == INSANE)
			{
				wave3Templates[1].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
			}

			sendCollectiveGroundWave("colEntry1", wave3Templates[0]);
			sendCollectiveGroundWave("colEntry9", wave3Templates[1], cTempl.cohcomt);
			sendCollectiveGroundWave("colEntry10", wave3Templates[2]);
			break;
		case "4":
			const wave4Templates = [
				[ // North entry (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
					cTempl.cominft, cTempl.cominft, // 2 Infernos
				],
				[ // Northeast entry
					cTempl.comsensht, // 1 Sensor
					cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 6 Bombards
					cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 6 Super Grenadiers
					cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, // 3 Howitzers
				],
				[ // East entry (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, // 6 Infernos
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Southeast entry
					cTempl.comsensht, // 1 Sensor
					cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 4 Bombards
					cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super Tank Killer Cyborgs
					cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // 6 Assault Gunners
					cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, // 3 Howitzers
				],
				[ // South entry (+commander)
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 6 Tank Killers
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
					cTempl.comhaat, cTempl.comhaat,// 2 Cyclones
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave4Templates[0].push(cTempl.comacant, cTempl.comacant); // 2 Assault Cannons
				wave4Templates[2].push(cTempl.cohhrat, cTempl.cohhrat); // 2 HRAs
				wave4Templates[4].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
			}
			if (difficulty >= HARD)
			{
				wave4Templates[0].push(cTempl.cominft, cTempl.cominft); // 2 Infernos
				wave4Templates[2].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave4Templates[4].push(cTempl.cohhrat, cTempl.cohhrat); // 2 HRAs
			}
			if (difficulty == INSANE)
			{
				wave4Templates[0].push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons
				wave4Templates[2].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
				wave4Templates[4].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
			}

			sendCollectiveGroundWave("colEntry2", wave4Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("colEntry3", wave4Templates[1]);
			sendCollectiveGroundWave("colEntry5", wave4Templates[2], cTempl.cohcomt);
			sendCollectiveGroundWave("colEntry6", wave4Templates[3]);
			sendCollectiveGroundWave("colEntry7", wave4Templates[4], cTempl.cohcomt);
			break;
		case "5":
			const wave5Templates = [
				[ // Northeast corner entry 
					cTempl.comsenst, // 1 Sensor
					cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, // 4 Bombards
					cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, // 6 Lancer Cyborgs
					cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 6 Thermite Flamer Cyborgs
					cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, // 4 Howitzers
				],
				[ // East entry (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // Southwest corner entry
					cTempl.comsenst, // 1 Sensor
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 4 Tank Killers
					cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, // 4 Super HRA Cyborgs
					cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, // 4 Howitzers
				],
				[ // Southwest entry (+commander)
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 6 Bunker Busters
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				],
				[ // Northwest entry
					cTempl.comsensht, // 1 Sensor
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 3 Tank Killers
					cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 4 Bombards
					cTempl.comrepht, cTempl.comrepht, cTempl.comrepht, cTempl.comrepht, // 4 Repair Turrets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
					cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, // 4 Howitzers
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave5Templates[1].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
				wave5Templates[3].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
			}
			if (difficulty >= HARD)
			{
				wave5Templates[1].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave5Templates[3].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
			}
			if (difficulty == INSANE)
			{
				wave5Templates[1].push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons
				wave5Templates[3].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
			}

			sendCollectiveGroundWave("colEntry4", wave5Templates[0]);
			// sendCollectiveGroundWave("colEntry5", wave5Templates[1], cTempl.cohcomt);
			deltaArrival(); // NOTE: Team Delta spawns from entry 5 instead of a Collective wave
			sendCollectiveGroundWave("colEntry8", wave5Templates[2]);
			sendCollectiveGroundWave("colEntry9", wave5Templates[3], cTempl.cohcomt);
			sendCollectiveGroundWave("colEntry11", wave5Templates[4]);
			break;
		case "6":
			// Oops! All RIPPLE ROCKETS!
			const wave6Templates = [
				[ // Northwest corner entry 
					cTempl.comsenst,
					cTempl.comsensht, // 2 Sensors
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, // 4 Assault Cannons
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // Northeast entry
					cTempl.comsenst,
					cTempl.comsensht, // 2 Sensors
					cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, 
					cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 8 Super Grenadiers
					cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super TK Cyborgs
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // East entry
					cTempl.comsenst,
					cTempl.comsensht, // 2 Sensors
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 4 Tank Killers
					cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, // 4 Assault Guns
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // South entry
					cTempl.comsenst,
					cTempl.comsensht, // 2 Sensors
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // 6 Assault Gunners
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // Southwest entry
					cTempl.comsenst,
					cTempl.comsensht, // 2 Sensors
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 4 Super Auto Cannon Cyborgs
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // Northwest entry
					cTempl.comsenst,
					cTempl.comsensht, // 2 Sensors
					cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 6 Bombards
					cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, // 6 Super HRA Cyborgs
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
			];
			sendCollectiveGroundWave("colEntry1", wave6Templates[0]);
			sendCollectiveGroundWave("colEntry3", wave6Templates[1]);
			sendCollectiveGroundWave("colEntry4", wave6Templates[2]);
			sendCollectiveGroundWave("colEntry7", wave6Templates[3]);
			sendCollectiveGroundWave("colEntry9", wave6Templates[4]);
			sendCollectiveGroundWave("colEntry11", wave6Templates[5]);
			break;
		// case "7":
		// 	const wave7Templates = [
		// 		[ // Northeast corner entry (+commander)
		// 			cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 6 Assault Cannons
		// 			cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, // 4 Infernos
		// 			cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
		// 			cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
		// 		],
		// 		[ // Southeast entry
		// 			cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, // 4 Assault Guns
		// 			cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
		// 			cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super Tank Killer Cyborgs
		// 			cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 4 Super Auto Cannon Cyborgs
		// 		],
		// 		[ // South entry (+commander)
		// 			cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
		// 			cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 6 Tank Killers
		// 			cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, // 4 Infernos
		// 			cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
		// 		],
		// 		[ // West entry (+commander)
		// 			cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
		// 			cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
		// 			cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
		// 			cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
		// 		],
		// 	];
		// 	sendCollectiveGroundWave("colEntry4", wave7Templates[0], cTempl.comcomt);
		// 	sendCollectiveGroundWave("colEntry6", wave7Templates[1]);
		// 	sendCollectiveGroundWave("colEntry7", wave7Templates[2], cTempl.cohcomt);
		// 	sendCollectiveGroundWave("colEntry10", wave7Templates[3], cTempl.cohcomt);
		// 	break;
	}
}

function sendCollectiveGroundWave(entry, templates, commTemplate)
{
	if (camDef(commTemplate))
	{
		// This group has a commander leader; create one
		const commLabel = "colCommander" + colCommanderIndex++;
		const commDroid = camAddDroid(CAM_THE_COLLECTIVE, entry, commTemplate);
		addLabel(commDroid, commLabel);
		camSetDroidRank(commDroid, colCommanderRank);
		camManageGroup(camMakeGroup(commDroid), CAM_ORDER_ATTACK, {repair: 40});

		// Send in the rest of the group; which will follow the leader
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject(entry), templates, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_FOLLOW,
			data: {
				leader: commLabel,
				repair: 40,
				suborder: CAM_ORDER_ATTACK
			}
		});
	}
	else
	{
		// No leader; just send in the group
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject(entry), templates, CAM_REINFORCE_GROUND);
	}
}

function airAssault1()
{
	activateAirBlip(1);
	// airBlip1 = true;
	// hackAddMessage("AIR_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "1");

	// Dialogue about incoming air assault
	camQueueDialogue([
		{text: "CHARLIE: Bravo!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: You've got firebombers inbound, lots of them!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: They're approaching from the northeast!", delay: 2, sound: CAM_RCLICK},
	]);
}

function airAssault2()
{
	activateAirBlip(2);
	// airBlip2 = true;
	// hackAddMessage("AIR_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "2");

	// Dialogue about another incoming air assault
	camQueueDialogue([
		{text: "CHARLIE: Another group of firebombers from the north!", delay: 4, sound: CAM_RCLICK},
	]);
}

function airAssault3()
{
	activateAirBlip(4);
	activateAirBlip(5);
	// airBlip4 = true;
	// hackAddMessage("AIR_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	// airBlip5 = true;
	// hackAddMessage("AIR_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "3");

	// Dialogue about yet another air assault
	camQueueDialogue([
		{text: "CHARLIE: Bravo!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: You've got TWO squadrons inbound!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Hang on!", delay: 3, sound: CAM_RCLICK},
	]);
}

function airAssault4()
{
	activateAirBlip(1);
	activateAirBlip(3);
	// airBlip1 = true;
	// hackAddMessage("AIR_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	// airBlip3 = true;
	// hackAddMessage("AIR_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "4");
}

function airAssault5()
{
	activateAirBlip(6);
	// airBlip6 = true;
	// hackAddMessage("AIR_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "5");
}

function airAssault6()
{
	activateAirBlip(2);
	activateAirBlip(5);
	// airBlip2 = true;
	// hackAddMessage("AIR_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	// airBlip5 = true;
	// hackAddMessage("AIR_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "6");
}

function airAssault7()
{
	activateAirBlip(4);
	activateAirBlip(6);
	// airBlip4 = true;
	// hackAddMessage("AIR_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	// airBlip6 = true;
	// hackAddMessage("AIR_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "7");
}

function airAssault8()
{
	activateAirBlip(1);
	activateAirBlip(3);
	activateAirBlip(5);
	// airBlip1 = true;
	// hackAddMessage("AIR_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	// airBlip3 = true;
	// hackAddMessage("AIR_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	// airBlip5 = true;
	// hackAddMessage("AIR_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "8");
}

function airAssault9()
{
	activateAirBlip(2);
	// airBlip2 = true;
	// hackAddMessage("AIR_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "9");
}

function airAssault10()
{
	activateAirBlip(3);
	activateAirBlip(6);
	// airBlip3 = true;
	// hackAddMessage("AIR_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	// airBlip6 = true;
	// hackAddMessage("AIR_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "10");
}

function airAssault11()
{
	activateAirBlip(1);
	activateAirBlip(4);
	activateAirBlip(5);
	// airBlip1 = true;
	// hackAddMessage("AIR_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	// airBlip4 = true;
	// hackAddMessage("AIR_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	// airBlip5 = true;
	// hackAddMessage("AIR_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "11");
}

function activateAirBlip(index)
{
	const msgName = "AIR_ENTRY" + index;

	airBlips[index] = true;
	hackAddMessage(msgName, PROX_MSG, CAM_HUMAN_PLAYER);
}

function airAssaultWave(index)
{
	clearAirBlips();

	const vtolTemplates1 = [
		[cTempl.colagv], // Assault Guns
		[cTempl.colatv], // Lancers
		[cTempl.colphosv], // Phosphor Bombs
		[cTempl.comthermv], // Thermite Bombs
	];
	const vtolExtras1 = [
		{limit: 4},
		{limit: 2},
		{limit: 7},
		{limit: 5},
	];

	const vtolTemplates2 = [
		[cTempl.colphosv], // Phosphor Bombs
		[cTempl.colbombv], // Cluster Bombs
		[cTempl.comthermv], // Thermite Bombs
		[cTempl.comhbombv], // HEAP Bombs
	];
	const vtolExtras2 = [
		{limit: 4},
		{limit: 4},
		{limit: 3},
		{limit: 3},
	];

	let entrances = [];
	let templates = [];
	let extras = [];

	switch (index)
	{
		case "1":
			entrances = ["vtolAttackPos1"];
			templates = vtolTemplates1;
			extras = vtolExtras1;
			break;
		case "2":
			entrances = ["vtolAttackPos2"];
			templates = vtolTemplates1;
			extras = vtolExtras1;
			break;
		case "3":
			entrances = ["vtolAttackPos4", "vtolAttackPos5"];
			templates = vtolTemplates1;
			extras = vtolExtras1;
			break;
		case "4":
			entrances = ["vtolAttackPos1", "vtolAttackPos3"];
			templates = vtolTemplates1;
			extras = vtolExtras1;
			break;
		case "5":
			entrances = ["vtolAttackPos6"];
			templates = vtolTemplates2; // Start including some explosive bombers
			extras = vtolExtras2;
			break;
		case "6":
			entrances = ["vtolAttackPos2", "vtolAttackPos5"];
			templates = vtolTemplates2;
			extras = vtolExtras2;
			break;
		case "7":
			entrances = ["vtolAttackPos4", "vtolAttackPos6"];
			templates = vtolTemplates2;
			extras = vtolExtras2;
			break;
		case "8":
			entrances = ["vtolAttackPos1", "vtolAttackPos3", "vtolAttackPos5"];
			templates = vtolTemplates2;
			extras = vtolExtras2;
			break;
		case "9":
			entrances = ["vtolAttackPos2"];
			templates = vtolTemplates2;
			extras = vtolExtras2;
			break;
		case "10":
			entrances = ["vtolAttackPos3", "vtolAttackPos6"];
			templates = vtolTemplates2;
			extras = vtolExtras2;
			break;
		case "11":
			entrances = ["vtolAttackPos1", "vtolAttackPos4", "vtolAttackPos5"];
			templates = vtolTemplates2;
			extras = vtolExtras2;
			break;
	}

	for (const entrance of entrances)
	{
		// Send some one-time VTOL groups
		camSetVtolData(CAM_THE_COLLECTIVE, entrance, "vtolRemoveZone", templates[0], undefined, undefined, extras[0]);
		camSetVtolData(CAM_THE_COLLECTIVE, entrance, "vtolRemoveZone", templates[1], undefined, undefined, extras[1]);
		camSetVtolData(CAM_THE_COLLECTIVE, entrance, "vtolRemoveZone", templates[2], undefined, undefined, extras[2]);
		camSetVtolData(CAM_THE_COLLECTIVE, entrance, "vtolRemoveZone", templates[3], undefined, undefined, extras[3]);
	}
}

function clearGroundBlips()
{
	if (groundBlips[1]) hackRemoveMessage("COL_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[2]) hackRemoveMessage("COL_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[3]) hackRemoveMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[4]) hackRemoveMessage("COL_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[5]) hackRemoveMessage("COL_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[6]) hackRemoveMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[7]) hackRemoveMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[8]) hackRemoveMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[9]) hackRemoveMessage("COL_ENTRY9", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[10]) hackRemoveMessage("COL_ENTRY10", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[11]) hackRemoveMessage("COL_ENTRY11", PROX_MSG, CAM_HUMAN_PLAYER);

	groundBlips[1] = false;
	groundBlips[2] = false;
	groundBlips[3] = false;
	groundBlips[4] = false;
	groundBlips[5] = false;
	groundBlips[6] = false;
	groundBlips[7] = false;
	groundBlips[8] = false;
	groundBlips[9] = false;
	groundBlips[10] = false;
	groundBlips[11] = false;
}

function clearAirBlips()
{
	if (airBlips[1]) hackRemoveMessage("AIR_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[2]) hackRemoveMessage("AIR_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[3]) hackRemoveMessage("AIR_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[4]) hackRemoveMessage("AIR_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[5]) hackRemoveMessage("AIR_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[6]) hackRemoveMessage("AIR_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);

	airBlips[1] = false;
	airBlips[2] = false;
	airBlips[3] = false;
	airBlips[4] = false;
	airBlips[5] = false;
	airBlips[6] = false;
}

// Start spawning Delta reinforcements to help clear the map
function deltaArrival()
{
	sendDeltaReinforcements();
	deltaVtolAttack();
	setTimer("sendDeltaReinforcements", camSecondsToMilliseconds(30));

	// Dialogue about Delta's arrival
	camQueueDialogue([
		{text: "DELTA: Need a hand, Bravo?!", delay: 12, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commander Delta?!", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: What are you-", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: We heard your speech, Lieutenant.", delay: 1, sound: CAM_RCLICK},
		{text: "DELTA: Let's put the past behind us, and get the hell out of here!", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: ...Commander Bravo, hang on!", delay: 4, sound: CAM_RCLICK},
		{text: "DELTA: We'll help you fight off the Collective!", delay: 4, sound: CAM_RCLICK},
		// Delay
		{text: "LIEUTENANT: ...Thank you, Delta.", delay: 8, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Charlie, get a transport to Bravo's base ASAP.", delay: 8, sound: CAM_RCLICK},
		{text: "CHARLIE: On it!", delay: 4, sound: CAM_RCLICK},
	]);
}

function sendDeltaReinforcements()
{
	const commTemplates = camGetRefillableGroupTemplates(deltaCommander);
	const groupTemplates = camGetRefillableGroupTemplates([deltaCommandGroup, deltaGrenadierGroup]);

	if (commTemplates.length > 0)
	{
		// Spawn Delta's commander
		const commDroid = camAddDroid(MIS_TEAM_DELTA, "colEntry5", commTemplates[0]);
		addLabel(commDroid, "deltaCommander");
		camSetDroidRank(commDroid, MIS_DELTA_COMMANDER_RANK);
		camAssignToRefillableGroups([commDroid], deltaCommander);
	}

	if (groupTemplates.length > 0)
	{
		// Spawn Delta's other ground units
		const newDroids = camSendReinforcement(MIS_TEAM_DELTA, getObject("colEntry5"), groupTemplates, CAM_REINFORCE_GROUND);
		camSetDroidRank(newDroids, MIS_DELTA_UNIT_RANK);
		camAssignToRefillableGroups(enumGroup(newDroids), [deltaCommandGroup, deltaGrenadierGroup]);
	}
}

function deltaVtolAttack()
{
	// HVCs and Assault Guns
	const templates = [cTempl.plmhpvv, cTempl.plmagv];
	const ext = {
		limit: [6, 4],
	};

	camSetVtolData(MIS_TEAM_DELTA, "deltaVtolAttackPos", "vtolRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(30)), undefined, ext);
}

function eventMissionTimeout()
{
	camCallOnce("transitionSetup");
}

// Special case handling for the "let me win" achievement
// The player NEEDS to have a loaded transporter to start the next mission correctly, but they don't have one until the timer runs out
// So if the player uses the "let me win" cheat, skip straight to the escape segment
function eventChat(from, to, message)
{
	if (camIsCheating() && message === "let me win")
	{
		camCallOnce("transitionSetup");
	}
}

// Set up a player transport and allow moving on to the next mission
function transitionSetup()
{
	camSetupTransporter(68, 66, 40, 52);
	transportPlaced = true;

	camSetStandardWinLossConditions(CAM_VICTORY_PRE_OFFWORLD, "A4L6");
	camSetExtraObjectiveMessage([_("Escape via transport")]);

	// Transmission about escaping
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "A4L5_EVAC", type: MISS_MSG}]);

	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(15)));
	}
	else
	{
		setMissionTime(-1);
	}

	if (difficulty >= HARD)
	{
		// Start spawning kill teams again
		killTeamsEnabled = true;
	}
	else
	{
		camSetVtolSpawnStateAll(false); // Stop spawning VTOLs (both Collective & Delta's)
	}
}

// Fluctuate the sky's color over time
function skyHeartbeat()
{
	if (heartbeatDarkness) // Gradually make the sky darker
	{
		camGradualFog(camSecondsToMilliseconds(6), 88, 57, 38);
		camGradualSunIntensity(camSecondsToMilliseconds(6), .44, .32, .28);
	}
	else // Gradually make the sky lighter
	{
		camGradualFog(camSecondsToMilliseconds(6), 110, 71, 47);
		camGradualSunIntensity(camSecondsToMilliseconds(6), .55, .4, .35);
	}
	heartbeatDarkness = !heartbeatDarkness;
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz
	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	setMissionTime(camMinutesToSeconds(30));
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "A4L6");
	camSetExtraObjectiveMessage([_("Survive until the timer reaches zero")]);

	setAlliance(MIS_TEAM_DELTA, CAM_HUMAN_PLAYER, true);
	camSetObjectVision(MIS_TEAM_DELTA);
	changePlayerColour(MIS_TEAM_DELTA, (playerData[0].colour !== 1) ? 1 : 8); // Delta to orange or yellow

	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(camA4L5AllyResearch, MIS_TEAM_DELTA);

	// NOTE: All of these start unbuilt!
	camSetEnemyBases({
		"colNELZ": {
			cleanup: "colLZ1",
			detectMsg: "COL_LZ1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colSouthLZ": {
			cleanup: "colLZ2",
			detectMsg: "COL_LZ2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colSWLZ": {
			cleanup: "colLZ3",
			detectMsg: "COL_LZ3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colEastLZ": {
			cleanup: "colLZ4",
			detectMsg: "COL_LZ4",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colSELZ": {
			cleanup: "colLZ5",
			detectMsg: "COL_LZ5",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colCentralLZ": {
			cleanup: "colLZ6",
			detectMsg: "COL_LZ6",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colWaterLZ": {
			cleanup: "colLZ7",
			detectMsg: "COL_LZ7",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colNorthOverlookLZ": {
			cleanup: "colLZ8",
			detectMsg: "COL_LZ8",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colNWLZ": {
			cleanup: "colLZ9",
			detectMsg: "COL_LZ9",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colWestLZ": {
			cleanup: "colLZ10",
			detectMsg: "COL_LZ10",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
	});

	setTimer("sendReinforcements", camChangeOnDiff(camSecondsToMilliseconds(95)));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3.5)));
	heliAttack();

	// Queue large telegraphed Collective ground and air attacks
	queue("startKillTeams", camMinutesToMilliseconds(5)); // at 25 minutes remaining
	queue("vtolAttack", camMinutesToMilliseconds(6)); // at 24 minutes remaining
	queue("airAssault1", camMinutesToMilliseconds(8)); // at 22 minutes remaining
	queue("groundAssault1", camMinutesToMilliseconds(10)); // at 20 minutes remaining
	queue("disableInfested", camMinutesToMilliseconds(10));
	queue("airAssault2", camMinutesToMilliseconds(11)); // at 19 minutes remaining
	queue("airAssault3", camMinutesToMilliseconds(12)); // at 18 minutes remaining
	queue("groundAssault2", camMinutesToMilliseconds(14)); // at 16 minutes remaining
	queue("airAssault4", camMinutesToMilliseconds(16)); // at 14 minutes remaining
	queue("groundAssault3", camMinutesToMilliseconds(17)); // at 13 minutes remaining
	queue("airAssault5", camMinutesToMilliseconds(18)); // at 12 minutes remaining
	// Attacks start to speed up around here...
	queue("groundAssault4", camMinutesToMilliseconds(21)); // at 9 minutes remaining
	queue("airAssault6", camMinutesToMilliseconds(22)); // at 8 minutes remaining
	queue("groundAssault5", camMinutesToMilliseconds(23)); // at 7 minutes remaining
	queue("airAssault7", camMinutesToMilliseconds(24)); // at 6 minutes remaining
	queue("airAssault8", camMinutesToMilliseconds(24.5)); // at 5.5 minutes remaining
	queue("airAssault9", camMinutesToMilliseconds(25.5)); // at 4.5 minutes remaining
	queue("groundAssault6", camMinutesToMilliseconds(26)); // at 4 minutes remaining
	queue("airAssault10", camMinutesToMilliseconds(26.5)); // at 3.5 minutes remaining
	// queue("groundAssault7", camMinutesToMilliseconds(27)); // at 3 minutes remaining
	queue("airAssault11", camMinutesToMilliseconds(28)); // at 2 minutes remaining

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	heartbeatDarkness = false;
	killTeamsEnabled = false;
	trucksEnabled = false;
	infestedEnabled = true;
	transportPlaced = false;
	colCommanderIndex = 1;
	colCommanderRank = Math.min(5, difficulty + 4); // Veteran to Hero

	groundBlips = [
		null,
		false, // Blip #1
		false, // Blip #2
		false, // Blip #3
		false, // Blip #4
		false, // Blip #5
		false, // Blip #6
		false, // Blip #7
		false, // Blip #8
		false, // Blip #9
		false, // Blip #10
		false, // Blip #11
	];
	airBlips = [
		null,
		false, // Blip #1
		false, // Blip #2
		false, // Blip #3
		false, // Blip #4
		false, // Blip #5
		false, // Blip #6
	];

	// (allied) Refillable groups
	deltaCommander = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.plhcomht],
		}, CAM_ORDER_ATTACK);
	deltaCommandGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 8 Assault Cannons, 4 Repair Turrets, 2 Whirlwinds, 8 Super Auto-Cannons
				cTempl.plhacanht, cTempl.plhacanht,
				cTempl.plhacanht, cTempl.plhacanht,
				cTempl.plhrepht, cTempl.plhrepht,
				cTempl.plhraaht,
				cTempl.scyac, cTempl.scyac,
				cTempl.scyac, cTempl.scyac,
				cTempl.plhacanht, cTempl.plhacanht,
				cTempl.plhrepht, cTempl.plhrepht,
				cTempl.plhraaht,
				cTempl.plhacanht, cTempl.plhacanht,
				cTempl.scyac, cTempl.scyac,
				cTempl.scyac, cTempl.scyac,
			],
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaCommander",
			suborder: CAM_ORDER_ATTACK
	});
	deltaGrenadierGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 8 Super Grenadiers
				cTempl.scygr, cTempl.scygr,
				cTempl.scygr, cTempl.scygr,
				cTempl.scygr, cTempl.scygr,
				cTempl.scygr, cTempl.scygr,
			],
		}, CAM_ORDER_ATTACK);

	// Truck jobs for Collective LZs
	colLZTruckJob1 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNELZ",
			rebuildBase: true,
			structset: camA4L5ColLZ1Structs
	});
	colLZTruckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthLZ",
			rebuildBase: true,
			structset: camA4L5ColLZ2Structs
	});
	colLZTruckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSWLZ",
			rebuildBase: true,
			structset: camA4L5ColLZ3Structs
	});
	colLZTruckJob4 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colEastLZ",
			rebuildBase: true,
			structset: camA4L5ColLZ4Structs
	});
	colLZTruckJob5 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSELZ",
			rebuildBase: true,
			structset: camA4L5ColLZ5Structs
	});
	colLZTruckJob6 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralLZ",
			rebuildBase: true,
			structset: camA4L5ColLZ6Structs
	});
	colLZTruckJob7 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colWaterLZ",
			rebuildBase: true,
			structset: camA4L5ColLZ7Structs
	});
	colLZTruckJob8 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthOverlookLZ",
			rebuildBase: true,
			structset: camA4L5ColLZ8Structs
	});
	colLZTruckJob9 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNWLZ",
			rebuildBase: true,
			structset: camA4L5ColLZ9Structs
	});
	colLZTruckJob10 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colWestLZ",
			rebuildBase: true,
			structset: camA4L5ColLZ10Structs
	});

	// Upgrade Collective structures on higher difficulties
	if (difficulty >= HARD)
	{
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadBof", "AASite-QuadRotMg"); // AA Sites
	}

	// Give player briefing.
	camPlayVideos({video: "A4L5_BRIEF", type: MISS_MSG});

	// It's supposed to be ash...
	camSetWeather(CAM_WEATHER_SNOWSTORM);
	camSetSkyType(CAM_SKY_ARIZONA);
	// Add a dark orange-red fog
	camSetFog(110, 71, 47);
	// Darken and give a red-orange hue to the lighting
	camSetSunIntensity(.55, .4, .35);

	setTimer("skyHeartbeat", camSecondsToMilliseconds(6));
}