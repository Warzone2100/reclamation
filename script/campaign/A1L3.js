include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const MIS_NASDA = 1;
const MIS_ORANGE_SCAVS = 4;
const MIS_RED_SCAVS = 6;
const transportEntryPos1 = { x: 125, y: 24 };
const transportEntryPos2 = { x: 74, y: 61 };

var extraAntiAir;
var chaingunArtifactPlaced;
var collectiveDetected;
var backupTruckSpawned;
var collectiveTimeFlag;

var colRepairGroup;
var colUplinkPatrolGroup;
var colSensorGroup;
var colMortarGroup;
var colLZTruckJob;
var colUplinkTruckJob;

const mis_scavResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage01", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-ROF01", "R-Vehicle-Metals01", "R-Struc-Materials01", 
	"R-Defense-WallUpgrade01", "R-Wpn-Flamer-Damage03",
];
const mis_collectiveResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage01", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-ROF01", "R-Vehicle-Metals01", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade01", "R-Wpn-Flamer-Damage03", "R-Sys-Engineering01",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy01",
];

// The chances of a helicopter actually using this is incredibly low
// but we should still have this
camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", MIS_RED_SCAVS);
});

function heliAttack1()
{
	// Focus on the player
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
		// pos: camMakePos("landingZone")
	};
	camSetVtolData(MIS_RED_SCAVS, "heliAttackPos", "heliRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(2)), "heliTower1", ext);
}

function heliAttack2()
{
	// Focus on the player
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
		// pos: camMakePos("landingZone")
	};
	camSetVtolData(MIS_RED_SCAVS, "heliAttackPos", "heliRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(2)), "heliTower2", ext);
}

// Start moving scavenger patrol groups
function groupPatrol()
{
	camManageGroup(camMakeGroup("scavPatrolGroup1"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos4"),
			camMakePos("patrolPos5")
		],
		interval: camSecondsToMilliseconds(15)
	});

	camManageGroup(camMakeGroup("scavPatrolGroup2"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos2"),
			camMakePos("patrolPos3")
		],
		interval: camSecondsToMilliseconds(15)
	});

	camManageGroup(camMakeGroup("scavPatrolGroup3"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos6"),
			camMakePos("patrolPos7")
		],
		interval: camSecondsToMilliseconds(20)
	});

	camManageGroup(camMakeGroup("scavPatrolGroup4"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("patrolPos8"),
			camMakePos("patrolPos9"),
			camMakePos("patrolPos10")
		],
		interval: camSecondsToMilliseconds(30)
	});
}

// Send scavenger attack squads
function scavAttack1()
{
	camManageGroup(camMakeGroup("scavAttackGroup1"), CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER
	});
}

function scavAttack2()
{
	camManageGroup(camMakeGroup("scavAttackGroup2"), CAM_ORDER_ATTACK, {
		targetPlayer: CAM_HUMAN_PLAYER,
		morale: 80,
		fallback: camMakePos("patrolPos7")
	});
}

// Activate two more red factories and one orange factory
function activateSecondFactories()
{
	camEnableFactory("redFactory2");
	camEnableFactory("redFactory4");
	camEnableFactory("orangeFactory1");

	if (!collectiveDetected)
	{
		// Dialogue about Collective sightings
		camQueueDialogue([
			{text: "GOLF: General, sir!", delay: 0, sound: CAM_RCLICK},
			{text: "GOLF: We've spotted some strange looking vehicles moving through our AO, sir.", delay: 3, sound: CAM_RCLICK},
			{text: "GOLF: They, uhh... they don't look like scavengers, sir.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: ...And what do you expect me to make of this, Commander Golf?", delay: 5, sound: CAM_RCLICK},
			{text: "GOLF: I dunno, it's just...", delay: 4, sound: CAM_RCLICK},
			{text: "GOLF: Their vehicles look a bit more like ours than scavengers.", delay: 2, sound: CAM_RCLICK},
			{text: "GOLF: ...Maybe there's another force operating in this sector?", delay: 3, sound: CAM_RCLICK},
		]);
	}
}

// Activate all remaining factories
function activateFinalFactories()
{
	camEnableFactory("redFactory5");
	camEnableFactory("orangeFactory2");
	camEnableFactory("orangeFactory3");
	camEnableFactory("orangeFactory4");
}

function sendCollectiveTransporter()
{
	if (camBaseIsEliminated("colLZBase"))
	{
		return; // LZ not built or is destroyed
	}

	if (enumDroid(CAM_THE_COLLECTIVE).length > camChangeOnDiff(70, true))
	{
		return; // Don't get TOO crazy :)
	}

	// Make a list of droids to bring in in order of importance
	// Trucks -> Repair -> Patrol -> Sensor -> Mortars
	// If space allows, add additional Misc. attack units
	let droidQueue = [];

	if (!camDef(camGetTruck(colLZTruckJob)))
	{
		droidQueue.push(cTempl.coltruckht);
	}

	if (!camDef(camGetTruck(colUplinkTruckJob)) && camBaseIsEliminated("redUplinkBase")
		&& (enumArea("redBase5", CAM_HUMAN_PLAYER, false).length == 0 || !camBaseIsEliminated("colUplinkBase")))
	{
		// Only order this truck if the scav uplink base is destroyed, and no player units are nearby or the outpost is already set up
		droidQueue.push(cTempl.coltruckht);
	}

	droidQueue = droidQueue.concat(camGetRefillableGroupTemplates([colRepairGroup, colUplinkPatrolGroup, colSensorGroup, colMortarGroup]));

	const droids = [];
	for (let i = 0; i < ((difficulty < HARD) ? 8 : 10); i++)
	{
		if (i < droidQueue.length)
		{
			droids.push(droidQueue[i]);
		}
		else
		{
			// Add misc. attack units
			templates = [
			cTempl.colhmght, // HMG
			cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, // Light Cannon
			cTempl.colmrat, // MRA
			cTempl.colflamt, // Flamer
			];
			droids.push(camRandFrom(templates));
		}
	}

	camSendReinforcement(CAM_THE_COLLECTIVE, camMakePos("landingZoneCollective"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: collectiveDetected ? transportEntryPos2 : transportEntryPos1,
			exit: transportEntryPos1,
			order: CAM_ORDER_ATTACK,
			data: {
				repair: 25,
				repairPos: camMakePos("collectiveRepairPos")
			},
			// NOTE: Until the player "discovers" the Collective, there won't be any announcement of Collective transports
			silent: !collectiveDetected
		}
	);
}

// Start ordering Collective units around
function eventTransporterLanded(transport)
{
	if (transport.player !== CAM_THE_COLLECTIVE)
	{
		return; // don't care
	}

	const transDroids = camGetTransporterDroids(transport.player);
	const transTrucks = transDroids.filter((droid) => (droid.droidType == DROID_CONSTRUCT));
	const transOther = transDroids.filter((droid) => (droid.droidType != DROID_CONSTRUCT));

	// Assign the truck(s)
	let truckIndex = 0;
	// Check if the LZ truck is missing
	if (!camDef(camGetTruck(colLZTruckJob)) && camDef(transTrucks[truckIndex]))
	{
		// Assign this truck!
		camAssignTruck(transTrucks[truckIndex], colLZTruckJob);
		truckIndex++;
	}
	// Check if the Uplink truck is missing
	if (!camDef(camGetTruck(colUplinkTruckJob)) && camDef(transTrucks[truckIndex]))
	{
		camAssignTruck(transTrucks[truckIndex], colUplinkTruckJob);
	}

	// Loop through the list and look for a sensor droid
	for (const droid of transOther)
	{
		if (droid.isSensor)
		{
			// Allows the mortar group to follow the sensor
			addLabel(droid, "colSensorDroid");

			// Restate the follow order
			// camManageGroup(colMortarGroup, CAM_ORDER_FOLLOW, {
			// 	leader: "colSensorDroid",
			// 	suborder: CAM_ORDER_DEFEND,
			// 	pos: camMakePos("collectiveRepairPos"), // Defend this position if the sensor is dead.
			// 	repair: 75,
			// 	repairPos: camMakePos("collectiveRepairPos")
			// });
		}
	}

	// Assign other units to their refillable groups
	camAssignToRefillableGroups(transOther, [colRepairGroup, colUplinkPatrolGroup, colSensorGroup, colMortarGroup]);
	// NOTE: Remaining reinforcements that aren't assigned here will be handled like normal reinforcement units
}

function camEnemyBaseEliminated()
{
	checkCollectiveIntroduction();
}

function setCollectiveTimeFlag()
{
	collectiveTimeFlag = true;
	checkCollectiveIntroduction();
}

// Introduce the Collective onto the map if 4 scavenger bases are destroyed
// If (collectiveTimeFlag == true), then we only need 3 bases destroyed
function checkCollectiveIntroduction() 
{
	const bases = [
		"redRoadblockBase", "redNorthRoadBase", "redPlateauBase",
		"redSouthRoadBase", "redUplinkBase", "orangeNorthRoadBase",
		"orangePlateauBase", "orangeSouthCraterBase", "orangeNorthCraterBase",
	];
	let numBasesDestroyed = 0;

	for (const base of bases)
	{
		if (camBaseIsEliminated(base))
		{
			numBasesDestroyed++;
		}
	}

	if (numBasesDestroyed >= 4 ||
		(collectiveTimeFlag && numBasesDestroyed >= 3))
	{
		camCallOnce("introduceCollective");
	}
}

// Bring Collective units into the level, and set up refillable groups and trucks
function introduceCollective()
{
	// Set up Collective groups and trucks
	// NOTE: The Collective can bring more than these units, but they will be handled like standard reinforcements.
	
	// Repair group stationed at the LZ
	const repairTemplates = [cTempl.colrept, cTempl.colrept];
	colRepairGroup = camSendReinforcement(CAM_THE_COLLECTIVE, getObject("collectiveEntrance"), repairTemplates, CAM_REINFORCE_GROUND);
	camMakeRefillableGroup(colRepairGroup, {templates: repairTemplates}, CAM_ORDER_DEFEND, {pos: camMakePos("collectiveRepairPos")});
	
	// Patrols the area around the LZ and the Uplink (6 Heavy Machineguns and 4 Mini-Rocket Pods)
	const patrolTemplates = [
		cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, cTempl.colcanht,
		cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, 
	];
	colUplinkPatrolGroup = camSendReinforcement(CAM_THE_COLLECTIVE, getObject("collectiveEntrance"), patrolTemplates, CAM_REINFORCE_GROUND);
	camMakeRefillableGroup(
		colUplinkPatrolGroup, {templates: patrolTemplates}, CAM_ORDER_PATROL, {
			pos: [camMakePos("patrolPos1"), camMakePos("patrolPos2"), camMakePos("patrolPos3")],
			count: 10,
			morale: 70,
			fallback: camMakePos("collectiveRepairPos"),
			repair: 60,
			repairPos: camMakePos("collectiveRepairPos") // Wait here for repairs/reinforcements
	});

	// These groups are filled in later!
	// Single Sensor unit
	colSensorGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				(difficulty < HARD) ? cTempl.colsenst : cTempl.comsenst,
			]
		}, CAM_ORDER_ATTACK, {
			repair: 60,
			repairPos: camMakePos("collectiveRepairPos")
	});
	// Mortars to be assigned to a sensor (4 Mortars)
	colMortarGroup = camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.colmortht, cTempl.colmortht,
				cTempl.colmortht, cTempl.colmortht,
			]
		}, CAM_ORDER_FOLLOW, {
			leader: "colSensorDroid", // NOTE: This droid doesn't exist at the start of the mission!
			suborder: CAM_ORDER_DEFEND,
			pos: camMakePos("collectiveRepairPos"), // Defend this position if the sensor is dead.
			repair: 75,
			repairPos: camMakePos("collectiveRepairPos")
	});

	// One truck for the LZ, one for the Uplink outpost
	const tPos = camMakePos("collectiveEntrance");
	const tTemp = cTempl.coltruckht;
	colLZTruckJob = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colLZBase",
			rebuildBase: true,
			structset: camA1L3LZStructs,
			// Spawn a truck along with the other units
			truckDroid: camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp),
	});
	colUplinkTruckJob = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colUplinkBase",
			rebuildBase: true,
			structset: camA1L3UplinkStructs,
			// This truck is brought in later!
	});

	// Upgrade Collective structures on harder difficulties
	if (difficulty >= HARD)
	{
		// Hardened towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "GuardTower1", "GuardTower3"); // HMG Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "GuardTower6", "GuardTower6H"); // MRP Towers
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Sys-SensoTower01", "Sys-SensoTower02"); // Sensor Towers
	}
	if (difficulty == INSANE)
	{
		// Bunkers instead of emplacements
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "Cannon-Emplacement", "PillBox4"); // Cannon Emplacements/Bunkers
	}

	if (difficulty >= HARD) addCollectiveAntiAir(); // Do this immediately on Hard+

	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3.5)));

	// Dialogue about unknown transmissions
	camQueueDialogue([
		{text: "LIEUTENANT: Sir, I'm picking up some strange transmissions.", delay: 0, sound: CAM_RCLICK},
		{text: "LIEUTENANT: They're originating somewhere to the east of team Bravo's current position.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Have you been able to decipher them?", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: No sir. They appear to have some level of encryption.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: ...Encrypted scavenger radio broadcasts?", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: What are the odds of them having that kind of tech?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Not likely, sir.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commander Bravo; please proceed with caution.", delay: 6, sound: CAM_RCLICK},
	]);
}

// If the player attacks the Collective with VTOLs, have the Collective get extra AA.
function eventAttacked(victim, attacker) 
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (!collectiveDetected && 
		((victim.player === CAM_THE_COLLECTIVE && attacker.player === CAM_HUMAN_PLAYER) 
			|| (victim.player === CAM_HUMAN_PLAYER && attacker.player === CAM_THE_COLLECTIVE)))
	{
		collectiveDetected = true;

		// Dialogue encountering the Collective
		camQueueDialogue([
			{text: "LIEUTENANT: General, are you seeing this sir...?", delay: 6, sound: CAM_RCLICK},
			{text: "CLAYDE: Oh, I'm seeing it alright.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: All Commanders be advised; we have confirmed accounts", delay: 3, sound: CAM_RCLICK},
			{text: "of an advanced, hostile force operating in this sector.", delay: 0},
			{text: "CLAYDE: Proceed with extreme caution.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Commander Bravo.", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: Your objective remains the same, capture that uplink and clear the area.", delay: 2, sound: CAM_RCLICK},
			{text: "CLAYDE: If they are here for that uplink station, then we CANNOT let them have it.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: ...Whoever they are.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Use whatever means necessary to complete your objective.", delay: 3, sound: CAM_RCLICK},
			{text: "LIEUTENANT: Tread carefully, Commander Bravo.", delay: 6, sound: CAM_RCLICK},
			{text: "LIEUTENANT: We don't know what we're up against here...", delay: 3, sound: CAM_RCLICK},
		]);
	}

	if (!extraAntiAir && victim.player === CAM_THE_COLLECTIVE 
		&& attacker.player === CAM_HUMAN_PLAYER && attacker.type === DROID && isVTOL(attacker))
	{
		camCallOnce("addCollectiveAntiAir");
	}
}

function eventDestroyed(obj)
{
	if (obj.player === CAM_THE_COLLECTIVE && obj.type === DROID 
		&& obj.droidType === DROID_CONSTRUCT && !chaingunArtifactPlaced)
	{
		if (!backupTruckSpawned)
		{
			// The Collective truck was sniped before it could build a tower!
			// Spawn another truck after a few seconds
			queue("spawnBackupTruck", camSecondsToMilliseconds(8));
		}
		else
		{
			// The Collective truck was sniped again!
			// Try calling another truck one more time, but this time just put the artifact in the truck itself
			queue("spawnBackupTruck", camSecondsToMilliseconds(12));
			// If this truck gets sniped too, then we just give up entirely
		}
	}
}

function spawnBackupTruck()
{
	const tPos = camMakePos("collectiveEntrance");
	const tTemp = cTempl.coltruckht;
	const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
	camAssignTruck(newTruck, colLZTruckJob);
	if (!backupTruckSpawned)
	{
		backupTruckSpawned = true;
	}
	else
	{
		// Give this truck the Chaingun Upgrade artifact
		addLabel(newTruck, "colBackupBackupTruck");
		camAddArtifact({"colBackupBackupTruck": { tech: "R-Wpn-MG-ROF01" }}); // Chaingun Upgrade
		chaingunArtifactPlaced = true;
	}
}

function addCollectiveAntiAir()
{
	if (extraAntiAir || difficulty <= EASY)
	{
		return;
	}

	// Order the LZ truck to build extra AA
	camSetStructureSet(colLZTruckJob, camA1L3LZStructs.concat(camA1L3AntiAir));

	if (difficulty == INSANE)
	{
		// Add 2 Hurricane units to the patrol group
		camSetRefillableGroupData(colUplinkPatrolGroup, {templates: [
			cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, cTempl.colcanht,
			cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, cTempl.colpodt, 
			cTempl.colaaht, cTempl.colaaht,
		]});
	}

	extraAntiAir = true;
}

// Put an artifact into the first HMG tower the Collective build
function eventStructureBuilt(struct, droid) 
{
	if (!chaingunArtifactPlaced && struct.player === CAM_THE_COLLECTIVE && 
		(struct.name === "Heavy Machinegun Guard Tower" || struct.name === "Heavy Machinegun Tower"))
	{
		addLabel(struct, "colHMGTower");
		camAddArtifact({"colHMGTower": { tech: "R-Wpn-MG-ROF01" }}); // Chaingun Upgrade
		chaingunArtifactPlaced = true;
	}
}

function adaptEnemyColors()
{
	// Make sure the scavengers aren't choosing conflicting colors with the player
	const PLAYER_COLOR = playerData[0].colour;
	changePlayerColour(CAM_THE_COLLECTIVE, (PLAYER_COLOR !== 2) ? 2 : 10); // Set to gray or white
	changePlayerColour(MIS_ORANGE_SCAVS, (PLAYER_COLOR !== 1) ? 1 : 8); // Set to orange or yellow
	changePlayerColour(MIS_RED_SCAVS, (PLAYER_COLOR !== 4) ? 4 : 13); // Set to red or infrared
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone");

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A1L4S");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	adaptEnemyColors();

	// An artifact for the Heavy Machinegun is added later, once the Collective start building their LZ
	camSetArtifacts({
		"redFactory2": { tech: "R-Wpn-Rocket-Accuracy01" }, // Stabilized Rockets
		"orangeFactory3": { tech: "R-Wpn-Mortar-Damage03" }, // HE Mortar Shells Mk3
		"redFactory5": { tech: "R-Wpn-Flamer-ROF02" }, // Flamer Autoloader Mk2
	});

	camCompleteRequiredResearch(mis_scavResearch, MIS_ORANGE_SCAVS);
	camCompleteRequiredResearch(mis_scavResearch, MIS_RED_SCAVS);
	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);

	// In case the player didn't get these in the last mission
	enableResearch("R-Struc-PowerModuleMk1", CAM_HUMAN_PLAYER);
	enableResearch("R-Vehicle-Prop-VTOL", CAM_HUMAN_PLAYER);

	setAlliance(MIS_NASDA, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_NASDA, CAM_THE_COLLECTIVE, true);
	setAlliance(MIS_NASDA, MIS_RED_SCAVS, true);
	setAlliance(MIS_NASDA, MIS_ORANGE_SCAVS, true);

	camSetEnemyBases({
		"redRoadblockBase": {
			cleanup: "redBase1",
			detectMsg: "RED_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated,
		},
		"redNorthRoadBase": {
			cleanup: "redBase2",
			detectMsg: "RED_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"redPlateauBase": {
			cleanup: "redBase3",
			detectMsg: "RED_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"redSouthRoadBase": {
			cleanup: "redBase4",
			detectMsg: "RED_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"redUplinkBase": {
			cleanup: "redBase5",
			detectMsg: "RED_BASE5",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
			player: MIS_RED_SCAVS
		},
		"orangeNorthRoadBase": {
			cleanup: "orangeBase1",
			detectMsg: "ORANGE_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"orangePlateauBase": {
			cleanup: "orangeBase2",
			detectMsg: "ORANGE_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"orangeSouthCraterBase": {
			cleanup: "orangeBase3",
			detectMsg: "ORANGE_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"orangeNorthCraterBase": {
			cleanup: "orangeBase4",
			detectMsg: "ORANGE_BASE4",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		// These start unbuilt
		"colLZBase": {
			cleanup: "collectiveLZBaseArea",
			detectMsg: "COL_LZ",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
		},
		"colUplinkBase": {
			cleanup: "collectiveUplinkBaseArea",
			detectMsg: "COL_UPLINK",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: CAM_THE_COLLECTIVE,
		},
	});

	camSetFactories({
		"redFactory1": {
			assembly: "redAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.kevbloke, cTempl.kevlance, cTempl.sartruck, cTempl.rbjeep, cTempl.kevlance ]
		},
		"redFactory2": {
			assembly: "redAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(40)),
			templates: [ cTempl.flatmrl, cTempl.firetruck, cTempl.rbjeep, cTempl.monmrl, cTempl.minitruck, cTempl.kevlance ]
		},
		"redFactory3": {
			assembly: "redAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.minitruck, cTempl.kevlance, cTempl.rbjeep, cTempl.firetruck, cTempl.kevbloke, cTempl.monhmg ]
		},
		"redFactory4": {
			assembly: "redAssembly4",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(44)),
			templates: [ cTempl.flatat, cTempl.kevlance, cTempl.monfire, cTempl.rbjeep, cTempl.minitruck, cTempl.bjeep, cTempl.kevbloke ]
		},
		"redFactory5": {
			assembly: "redAssembly5",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: MIS_ORANGE_SCAVS
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(38)),
			templates: [ cTempl.flatmrl, cTempl.sartruck, cTempl.bjeep, cTempl.rbjeep, cTempl.firetruck ]
		},
		"orangeFactory1": {
			assembly: "orangeAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.gbjeep, cTempl.bloke, cTempl.buscan, cTempl.bjeep, cTempl.bloke ]
		},
		"orangeFactory2": {
			assembly: "orangeAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.moncan, cTempl.bjeep, cTempl.bloke, cTempl.gbjeep, cTempl.buscan ]
		},
		"orangeFactory3": {
			assembly: "orangeAssembly3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: MIS_RED_SCAVS
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.buscan, cTempl.bloke, cTempl.gbjeep, cTempl.bjeep, cTempl.bloke ]
		},
		"orangeFactory4": {
			assembly: "orangeAssembly4",
			order: CAM_ORDER_ATTACK,
			// Attacks indiscriminately
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.buscan, cTempl.monhmg, cTempl.bjeep, cTempl.gbjeep, cTempl.bjeep, cTempl.bloke ]
		},
	});

	extraAntiAir = false;
	chaingunArtifactPlaced = false;
	collectiveDetected = false;
	backupTruckSpawned = false;
	collectiveTimeFlag = false;

	// Start these immediately
	camEnableFactory("redFactory1");
	camEnableFactory("redFactory3");

	if (tweakOptions.rec_timerlessMode)
	{
		switch (difficulty)
		{
			case INSANE:
				// Cranes for the red roadblock base and orange central crater base
				camManageTrucks(
					MIS_ORANGE_SCAVS, {
						label: "orangeSouthCraterBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("orangeBase3")
				});
				camManageTrucks(
					MIS_RED_SCAVS, {
						label: "redRoadblockBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("redBase1")
				});
			case HARD: // NOTE: Fall-through here! We still add Cranes from lower difficulties!
				// Cranes for the red north road base, and orange northeast crater base
				camManageTrucks(
					MIS_RED_SCAVS, {
						label: "redNorthRoadBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("redBase2")
				});
				camManageTrucks(
					MIS_ORANGE_SCAVS, {
						label: "orangeNorthCraterBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("orangeBase4")
				});
			case MEDIUM:
				// Cranes for the south red base and northwest orange base
				camManageTrucks(
					MIS_RED_SCAVS, {
						label: "redSouthRoadBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("redBase4")
				});
				camManageTrucks(
					MIS_ORANGE_SCAVS, {
						label: "orangeNorthRoadBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("orangeBase1")
				});
			default:
				// Cranes for the red uplink base, plateau base, and orange hill base
				camManageTrucks(
					MIS_RED_SCAVS, {
						label: "redUplinkBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("redBase5")
				});
				camManageTrucks(
					MIS_RED_SCAVS, {
						label: "redPlateauBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("redBase3")
				});
				camManageTrucks(
					MIS_ORANGE_SCAVS, {
						label: "orangePlateauBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("orangeBase2")
				});
		}
	}
	else
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1.25)));
	}

	camAutoReplaceObjectLabel(["heliTower1", "heliTower2"]);
	camDisableInfAutoManagement(); // MIS_ORANGE_SCAVS uses the same player number as CAM_INFESTED

	// NOTE: The scavenger factories activate pretty quickly on this mission
	queue("groupPatrol", camSecondsToMilliseconds(5));
	queue("scavAttack1", camChangeOnDiff(camSecondsToMilliseconds(80)));
	queue("scavAttack2", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("heliAttack1", camChangeOnDiff(camMinutesToMilliseconds(3)));
	queue("activateSecondFactories", camChangeOnDiff(camMinutesToMilliseconds(6)));
	queue("heliAttack2", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("setCollectiveTimeFlag", camChangeOnDiff(camMinutesToMilliseconds(10)));
	queue("activateFinalFactories", camChangeOnDiff(camMinutesToMilliseconds(12)));

	// Give player briefing.
	camPlayVideos({video: "A1L3_BRIEF", type: MISS_MSG});

	// Remind the player to try out their cool new toys
	camQueueDialogue([
		{text: "LIEUTENANT: Don't forget to examine the technology", delay: 8, sound: CAM_RCLICK},
		{text: "recovered from NASDA Central, Commander Bravo!", delay: 0},
		{text: "LIEUTENANT: I have a feeling that they'll prove to be very useful.", delay: 3, sound: CAM_RCLICK},
	]);

	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
}