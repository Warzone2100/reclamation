
// -------------------------------------
// --- Stage 1 progression functions ---
// -------------------------------------

camAreaEvent("vtolRemoveZone1", function(droid)
{
	if (stage === 1)
	{
		camSafeRemoveObject(droid, false);
		resetLabel("vtolRemoveZone1", CAM_THE_COLLECTIVE);
	}
});

function stageOneVtolAttack()
{
	if (stage !== 1)
	{
		return;
	}

	playSound(cam_sounds.enemyVtolsDetected);

	// Cluster Bombs, Lancers, Phosphor Bombs, and Assault Guns
	const templates = [cTempl.colbombv, cTempl.colatv, cTempl.colphosv, cTempl.colagv];
	const ext = {
		limit: [2, 3, 2, 3],
		alternate: true,
		targetPlayer: CAM_HUMAN_PLAYER,
		dynamic: true
	};
	camSetVtolData(CAM_THE_COLLECTIVE, "vtolAttackPos1", "vtolRemoveZone1", templates, camChangeOnDiff(camMinutesToMilliseconds(1)), undefined, ext);
}

function startDeltaTransports()
{
	sendDeltaTransporter();
	setTimer("sendDeltaTransporter", camMinutesToMilliseconds(4));

	// Dialogue...
	camQueueDialogue([
		{text: "DELTA: Lieutenant.", delay: 0, sound: CAM_RCLICK},
		{text: "DELTA: The Collective have pulled back from Bravo's old base.", delay: 2, sound: CAM_RCLICK},
		{text: "DELTA: But it looks like they're still mobilizing most of their forces.", delay: 3, sound: CAM_RCLICK},
		{text: "DELTA: We've started our transport runs now.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Hmm...", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commanders, make sure to set up some defenses.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Be ready for anything.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...I have a feeling we're not quite out of this yet.", delay: 4, sound: CAM_RCLICK},
	]);
}

function startCollectiveReinforcments()
{
	sendCollectiveReinforcements();
	queue("stageOneVtolAttack", camChangeOnDiff(camMinutesToMilliseconds(1.5)));
	setTimer("sendCollectiveReinforcements", camChangeOnDiff(camMinutesToMilliseconds(3)));
	setTimer("sendCollectiveTransporter", camChangeOnDiff(camMinutesToMilliseconds(3.5)));

	camCallOnce("collectiveDialogue");
}

function collectiveDialogue()
{
	camQueueDialogue([
		{text: "CHARLIE: Lieutenant!", delay: 0, sound: CAM_RCLICK},
		{text: "CHARLIE: We've spotted the Collective forces approaching from the east!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Why can't anything ever be simple?", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Commander Bravo, focus on escorting those refugees.", delay: 4, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Charlie, Delta, cover Bravo's flanks and help them keep the Collective at bay.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We need to save as many people as we can", delay: 3, sound: CAM_RCLICK},
		{text: "before we can escape this damned place for good.", delay: 0},
	]);
}

// Returns true if any Transport Trucks are currently present
function transportTrucksActive()
{
	return getObject("civTruck1") !== null || getObject("civTruck2") !== null
			|| getObject("civTruck3") !== null || getObject("civTruck4") !== null
			|| getObject("civTruck5") !== null;
}

// Check if all civs are accounted for and the mission can move to stage 2
function checkCivsDone()
{
	// Allow the player to move on if:
	// The player has not lost too many Transport Trucks
	// The player has loaded all civilians into Transport Trucks
	// The player does not currently have any Transport Trucks
	if (trucksLost < truckLostThreshold 
		&& civsLoaded[1] && civsLoaded[2] && civsLoaded[3] && civsLoaded[4] && civsLoaded[5]
		&& !transportTrucksActive())
	{
		setStageTwo();
	}
}

// Triggered when the player moves into the first civilian holdout
camAreaEvent("civZone1", function(droid)
{
	// Only trigger if the player moves a Truck (NOT engineer) in which isn't already carrying civilians
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroups[1]))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck", camSecondsToMilliseconds(3), "1");

	}
	else
	{
		resetLabel("civZone1", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("civZone2", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroups[2]))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck", camSecondsToMilliseconds(3), "2");

	}
	else
	{
		resetLabel("civZone2", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("civZone3", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroups[3]))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck", camSecondsToMilliseconds(3), "3");

	}
	else
	{
		resetLabel("civZone3", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("civZone4", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroups[4]))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck", camSecondsToMilliseconds(3), "4");

	}
	else
	{
		resetLabel("civZone4", CAM_HUMAN_PLAYER);
	}
});

camAreaEvent("civZone5", function(droid)
{
	if (droid.player === CAM_HUMAN_PLAYER && droid.droidType === DROID_CONSTRUCT 
		&& droid.propulsion !== "CyborgLegs" && !camDef(getLabel(droid)))
	{
		const pos = camMakePos(droid);
		for (const civ of enumGroup(civGroups[5]))
		{
			// Move the civs towards the truck
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}

		queue("loadTruck", camSecondsToMilliseconds(3), "5");

	}
	else
	{
		resetLabel("civZone5", CAM_HUMAN_PLAYER);
	}
});

function loadTruck(index)
{
	const civArea = "civZone" + index;

	const trucks = enumArea(civArea, CAM_HUMAN_PLAYER, false).filter((obj) => (
		obj.type === DROID && obj.droidType === DROID_CONSTRUCT 
		&& obj.propulsion !== "CyborgLegs" && !camDef(getLabel(obj))
	));
	// Abort if there's no longer a truck in the civilian zone
	if (trucks.length == 0)
	{
		const pos = camMakePos(civArea);
		for (const civ of enumGroup(civGroups[index]))
		{
			// Move the civs back into their holdout
			orderDroidLoc(civ, DORDER_MOVE, pos.x, pos.y);
		}
		resetLabel(civArea, CAM_HUMAN_PLAYER);
		return;
	}
	else
	{
		// Just change the first truck we find into a Transport Truck
		const transTruck = convertToTransport(trucks[0], "civTruck" + index);

		for (const droid of enumGroup(civGroups[index]))
		{
			if (camDroidMatchesTemplate(droid, cTempl.civ))
			{
				// If we have a simple civilian, remove them quietly
				// (They've "boarded" the truck)
				camSafeRemoveObject(droid);
			}
			else
			{
				// If we have an armed civilian escort, (e.g. a Jeep), tell it to guard the player's transport truck
				orderDroidObj(droid, DORDER_GUARD, transTruck);
			}
		}

		camCallOnce("truckLoadedDialogue");
		camCallOnce("advanceAllies");

		civsLoaded[index] = true;

		hackRemoveMessage("CIVS" + index, PROX_MSG, CAM_HUMAN_PLAYER);
		if (!depositBeaconActive)
		{
			hackAddMessage("CIV_DEPOSIT", PROX_MSG, CAM_HUMAN_PLAYER);
			depositBeaconActive = true;
		}
	}
}

// Replaces the given truck droid with a transport truck
function convertToTransport(truck, transportLabel)
{
	const oldTruckName = truck.name;
	const tBody = truck.body;
	const tProp = truck.propulsion;
	const tPos = camMakePos(truck);

	// Get the un-modified name of this truck
	const standardName = _("Truck") + " " + camGetCompNameFromId(tBody, "Body") + " " + camGetCompNameFromId(tProp, "Propulsion");

	let newName;
	if (oldTruckName === standardName)
	{
		// The player hasn't renamed this truck.
		// Give it the default template name
		newName = camNameTemplate("Spade1Trans", tBody, tProp);
	}
	else
	{
		// The player has renamed this truck
		// Just slap "Transport" in front of the player's goofy name
		newName = _("Transport") + " " + oldTruckName;
	}

	// Create the new truck
	const newTruck = camAddDroid(CAM_HUMAN_PLAYER, tPos, {body: tBody, prop: tProp, weap: "Spade1Trans"}, newName);
	addLabel(newTruck, transportLabel);

	// Quietly remove the old truck...
	camSafeRemoveObject(truck);

	return newTruck;
}

// Dialogue when civilians are first loaded onto a Truck
function truckLoadedDialogue()
{
	camQueueDialogue([
		{text: "CHARLIE: Nice.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: I've marked the drop off point.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Now, drive that Truck back to our base, and the civs inside will be safe.", delay: 2, sound: CAM_RCLICK},
	]);
}

// Triggered when something enters the deposit zone
camAreaEvent("depositZone", function(droid)
{
	// Only trigger if the player moves a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		const label = getLabel(droid);
		if (camDef(label))
		{
			if (label === "civTruck1")
			{
				truck1Safe = true;
			}
			else if (label === "civTruck2")
			{
				truck2Safe = true;
			}
			else if (label === "civTruck3")
			{
				truck3Safe = true;
			}
			else if (label === "civTruck4")
			{
				truck4Safe = true;
			}
			else if (label === "civTruck5")
			{
				truck5Safe = true;
			}

			convertToTruck(droid);

			playSound(cam_sounds.rescue.civilianRescued);
		}
	}
	else if (droid.player === MIS_CIVS || droid.player === MIS_CIV_ESCORTS)
	{
		// If we have a normal civilian, just remove it
		camSafeRemoveObject(droid);
	}
	resetLabel("depositZone", ALL_PLAYERS);
});

// Replaces the given transport truck droid with a normal truck
function convertToTruck(transTruck)
{
	const oldTruckName = transTruck.name;
	const tBody = transTruck.body;
	const tProp = transTruck.propulsion;
	const tPos = camMakePos(transTruck);

	// Get the un-modified name of this truck
	const standardName = _("Transport Truck") + " " + camGetCompNameFromId(tBody, "Body") + " " + camGetCompNameFromId(tProp, "Propulsion");

	let newName;
	if (oldTruckName === standardName)
	{
		// The player didn't renamed the original truck.
		// Give it the default template name
		newName = camNameTemplate("Spade1Mk1", tBody, tProp);
	}
	else
	{
		// The player renamed the original truck.
		// Remove the first instance of "Transport " we find
		const prefix = _("Transport") + " ";
		newName = oldTruckName.slice(prefix.length);
	}

	// Create the new truck
	camAddDroid(CAM_HUMAN_PLAYER, tPos, {body: tBody, prop: tProp, weap: "Spade1Mk1"}, newName);

	// Quietly remove the transport truck...
	camSafeRemoveObject(transTruck);
}

// Make sure the player hasn't lost too many transport trucks
// Fail the mission if too many die
// Called during stage 1
function checkTrucksLost()
{
	if (trucksLost >= truckLostThreshold)
	{
		// Player has lost too many Transport Trucks
		camEndMission(false);
	}
}

// Called when the player first loads up a Truck
function advanceAllies()
{
	// Enable more aggressive group management
	allowAllyExpansion = true;

	// Enable Charlie's bridge base
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieBridgeBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6CharlieBase2Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieBridgeBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase2Structs
	});

	// Enable Charlie's south and central base
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieSouthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6CharlieBase3Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieSouthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase3Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieSouthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase3Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieCentralBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6CharlieBase4Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieCentralBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase4Structs
	});
	camManageTrucks(
		MIS_TEAM_CHARLIE, {
			label: "charlieCentralBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_ENGINEER_TIME,
			template: cTempl.cyben,
			structset: camA4L6CharlieBase4Structs
	});

	// Enable Delta's north base
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaNorthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6DeltaBase2Structs
	});
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaNorthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6DeltaBase2Structs
	});
	camManageTrucks(
		MIS_TEAM_DELTA, {
			label: "deltaNorthBase",
			rebuildBase: true,
			respawnDelay: MIS_ALLY_TRUCK_TIME,
			template: cTempl.plhtruckht,
			structset: camA4L6DeltaBase2Structs
	});
}
