
// -------------------------------------
// --- Stage 3 progression functions ---
// -------------------------------------

const MIS_GROUND_ASSAULT_DELAY = camSecondsToMilliseconds(20);
const MIS_AIR_ASSAULT_DELAY = camSecondsToMilliseconds(15);

// NOTE: This function is called multiple times to increase the number of VTOL attacks over time
function stageThreeVtolAttack()
{
	// Assault Guns, Tank Killers, and Assault Cannons
	const templates = [cTempl.colagv, cTempl.comhatv, cTempl.comacanv];
	const ext = {
		limit: [5, 3, 4],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		dynamic: true
	};
	const positions = ["vtolAttackPos2", "vtolAttackPos3", "vtolAttackPos4", "vtolAttackPos5"];
	camSetVtolData(CAM_THE_COLLECTIVE, positions, "vtolRemoveZone2", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC", ext);
}

// Set a 20 minute timer, and make the Collective VERY aggressive
// The player wins when the timer runs out
function setStageThree()
{
	stage = 3;

	// Remove Delta's beacon
	hackRemoveMessage("DELTA_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);

	// Set the mission timer to 20 minutes
	let finalMissionTime = camMinutesToSeconds(20);
	if (difficulty >= HARD) finalMissionTime += camMinutesToSeconds(2); // 22 min on HARD
	if (difficulty === INSANE) finalMissionTime += camMinutesToSeconds(2); // 24 min on INSANE
	setMissionTime(finalMissionTime);
	camSetExtraObjectiveMessage(_("Survive at all costs"));

	// More VTOL attacks
	// NOTE: The stage 2 VTOL attacks linked to the Collective CC stay active during this stage
	queue("stageThreeVtolAttack", camMinutesToMilliseconds(2)); // at 18 minutes remaining
	queue("stageThreeVtolAttack", camMinutesToMilliseconds(8)); // at 12 minutes remaining
	queue("stageThreeVtolAttack", camMinutesToMilliseconds(16)); // at 4 minutes remaining

	// Queue large telegraphed ground and air attacks
	queue("groundAssault1", camMinutesToMilliseconds(2)); // at 18 minutes remaining
	queue("airAssault1", camMinutesToMilliseconds(3)); // at 17 minutes remaining
	queue("groundAssault2", camMinutesToMilliseconds(4.5)); // at 15.5 minutes remaining
	queue("airAssault2", camMinutesToMilliseconds(5)); // at 15 minutes remaining
	queue("groundAssault3", camMinutesToMilliseconds(6.5)); // at 13.5 minutes remaining
	queue("airAssault3", camMinutesToMilliseconds(7)); // at 13 minutes remaining
	queue("airAssault4", camMinutesToMilliseconds(8)); // at 12 minutes remaining
	// A bit of a reprieve here...
	queue("groundAssault4", camMinutesToMilliseconds(11)); // at 9 minutes remaining
	queue("airAssault5", camMinutesToMilliseconds(12)); // at 8 minutes remaining
	queue("groundAssault5", camMinutesToMilliseconds(13.5)); // at 6.5 minutes remaining
	queue("airAssault6", camMinutesToMilliseconds(14)); // at 6 minutes remaining
	// Attacks get crazy around here...
	queue("groundAssault6", camMinutesToMilliseconds(16)); // at 4 minutes remaining
	queue("airAssault7", camMinutesToMilliseconds(17)); // at 3 minutes remaining
	queue("airAssault8", camMinutesToMilliseconds(17.5)); // at 2.5 minutes remaining
	queue("groundAssault7", camMinutesToMilliseconds(18)); // at 2 minutes remaining
	queue("airAssault9", camMinutesToMilliseconds(18.5)); // at 1.5 minutes remaining
	queue("airAssault10", camMinutesToMilliseconds(19)); // at 1 minutes remaining
	queue("airAssault11", camMinutesToMilliseconds(19.25)); // at 0.75 minutes remaining

	// Queue "lightning" effects
	queue("startLightningEffects", camMinutesToMilliseconds(2));

	// Gradually set the skies to be stormy
	camGradualFog(camMinutesToMilliseconds(2), 107, 107, 107);
	camGradualSunIntensity(camMinutesToMilliseconds(2), .35,.35,.35);
	camSetWeather(CAM_WEATHER_RAINSTORM);

	// Transmission about the incoming Collective onslaught
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "A4L6_COLLECTIVE", type: MISS_MSG}]);
}

function groundAssault1()
{
	// Mark the entry points that are about to be blitzed
	activateGroundBlip(13);
	activateGroundBlip(14);
	activateGroundBlip(15);
	activateGroundBlip(16);

	// Play a sound
	playSound(cam_sounds.enemyUnitDetected);
	
	// Queue the actual units
	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "1");
}

function groundAssault2()
{
	activateGroundBlip(11);
	activateGroundBlip(12);
	activateGroundBlip(15);
	activateGroundBlip(16);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "2");
}

function groundAssault3()
{
	activateGroundBlip(8);
	activateGroundBlip(9);
	activateGroundBlip(14);
	activateGroundBlip(16);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "3");
}

function groundAssault4()
{
	activateGroundBlip(8);
	activateGroundBlip(12);
	activateGroundBlip(14);
	activateGroundBlip(15);
	activateGroundBlip(16);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "4");
}

function groundAssault5()
{
	activateGroundBlip(7);
	activateGroundBlip(8);
	activateGroundBlip(9);
	activateGroundBlip(11);
	activateGroundBlip(12);
	activateGroundBlip(15);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "5");
}

function groundAssault6()
{
	activateGroundBlip(1);
	activateGroundBlip(3);
	activateGroundBlip(4);
	activateGroundBlip(6);
	activateGroundBlip(7);
	activateGroundBlip(8);
	activateGroundBlip(9);
	activateGroundBlip(14);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "6");

	// Live Delta Reaction:
	camQueueDialogue([
		{text: "DELTA: Oh, COME ON!", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: How many of them ARE there?!", delay: 2, sound: CAM_RCLICK},
	]);
}

function groundAssault7()
{
	activateGroundBlip(2);
	activateGroundBlip(4);
	activateGroundBlip(5);
	activateGroundBlip(7);
	activateGroundBlip(8);
	
	playSound(cam_sounds.enemyUnitDetected);

	queue("groundAssaultWave", MIS_GROUND_ASSAULT_DELAY, "7");
}

function activateGroundBlip(index)
{
	const msgName = "COL_ENTRY" + index;

	groundBlips[index] = true;
	hackAddMessage(msgName, PROX_MSG, CAM_HUMAN_PLAYER);
}

function groundAssaultWave(index)
{
	clearGroundBlips();

	switch (index)
	{
		case "1":
			const wave1Templates = [
				[ // Southeast base entry templates
					cTempl.comsensht, // 1 Sensor
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Lancers
					cTempl.cybla, cTempl.cybla, cTempl.cybla, cTempl.cybla, // 4 Lancer Cyborgs
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 6 Bombards
					cTempl.cohhowt, cTempl.cohhowt, cTempl.cohhowt, // 3 Howitzers
				],
				[ // Southeast trench entry templates (+commander)
					cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, // 4 HRA Cyborgs
					cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, // 6 Super Heavy Gunners
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 4 HVCs
					cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
				],
				[ // East entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.commrat, cTempl.commrat, cTempl.commrat, cTempl.commrat, cTempl.commrat, cTempl.commrat, // 6 MRAs
					cTempl.comhmgt, cTempl.comhmgt, // 2 HMGs
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // Northeast entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 4 HRAs
					cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, // 4 Infernos
					cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, cTempl.scymc, // 5 Super Heavy Gunners
					cTempl.comhaat, cTempl.comhaat, // 2 Cyclones
					cTempl.cohraat, // 1 Whirlwind
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave1Templates[1].push(cTempl.scyhr, cTempl.scyhr); // 2 HRA Cyborgs
				wave1Templates[3].push(cTempl.cominft, cTempl.cominft); // 2 Infernos
			}
			if (difficulty >= HARD)
			{
				wave1Templates[1].push(cTempl.scymc, cTempl.scymc); // 2 Super Heavy Gunners
				wave1Templates[3].push(cTempl.cohhrat, cTempl.cohhrat); // 2 HRAs
			}
			if (difficulty == INSANE)
			{
				wave1Templates[1].push(cTempl.comhpvt, cTempl.comhpvt); // 2 HVCs
				wave1Templates[3].push(cTempl.cohraat, cTempl.scymc); // 1 Whirlwind, 1 Super Heavy Gunner
			}

			sendCollectiveGroundWave("groundEntry13", wave1Templates[0]);
			sendCollectiveGroundWave("groundEntry14", wave1Templates[1], cTempl.comcomt);
			sendCollectiveGroundWave("groundEntry15", wave1Templates[2], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry16", wave1Templates[3], cTempl.cohcomt);
			break;
		case "2":
			const wave2Templates = [
				[ // Northeast base entry templates
					cTempl.comsenst, cTempl.comsenst, // 2 Sensors
					cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
					cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, // 4 Super HRA Cyborgs
					cTempl.comatht, cTempl.comatht, cTempl.comatht, cTempl.comatht, // 4 Bombards
					cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
				],
				[ // Southeast base entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.comatt, cTempl.comatt, cTempl.comatt, cTempl.comatt, // 4 Lancers
					cTempl.comrmortt, cTempl.comrmortt, cTempl.comrmortt, cTempl.comrmortt, cTempl.comrmortt, cTempl.comrmortt, // 6 Pepperpots
					cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
				],
				[ // East entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // Northeast entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 4 Assault Guns
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 6 Assault Cannons
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave2Templates[2].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave2Templates[3].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
			}
			if (difficulty >= HARD)
			{
				wave2Templates[2].push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons
				wave2Templates[3].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
			}
			if (difficulty == INSANE)
			{
				wave2Templates[2].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
				wave2Templates[3].push(cTempl.comacant, cTempl.comacant); // 2 Assault Cannons
			}

			sendCollectiveGroundWave("groundEntry11", wave2Templates[0]);
			sendCollectiveGroundWave("groundEntry12", wave2Templates[1]);
			sendCollectiveGroundWave("groundEntry15", wave2Templates[2], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry16", wave2Templates[3], cTempl.cohcomt);
			break;
		case "3":
			const wave3Templates = [
				[ // North road entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.cominft, cTempl.cominft,  cTempl.cominft, cTempl.cominft, // 4 Infernos
					cTempl.comagt, cTempl.comagt, // 2 Assault Guns
					cTempl.cohbbt, cTempl.cohbbt, // 2 Bunker Busters
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // South road entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Southeast base entry templates
					cTempl.comsensht, // 1 Sensor
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 4 Tank Killers
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 4 Pepperpots
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
				],
				[ // Northeast entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 6 Ripple Rockets
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave3Templates[0].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
				wave3Templates[1].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
			}
			if (difficulty >= HARD)
			{
				wave3Templates[0].push(cTempl.cohraat, cTempl.cohraat); // 2 Whirlwinds
				wave3Templates[1].push(cTempl.cohraat, cTempl.cohraat); // 2 Whirlwinds
			}
			if (difficulty == INSANE)
			{
				wave3Templates[0].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
				wave3Templates[1].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
			}

			sendCollectiveGroundWave("groundEntry8", wave3Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry9", wave3Templates[1], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry14", wave3Templates[2]);
			sendCollectiveGroundWave("groundEntry16", wave3Templates[3]);
			break;
		case "4":
			const wave4Templates = [
				[ // North road entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 4 Heavy Cannons
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, // 4 Infernos
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Southeast base entry templates
					cTempl.comsensht, cTempl.comsensht, // 2 Sensors
					cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 6 Super Tank Killer Cyborgs
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 4 Pepperpots
					cTempl.cohhowt, cTempl.cohhowt, // 2 Howitzers
				],
				[ // Southeast trench entry templates (+commander)
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 6 Assault Cannons
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
				],
				[ // East entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
					cTempl.comsamt, cTempl.comsamt, // 2 Avenger SAMs
				],
				[ // Northeast entry templates
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.commcant, cTempl.commcant, cTempl.commcant, cTempl.commcant,
					cTempl.commcant, cTempl.commcant, cTempl.commcant, cTempl.commcant, // 8 Medium Cannons
					cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, cTempl.comhmgt, // 6 HMGs
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave4Templates[0].push(cTempl.cominft, cTempl.cominft); // 2 Infernos
				wave4Templates[2].push(cTempl.comacant, cTempl.comacant); // 2 Assault Cannons
				wave4Templates[3].push(cTempl.cohhrat, cTempl.cohhrat); // 2 HRAs
			}
			if (difficulty >= HARD)
			{
				wave4Templates[0].push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons
				wave4Templates[2].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
				wave4Templates[3].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
			}
			if (difficulty == INSANE)
			{
				wave4Templates[0].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave4Templates[2].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave4Templates[3].push(cTempl.comsamt, cTempl.comsamt); // 2 Avenger SAMs
			}

			sendCollectiveGroundWave("groundEntry8", wave4Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry12", wave4Templates[1]);
			sendCollectiveGroundWave("groundEntry14", wave4Templates[2], cTempl.comcomt);
			sendCollectiveGroundWave("groundEntry15", wave4Templates[3], cTempl.comcomt);
			sendCollectiveGroundWave("groundEntry16", wave4Templates[4]);
			break;
		case "5":
			const wave5Templates = [
				[ // Southwest road entry templates (+commander)
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 6 Assault Cannons
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // North road entry templates (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant,
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 8 Heavy Cannons
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
				],
				[ // Southeast road entry templates (+commander)
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // North base entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, // 6 Bombards
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
				],
				[ // South base entry templates
					cTempl.comsenst, // 1 Sensor
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, cTempl.comhmortt, // 6 Bombards
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
				],
				[ // East entry templates
					cTempl.comsensht, cTempl.comsensht, // 2 Sensors
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac,
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 8 Super Auto Cannon Cyborgs
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 6 Pepperpots
					cTempl.cohript, cTempl.cohript, cTempl.cohript, cTempl.cohript, // 4 Ripple Rockets
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave5Templates[0].push(cTempl.comacant, cTempl.comacant); // 2 Assault Cannons
				wave5Templates[1].push(cTempl.cohhrat, cTempl.cohhrat); // 2 HRAs
				wave5Templates[2].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
			}
			if (difficulty >= HARD)
			{
				wave5Templates[0].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
				wave5Templates[1].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave5Templates[2].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
			}
			if (difficulty == INSANE)
			{
				wave5Templates[0].push(cTempl.cohraat, cTempl.cohraat); // 2 Whirlwinds
				wave5Templates[1].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave5Templates[2].push(cTempl.comsamt, cTempl.comsamt); // 2 Avenger SAMs
			}

			sendCollectiveGroundWave("groundEntry7", wave5Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry8", wave5Templates[1], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry9", wave5Templates[2], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry11", wave5Templates[3]);
			sendCollectiveGroundWave("groundEntry12", wave5Templates[4]);
			sendCollectiveGroundWave("groundEntry15", wave5Templates[5]);
			break;
		case "6":
			const wave6Templates = [
				// ALL of these have commanders!!!
				[ // Northwest road entry
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 6 Tank Killers
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // North road entry
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 4 Bunker Busters
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Southwest marsh entry
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 6 Tank Killers
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // South marsh entry
					cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, cTempl.cohbbt, // 6 Bunker Busters
					cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, cTempl.cohhrat, // 6 HRAs
					cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, cTempl.comhaat, // 4 Cyclones
				],
				[ // Southeast road entry 1
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, 
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 8 Tank Killers
					cTempl.cominft, cTempl.cominft, cTempl.cominft, cTempl.cominft, // 4 Infernos
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
					cTempl.cohraat, cTempl.cohraat, // 2 Whirlwinds
				],
				[ // Northeast road entry
					cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, cTempl.cohacant, // 6 Assault Cannons (Tigers)
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 6 HVCs
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
					cTempl.comsamt, cTempl.comsamt, // 2 Avenger SAMs
				],
				[ // Southeast road entry 2
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant,
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 8 Heavy Cannons
					cTempl.comrept, cTempl.comrept, cTempl.comrept, cTempl.comrept, // 4 Repair Turrets
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // Southeast trench entry
					cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, cTempl.comhpvt, // 6 HVCs
					cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, cTempl.comagt, // 6 Assault Guns
					cTempl.comsamt, cTempl.comsamt, cTempl.comsamt, cTempl.comsamt, // 4 Avenger SAMs
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave6Templates[0].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
				wave6Templates[1].push(cTempl.comacant, cTempl.comacant); // 2 Assault Cannons
				wave6Templates[2].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
				wave6Templates[3].push(cTempl.cohhrat, cTempl.cohhrat); // 2 HRAs
				wave6Templates[4].push(cTempl.cominft, cTempl.cominft); // 2 Infernos
				wave6Templates[5].push(cTempl.comhpvt, cTempl.comhpvt); // 2 HVCs
				wave6Templates[6].push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons
				wave6Templates[7].push(cTempl.comhpvt, cTempl.comhpvt); // 2 HVCs
			}
			if (difficulty >= HARD)
			{
				wave6Templates[0].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
				wave6Templates[1].push(cTempl.cohacant, cTempl.cohacant); // 2 Assault Cannons (Tigers)
				wave6Templates[2].push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons
				wave6Templates[3].push(cTempl.cohbbt, cTempl.cohbbt); // 2 Bunker Busters
				wave6Templates[4].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave6Templates[5].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave6Templates[6].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave6Templates[7].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
			}
			if (difficulty == INSANE)
			{
				wave6Templates[0].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
				wave6Templates[1].push(cTempl.cohacant, cTempl.cohacant); // 2 Assault Cannons (Tigers)
				wave6Templates[2].push(cTempl.comsamt, cTempl.comsamt); // 2 Avenger SAMs
				wave6Templates[3].push(cTempl.comsamt, cTempl.comsamt); // 2 Avenger SAMs
				wave6Templates[4].push(cTempl.comhatt, cTempl.comhatt); // 2 Tank Killers
				wave6Templates[5].push(cTempl.cohacant, cTempl.cohacant); // 2 Assault Cannons (Tigers)
				wave6Templates[6].push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons
				wave6Templates[7].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
			}

			sendCollectiveGroundWave("groundEntry1", wave6Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry3", wave6Templates[1], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry4", wave6Templates[2], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry6", wave6Templates[3], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry7", wave6Templates[4], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry8", wave6Templates[5], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry9", wave6Templates[6], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry14", wave6Templates[7], cTempl.cohcomt);
			break;
		case "7":
			const wave7Templates = [
				// A lot of these guys are probably not going to reach the player's base in time anyway...
				[ // Northwest road entry (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, cTempl.comhatt, // 4 Tank Killers
					cTempl.comagt, cTempl.comagt, // 2 Assault Guns
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // Southwest marsh entry (+commander)
					cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, cTempl.cohhcant, // 6 Heavy Cannons
					cTempl.comacant, cTempl.comacant, cTempl.comacant, cTempl.comacant, // 4 Assault Cannons
					cTempl.comrept, cTempl.comrept, // 2 Repair Turrets
					cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, cTempl.cohraat, // 4 Whirlwinds
				],
				[ // South marsh entry
					cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, cTempl.comhatht, // 6 Tank Killers
					cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, cTempl.comaght, // 6 Assault Guns
					cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, cTempl.scyac, // 6 Super Auto Cannon Cyborgs
					cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth,
					cTempl.cybth, cTempl.cybth, cTempl.cybth, cTempl.cybth, // 8 Thermite Flamer Cyborgs
				],
				[ // Southeast road entry
					cTempl.comsensht, cTempl.comsensht, // 2 Sensors
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
					cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk, // 6 Super Tank Killer Cyborgs
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 6 Pepperpots
					cTempl.cohhhowtt, cTempl.cohhhowtt, // 2 Ground Shakers
				],
				[ // Northeast road entry
					cTempl.comsensht, cTempl.comsensht, // 2 Sensors
					cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, cTempl.comhpvht, // 4 HVCs
					cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, cTempl.scyhr, // 6 Super HRA Cyborgs
					cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, cTempl.comrmortht, // 6 Pepperpots
					cTempl.cohhhowtt, cTempl.cohhhowtt, // 2 Ground Shakers
				],
			];

			// Add more units to commander squads on higher difficulties
			if (difficulty >= MEDIUM)
			{
				wave7Templates[0].push(cTempl.comagt, cTempl.comagt); // 2 Assault Guns
				wave7Templates[1].push(cTempl.comacant, cTempl.comacant); // 2 Assault Cannons
			}
			if (difficulty >= HARD)
			{
				wave7Templates[0].push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons
				wave7Templates[1].push(cTempl.comrept, cTempl.comrept); // 2 Repair Turrets
			}
			if (difficulty == INSANE)
			{
				wave7Templates[0].push(cTempl.comsamt, cTempl.comsamt); // 2 Avenger SAMs
				wave7Templates[1].push(cTempl.cohhcant, cTempl.cohhcant); // 2 Heavy Cannons
			}

			sendCollectiveGroundWave("groundEntry2", wave7Templates[0], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry4", wave7Templates[1], cTempl.cohcomt);
			sendCollectiveGroundWave("groundEntry5", wave7Templates[2]);
			sendCollectiveGroundWave("groundEntry7", wave7Templates[3]);
			sendCollectiveGroundWave("groundEntry8", wave7Templates[4]);
			break;
	}
}

function airAssault1()
{
	activateAirBlip(2);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "1");
}

function airAssault2()
{
	activateAirBlip(4);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "2");
}

function airAssault3()
{
	activateAirBlip(3);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "3");
}

function airAssault4()
{
	activateAirBlip(2);
	activateAirBlip(4);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "4");
}

function airAssault5()
{
	activateAirBlip(5);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "5");
}

function airAssault6()
{
	activateAirBlip(3);
	activateAirBlip(5);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "6");
}

function airAssault7()
{
	activateAirBlip(2);
	activateAirBlip(4);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "7");
}

function airAssault8()
{
	activateAirBlip(4);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "8");
}

function airAssault9()
{
	activateAirBlip(3);
	activateAirBlip(4);
	activateAirBlip(5);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "9");
}

function airAssault10()
{
	activateAirBlip(2);
	activateAirBlip(5);

	playSound(cam_sounds.incomingAirStrike);

	queue("airAssaultWave", MIS_AIR_ASSAULT_DELAY, "10");
}

function airAssault11()
{
	activateAirBlip(4);

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

	switch (index)
	{
		case "1":
			const wave1Vtols = [
				[cTempl.colatv], // Lancers
				[cTempl.colphosv], // Phosphor Bombs
				[cTempl.comthermv], // Thermite Bombs
			];
			const wave1Extras = [
				{limit: 6},
				{limit: 6},
				{limit: 4},
			];

			// Send some one-time VTOL groups
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave1Vtols[0], undefined, undefined, wave1Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave1Vtols[1], undefined, undefined, wave1Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave1Vtols[2], undefined, undefined, wave1Extras[2]);
			break;
		case "2":
			const wave2Vtols = [
				[cTempl.colatv], // Lancers
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comhbombv], // HEAP Bombs
			];
			const wave2Extras = [
				{limit: 6},
				{limit: 6},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave2Vtols[0], undefined, undefined, wave2Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave2Vtols[1], undefined, undefined, wave2Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave2Vtols[2], undefined, undefined, wave2Extras[2]);
			break;
		case "3":
			const wave3Vtols = [
				[cTempl.colagv], // Assault Guns
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comacanv], // Assault Cannons
			];
			const wave3Extras = [
				{limit: 6},
				{limit: 4},
				{limit: 6},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave3Vtols[0], undefined, undefined, wave3Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave3Vtols[1], undefined, undefined, wave3Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave3Vtols[2], undefined, undefined, wave3Extras[2]);
			break;
		case "4":
			const wave4Vtols = [
				// From the southeast entrance...
				[cTempl.colagv], // Assault Guns
				[cTempl.colatv], // Lancers
				[cTempl.comacanv], // Assault Cannons
				// From the northeast entrance...
				[cTempl.comhbombv], // HEAP Bombs
				[cTempl.comthermv], // Thermite Bombs
			];
			const wave4Extras = [
				{limit: 6},
				{limit: 4},
				{limit: 4},

				{limit: 4},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave4Vtols[0], undefined, undefined, wave4Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave4Vtols[1], undefined, undefined, wave4Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave4Vtols[2], undefined, undefined, wave4Extras[2]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave4Vtols[3], undefined, undefined, wave4Extras[3]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave4Vtols[4], undefined, undefined, wave4Extras[4]);
			break;
		case "5":
			const wave5Vtols = [
				[cTempl.colagv], // Assault Guns
				[cTempl.comacanv], // Assault Cannons
				[cTempl.comhatv], // Tank Killers
			];
			const wave5Extras = [
				{limit: 8},
				{limit: 4},
				{limit: 6},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave5Vtols[0], undefined, undefined, wave5Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave5Vtols[1], undefined, undefined, wave5Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave5Vtols[2], undefined, undefined, wave5Extras[2]);
			break;
		case "6":
			const wave6Vtols = [
				// From the both entrances...
				[cTempl.colagv], // Assault Guns
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comacanv], // Assault Cannons
			];
			const wave6Extras = [
				{limit: 8},
				{limit: 6},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave6Vtols[0], undefined, undefined, wave6Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave6Vtols[1], undefined, undefined, wave6Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave6Vtols[2], undefined, undefined, wave6Extras[2]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave6Vtols[0], undefined, undefined, wave6Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave6Vtols[1], undefined, undefined, wave6Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave6Vtols[2], undefined, undefined, wave6Extras[2]);
			break;
		case "7":
			const wave7Vtols = [
				// From the southeast entrance...
				[cTempl.colagv], // Assault Guns
				[cTempl.comthermv], // Thermite Bombs
				// From the northeast entrance...
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comacanv], // Assault Cannons
			];
			const wave7Extras = [
				{limit: 8},
				{limit: 4},

				{limit: 6},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave7Vtols[0], undefined, undefined, wave7Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave7Vtols[1], undefined, undefined, wave7Extras[1]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave7Vtols[2], undefined, undefined, wave7Extras[2]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave7Vtols[3], undefined, undefined, wave7Extras[3]);
			break;
		case "8":
			const wave8Vtols = [
				[cTempl.comhbombv], // HEAP Bombs
				[cTempl.comthermv], // Thermite Bombs
			];
			const wave8Extras = [
				{limit: 6},
				{limit: 6},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave8Vtols[0], undefined, undefined, wave8Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave8Vtols[1], undefined, undefined, wave8Extras[1]);
			break;
		case "9":
			const wave9Vtols = [
				// From the south entrance...
				[cTempl.colagv], // Assault Guns
				[cTempl.comacanv], // Assault Cannons
				// From the east entrance...
				[cTempl.colbombv], // Cluster Bombs
				[cTempl.comhbombv], // HEAP Bombs
				// From the north entrance...
				[cTempl.colatv], // Lancers
				[cTempl.comhatv], // Tank Killers
			];
			const wave9Extras = [
				{limit: 8},
				{limit: 4},

				{limit: 6},
				{limit: 4},

				{limit: 6},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave9Vtols[0], undefined, undefined, wave9Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos3", "vtolRemoveZone2", wave9Vtols[1], undefined, undefined, wave9Extras[1]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave9Vtols[2], undefined, undefined, wave9Extras[2]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave9Vtols[3], undefined, undefined, wave9Extras[3]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave9Vtols[4], undefined, undefined, wave9Extras[4]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave9Vtols[5], undefined, undefined, wave9Extras[5]);
			break;
		case "10":
			const wave10Vtols = [
				// From the southeast entrance...
				[cTempl.colagv], // Assault Guns
				[cTempl.comhatv], // Tank Killers
				// From the north entrance...
				[cTempl.colphosv], // Phosphor Bombs
				[cTempl.comacanv], // Assault Cannons
			];
			const wave10Extras = [
				{limit: 8},
				{limit: 6},

				{limit: 6},
				{limit: 6},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave10Vtols[0], undefined, undefined, wave10Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", wave10Vtols[1], undefined, undefined, wave10Extras[1]);

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave10Vtols[2], undefined, undefined, wave10Extras[2]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos5", "vtolRemoveZone2", wave10Vtols[3], undefined, undefined, wave10Extras[3]);
			break;
		case "11":
			const wave11Vtols = [
				[cTempl.comhbombv], // HEAP Bombs
				[cTempl.comhatv], // Tank Killers
				[cTempl.comacanv], // Assault Cannons
			];
			const wave11Extras = [
				{limit: 8},
				{limit: 4},
				{limit: 4},
			];

			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave11Vtols[0], undefined, undefined, wave11Extras[0]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave11Vtols[1], undefined, undefined, wave11Extras[1]);
			camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos4", "vtolRemoveZone2", wave11Vtols[2], undefined, undefined, wave11Extras[2]);
			break;
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
				suborder: CAM_ORDER_ATTACK,
				data: {
					targetPlayer: CAM_HUMAN_PLAYER
				}
			}
		});
	}
	else
	{
		// No leader; just send in the group
		camSendReinforcement(CAM_THE_COLLECTIVE, getObject(entry), templates, CAM_REINFORCE_GROUND, {
			targetPlayer: CAM_HUMAN_PLAYER
		});
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
	if (groundBlips[12]) hackRemoveMessage("COL_ENTRY12", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[13]) hackRemoveMessage("COL_ENTRY13", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[14]) hackRemoveMessage("COL_ENTRY14", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[15]) hackRemoveMessage("COL_ENTRY15", PROX_MSG, CAM_HUMAN_PLAYER);
	if (groundBlips[16]) hackRemoveMessage("COL_ENTRY16", PROX_MSG, CAM_HUMAN_PLAYER);

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
	groundBlips[12] = false;
	groundBlips[13] = false;
	groundBlips[14] = false;
	groundBlips[15] = false;
	groundBlips[16] = false;
}

function clearAirBlips()
{
	if (airBlips[2]) hackRemoveMessage("AIR_ENTRY2", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[3]) hackRemoveMessage("AIR_ENTRY3", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[4]) hackRemoveMessage("AIR_ENTRY4", PROX_MSG, CAM_HUMAN_PLAYER);
	if (airBlips[5]) hackRemoveMessage("AIR_ENTRY5", PROX_MSG, CAM_HUMAN_PLAYER);

	airBlips[2] = false;
	airBlips[3] = false;
	airBlips[4] = false;
	airBlips[5] = false;
}

function startLightningEffects()
{
	// Shift the sun slightly the east
	camSetSunPos(-225.0, -600.0, 450.0);
	lightningEffects();

	// Start calling down lightning
	setTimer("lightningChance", camSecondsToMilliseconds(1));
}

function lightningChance()
{
	if (getMissionTime() < 30)
	{
		return; // Don't cause any lightning within the final 30 seconds
	}
	// Lightning chance increases as the timer ticks down
	// Decreases from 1/120 chance towards 1/60 chance
	else if (camRand((getMissionTime() * 60 / camMinutesToSeconds(20)) + 60) === 0)
	{
		lightningEffects();
	}
}

function lightningEffects()
{
	// Momentarily brighten the skies
	camSetFog(198, 219, 225);
	camSetSunIntensity(.52,.52,.52);

	// ...Then gradually re-darken them
	camGradualFog(camSecondsToMilliseconds(1.8), 107, 107, 107);
	camGradualSunIntensity(camSecondsToMilliseconds(1.8), .35,.35,.35);
}

function eventMissionTimeout()
{
	if (stage === 3)
	{
		camCallOnce("endSequence");
	}
}

function endSequence()
{
	camSetExtraObjectiveMessage();

	// Disable Collective reinforcements
	removeTimer("sendCollectiveTransporter");
	removeTimer("sendCollectiveReinforcements");
	camSetVtolSpawnStateAll(false); // Disable all VTOLs

	// Disable Collective factories (if they're still alive)
	camDisableFactory("colFactory1");
	camDisableFactory("colFactory2");
	camDisableFactory("colFactory3");
	camDisableFactory("colCybFactory1");
	camDisableFactory("colCybFactory2");

	// Collective retreat
	// Grab EVERY Collective unit, and move them to the retreat position
	collectiveRetreat = true;
	const group = camNewGroup();
	const pos = camMakePos("collectiveRetreatZone");
	for (const droid of enumDroid(CAM_THE_COLLECTIVE))
	{
		// Place every droid into a new unmanaged group to avoid getting new orders
		groupAdd(group, droid);
		orderDroidLoc(droid, DORDER_MOVE, pos.x, pos.y); // Move to the retreat position
	}

	// Dialogue...
	camQueueDialogue([
		{text: "CHARLIE: Lieutenant!!!", delay: 24, sound: CAM_RCLICK},
		{text: "CHARLIE: Lieutenant! They're turning around!", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: The Collective is falling back!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I don't believe it...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We made it.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Actually made it!", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: The Collective is pulling back to the city!", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: We're gonna make it out of here!", delay: 4, sound: CAM_RCLICK},
		{text: "", delay: 25, callback: "endGame"},
	]);

	// TODO: Queue transport scene & more dialogue

	// Stop the lightning
	removeTimer("lightningChance");

	// Gradually clear the skies
	camGradualFog(camSecondsToMilliseconds(60), 198, 219, 225);
	camGradualSunIntensity(camSecondsToMilliseconds(60), .6,.6,.6);
	camSetWeather(CAM_WEATHER_CLEAR);
}

camAreaEvent("collectiveRetreatZone", function(droid)
{
	if (collectiveRetreat)
	{
		camSafeRemoveObject(droid, false);
	}
	resetLabel("collectiveRetreatZone", CAM_THE_COLLECTIVE);
});