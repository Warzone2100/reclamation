include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");
include("script/campaign/transitionTech.js");

const mis_collectiveResearch = [
	"R-Wpn-MG-Damage05", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage04", "R-Wpn-Cannon-Damage05", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals04", "R-Struc-Materials04", 
	"R-Defense-WallUpgrade04", "R-Sys-Engineering02", "R-Cyborg-Metals04",
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Rocket-Accuracy03", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine05", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade01", "R-Wpn-Mortar-Acc01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials04", 
	"R-Defense-WallUpgrade04", "R-Cyborg-Metals03", "R-Wpn-AAGun-ROF01", 
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03",
];

var heavyWaveIdx;
var supportWaveIdx;
var reinforcementsArrived;

var colTruckJob1;
var colTruckJob2;
var colTruckJob3;
var colTruckJob4;

const MIS_TEAM_CHARLIE = 1;
const MIS_ALLY_COMMANDER_RANK = "Elite";

camAreaEvent("vtolRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone", CAM_THE_COLLECTIVE);
});

function vtolAttack()
{
	playSound(cam_sounds.enemyVtolsDetected);

	// Phosphor Bombs, Assault Guns, HEAP Bombs, and Lancers
	const templates = [cTempl.colphosv, cTempl.colagv, cTempl.comhbombv, cTempl.colatv];
	const ext = {
		limit: [2, 3, 2, 3],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone"),
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, ["vtolAttackPos1", "vtolAttackPos2"], "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), undefined, ext);
}

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, undefined, "vtolRemoveZone", templates, camChangeOnDiff(camMinutesToMilliseconds(0.75)), undefined, ext);
}

// Starts the Collective wave loops
function startCollectiveAttacks()
{
	// Dialogue about incoming Collective attacks
	camQueueDialogue([
		{text: "CHARLIE: Bravo, we're picking large groups of enemy tanks.", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: I've marked the directions that the biggest groups will arrive from.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Try to focus your defenses there, if you can.", delay: 3, sound: CAM_RCLICK},
	]);

	queueCollectiveHeavyWave();
	// Send a heavy wave every 4 minutes...
	setTimer("queueCollectiveHeavyWave", camMinutesToMilliseconds(4));
	// And a support wave roughly every 2 minutes...
	setTimer("sendCollectiveSupportWave", camChangeOnDiff(camMinutesToMilliseconds(2)));
}

// Marks the entrances for the imminent Collective armor wave
function queueCollectiveHeavyWave()
{
	switch (heavyWaveIdx)
	{
	case 1:
		// Mark entrances 6 & 7
		hackAddMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
		break;
	case 2:
		// Mark entrances 7 & 8
		hackAddMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);
		break;
	case 3:
		// Mark entrances 3 & 6
		hackAddMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		break;
	case 4:
		// Mark entrances 1 & 3
		hackAddMessage("COL_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
		break;
	case 5:
		// Mark entrances 2, 6 & 8
		hackAddMessage("COL_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		hackAddMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);

		// Stop spawning heavy and support waves from this point on
		removeTimer("queueCollectiveHeavyWave");
		removeTimer("sendCollectiveSupportWave");

		// Dialogue about incoming Collective attacks
		camQueueDialogue([
			{text: "CHARLIE: Hang on, Bravo!", delay: 4, sound: CAM_RCLICK},
			{text: "CHARLIE: We're almost there!", delay: 3, sound: CAM_RCLICK},
		]);
		break;
	}
	// Bring in the actual units 20 seconds later
	queue("sendCollectiveHeavyWave", camChangeOnDiff(camSecondsToMilliseconds(20)));

	playSound(cam_sounds.enemyUnitDetected);
}

// Spawns large Collective attack waves and removes the beacons that precede them
function sendCollectiveHeavyWave()
{
	const orderData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}};
	switch (heavyWaveIdx)
	{
	case 1:
		// Un-mark entrances 6 & 7
		hackRemoveMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids1 = [
			cTempl.cohhcant, // 1 Heavy Cannon
			cTempl.commcant, cTempl.commcant, cTempl.commcant, // 3 Medium Cannons
			cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 3 Heavy Machineguns
			cTempl.colaaht, cTempl.colaaht, // 2 Hurricanes
		];

		// Send the tanks!
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry6"), heavyDroids1, CAM_REINFORCE_GROUND, orderData);
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry7"), heavyDroids1, CAM_REINFORCE_GROUND, orderData);
		break;
	case 2:
		// Un-mark entrances 7 & 8
		hackRemoveMessage("COL_ENTRY7", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids2 = [
			cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
			cTempl.commcant, cTempl.commcant, cTempl.commcant, cTempl.commcant, // 4 Medium Cannons
			cTempl.comhmgt, cTempl.comhmgt, // 2 Heavy Machineguns
			cTempl.comhaat, // 1 Cyclone
		];

		// Send the tanks!
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry7"), heavyDroids2, CAM_REINFORCE_GROUND, orderData);
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry8"), heavyDroids2, CAM_REINFORCE_GROUND, orderData);
		break;
	case 3:
		// Un-mark entrances 3 & 6
		hackRemoveMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids3 = [
			cTempl.cohhcant, cTempl.cohhcant, // 2 Heavy Cannons
			cTempl.commrat, cTempl.commrat, cTempl.commrat, cTempl.commrat, // 4 MRAs
			cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, // 6 MRPs
			cTempl.comhaat, // 1 Cyclone
		];
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry3"), heavyDroids3, CAM_REINFORCE_GROUND, orderData);

		// Spawn a Collective commander
		const commanderPos1 = camMakePos("colEntry6");
		const commanderTemp1 = cTempl.comcomt;
		const commDroid1 = camAddDroid(CAM_THE_COLLECTIVE, commanderPos1, commanderTemp1);
		
		addLabel(commDroid1, "colCommander1");
		// Set the commander's rank (ranges from Trained to Professional)
		const COMMANDER_RANK1 = (difficulty <= EASY) ? 2 : (difficulty);
		camSetDroidRank(commDroid1, COMMANDER_RANK1);
		// Order the commander to attack
		camManageGroup(camMakeGroup(commDroid1), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});

		// Spawn the commander's escorts
		const commanderDroids1 = [
			cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
			cTempl.comagt, cTempl.comagt, // 2 Assault Guns
			cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
			cTempl.comhaat, // 1 Cyclone
			cTempl.comrept, // 1 Repair Turret
		];
		if (difficulty >= HARD) commanderDroids1.push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns (Hard+)
		if (difficulty == INSANE) commanderDroids1.push(cTempl.cohhrat, cTempl.cohhrat); // 2 HRAs (Insane)
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry6"), commanderDroids1, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_FOLLOW, data: {leader: "colCommander1", suborder: CAM_ORDER_ATTACK}
		});
		break;
	case 4:
		// Un-mark entrances 1 & 3
		hackRemoveMessage("COL_ENTRY1", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids4 = [
			cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
			cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 3 HRAs
			cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
		];
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry3"), heavyDroids4, CAM_REINFORCE_GROUND, orderData);

		const assaultDroids4 = [
			cTempl.cohhcant, cTempl.cohhcant, // 2 Assault Cannons
			cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
			cTempl.comhaat, // 1 Cyclone
		];
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry1"), assaultDroids4, CAM_REINFORCE_GROUND, orderData);

		// Also include a special Tiger tank
		const assaultPos = camMakePos("colEntry1");
		const assaultTemp = cTempl.cohacant; // Assault Cannon Tiger Tracks
		const assaultDroid = camAddDroid(CAM_THE_COLLECTIVE, assaultPos, assaultTemp);
		// Order the tank to attack
		camManageGroup(camMakeGroup(assaultDroid), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});
		
		// Make this tank drop an artifact
		addLabel(assaultDroid, "colAssaultTank");
		camAddArtifact({"colAssaultTank": { tech: "R-Wpn-Cannon5" }}); // Assault Cannon
		break;
	case 5:
		// Un-mark entrances 2, 6 & 8
		hackRemoveMessage("COL_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY6", PROX_MSG, CAM_HUMAN_PLAYER);
		hackRemoveMessage("COL_ENTRY8", PROX_MSG, CAM_HUMAN_PLAYER);

		const heavyDroids5 = [
			cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 3 Heavy Cannons
			cTempl.comacant, cTempl.comacant, // 2 Assault Cannons
			cTempl.cominft, cTempl.cominft, // 2 Infernos
			cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
		];
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry2"), heavyDroids5, CAM_REINFORCE_GROUND, orderData);
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry8"), heavyDroids5, CAM_REINFORCE_GROUND, orderData);

		// Spawn another Collective commander
		const commanderPos2 = camMakePos("colEntry6");
		const commanderTemp2 = cTempl.cohcomt;
		const commDroid2 = camAddDroid(CAM_THE_COLLECTIVE, commanderPos2, commanderTemp2);
		
		addLabel(commDroid2, "colCommander2");
		// Set the commander's rank (ranges from Regular to Veteran)
		const COMMANDER_RANK2 = (difficulty <= EASY) ? 3 : (difficulty + 1);
		camSetDroidRank(commDroid2, COMMANDER_RANK2);
		// Order the commander to attack
		camManageGroup(camMakeGroup(commDroid2), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});

		// Spawn the commander's escorts
		const commanderDroids2 = [
			cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
			cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
			cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
			cTempl.cominft, cTempl.cominft, // 2 Infernos
			cTempl.cohraat, // 1 Whirlwind
			cTempl.comrept, // 1 Repair Turret
		];
		if (difficulty >= HARD) commanderDroids2.push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons (Hard+)
		if (difficulty == INSANE) commanderDroids2.push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons (Insane)
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry6"), commanderDroids2, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_FOLLOW, data: {leader: "colCommander2", suborder: CAM_ORDER_ATTACK}
		});
		break;
	default:
		break;
	}
	heavyWaveIdx++;
}

// Sends smaller waves to support the main army
function sendCollectiveSupportWave()
{
	// Support waves come in three forms:
	// 1.) Halftrack/Cyborg group
	// 2.) Sensor/Bombard group
	// 3.) Hover group
	// The first two support groups may also spawn with a truck, which will attempt to build an LZ nearby

	// Entrances used by non-hover groups
	const supportEntrances = ["colEntry4", "colEntry7", "colEntry8"];
	if (supportWaveIdx >= 5) supportEntrances.push("colEntry2");
	const chosenEntrance = getObject(camRandFrom(supportEntrances));

	const orderData = {order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}};
	let spawnTruck = false;
	switch (supportWaveIdx % 3)
	{
	case 0: // Halftracks & Cyborgs
		spawnTruck = true;
		let halfBorgDroids = [
			cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Lancers
			cTempl.commraht, cTempl.commraht, // 2 MRAs
			cTempl.cybth, cTempl.cybth, cTempl.cybth, // 3 Thermite Flamers
			cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, // 3 Heavy Machinegunners
		];
		if (supportWaveIdx >= 5) halfBorgDroids = camArrayReplaceWith(halfBorgDroids, cTempl.cybhg, cTempl.cybag); // Replace with Assault Gunners
		// Send 'em in!
		camSendReinforcement(CAM_THE_COLLECTIVE, chosenEntrance, halfBorgDroids, CAM_REINFORCE_GROUND, orderData);
		break;
	case 1: // Sensor + Bombards
		spawnTruck = true;

		// Spawn the sensor and its escorts
		let sensorGroupDroids = [
			cTempl.comsensht, // 1 Sensor
			cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 6 Bombards
			cTempl.comatht, cTempl.comatht, // 2 Lancers
		];
		if (supportWaveIdx >= 5 || difficulty >= HARD) sensorGroupDroids = sensorGroupDroids.concat([cTempl.cohript, cTempl.cohript]); // Add Ripple Rockets
		if (supportWaveIdx >= 5) sensorGroupDroids = camArrayReplaceWith(sensorGroupDroids, cTempl.comatht, cTempl.comhatht); // Replace with Tank Killers
		camSendReinforcement(CAM_THE_COLLECTIVE, chosenEntrance, sensorGroupDroids, CAM_REINFORCE_GROUND, orderData);
		break;
	case 2: // Annoying Hover Bastards
		let hoverDroids = [
			cTempl.comath, cTempl.comath, // 2 Lancers
			cTempl.comhpvh, cTempl.comhpvh, // 2 HVCs
			cTempl.commrah, cTempl.commrah, // 2 MRAs
			cTempl.combbh, // 1 Bunker Buster
		];
		if (supportWaveIdx >= 5) hoverDroids = camArrayReplaceWith(hoverDroids, cTempl.commrah, cTempl.cohhrah); // Replace with HRAs
		if (supportWaveIdx >= 5 && difficulty >= MEDIUM) hoverDroids = camArrayReplaceWith(hoverDroids, cTempl.comath, cTempl.comhath); // Replace with Tank Killers
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject("colEntry5"), hoverDroids, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("hoverPatrolPos1"),
					camMakePos("hoverPatrolPos2"),
					camMakePos("hoverPatrolPos3"),
					camMakePos("hoverPatrolPos4"),
				],
				interval: camSecondsToMilliseconds(20)
			}
		});
		break;
	}
	supportWaveIdx++;

	if (spawnTruck)
	{
		// Find a job for the new truck
		// Just iterate over the jobs until we find an empty one...
		let job = colTruckJob1;
		if (camDef(camGetTruck(colTruckJob1))) job = colTruckJob2;
		if (camDef(camGetTruck(colTruckJob2))) job = colTruckJob3;
		if (camDef(camGetTruck(colTruckJob3))) job = colTruckJob4;
		if (camDef(camGetTruck(colTruckJob4))) return; // All jobs filled!

		const truckPos = camMakePos(chosenEntrance);
		const truckTemp = cTempl.comtruckht; // Truck Panther Half-tracks
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, truckPos, truckTemp);
		camAssignTruck(newTruck, job);
	}
}

// Land Collective Super Cyborgs at a random built LZ
function sendCollectiveTransporter()
{
	// Set reinforcement droids
	let cyborgPool = [
		cTempl.cybla, // Lancer
		cTempl.cybth, // Thermite Flamer
		cTempl.cybag, // Assault Gunner
		cTempl.scygr, // Super Grenadier
		cTempl.scyhr, // Super Heavy Rockets
		cTempl.scymc, // Super Heavy Gunner
	];
	if (supportWaveIdx >= 5) cyborgPool = camArrayReplaceWith(cyborgPool, cTempl.cybla, cTempl.scytk); // Replace with Super Tank Killers
	if (supportWaveIdx >= 5) cyborgPool = camArrayReplaceWith(cyborgPool, cTempl.scymc, cTempl.scyac); // Replace with Super Auto-Cannons

	const droids = [];
	for (let i = 0; i < 10; i++)
	{
		droids.push(camRandFrom(cyborgPool));
	}

	// Get all available LZs
	const lzPool = [];
	if (!camBaseIsEliminated("colLZ1")) lzPool.push(camMakePos("landingZoneCollective1"));
	if (!camBaseIsEliminated("colLZ2")) lzPool.push(camMakePos("landingZoneCollective2"));
	if (!camBaseIsEliminated("colLZ3")) lzPool.push(camMakePos("landingZoneCollective3"));
	if (!camBaseIsEliminated("colLZ4")) lzPool.push(camMakePos("landingZoneCollective4"));

	// If we have a valid LZ, send the transport
	if (lzPool.length > 0)
	{
		camSendReinforcement(CAM_THE_COLLECTIVE, camRandFrom(lzPool), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: {x: 80, y: 20},
				exit: {x: 80, y: 20},
			}
		);
	}
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
			cTempl.infmonmrl,
			cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.inffiretruck, // Fire Trucks
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		].concat((difficulty >= EASY) ? cTempl.vilestinger : []), // Add a Vile Stinger
		[ // Light tanks & cyborgs + some scav stuff
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcybmr, // Mini-Rocket Cyborgs
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
		].concat((difficulty >= EASY) ? cTempl.infcommcant : []), // Add a Medium Cannon tank
		[ // Bashers, Stingers, and Infantry
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		].concat((difficulty >= EASY) ? cTempl.vilestinger : []), // Add a Vile Stinger
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 14;
	let bChance = 0;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	// NOTE: The entrances are numbered differently from A3L2...
	const entrances = ["infEntry1", "infEntry2", "infEntry4", "infEntry5"];

	const NUM_GROUPS = difficulty + 2;
	const NUM_ENTRANCES = entrances.length;
	for (let i = 0; i < (Math.min(NUM_ENTRANCES, NUM_GROUPS)); i++)
	{
		// Spawn units at a random entrance
		const INDEX = camRand(entrances.length);

		camSendReinforcement(CAM_INFESTED, getObject(entrances[INDEX]), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance),
			CAM_REINFORCE_GROUND);

		entrances.splice(INDEX, 1);
	}
}

// Start spawning Charlie reinforcements to help clear the map
function eventMissionTimeout()
{
	// Dialogue about incoming Charlie reinforcements
	camQueueDialogue([
		{text: "CHARLIE: Bravo, we're here!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: We'll help you push the Collective back!", delay: 3, sound: CAM_RCLICK},
	]);

	sendCharlieReinforcements();
	setTimer("sendCharlieReinforcements", camSecondsToMilliseconds(30));

	reinforcementsArrived = true;
	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camMinutesToSeconds(15)));
	}
	else
	{
		setMissionTime(-1);
	}

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A3L5S", {
		ignoreInfestedUnits: true
	});
	camSetExtraObjectiveMessage();
}

function sendCharlieReinforcements()
{
	const commTemplates = camGetRefillableGroupTemplates(charlieCommander);
	const groupTemplates = camGetRefillableGroupTemplates(charlieCommandGroup);

	if (commTemplates.length > 0)
	{
		// Spawn Charlie's commander
		const commDroid = camAddDroid(MIS_TEAM_CHARLIE, "infEntry3", commTemplates[0]);
		addLabel(commDroid, "charlieCommander");
		camSetDroidRank(commDroid, MIS_ALLY_COMMANDER_RANK);
		camAssignToRefillableGroups([commDroid], charlieCommander);
	}

	if (groupTemplates.length > 0)
	{
		// Spawn Charlie's command units
		const newDroids = camSendReinforcement(MIS_TEAM_CHARLIE, getObject("infEntry3"), groupTemplates, CAM_REINFORCE_GROUND);
		camAssignToRefillableGroups(enumGroup(newDroids), charlieCommandGroup);
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "A3L5S", {
		ignoreInfestedUnits: true
	});
	camSetExtraObjectiveMessage(_("Survive until the timer reaches zero"));

	setAlliance(MIS_TEAM_CHARLIE, CAM_HUMAN_PLAYER, true);
	camSetObjectVision(MIS_TEAM_CHARLIE);
	changePlayerColour(MIS_TEAM_CHARLIE, (playerData[0].colour !== 11) ? 11 : 5); // Charlie to bright blue or blue

	setMissionTime(camMinutesToSeconds(18));

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(camA3L4AllyResearch, MIS_TEAM_CHARLIE);

	camSetEnemyBases({
		// These LZs can be built later by enemy trucks:
		"colLZ1": {
			cleanup: "colLZArea1",
			detectMsg: "COL_LZBASE1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colLZ2": {
			cleanup: "colLZArea2",
			detectMsg: "COL_LZBASE2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colLZ3": {
			cleanup: "colLZArea3",
			detectMsg: "COL_LZBASE3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colLZ4": {
			cleanup: "colLZArea4",
			detectMsg: "COL_LZBASE4",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
	});

	// Collective trucks
	colTruckJob1 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZ1",
			rebuildBase: true,
			structset: camA3L4ColLZ1Structs
	});
	colTruckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZ2",
			rebuildBase: true,
			structset: camA3L4ColLZ2Structs
	});
	colTruckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZ3",
			rebuildBase: true,
			structset: camA3L4ColLZ3Structs
	});
	colTruckJob4 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZ4",
			rebuildBase: true,
			structset: camA3L4ColLZ4Structs
	});

	// (allied) Refillable groups
	charlieCommander = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.plmcomht],
		}, CAM_ORDER_ATTACK, {
	});
	charlieCommandGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 6 Lancers, 6 Assault Gunners, 4 HVCs, 2 Cyclones
				cTempl.plmatht, cTempl.plmatht, cTempl.plmatht, cTempl.plmatht, cTempl.plmatht, cTempl.plmatht,
				cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag,
				cTempl.plmhpvht, cTempl.plmhpvht, cTempl.plmhpvht, cTempl.plmhpvht,
				cTempl.plmhaaht, cTempl.plmhaaht,
			],
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieCommander",
			suborder: CAM_ORDER_ATTACK
	});

	heavyWaveIdx = 1;
	supportWaveIdx = 1;
	reinforcementsArrived = false;

	queue("startCollectiveAttacks", camChangeOnDiff(camSecondsToMilliseconds(20)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
	heliAttack();
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(120)));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3)));

	// Give player briefing.
	camPlayVideos({video: "A3L4_BRIEF", type: MISS_MSG});

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Give the fog a pink hue
	camSetFog(24, 16, 64);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Add a purple-blue tint
	camSetSunIntensity(.55, .5, .6);
}