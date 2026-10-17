include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/transitionTech.js");
include("script/campaign/structSets.js");

const mis_infestedResearch = [
	"R-Wpn-MG-Damage05", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage05", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02", 
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];
const mis_zuluExtraResearch = [ // Added on top of everything the player has at the start of the level
	"R-Wpn-Cannon-Damage07", "R-Wpn-Howitzer-Damage03", "R-Wpn-MG-Damage07",
	"R-Wpn-Cannon-ROF04", "R-Wpn-Mortar-ROF04", "R-Wpn-Howitzer-ROF03",
];

const MIS_TEAM_CHARLIE = 1;
const MIS_TEAM_ZULU = 5;
const MIS_CHARLIE_COMMANDER_RANK = "Hero";
const MIS_CHARLIE_RANK = "Regular";
const MIS_ZULU_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(18));

// Zulu difficulty-based templates
// These switch to more durable Collective bodies on higher difficulties
// NOTE: Some of Zulu's templates do not change with difficulty and aren't listed here
const mis_zuluAGTempl = (difficulty < HARD) ? cTempl.plhasgnht : cTempl.cohasgnht;
const mis_zuluTKTempl = (difficulty < HARD) ? cTempl.plhhatht : cTempl.cohhatht;
const mis_zuluHovHCTempl = (difficulty < INSANE) ? cTempl.plhhcanh : cTempl.cohhcanh;
const mis_zuluBBTempl = (difficulty < HARD) ? cTempl.plhbbh : cTempl.cohbbh;
const mis_zuluSensTempl = (difficulty < HARD) ? cTempl.plhsensh : cTempl.cohsensh;
const mis_zuluInfTempl = (difficulty < INSANE) ? cTempl.plhinfh : cTempl.cohinfh;
const mis_zuluComHTTempl = (difficulty < INSANE) ? cTempl.plhcomht : cTempl.cohcomht;
const mis_zuluComHovTempl = (difficulty < INSANE) ? cTempl.plhcomh : cTempl.cohcomh;
const mis_zuluPepTempl = (difficulty < INSANE) ? cTempl.plhrmorth : cTempl.cohrmorth;
const mis_zuluBalTempl = (difficulty < INSANE) ? cTempl.plhbalh : cTempl.cohbalh;
const mis_zuluTKVtolTempl = (difficulty < HARD) ? cTempl.plmhatv : cTempl.comhatv;
const mis_zuluAGVtolTempl = (difficulty < HARD) ? cTempl.plmagv : cTempl.comagv;
const mis_zuluThermVtolTempl = (difficulty < HARD) ? cTempl.plmtbombv : cTempl.comthermv;
const mis_zuluBombVtolTempl = (difficulty < HARD) ? cTempl.plmhbombv : cTempl.comhbombv;
const mis_zuluBBVtolTempl = (difficulty < MEDIUM) ? cTempl.pllbbv : ((difficulty < INSANE) ? cTempl.plmbbv : cTempl.combbv);
const mis_zuluHvyVtolTempl = (difficulty < INSANE) ? cTempl.plhacanv : cTempl.cohacanv;
const mis_zuluTruckTempl = (difficulty < INSANE) ? cTempl.plhtruckh : cTempl.cohtruckh;

var zuluCommander1;
var zuluCommander2;
var zuluCommander3;
var zuluCommandGroup3;
var zuluIntroHoverGroup;
var charlieCommander;
var charlieCommandGroup;
var charlieVtolGroup;

var charlieTruckJob1;
var charlieTruckJob2;
var charlieTruckJob3;
var charlieTruckJob4;
var charlieTruckJob5;
var charlieTruckJob6;

var zuluCommander1DeathTime;
var zuluCommander2DeathTime;
var zuluCommander3DeathTime;
var lureActive;
var worldAblaze;
var heartbeatDarkness;
var remainingMissionTime;
var allowVtolStrikes;
var zuluSurrendered;
var zuluRank;
var lureTrapEnabled;
var banterIdx;
var lureBlipPlaced;

camAreaEvent("vtolRemoveZone", function(droid)
{
	if (isVTOL(droid))
	{
		camSafeRemoveObject(droid, false);
		resetLabel("vtolRemoveZone", MIS_TEAM_CHARLIE);
	}
});

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, undefined, "vtolRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(30)), "zuluLure", ext);
}

// Assign labels to Zulu's commanders and sensors
function eventDroidBuilt(droid, structure)
{
	if (droid.player === MIS_TEAM_ZULU)
	{
		if (camDroidMatchesTemplate(droid, cTempl.plhcomt))
		{
			// Tracked commander rebuilt
			addLabel(droid, "zuluCommander1");
			camSetDroidRank(droid, zuluRank);
		}
		else if (camDroidMatchesTemplate(droid, mis_zuluComHTTempl))
		{
			// Halftracked commander rebuilt
			addLabel(droid, "zuluCommander2");
			camSetDroidRank(droid, zuluRank);
		}
		else if (camDroidMatchesTemplate(droid, mis_zuluComHovTempl))
		{
			// Hover commander rebuilt
			addLabel(droid, "zuluCommander3");
			camSetDroidRank(droid, zuluRank);
		}
		else if (camDroidMatchesTemplate(droid, cTempl.plhstriket))
		{
			// VTOL Strike sensor rebuilt
			addLabel(droid, "zuluVtolSensor");
		}
	}
}

function eventDestroyed(obj)
{
	if (obj.player === MIS_TEAM_ZULU)
	{
		const label = getLabel(obj);
		if (obj.type === STRUCTURE && label === "zuluLure")
		{
			// Lure destroyed; Stop spawning Infested
			lureActive = false;

			if (lureBlipPlaced)
			{
				hackRemoveMessage("ZULU_LURE", PROX_MSG, CAM_HUMAN_PLAYER);
				lureBlipPlaced = false;
			}
		}
		else if (obj.type === DROID)
		{
			if (label === "zuluCommander1")
			{
				// Mark the time that the commander died
				zuluCommander1DeathTime = gameTime;
			}
			else if (label === "zuluCommander2")
			{
				zuluCommander2DeathTime = gameTime;
			}
			else if (label === "zuluCommander3")
			{
				zuluCommander3DeathTime = gameTime;
			}
			else if (obj.droidType === DROID_SUPERTRANSPORTER)
			{
				// Zulu's evac transport was destroyed
				camPlayVideos({video: "A4L4_CRASH", type: CAMP_MSG});
				zuluSurrender();
			}
		}
		
	}
}

function sendInfestedReinforcements()
{
	if (!lureActive)
	{
		return; // Only spawn if the Lure is active
	}

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
		].concat((difficulty >= HARD) ? cTempl.vilestinger : []), // Add a Vile Stinger,
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
		].concat((difficulty >= HARD) ? cTempl.infcomhatt : []), // Add a Tank Killer,
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
		].concat((difficulty >= HARD) ? cTempl.vilestinger : []), // Add another Vile Stinger
	];
	const CORE_SIZE = 8;
	const FODDER_SIZE = 14;
	const B_CHANCE = (difficulty * 5) + 5;

	const entrances = [
		"infEntry1", "infEntry2", "infEntry3",
		"infEntry4", "infEntry7",
	];

	if (camBaseIsEliminated("zuluWestBase")) entrances.push("infEntry5");
	if (camBaseIsEliminated("zuluEastBase")) entrances.push("infEntry6");

	// Spawn from every entrance
	for (const entrance of entrances)
	{
		camSendReinforcement(CAM_INFESTED, getObject(entrance), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, B_CHANCE), CAM_REINFORCE_GROUND);
	}
}

// Reinforce Charlie's forces
function sendCharlieTransporter()
{
	// Make a list of droids to bring in in order of importance:
	// Trucks -> Commander -> Command Group -> VTOLs
	let droidQueue = [];

	if (!camDef(camGetTruck(charlieTruckJob1))) droidQueue.push(cTempl.plhtruckht);
	if (!camDef(camGetTruck(charlieTruckJob2))) droidQueue.push(cTempl.plhtruckht);
	if (!camDef(camGetTruck(charlieTruckJob3))) droidQueue.push(cTempl.cyben);
	if (!camDef(camGetTruck(charlieTruckJob4))) droidQueue.push(cTempl.cyben);
	if (camBaseIsEliminated("zuluPlateauBase") && !camDef(camGetTruck(charlieTruckJob5))) droidQueue.push(cTempl.plhtruckht);
	if (camBaseIsEliminated("zuluPlateauBase") && !camDef(camGetTruck(charlieTruckJob6))) droidQueue.push(cTempl.plhtruckht);

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([charlieCommander, charlieCommandGroup, charlieVtolGroup]));

	const droids = [];
	// Get (up to) the first 10 units in the queue
	for (let i = 0; i < Math.min(droidQueue.length, 10); i++)
	{
		droids.push(droidQueue[i]);
	}

	// Don't send an empty transport!
	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZoneCharlie"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camMakePos("transportEntryCharlie"),
				exit: camMakePos("transportEntryCharlie")
			}
		);
	}
}

function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		camCallOnce("lzAmbush");
		return;
	}
	else if (transport.player !== MIS_TEAM_CHARLIE)
	{
		return;
	}

	const transDroids = camGetTransporterDroids(transport.player);
	const truckJobs = [charlieTruckJob1, charlieTruckJob2, charlieTruckJob3, charlieTruckJob4, charlieTruckJob5, charlieTruckJob6];
	const otherGroups = [charlieCommander, charlieCommandGroup, charlieVtolGroup];

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

	// Next, check if a new commander unit has landed
	// If so, apply the appropriate label
	for (const droid of transOther)
	{
		if (droid.droidType === DROID_COMMAND)
		{
			// New Charlie command tank
			addLabel(droid, "charlieCommander");
			// Also rank the commander to the appropriate level
			camSetDroidRank(droid, MIS_CHARLIE_COMMANDER_RANK);
		}
		else
		{
			// Give the non-commander droid some rank
			camSetDroidRank(droid, MIS_CHARLIE_RANK);
		}
	}

	// Assign other units to their refillable groups
	camAssignToRefillableGroups(transOther, otherGroups);
}

// Move the intro groups to compromise the player's LZ after landing
function lzAmbush()
{
	camManageGroup(zuluCommander2, CAM_ORDER_STRIKE, {
		callback: "zuluIntroTargets",
		altOrder: CAM_ORDER_DEFEND,
		pos: camMakePos("introCommanderPos"),
	});
	zuluIntroHoverGroup = camManageGroup(camMakeGroup("introHoverGroup"), CAM_ORDER_STRIKE, {
		callback: "zuluIntroTargets",
		altOrder: CAM_ORDER_DEFEND,
		pos: camMakePos("introHoverPos"),
	});

	queue("trapPlayer", camSecondsToMilliseconds(10));
}

// Shrink the map, pause the mission timer, prevent reinforcements, and begin Clayde's monologue
function trapPlayer()
{
	playSound(cam_sounds.lz.LZCompromised);

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A4L5", {
		reinforcements: -1,
		area: "compromiseZone",
		callback: "claydeDefeated",
		enableLastAttack: false,
		ignoreInfestedUnits: true
	});

	if (!tweakOptions.rec_timerlessMode)
	{
		// Freeze the mission timer
		remainingMissionTime = getMissionTime();
		setMissionTime(-1);
	}

	// Shrink the map boundaries
	setScrollLimits(35, 80, 61, 126);

	// It's monologue o'clock
	camQueueDialogue([
		{text: "CLAYDE: Halt!", delay: 1, sound: CAM_RCLICK},
		{text: "CLAYDE: Well... look at that.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, here at last.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: You've been busy, haven't you?", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Delta. Foxtrot. Golf.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Quite the stunt you pulled off back there.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Credit where credit's due, Commander.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I've learned quite a lot from watching you.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: But now, you stand in the way of NARS' future.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: And if it falls upon me to pave the way towards victory...", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I'll do it GLADLY.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: No matter how many of our enemies need to die to get there.", delay: 2, sound: CAM_RCLICK},
		// Slight delay
		{text: "CLAYDE: Commander Bravo, you've served me well.", delay: 6, sound: CAM_RCLICK},
		{text: "CLAYDE: But now, your death will serve NARS one last time.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Goodbye, Commander-", delay: 4, sound: CAM_RCLICK, callback: "charlieRescue"},
	]);
}

// Send in some Charlie VTOLs to rescue the player from Clayde's ambush
function charlieRescue()
{
	camSetVtolData(MIS_TEAM_CHARLIE, "vtolAttackPos", "vtolRemoveZone", [cTempl.plmhatv, cTempl.plmtbombv], undefined, // These VTOLs don't come back
		undefined, {limit: 6}
	);

	camQueueDialogue([
		{text: "LIEUTENANT: ...NOW!", delay: 1, sound: CAM_RCLICK},
		{text: "CLAYDE: Huh-", delay: 1, sound: CAM_RCLICK},
		{text: "CHARLIE: Surprise!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: We've got you covered, Bravo!", delay: 2, sound: CAM_RCLICK, callback: "zuluRetreat"},
	]);
}

// Pull back Zulu's ambush groups
function zuluRetreat()
{
	camManageGroup(zuluCommander2, CAM_ORDER_DEFEND, {
		pos: camMakePos("introCommanderFallbackPos"),
		removable: false
	});
	camManageGroup(zuluIntroHoverGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("introHoverFallbackPos"),
		removable: false
	});

	setAlliance(MIS_TEAM_ZULU, CAM_HUMAN_PLAYER, false);

	camQueueDialogue([
		{text: "CLAYDE: All forces, execute contingency plans!", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Fall back to defensive positions!", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Prepare to engages rogue Commanders Bravo and Charlie on my word.", delay: 3, sound: CAM_RCLICK},
	]);

	queue("expandMap", camSecondsToMilliseconds(8));
}

// Un-shrink the map, resume the mission timer, enable reinforcements, and start up group logic for Charlie and Zulu
function expandMap()
{
	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A4L5", {
		reinforcements: camMinutesToSeconds(1),
		area: "compromiseZone",
		callback: "claydeDefeated",
		enableLastAttack: false,
		ignoreInfestedUnits: true
	});

	if (!tweakOptions.rec_timerlessMode)
	{
		// Unfreeze the mission timer
		setMissionTime(remainingMissionTime);
	}

	// Queitly remove Charlie's VTOLs if they're still around
	enumDroid(MIS_TEAM_CHARLIE).filter((droid) => (isVTOL(droid))).forEach((dr) => {
		if (!camIsTransporter(dr))
		{
			camSafeRemoveObject(dr);
		}
	});

	// Expand the map boundaries
	setScrollLimits(0, 0, 88, 128);

	// HACK: Move the sun position slightly to avoid weird shadows when expanding the map
	camSetSunPos(225.0, -601.0, 450.0);

	// Manage refillable groups
	// Zulu groups...
	// Tracked command group
	zuluCommander1 = camMakeRefillableGroup(
		camMakeGroup("zuluCommander1"), {
			templates: [cTempl.plhcomt],
			factories: ["zuluFactory3"],
			callback: "allowCommander1Rebuild"
		}, CAM_ORDER_PATROL, { // Commander orders are updated later
			pos: [
				camMakePos("patrolPos8"),
				camMakePos("patrolPos9"),
				camMakePos("patrolPos10"),
				camMakePos("patrolPos11"),
			],
			interval: camSecondsToMilliseconds(46),
			radius: 16,
			repair: 50
	});
	camMakeRefillableGroup(
		camMakeGroup("zuluCommandGroup1"), {
			templates: [ // 8 Heavy Cannons, 5 Repair Turrets, 4 Whirlwinds, and 1 VTOL Strike Turret
				cTempl.plhhcant, cTempl.plhhcant,
				cTempl.plhrept, cTempl.plhrept,
				cTempl.plhraat, cTempl.plhraat,
				cTempl.plhstriket,
				cTempl.plhhcant, cTempl.plhhcant,
				cTempl.plhrept, cTempl.plhrept,
				cTempl.plhraat, cTempl.plhraat,
				cTempl.plhhcant, cTempl.plhhcant,
				cTempl.plhrept,
				cTempl.plhhcant, cTempl.plhhcant,
				cTempl.plhhcant, cTempl.plhhcant, // 2 Heavy Cannons (Hard+)
				cTempl.plhrept, cTempl.plhrept, // 2 Repair Turrets (Insane)
			],
			factories: ["zuluFactory1", "zuluFactory2", "zuluFactory3", "zuluFactory4"],
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluCommander1",
			repair: 50,
			suborder: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("patrolPos8"),
					camMakePos("patrolPos9"),
					camMakePos("patrolPos10"),
					camMakePos("patrolPos11"),
				],
				interval: camSecondsToMilliseconds(46),
				radius: 16,
				repair: 50
			}
	});
	// Tell the commander to start patrolling
	camManageGroup(zuluCommander2, CAM_ORDER_PATROL, { // Commander orders are updated later
		pos: [
			camMakePos("patrolPos4"),
			camMakePos("patrolPos5"),
			camMakePos("patrolPos6"),
			camMakePos("patrolPos7"),
		],
		interval: camSecondsToMilliseconds(36),
		radius: 20,
		repair: 75,
		removable: false
	});
	// Hover command group
	zuluCommander3 = camMakeRefillableGroup(
		camMakeGroup("zuluCommander3"), {
			templates: [mis_zuluComHovTempl],
			factories: ["zuluFactory5"],
			callback: "allowCommander3Rebuild"
		}, CAM_ORDER_PATROL, { // Commander orders are updated later
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("hoverPatrolPos2"),
				camMakePos("hoverPatrolPos3"),
				camMakePos("hoverPatrolPos4"),
				camMakePos("hoverPatrolPos5"),
			],
			interval: camSecondsToMilliseconds(36),
			radius: 20,
			repair: 75
	});
	zuluCommandGroup3 = camMakeRefillableGroup(
		undefined, {
			templates: [ // 8 Heavy Cannons, 6 Infernos, and 4 Bunker Busters
				mis_zuluHovHCTempl, mis_zuluHovHCTempl,
				mis_zuluInfTempl, mis_zuluInfTempl,
				mis_zuluBBTempl, mis_zuluBBTempl,
				mis_zuluHovHCTempl, mis_zuluHovHCTempl,
				mis_zuluInfTempl, mis_zuluInfTempl,
				mis_zuluBBTempl, mis_zuluBBTempl,
				mis_zuluHovHCTempl, mis_zuluHovHCTempl,
				mis_zuluInfTempl, mis_zuluInfTempl,
				mis_zuluHovHCTempl, mis_zuluHovHCTempl,
				mis_zuluInfTempl, mis_zuluInfTempl, // 2 Infernos (Hard+)
				mis_zuluBBTempl, mis_zuluBBTempl, // 2 Bunker Busters (Insane)
			],
			factories: ["zuluFactory4", "zuluFactory5"],
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluCommander3",
			repair: 75,
			suborder: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("hoverPatrolPos1"),
					camMakePos("hoverPatrolPos2"),
					camMakePos("hoverPatrolPos3"),
					camMakePos("hoverPatrolPos4"),
					camMakePos("hoverPatrolPos5"),
				],
				interval: camSecondsToMilliseconds(24),
				radius: 20,
				repair: 75
			}
	});
	// Patrol Group
	camMakeRefillableGroup(
		camMakeGroup("zuluPatrolGroup"), {
			templates: [ // 8 Assault Gunners, 4 Super Tank Killers, 4 Super HVC Cyborgs, 4 Whirlwinds
				cTempl.plhraaht, cTempl.plhraaht, cTempl.plhraaht, cTempl.plhraaht,
				cTempl.cybag, cTempl.cybag, cTempl.cybag,
				cTempl.scytk, cTempl.scytk,
				cTempl.scyhc, cTempl.scyhc,
				cTempl.cybag, cTempl.cybag, cTempl.cybag,
				cTempl.scytk, cTempl.scytk,
				cTempl.scyhc, cTempl.scyhc,
				cTempl.cybag, cTempl.cybag,
			],
			globalFill: true,
			player: MIS_TEAM_ZULU,
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("patrolPos1"),
				camMakePos("patrolPos2"),
				camMakePos("patrolPos3")
			],
			interval: camSecondsToMilliseconds(24),
			repair: 75
	});
	// Sensor/Pepperpot/Ballista group
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 1 Sensor, 4 Pepperpots, 4 Ballistas
				mis_zuluSensTempl,
				mis_zuluPepTempl, mis_zuluPepTempl,
				mis_zuluBalTempl, mis_zuluBalTempl,
				mis_zuluPepTempl, mis_zuluPepTempl,
				mis_zuluBalTempl, mis_zuluBalTempl,
			],
			factories: ["zuluFactory3", "zuluFactory4", "zuluFactory5"]
		}, CAM_ORDER_ATTACK, {
			repair: 50,
			count: 9,
			morale: 65,
			fallback: camMakePos("patrolPos1"),
			targetPlayer: CAM_HUMAN_PLAYER
	});
	// VTOL Sensor unit group
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Tank Killers, 3 Thermite Bombs
				mis_zuluTKVtolTempl, mis_zuluThermVtolTempl,
				mis_zuluTKVtolTempl, mis_zuluThermVtolTempl,
				mis_zuluTKVtolTempl, mis_zuluThermVtolTempl,
			],
			globalFill: true,
			player: MIS_TEAM_ZULU,
			obj: "zuluVtolSensor",
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluVtolSensor",
			repair: 75,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 75
			}
	});
	// Tank Killer VTOL strike group
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 6 Tank Killers
				mis_zuluTKVtolTempl, mis_zuluTKVtolTempl, mis_zuluTKVtolTempl,
				mis_zuluTKVtolTempl, mis_zuluTKVtolTempl, mis_zuluTKVtolTempl,
			],
			factories: ["zuluVtolFactory2"],
			callback: "allowVtolStrikeGroups"
		}, CAM_ORDER_STRIKE, {
			repair: 50,
			callback: "zuluKillerStrikeTargets",
			minCount: 6,
			altOrder: CAM_ORDER_DEFEND,
			radius: 20,
			pos: camMakePos("zuluVtolAssembly2"),
	});
	// Bunker Buster VTOL strike group
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 Bunker Busters
				mis_zuluBBVtolTempl, mis_zuluBBVtolTempl,
				mis_zuluBBVtolTempl, mis_zuluBBVtolTempl,
			],
			factories: ["zuluVtolFactory3"],
			callback: "allowVtolStrikeGroups"
		}, CAM_ORDER_STRIKE, {
			repair: 50,
			callback: "zuluBusterStrikeTargets",
			minCount: 4,
			altOrder: CAM_ORDER_DEFEND,
			radius: 20,
			pos: camMakePos("zuluVtolAssembly2"),
	});
	// VTOL Tower groups...
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Guns
				mis_zuluTKVtolTempl, mis_zuluAGVtolTempl,
				mis_zuluTKVtolTempl, mis_zuluAGVtolTempl,
			],
			globalFill: true,
			player: MIS_TEAM_ZULU,
			obj: "zuluVtolTower1"
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluVtolTower1",
			repair: 75,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 75
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Guns
				mis_zuluTKVtolTempl, mis_zuluAGVtolTempl,
				mis_zuluTKVtolTempl, mis_zuluAGVtolTempl,
			],
			globalFill: true,
			player: MIS_TEAM_ZULU,
			obj: "zuluVtolTower2"
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluVtolTower2",
			repair: 75,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 75
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 Tank Killers, 2 Assault Guns
				mis_zuluTKVtolTempl, mis_zuluAGVtolTempl,
				mis_zuluTKVtolTempl, mis_zuluAGVtolTempl,
			],
			globalFill: true,
			player: MIS_TEAM_ZULU,
			obj: "zuluVtolTower3"
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluVtolTower3",
			repair: 75,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 75
			}
	});
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 2 HEAP Bombs, 2 Thermite Bombs
				mis_zuluBombVtolTempl, mis_zuluThermVtolTempl,
				mis_zuluBombVtolTempl, mis_zuluThermVtolTempl,
			],
			globalFill: true,
			player: MIS_TEAM_ZULU,
			obj: "zuluVtolCBTower"
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluVtolCBTower",
			repair: 75,
			suborder: CAM_ORDER_ATTACK,
			data: {
				repair: 75
			}
	});
	// General VTOL attack group
	camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 Assault Cannons, 4 HEAP Bombs
				mis_zuluHvyVtolTempl, mis_zuluBombVtolTempl,
				mis_zuluHvyVtolTempl, mis_zuluBombVtolTempl,
				mis_zuluHvyVtolTempl, mis_zuluBombVtolTempl,
				mis_zuluHvyVtolTempl, mis_zuluBombVtolTempl,
			],
			globalFill: true,
			player: MIS_TEAM_ZULU,
		}, CAM_ORDER_ATTACK, {
			count: 8,
			morale: 75,
			fallback: camMakePos("zuluVtolAssembly2"),
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 50
	});

	// Charlie groups...
	charlieCommander = camMakeRefillableGroup(
		undefined, {
			templates: [cTempl.plhcomht]
		}, CAM_ORDER_ATTACK, {
			targetPlayer: MIS_TEAM_ZULU,
			repair: 75,
			repairPos: camMakePos("landingZoneCharlie")
	});
	charlieCommandGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 4 Tank Killers, 2 Bunker Busters, 3 Whirlwinds, 1 Sensor, 6 Super HVCs, 6 Assault Gunners
				cTempl.plhhatht, cTempl.plhhatht,
				cTempl.plhraaht, cTempl.plhraaht,
				cTempl.plhbbht, cTempl.plhbbht,
				cTempl.scyhc, cTempl.scyhc, cTempl.scyhc,
				cTempl.cybag, cTempl.cybag, cTempl.cybag,
				cTempl.plhhatht, cTempl.plhhatht,
				cTempl.plhraaht,
				cTempl.plhsensht,
				cTempl.scyhc, cTempl.scyhc, cTempl.scyhc,
				cTempl.cybag, cTempl.cybag, cTempl.cybag,
			],
		}, CAM_ORDER_FOLLOW, {
			leader: "charlieCommander",
			repair: 75,
			repairPos: camMakePos("landingZoneCharlie"),
			suborder: CAM_ORDER_DEFEND, // Retreat back to LZ if the commander dies
			data: {
				pos: camMakePos("landingZoneCharlie"),
				radius: 20,
				repair: 75,
				repairPos: camMakePos("landingZoneCharlie")
			}
	});
	charlieVtolGroup = camMakeRefillableGroup(
		undefined, {
			templates: [ // 3 Tank Killers, 3 Assault Guns, 3 HEAP Bombs, 3 Thermite Bombs
				cTempl.plmhatv, cTempl.plmhatv, cTempl.plmhatv,
				cTempl.plmagv, cTempl.plmagv, cTempl.plmagv,
				cTempl.plmhbombv, cTempl.plmhbombv, cTempl.plmhbombv,
				cTempl.plmtbombv, cTempl.plmtbombv, cTempl.plmtbombv,
			],
		}, CAM_ORDER_ATTACK, {
			targetPlayer: MIS_TEAM_ZULU,
			repair: 75
	});

	// Assign the intro hovers to the hover commander
	camAssignToRefillableGroups(enumGroup(zuluIntroHoverGroup), zuluCommandGroup3);

	// Manage trucks...
	const TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 60 : 150));
	const ENGINEER_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 30 : 60));
	// Zulu trucks...
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluMainBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase1"),
			template: mis_zuluTruckTempl
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluFactoryBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase2"),
			template: mis_zuluTruckTempl
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluFactoryBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase2"),
			template: mis_zuluTruckTempl
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluCanalBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase3"),
			template: mis_zuluTruckTempl
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluPlateauBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase4"),
			template: mis_zuluTruckTempl
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluPlateauBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase4"),
			template: mis_zuluTruckTempl
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluEastBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase5"),
			template: mis_zuluTruckTempl
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluWestBase",
			respawnDelay: TRUCK_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase6"),
			template: mis_zuluTruckTempl
	});
	// Zulu engineers...
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluMainBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase1"),
			template: cTempl.cyben
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluMainBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase1"),
			template: cTempl.cyben
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluFactoryBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase2"),
			template: cTempl.cyben
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluCanalBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase3"),
			template: cTempl.cyben
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluPlateauBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase4"),
			template: cTempl.cyben
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluEastBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase5"),
			template: cTempl.cyben
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluWestBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase6"),
			template: cTempl.cyben
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluWestOutpost",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase7"),
			template: cTempl.cyben
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluWestOutpost",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase8"),
			template: cTempl.cyben
	});
	camManageTrucks(
		MIS_TEAM_ZULU, {
			label: "zuluWestOutpost",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: tweakOptions.rec_timerlessMode,
			structset: camAreaToStructSet("zuluBase9"),
			template: cTempl.cyben
	});
	// Charlie trucks & engineers...
	charlieTruckJob1 = camManageTrucks(MIS_TEAM_CHARLIE, {
		label: "charlieLZ",
		rebuildBase: true,
		structset: camA4L4CharlieLZStructs,
		template: cTempl.plhtruckht
	});
	charlieTruckJob2 = camManageTrucks(MIS_TEAM_CHARLIE, {
		label: "charlieLZ",
		rebuildBase: true,
		structset: camA4L4CharlieLZStructs,
		template: cTempl.plhtruckht
	});
	charlieTruckJob3 = camManageTrucks(MIS_TEAM_CHARLIE, {
		label: "charlieLZ",
		rebuildBase: true,
		structset: camA4L4CharlieLZStructs,
		template: cTempl.cyben
	});
	charlieTruckJob4 = camManageTrucks(MIS_TEAM_CHARLIE, {
		label: "charlieLZ",
		rebuildBase: true,
		structset: camA4L4CharlieLZRepairStructs,
		template: cTempl.cyben
	});
	charlieTruckJob5 = camManageTrucks(MIS_TEAM_CHARLIE, {
		label: "charlieForwardBase",
		rebuildBase: true,
		structset: camA4L4CharlieForwardStructs,
		template: cTempl.plhtruckht
	});
	charlieTruckJob6 = camManageTrucks(MIS_TEAM_CHARLIE, {
		label: "charlieForwardBase",
		rebuildBase: true,
		structset: camA4L4CharlieForwardStructs,
		template: cTempl.plhtruckht
	});

	// TODO: Add Timerless Mode trucks???

	// Enable every factory immediately (what could go wrong?)
	camEnableFactory("zuluFactory1");
	camEnableFactory("zuluFactory2");
	camEnableFactory("zuluFactory3");
	camEnableFactory("zuluFactory4");
	camEnableFactory("zuluFactory5");
	camEnableFactory("zuluCybFactory1");
	camEnableFactory("zuluCybFactory2");
	camEnableFactory("zuluCybFactory3");
	camEnableFactory("zuluCybFactory4");
	camEnableFactory("zuluVtolFactory1");
	camEnableFactory("zuluVtolFactory2");
	camEnableFactory("zuluVtolFactory3");
	camEnableFactory("zuluVtolFactory4");

	// Start calling Charlie transports
	sendCharlieTransporter();
	setTimer("sendCharlieTransporter", camChangeOnDiff(camMinutesToMilliseconds(2), true));

	setTimer("checkActivateLure", camSecondsToMilliseconds(5));
	setTimer("claydeBanter", camMinutesToMilliseconds(5));

	// Queue up other events...
	queue("aggroCommander1", camChangeOnDiff(camMinutesToMilliseconds(2.5)));
	queue("aggroCommander2", camChangeOnDiff(camMinutesToMilliseconds(4)));
	queue("enableVtolStrikes", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("aggroCommander3", camChangeOnDiff(camMinutesToMilliseconds(8)));

	// FIXME: WHY DO WE NEED THIS???
	// If this isn't here, Zulu's attack droids will get stuck behind their own gates.
	// Probably needs a bug report once I can figure out why it happens.
	camUpgradeOnMapStructures("A0HardcreteMk1Gate", "A0HardcreteMk1Gate", MIS_TEAM_ZULU);
}

// Misc. dialogue events between Clayde, the Liuetenant, and Commander Charlie
function claydeBanter()
{
	if (!worldAblaze)
	{
		switch (banterIdx)
		{
		case 1:
			// Clayde commends/taunts the Lieutenant on his boldness
			camQueueDialogue([
				{text: "CLAYDE: I have to hand it to you, Lieutenant.", delay: 4, sound: CAM_RCLICK},
				{text: "CLAYDE: Coming straight for me was quite the bold move.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: But if you were expecting to catch me unprepared...", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: Then you were sorely mistaken.", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: Give it up, Clayde.", delay: 4, sound: CAM_RCLICK},
				{text: "LIEUTENANT: This time, we've got YOU outnumbered.", delay: 2, sound: CAM_RCLICK},
				{text: "CLAYDE: Not in this lifetime, Lieutenant.", delay: 4, sound: CAM_RCLICK},
				{text: "CLAYDE: Not while NARS still needs me.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: There's still so much to be done here.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: And that begins by wiping out Teams Bravo and Charlie.", delay: 3, sound: CAM_RCLICK},
			]);
			break;
		case 2:
			// Charlie tells Clayde to give up
			camQueueDialogue([
				{text: "CHARLIE: Haven't you hurt enough people already?", delay: 4, sound: CAM_RCLICK},
				{text: "CHARLIE: Come on Clayde, stand down.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: You think I'm scared of you, Commander Charlie?", delay: 4, sound: CAM_RCLICK},
				{text: "CLAYDE: Under my leadership, NARS has prevailed before.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: And we'll prevail here again, today.", delay: 3, sound: CAM_RCLICK},
			]);
			break;
		case 3:
			// Clayde tries to taunt Bravo about killing their "allies", the Lieutenant reminds him that they followed his orders to the death
			camQueueDialogue([
				{text: "CLAYDE: So, Commander Bravo.", delay: 4, sound: CAM_RCLICK},
				{text: "CLAYDE: How many of your former allies did you kill on the way here?", delay: 2, sound: CAM_RCLICK},
				{text: "LIEUTENANT: Don't even try it!", delay: 4, sound: CAM_RCLICK},
				{text: "LIEUTENANT: Foxtrot and Golf followed your orders to the grave.", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: If it wasn't for you, they'd all still be alive!", delay: 3, sound: CAM_RCLICK},
				// Delay...
				{text: "CLAYDE: Foxtrot would have rotted as a prisoner if it wasn't for me.", delay: 8, sound: CAM_RCLICK},
				{text: "CLAYDE: And Golf was the most loyal Commander among them.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: They died while serving the Syndicate.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: Which will be far more than can be said of your Commanders, Lieutenant.", delay: 3, sound: CAM_RCLICK},
			]);
			break;
		case 4:
			// Charlie tells Clayde he's his grip on reality
			camQueueDialogue([
				{text: "CHARLIE: Clayde, you've lost touch with reality.", delay: 4, sound: CAM_RCLICK},
				{text: "CHARLIE: Look at what you've done to this place!", delay: 3, sound: CAM_RCLICK},
				{text: "CHARLIE: Look at what you've done to NARS!", delay: 3, sound: CAM_RCLICK},
				{text: "CHARLIE: So many dead, and for what?!", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: I've done what needed to be done.", delay: 4, sound: CAM_RCLICK},
				{text: "CLAYDE: Always.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: I've seen this crumbling city, and the enemies around every corner.", delay: 2, sound: CAM_RCLICK},
				{text: "CLAYDE: But right now, all I see is a Lieutenant who's lost his way...", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: And two Commanders that need to be put down.", delay: 3, sound: CAM_RCLICK},
			]);
			break;
		default: // No more dialogue...
			break;
		}
	}
	else // After world turns orange and Clayde prepares to escape
	{
		switch (banterIdx)
		{
		case 1:
			// The Lieutenant and Charie wonder where Clayde 
			camQueueDialogue([
				{text: "CHARLIE: Lieutenant, where is Clayde planning to go?", delay: 4, sound: CAM_RCLICK},
				{text: "LIEUTENANT: I don't know, the whole city is a mess.", delay: 4, sound: CAM_RCLICK},
				{text: "LIEUTENANT: Which is why we can't let him get away.", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: If he escapes, we might not be able to find him again.", delay: 3, sound: CAM_RCLICK},
			]);
			break;
		case 2:
			// The Lieutenant & Charlie ask why Clayde has been silent
			camQueueDialogue([
				{text: "CHARLIE: What's your plan, Clayde?", delay: 8, sound: CAM_RCLICK},
				{text: "CHARLIE: Why run away?", delay: 3, sound: CAM_RCLICK},
				// Delay
				{text: "CHARLIE: You sounded so confident earlier, Clayde.", delay: 8, sound: CAM_RCLICK},
				{text: "CHARLIE: Weren't you going to stop us in our tracks?", delay: 3, sound: CAM_RCLICK},
				// Delay
				{text: "LIEUTENANT: Oh, so NOW you decide to stay quiet?!", delay: 10, sound: CAM_RCLICK},
				{text: "LIEUTENANT: Are you feeling the walls closing in on you, Clayde?!", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: All the lies, all your efforts.", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: It's crashing and burning all around you!", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: You'll answer for what you've done, Clayde!", delay: 3, sound: CAM_RCLICK},
				// Delay
				{text: "LIEUTENANT: Answer me, Clayde!", delay: 8, sound: CAM_RCLICK},
				{text: "LIEUTENANT: Why?", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: The blood on your hands, the deaths you've ordered.", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: Was it all worth it in the end?", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: Or did they mean nothing to you in the first place?", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: ...Are you even listening?", delay: 6, sound: CAM_RCLICK},
			]);
			break;
		default: // No more dialogue...
			break;
		}
	}

	banterIdx++;
}

// Break any player structures during Clayde's spiel
function zuluIntroTargets()
{
	return enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (struct.status === BEING_BUILT));
}

// Try to snipe important player/Charlie units
function zuluKillerStrikeTargets()
{
	// First, target any sensors or commanders
	let targets = enumDroid(CAM_HUMAN_PLAYER).concat(enumDroid(MIS_TEAM_CHARLIE)).filter((droid) => (
		droid.droidType === DROID_SENSOR || droid.droidType === DROID_COMMAND
	));

	if (targets.length === 0)
	{
		// Second, trucks (NOT engineers) or AA tanks
		targets = enumDroid(CAM_HUMAN_PLAYER).concat(enumDroid(MIS_TEAM_CHARLIE)).filter((droid) => (
			(droid.droidType === DROID_CONSTRUCT && droid.propulsion !== "CyborgLegs")
			 || (droid.droidType === DROID_WEAPON && droid.canHitAir && !droid.canHitGround)
		));
	}

	if (targets.length === 0)
	{
		// Lastly, target any tanks
		targets = enumDroid(CAM_HUMAN_PLAYER).concat(enumDroid(MIS_TEAM_CHARLIE)).filter((droid) => (
			droid.droidType === DROID_WEAPON
		));
	}

	return targets;
}

// Try to snipe important player/Charlie structures
function zuluBusterStrikeTargets()
{
	// First, target any sensor towers or repair facilities
	let targets = enumStruct(CAM_HUMAN_PLAYER).concat(enumStruct(MIS_TEAM_CHARLIE)).filter((struct) => (
		struct.stattype === REPAIR_FACILITY || struct.isSensor || struct.isCB
	));

	if (targets.length === 0)
	{
		// Second, target any AA sites
		targets = enumStruct(CAM_HUMAN_PLAYER).concat(enumStruct(MIS_TEAM_CHARLIE)).filter((struct) => (
			struct.stattype === DEFENSE && struct.canHitAir && !struct.canHitGround
		));
	}

	if (targets.length === 0)
	{
		// Lastly, target any non-wall structure
		targets = enumStruct(CAM_HUMAN_PLAYER).concat(enumStruct(MIS_TEAM_CHARLIE)).filter((struct) => (struct.stattype !== WALL));
	}

	return targets;
}

// Order Zulu's tracked commander to attack
function aggroCommander1()
{
	camManageGroup(zuluCommander1, CAM_ORDER_ATTACK, {
		targetPlayer: MIS_TEAM_CHARLIE,
		repair: 50,
		removable: false
	});
}

// Order Zulu's halftrack/cyborg commander to attack
function aggroCommander2()
{
	camManageGroup(zuluCommander2, CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		repair: 75,
		removable: false
	});
}

// Order Zulu's hover commander to patrol more aggressively
function aggroCommander3()
{
	camManageGroup(zuluCommander3, CAM_ORDER_PATROL, {
		pos: [
			camMakePos("hoverPatrolPos1"),
			camMakePos("hoverPatrolPos2"),
			camMakePos("hoverPatrolPos3"),
			camMakePos("hoverPatrolPos4"),
			camMakePos("hoverPatrolPos5"),
			camMakePos("hoverPatrolPos6"),
			camMakePos("hoverPatrolPos7"),
		],
		interval: camSecondsToMilliseconds(36),
		radius: 20,
		repair: 75,
		removable: false
	});
}

// Allow Zulu to start using Tank Killer/Bunker Buster VTOL strike groups
function enableVtolStrikes()
{
	allowVtolStrikes = true;
}

function allowVtolStrikeGroups()
{
	return (difficulty > SUPEREASY) && allowVtolStrikes;
}

// Allow rebuilding commanders after a sufficient delay, and if Zulu still has a Command Relay Post
function allowCommander1Rebuild()
{
	return (difficulty > EASY) && (gameTime >= zuluCommander1DeathTime + MIS_ZULU_COMMANDER_DELAY) && (enumStruct(MIS_TEAM_ZULU, COMMAND_CONTROL).length > 0);
}

function allowCommander2Rebuild()
{
	return (difficulty > EASY) && (gameTime >= zuluCommander2DeathTime + MIS_ZULU_COMMANDER_DELAY) && (enumStruct(MIS_TEAM_ZULU, COMMAND_CONTROL).length > 0);
}

function allowCommander3Rebuild()
{
	return (difficulty > EASY) && (gameTime >= zuluCommander3DeathTime + MIS_ZULU_COMMANDER_DELAY) && (enumStruct(MIS_TEAM_ZULU, COMMAND_CONTROL).length > 0);
}

function camEnemyBaseEliminated()
{
	checkEnableLure();
}

function camEnemyBaseEliminated_zuluMainBase()
{
	camCallOnce("setWorldAblaze");
}

function camEnemyBaseEliminated_zuluFactoryBase()
{
	camCallOnce("setWorldAblaze");
}

function camEnemyBaseEliminated_zuluCanalBase()
{
	camCallOnce("setWorldAblaze");
}

function camEnemyBaseEliminated_zuluPlateauBase()
{
	camCallOnce("setWorldAblaze");
}

// Check if Clayde should activate his Lure trap
function checkEnableLure()
{
	let basesDestroyed = 0;
	if (camBaseIsEliminated("zuluEastBase")) basesDestroyed++;
	if (camBaseIsEliminated("zuluWestBase")) basesDestroyed++;
	if (camBaseIsEliminated("zuluWestOutpost")) basesDestroyed++;
	if (camBaseIsEliminated("zuluCentralOutpost")) basesDestroyed++;
	if (camBaseIsEliminated("zuluEastOutpost")) basesDestroyed++;

	// Enable the trap if at least 3 of these bases are destroyed
	if (basesDestroyed >= 3)
	{
		lureTrapEnabled = true;
	}
}

// Activate the Lure and draw in the Infested
function checkActivateLure()
{
	if (lureActive)
	{
		return; // Already active
	}

	if (worldAblaze)
	{
		// Stop spawning Infested
		removeTimer("checkActivateLure"); // Stop checking
		return;
	}

	if (lureTrapEnabled && !lureActive && getObject("zuluLure") !== null)
	{
		lureActive = true;
		camQueueDialogue({text: "--- ANOMALOUS SIGNAL DETECTED ---", delay: 0, sound: cam_sounds.beacon});
		camCallOnce("activateInfested");
		hackAddMessage("ZULU_LURE", PROX_MSG, CAM_HUMAN_PLAYER);
		lureBlipPlaced = true;
	}
}

function activateInfested()
{
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(50)));
	heliAttack();

	camQueueDialogue([
		{text: "CHARLIE: What the-", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commanders, the General's just activated a Lure!", delay: 1, sound: CAM_RCLICK},
		{text: "LIEUTENANT: And... it's inside his own base!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: What?! Is he crazy?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...He's trying to slow us down.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Watch your flanks!", delay: 3, sound: CAM_RCLICK},
	]);
}

function setWorldAblaze()
{
	// Prevent any more Infested from spawning
	lureActive = false;
	worldAblaze = true;
	camSetVtolSpawnState(false, "zuluLure"); // Disable Infested choppers (even if the Lure is still there)

	// Make the world look like it's on fire
	// Add a dark orange-red fog
	camSetFog(110, 71, 47);
	// Darken and give a red-orange hue to the lighting
	setTimer("skyHeartbeat", camSecondsToMilliseconds(6));
	camGradualFog(camSecondsToMilliseconds(2), 44, 28, 19);
	camGradualSunIntensity(camSecondsToMilliseconds(2), .22, .16, .14);
	// It's supposed to be ash...
	camSetWeather(CAM_WEATHER_SNOW);

	// Stop bantering
	removeTimer("claydeBanter");

	// Queue the evac event
	queue("startZuluEvac", camMinutesToMilliseconds(3));

	camSkipDialogue(); // Stop any current dialogue
	camQueueDialogue([
		{text: "CHARLIE: What the-?!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: Lieutenant, what's happening!?", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It's the Collective...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: They're bombing out whole areas of the sector!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Entire city blocks are going up in flames.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...The Infested are being annihilated!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: That means that Clayde's just lost the last trick up his sleeve!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: C'mon, Bravo.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: We've got him cornered now!", delay: 2, sound: CAM_RCLICK},
	]);
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

// Place a transport at Zulu's LZ, tell the player to go blow it up
function startZuluEvac()
{
	const tPos = camMakePos("landingZoneZulu");
	addDroid(MIS_TEAM_ZULU, tPos.x, tPos.y, "Transport", "TransporterBody", "V-Tol02", "", "", "MG3-VTOL");

	playSound(cam_sounds.transport.enemyTransportDetected);

	camQueueDialogue([
		{text: "CHARLIE: Lieutenant!", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: We've detected a transport in Clayde's main base.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Looks like the General's preparing an escape!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: No!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We can't let him get away, this has to end now!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commanders Bravo and Charlie, do not let that transport get away!", delay: 4, sound: CAM_RCLICK},
	]);

	// Restart banter cycle
	setTimer("claydeBanter", camMinutesToMilliseconds(5));
	banterIdx = 0;

	// TODO: Decrease the mission timer?

	camSetExtraObjectiveMessage([_("Defeat General Clayde"), _("Destroy Clayde's Transport")]);
}

// Make Zulu passive and have the Lieutenant give a short speech
function zuluSurrender()
{
	setAlliance(MIS_TEAM_ZULU, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_ZULU, MIS_TEAM_CHARLIE, true);
	camSetExtraObjectiveMessage();

	// Disable every factory (most of these are probably destroyed at this point anyway)
	camDisableFactory("zuluFactory1");
	camDisableFactory("zuluFactory2");
	camDisableFactory("zuluFactory3");
	camDisableFactory("zuluFactory4");
	camDisableFactory("zuluFactory5");
	camDisableFactory("zuluCybFactory1");
	camDisableFactory("zuluCybFactory2");
	camDisableFactory("zuluCybFactory3");
	camDisableFactory("zuluCybFactory4");
	camDisableFactory("zuluVtolFactory1");
	camDisableFactory("zuluVtolFactory2");
	camDisableFactory("zuluVtolFactory3");
	camDisableFactory("zuluVtolFactory4");

	// Put every Zulu droid in one group (so they stop doing things)
	camMakeGroup(enumDroid(MIS_TEAM_ZULU));

	// This'll disable the mission timer (if it exists)
	camGrantBonusPower();

	camSkipDialogue();
	camQueueDialogue([
		{text: "CHARLIE: We...", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: We did it!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: We actually did it!", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: The General, did he...", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It looks like the General was in that transport when it took off.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I'm not seeing any survivors in the wreckage.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: So Clayde's...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: He's gone.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It's just us now.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Attention all remaining NARS personnel.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...This is the Lieutenant speaking.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I don't know what Clayde has said about me,", delay: 3, sound: CAM_RCLICK},
		{text: "or about Commanders Bravo and Charlie.", delay: 0},
		{text: "LIEUTENANT: But look around yourselves.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: The world is burning around us.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: General Clayde is dead.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: And his plans for NARS have died with him.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: All that's left for the rest of us...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Is to pick up the pieces.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: So...", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I ask now that you put down your arms, and join us.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Help us evacuate, so that we don't lose even more lives here.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: So that we can build our own future.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: So that we can leave this blasted city for good!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: What do you say?", delay: 4, sound: CAM_RCLICK},
		{callback: "absorbZulu", delay: 2}, // Donate Zulu stuff
		{callback: "allowWin", delay: 3}, // Allow the mission to end
	]);

	camSetWeather(CAM_WEATHER_SNOWSTORM);
	camSetSkyType(CAM_SKY_ARIZONA);
}

// Donate all remaining Zulu units to the player, and grant any artifacts not yet picked up
function absorbZulu()
{
	const donateDroids = enumDroid(MIS_TEAM_ZULU);
	if (donateDroids.length > 0)
	{
		playSound(cam_sounds.unitsTransferred);
		for (const droid of donateDroids)
		{
			// Also give droids some EXP
			if (droid.droidType !== DROID_COMMAND) camSetDroidRank(droid, "Veteran");
		}
		camEnsureDonateObject(donateDroids, CAM_HUMAN_PLAYER);
	}

	if (!camAllArtifactsPickedUp())
	{
		enableResearch("R-Wpn-Cannon-Damage07", CAM_HUMAN_PLAYER);
		enableResearch("R-Wpn-Cannon-ROF04", CAM_HUMAN_PLAYER);

		playSound(cam_sounds.technologyTransferred);

		camSetArtifacts({});
	}
}

function allowWin()
{
	zuluSurrendered = true;
}

function claydeDefeated()
{
	if (zuluSurrendered)
	{
		return true;
	}
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz
	const transportEntryPos = camMakePos("transportEntry");

	camSetStandardWinLossConditions(CAM_VICTORY_OFFWORLD, "A4L5", {
		reinforcements: camMinutesToSeconds(1),
		area: "compromiseZone",
		callback: "claydeDefeated",
		enableLastAttack: false,
		ignoreInfestedUnits: true
	});
	camSetExtraObjectiveMessage(_("Defeat General Clayde"));

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);
	camCompleteRequiredResearch(camA4L4AllyResearch, MIS_TEAM_CHARLIE);
	camCompleteRequiredResearch(camA4L4AllyResearch, MIS_TEAM_ZULU);
	camCompleteRequiredResearch(mis_zuluExtraResearch, MIS_TEAM_ZULU);

	setAlliance(MIS_TEAM_CHARLIE, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TEAM_ZULU, CAM_HUMAN_PLAYER, true); // Temporary; for Clayde's spiel

	camSetObjectVision(MIS_TEAM_CHARLIE);

	changePlayerColour(MIS_TEAM_CHARLIE, (playerData[0].colour !== 11) ? 11 : 5); // Charlie to bright blue or blue
	changePlayerColour(MIS_TEAM_ZULU, (playerData[0].colour !== 15) ? 15 : 0); // Zulu to brown or green

	camSetArtifacts({
		"zuluResearch1": { tech: "R-Wpn-Cannon-Damage07" }, // HVAPFSDS Cannon Rounds
		"zuluResearch2": { tech: "R-Wpn-Cannon-ROF04" }, // Cannon Rapid Loader
	});

	camSetEnemyBases({
		"zuluMainBase": {
			cleanup: "zuluBase1",
			detectMsg: "ZULU_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"zuluFactoryBase": {
			cleanup: "zuluBase2",
			detectMsg: "ZULU_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"zuluCanalBase": {
			cleanup: "zuluBase3",
			detectMsg: "ZULU_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"zuluPlateauBase": {
			cleanup: "zuluBase4",
			detectMsg: "ZULU_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: MIS_TEAM_ZULU
		},
		"zuluEastBase": {
			cleanup: "zuluBase5",
			detectMsg: "ZULU_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"zuluWestBase": {
			cleanup: "zuluBase6",
			detectMsg: "ZULU_BASE6",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"zuluWestOutpost": {
			cleanup: "zuluBase7",
			detectMsg: "ZULU_BASE7",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"zuluCentralOutpost": {
			cleanup: "zuluBase8",
			detectMsg: "ZULU_BASE8",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"zuluEastOutpost": {
			cleanup: "zuluBase9",
			detectMsg: "ZULU_BASE9",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		// These start unbuilt:
		"charlieLZ": {
			cleanup: "charlieStructArea",
			friendly: true
		},
		"charlieForwardBase": {
			cleanup: "zuluBase4",
			friendly: true,
			player: MIS_TEAM_CHARLIE
		},
	});

	const FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(120));
	const CYBORG_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(40));
	const VTOL_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(110));
	camSetFactories({
		"zuluFactory1": {
			throttle: FACTORY_TIME,
			// These factories hold no templates; they just restock refillable groups
			templates: []
		},
		"zuluFactory2": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"zuluFactory3": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"zuluFactory4": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"zuluFactory5": {
			throttle: FACTORY_TIME,
			templates: []
		},
		"zuluCybFactory1": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"zuluCybFactory2": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"zuluCybFactory3": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"zuluCybFactory4": {
			throttle: CYBORG_FACTORY_TIME,
			templates: []
		},
		"zuluVtolFactory1": {
			assembly: "zuluVtolAssembly1",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},
		"zuluVtolFactory2": {
			assembly: "zuluVtolAssembly2",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},
		"zuluVtolFactory3": {
			assembly: "zuluVtolAssembly2",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},
		"zuluVtolFactory4": {
			assembly: "zuluVtolAssembly2",
			throttle: VTOL_FACTORY_TIME,
			templates: []
		},
	});

	zuluCommander1DeathTime = 0;
	zuluCommander2DeathTime = 0;
	zuluCommander3DeathTime = 0;
	lureTrapEnabled = false;
	lureActive = false;
	worldAblaze = false;
	allowVtolStrikes = false;
	zuluSurrendered = false;
	heartbeatDarkness = false;
	banterIdx = 1;
	zuluRank = (difficulty <= EASY) ? 6 : difficulty + 4; // Elite to Hero
	lureBlipPlaced = false;

	// Setup the second command group
	// NOTE: This is done at the start because this commander takes part in the intro scene
	zuluCommander2 = camMakeRefillableGroup(
		camMakeGroup("zuluCommander2"), {
			templates: [mis_zuluComHTTempl],
			factories: ["zuluFactory4"],
			callback: "allowCommander2Rebuild"
		}, CAM_ORDER_PATROL, { // Commander orders are updated later
			pos: [
				camMakePos("patrolPos4"),
				camMakePos("patrolPos5"),
				camMakePos("patrolPos6"),
				camMakePos("patrolPos7"),
			],
			interval: camSecondsToMilliseconds(36),
			radius: 20,
			repair: 75
	});
	camMakeRefillableGroup(
		camMakeGroup("introCommandGroup"), {
			templates: [ // 4 Assault Guns, 4 Tank Killers, 2 Whirlwinds, 4 Assault Gunners, and 4 Super HVC Cyborgs
				mis_zuluAGTempl, mis_zuluAGTempl,
				mis_zuluTKTempl, mis_zuluTKTempl,
				cTempl.plhraaht,
				mis_zuluAGTempl, mis_zuluAGTempl,
				mis_zuluTKTempl, mis_zuluTKTempl,
				cTempl.plhraaht,
				cTempl.cybag, cTempl.cybag,
				cTempl.scyhc, cTempl.scyhc,
				cTempl.cybag, cTempl.cybag,
				cTempl.scyhc, cTempl.scyhc,
				cTempl.scyhc, cTempl.scyhc, // 2 Super HVC Cyborgs (Hard+)
				mis_zuluTKTempl, mis_zuluTKTempl, // 2 Tank Killers (Insane)
			],
			factories: ["zuluFactory1", "zuluFactory2", "zuluCybFactory1", "zuluCybFactory2", "zuluCybFactory3", "zuluCybFactory4"],
		}, CAM_ORDER_FOLLOW, {
			leader: "zuluCommander2",
			repair: 75,
			suborder: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("patrolPos4"),
					camMakePos("patrolPos5"),
					camMakePos("patrolPos6"),
					camMakePos("patrolPos7"),
				],
				interval: camSecondsToMilliseconds(36),
				radius: 20,
				repair: 75
			}
	});

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	camAutoReplaceObjectLabel(["zuluLure", "zuluVtolTower1", "zuluVtolTower2", "zuluVtolTower3", "zuluVtolCBTower"]);

	// Swap on-map templates
	if (difficulty >= HARD)
	{
		camUpgradeOnMapTemplates(cTempl.plhasgnht, mis_zuluAGTempl, MIS_TEAM_ZULU);
		camUpgradeOnMapTemplates(cTempl.plhhatht, mis_zuluTKTempl, MIS_TEAM_ZULU);
		camUpgradeOnMapTemplates(cTempl.plhbbh, mis_zuluBBTempl, MIS_TEAM_ZULU);
		if (difficulty === INSANE)
		{
			camUpgradeOnMapTemplates(cTempl.plhinfh, mis_zuluInfTempl, MIS_TEAM_ZULU);
			camUpgradeOnMapTemplates(cTempl.plhcomht, mis_zuluComHTTempl, MIS_TEAM_ZULU);
			camUpgradeOnMapTemplates(cTempl.plhcomh, mis_zuluComHovTempl, MIS_TEAM_ZULU);
		}
	}

	// Rank commanders...
	camSetDroidRank(getObject("zuluCommander1"), zuluRank);
	camSetDroidRank(getObject("zuluCommander2"), zuluRank);
	camSetDroidRank(getObject("zuluCommander3"), zuluRank);

	camSetWeather(CAM_WEATHER_RAINSTORM);
	camSetSkyType(CAM_SKY_NIGHT);
	// Give the fog a dark purple hue
	camSetFog(32, 12, 64);
	// Add a purple-blue tint
	camSetSunIntensity(.45, .35, .45);
}