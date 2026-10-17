include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

var allowWin;
var savedPower;
var waveIndex;
var vtolsDetected;
var lastTransportAlert;
var colTruckJob1;
var colTruckJob2;
var colTruckJob3;
var colTruckJob4;
const mis_collectiveResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Mortar-Damage01", 
	"R-Wpn-Flamer-Damage02", "R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01",
	"R-Wpn-Rocket-ROF01", "R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-ROF01", "R-Vehicle-Metals02", "R-Struc-Materials02", 
	"R-Defense-WallUpgrade01", "R-Sys-Engineering01", "R-Vehicle-Engine01",
];
const MIS_GROUND_WAVE_DELAY = camSecondsToMilliseconds(60);
const MIS_MAX_COLLECTIVE_UNITS = 250;
const mis_vtolRemovePos = {x: 16, y: 2};

//Remove enemy vtols when in the remove zone area.
function checkEnemyVtolArea()
{
	const vtols = enumRange(mis_vtolRemovePos.x, mis_vtolRemovePos.y, 2, CAM_THE_COLLECTIVE, false).filter((obj) => (isVTOL(obj)));

	for (let i = 0, l = vtols.length; i < l; ++i)
	{
		if ((vtols[i].weapons[0].armed < 20) || (vtols[i].health < 60))
		{
			camSafeRemoveObject(vtols[i], false);
		}
	}
}

// Helicoptors and VTOLs and Tanks oh my!
function heliAttack()
{
	const list = [cTempl.helcan, cTempl.helhmg, cTempl.helpod];
	const ext = {
		limit: [1, 1, 1],
		alternate: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, undefined, mis_vtolRemovePos, list, camChangeOnDiff(camSecondsToMilliseconds(25)), undefined, ext);
}

// Hit-and-run VTOLs
function vtolAttack()
{
	if (!vtolsDetected)
	{
		playSound(cam_sounds.enemyVtolsDetected);
		vtolsDetected = true;
	}

	let vtolPositions = [
		"vtolAttackPos1",
		"vtolAttackPos2",
		"vtolAttackPos3",
		"vtolAttackPos4",
		"vtolAttackPos5",
	];
	
	if (difficulty === INSANE)
	{
		vtolPositions = undefined; // Randomize the spawns each time
	}

	const list = [cTempl.colatv, cTempl.colhmgv];
	if (difficulty >= HARD) list.push(cTempl.colbombv); // Cluster Bombs
	const ext = {
		minVTOLs: (difficulty >= HARD) ? 3 : 2,
		maxRandomVTOLs: (difficulty >= MEDIUM) ? ((difficulty >= HARD) ? 2 : 1) : 0
	};

	camSetVtolData(CAM_THE_COLLECTIVE, vtolPositions, mis_vtolRemovePos, list, camChangeOnDiff(camSecondsToMilliseconds(60)), undefined, ext);
}

// Count all of the Collective non-truck ground units on the map
function countCollectiveAttackDroids()
{
	return enumDroid(CAM_THE_COLLECTIVE).filter((droid) => (
		!isVTOL(droid) && droid.droidType !== DROID_CONSTRUCT
	)).length;
}

// Bring in Collective and C-Scav units.
function collectiveAttackWaves()
{
	waveIndex++;

	// Don't spawn another wave if there's already too many units on the map
	if (countCollectiveAttackDroids() < MIS_MAX_COLLECTIVE_UNITS)
	{
		// Each entrance shares a C-Scav and a Collective pool.
		// Each attack wave can draw from either pool.
		const cScavDroidPool = [ // NOTE: Templates that appear multiple times are more common
			cTempl.bloke, cTempl.kevbloke, cTempl.kevbloke,
			cTempl.lance, cTempl.kevlance,
			cTempl.trike, cTempl.trike,
			cTempl.buggy, cTempl.buggy, cTempl.buggy,
			cTempl.rbuggy, cTempl.rbuggy,
			cTempl.bjeep, cTempl.bjeep,
			cTempl.rbjeep, cTempl.rbjeep,
			cTempl.gbjeep, cTempl.gbjeep, cTempl.gbjeep,
			cTempl.buscan, cTempl.buscan,
			cTempl.firetruck, cTempl.firetruck,
			cTempl.minitruck, cTempl.minitruck,
			cTempl.sartruck, cTempl.sartruck,
			cTempl.moncan,
			cTempl.monhmg,
			cTempl.flatmrl,
		];
		const colDroidPool = [
			cTempl.colpodt, cTempl.colpodt, // MRP
			cTempl.colmrat, cTempl.colmrat, // MRA
			cTempl.colhmght, cTempl.colhmght, // HMG
			cTempl.colcanht, cTempl.colcanht, cTempl.colcanht, // Light Cannon
			cTempl.colaaht, // Hurricane
			cTempl.commcant, // Medium Cannon
			cTempl.comatt, // Lancer
		];

		// There are 10 entrances on the map, with each getting progressively closer to the player's LZ.
		// This block handles activating new entrances
		const waveEntrances = [];
		if (waveIndex >= 1)
		{
			waveEntrances.push("colEntrance1");
		}
		if (waveIndex >= 4)
		{
			waveEntrances.push("colEntrance2");
		}
		if (waveIndex >= 7)
		{
			waveEntrances.push("colEntrance3");
		}
		if (waveIndex >= 11)
		{
			waveEntrances.push("colEntrance4");
		}
		if (waveIndex >= 15)
		{
			waveEntrances.push("colEntrance5");
		}
		if (waveIndex >= 19)
		{
			waveEntrances.push("colEntrance6");
		}
		if (waveIndex >= 24)
		{
			waveEntrances.push("colEntrance7");
		}
		if (waveIndex >= 29)
		{
			waveEntrances.push("colEntrance8");
		}
		if (waveIndex >= 34)
		{
			waveEntrances.push("colEntrance9");
		}

		// Determine the number of separate groups to spawn at once
		let numGroups = 2;
		if (difficulty >= MEDIUM) numGroups++; // 3 on Normal
		if (difficulty >= HARD) numGroups++; // 4 on Hard
		if (difficulty >= INSANE) numGroups++; // 5 on Insane

		// Choose from among the active entrances and spawn units
		const chosenEntrances = [];
		for (let i = 0; i < Math.min(waveEntrances.length, numGroups); i++)
		{
			const INDEX = camRand(waveEntrances.length);

			chosenEntrances.push(waveEntrances[INDEX]);
			waveEntrances.splice(INDEX, 1);
		}

		// Spawn units at the chosen entrance(s)
		const NUM_DROIDS = difficulty + 6;
		for (let i = 0; i < chosenEntrances.length; i++)
		{
			const droids = [];
			for (let j = 0; j < NUM_DROIDS; j++)
			{
				// Choose either Collective or C-Scav templates
				const templatePool = (camRand(40) < waveIndex) ? colDroidPool : cScavDroidPool;
				droids.push(camRandFrom(templatePool));
			}

			camSendReinforcement(CAM_THE_COLLECTIVE, getObject(chosenEntrances[i]), droids, CAM_REINFORCE_GROUND);
		}

		// Lastly, start spawning more waves of enemies over time.
		// This will cause the Collective to become overwhelming after a while.
		if (waveIndex % 16 === 0)
		{
			// Increase the number of VTOLs every 16 waves
			vtolAttack();
		}
		if (waveIndex % 12 === 0)
		{
			// Increase the number of Helicopters every 12 waves
			heliAttack();
		}
		if (waveIndex % 20 === 0)
		{
			// Increase the number of ground attacks every 20 waves
			setTimer("collectiveAttackWaves", camChangeOnDiff(MIS_GROUND_WAVE_DELAY));
			// NOTE: Since the above increases are based on the number of ground waves, not only will the
			// number of enemies increase over time, but the RATE that they increase will get faster too!
		}
	}

	sendCollectiveTrucks();
}

// Send trucks to attempt building Collective LZs
function sendCollectiveTrucks()
{
	if (!camDef(camGetTrucksFromLabel("colNorthLZ")[0]) && waveIndex >= 8 && (waveIndex % 4 == 0))
	{
		const tPos = camMakePos("colEntrance4");
		const tTemp = (waveIndex >= 16 || difficulty === INSANE) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob1);
	}
	if (!camDef(camGetTrucksFromLabel("colEastLZ")[0]) && waveIndex >= 16 && (waveIndex % 8 == 0))
	{
		const tPos = camMakePos("colEntrance3");
		const tTemp = (waveIndex >= 24 || difficulty >= HARD) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob2);
	}
	if (!camDef(camGetTrucksFromLabel("colSouthLZ")[0]) && waveIndex >= 24 && (waveIndex % 6 == 0))
	{
		const tPos = camMakePos("colEntrance6");
		const tTemp = (waveIndex >= 32 || difficulty >= MEDIUM) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob3);
	}
	if (!camDef(camGetTrucksFromLabel("colSWLZ")[0]) && waveIndex >= 32 && (waveIndex % 8 == 0))
	{
		const tPos = camMakePos("colEntrance9");
		const tTemp = (waveIndex >= 40 || difficulty >= EASY) ? cTempl.comtruckt : cTempl.coltruckht;
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob4);
	}
}

// Land extra Collective tanks at a random built LZ
function sendCollectiveTransporter()
{
	// Set reinforcement droids
	const droidPool = [
		cTempl.colpodt, cTempl.colpodt,
		cTempl.colcanht, cTempl.colcanht,
		cTempl.colhmght, cTempl.colhmght,
		cTempl.colflamt, cTempl.colflamt,
		cTempl.colmrat, cTempl.colmrat,
		cTempl.colmcant,
		cTempl.commcant,
		cTempl.comatt,
	];

	const droids = [];
	for (let i = 0; i < 10; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	// Get all available LZs
	const lzPool = [];
	if (!camBaseIsEliminated("colNorthLZ")) lzPool.push(camMakePos("colLZ1"));
	if (!camBaseIsEliminated("colEastLZ")) lzPool.push(camMakePos("colLZ2"));
	if (!camBaseIsEliminated("colSouthLZ")) lzPool.push(camMakePos("colLZ3"));
	if (!camBaseIsEliminated("colSWLZ")) lzPool.push(camMakePos("colLZ4"));

	// If we have a valid LZ, send the transport
	if (lzPool.length > 0)
	{
		camSendReinforcement(CAM_THE_COLLECTIVE, camRandFrom(lzPool), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: camGenerateRandomMapEdgeCoordinate(),
				exit: camGenerateRandomMapEdgeCoordinate(),
			}
		);
	}
}

// Allow a win if a transporter was launched.
// NOTE: The player doesn't have to transport a construction droid, since trucks will be given
// to the player at the start of Act II.
function eventTransporterLaunch(transporter)
{
	if (transporter.player === CAM_HUMAN_PLAYER)
	{
		allowWin = true;
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

// Called when the player "dies"
function checkIfLaunched()
{
	if (allowWin)
	{
		return true;
	}
}

// End the "warm-up" phase
function eventMissionTimeout()
{
	// Grant infinite time for the rest of the mission
	setMissionTime(-1);

	camSetStandardWinLossConditions(CAM_VICTORY_EVACUATION, "A2L1", {
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
	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
	setTimer("collectiveAttackWaves", camChangeOnDiff(MIS_GROUND_WAVE_DELAY));
	setTimer("checkEnemyVtolArea", camSecondsToMilliseconds(1));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(2)));
}

// This entire mission is basically just sending attack waves over and over until the player loses/evacuates all of their stuff.
// It's basically impossible for the player to truly "lose" this level. Instead, the player has to focus on saving as many of their units/resources as possible
function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "A2L1"); // Temporary until the warm-up phase is over
	camSetExtraObjectiveMessage(_("Evacuate as many units as possible"));

	// 1 minute "warm up" phase where nothing happens
	setMissionTime(camMinutesToSeconds(1));

	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);

	// Collective LZs
	camSetEnemyBases({
		"colNorthLZ": {
			cleanup: "colLZBaseArea1",
			detectMsg: "COL_LZBASE1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colEastLZ": {
			cleanup: "colLZBaseArea2",
			detectMsg: "COL_LZBASE2",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colSouthLZ": {
			cleanup: "colLZBaseArea3",
			detectMsg: "COL_LZBASE3",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colSWLZ": {
			cleanup: "colLZBaseArea4",
			detectMsg: "COL_LZBASE4",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
	});

	// Collective trucks
	colTruckJob1 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colNorthLZ",
			rebuildBase: true,
			structset: camA1L6ColLZ1Structs
	});
	colTruckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colEastLZ",
			rebuildBase: true,
			structset: camA1L6ColLZ2Structs
	});
	colTruckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthLZ",
			rebuildBase: true,
			structset: camA1L6ColLZ3Structs
	});
	colTruckJob4 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSWLZ",
			rebuildBase: true,
			structset: camA1L6ColLZ4Structs
	});

	allowWin = false;
	savedPower = 0;
	waveIndex = 0;
	vtolsDetected = false;
	lastTransportAlert = 0;

	// Place the satellite uplink from A1L3
	const NASDA = 1;
	setAlliance(CAM_HUMAN_PLAYER, NASDA, true);
	setAlliance(CAM_THE_COLLECTIVE, NASDA, true);
	addStructure("UplinkCentre", NASDA, 108 * 128, 50 * 128);

	// Give player briefing.
	camPlayVideos({video: "A1L6_BRIEF", type: MISS_MSG});

	// Briefly explain the transport mechanics
	camQueueDialogue([
		{text: "LIEUTENANT: You'll have to evacuate using your transport.", delay: 5, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Hold out for as long as possible and evacuate as many units as you can.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: The transport will take some time to return,", delay: 3, sound: CAM_RCLICK},
		{text: "so make sure you're ready when by the time it comes back!", delay: 0},
		{text: "LIEUTENANT: And remember that anything not evacuated will be LOST!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Good luck, Commander Bravo.", delay: 4, sound: CAM_RCLICK},
	]);

	// Used to confirm the player didn't start Act 2 from the menu
	camCompleteRequiredResearch(["R-Script-A1Played"], CAM_HUMAN_PLAYER);

	// Add a slight blue hue to the lighting
	camSetSunIntensity(.45, .45, .55);
	camSetWeather(CAM_WEATHER_RAINSTORM);
}