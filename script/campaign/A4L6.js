include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");
// This missions's script has been split into multiple files because it's so big
// But this missions is basically 3 different missions in a trenchcoat anyway
include("script/campaign/A4L6s1.js");
include("script/campaign/A4L6s2.js");
include("script/campaign/A4L6s3.js");

const MIS_TEAM_CHARLIE = 1;
const MIS_TEAM_DELTA = 5;
const MIS_CIVS = 6; // Civilians waiting to be rescued
const MIS_CIV_ESCORTS = 7; // Civilians after being collected

const MIS_TRANSPORT_MAX_TIME = camMinutesToSeconds(3); // 3 minutes max
const MIS_TRANSPORT_START_TIME = camMinutesToSeconds(1.5); // 1.5 minutes for the first transport
const MIS_TRANSPORT_TIME_INCREMENT = 15; // Increase transport time by 15 seconds per transport
const DORDER_GUARD = 25; // Order number for guarding an droid/structure
const MIS_ALLY_COMMANDER_RANK = "Hero";
const MIS_ALLY_UNIT_RANK = "Regular";
const MIS_ALLY_TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds(65), true);
const MIS_ALLY_ENGINEER_TIME = camChangeOnDiff(camSecondsToMilliseconds(35), true);
const MIS_ALLY_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(2.5), true);
const MIS_HOVER_THRESHOLD = 16;

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
	// Upgrades for the Avenger SAM:
	"R-Wpn-Missile-Accuracy01", "R-Wpn-Missile-Damage01", "R-Wpn-Missile-ROF01",
];
const mis_nexusBonusResearch = [
	"R-Wpn-Missile-Accuracy01", "R-Wpn-Missile-Damage01", "R-Wpn-Missile-ROF01",
	"R-Wpn-Rail-Damage01", "R-Wpn-Rail-ROF01",
];

// This mission is divided into 3 "stages"
// stage 1: escort civilian groups using Transport Trucks back to the safe haven
// stage 2: expand the map; escort Delta's transport group back to their base
// stage 3: survive against the Collective onslaught for 20 minutes
var stage;
var transportIndex;
var transportTime;
var depositBeaconActive;
var deltaUnitIDs;
var numDeltaRescued; // Becomes true if at least 1 unit makes it back to base
var firstDeltaTransport;
var reinforcementIndex;
var charlieCommanderDeathTime;
var deltaCommanderDeathTime;
var collectiveRetreat;
var colCommanderIndex;
var colCommanderRank;
var truckLostThreshold;
var holdoutDonated;
var allowAllyExpansion;

// Store structure sets for later
var charlieMainBaseStructs;
var deltaMainBaseStructs;
var deltaHoldoutStructs;
var colBase1Structs;
var colBase2Structs;
var colBase3Structs;
var colBase4Structs;
var colBase5Structs;

// Track which assault blips are active
var groundBlips;
var airBlips;

// Various groups
var charlieCommander;
var charlieCommandGroup;
var deltaCommander;
var deltaCommandGroup;
var deltaGrenadierGroup;
var deltaCrashGroup;
var nxGroupST;

// Truck jobs (wow there's a lot of these)
var colBaseTruckJob1;
var colBaseTruckJob2;
var colBaseTruckJob3;
var colBaseTruckJob4;
var colBaseTruckJob5;
var colBaseTruckJob6;
var colBaseTruckJob7;
var colBaseTruckJob8;
var colBaseTruckJob9;
var colBaseTruckJob10;
var colBaseTruckJob11;
var colBaseTruckJob12;
var colBaseTruckJob13;
var colBaseTruckJob14;
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
var charlieTruckJob1;
var charlieTruckJob2;
var charlieTruckJob3;
var deltaTruckJob1;
var deltaTruckJob2;
var deltaTruckJob3;
var deltaTruckJob4;

// Civilian holdout groups
var civGroups;

// Whether each civilian group has been loaded onto a truck
var civsLoaded;

// Whether each truck has arrived the deposit zone
var truck1Safe;
var truck2Safe;
var truck3Safe;
var truck4Safe;
var truck5Safe;

function sendCharlieTransporter()
{
	// Stop sending transports after stage 2
	if (stage > 2)
	{
		removeTimer("sendCharlieTransporter");
		return;
	}

	// Bring in a few trucks
	// NOTE: If these trucks aren't needed when we land, we'll just quietly remove them
	// We also use these transports to "deliver" civilians to the haven
	camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZoneCharlie"), [cTempl.plhtruckht, cTempl.plhtruckht, cTempl.plhtruckht],
		CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("transporterEntryCharlie"),
			exit: camMakePos("transporterEntryCharlie")
		}
	);
}

function sendDeltaTransporter()
{
	// Stop sending transports after stage 2
	if (stage > 2)
	{
		removeTimer("sendDeltaTransporter");
		return;
	}

	// Bring in a few trucks
	const droids = [cTempl.plhtruckht, cTempl.plhtruckht, cTempl.plhtruckht, cTempl.plhtruckht];
	if (firstDeltaTransport)
	{
		// If this is Delta's first transport, also include some attack units
		droids.push(cTempl.plhcomht, cTempl.scyac, cTempl.scyac, cTempl.plhrepht, cTempl.plhacanht, cTempl.plhacanht);
	}
	camSendReinforcement(MIS_TEAM_DELTA, camMakePos("landingZoneDelta"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("transporterEntryDelta"),
			exit: camMakePos("transporterEntryDelta")
		}
	);
}

// Send a Collective transport to one of the built LZs (if any exist)
function sendCollectiveTransporter()
{
	let landingZones = [];

	// Always land at the west LZ if it's built
	if (!camBaseIsEliminated("colWestLZ")) landingZones = ["landingZoneCollective6"];

	if (landingZones.length === 0)
	{
		// Choose any of the built central LZs if the west LZ is unbuilt
		if (!camBaseIsEliminated("colSouthLZ")) landingZones.push("landingZoneCollective5");
		if (!camBaseIsEliminated("colNorthLZ")) landingZones.push("landingZoneCollective4");
		if (!camBaseIsEliminated("colCentralLZ")) landingZones.push("landingZoneCollective3");
	}

	if (landingZones.length === 0)
	{
		// Choose any of the built east LZs if all the LZs to the west are unbuilt
		if (!camBaseIsEliminated("colNorthEastLZ")) landingZones.push("landingZoneCollective2");
		if (!camBaseIsEliminated("colSouthEastLZ")) landingZones.push("landingZoneCollective1");
	}

	if (landingZones.length === 0)
	{
		return; // No LZs built; check again later
	}

	// Get a pool of possible templates
	let droidPool = [
		cTempl.cybth, // Thermite Flamer Cyborg
		cTempl.cybag, // Assault Gunner Cyborg
		cTempl.scytk, // Super TK Cyborg
		cTempl.scygr, // Super Grenadier Cyborg
		cTempl.scyhr, // Super HRA Cyborg
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
	if (difficulty === INSANE)
	{
		numDroids = 10;
	}
	else if (difficulty >= MEDIUM)
	{
		numDroids = 8;
	}

	for (let i = 0; i < numDroids; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	const entryPos = (stage === 1) ? camMakePos("vtolAttackPos1") : camMakePos("vtolAttackPos4");

	camSendReinforcement(CAM_THE_COLLECTIVE, camRandFrom(landingZones), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: entryPos,
			exit: entryPos,
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			}
		}
	);
}

function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		if (transportIndex === 0)
		{			
			// Transfer all Charlie units/structures in the donate area to the player
			const objs = enumArea("charlieDonateArea", MIS_TEAM_CHARLIE, false);
			camEnsureDonateObject(objs, CAM_HUMAN_PLAYER);

			queue("setVictory", camSecondsToMilliseconds(1));
		}
		else if (transportIndex === 1)
		{
			camQueueDialogue([
				{text: "LIEUTENANT: Commander Bravo, Collective activity in the city is increasing.", delay: 4, sound: CAM_RCLICK},
				{text: "LIEUTENANT: It'll be increasingly difficult to get here from your old base.", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: Which means it'll take longer for transports to arrive later on.", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: So keep that in mind when loading your forces.", delay: 3, sound: CAM_RCLICK},
			]);
		}
		transportIndex++;
		transportTime = MIS_TRANSPORT_TIME_INCREMENT * (transportIndex - 1) + MIS_TRANSPORT_START_TIME;

		setReinforcementTime(Math.min(transportTime, MIS_TRANSPORT_MAX_TIME));
	}
	else if (transport.player === MIS_TEAM_CHARLIE)
	{
		// Assign trucks...
		// NOTE: Charlie's transports ONLY have trucks!
		const transTrucks = camGetTransporterDroids(transport.player);
		const truckJobs = [charlieTruckJob1, charlieTruckJob2, charlieTruckJob3];

		// Assign any trucks
		let truckIndex = 0;
		for (const job of truckJobs)
		{
			// Check if we have an open job and an available truck
			if (!camDef(camGetTruck(job)) && camDef(transTrucks[truckIndex]))
			{
				// Assign this truck!
				camAssignTruck(transTrucks[truckIndex], job);
				truckIndex++;
			}
		}
		for (let i = truckIndex; i < transTrucks.length; i++)
		{
			// Remove any leftover trucks
			camSafeRemoveObject(transTrucks[i]);
		}

		// Drop off civilians
		civilianDropOff("landingZoneCharlie");
	}
	else if (transport.player === MIS_TEAM_DELTA)
	{
		// Assign trucks...
		const transDroids = camGetTransporterDroids(transport.player);
		
		const truckJobs = [deltaTruckJob1, deltaTruckJob2, deltaTruckJob3, deltaTruckJob4];

		const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
		const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

		// Assign any trucks
		let truckIndex = 0;
		for (const job of truckJobs)
		{
			// Check if we have an open job and an available truck
			if (!camDef(camGetTruck(job)) && camDef(transTrucks[truckIndex]))
			{
				// Assign this truck!
				camAssignTruck(transTrucks[truckIndex], job);
				truckIndex++;
			}
		}
		for (let i = truckIndex; i < transTrucks.length; i++)
		{
			// Remove any leftover trucks
			camSafeRemoveObject(transTrucks[i]);
		}

		if (firstDeltaTransport) 
		{
			// If this is Delta's first transport, also assign their commander/command group
			for (const droid of transOther)
			{
				// Find the command droid and label/rank it
				if (droid.droidType === DROID_COMMAND)
				{
					addLabel(droid, "deltaCommander");
					camSetDroidRank(getObject("deltaCommander"), MIS_ALLY_COMMANDER_RANK);
				}
				else
				{
					// Set to default rank
					camSetDroidRank(droid, MIS_ALLY_UNIT_RANK);
				}
			}

			// Assign other units to their refillable groups
			camAssignToRefillableGroups(transOther, [deltaCommander, deltaCommandGroup]);

			firstDeltaTransport = false;
		}

		// Drop off civilians
		civilianDropOff("landingZoneDelta");
	}
	// Don't care about Collective transports here...
}

// Drop off a bunch of civilians from the given LZ
function civilianDropOff(spawnArea)
{
	const NUM_CIVS = camRand(5) + 6; // 6 to 10 civilians
	const civDroids = [];
	for (let i = 0; i < NUM_CIVS; i++)
	{
		// Spawn civilians
		civDroids.push(camAddDroid(MIS_CIVS, camRandPosIn(spawnArea), cTempl.civ, _("Civilian")));
	}
	// ...and then move them towards the deposit zone
	camManageGroup(camMakeGroup(civDroids), CAM_ORDER_DEFEND, {pos: camMakePos("depositZone")});
}

// Send various Collective ground forces from entrances around the map
function sendCollectiveReinforcements()
{
	let groundEntrances = [];
	let groundCompositions = [];
	let hoverEntrances = [];
	let hoverTemplates = [];
	let aaSupport;

	if (stage === 1)
	{
		groundEntrances = [
			"groundEntry7", "groundEntry8", "groundEntry17",
		];

		groundCompositions = [
			[
				cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, cTempl.cybhg, // 4 HMG Cyborgs
				cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, // 4 MRPs
				cTempl.cominft, // 1 Inferno
			],
			[
				cTempl.cybca, cTempl.cybca, cTempl.cybca, // 3 Heavy Gunners
				cTempl.scymc, cTempl.scymc, // 2 Super Heavy Gunners
				cTempl.commcant, cTempl.commcant, // 2 Medium Cannons
				cTempl.cohhcant, // 1 Heavy Cannon
			],
			[
				cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 3 HMGs
				cTempl.comagt, // 1 Assault Gun
				cTempl.cybgr, cTempl.cybgr, cTempl.cybgr, // 3 Grenadiers
				cTempl.scygr, cTempl.scygr, // 2 Super Grenadier
			],
			[
				cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, // 3 Flamer Cyborgs
				cTempl.cybmr, cTempl.cybmr, // 2 MRA Cyborgs
				cTempl.comatt, cTempl.comatt, // 2 Lancer
				cTempl.commrat, cTempl.commrat, cTempl.commrat, // 3 MRAs
			],
		];

		aaSupport = ((difficulty >= HARD) ? cTempl.comhaat : cTempl.colaaht);
	}
	else if (stage === 2)
	{
		groundEntrances = [
			"groundEntry9", "groundEntry11", "groundEntry13",
			"groundEntry15",
		];
		hoverEntrances = [
			"hoverEntry3", "hoverEntry4", "hoverEntry6",
		];

		groundCompositions = [
			[
				cTempl.cybag, cTempl.cybag, cTempl.cybag, cTempl.cybag, // 4 Assault Gunners
				cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
				cTempl.cominft, cTempl.cominft, // 2 Infernos
			],
			[
				cTempl.scymc, cTempl.scymc, cTempl.scymc, // 3 Super Heavy Gunners
				cTempl.scyac, cTempl.scyac, // 2 Super Auto Gunners
				cTempl.commcant, cTempl.commcant, cTempl.commcant, // 3 Medium Cannons
				cTempl.comacant, cTempl.comacant, // 2 Assault Cannons
				cTempl.cohhcant, // 1 Heavy Cannon
			],
			[
				cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
				cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr, // 4 Super Grenadiers
				cTempl.cohbbt, // 1 Bunker Buster
			],
			[
				cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamer Cyborgs
				cTempl.scyhr, cTempl.scyhr, // 2 Super HRA Cyborgs
				cTempl.scytk, // 1 Super TK Cyborg
				cTempl.comhatt, cTempl.comhatt, // 2 Tank Killers
				cTempl.cohhrat, cTempl.cohhrat, // 2 HRAs
			],
		];

		hoverTemplates = [
			cTempl.comhpvh, cTempl.comhpvh,
			cTempl.comath, cTempl.comath,
			cTempl.commrah, cTempl.commrah,
			cTempl.combbh,
		];

		aaSupport = ((difficulty === INSANE) ? cTempl.cohraat : cTempl.comhaat);
	}
	else // stage 3
	{
		// More entrances are enabled as the timer ticks down
		hoverEntrances = [
			"hoverEntry3", "hoverEntry4", "hoverEntry6",
		];
		if (difficulty >= HARD || getMissionTime() < camMinutesToSeconds(16))
		{
			hoverEntrances.push("hoverEntry5");

			if (difficulty === INSANE || getMissionTime() < camMinutesToSeconds(8))
			{
				hoverEntrances.push("hoverEntry1", "hoverEntry2");
			}
		}

		hoverTemplates = [
			cTempl.comhpvh, cTempl.comhpvh,
			cTempl.comhath, cTempl.comhath,
			cTempl.cohhrah, cTempl.cohhrah,
			cTempl.cohbbh,
		];

		aaSupport = ((difficulty >= HARD || getMissionTime() < camMinutesToSeconds(10)) ? cTempl.cohraat : cTempl.comhaat);
	}

	// Spawn units from every active ground entrance
	if (groundCompositions.length > 0)
	{
		for (const entrance of groundEntrances)
		{
			sendCollectiveGroundReinforcements(camRandFrom(groundCompositions), entrance, aaSupport);
		}
	}

	// Spawn a few groups from the active hover entrances
	if (hoverEntrances.length > 0)
	{
		let numHoverGroups = 1;
		if (stage === 3) numHoverGroups++;
		if (difficulty >= MEDIUM) numHoverGroups++;
		if (difficulty === INSANE) numHoverGroups++;
		for (let i = 0; i < numHoverGroups; i++)
		{
			sendCollectiveHoverReinforcements(hoverTemplates, camRandFrom(hoverEntrances));
		}
	}

	// Finally, send trucks to build/maintain Collective LZs
	if (reinforcementIndex % 2 == 0)
	{
		sendCollectiveTrucks();
	}

	reinforcementIndex++;
}

function sendCollectiveGroundReinforcements(templates, entrance, aaSupport)
{
	// Add AA support
	if ((difficulty <= EASY && camRand(2) === 0) || difficulty >= MEDIUM)
	{
		templates.push(aaSupport);
		if (difficulty === INSANE && camRand(2) === 0)
		{
			// 1/2 chance of adding an extra AA unit on Insane
			templates.push(aaSupport);
		}
	}

	camSendReinforcement(CAM_THE_COLLECTIVE, getObject(entrance), templates, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_ATTACK,
		data: {
			targetPlayer: CAM_HUMAN_PLAYER
		}
	});
}

function sendCollectiveHoverReinforcements(templates, entrance)
{
	const droids = [];
	for (const template of templates)
	{
		droids.push(template);
	}

	let groupData;
	if (enumDroid(CAM_THE_COLLECTIVE).filter((droid) => (droid.propulsion === "hover01")).length < MIS_HOVER_THRESHOLD)
	{
		// If there aren't already a bunch of hover tanks, tell the new group to patrol
		groupData = {order: CAM_ORDER_PATROL, data: {
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("hoverPatrolPos2"),
				camMakePos("hoverPatrolPos3"),
				camMakePos("hoverPatrolPos4"),
				camMakePos("hoverPatrolPos5"),
				camMakePos("hoverPatrolPos6"),
			],
			interval: camSecondsToMilliseconds(28),
			radius: 20,
			repair: 60
		}};
	}
	else
	{
		// Otherwise, tell the group to attack
		groupData = {order: CAM_ORDER_ATTACK, data: {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 40
		}};
	}

	camSendReinforcement(CAM_THE_COLLECTIVE, getObject(entrance), droids, CAM_REINFORCE_GROUND, groupData);
}

function sendCollectiveTrucks()
{
	// Southeast LZ
	if (stage >= 2 && !camDef(camGetTruck(colLZTruckJob1)) && camAreaSecure("colLZ1", CAM_THE_COLLECTIVE))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry10", cTempl.comtruckt), colLZTruckJob1);
	}
	// Northeast LZ
	if (stage >= 2 && !camDef(camGetTruck(colLZTruckJob2)) && camAreaSecure("colLZ2", CAM_THE_COLLECTIVE))
	{
		camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry8", cTempl.comtruckt), colLZTruckJob2);
	}
	// Central LZ
	if (camBaseIsEliminated("charlieCentralBase") && camAreaSecure("colLZ3", CAM_THE_COLLECTIVE))
	{
		if (!camDef(camGetTruck(colLZTruckJob3)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry17", cTempl.comtruckht), colLZTruckJob3);
		}
		if (!camDef(camGetTruck(colLZTruckJob4)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry17", cTempl.comtruckht), colLZTruckJob4);
		}
	}
	// North LZ
	if (camBaseIsEliminated("deltaNorthBase") && camAreaSecure("colLZ4", CAM_THE_COLLECTIVE))
	{
		if (!camDef(camGetTruck(colLZTruckJob5)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry3", cTempl.comtruckt), colLZTruckJob5);
		}
		if (!camDef(camGetTruck(colLZTruckJob6)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry3", cTempl.comtruckt), colLZTruckJob6);
		}
	}
	// South LZ
	if (camBaseIsEliminated("charlieSouthBase") && camAreaSecure("colLZ5", CAM_THE_COLLECTIVE))
	{
		if (!camDef(camGetTruck(colLZTruckJob7)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry5", cTempl.comtruckt), colLZTruckJob7);
		}
		if (!camDef(camGetTruck(colLZTruckJob8)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry6", cTempl.comtruckt), colLZTruckJob8);
		}
	}
	// West LZ
	if (civsLoaded[5] && camBaseIsEliminated("deltaNorthBase") && camAreaSecure("colLZ6", CAM_THE_COLLECTIVE))
	{
		if (!camDef(camGetTruck(colLZTruckJob9)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry2", cTempl.comtruckt), colLZTruckJob9);
		}
		if (!camDef(camGetTruck(colLZTruckJob10)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry2", cTempl.comtruckt), colLZTruckJob10);
		}
	}
	
	// Collective bases
	if (stage >= 2)
	{
		// Ground Shaker base
		if (!camDef(camGetTruck(colBaseTruckJob1)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry12", cTempl.comtruckt), colBaseTruckJob1);
		}
		if (!camDef(camGetTruck(colBaseTruckJob2)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry13", cTempl.comtruckt), colBaseTruckJob2);
		}
		if (!camDef(camGetTruck(colBaseTruckJob3)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry12", cTempl.comtruckht), colBaseTruckJob3);
		}
		if (!camDef(camGetTruck(colBaseTruckJob4)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry13", cTempl.comtruckht), colBaseTruckJob4);
		}
		// Overlook base
		if (!camDef(camGetTruck(colBaseTruckJob5)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry14", cTempl.comtruckt), colBaseTruckJob5);
		}
		if (!camDef(camGetTruck(colBaseTruckJob6)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry14", cTempl.comtruckt), colBaseTruckJob6);
		}
		// Ripple base
		if (!camDef(camGetTruck(colBaseTruckJob7)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry14", cTempl.comtruckt), colBaseTruckJob7);
		}
		if (!camDef(camGetTruck(colBaseTruckJob8)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry14", cTempl.comtruckt), colBaseTruckJob8);
		}
		// Trench base
		if (!camBaseIsEliminated("colTrenchOutpost"))
		{
			if (!camDef(camGetTruck(colBaseTruckJob9)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry15", cTempl.comtruckht), colBaseTruckJob9);
			}
			if (!camDef(camGetTruck(colBaseTruckJob10)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry15", cTempl.comtruckht), colBaseTruckJob10);
			}
		}
		// Factory base
		if (!camDef(camGetTruck(colBaseTruckJob11)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry11", cTempl.comtruckt), colBaseTruckJob11);
		}
		if (!camDef(camGetTruck(colBaseTruckJob12)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry11", cTempl.comtruckt), colBaseTruckJob12);
		}
		if (!camDef(camGetTruck(colBaseTruckJob13)))
		{
			camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry11", cTempl.comtruckht), colBaseTruckJob13);
		}
		// Central base
		if (camBaseIsEliminated("deltaEastBase") && camAreaSecure("colBase6", CAM_THE_COLLECTIVE))
		{
			if (!camDef(camGetTruck(colBaseTruckJob14)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry10", cTempl.comtruckt), colBaseTruckJob14);
			}
			if (!camDef(camGetTruck(colBaseTruckJob15)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry12", cTempl.comtruckht), colBaseTruckJob15);
			}
			if (!camDef(camGetTruck(colBaseTruckJob16)))
			{
				camAssignTruck(camAddDroid(CAM_THE_COLLECTIVE, "groundEntry13", cTempl.comtruckht), colBaseTruckJob16);
			}
		}
	}
}

// Update Charlie's group orders as the level progresses
function charlieGroupUpdate()
{
	// At the start (!allowAllyExpansion), defend the west side of the southern bridge
	// If expansion is allowed, defending the west side of the southern bridge
	// If the bridge base is built, move up and PATROL the south base area
	// If the south base is built, move up and DEFEND the central base position
	// If the central base is built AND the map has expanded (stage > 1), ATTACK towards the Collective's GS base
	// If in the final defense stage (stage == 3), ATTACK

	if (!allowAllyExpansion)
	{
		return; // do nothing here
	}

	let order;
	let data;

	if (stage == 3)
	{
		// ATTACK
		order = CAM_ORDER_ATTACK;
		data = {
			repair: 75,
			removable: false
		};
	}
	else if (!camBaseIsEliminated("charlieCentralBase") && stage > 1)
	{
		// ATTACK towards the Collective's GS base
		order = CAM_ORDER_ATTACK;
		data = {
			pos: camMakePos("colBase1"),
			repair: 75,
			removable: false
		};
	}
	else if (!camBaseIsEliminated("charlieSouthBase"))
	{
		// DEFEND the central base position
		order = CAM_ORDER_DEFEND;
		data = {
			pos: camMakePos("southPatrolPos4"),
			radius: 32,
			repair: 75,
			removable: false
		};
	}
	else if (!camBaseIsEliminated("charlieBridgeBase"))
	{
		// PATROL the south base area
		order = CAM_ORDER_PATROL;
		data = {
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("southPatrolPos2"),
				camMakePos("southPatrolPos3"),
			],
			interval: camSecondsToMilliseconds(35),
			radius: 32,
			repair: 75,
			removable: false
		};
	}
	else // (allowAllyExpansion == true)
	{
		// DEFEND the west side of the southern bridge
		order = CAM_ORDER_DEFEND;
		data = {
			pos: camMakePos("southPatrolPos1"),
			radius: 32,
			repair: 75,
			removable: false
		};
	}

	// Apply the new orders
	camManageGroup(charlieCommander, order, data);
	// NOTE: Charlie's command group (the units following the commander) have their suborders updated when reaching stage 2
}

// Update Delta's group orders as the level progresses
function deltaGroupUpdate()
{
	// At the start (!allowAllyExpansion), defend nw bridges
	// If expansion is allowed, move up and PATROL the north area of the map
	// If the north base is built, PATROL the north area of the map further east
	// If the north base is built AND the map has expanded (stage > 1), move up and PATROL the east base area
	// If the east base is built, ATTACK towards the Collective's factory base
	// If in the final defense stage (stage == 3), ATTACK

	if (!allowAllyExpansion)
	{
		return; // do nothing here
	}

	let order;
	let data;

	if (stage == 3)
	{
		// ATTACK
		order = CAM_ORDER_ATTACK;
		data = {
			repair: 50,
			removable: false
		};
	}
	else if (!camBaseIsEliminated("deltaEastBase") && stage > 1)
	{
		// ATTACK towards the Collective's factory base
		order = CAM_ORDER_ATTACK;
		data = {
			pos: camMakePos("colBase5"),
			repair: 50,
			removable: false
		};
	}
	else if (!camBaseIsEliminated("deltaNorthBase") && stage > 1)
	{
		// PATROL the east base area
		order = CAM_ORDER_PATROL;
		data = {
			pos: [
				camMakePos("northPatrolPos5"),
				camMakePos("southPatrolPos4"),
				camMakePos("southPatrolPos6"),
			],
			interval: camSecondsToMilliseconds(75),
			radius: 20,
			repair: 50,
			removable: false
		};
	}
	else if (!camBaseIsEliminated("deltaNorthBase"))
	{
		// PATROL the north area of the map
		order = CAM_ORDER_PATROL;
		data = {
			pos: [
				camMakePos("northPatrolPos2"),
				camMakePos("northPatrolPos3"),
				camMakePos("northPatrolPos4"),
			],
			interval: camSecondsToMilliseconds(75),
			radius: 20,
			repair: 50,
			removable: false
		};
	}
	else // (allowAllyExpansion == true)
	{
		// PATROL the north area of the map
		order = CAM_ORDER_PATROL;
		data = {
			pos: [
				camMakePos("northPatrolPos2"),
				camMakePos("northPatrolPos3"),
			],
			interval: camSecondsToMilliseconds(75),
			radius: 20,
			repair: 50,
			removable: false
		};
	}

	// Also make Delta's groups more aggressive
	camManageGroup(deltaCommander, order, data);
	camManageGroup(deltaGrenadierGroup, order, data);
	// NOTE: Delta's command group (the units following the commander) have their suborders updated when reaching stage 2
}

// Set victory data
// Called on a delay to avoid failing the player if Charlie's units aren't transferred fast enough
function setVictory()
{
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, CAM_A4_OUT, {
		showArtifacts: false
	});

	camSetExtraObjectiveMessage(
		[_("Use Trucks to escort civilians back to the haven"),
			"Don't lose " + truckLostThreshold + " Transport Trucks (" + trucksLost + " LOST)"]
	);
}

function eventAttacked(victim, attacker)
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (victim.player == CAM_THE_COLLECTIVE)
	{
		camCallOnce("collectiveDialogue");
	}
}

function eventTransporterExit(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		// libcampaign won't automatically play this on this mission
		playSound(cam_sounds.reinforcementsAreAvailable);
	}
}

function eventDestroyed(obj)
{
	if (obj.type === DROID)
	{
		if (obj.player === CAM_HUMAN_PLAYER)
		{
			if (stage === 1 && obj.droidType === DROID_CONSTRUCT)
			{
				const label = getLabel(obj);
				if (!camDef(label))
				{
					return; // Don't care
				}

				if (label === "civTruck1" && !truck1Safe)
				{
					// Transport Truck destroyed before reaching the deposit zone
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}
				if (label === "civTruck2" && !truck2Safe)
				{
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}
				if (label === "civTruck3" && !truck3Safe)
				{
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}
				if (label === "civTruck4" && !truck4Safe)
				{
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}
				if (label === "civTruck5" && !truck5Safe)
				{
					trucksLost++;
					playSound(cam_sounds.objective.objectiveDestroyed);
				}

				if (!transportTrucksActive())
				{
					// If there are no transport trucks active, remove the deposit beacon
					hackRemoveMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
					depositBeaconActive = false;
				}

				// Update the objective message
				camSetExtraObjectiveMessage(
					[_("Use Trucks to escort civilians back to the haven"),
						"Don't lose " + truckLostThreshold + " Transport Trucks (" + trucksLost + " LOST)"]
				);

				checkTrucksLost();
				checkCivsDone();
			}
			else if (stage === 2)
			{
				// Check if Delta's transport team was wiped out
				deltaGroupAlive();
			}
		}
		else if (obj.droidType === DROID_COMMAND)
		{
			// Mark when allied commanders die
			if (obj.player === MIS_TEAM_CHARLIE)
			{
				charlieCommanderDeathTime = gameTime;
			}
			else if (obj.player === MIS_TEAM_DELTA)
			{
				deltaCommanderDeathTime = gameTime;
			}
		}
	}
}

// Re-label Charlie's/Delta's commander/sensor
function eventDroidBuilt(droid, structure)
{
	if (droid.player === MIS_TEAM_CHARLIE)
	{
		if (droid.droidType === DROID_COMMAND)
		{
			// Charlie commander rebuilt
			addLabel(droid, "charlieCommander");
			camSetDroidRank(getObject("charlieCommander"), MIS_ALLY_COMMANDER_RANK);
		}
		else
		{
			// Set to default rank
			camSetDroidRank(droid, MIS_ALLY_UNIT_RANK);
		}
	}
	else if (droid.player === MIS_TEAM_DELTA)
	{
		if (droid.droidType === DROID_COMMAND)
		{
			// Delta commander rebuilt
			addLabel(droid, "deltaCommander");
			camSetDroidRank(getObject("deltaCommander"), MIS_ALLY_COMMANDER_RANK);
		}
		else
		{
			// Set to default rank
			camSetDroidRank(droid, MIS_ALLY_UNIT_RANK);

			if (droid.droidType === DROID_SENSOR)
			{
				// Delta sensor
				addLabel(droid, "deltaVtolSensor");
			}
		}
		
	}
}

// Store the IDs of the Delta's transport units when they're given to the player
// Also handle civilian escorts
function eventObjectTransfer(obj, from)
{
	if (obj.type === DROID)
	{
		if (obj.player === CAM_HUMAN_PLAYER && from === MIS_TEAM_DELTA)
		{
			deltaUnitIDs.push(obj.id);
		}
		else if (obj.player === MIS_CIV_ESCORTS && from === MIS_CIVS)
		{
			// Order this unit to guard a nearby Transport Truck
			// Just look for any labeled truck within 20 tiles
			const transTruck = enumRange(obj.x, obj.y, 20, CAM_HUMAN_PLAYER, false).filter((obj) => 
				(obj.type === DROID && obj.droidType === DROID_CONSTRUCT && camDef(getLabel(obj)))
			)[0];

			if (camDef(transTruck) && transTruck !== null)
			{
				// Guard this truck!
				orderDroidObj(obj, DORDER_GUARD, transTruck);
			}
		}
		else if (obj.player === MIS_TEAM_DELTA && from === CAM_HUMAN_PLAYER)
		{
			// Delta transporter unit safely returned to Delta's base
			if (obj.droidType === DROID_CONSTRUCT)
			{
				// If it's a truck, order it to maintain Delta's base
				camManageTrucks(
					MIS_TEAM_DELTA, {
						label: "deltaMainBase",
						rebuildBase: true,
						rebuildTruck: false,
						truckDroid: obj,
						structset: deltaMainBaseStructs
				});
			}
			else
			{
				// Otherwise, place it in Delta's command group (even if it's full!)
				groupAdd(deltaCommandGroup, obj);
			}
		}
	}
}

// Delay when Charlie/Delta can rebuild their commanders
function allowCharlieCommanderRebuild()
{
	return (gameTime >= charlieCommanderDeathTime + MIS_ALLY_COMMANDER_DELAY) && (enumStruct(MIS_TEAM_CHARLIE, COMMAND_CONTROL).length > 0);
}

function allowDeltaCommanderRebuild()
{
	return (gameTime >= deltaCommanderDeathTime + MIS_ALLY_COMMANDER_DELAY) && (enumStruct(MIS_TEAM_DELTA, COMMAND_CONTROL).length > 0);
}

function allowCharlieGeneralVtolGroup()
{
	return (stage >= 2);
}

// End the campaign in victory
function endGame()
{
	camPlayVideos({video: "A4L6_TRANSPORT", type: CAMP_MSG});
	queue("camEndMission", camSecondsToMilliseconds(0.1));
}

function trackTransporter()
{
	// Get the camera to follow the transporter
	// Transporter is the only droid of the player's on the map at this point
	const transporter = enumDroid();
	cameraTrack(transporter[0]);
}

// Needed to ensure the NEXUS units fleeing can be triggered after a save/load
function eventGameLoaded()
{
	if (groupSize(nxGroupST) > 0)
	{
		addLabel({type: GROUP, id: nxGroupST}, "nxGroupST", false);
		resetLabel("nxGroupST", CAM_HUMAN_PLAYER); // subscribe for eventGroupSeen
	}
}

// If the NEXUS units are spotted, make them flee
function eventGroupSeen(viewer, group)
{
	if (group === nxGroupST)
	{
		camCallOnce("nexusFlee");
	}
}

function nexusFlee()
{
	const escapePos = camMakePos("nxRemoveTrigger");
	const droids = enumGroup(nxGroupST);
	for (const droid of droids)
	{
		// Move towards the escape trigger
		orderDroidLoc(droid, DORDER_MOVE, escapePos.x, escapePos.y);
	}
}

// Quietly remove the NEXUS droids when reaching the trigger
camAreaEvent("nxRemoveTrigger", function(droid)
{
	const droids = enumDroid(CAM_NEXUS);
	for (const droid of droids)
	{
		camSafeRemoveObject(droid);
	}
});

function eventStartLevel()
{
	// const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz
	const transportEntryPos = camMakePos("transporterEntry");

	setMissionTime(-1); // No time limit for this stage of the mission

	centreView(transportEntryPos.x, transportEntryPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	setAlliance(MIS_TEAM_CHARLIE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_DELTA, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_DELTA, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_CIVS, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CIVS, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_CIVS, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_CIVS, MIS_TEAM_DELTA, true);
	setAlliance(MIS_CIV_ESCORTS, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CIV_ESCORTS, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_CIV_ESCORTS, MIS_TEAM_DELTA, true);
	setAlliance(MIS_CIV_ESCORTS, MIS_CIVS, true);
	setAlliance(CAM_NEXUS, CAM_THE_COLLECTIVE, true);
	setAlliance(CAM_NEXUS, MIS_TEAM_CHARLIE, true);
	setAlliance(CAM_NEXUS, MIS_TEAM_DELTA, true);

	// Set up allied vision
	camSetObjectVision(MIS_TEAM_CHARLIE);
	camSetObjectVision(MIS_TEAM_DELTA);
	camSetObjectVision(MIS_CIV_ESCORTS);

	changePlayerColour(CAM_NEXUS, (playerData[0].colour !== 3) ? 3 : 14); // NEXUS to black or ultraviolet
	changePlayerColour(MIS_TEAM_CHARLIE, (playerData[0].colour !== 11) ? 11 : 5); // Charlie to bright blue or blue
	changePlayerColour(MIS_TEAM_DELTA, (playerData[0].colour !== 1) ? 1 : 8); // Delta to orange or yellow
	changePlayerColour(MIS_CIVS, 10); // Civilians to white
	changePlayerColour(MIS_CIV_ESCORTS, 10);

	camSetArtifacts({
		"colShakerEmp": { tech: "R-Wpn-HvyHowitzer" }, // Ground Shaker
	});

	camCompleteRequiredResearch(camA4L5AllyResearch, MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(camA4L5AllyResearch, MIS_TEAM_DELTA);
	camCompleteRequiredResearch(camA4L5AllyResearch, MIS_CIVS);
	camCompleteRequiredResearch(camA4L5AllyResearch, MIS_CIV_ESCORTS);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_NEXUS);
	camCompleteRequiredResearch(mis_nexusBonusResearch, CAM_NEXUS);

	camSetEnemyBases({
		"colShakerBase": {
			cleanup: "colBase1",
			detectMsg: "COL_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colOverlookBase": {
			cleanup: "colBase2",
			detectMsg: "COL_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colRippleBase": {
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
		"colFactoryBase": {
			cleanup: "colBase5",
			detectMsg: "COL_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colCentralBase": {
			cleanup: "colBase6",
			detectMsg: "COL_BASE6",
			player: CAM_THE_COLLECTIVE,
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"colSouthEastLZ": {
			cleanup: "colLZ1",
			detectMsg: "COL_LZ1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colNorthEastLZ": {
			cleanup: "colLZ2",
			detectMsg: "COL_LZ2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colCentralLZ": {
			cleanup: "colLZ3",
			detectMsg: "COL_LZ3",
			player: CAM_THE_COLLECTIVE,
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colNorthLZ": {
			cleanup: "colLZ4",
			detectMsg: "COL_LZ4",
			player: CAM_THE_COLLECTIVE,
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colSouthLZ": {
			cleanup: "colLZ5",
			detectMsg: "COL_LZ5",
			player: CAM_THE_COLLECTIVE,
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colWestLZ": {
			cleanup: "colLZ6",
			detectMsg: "COL_LZ6",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		// Friendly bases
		"charlieMainBase": {
			cleanup: "charlieBase1",
			friendly: true
		},
		"charlieBridgeBase": {
			cleanup: "charlieBase2",
			friendly: true
		},
		"charlieSouthBase": {
			cleanup: "charlieBase3",
			player: MIS_TEAM_CHARLIE,
			friendly: true
		},
		"charlieCentralBase": {
			cleanup: "charlieBase4",
			player: MIS_TEAM_CHARLIE,
			friendly: true
		},
		"deltaMainBase": {
			cleanup: "deltaBase1",
			friendly: true
		},
		"deltaNorthBase": {
			cleanup: "deltaBase2",
			player: MIS_TEAM_DELTA,
			friendly: true
		},
		"deltaEastBase": {
			cleanup: "deltaBase3",
			player: MIS_TEAM_DELTA,
			friendly: true
		},
		"deltaCrashHoldout": {
			cleanup: "deltaBase4",
			friendly: true
		},
	});

	const FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(80), true);
	const CYBORG_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(40), true);
	const VTOL_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(110), true);
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
			// Heavy tanks
			templates: [ cTempl.cohhcant, cTempl.cohraat, cTempl.cohhrat, cTempl.cohhcant ]
		},
		"colFactory2": {
			assembly: "colAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 35
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(85)),
			// Heavy + medium tanks
			templates: [ cTempl.cohhcant, cTempl.comhatt, cTempl.cominft ]
		},
		"colFactory3": {
			assembly: "colAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 45
			},
			groupSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(75)),
			// Half-tracks
			templates: [ cTempl.comhatht, cTempl.comaght, cTempl.comhpvht, cTempl.comhatht ]
		},
		"colCybFactory1": {
			assembly: "colCybAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Thermite Flamers + Super HRA Cyborgs
			templates: [ cTempl.cybth, cTempl.scyhr ]
		},
		"colCybFactory2": {
			assembly: "colCybAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 25
			},
			groupSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(45)),
			// Super Cyborgs
			templates: [ cTempl.scytk, cTempl.scyac ]
		},

		"charlieFactory1": {
			throttle: FACTORY_TIME,
			// These factories hold no templates; they just restock refillable groups
			templates: []
		},
		"charlieFactory2": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"charlieCybFactory1": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"charlieCybFactory2": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"charlieCybFactory3": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"charlieVtolFactory": {
			assembly: "charlieVtolAssembly",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},

		"deltaFactory1": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"deltaFactory2": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"deltaFactory3": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"deltaCybFactory1": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"deltaCybFactory2": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"deltaVtolFactory1": {
			assembly: "deltaVtolAssembly",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},
		"deltaVtolFactory2": {
			assembly: "deltaVtolAssembly",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},
	});

	setReinforcementTime(MIS_TRANSPORT_START_TIME);

	// Auto-replace labels
	camAutoReplaceObjectLabel(["colCC", "deltaVtolTower1"]);
	// These structures aren't on the map at the start...
	camAutoReplaceObjectLabel("charlieVtolTower1", {player: MIS_TEAM_CHARLIE, x: 69, y: 73, stattype: DEFENSE});
	camAutoReplaceObjectLabel("charlieVtolTower2", {player: MIS_TEAM_CHARLIE, x: 117, y: 77, stattype: DEFENSE});
	camAutoReplaceObjectLabel("charlieVtolTower3", {player: MIS_TEAM_CHARLIE, x: 122, y: 53, stattype: DEFENSE});
	camAutoReplaceObjectLabel("deltaVtolTower2", {player: MIS_TEAM_DELTA, x: 107, y: 14, stattype: DEFENSE});
	camAutoReplaceObjectLabel("deltaVtolTower3", {player: MIS_TEAM_DELTA, x: 154, y: 47, stattype: DEFENSE});

	stage = 1;
	depositBeaconActive = false;
	truck1Safe = false;
	truck2Safe = false;
	truck3Safe = false;
	truck4Safe = false;
	trucksLost = 0;
	civGroups = [
		null,
		camNewGroup(), // #1
		camNewGroup(), // #2
		camNewGroup(), // #3
		camNewGroup(), // #4
		camNewGroup()  // #5
	];
	civsLoaded = [
		null,
		false, // #1
		false, // #2
		false, // #3
		false, // #4
		false  // #5
	];
	transportIndex = 0;
	deltaUnitIDs = [];
	numDeltaRescued = 0;
	firstDeltaTransport = true;
	reinforcementIndex = 1;
	transportTime = MIS_TRANSPORT_START_TIME;
	charlieCommanderDeathTime = 0;
	deltaCommanderDeathTime = 0;
	collectiveRetreat = false;
	colCommanderIndex = 1;
	colCommanderRank = Math.max(5, difficulty + 4); // Veteran to Hero
	truckLostThreshold = (difficulty >= MEDIUM) ? 2 : 3;
	holdoutDonated = false;
	allowAllyExpansion = false;

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
		false, // Blip #12
		false, // Blip #13
		false, // Blip #14
		false, // Blip #15
		false, // Blip #16
	];
	airBlips = [
		null,
		null,
		false, // Blip #2
		false, // Blip #3
		false, // Blip #4
		false, // Blip #5
	];

	deltaCrashGroup = camMakeGroup("deltaCrashGroup");

	// Refillable groups
	charlieCommander = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.plhcomht],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			callback: "allowCharlieCommanderRebuild"
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("southPatrolPos1"),
			radius: 32,
			repair: 75
	});
	charlieCommandGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 5 Tank Killers, 4 Whirlwinds, 1 Sensor, 6 Super HVCs, 6 Assault Gunners
				cTempl.plhhatht, cTempl.plhhatht,
				cTempl.plhraaht, cTempl.plhraaht,
				cTempl.scyhc, cTempl.scyhc, cTempl.scyhc,
				cTempl.cybag, cTempl.cybag, cTempl.cybag,
				cTempl.plhhatht, cTempl.plhhatht, cTempl.plhhatht,
				cTempl.plhraaht, cTempl.plhraaht,
				cTempl.plhsensht,
				cTempl.scyhc, cTempl.scyhc, cTempl.scyhc,
				cTempl.cybag, cTempl.cybag, cTempl.cybag,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			// NOTE: This group can refill even if the commander is dead
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieCommander",
			repair: 75,
			suborder: CAM_ORDER_DEFEND, // Retreat back to base if the commander dies
			data: {
				pos: camMakePos("southPatrolPos1"),
				radius: 32,
				repair: 75
			}
	});
	// Charlie VTOL attack group
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Tank Killers, 3 Assault Guns, 3 HEAP Bombs, 3 Thermite Bombs
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmhbombv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmhbombv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmhbombv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			callback: "allowCharlieGeneralVtolGroup"
		}, CAM_ORDER_ATTACK, {
			repair: 75
	});
	// Charlie VTOL tower groups
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Guns, 2 Thermite Bombs
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			obj: "charlieVtolTower1"
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieVtolTower1",
			repair: 75,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("charlieVtolAssembly"),
				radius: 28,
				repair: 75
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Guns, 2 Thermite Bombs
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			obj: "charlieVtolTower2"
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieVtolTower2",
			repair: 75,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("charlieVtolAssembly"),
				radius: 28,
				repair: 75
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Guns, 2 Thermite Bombs
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
				cTempl.plmhatv, cTempl.plmagv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_CHARLIE,
			obj: "charlieVtolTower3"
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieVtolTower3",
			repair: 75,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("charlieVtolAssembly"),
				radius: 28,
				repair: 75
			}
	});

	deltaCommander = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.plhcomht],
			globalFill: true,
			player: MIS_TEAM_DELTA,
			callback: "allowDeltaCommanderRebuild"
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("northPatrolPos1"),
			radius: 32,
			repair: 50
	});
	deltaCommandGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 8 Assault Cannons, 3 Repair Turrets, 2 Whirlwinds, 8 Super Auto-Cannons, 1 VTOL Strike Turret
				cTempl.plhacanht, cTempl.plhacanht, cTempl.plhacanht,
				cTempl.plhrepht,
				cTempl.plhraaht,
				cTempl.plhstrikeht,
				cTempl.plhacanht, cTempl.plhacanht, cTempl.plhacanht,
				cTempl.plhrepht,
				cTempl.plhraaht, 
				cTempl.plhacanht, cTempl.plhacanht,
				cTempl.plhrepht,
				cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac,
				cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA,
			// NOTE: This group can refill even if the commander is dead
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaCommander",
			repair: 50,
			suborder: CAM_ORDER_DEFEND, // Retreat back to base if the commander dies
			data: {
				pos: camMakePos("northPatrolPos1"),
				radius: 32,
				repair: 50
			}
	});
	deltaGrenadierGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 8 Super Grenadiers
				cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr,
				cTempl.scygr, cTempl.scygr, cTempl.scygr, cTempl.scygr,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA,
		}, CAM_ORDER_DEFEND, {
			pos: camMakePos("northPatrolPos1"),
			radius: 32,
			repair: 50
	});
	// Delta VTOL sensor group
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 HVCs, 4 Assault Guns
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaVtolSensor",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("deltaVtolAssembly"),
				repair: 50,
				radius: 28
			}
	});
	// Delta VTOL tower groups
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 HVCs, 4 Assault Guns
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA,
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaVtolTower1",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("deltaVtolAssembly"),
				repair: 50,
				radius: 28
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 HVCs, 4 Assault Guns
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA,
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaVtolTower2",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("deltaVtolAssembly"),
				repair: 50,
				radius: 28
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 HVCs, 4 Assault Guns
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
				cTempl.plmhpvv, cTempl.plmhpvv,
				cTempl.plmagv, cTempl.plmagv,
			],
			globalFill: true,
			player: MIS_TEAM_DELTA,
		}, CAM_ORDER_FOLLOW, {
			leader: "deltaVtolTower3",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("deltaVtolAssembly"),
				repair: 50,
				radius: 28
			}
	});

	charlieMainBaseStructs = camAreaToStructSet("charlieBase1");
	deltaMainBaseStructs = camAreaToStructSet("deltaBase1");
	deltaHoldoutStructs = camAreaToStructSet("deltaBase4");
	colBase1Structs = camAreaToStructSet("colBase1");
	colBase2Structs = camAreaToStructSet("colBase2");
	colBase3Structs = camAreaToStructSet("colBase3");
	colBase4Structs = camAreaToStructSet("colBase4");
	colBase5Structs = camAreaToStructSet("colBase5");

	// Manage Trucks...
	// NOTE: More trucks start being managed layer as the mission progresses...
	// Charlie trucks
	charlieTruckJob1 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			truckDroid: getObject("charlieTruck1"),
			structset: charlieMainBaseStructs
	});
	charlieTruckJob2 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			truckDroid: getObject("charlieTruck2"),
			structset: charlieMainBaseStructs
	});
	charlieTruckJob3 = camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			truckDroid: getObject("charlieTruck3"),
			structset: charlieMainBaseStructs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			truckDroid: getObject("charlieEngineer"),
			structset: charlieMainBaseStructs
	});	

	// Delta trucks
	deltaTruckJob1 = camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			structset: deltaMainBaseStructs
	});
	deltaTruckJob2 = camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			structset: deltaMainBaseStructs
	});
	deltaTruckJob3 = camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			structset: deltaMainBaseStructs
	});
	deltaTruckJob4 = camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaMainBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			structset: deltaMainBaseStructs
	});

	// Collective LZ trucks
	colLZTruckJob1 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthEastLZ",
			rebuildBase: true,
			rebuildTruck: false, // Collective trucks are brought in as reinforcements
			structset: camA4L6ColLZ1Structs
	});
	colLZTruckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthEastLZ",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColLZ2Structs
	});
	colLZTruckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck5"), // This truck starts pre-placed on the map
			structset: camA4L6ColLZ3Structs
	});
	colLZTruckJob4 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck6"),
			structset: camA4L6ColLZ3Structs
	});
	colLZTruckJob5 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck1"),
			structset: camA4L6ColLZ4Structs
	});
	colLZTruckJob6 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck2"),
			structset: camA4L6ColLZ4Structs
	});
	colLZTruckJob7 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck3"),
			structset: camA4L6ColLZ5Structs
	});
	colLZTruckJob8 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthLZ",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("colLZTruck4"),
			structset: camA4L6ColLZ5Structs
	});
	colLZTruckJob9 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colWestLZ",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColLZ6Structs
	});
	colLZTruckJob10 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colWestLZ",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColLZ6Structs
	});

	// Remove some of the structures from the Collective's northern base
	// Also remove all of Delta's pre-placed structures
	// Also also remove all of Charlie's main defensive structures
	let deleteStructs = enumArea("colStructRemoveArea", CAM_THE_COLLECTIVE, false);
	deleteStructs = deleteStructs.concat(enumArea("deltaBase1", MIS_TEAM_DELTA, false));
	deleteStructs = deleteStructs.concat(enumArea("deltaBase4", MIS_TEAM_DELTA, false));
	deleteStructs = deleteStructs.concat(enumArea("charlieBase1", MIS_TEAM_CHARLIE, false).filter((obj) => 
		(obj.type === STRUCTURE && (obj.stattype === DEFENSE || obj.stattype === WALL))
	));
	for (const struct of deleteStructs)
	{
		camSafeRemoveObject(struct);
	}

	// Populate the civilian holdouts
	const templateLists = [
		null, // index 0
		[ // Northeast group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.buggy, cTempl.rbuggy, cTempl.bjeep, cTempl.bjeep, cTempl.bjeep, cTempl.gbjeep,
			cTempl.buscan, cTempl.buscan, cTempl.firetruck,
			cTempl.monmrl, cTempl.monfire,
		], 
		[ // Southeast group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.buggy, cTempl.gbjeep, cTempl.gbjeep, cTempl.trike, cTempl.rbuggy, cTempl.buggy,
			cTempl.sartruck, cTempl.buscan,
			cTempl.flatmrl, cTempl.flatat,
			cTempl.monhmg,
		], 
		[ // South river group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.gbjeep, cTempl.gbjeep, cTempl.gbjeep, cTempl.bjeep,
			cTempl.minitruck, cTempl.minitruck,
		],
		[ // North river group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.bjeep, cTempl.rbjeep, cTempl.bjeep,
			cTempl.firetruck, cTempl.buscan, cTempl.minitruck,
			cTempl.moncan,
		],
		[ // West group
			cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ, cTempl.civ,
			cTempl.buggy, cTempl.buggy, cTempl.rbuggy,
			cTempl.buscan,
		]
	];
	const civZones = [null, "civZone1", "civZone2", "civZone3", "civZone4", "civZone5"];
	for (let i = 1; i < 6; i++)
	{
		const templates = templateLists[i];
		const zone = getObject(civZones[i]);

		for (const template of templates)
		{
			// Choose a random position within the zone
			const pos = {x: zone.x + camRand(zone.x2 - zone.x), y: zone.y + camRand(zone.y2 - zone.y)};

			// Make some clean-looking names for the spawned units
			// ("Weapon Body Propulsion" doesn't look very good for scavenger units)
			let droidName = "";
			switch (template.body)
			{
				case "CivilianBody": 
					droidName = _("Civilian");
					break;
				case "B2JeepBody": 
				case "B2RKJeepBody": 
					droidName = _("Jeep");
					break;
				case "B4body-sml-trike01": 
					droidName = _("Trike");
					break;
				case "B3body-sml-buggy01": 
				case "B3bodyRKbuggy01": 
					droidName = _("Buggy");
					break;
				case "BusBody": 
					droidName = _("School Bus");
					break;
				case "FireBody": 
					droidName = _("Fire Truck");
					break;
				case "MonsterBus": 
					droidName = _("Bus Technical");
					break;
				case "MonsterFireBody": 
					droidName = _("Big Betty");
					break;
				case "ScavTruckBody": 
					droidName = _("Flatbed");
					break;
			}

			const newDroid = camAddDroid(MIS_CIVS, pos, template, droidName);
			groupAdd(civGroups[i], newDroid);
		}
	}

	// Place beacons over the civilian groups
	hackAddMessage("CIVS1", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS2", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS3", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS4", PROX_MSG, CAM_HUMAN_PLAYER);
	hackAddMessage("CIVS5", PROX_MSG, CAM_HUMAN_PLAYER);

	// Enable these factories immediately
	camEnableFactory("charlieFactory1");
	camEnableFactory("charlieFactory2");
	camEnableFactory("charlieCybFactory1");
	camEnableFactory("charlieCybFactory2");
	camEnableFactory("charlieCybFactory3");
	camEnableFactory("charlieVtolFactory");
	camEnableFactory("deltaFactory1");
	camEnableFactory("deltaFactory2");
	camEnableFactory("deltaFactory3");
	camEnableFactory("deltaCybFactory1");
	camEnableFactory("deltaCybFactory2");
	camEnableFactory("deltaVtolFactory1");
	camEnableFactory("deltaVtolFactory2");

	// Set up this sight trigger group
	nxGroupST = camMakeGroup(getObject("nxGroup"));
	addLabel({type: GROUP, id: nxGroupST}, "nxGroupST", false);
	resetLabel("nxGroupST", CAM_HUMAN_PLAYER); // subscribe for eventGroupSeen

	// Give player briefing.
	camPlayVideos({video: "A4L6_BRIEF", type: MISS_MSG});

	queue("trackTransporter", camSecondsToMilliseconds(0.25));
	queue("startDeltaTransports", camSecondsToMilliseconds(40));
	queue("startCollectiveReinforcments", camChangeOnDiff(camMinutesToMilliseconds(5)));
	setTimer("sendCharlieTransporter", camMinutesToMilliseconds(4));
	setTimer("charlieGroupUpdate", camMinutesToMilliseconds(1));
	setTimer("deltaGroupUpdate", camMinutesToMilliseconds(1));

	// Shrink the map
	setScrollLimits(0, 0, 162, 96);

	// Grant the player some starting power
	setPower(camChangeOnDiff(6000), CAM_HUMAN_PLAYER);

	// Clear skies
	camSetFog(198, 219, 225);
	camSetSunIntensity(.6,.6,.6);
	camSetWeather(CAM_WEATHER_CLEAR);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
}