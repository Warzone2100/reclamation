
// -------------------------------------
// --- Stage 2 progression functions ---
// -------------------------------------

camAreaEvent("vtolRemoveZone2", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("vtolRemoveZone2", CAM_THE_COLLECTIVE);
});

function stageTwoVtolAttack()
{	
	// HEAP Bombs, Tank Killers, Thermite Bombs, and Assault Cannons
	const templates = [cTempl.comhbombv, cTempl.comhatv, cTempl.comthermv, cTempl.comacanv];
	const ext = {
		limit: [2, 3, 2, 3],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos2", "vtolRemoveZone2", templates, camChangeOnDiff(camMinutesToMilliseconds(2)), "colCC", ext);
}

// Expand the map, and order the player to rescue Delta's transport
// Also make the Collective more aggressive and activate their eastern bases
function setStageTwo()
{
	stage = 2;

	camSetExtraObjectiveMessage(_("Rescue Team Delta's stranded group"));

	// Expand the map
	setScrollLimits(0, 0, 216, 96);

	// Place a beacon on Delta's holdout
	hackAddMessage("DELTA_HOLDOUT", PROX_MSG, CAM_HUMAN_PLAYER);

	// Move Delta's group into the holdout
	camManageGroup(deltaCrashGroup, CAM_ORDER_DEFEND, {
		pos: camMakePos("crashDefensePos"),
		radius: 10
	});

	// VTOL attack
	camSetVtolSpawnStateAll(false); // Disable the stage 1 VTOLs
	queue("stageTwoVtolAttack", camSecondsToMilliseconds(30));

	// Enable Collective factories
	camEnableFactory("colFactory1");
	camEnableFactory("colFactory2");
	camEnableFactory("colFactory3");
	camEnableFactory("colCybFactory1");
	camEnableFactory("colCybFactory2");

	// Slow down Collective reinforcement waves
	removeTimer("sendCollectiveReinforcements");
	setTimer("sendCollectiveReinforcements", camChangeOnDiff(camMinutesToMilliseconds(5)));

	// Pre-damage and rank Delta's crashed units
	for (const obj of enumArea("deltaCrashGroup", MIS_TEAM_DELTA, false))
	{
		// 40% to 60% HP
		setHealth(obj, 40 + camRand(21));
		camSetDroidRank(obj, MIS_ALLY_UNIT_RANK);
	}

	// Set up MORE Trucks
	stageTwoTrucks();

	// Move Charlie/Delta groups further up
	// Update the suborder of the Charlie/Delta command groups
	camManageGroup(charlieCommandGroup, CAM_ORDER_FOLLOW, {
		leader: "charlieCommander",
		repair: 75,
		suborder: CAM_ORDER_PATROL, // Fall back a bit if the commander dies
		data: {
			pos: [
				camMakePos("southPatrolPos1"),
				camMakePos("southPatrolPos2"),
				camMakePos("southPatrolPos3"),
			],
			interval: camSecondsToMilliseconds(35),
			radius: 32,
			repair: 75,
			removable: false
		}
	});
	camManageGroup(deltaCommandGroup, CAM_ORDER_FOLLOW, {
		leader: "deltaCommander",
		repair: 50,
		suborder: CAM_ORDER_PATROL, // Fall back a bit if the commander dies
		data: {
			pos: [
				camMakePos("northPatrolPos1"),
				camMakePos("northPatrolPos2"),
				camMakePos("northPatrolPos3"),
			],
			interval: camSecondsToMilliseconds(75),
			radius: 32,
			repair: 50,
			removable: false
		}
	});

	// Spawn small harassment groups against Delta's transport
	setTimer("sendTransportHarassGroup", camMinutesToMilliseconds(4));

	// Gradually set the skies to be rainy
	camGradualFog(camMinutesToMilliseconds(2), 149, 165, 169);
	camGradualSunIntensity(camMinutesToMilliseconds(2), .45,.45,.45);
	camSetWeather(CAM_WEATHER_RAIN);

	// Hack to prevent the east half of the map from being dark after the expansion
	camSetSunPos(-450.0, -401.0, 225.0); // Move the sun just a wee bit 

	// Transmission about Delta's crashed transport
	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "A4L6_DELTA", type: MISS_MSG}]);

	// Dialogue...
	camCallOnce("collectiveDialogue");
	camQueueDialogue([ // Additional dialogue after a long delay...
		{text: "CHARLIE: Lieutenant, we've detected more of those SAM launchers", delay: 60, sound: CAM_RCLICK},
		{text: "in the surrounding areas.", delay: 0},
		{text: "CHARLIE: The Collective is trying to box us in!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...This just keeps getting worse, huh?", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We're not going to be able to flee using transports", delay: 3, sound: CAM_RCLICK},
		{text: "until we come up with a backup plan.", delay: 0},
		{text: "LIEUTENANT: Commanders, make sure to fortify our position.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Set up as many defenses as you can!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: The Collective isn't gonna let us leave without a fight!", delay: 3, sound: CAM_RCLICK},
	]);
}

function stageTwoTrucks()
{
	// Manage Collective base trucks
	colBaseTruckJob1 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colShakerBase",
			rebuildBase: true,
			rebuildTruck: false, // Collective trucks are brought in as reinforcements
			template: cTempl.comtruckt,
			structset: colBase1Structs
	});
	colBaseTruckJob2 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colShakerBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase1Structs
	});
	colBaseTruckJob3 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colShakerBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase1Structs
	});
	colBaseTruckJob4 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colShakerBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase1Structs
	});
	colBaseTruckJob5 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colOverlookBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase2Structs
	});
	colBaseTruckJob6 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colOverlookBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase2Structs
	});
	colBaseTruckJob7 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colRippleBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase3Structs
	});
	colBaseTruckJob8 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colRippleBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase3Structs
	});
	colBaseTruckJob9 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colTrenchOutpost", // NOTE: Don't rebuild this base if destroyed
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase4Structs
	});
	colBaseTruckJob10 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colTrenchOutpost",
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase4Structs
	});
	colBaseTruckJob11 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colFactoryBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase5Structs
	});
	colBaseTruckJob12 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colFactoryBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckt,
			structset: colBase5Structs
	});
	colBaseTruckJob13 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colFactoryBase",
			rebuildBase: true,
			rebuildTruck: false,
			template: cTempl.comtruckht,
			structset: colBase5Structs
	});
	// This base starts unbuilt
	colBaseTruckJob14 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralBase",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColBase6Structs
	});
	colBaseTruckJob15 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralBase",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColBase6Structs
	});
	colBaseTruckJob16 = camManageTrucks(
		CAM_THE_COLLECTIVE, {
			label: "colCentralBase",
			rebuildBase: true,
			rebuildTruck: false,
			structset: camA4L6ColBase6Structs
	});

	// Enable Delta's east base 
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaEastBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6DeltaBase3Structs
	});
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaEastBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6DeltaBase3Structs
	});
	// Also tell Delta's crashed trucks to build defenses in the holdout
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaCrashHoldout",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("deltaCrashTruck1"),
			structset: deltaHoldoutStructs
	});
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaCrashHoldout",
			rebuildBase: true,
			rebuildTruck: false,
			truckDroid: getObject("deltaCrashTruck2"),
			structset: deltaHoldoutStructs
	});

	// Upgrade Collective structures on higher difficulties
	if (difficulty == HARD)
	{
		// Only replace these when destroyed
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadBof", "AASite-QuadRotMg", true); // AA Sites
	}
	else if (difficulty == INSANE)
	{
		// Proactively demolish/replace these
		camTruckObsoleteStructure(CAM_THE_COLLECTIVE, "AASite-QuadBof", "AASite-QuadRotMg"); // AA Sites
	}
}

// Triggered when the player enters Delta's transport holdout
camAreaEvent("deltaBase4", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER && !isVTOL(droid))
	{
		camCallOnce("donateHoldout");
	}
	else
	{
		resetLabel("deltaBase4", CAM_HUMAN_PLAYER);
	}
});

function donateHoldout()
{
	holdoutDonated = true;

	// Remove the holdout beacon
	hackRemoveMessage("DELTA_HOLDOUT", PROX_MSG, CAM_HUMAN_PLAYER);
	// Place a beacon at Delta's base
	hackAddMessage("DELTA_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);

	// Donate all units/structures in the holdout to the player
	camEnsureDonateObject(enumArea("deltaBase4", MIS_TEAM_DELTA, false), CAM_HUMAN_PLAYER);

	playSound(cam_sounds.unitsTransferred);

	removeTimer("sendTransportHarassGroup");

	// Start checking for the group's return
	setTimer("camCheckDeltaReturnArea", camSecondsToMilliseconds(2));

	camQueueDialogue([
		{text: "DELTA: Alright, you've got them!", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: Now bring them back to our base, Bravo.", delay: 3, sound: CAM_RCLICK},
	]);

	queue("deltaGroupAlive", camSecondsToMilliseconds(0.4));
}

// Scan the area near Delta's LZ
function camCheckDeltaReturnArea()
{
	const returnPos = camMakePos("deltaReturnPos");
	const returnDroids = enumRange(returnPos.x, returnPos.y, 6 + numDeltaRescued, CAM_HUMAN_PLAYER, false).filter((obj) => 
		(obj.type === DROID && deltaUnitIDs.includes(obj.id))
	);

	if (returnDroids.length > 0)
	{
		for (const droid of returnDroids)
		{
			donateObject(droid, MIS_TEAM_DELTA); // Donate it back to team Delta
			numDeltaRescued++;
		}

		queue("deltaGroupAlive", camSecondsToMilliseconds(0.4)); // Check if there's any remaining members
	}
}

// Triggered when a Collective unit approaches Delta's transport from the south
camAreaEvent("colDeaggroZone", function(droid)
{
	if (!holdoutDonated)
	{
		// "De-aggro" the Collective unit from the holdout (by DELETING it)
		if (droid.player === CAM_THE_COLLECTIVE && !isVTOL(droid))
		{
			camSafeRemoveObject(droid); // i banish thee
		}
		resetLabel("colDeaggroZone", CAM_THE_COLLECTIVE);
	}
});

// Handle the player recycling one of Delta's transport units
function eventObjectRecycled(obj)
{
	if (stage === 2 && obj.type === DROID && obj.player === CAM_HUMAN_PLAYER)
	{
		if (deltaUnitIDs.includes(obj.id))
		{
			deltaGroupAlive();

			camCallOnce("deltaRecycleDialogue");
		}
	}
}

// Have Delta get mad at Bravo for hustling their units for cash
function deltaRecycleDialogue()
{
	camQueueDialogue([
		{text: "DELTA: Hey!", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: What're you doing, Bravo?!", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: Those are OUR units!", delay: 3, sound: CAM_RCLICK},
	]);
}

// Spawn a very small group to attack Delta's crash site
function sendTransportHarassGroup()
{
	const droidPool = [
		cTempl.cybhg,
		cTempl.cybag,
		cTempl.cybca,
		cTempl.cybfl,
		cTempl.scymc,
		cTempl.colpodt,
		cTempl.colhmght,
		cTempl.colflamt,
		cTempl.commcant,
	];

	const NUM_DROIDS = 2;
	let droids = [];
	for (let i = 0; i < NUM_DROIDS; i++)
	{
		droids.push(camRandFrom(droidPool));
	}

	camSendReinforcement(CAM_THE_COLLECTIVE, getObject("groundEntry16"), droids, CAM_REINFORCE_GROUND, {
		order: CAM_ORDER_ATTACK,
		data: {
			targetPlayer: MIS_TEAM_DELTA
		}
	});
}

// Make sure that at least one delta unit from the transport makes it back alive
// Fail the mission if all units die before reaching Delta's base
// Advance to stage 3 if at least one unit makes it back and the rest of the group is missing
// Called when the player loses a unit, recycles a unit, or returns a unit during stage 2
// Also update the objective message to show how many of Delta's units are left alive and unrescued
function deltaGroupAlive()
{
	if (deltaUnitIDs.length > 0)
	{
		unitFound = false;
		unitsRemaining = 0;
		for (const ID of deltaUnitIDs)
		{
			if (getObject(DROID, CAM_HUMAN_PLAYER, ID) !== null)
			{
				// The player still has one of Delta's units
				unitFound = true;
				unitsRemaining++;
			}
		}

		const objMessages = [];
		objMessages.push(_("Escort team Delta's lost group back to base (" + unitsRemaining + " remaining)"));
		if (numDeltaRescued <= 0)
		{
			// We don't need to display this if at least one unit has already been rescued
			objMessages.push(_("At least one Delta unit must survive"));
		}
		camSetExtraObjectiveMessage(objMessages);

		if (!unitFound)
		{
			// No units found
			if (numDeltaRescued > 0)
			{
				// At least one unit made it back alive; move on to the final stage
				setStageThree();
			}
			else
			{
				// No one made it back alive...
				camEndMission(false);
			}
		}
	}
}
