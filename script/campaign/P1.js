include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_infestedRes = [
	"R-Wpn-MG-Damage01", "R-Wpn-Rocket-Damage01",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage01", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF01", "R-Wpn-Cannon-ROF01",
	"R-Vehicle-Metals01",
];

// Player values
const MIS_CIVS = 1; // Civilian warehouses
const MIS_CIVS_DESTRUCTIBLE = 2; // Civilian warehouses after the player is told to "look" around
const MIS_TEAM_CHARLIE = 3; // Delivers reinforcements to the player

// Whether the player has been detected by either of the scavenger factions
var stage; // Incremented as the player progresses through the level
// stage 0: no factories or entryways are active
// stage 1: southern factory/entryway is active, triggered when clearing SW base or crossing the west bridge
// stage 2: southeast factory/entryway is active, triggered when clearing the south base or crossing the east bridge
// stage 3: northeast factory/entryway is active, triggered when clearing the southeast base or traveling the eastern road
// stage 4: all (remaining) factories are active and the north entryway is active, triggered when approaching the final base or clearing the northeast base
// stage 5: used to mark the end of the level

// Changing the player's colour only updates playerData after save-loading or level progression.
// This variable is to make sure the transport correctly matches the player's colour on this level.
var playerColour;
// A list of all the units the player SHOULD have
var playerTemplateList;
// Number of warehouses destroyed
var numWarehousesDestroyed;
var lz1BeaconPlaced;
var lz2BeaconPlaced;
var lz3BeaconPlaced;
var lz4BeaconPlaced;

// How many waves of infested units can be brought in
// Once reserves are depleted, reinforcement waves stop and all factories are disabled
// Reserves are added as the player progresses through the level, and subtracted every time Infested reinforcements are spawned
var infestedReserves;
const MIS_MAX_RESERVES = 12;

// Triggered when the player approaches the first MRP emplacement
camAreaEvent("attackTrigger1", function(droid)
{
	// Only trigger if the player move a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camManageGroup(camMakeGroup("infAttackGroup1"), CAM_ORDER_ATTACK);

		if (getObject("landingZoneGuardTower") !== null)
		{
			// Play dialogue telling the player to start clearing LZs
			camQueueDialogue([
				{text: "CLAYDE: Commander Charlie, is there any way you can reinforce team Bravo?", delay: 0, sound: CAM_RCLICK},
				{text: "CHARLIE: There are some suitable LZs nearby, Commander Bravo.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: If you can clear them, I can deliver you reinforcements.", delay: 3, sound: CAM_RCLICK},
			]);
			hackAddMessage("LZ1", PROX_MSG, CAM_HUMAN_PLAYER);
			lz1BeaconPlaced = true;
		}
		else
		{
			// Play dialogue about another potential LZ to the south
			camQueueDialogue([
				{text: "CHARLIE: General, we've spotted another potential LZ to the south of Bravo's position.", delay: 0, sound: CAM_RCLICK},
				{text: "CHARLIE: I'll be able to send additional reinforcements, if they can clear out that area.", delay: 3, sound: CAM_RCLICK},
				{text: "CLAYDE: Very well.", delay: 4, sound: CAM_RCLICK},
				{text: "CLAYDE: Commander Bravo, make sure to secure that LZ when you reach that area.", delay: 2, sound: CAM_RCLICK},
			]);
		}
		hackAddMessage("LZ2", PROX_MSG, CAM_HUMAN_PLAYER);
		lz2BeaconPlaced = true;
	}
	else
	{
		resetLabel("attackTrigger1", CAM_HUMAN_PLAYER);
	}
});

// Triggered when the player travels up the east road
camAreaEvent("attackTrigger2", function(droid)
{
	// Only trigger if the player move a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camManageGroup(camMakeGroup("infAttackGroup2"), CAM_ORDER_ATTACK);
		setStageThree(); // Set to stage 3 if necessary
	}
	else
	{
		resetLabel("attackTrigger2", CAM_HUMAN_PLAYER);
	}
});

// Triggered when the player approaches the final base
camAreaEvent("attackTrigger3", function(droid)
{
	// Only trigger if the player move a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		camManageGroup(camMakeGroup("infAttackGroup3"), CAM_ORDER_ATTACK);
		setStageFour(); // Set to stage 4 if necessary
	}
	else
	{
		resetLabel("attackTrigger3", CAM_HUMAN_PLAYER);
	}
});

// Triggered when the player crosses the first bridge
camAreaEvent("progTrigger1", function(droid)
{
	// Only trigger if the player move a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		setStageOne();
		// Play dialogue telling the player to start clearing LZs
		camQueueDialogue([
			{text: "CHARLIE: Commander Bravo, we've spotted another LZ south of you.", delay: 2, sound: CAM_RCLICK},
		]);
		hackAddMessage("LZ3", PROX_MSG, CAM_HUMAN_PLAYER);
		lz3BeaconPlaced = true;
	}
	else
	{
		resetLabel("progTrigger1", CAM_HUMAN_PLAYER);
	}
});

// Triggered when the player crosses the second bridge
camAreaEvent("progTrigger2", function(droid)
{
	// Only trigger if the player move a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		setStageTwo();
		camQueueDialogue([
			{text: "CHARLIE: Bravo, we've spotted one last LZ to the northeast.", delay: 2, sound: CAM_RCLICK},
			{text: "CHARLIE: Make sure to secure it before you push into the main town.", delay: 3, sound: CAM_RCLICK},
		]);
		hackAddMessage("LZ4", PROX_MSG, CAM_HUMAN_PLAYER);
		lz4BeaconPlaced = true;
	}
	else
	{
		resetLabel("progTrigger2", CAM_HUMAN_PLAYER);
	}
});

function camEnemyBaseEliminated_westTown()
{
	queue("setStageOne", camChangeOnDiff(camSecondsToMilliseconds(30)));
}

function camEnemyBaseDetected_southWestRidge()
{
	camManageGroup(camMakeGroup("infRidgeGroup"), CAM_ORDER_ATTACK);
}

function camEnemyBaseEliminated_southWestRidge()
{
	setStageOne();

	// Call transport
	sendTransport2();
}

function camEnemyBaseEliminated_southRidge()
{
	// Call transport
	sendTransport3();
}

function camEnemyBaseEliminated_southTown()
{
	queue("setStageTwo", camChangeOnDiff(camSecondsToMilliseconds(15)));
}

function camEnemyBaseEliminated_southEastTown()
{
	queue("setStageThree", camChangeOnDiff(camSecondsToMilliseconds(30)));
}

function camEnemyBaseEliminated_eastRuins()
{
	// Call transport
	sendTransport4();
}

function camEnemyBaseEliminated_northEastTown()
{
	queue("setStageFour", camChangeOnDiff(camSecondsToMilliseconds(20)));
}

function camEnemyBaseEliminated_northTown()
{
	// Start final search
	stage = 5;
	camQueueDialogue([
		{text: "CHARLIE: General, Commander Bravo has secured the town.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Excellent work, Bravo.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I knew that you could handle this.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Now, to find out why the infested are drawn here...", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Take a look around the town, see if there's anything suspicious.", delay: 3, sound: CAM_RCLICK},
		{delay: 3, callback: "enableWarehouseDestruction"}
	]);

	// Also call for replacements
	sendTransport5();
}

function setStageOne()
{
	if (stage >= 1)
	{
		return; // Do nothing
	}

	stage = 1;
	addInfestedReserves();
	camEnableFactory("infFactory1");
	// Start sending in additional infested
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(65)));
}

function setStageTwo()
{
	if (stage >= 2)
	{
		return; // Do nothing
	}

	stage = 2;
	addInfestedReserves();
	camEnableFactory("infFactory2");
}

function setStageThree()
{
	if (stage >= 3)
	{
		return; // Do nothing
	}

	stage = 3;
	addInfestedReserves();
	camEnableFactory("infFactory3");
}

function setStageFour()
{
	if (stage >= 4)
	{
		return; // Do nothing
	}

	stage = 4;
	addInfestedReserves();
	camEnableFactory("infFactory4");
	camEnableFactory("infFactory5");
}

function checkLZ1Tower()
{
	if (getObject("landingZoneGuardTower") === null)
	{
		removeTimer("checkLZ1Tower");

		// Play dialogue and then send a transport
		camQueueDialogue([
			{text: "CLAYDE: Commander Charlie, send a transport to Commander Bravo.", delay: 2, sound: CAM_RCLICK},
			{text: "CLAYDE: They'll need reinforcements in order to secure the town.", delay: 3, sound: CAM_RCLICK},
			{text: "CHARLIE: Roger that, General.", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: Transport on the way.", delay: 2, sound: CAM_RCLICK, callback: "sendTransport1"},
		]);
	}
}

// Allow more infested units to enter the map
function addInfestedReserves()
{
	infestedReserves += ((difficulty * 2) + 2);
	if (infestedReserves > MIS_MAX_RESERVES)
	{
		infestedReserves = MIS_MAX_RESERVES;
	}
}

// Reduce reserves by 1
// If reserves are depleted, disable all Infested factories
function decrementInfestedReserves()
{
	infestedReserves--;

	if (infestedReserves <= 0)
	{
		// NOTE: Some of these factories may already be destroyed or not activated in the first place
		// That's OK
		camDisableFactory("infFactory1");
		camDisableFactory("infFactory2");
		camDisableFactory("infFactory3");
		camDisableFactory("infFactory4");
		camDisableFactory("infFactory5");
	}
}

// Off-map infested reinforcements from the entryway specified by the stage, disabled if the required factory is destroyed
function sendInfestedReinforcements()
{
	if (infestedReserves <= 0)
	{
		return; // Don't do anything if reserves are depleted
	}

	let coreSize = camRand(3); // 0 - 2 core units.
	if (stage >= 3) coreSize += 2; // 2 - 4 core units.
	const FODDER_SIZE = 8 + camRand(5); // 8 - 12 extra Infested Civilians to the swarm.

	// South entrance
	if (stage == 1 && getObject("infFactory1") !== null) // Stop if the infested factory was destroyed
	{
		const droids = [cTempl.stinger, cTempl.infbloke];
		camSendReinforcement(CAM_INFESTED, getObject("infEntry1"), camRandInfTemplates(droids, coreSize, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}
	// Southeast entrance
	else if (stage == 2 && getObject("infFactory2") !== null)
	{
		const droids = [cTempl.stinger, cTempl.infbloke, cTempl.infbjeep];
		camSendReinforcement(CAM_INFESTED, getObject("infEntry2"), camRandInfTemplates(droids, coreSize, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}
	// Northeast entrance
	else if (stage == 3 && getObject("infFactory3") !== null)
	{
		const droids = [cTempl.stinger, cTempl.infbjeep, cTempl.infrbjeep];
		camSendReinforcement(CAM_INFESTED, getObject("infEntry3"), camRandInfTemplates(droids, coreSize, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}
	// North entrance
	else if (stage == 4 && getObject("infFactory4") !== null)
	{
		const droids = [cTempl.stinger, cTempl.stinger, cTempl.infbjeep, cTempl.infkevbloke];
		camSendReinforcement(CAM_INFESTED, getObject("infEntry4"), camRandInfTemplates(droids, coreSize, FODDER_SIZE), CAM_REINFORCE_GROUND, 
			{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
		);
	}

	decrementInfestedReserves();
}

// Give reinforcements to the player
function eventTransporterLanded(transport)
{
	// Count all Charlie units
	const units = enumDroid(MIS_TEAM_CHARLIE);

	for (let i = 0, len = units.length; i < len; i++)
	{
		const droid = units[i];
		if (!camIsTransporter(droid)) // Give every unit that isn't a transport
		{
			donateObject(droid, CAM_HUMAN_PLAYER);
		}
	}
}

function sendTransport1()
{
	// Update the player's droid list
	playerTemplateList = [ // 4 Repair Turrets, 4 Light Cannons
		cTempl.pllrepw, cTempl.pllrepw, cTempl.pllrepw, cTempl.pllrepw,
		cTempl.pllcanw, cTempl.pllcanw, cTempl.pllcanw, cTempl.pllcanw,
	].concat(playerTemplateList);

	let droids = getMissingPlayerDroids();

	camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZone1"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 2, y: 2 },
			exit: { x: 2, y: 2 }
		}
	);

	if (lz1BeaconPlaced)
	{
		hackRemoveMessage("LZ1", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	// Add the cool flashy lights
	const lz = getObject("landingZone1");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
}

function sendTransport2()
{
	// Update the player's droid list
	playerTemplateList = [ // 6 Flamers, 2 Twin Machineguns
		cTempl.pllflamt, cTempl.pllflamt, cTempl.pllflamt, cTempl.pllflamt, cTempl.pllflamt, cTempl.pllflamt,
		cTempl.plltmgt, cTempl.plltmgt,
	].concat(playerTemplateList);

	let droids = getMissingPlayerDroids();

	camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZone2"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 2, y: 2 },
			exit: { x: 2, y: 2 }
		}
	);

	camQueueDialogue([
		{text: "CHARLIE: Reinforcements on the way, Bravo.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: These flamers should help with any bunkers you run into.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: They're great against groups of enemies, too.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Just remember that their range is very short.", delay: 4, sound: CAM_RCLICK},
	]);

	if (lz2BeaconPlaced)
	{
		hackRemoveMessage("LZ2", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	const lz = getObject("landingZone2");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
}

function sendTransport3()
{
	// Update the player's droid list
	playerTemplateList = [ // 1 Sensor, 5 Mortars
		cTempl.pllsenst,
		cTempl.pllmortw, cTempl.pllmortw, cTempl.pllmortw, cTempl.pllmortw, cTempl.pllmortw,
	].concat(playerTemplateList);

	let droids = getMissingPlayerDroids();

	camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZone3"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 2, y: 2 },
			exit: { x: 2, y: 2 }
		}
	);

	camQueueDialogue([
		{text: "CHARLIE: Transport on the way.", delay: 2, sound: CAM_RCLICK},
		{text: "CHARLIE: These mortars should be able to take down those uglies from a safe distance.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: But make sure you keep them protected.", delay: 4, sound: CAM_RCLICK},
		{text: "CHARLIE: They're pretty squishy on their own.", delay: 3, sound: CAM_RCLICK},
	]);

	if (lz3BeaconPlaced)
	{
		hackRemoveMessage("LZ3", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	const lz = getObject("landingZone3");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
}

function sendTransport4()
{
	// Update the player's droid list
	playerTemplateList = [ // 2 Repair Turrets, 4 Machinegunners
		cTempl.pllrepw, cTempl.pllrepw,
		cTempl.cybmg, cTempl.cybmg, cTempl.cybmg, cTempl.cybmg,
	].concat(playerTemplateList);

	let droids = getMissingPlayerDroids();

	camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZone4"), droids,
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 2, y: 60 },
			exit: { x: 2, y: 60 }
		}
	);

	camQueueDialogue([
		{text: "CHARLIE: Reinforcements on the way.", delay: 3, sound: CAM_RCLICK},
		{text: "CHARLIE: Hope you're ready for what's in that town, Bravo.", delay: 5, sound: CAM_RCLICK},
		{text: "CHARLIE: ...It's bound to be ugly in there.", delay: 4, sound: CAM_RCLICK},
	]);

	if (lz4BeaconPlaced)
	{
		hackRemoveMessage("LZ4", PROX_MSG, CAM_HUMAN_PLAYER);
	}

	const lz = getObject("landingZone4");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
}

function sendTransport5()
{
	// If the player is missing units, replace them.
	let droids = getMissingPlayerDroids();

	if (droids.length > 0)
	{
		camSendReinforcement(MIS_TEAM_CHARLIE, camMakePos("landingZone5"), droids,
			CAM_REINFORCE_TRANSPORT, {
				entry: { x: 2, y: 2 },
				exit: { x: 2, y: 2 }
			}
		);
	}

	const lz = getObject("landingZone5");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
}

function enableWarehouseDestruction()
{
	// Change all warehouses to an enemy team
	for (const struct of enumStruct(MIS_CIVS))
	{
		donateObject(struct, MIS_CIVS_DESTRUCTIBLE);
	}
}

function disableWarehouseDestruction()
{
	// Change all warehouses back to a friendly team
	for (const struct of enumStruct(MIS_CIVS_DESTRUCTIBLE))
	{
		donateObject(struct, MIS_CIVS);
	}

	// Continue dialogue
	camQueueDialogue([
		{text: "CLAYDE: Well...", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: That's a peculiar looking device.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Commander Bravo, gather up everything left in this town.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I'll send a transport to retrieve what you've found.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Once you're done, start making your way towards Charlie's base.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: General Clayde, signing off.", delay: 3, sound: CAM_RCLICK},
		{delay: 4, callback: "camEndMission"}, // End the mission after the dialogue is finished
	]);
}

function eventDestroyed(obj)
{
	if (obj.type === STRUCTURE && obj.player === MIS_CIVS_DESTRUCTIBLE)
	{
		if (stage == 5)
		{
			numWarehousesDestroyed++;
			if (numWarehousesDestroyed == 1)
			{
				// Spawn an oil drum
				addFeature("OilDrum", obj.x, obj.y);
			}
			else if (numWarehousesDestroyed == 3)
			{
				// Spawn a Lure
				addStructure("Sys-InfLure", MIS_CIVS, obj.x * 128, obj.y * 128);
				disableWarehouseDestruction();
				hackRemoveMessage("OLD_TOWN", PROX_MSG, CAM_HUMAN_PLAYER);

				// Grant visibility of the Lure and move the camera to it
				camSetObjectVision(MIS_CIVS, true);
				cameraSlide(obj.x * 128, obj.y * 128);
			}
		}
		else if (obj.type === STRUCTURE && obj.player === MIS_CIVS)
		{
			// Warehouse destroyed early; replace it
			addStructure("CivWarehouse2", MIS_CIVS, obj.x * 128, obj.y * 128);
		}
	}
}

// Compare all of the player's units with the droid list and return up to the first 10 droids that are missing
function getMissingPlayerDroids()
{
	const playerDroids = enumDroid(CAM_HUMAN_PLAYER);
	const missingTemplates = [];

	let templIdx = 0;
	let missingIdx = 0;
	// Loop until we find 10 missing templates or we run out of templates to check
	while (missingIdx < 10 && templIdx < playerTemplateList.length)
	{
		let foundMatch = false;
		const TEMPLATE = playerTemplateList[templIdx];
		// Loop through every player droid until we find a match
		for (let i = 0; i < playerDroids.length; i++)
		{
			const droid = playerDroids[i];
			if (camDef(droid) && camDroidMatchesTemplate(droid, TEMPLATE))
			{
				foundMatch = true;
				delete playerDroids[i]; // Set this element as undefined (so we don't match multiple templates to the same droid)
				break;
			}
		}

		if (!foundMatch)
		{
			// No match for this template; it's missing from the player's forces
			missingTemplates.push(TEMPLATE);
			missingIdx++;
		}
		templIdx++;
	}

	return missingTemplates;
}

function eventChat(from, to, message)
{
	let colour = 0;
	switch (message)
	{
		case "green me":
			colour = 0; // Green
			break;
		case "orange me":
			colour = 1; // Orange
			break;
		case "grey me":
		case "gray me":
			colour = 2; // Gray
			break;
		case "black me":
			colour = 3; // Black
			break;
		case "red me":
			colour = 4; // Red
			break;
		case "blue me":
			colour = 5; // Blue
			break;
		case "pink me":
			colour = 6; // Pink
			break;
		case "aqua me":
		case "cyan me":
			colour = 7; // Cyan
			break;
		case "yellow me":
			colour = 8; // Yellow
			break;
		case "purple me":
			colour = 9; // Purple
			break;
		case "white me":
			colour = 10; // White
			break;
		case "bright blue me":
		case "bright me":
			colour = 11; // Bright Blue
			break;
		case "neon green me":
		case "neon me":
		case "bright green me":
			colour = 12; // Neon Green
			break;
		case "infrared me":
		case "infra red me":
		case "infra me":
		case "dark red me":
			colour = 13; // Infrared
			break;
		case "ultraviolet me":
		case "ultra violet me":
		case "ultra me":
		case "uv me":
		case "dark blue me":
			colour = 14; // Ultraviolet
			break;
		case "brown me":
		case "dark green me":
			colour = 15; // Brown
			break;
		default:
			return; // Some other message; do nothing
	}

	playerColour = colour;
	changePlayerColour(CAM_HUMAN_PLAYER, colour);
	changePlayerColour(MIS_TEAM_CHARLIE, (playerColour !== 11) ? 11 : 5); // Charlie to bright blue or blue
	changePlayerColour(CAM_INFESTED, (playerColour !== 9) ? 9 : 4); // Infested to purple or red
	playSound("beep6.ogg");
}

// Returns false if the player if the player has no units, true otherwise
function playerReallyAlive()
{
	return enumDroid(DROID_ANY, CAM_HUMAN_PLAYER).length > 0;
}

function eventStartLevel()
{
	playerColour = playerData[0].colour;
	changePlayerColour(MIS_TEAM_CHARLIE, (playerColour !== 11) ? 11 : 5); // Charlie to bright blue or blue
	changePlayerColour(MIS_CIVS, 10); // Civs to white
	changePlayerColour(MIS_CIVS_DESTRUCTIBLE, 10); // Civs to white
	changePlayerColour(CAM_INFESTED, (playerColour !== 9) ? 9 : 4); // Infested to purple or red

	// The player only loses if they run out of units
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "P2", {
		showArtifacts: false,
		defeatOnDeath: false, // Player doesn't have any trucks or factories, so technically they are always "dead"
		callback: "playerReallyAlive"
	});
	camSetExtraObjectiveMessage(_("Investigate the infested town"));

	// Set alliances
	setAlliance(MIS_CIVS, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_CIVS, MIS_TEAM_CHARLIE, true);
	setAlliance(MIS_CIVS, CAM_INFESTED, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_CHARLIE, true);

	const startpos = getObject("startPosition");
	centreView(startpos.x, startpos.y);

	camCompleteRequiredResearch(camRec2StartResearch, CAM_HUMAN_PLAYER); // Give starting tech
	camCompleteRequiredResearch(mis_infestedRes, CAM_INFESTED); // Give infested upgrades

	// Set up bases
	camSetEnemyBases({
		"westTown": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"southWestRidge": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"southRidge": {
			cleanup: "infBase3",
			detectMsg: "INF_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"southTown": {
			cleanup: "infBase4",
			detectMsg: "INF_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"southEastTown": {
			cleanup: "infBase5",
			detectMsg: "INF_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"eastRuins": {
			cleanup: "infBase6",
			detectMsg: "INF_BASE6",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"northEastTown": {
			cleanup: "infBase7",
			detectMsg: "INF_BASE7",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
		"northTown": {
			cleanup: "infBase8",
			detectMsg: "INF_BASE8",
			player: CAM_INFESTED, // Don't include the warehouse structures
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated
		},
	});

	// Set up factories
	camSetFactories({
		"infFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infciv, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbuscan]
		},
		"infFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(12)),
			// Infested civilians, with some occasional vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.inflance, cTempl.infciv, cTempl.infbjeep, cTempl.infciv]
		},
		"infFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			// Light Infested vehicles
			templates: [cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infbjeep, cTempl.infciv, cTempl.infbjeep]
		},
		"infFactory4": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(8)),
			// Infested infantry
			templates: [cTempl.infciv, cTempl.infbloke, cTempl.infciv, cTempl.infkevbloke, cTempl.infciv, cTempl.infkevbloke, cTempl.infciv, cTempl.inflance]
		},
		"infFactory5": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(18)),
			// Large Infested vehicles
			templates: [cTempl.infciv, cTempl.infciv, cTempl.infrbjeep, cTempl.infciv, cTempl.infbuscan, cTempl.infciv, cTempl.infbjeep]
		},
	});

	// List of templates that the player starts with
	playerTemplateList = [ // 2 Light Cannons, 4 Machinegunners
		cTempl.pllcanw, cTempl.pllcanw,
		cTempl.cybmg, cTempl.cybmg, cTempl.cybmg, cTempl.cybmg,
	];
	numWarehousesDestroyed = 0;
	lz1BeaconPlaced = false;
	lz2BeaconPlaced = false;
	lz3BeaconPlaced = false;
	lz4BeaconPlaced = false;

	infestedReserves = 0;

	setTimer("checkLZ1Tower", camSecondsToMilliseconds(1));

	// Place a beacon in the main town
	hackAddMessage("OLD_TOWN", PROX_MSG, CAM_HUMAN_PLAYER);

	// Change the fog colour to a 1/4th-light thick purple
	camSetFog(28, 18, 39);
	// Set the sky to night
	camSetSkyType(CAM_SKY_NIGHT);
	// Darken and purple-ify the lighting somewhat
	camSetSunIntensity(.4,.35,.4);
	// Make it snow constantly
	camSetWeather(CAM_WEATHER_SNOWSTORM);

	// All Infested structures start out partially damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [30, 60]);

	// NOTE: Timerless mode does not affect this mission at all
	setMissionTime(-1);

	// Give player briefing.
	camPlayVideos({video: "P1_BRIEF", type: MISS_MSG});
}
