include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

var allowWin;
var waveIndex;
var vtolsDetected;
var lastTransportAlert;
var specialIndex;
var colTruckJob1;
var colTruckJob2;
var colTruckJob3;
var colTruckJob4;
var colHoverGroup;
var colHoverTemplates;
var hoverIndex;
const mis_collectiveResearch = [
	"R-Wpn-MG-Damage04", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage04", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage04", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Sys-Engineering02", "R-Cyborg-Metals03",
	"R-Wpn-Cannon-Accuracy01", "R-Wpn-Rocket-Accuracy02", "R-Wpn-AAGun-ROF01",
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine03", "R-Wpn-AAGun-Accuracy01",
	"R-Struc-RprFac-Upgrade01", "R-Wpn-Mortar-Acc01",
];
const mis_infestedResearch = [
	"R-Wpn-MG-Damage03", "R-Wpn-Rocket-Damage03", "R-Wpn-Mortar-Damage03", 
	"R-Wpn-Flamer-Damage03", "R-Wpn-Cannon-Damage03", "R-Wpn-MG-ROF02",
	"R-Wpn-Rocket-ROF02", "R-Wpn-Mortar-ROF02", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF02", "R-Vehicle-Metals03", "R-Struc-Materials03", 
	"R-Defense-WallUpgrade03", "R-Cyborg-Metals03", "R-Wpn-AAGun-ROF01", 
	"R-Wpn-AAGun-Damage01", "R-Vehicle-Engine03",
];
const MIS_GROUND_WAVE_DELAY = camChangeOnDiff(camSecondsToMilliseconds(60));
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
	];
	
	if (difficulty === INSANE)
	{
		vtolPositions = undefined; // Randomize the spawns each time
	}

	const list = [cTempl.colatv, cTempl.colhmgv];
	if (difficulty < HARD)
	{
		list.push(cTempl.colbombv); // Cluster Bombs (Leopard)
	}
	else
	{
		list.push(cTempl.combombv); // Cluster Bombs (Panther)
	}
	const ext = {
		minVTOLs: (difficulty >= HARD) ? 3 : 2,
		maxRandomVTOLs: (difficulty >= MEDIUM) ? ((difficulty >= HARD) ? 2 : 1) : 0
	};

	camSetVtolData(CAM_THE_COLLECTIVE, vtolPositions, mis_vtolRemovePos, list, camChangeOnDiff(camSecondsToMilliseconds(60)), undefined, ext);
}

// Count all of the Collective non-hover, non-truck ground units on the map
function countCollectiveAttackDroids()
{
	return enumDroid(CAM_THE_COLLECTIVE).filter((droid) => (
		!isVTOL(droid) && droid.droidType !== DROID_CONSTRUCT && droid.propulsion !== "hover01"
	)).length;
}

// Bring in standard Collective ground units.
function collectiveAttackWaves()
{
	waveIndex++;

	// Don't spawn another wave if there's already too many units on the map
	if (countCollectiveAttackDroids() < MIS_MAX_COLLECTIVE_UNITS)
	{
		let colDroidPool = [
			cTempl.colpodt, // MRP
			cTempl.colmrat, cTempl.colmrat, // MRA
			cTempl.colhmght, cTempl.colhmght, // HMG
			cTempl.colaaht, // Hurricane
			cTempl.commcant, cTempl.commcant, // Medium Cannon
			cTempl.comatt, // Lancer
			cTempl.cybhg, cTempl.cybhg, // Heavy Machinegunner Cyborg
			cTempl.cybca, cTempl.cybca, // Heavy Gunner Cyborg
			cTempl.cybgr, // Grenadier Cyborg
			cTempl.cybmr, // Mini-Rocket Cyborg
			cTempl.cybla, // Lancer Cyborg
			cTempl.cybfl, // Flamer Cyborg
		];
		if (difficulty >= HARD || waveIndex >= 10)
		{
			// Swap Leopards for Panthers
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.colmrat, cTempl.commrat);
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.colhmght, cTempl.comhmgt);
			// Swap Heavy Gunners for Super Heavy Gunners
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.cybca, cTempl.scymc);
			// Swap Hurricanes for Cyclones
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.colaaht, cTempl.comhaat);
		}
		if (difficulty === INSANE || (difficulty === HARD && waveIndex >= 10) || waveIndex >= 35)
		{
			// Add Heavy Cannons and HRAs
			colDroidPool.push(cTempl.cohhcant);
			colDroidPool.push(cTempl.cohhrat);
			// Swap Flamers for Thermite Flamers
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.cybfl, cTempl.cybth);
			// Swap Grenadiers for Super Grenadiers
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.cybgr, cTempl.scygr);
			// Swap Mini-Rockets for Heavy Rockets
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.cybmr, cTempl.scyhr);
		}
		if ((difficulty === INSANE && waveIndex >= 10) || (difficulty === HARD && waveIndex >= 35) || waveIndex >= 60)
		{
			// Swap Medium Cannons for HVCs
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.commcant, cTempl.comhpvt);
			// Swap Lancers for Tank Killers
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.cybla, cTempl.scytk);
			colDroidPool = camArrayReplaceWith(colDroidPool, cTempl.comatt, cTempl.comhatt);
		}

		// There are 8 general-purpose ground entrances on the map, each getting progressively closer to the player's LZ.
		// This block handles activating new entrances
		const waveEntrances = [];
		if (waveIndex >= 1)
		{
			// North east
			waveEntrances.push("groundEntry4");
		}
		if (waveIndex >= 4)
		{
			// North west
			waveEntrances.push("groundEntry7");
		}
		if (waveIndex >= 7)
		{
			// North
			waveEntrances.push("groundEntry5");
		}
		if (waveIndex >= 15)
		{
			// West
			waveEntrances.push("groundEntry8");
		}
		if (waveIndex >= 24)
		{
			// South west
			waveEntrances.push("groundEntry10");
		}
		if (waveIndex >= 38)
		{
			// East
			waveEntrances.push("groundEntry2");
		}
		if (waveIndex >= 50)
		{
			// South east
			waveEntrances.push("groundEntry1");
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
				// Choose Collective templates
				droids.push(camRandFrom(colDroidPool));
			}

			camSendReinforcement(CAM_THE_COLLECTIVE, getObject(chosenEntrances[i]), droids, CAM_REINFORCE_GROUND);
		}

		// Next, spawn a "special" ground wave along with the normal wave every 6 "normal" waves
		if (waveIndex % 6 === 0 && waveIndex !== 0)
		{
			const specialEntrances = ["groundEntry6"];
			if (waveIndex >= 18)
			{
				// North east
				waveEntrances.push("groundEntry3");
			}
			if (waveIndex >= 30)
			{
				// West
				waveEntrances.push("groundEntry9");
			}
			// Choose one location
			const specialEntrance = camRandFrom(specialEntrances);
			const specialName = "special" + specialIndex++;

			if (specialIndex % 3 === 0) // Spawn a commander every 3 special waves
			{
				// Spawn and rank the commander
				const commanderPos = camMakePos(specialEntrance);
				const commanderTemp = (difficulty === INSANE || waveIndex >= 40) ? cTempl.cohcomt : cTempl.comcomt;
				const commDroid = camAddDroid(CAM_THE_COLLECTIVE, commanderPos, commanderTemp);
				addLabel(commDroid, specialName);
				// Set the commander's rank (ranges from Trained to Professional)
				const COMMANDER_RANK = (difficulty <= EASY) ? 2 : (difficulty);
				camSetDroidRank(commDroid, COMMANDER_RANK);

				// Order the commander to attack
				camManageGroup(camMakeGroup(commDroid), CAM_ORDER_ATTACK, {targetPlayer: CAM_HUMAN_PLAYER});

				// Spawn the commander's squad
				// Choose from of these lists...
				let commanderDroids = [
					[
						cTempl.commrat, cTempl.commrat, // 2 MRAs
						cTempl.comhmgt, cTempl.comhmgt, // 2 HMGs
						cTempl.commcant, cTempl.commcant, cTempl.commcant, cTempl.commcant, // 4 Medium Cannons
						cTempl.comhaat, // 1 Cyclone
						cTempl.comrept, // 1 Repair Turret
					],
					[
						cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
						cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
						cTempl.commrat, cTempl.commrat, // 2 MRAs
						cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
					],
					[
						cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 4 HMGs
						cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
						cTempl.comhaat, // 1 Cyclone
						cTempl.comrept, // 1 Repair Turret
					],
				];

				// Add more units to the commander's squad on higher difficulties
				if (difficulty >= HARD)
				{
					commanderDroids[0].push(cTempl.comhmgt, cTempl.comhmgt); // 2 HMGs
					commanderDroids[1].push(cTempl.commrat, cTempl.commrat); // 2 MRAs
					commanderDroids[2].push(cTempl.cominft, cTempl.cominft); // 2 Infernos
				}
				if (difficulty == INSANE)
				{
					commanderDroids[0].push(cTempl.commrat, cTempl.commrat); // 2 MRAs
					commanderDroids[1].push(cTempl.comatt, cTempl.comatt); // 2 Lancers
					commanderDroids[2].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
				}

				// Choose one of the above droid lists
				commanderDroids = camRandFrom(commanderDroids);

				// Improve the commander's templates over time...
				if (difficulty >= HARD || waveIndex >= 10)
				{
					// Swap Medium Cannons for HVCs
					commanderDroids = camArrayReplaceWith(commanderDroids, cTempl.commcant, cTempl.comhpvt);
				}
				if (difficulty >= HARD || waveIndex >= 35)
				{
					// Swap MRAs for HRAs
					commanderDroids = camArrayReplaceWith(commanderDroids, cTempl.commrat, cTempl.cohhrat);
					// Swap Lancers for Tank Killers
					commanderDroids = camArrayReplaceWith(commanderDroids, cTempl.comatt, cTempl.comhatt);
				}
				if ((difficulty === INSANE && waveIndex >= 10) || (difficulty === HARD && waveIndex >= 35) || waveIndex >= 60)
				{
					// Swap HMGs for Assault Guns
					commanderDroids = camArrayReplaceWith(commanderDroids, cTempl.comhmgt, cTempl.comagt);
				}

				camSendReinforcement(CAM_THE_COLLECTIVE, getObject(specialEntrance), commanderDroids, CAM_REINFORCE_GROUND, {
					order: CAM_ORDER_FOLLOW, data: {leader: specialName, suborder: CAM_ORDER_ATTACK}
				});
			}
			else // Otherwise, spawn a sensor + artillery
			{
				let sensorArtillery = [
					cTempl.comsenst,
					cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, cTempl.comhmortht, // 6 Bombards
				];
				if (difficulty >= HARD || waveIndex >= 18) sensorArtillery = sensorArtillery.concat([cTempl.cohript, cTempl.cohript]); // Add 2 Ripple Rockets

				camSendReinforcement(CAM_THE_COLLECTIVE, getObject(specialEntrance), sensorArtillery, CAM_REINFORCE_GROUND);
			}
		}

		// Lastly, start spawning more waves of enemies over time.
		// This will cause the Collective to become overwhelming after a while.
		if (waveIndex % 12 === 0)
		{
			// Increase the number of VTOLs every 16 waves
			vtolAttack();
		}
		if (waveIndex % 20 === 0)
		{
			// Increase the number of ground attacks every 20 waves
			setTimer("collectiveAttackWaves", MIS_GROUND_WAVE_DELAY);
			// NOTE: Since the above increases are based on the number of ground waves, not only will the
			// number of enemies increase over time, but the RATE that they increase will get faster too!
		}
	}

	sendCollectiveTrucks();
}

// Send trucks to attempt building Collective LZs
function sendCollectiveTrucks()
{
	const tTemp = cTempl.comtruckht;
	if (!camDef(camGetTrucksFromLabel("colNorthLZ")[0]) && waveIndex >= 8 && (waveIndex % 4 == 0))
	{
		const tPos = camMakePos("groundEntry5");
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob1);
	}
	if (!camDef(camGetTrucksFromLabel("colWestLZ")[0]) && waveIndex >= 16 && (waveIndex % 4 == 0))
	{
		const tPos = camMakePos("groundEntry8");
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob2);
	}
	if (!camDef(camGetTrucksFromLabel("colSouthLZ")[0]) && waveIndex >= 24 && (waveIndex % 6 == 0))
	{
		const tPos = camMakePos("groundEntry6");
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob3);
	}
	if (!camDef(camGetTrucksFromLabel("colCentralLZ")[0]) && waveIndex >= 40 && (waveIndex % 8 == 0))
	{
		const tPos = camMakePos("groundEntry9");
		const newTruck = camAddDroid(CAM_THE_COLLECTIVE, tPos, tTemp);
		camAssignTruck(newTruck, colTruckJob4);
	}
}

// Refill the Collective hover group
function collectiveHoverReinforcements()
{
	hoverIndex++;

	// Improve the hover templates over time
	if (hoverIndex === 10)
	{
		// Swap MRAs with HRAs
		colHoverTemplates = camArrayReplaceWith(colHoverTemplates, cTempl.commrah, cTempl.cohhrah);
		camSetRefillableGroupData(colHoverGroup, {templates: colHoverTemplates});
	}
	if (hoverIndex === 15)
	{
		// Swap Lancers with Tank Killers
		colHoverTemplates = camArrayReplaceWith(colHoverTemplates, cTempl.comath, cTempl.comhath);
		camSetRefillableGroupData(colHoverGroup, {templates: colHoverTemplates});
	}
	if (hoverIndex === 20)
	{
		// Swap Panther BBs with Tiger BBs
		colHoverTemplates = camArrayReplaceWith(colHoverTemplates, cTempl.combbh, cTempl.cohbbh);
		camSetRefillableGroupData(colHoverGroup, {templates: colHoverTemplates});
	}

	// Get any missing droids from the hover group
	const missingDroids = camGetRefillableGroupTemplates(colHoverGroup);
	if (missingDroids.length > 0)
	{
		// Choose an entrance
		const hoverEntrance = camRandFrom(["hoverEntry1", "hoverEntry2"]);

		// Replenish up to a certain amount of droids at once
		const NUM_DROIDS = difficulty + 4;
		const reinforcements = camSendReinforcement(CAM_THE_COLLECTIVE, getObject(hoverEntrance), missingDroids.slice(0, NUM_DROIDS), CAM_REINFORCE_GROUND);
		camAssignToRefillableGroups(enumGroup(reinforcements), colHoverGroup);
	}
}

// Land extra Collective tanks at a random built LZ
function sendCollectiveTransporter()
{
	// Set reinforcement droids
	const droidPool = [
		cTempl.comatht, cTempl.comatht,
		cTempl.comhpvht, cTempl.comhpvht,
		cTempl.comhmght, cTempl.comhmght,
		cTempl.comhaaht,
	];

	const droids = [];
	for (let i = 0; i < 8; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	// Get all available LZs
	const lzPool = [];
	if (!camBaseIsEliminated("colNorthLZ")) lzPool.push(camMakePos("colLZ1"));
	if (!camBaseIsEliminated("colWestLZ")) lzPool.push(camMakePos("colLZ2"));
	if (!camBaseIsEliminated("colSouthLZ")) lzPool.push(camMakePos("colLZ3"));
	if (!camBaseIsEliminated("colCentralLZ")) lzPool.push(camMakePos("colLZ4"));

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

function startInfestedAttacks()
{
	// Give the fog a slight pink color
	camGradualFog(camSecondsToMilliseconds(8), 20, 12, 80);
	// Add a slight purple-blue tint
	camGradualSunIntensity(camSecondsToMilliseconds(8), .48, .42, .5);

	// Dialogue about the incoming Infested
	camQueueDialogue([
		{text: "CHARLIE: Bravo, we're detecting Infested units approaching your area!", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Good.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Hopefully, they'll help slow down the Collective.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: Yeah... Hopefully.", delay: 6, sound: CAM_RCLICK},
		{text: "CHARLIE: Either way, Bravo.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Watch your flanks!", delay: 2, sound: CAM_RCLICK},
	]);

	setTimer("sendInfestedReinforcements", camChangeOnDiff(camMinutesToMilliseconds(1)));
}

function sendInfestedReinforcements()
{
	const entrances = [
		"groundEntry1", "groundEntry2", "groundEntry3", "groundEntry4",
		"groundEntry5", "groundEntry6", "groundEntry7", "groundEntry8",
		"groundEntry9", "groundEntry10",
	];
	const coreDroids = [ // Just scavs and crawlers
		cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
		cTempl.boomtick, // Boom Ticks
		cTempl.infmoncan, // Bus Tanks
		cTempl.infminitruck, // MRP Trucks
		cTempl.infsartruck, // Sarissa Trucks
		cTempl.infbuscan, // School Buses
		cTempl.infbjeep, cTempl.infbjeep, // Jeeps
		cTempl.infrbjeep, // Rocket Jeeps
		cTempl.infbuggy, cTempl.infbuggy, cTempl.infbuggy, // Buggies
		cTempl.infrbuggy, cTempl.infrbuggy, cTempl.infrbuggy, // Rocket Buggies
		cTempl.inftrike, cTempl.inftrike, // Trikes
		cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
		cTempl.infkevbloke,
		cTempl.inflance, cTempl.inflance, // Lances
		cTempl.infkevlance,
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;
	const NUM_DROIDS = 4;
	// Spawn Infested groups from random entrances
	for (let i = 0; i < NUM_DROIDS; i++)
	{
		camSendReinforcement(CAM_INFESTED, getObject(camRandFrom(entrances)), camRandInfTemplates(coreDroids, CORE_SIZE, FODDER_SIZE), CAM_REINFORCE_GROUND);
	}
}

// Allow a win if a transporter was launched.
// NOTE: The player doesn't have to transport a construction droid, since trucks will be given
// to the player at the start of Act 3.
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

	camSetStandardWinLossConditions(CAM_VICTORY_EVACUATION, "A3L1", {
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
	queue("vtolAttack", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("startInfestedAttacks", camChangeOnDiff(camMinutesToMilliseconds(12)));
	setTimer("collectiveAttackWaves", MIS_GROUND_WAVE_DELAY);
	setTimer("collectiveHoverReinforcements", MIS_GROUND_WAVE_DELAY * 1.5);
	setTimer("checkEnemyVtolArea", camSecondsToMilliseconds(1));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(2)));
}

// This entire mission is basically just sending attack waves over and over until the player loses/evacuates all of their stuff.
// It's basically impossible for the player to truly "lose" this level. Instead, the player has to focus on saving as many of their units as possible
function eventStartLevel()
{
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "A3L1"); // Temporary until the warm-up phase is over
	camSetExtraObjectiveMessage(_("Evacuate as many units as possible"));

	// 1 minute "warm up" phase where nothing happens
	setMissionTime(camMinutesToSeconds(1));

	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	camCompleteRequiredResearch(mis_collectiveResearch, CAM_THE_COLLECTIVE);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	// Collective LZs
	camSetEnemyBases({
		"colNorthLZ": {
			cleanup: "colLZBaseArea1",
			detectMsg: "COL_LZBASE1",
			detectSnd: cam_sounds.baseDetection.enemyLZDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyLZEradicated,
			player: CAM_THE_COLLECTIVE
		},
		"colWestLZ": {
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
		"colCentralLZ": {
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
			structset: camA2L7ColLZ1Structs
	});
	colTruckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colWestLZ",
			rebuildBase: true,
			structset: camA2L7ColLZ2Structs
	});
	colTruckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colSouthLZ",
			rebuildBase: true,
			structset: camA2L7ColLZ3Structs
	});
	colTruckJob4 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralLZ",
			rebuildBase: true,
			structset: camA2L7ColLZ4Structs
	});

	colHoverTemplates = [ // Changes over time
		cTempl.comath, cTempl.comath, // 2 Lancers
		cTempl.comhpvh, cTempl.comhpvh, // 2 HVCs
		cTempl.commrah, cTempl.commrah, // 2 MRAs
		cTempl.combbh, cTempl.combbh, // 2 BBs
		cTempl.comath, cTempl.comath, // 2 Lancers
		cTempl.comhpvh, cTempl.comhpvh, // 2 HVCs
		cTempl.commrah, cTempl.commrah, // 2 MRAs
	];
	colHoverGroup = camMakeRefillableGroup(
		undefined, {
			templates: colHoverTemplates
	}, CAM_ORDER_PATROL, {
		// Move around the map and harass the player
		pos: [ 
			"hoverPatrolPos1", "hoverPatrolPos2", "hoverPatrolPos3", "hoverPatrolPos4",
			"hoverPatrolPos5", "hoverPatrolPos6", "hoverPatrolPos7", "hoverPatrolPos8",
			"hoverPatrolPos9",
		],
		interval: camSecondsToMilliseconds(30),
		radius: 10
	});

	allowWin = false;
	waveIndex = 0;
	specialIndex = 0;
	hoverIndex = 0;
	vtolsDetected = false;
	lastTransportAlert = 0;

	// Give player briefing.
	camPlayVideos({video: "A2L7_BRIEF", type: MISS_MSG});

	// Used to confirm the player didn't start Act 3 from the menu
	camCompleteRequiredResearch(["R-Script-A2Played"], CAM_HUMAN_PLAYER);

	// Add a slight dark blue hue
	camSetSunIntensity(.45, .45, .5);
	camSetWeather(CAM_WEATHER_RAINSTORM);
}