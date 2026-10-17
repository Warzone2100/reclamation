include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const mis_infestedResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage04", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage04", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02", 
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];

var allowWin;
var lastTransportAlert;
var foxtrotCommanderDeathTime;
var teamUnitMaxRank;
var foxtrotActive;
var golfActive;
var allowFlanking;
var transportDialogueIndex;
var foxtrotIdx;
var golfIdx;

var foxtrotLzTruckJobs;
var foxtrotDefenseTruckJobs;
var golfLzTruckJobs;
var golfDefenseTruckJobs;

var foxtrotPatrolGroup;
var foxtrotCommandGroup;
var foxtrotHoverGroup;
var golfPatrolGroup;

const MIS_TEAM_FOXTROT = 5;
const MIS_TEAM_GOLF = 6;
const MIS_FOXTROT_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(2));
const MIS_MAX_FOXTROT_UNITS = 60;
const MIS_MAX_GOLF_UNITS = 60;

//Remove enemy vtols when in the remove zone area.
camAreaEvent("vtolRemoveZone", function(droid)
{
	if (droid.droidType !== DROID_SUPERTRANSPORTER)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("vtolRemoveZone", MIS_TEAM_GOLF);
});

function heliAttack()
{
	const list = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: [1, 1, 1],
		alternate: true
	};
	camSetVtolData(CAM_INFESTED, undefined, "vtolRemoveZone", list, camChangeOnDiff(camSecondsToMilliseconds(25)), undefined, ext);
}

// Team Golf misc. bomber attacks
function vtolAttack1()
{
	playSound(cam_sounds.enemyVtolsDetected);

	const vtolPositions = [
		"vtolAttackPos1",
		"vtolAttackPos2",
		"vtolAttackPos3",
		"vtolAttackPos4",
	];

	const list = [cTempl.plmbombv, cTempl.plmphosv];
	const ext = {
		minVTOLs: (difficulty >= HARD) ? 4 : 3,
		maxRandomVTOLs: (difficulty >= MEDIUM) ? ((difficulty >= HARD) ? 2 : 1) : 0,
		targetPlayer: CAM_HUMAN_PLAYER
	};

	camSetVtolData(MIS_TEAM_GOLF, vtolPositions, "vtolRemoveZone", list, camChangeOnDiff(camSecondsToMilliseconds(50)), undefined, ext);
}

// Team Golf strike bomber attacks
// (Focuses important player structures; always armed with Cluster Bombs)
function vtolAttack2()
{
	// Dialogue about VTOL sniping
	camQueueDialogue([
		{text: "FOXTROT: Golf, this is taking too long.", delay: 4, sound: CAM_RCLICK},
		{text: "FOXTROT: Use your VTOLs and snipe Bravo's base structures!", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: On it.", delay: 4, sound: CAM_RCLICK},
	]);

	const vtolPositions = [
		"vtolAttackPos1",
		"vtolAttackPos2",
		"vtolAttackPos3",
		"vtolAttackPos4",
	];

	const ext = {
		minVTOLs: (difficulty >= HARD) ? 4 : 3,
		maxRandomVTOLs: (difficulty >= MEDIUM) ? ((difficulty >= HARD) ? 2 : 1) : 0,
		targetPlayer: CAM_HUMAN_PLAYER,
		callback: "golfStrikeTargets"
	};

	camSetVtolData(MIS_TEAM_GOLF, vtolPositions, "vtolRemoveZone", [cTempl.plmbombv], camChangeOnDiff(camSecondsToMilliseconds(50)), undefined, ext);
}

// Random Golf bomber attacks
// (Similar to vtolAttack1, but spawn positions are random)
function vtolAttack3()
{
	const list = [cTempl.plmbombv, cTempl.plmphosv];
	const ext = {
		minVTOLs: (difficulty >= HARD) ? 4 : 3,
		maxRandomVTOLs: (difficulty >= MEDIUM) ? ((difficulty >= HARD) ? 2 : 1) : 0,
		targetPlayer: CAM_HUMAN_PLAYER
	};

	camSetVtolData(MIS_TEAM_GOLF, undefined, "vtolRemoveZone", list, camChangeOnDiff(camSecondsToMilliseconds(50)), undefined, ext);
}

// Returns a list of targets that should be focused by team Golf's bomber squadron
function golfStrikeTargets()
{
	// First, target any player Factories, Command Ceners, and Repair Facilities
	let targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
		struct.stattype === FACTORY || struct.stattype === CYBORG_FACTORY
		|| struct.stattype === VTOL_FACTORY || struct.stattype === HQ
		|| struct.stattype === REPAIR_FACILITY
	));

	if (targets.length === 0)
	{
		// Second, target any AA structures
		targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
			struct.stattype === DEFENSE && struct.canHitAir && !struct.canHitGround
		));
	}

	if (targets.length === 0)
	{
		// Lastly, target any non-wall structure
		targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (struct.stattype !== WALL));
	}

	return targets;
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
			cTempl.infcybla, // Lancers
			cTempl.infscymc, // Super Heavy Gunners
			cTempl.infscyhr, // Super Heavy Rockets
			cTempl.infcolpodt, cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infcolhmght, cTempl.infcolhmght, cTempl.infcolhmght, // HMGs
			cTempl.infcolcanht, cTempl.infcolcanht, cTempl.infcolcanht, // Light Cannons
			cTempl.infcommcant, cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, // Lancers
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		].concat((difficulty >= EASY) ? cTempl.infcohhcant : []), // Add a Heavy Cannon tank 
		[ // Bashers, Stingers, and Infantry
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		].concat((difficulty >= EASY) ? cTempl.infcomtruckt : []), // Add an Infested Truck
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;
	let bChance = 5;
	if (difficulty >= EASY) bChance += 5;
	if (difficulty >= HARD) bChance += 5;
	if (difficulty === INSANE) bChance += 5;

	const entrances = [
		"infEntry1", "infEntry2", "infEntry3",
		"infEntry4", "infEntry5", "infEntry10",
	];
	// Disable these once Foxtrot becomes active
	if (foxtrotActive) entrances.push("infEntry6", "infEntry7", "infEntry8", "infEntry9");
	// Disable these once Golf becomes active
	if (golfActive) entrances.push("infEntry11", "infEntry12", "infEntry13", "infEntry14", "infEntry15", "infEntry16", "infEntry17");
	// NOTE: Once flanking is enabled, this function stops being called

	const NUM_GROUPS = difficulty + 3;
	const NUM_ENTRANCES = entrances.length;
	for (let i = 0; i < (Math.min(NUM_ENTRANCES, NUM_GROUPS)); i++)
	{
		// Spawn units at a random entrance
		const INDEX = camRand(entrances.length);

		camSendReinforcement(CAM_INFESTED, getObject(entrances[INDEX]), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, bChance),
			CAM_REINFORCE_GROUND, {order: CAM_ORDER_ATTACK});

		entrances.splice(INDEX, 1);
	}
}

// A friendly message from our bestest ally Commander Foxtrot :)
function foxtrotTransmission()
{
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "A3L9_FOXTROT", type: MISS_MSG}]);

	// Additional dialogue
	camQueueDialogue([
		{text: "LIEUTENANT: Commander Foxtrot, wait!", delay: 6, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Clayde is the traitor!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We have proof! We can-", delay: 2, sound: CAM_RCLICK},
		{text: "FOXTROT: Can it, Lieutenant.", delay: 2, sound: CAM_RCLICK},
		{text: "FOXTROT: Clayde told us you'd try something like this.", delay: 3, sound: CAM_RCLICK},
		{text: "FOXTROT: The Supreme General has ordered for you to be put in custody.", delay: 3, sound: CAM_RCLICK},
		{text: "FOXTROT: ...Effective immediately.", delay: 3, sound: CAM_RCLICK},
		{text: "FOXTROT: So stand down, now!", delay: 2, sound: CAM_RCLICK},
		// Slight delay...
		{text: "LIEUTENANT: ...Commander Bravo, your transport is almost ready.", delay: 6, sound: CAM_RCLICK},
		{text: "LIEUTENANT: But Foxtrot is closing in on you fast.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...We can't let Clayde take us down now.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: So, do what you have to do.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Even if that means...", delay: 2, sound: CAM_RCLICK},
	]);
}

// Start bringing in Foxtrot units from the northweast
function activateFoxtrot()
{
	foxtrotActive = true;
	
	// Additional dialogue
	camQueueDialogue([
		{text: "FOXTROT: Commander Bravo, this is your FINAL warning.", delay: 0, sound: CAM_RCLICK},
		{text: "FOXTROT: Stand down immediately.", delay: 4, sound: CAM_RCLICK},
		{text: "FOXTROT: Or be met with lethal force.", delay: 2, sound: CAM_RCLICK},
	]);

	queue("sendFoxtrotGroundReinforcements", camChangeOnDiff(camSecondsToMilliseconds(30)));
	setTimer("sendFoxtrotGroundReinforcements", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	setTimer("sendFoxtrotTransporter", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
}

// Start bringing in Golf units from the southwest
function activateGolf()
{
	golfActive = true;
	camQueueDialogue([
		{text: "GOLF: Foxtrot, Team Charlie is MIA.", delay: 0, sound: CAM_RCLICK},
		{text: "GOLF: Looks like they fled in a hurry.", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: I'm en-route to Team Bravo's location now.", delay: 3, sound: CAM_RCLICK},
		{text: "FOXTROT: Good.", delay: 4, sound: CAM_RCLICK},
		{text: "FOXTROT: We can't let the Lieutenant and his Commanders slip away.", delay: 2, sound: CAM_RCLICK},
		{text: "FOXTROT: Get here ASAP.", delay: 3, sound: CAM_RCLICK},
	]);

	setTimer("sendGolfGroundReinforcements", camChangeOnDiff(camMinutesToMilliseconds(3)));
	setTimer("sendGolfTransporter", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
	queue("vtolAttack1", camChangeOnDiff(camMinutesToMilliseconds(1.5))); // Start sending Golf VTOLs as well
}

// Bring in Foxtrot/Golf units from every direction
function enableFlanking()
{
	allowFlanking = true;
	vtolAttack3();

	// Stop all Infested attacks
	removeTimer("sendInfestedReinforcements");

	// Dialogue flanking
	camQueueDialogue([
		{text: "FOXTROT: Golf, take your forces and flank Bravo from the southeast.", delay: 4, sound: CAM_RCLICK},
		{text: "FOXTROT: I'll move some squads northeast.", delay: 3, sound: CAM_RCLICK},
		{text: "FOXTROT: We have to move fast, before too many of Bravo's transports get away!", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: Got it!", delay: 4, sound: CAM_RCLICK},
	]);
}

function eventAttacked(victim, attacker) 
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (victim.player == MIS_TEAM_FOXTROT && attacker.player == CAM_HUMAN_PLAYER)
	{
		camCallOnce("foxtrotAttackDialogue");
	}

	if (victim.player == MIS_TEAM_GOLF && attacker.player == CAM_HUMAN_PLAYER)
	{
		camCallOnce("golfAttackDialogue");
	}
}

// Have Foxtrot complain about being shot at
function foxtrotAttackDialogue()
{
	camQueueDialogue([
		{text: "FOXTROT: You would attack your own allies, Bravo!?", delay: 2, sound: CAM_RCLICK},
		{text: "FOXTROT: ...It looks like the Supreme General was right.", delay: 4, sound: CAM_RCLICK},
		{text: "FOXTROT: We'll have to do this the hard way, after all.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Have Golf be mean to the Lieutenant
function golfAttackDialogue()
{
	camQueueDialogue([
		{text: "LIEUTENANT: Golf, please, I can explain-", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: Don't waste your time, Lieutenant.", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: ...How about you \"explain\" to Commander Bravo that they should surrender right now.", delay: 3, sound: CAM_RCLICK},
		{text: "GOLF: They're outgunned and outmatched, Lieutenant.", delay: 4, sound: CAM_RCLICK},
		{text: "GOLF: It's only a matter of time before they're brought down.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Foxtrot & Golf whine about transports
function transportDialogue(index)
{
	transportDialogueIndex++;

	switch (transportDialogueIndex)
	{
	case 1:
		camQueueDialogue([
			{text: "FOXTROT: Golf, we have to stop Bravo's transports!", delay: 4, sound: CAM_RCLICK},
			{text: "GOLF: That thing's way too armored, there's no way we'll be able to shoot it down.", delay: 4, sound: CAM_RCLICK},
			{text: "FOXTROT: Then we'll have to reach Bravo's LZ.", delay: 4, sound: CAM_RCLICK},
			{text: "FOXTROT: We can't let them get away too.", delay: 3, sound: CAM_RCLICK},
		]);
		break;
	case 2:
		camQueueDialogue([
			{text: "FOXTROT: Golf, Bravo's launched another transport!", delay: 4, sound: CAM_RCLICK},
			{text: "GOLF: Well, hurry up then!", delay: 4, sound: CAM_RCLICK},
			{text: "GOLF: If we don't catch Bravo, Clayde's going to have our heads.", delay: 4, sound: CAM_RCLICK},
		]);
		break;
	case 3:
		camQueueDialogue([
			{text: "FOXTROT: There goes another transport...", delay: 4, sound: CAM_RCLICK},
			{text: "GOLF: Why so scared, Bravo?", delay: 4, sound: CAM_RCLICK},
			{text: "GOLF: Are you that afraid of your former comrades?", delay: 3, sound: CAM_RCLICK},
			{text: "GOLF: To think... I used to admire you, Bravo.", delay: 3, sound: CAM_RCLICK},
		]);
		break;
	case 4:
		camQueueDialogue([
			{text: "GOLF: Oh for the love of-", delay: 4, sound: CAM_RCLICK},
			{text: "GOLF: Foxtrot, STOP those transports!", delay: 2, sound: CAM_RCLICK},
			{text: "FOXTROT: We're working on it, Golf!", delay: 4, sound: CAM_RCLICK},
		]);
		break;
	default:
		break;
	}
}

// Bring in Foxtrot halftracks and cyborgs
// Also bring in trucks if necessary
function sendFoxtrotGroundReinforcements()
{
	foxtrotIdx++;
	const truckEntrances = [ // Entrances that trucks arrive from
		"teamEntry11", "teamEntry12",
	];
	const attackEntrances = [ // Entrances that attack units arrive from
		"teamEntry11", "teamEntry12",
		"infEntry15", "infEntry16", "infEntry17",
		"infEntry18",
	];
	const flankEntrances = [ // Entrances that attack units arrive from when flanking the player
		"teamEntry1", "teamEntry2", "teamEntry13",
		"infEntry1", "infEntry2", "infEntry3",
	];

	// First, spawn any necessary trucks...
	const jobList = getMissingTrucks(foxtrotLzTruckJobs).concat(getMissingTrucks(foxtrotDefenseTruckJobs));

	for (const job of jobList)
	{
		// Bring in the trucks!
		const newTruck = camAddDroid(MIS_TEAM_FOXTROT, camMakePos(camRandFrom(truckEntrances)), cTempl.plhtruckht);
		camAssignTruck(newTruck, job);
	}

	if (countDroid(MIS_TEAM_FOXTROT) >= MIS_MAX_FOXTROT_UNITS)
	{
		return; // Abort here if Foxtrot already has too many units
	}

	// Now, bring in attack groups
	const templates = [
		cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super Tank Killers
		cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 4 Thermite Flamers
		cTempl.plhhaaht, cTempl.plhhaaht, // 2 Cyclones
		cTempl.plhbbht, cTempl.plhbbht, // 2 Bunker Busters
	];
	const entrances = (allowFlanking) ? attackEntrances.concat(flankEntrances) : attackEntrances;
	const NUM_SPAWNS = (allowFlanking) ? 4 : 2;
	for (let i = 0; i < NUM_SPAWNS; i++)
	{
		const entrance = camRandFrom(entrances);
		const reinforcements = camSendReinforcement(MIS_TEAM_FOXTROT, getObject(entrance), templates, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				regroup: true,
				count: -1,
				repair: (flankEntrances.includes(entrance)) ? 0 : 50 // Don't repair if flanking
			}
		});

		// Assign the standard rank
		const RANK = Math.min(Math.floor(foxtrotIdx / 2), teamUnitMaxRank); 
		camSetDroidRank(enumGroup(reinforcements), RANK);
	}
}

// Refill Foxtrot's special groups
function sendFoxtrotTransporter()
{
	// First, check if the LZ exists
	if (camBaseIsEliminated("foxtrotLz"))
	{
		return; // No LZ :(
	}

	// Make a list of droids to bring in in order of importance
	// Commander -> Command Group -> Patrol -> Hover
	let droidQueue = [];
	let commanderSent = false;
	const COMMANDER_ALIVE = getObject("foxtrotCommander") !== null;
	if (!COMMANDER_ALIVE && gameTime > foxtrotCommanderDeathTime + MIS_FOXTROT_COMMANDER_DELAY)
	{
		// A commander doesn't exist and enough time has passed since it died, bring in a new commander
		droidQueue.push(cTempl.plhcomw);
		commanderSent = true;
	}
	if (COMMANDER_ALIVE || commanderSent)
	{
		// Queue up any missing command group units
		droidQueue = droidQueue.concat(camGetRefillableGroupTemplates(foxtrotCommandGroup));
	}
	// Queue up any remaining missing units
	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([foxtrotPatrolGroup, foxtrotHoverGroup]));

	// Next, add grab some droids for the transport from the queue
	const droids = [];
	// Push droids from the queue into the transporter
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_FOXTROT, camMakePos("landingZoneFoxtrot"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camMakePos("transportEntryPosFoxtrot"),
				exit: camMakePos("transportEntryPosFoxtrot")
			}
		);
	}
}

// Bring in Golf tanks
// Also bring in trucks if necessary
function sendGolfGroundReinforcements()
{
	golfIdx++;
	const truckEntrances = [ // Entrances that trucks arrive from
		"teamEntry8", "teamEntry9",
	];
	const attackEntrances = [ // Entrances that attack units arrive from
		"teamEntry8", "teamEntry9",
		"infEntry11", "infEntry12", "infEntry13",
		"infEntry14",
	];
	const flankEntrances = [ // Entrances that attack units arrive from when flanking the player
		"teamEntry3", "teamEntry4", "teamEntry5",
		"teamEntry6", "teamEntry7",
		"infEntry8", "infEntry9",
	];

	// First, spawn any necessary trucks...
	const jobList = getMissingTrucks(golfLzTruckJobs).concat(getMissingTrucks(golfDefenseTruckJobs));

	for (const job of jobList)
	{
		// Bring in the trucks!
		const newTruck = camAddDroid(MIS_TEAM_GOLF, camMakePos(camRandFrom(truckEntrances)), cTempl.plhtruckt);
		camAssignTruck(newTruck, job);
	}

	if (countDroid(MIS_TEAM_GOLF) >= MIS_MAX_GOLF_UNITS)
	{
		return; // Abort here if Golf already has too many units
	}

	// Now, bring in attack groups
	const templates = [
		cTempl.plhacant, cTempl.plhacant, cTempl.plhacant, cTempl.plhacant, // 4 Assault Cannons
		cTempl.plhhrat, cTempl.plhhrat, // 2 HRAs
		cTempl.plhhaat, cTempl.plhhaat, // 2 Cyclones
	];
	const entrances = (allowFlanking) ? attackEntrances.concat(flankEntrances) : attackEntrances;
	const NUM_SPAWNS = (allowFlanking) ? 4 : 2;
	for (let i = 0; i < NUM_SPAWNS; i++)
	{
		const entrance = camRandFrom(entrances);
		const reinforcements = camSendReinforcement(MIS_TEAM_GOLF, getObject(entrance), templates, CAM_REINFORCE_GROUND, {
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: (flankEntrances.includes(entrance)) ? 0 : 50 // Don't repair if flanking
			}
		});

		// Assign the standard rank
		const RANK = Math.min(Math.floor(golfIdx / 2), teamUnitMaxRank); 
		camSetDroidRank(enumGroup(reinforcements), RANK);
	}
}

// Refill Golf's patrol group and bring in sensors + artillery
function sendGolfTransporter()
{
	// First, check if the LZ exists
	if (camBaseIsEliminated("golfLz"))
	{
		return; // No LZ present
	}

	// Make a list of droids to bring in in order of importance
	// Patrol -> Sensor + Artillery
	let droidQueue = [];
	// Queue up any missing patrol units
	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates(golfPatrolGroup));

	// Also queue up a sensor template
	droidQueue.push(cTempl.plhsenst);

	// Next, add grab some droids for the transport
	const droids = [];
	// Push droids from the queue into the transporter
	for (let i = 0; i < 10; i++)
	{
		if (camDef(droidQueue[i]))
		{
			droids.push(droidQueue[i]);
		}
		else
		{
			// If the queue is depleted, add a Howitzer instead
			droids.push(cTempl.plhhowt);
		}
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_GOLF, camMakePos("landingZoneGolf"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camMakePos("transportEntryPosGolf"),
				exit: camMakePos("transportEntryPosGolf")
			}
		);
	}
}

// Assign units to their respective groups
function eventTransporterLanded(transport)
{
	if (transport.player === MIS_TEAM_FOXTROT)
	{
		const transDroids = camGetTransporterDroids(transport.player);

		for (const droid of transDroids)
		{
			if (droid.droidType == DROID_COMMAND)
			{
				addLabel(droid, "foxtrotCommander");
				// Set the commander's rank (ranges from Elite to Hero): 
				camSetDroidRank(droid, (difficulty <= EASY) ? 6 : (difficulty + 4));
			}
			else
			{
				// Assign the standard rank
				const RANK = Math.min(Math.floor(foxtrotIdx / 2), teamUnitMaxRank); 
				camSetDroidRank(droid, RANK);
			}
		}

		// Assign units to their refillable groups
		camAssignToRefillableGroups(transDroids, [foxtrotPatrolGroup, foxtrotCommander, foxtrotCommandGroup, foxtrotHoverGroup]);
	}
	else if (transport.player === MIS_TEAM_GOLF)
	{
		const transDroids = camGetTransporterDroids(transport.player);

		// Assign the standard rank
		const RANK = Math.min(Math.floor(golfIdx / 2), teamUnitMaxRank); 
		camSetDroidRank(transDroids, RANK);

		camAssignToRefillableGroups(transDroids, golfPatrolGroup); // Any leftovers will attack the player
	}
}

function eventDestroyed(obj)
{
	if (obj.type === DROID && obj.player === MIS_TEAM_FOXTROT && obj.droidType === DROID_COMMAND)
	{
		// Prevent team Foxtrot from bringing in another commander for some time...
		foxtrotCommanderDeathTime = gameTime;
	}
}

// Loops through a truck job list, and returns a list of all the jobs with missing trucks
function getMissingTrucks(jobList)
{
	const missingList = [];
	for (const job of jobList)
	{
		if (!camDef(camGetTruck(job)))
		{
			// Truck doesn't exist, add it to the missing list
			missingList.push(job);
		}
	}

	return missingList;
}

// Allow a win if a transporter was launched.
// NOTE: The player doesn't have to transport a construction droid, since trucks will be given
// to the player at the start of Act 4.
function eventTransporterLaunch(transporter)
{
	if (transporter.player === CAM_HUMAN_PLAYER)
	{
		allowWin = true;

		if (golfActive)
		{
			transportDialogue();
		}
	}
}

function eventTransporterArrived(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		transportReturnAlert();
	}
}

// This function is needed to ensure that the return alert is only played ONCE per trip
function transportReturnAlert()
{
	if (lastTransportAlert + camSecondsToMilliseconds(30) < gameTime)
	{
		lastTransportAlert = gameTime;
		playSound(cam_sounds.transport.transportReturningToBase);
	}
}

function checkIfLaunched()
{
	if (allowWin)
	{
		return true;
	}
}

// function dumpStructSets()
// {
// 	camDumpStructSet("foxtrotDefenses", "camA3L9FoxtrotDefenseStructs");
// 	camDumpStructSet("foxtrotLzStructs", "camA3L9FoxtrotLZStructs");

// 	camDumpStructSet("golfDefenses", "camA3L9GolfDefenseStructs");
// 	camDumpStructSet("golfLzStructs", "camA3L9GolfLZStructs");
// }

// End the "warm-up" phase
function eventMissionTimeout()
{
	// Grant infinite time for the rest of the mission
	setMissionTime(-1);

	camSetStandardWinLossConditions(CAM_VICTORY_EVACUATION, "A4L1", {
		reinforcements: camMinutesToSeconds(3.5), // Duration the transport "leaves" map.
		gameOverOnDeath: false, // Don't fail when the player runs out of stuff
		callback: "checkIfLaunched"
	});

	const startPos = camMakePos("landingZone");
	const entryPos = camMakePos("transportEntryPos");

	// Place the transporter
	camSetupTransporter(startPos.x, startPos.y, entryPos.x, entryPos.y);
	playSound(cam_sounds.lz.returnToLZ);

	// Queue enemy attacks
	queue("activateFoxtrot", camMinutesToMilliseconds(1)); // Foxtrot units start arriving
	queue("activateGolf", camMinutesToMilliseconds(4)); // Golf units start arriving
	queue("vtolAttack2", camMinutesToMilliseconds(8)); // Golf strike VTOLs
	queue("enableFlanking", camMinutesToMilliseconds(12)); // Foxtrot/Golf begin flanking the player
}

// This mission is mostly sending Infested attack waves that eventually shift over to Foxtrot/Golf attack waves
function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "A4L1"); // Temporary until the warm-up phase is over
	camSetExtraObjectiveMessage(_("Evacuate as many units as possible"));

	// 4 minute "warm up" phase where nothing happens
	setMissionTime(camMinutesToSeconds(4));

	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Grant the teams all the tech the player has found until A3L7, plus the Sensor Upgrade
	const teamResearch = camA3L9EnemyResearch.concat(["R-Sys-Sensor-Upgrade01"]);

	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(teamResearch, MIS_TEAM_FOXTROT);
	camCompleteRequiredResearch(teamResearch, MIS_TEAM_GOLF);

	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(MIS_TEAM_FOXTROT, (PLAYER_COLOR !== 13) ? 13 : 4); // Foxtrot to infrared or red
	changePlayerColour(MIS_TEAM_GOLF, (PLAYER_COLOR !== 7) ? 7 : 12); // Golf to cyan or neon green

	setAlliance(MIS_TEAM_FOXTROT, MIS_TEAM_GOLF, true);

	// Foxtrot & Golf LZs
	camSetEnemyBases({
		"foxtrotLz": {
			cleanup: "foxtrotLzStructs",
			detectMsg: "FOXTROT_LZBASE",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: MIS_TEAM_FOXTROT
		},
		"golfLz": {
			cleanup: "golfLzStructs",
			detectMsg: "GOLF_LZBASE",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: MIS_TEAM_GOLF
		},
	});

	// Trucks...
	foxtrotLzTruckJobs = [];
	foxtrotDefenseTruckJobs = [];
	golfLzTruckJobs = [];
	golfDefenseTruckJobs = [];

	// Foxtrot trucks
	// 2 Trucks for LZ structures
	foxtrotLzTruckJobs.push(camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotLz",
			rebuildBase: true,
			structset: camA3L9FoxtrotLZStructs
	}));
	foxtrotLzTruckJobs.push(camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotLz",
			rebuildBase: true,
			structset: camA3L9FoxtrotLZStructs
	}));

	// 6 Trucks for general defenses
	foxtrotDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotDefenses",
			area: "foxtrotDefenses",
			structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotDefenses",
			area: "foxtrotDefenses",
			structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotDefenses",
			area: "foxtrotDefenses",
			structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotDefenses",
			area: "foxtrotDefenses",
			structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotDefenses",
			area: "foxtrotDefenses",
			structset: camA3L9FoxtrotDefenseStructs
	}));
	foxtrotDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotDefenses",
			area: "foxtrotDefenses",
			structset: camA3L9FoxtrotDefenseStructs
	}));

	// Golf trucks
	// 2 Trucks for LZ structures
	golfLzTruckJobs.push(camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfLz",
			rebuildBase: true,
			structset: camA3L9GolfLZStructs
	}));
	golfLzTruckJobs.push(camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfLz",
			rebuildBase: true,
			structset: camA3L9GolfLZStructs
	}));

	// 6 Trucks for general defenses
	golfDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfDefenses",
			area: "golfDefenses",
			structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfDefenses",
			area: "golfDefenses",
			structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfDefenses",
			area: "golfDefenses",
			structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfDefenses",
			area: "golfDefenses",
			structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfDefenses",
			area: "golfDefenses",
			structset: camA3L9GolfDefenseStructs
	}));
	golfDefenseTruckJobs.push(camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfDefenses",
			area: "golfDefenses",
			structset: camA3L9GolfDefenseStructs
	}));

	foxtrotPatrolGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.plhhatht, cTempl.plhhatht, cTempl.plhhatht, cTempl.plhhatht, // 4 Tank Killers
				cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 6 Thermite Flamers
				cTempl.plhhaaht, cTempl.plhhaaht, cTempl.plhhaaht, cTempl.plhhaaht, // 4 Cyclones
				cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 4 Super Tank Killers
			]
		}, CAM_ORDER_PATROL, {
			repair: 75,
			pos: [
				camMakePos("patrolPos10"),
				camMakePos("patrolPos11"),
				camMakePos("patrolPos12"),
			],
			interval: camSecondsToMilliseconds(32)
	});
	foxtrotHoverGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, cTempl.plhhath, // 8 Tank Killers
				cTempl.plhbbh, cTempl.plhbbh, cTempl.plhbbh, cTempl.plhbbh, // 4 Bunker Busters
				cTempl.plhinfh, cTempl.plhinfh, cTempl.plhinfh, cTempl.plhinfh, // 4 Infernos
			]
		}, CAM_ORDER_PATROL, {
			repair: 75,
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("hoverPatrolPos2"),
				camMakePos("hoverPatrolPos3"),
				camMakePos("hoverPatrolPos4"),
				camMakePos("hoverPatrolPos5"),
				camMakePos("hoverPatrolPos6"),
				camMakePos("hoverPatrolPos7"),
			],
			interval: camSecondsToMilliseconds(46)
	});
	foxtrotCommander = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.plhcomw],
		}, CAM_ORDER_ATTACK, {
			pos: [ // Focus on these spots first...
				camMakePos("patrolPos1"),
				camMakePos("patrolPos2"),
				camMakePos("patrolPos3"),
				camMakePos("patrolPos4"),
				camMakePos("patrolPos5"),
				camMakePos("patrolPos6"),
				camMakePos("patrolPos7"),
				camMakePos("patrolPos8"),
				camMakePos("patrolPos9"),
				camMakePos("patrolPos10"),
				camMakePos("patrolPos11"),
				camMakePos("patrolPos12"),
				camMakePos("focusPos1"),
				camMakePos("focusPos2"),
				camMakePos("focusPos3"),
			],
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 75
		});
	foxtrotCommandGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 6 Tank Killers, 6 BBs, 6 Thermite Cyborgs
				cTempl.plhhatw, cTempl.plhhatw,
				cTempl.plhbbw, cTempl.plhbbw,
				cTempl.cybth, cTempl.cybth,
				cTempl.plhhatw, cTempl.plhhatw,
				cTempl.plhbbw, cTempl.plhbbw,
				cTempl.cybth, cTempl.cybth,
				cTempl.plhhatw, cTempl.plhhatw,
				cTempl.plhbbw, cTempl.plhbbw,
				cTempl.cybth, cTempl.cybth,
				cTempl.plhhatw, cTempl.plhhatw, // 2 Tank Killers (Hard+)
				cTempl.plhbbw, cTempl.plhbbw, // 2 Bunker Busters (Insane)
			],
		}, CAM_ORDER_FOLLOW, {
			leader: "foxtrotCommander",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("foxtrotFallbackPos"),
				radius: 24
			}
	});

	golfPatrolGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, cTempl.plhhrat, // 4 HRAs
				cTempl.plhacant, cTempl.plhacant, cTempl.plhacant, cTempl.plhacant, // 4 Assault Cannons
				cTempl.plhhaat, cTempl.plhhaat, cTempl.plhhaat, cTempl.plhhaat, // 4 Cyclones
			]
		}, CAM_ORDER_PATROL, {
			repair: 50,
			pos: [
				camMakePos("patrolPos1"),
				camMakePos("patrolPos2"),
				camMakePos("patrolPos3"),
				camMakePos("patrolPos4"),
				camMakePos("patrolPos5"),
				camMakePos("patrolPos6"),
				camMakePos("patrolPos7"),
				camMakePos("patrolPos8"),
				camMakePos("patrolPos9"),
			],
			interval: camSecondsToMilliseconds(46)
	});

	transportDialogueIndex = 0;
	allowWin = false;
	foxtrotCommanderDeathTime = 0;
	lastTransportAlert = 0;
	foxtrotIdx = 0;
	golfIdx = 0;
	teamUnitMaxRank = difficulty + 1; // Green to Veteran

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// NOTE: The Infested are active even in the warm-up phase!
	heliAttack();
	queue("foxtrotTransmission", camMinutesToMilliseconds(3)); // Transmission from Team Foxtrot
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(80)));

	// Give player briefing.
	camPlayVideos({video: "A3L9_BRIEF", type: MISS_MSG});

	// Used to confirm the player didn't start Act 4 from the menu
	camCompleteRequiredResearch(["R-Script-A3Played"], CAM_HUMAN_PLAYER);

	// Lighten the fog to *more or less* 2x default brightness with a slight pink color
	camSetFog(48, 32, 96);
	// Add a purple-blue tint
	camSetSunIntensity(.5, .45, .55);
	camSetWeather(CAM_WEATHER_RAINSTORM);

	// dumpStructSets(); // DEBUG
}