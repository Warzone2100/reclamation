include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const MIS_ORANGE_SCAVS = 4;
const MIS_PINK_SCAVS = 5;
const MIS_RED_SCAVS = 6;
const transportEntryPos = { x: 60, y: 4 };

var firstTransportLanded;
var startedFromMenu;
var orangeAggrod;
var pinkAggrod;
var redAggrod;
var playerColour;

const mis_orangeScavResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Mortar-Damage01", "R-Wpn-Cannon-Damage02",
	"R-Wpn-MG-ROF01", "R-Wpn-Mortar-ROF01", "R-Vehicle-Metals01",
	"R-Struc-Materials01", "R-Defense-WallUpgrade01",
];
const mis_pinkScavResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Cannon-Damage02",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];
const mis_redScavResearch = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02", "R-Wpn-Flamer-ROF01",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF01",
	"R-Wpn-Cannon-ROF01", "R-Vehicle-Metals01", "R-Wpn-Flamer-Damage02",
	"R-Defense-WallUpgrade01", "R-Struc-Materials01",
];

// The chances of a helicopter actually using this is incredibly low
// but we should still have this
camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", MIS_RED_SCAVS);
});

// Extra transport units are only awarded to those who start from the menu.
// Otherwise a player can just bring in units from the Prologue.
function sendPlayerTransporter()
{
	// The transport contents are always the same:
	const firstTransportDroids = [ // 4 Trucks, 4 Light Cannons, 2 Repair Turrets
		cTempl.truck, cTempl.truck, cTempl.truck, cTempl.truck,
		cTempl.pllcanw, cTempl.pllcanw, cTempl.pllcanw, cTempl.pllcanw,
		cTempl.pllrepw, cTempl.pllrepw,
	];
	camSendReinforcement(CAM_HUMAN_PLAYER, camMakePos("landingZone"), firstTransportDroids,
		CAM_REINFORCE_TRANSPORT, {
			entry: transportEntryPos,
			exit: transportEntryPos
		}
	);
}

function heliAttack()
{
	// Focus towards the player's LZ
	const ext = {
		limit: 1,
		targetPlayer: CAM_HUMAN_PLAYER,
		pos: camMakePos("landingZone")
	};
	camSetVtolData(MIS_RED_SCAVS, "heliAttackPos", "heliRemoveZone", [cTempl.helpod], camChangeOnDiff(camMinutesToMilliseconds(3)), "heliTower", ext);
}

// Start moving scavenger patrol groups
function groupPatrol()
{
	camManageGroup(camMakeGroup("orangePatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("orangePatrolPos1"),
			camMakePos("orangePatrolPos2")
		],
		interval: camSecondsToMilliseconds(15)
	});

	camManageGroup(camMakeGroup("pinkPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("pinkPatrolPos1"),
			camMakePos("pinkPatrolPos2"),
			camMakePos("pinkAssemblyPosPos1")
		],
		interval: camSecondsToMilliseconds(20)
	});

	camManageGroup(camMakeGroup("redPatrolGroup"), CAM_ORDER_PATROL, {
		pos: [
			camMakePos("redPatrolPos1"),
			camMakePos("redPatrolPos2"),
			camMakePos("redPatrolPos3")
		],
		interval: camSecondsToMilliseconds(20)
	});
}

//Gives starting tech and research.
function grantPlayerTech()
{
	for (let x = 0, l = camBasicStructs.length; x < l; ++x)
	{
		enableStructure(camBasicStructs[x], CAM_HUMAN_PLAYER);
	}

	camCompleteRequiredResearch(camRec2StartResearch, CAM_HUMAN_PLAYER);
}

// Get some higher rank droids.
function setUnitRank(transport)
{
	const rank = (firstTransportLanded) ? "Trained" : "Regular";

	if (transport)
	{
		camSetDroidRank(enumCargo(transport), rank);
	}
}

// Bump the rank of the first batch of transport droids (if starting from the menu).
function eventTransporterLanded(transport)
{
	if (transport.player === CAM_HUMAN_PLAYER)
	{
		if (!firstTransportLanded)
		{
			setUnitRank(transport);
			queue("ambushLZ", camSecondsToMilliseconds(4));
			firstTransportLanded = true;
		}
		else if (startedFromMenu)
		{
			// Only grant more exp if starting from the menu
			setUnitRank(transport);
		}
	}
}

// Start the LZ "ambush" that shows the scavengers fighting each other
function ambushLZ()
{
	// Orange group that attacks the LZ
	camManageGroup(camMakeGroup("orangeAmbushGroup"), CAM_ORDER_ATTACK, {
		pos: camMakePos("landingZone"),
		morale: 40,
		fallback: camMakePos("orangeAssemblyPos1")
	});

	// Pink group that fights the orange group
	camManageGroup(camMakeGroup("pinkAmbushGroup"), CAM_ORDER_ATTACK, {
		targetPlayer: MIS_ORANGE_SCAVS,
		pos: camMakePos("orangeScavBase2"),
		radius: 8
	});

	// Dialogue about scavenger encampments...
	camQueueDialogue([
		{text: "LIEUTENANT: Sir, we have confirmed reports of scavengers in our AO.", delay: 8, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Multiple encampments within close proximity of several LZs.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I suppose that's to be expected.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: This city used to hold millions, after all.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: All Commanders be advised; the Council has authorized the use of lethal force.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Remember that our primary objective is to secure NASDA Central.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Use whatever means necessary to achieve it.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Let the orange scavs start attacking the player
function orangeAggro()
{
	if (orangeAggrod)
	{
		return; // Already done
	}

	// Set the second orange factory to attack the player (if it still exists)
	camSetFactories({
		"orangeFactory2": {
			assembly: "orangeAssemblyPos2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.bloke, cTempl.bjeep, cTempl.bloke, cTempl.gbjeep ]
		}
	});

	// Enable both orange factories
	camEnableFactory("orangeFactory1");
	camEnableFactory("orangeFactory2");
	orangeAggrod = true;

	camCallOnce("scavDialogue");
}

// Let the pink scavs start attacking the player
function pinkAggro()
{
	if (pinkAggrod)
	{
		return; // Already done
	}

	// Set the third pink factory to attack the player (if it still exists)
	camSetFactories({
		"pinkFactory3": {
			assembly: "pinkAssemblyPos3",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(26)),
			templates: [ cTempl.rbuggy, cTempl.trike, cTempl.bloke, cTempl.lance, cTempl.monhmg ]
		}
	});

	// Enable all pink factories
	camEnableFactory("pinkFactory1");
	camEnableFactory("pinkFactory2");
	camEnableFactory("pinkFactory3");
	pinkAggrod = true;

	camCallOnce("scavDialogue");
}

// Let the red scavs start attacking the player
// NOTE: The red scavenger helicopters are triggered separately
function redAggro()
{
	if (redAggrod)
	{
		return; // Already done
	}

	// Enable both red factories
	camEnableFactory("redFactory1");
	camEnableFactory("redFactory2");
	redAggrod = true;
}

// More dialogue about scavengers
function scavDialogue()
{
	// Dialogue about scavenger encampments...
	camQueueDialogue([
		{text: "LIEUTENANT: Sir, we're encountering more scavengers as we settle our forces in.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: It seems that far more people survived the Collapse here than we predicted.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: I wonder...", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: ...Have these guys been fighting each other this whole time?", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Hmm...", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: These scavengers could complicate our mission.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Lieutenant, as soon as possible, I want reconnaissance on NASDA Central.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Find out what we'll be dealing with when we move to capture it.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: I don't want any surprises this time.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Understood, sir.", delay: 3, sound: CAM_RCLICK},
	]);
}

// Aggro the corresponding scavs early if one of these bases is elminated
function camEnemyBaseEliminated_orangeNWBase()
{
	camCallOnce("orangeAggro");
}

function camEnemyBaseEliminated_orangeNorthBase()
{
	camCallOnce("orangeAggro");
}

function camEnemyBaseEliminated_orangeCraterOutpost()
{
	camCallOnce("orangeAggro");
}

function camEnemyBaseEliminated_pinkWestBase()
{
	camCallOnce("pinkAggro");
}

function camEnemyBaseEliminated_pinkCentralBase()
{
	camCallOnce("pinkAggro");
}

function camEnemyBaseEliminated_pinkEastBase()
{
	camCallOnce("pinkAggro");
}

// Aggro the red scavs early if the player attacks them
function eventAttacked(victim, attacker) 
{
	if (!camDef(victim) || !camDef(attacker))
	{
		return;
	}

	if (victim.player == MIS_RED_SCAVS && attacker.player == CAM_HUMAN_PLAYER)
	{
		camCallOnce("redAggro");
	}
}

// Allow the player to change to colors that are hard-coded to be unselectable
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
	adaptScavColors();
	playSound("beep6.ogg");
}

function adaptScavColors()
{
	// Make sure the scavengers aren't choosing conflicting colors with the player
	changePlayerColour(MIS_ORANGE_SCAVS, (playerColour !== 1) ? 1 : 8); // Set to orange or yellow
	changePlayerColour(MIS_PINK_SCAVS, (playerColour !== 6) ? 6 : 5); // Set to pink or blue
	changePlayerColour(MIS_RED_SCAVS, (playerColour !== 4) ? 4 : 13); // Set to red or infrared
}

function eventStartLevel()
{
	const PLAYER_POWER = 3000;
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A1L2S");

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	startTransporterEntry(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);
	setTransporterExit(transportEntryPos.x, transportEntryPos.y, CAM_HUMAN_PLAYER);

	playerColour = playerData[0].colour;
	adaptScavColors();

	camSetArtifacts({
		"orangeFactory1": { tech: "R-Wpn-Mortar-ROF01" }, // Mortar Autoloader
		"redFactory2": { tech: "R-Wpn-Flamer-Damage02" }, // High Temperature Flamer Gel Mk2
	});

	setPower(camChangeOnDiff(PLAYER_POWER), CAM_HUMAN_PLAYER);
	grantPlayerTech();
	camCompleteRequiredResearch(mis_orangeScavResearch, MIS_ORANGE_SCAVS);
	camCompleteRequiredResearch(mis_pinkScavResearch, MIS_PINK_SCAVS);
	camCompleteRequiredResearch(mis_redScavResearch, MIS_RED_SCAVS);

	camSetEnemyBases({
		"orangeNWBase": {
			cleanup: "orangeScavBase1",
			detectMsg: "OSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"orangeNorthBase": {
			cleanup: "orangeScavBase2",
			detectMsg: "OSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"orangeCraterOutpost": {
			cleanup: "orangeScavBase3",
			detectMsg: "OSCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated,
		},
		"pinkWestBase": {
			cleanup: "pinkScavBase1",
			detectMsg: "PSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"pinkCentralBase": {
			cleanup: "pinkScavBase2",
			detectMsg: "PSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"pinkEastBase": {
			cleanup: "pinkScavBase3",
			detectMsg: "PSCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"redSWBase": {
			cleanup: "redScavBase1",
			detectMsg: "RSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
		"redSEBase": {
			cleanup: "redScavBase2",
			detectMsg: "RSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated,
		},
	});

	camSetFactories({
		"orangeFactory1": {
			assembly: "orangeAssemblyPos1",
			order: CAM_ORDER_ATTACK,
			data: {
				// It's important to set a specific target here because all the scavs are hostile to each other
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.buscan, cTempl.bjeep, cTempl.gbjeep, cTempl.gbjeep ]
		},
		"orangeFactory2": {
			assembly: "orangeAssemblyPos2",
			order: CAM_ORDER_ATTACK,
			data: {
				// Targets pink scavengers at the start
				targetPlayer: MIS_PINK_SCAVS,
				pos: camMakePos("pinkScavBase3"),
				radius: 8
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(32)),
			templates: [ cTempl.bloke, cTempl.bjeep, cTempl.bloke, cTempl.gbjeep ]
		},
		"pinkFactory1": {
			assembly: "pinkAssemblyPos1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 6,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(18)),
			templates: [ cTempl.bloke, cTempl.lance, cTempl.rbuggy, cTempl.lance, cTempl.bloke ]
		},
		"pinkFactory2": {
			assembly: "pinkAssemblyPos2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 5,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.moncan, cTempl.trike, cTempl.bloke, cTempl.buscan, cTempl.buggy ]
		},
		"pinkFactory3": {
			assembly: "pinkAssemblyPos3",
			order: CAM_ORDER_ATTACK,
			data: {
				// Targets orange scavengers at the start
				targetPlayer: MIS_ORANGE_SCAVS,
				pos: camMakePos("orangeScavBase2"),
				radius: 8
			},
			groupSize: 3,
			maxSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(36)),
			templates: [ cTempl.rbuggy, cTempl.trike, cTempl.bloke, cTempl.lance, cTempl.monhmg ]
		},
		"redFactory1": {
			assembly: "redAssemblyPos1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.minitruck, cTempl.kevlance, cTempl.firetruck, cTempl.bjeep, cTempl.firetruck ]
		},
		"redFactory2": {
			assembly: "redAssemblyPos2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(24)),
			templates: [ cTempl.flatmrl, cTempl.sartruck, cTempl.bjeep, cTempl.rbjeep, cTempl.firetruck ]
		},
	});

	if (tweakOptions.rec_timerlessMode)
	{
		// Timerless mode disables the mission time limit on *almost* every mission.
		// To balance this, the player's max power is severely limited and enemies rebuild stuff more frequently.
		// This is to discourage the player from just mindlessly waiting around accumulating resources or "grinding" enemies down over time through sheer attrition.
		// This is pretty similar to how Fractured Kingdom is balanced without a timer.
		// Also note that the player's power reserves are completely refilled between missions, so there's no point in loitering around purely for resources.

		// If we're in Timerless mode, set up scavenger Cranes instead of adding a timer
		switch (difficulty)
		{
			case INSANE:
				// Cranes for the easternmost orange and pink bases
				camManageTrucks(
					MIS_ORANGE_SCAVS, {
						label: "orangeNorthBase", // Label of base to rebuild/maintain
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane, // Scavenger Crane unit exclusive to Timerless mode
						structset: camAreaToStructSet("orangeScavBase2")
				});
				camManageTrucks(
					MIS_PINK_SCAVS, {
						label: "pinkEastBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("pinkScavBase3")
				});
			case HARD: // NOTE: Fall-through here! We still add Cranes from lower difficulties!
				// Cranes for the westernmost scav bases
				camManageTrucks(
					MIS_ORANGE_SCAVS, {
						label: "orangeNWBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("orangeScavBase1")
				});
				camManageTrucks(
					MIS_PINK_SCAVS, {
						label: "pinkWestBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("pinkScavBase1")
				});
				camManageTrucks(
					MIS_RED_SCAVS, {
						label: "redSWBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("redScavBase1")
				});
			case MEDIUM:
				// Crane for the central pink base
				camManageTrucks(
					MIS_PINK_SCAVS, {
						label: "pinkCentralBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("pinkScavBase2")
				});
			default:
				// Crane for the final red base
				camManageTrucks(
					MIS_RED_SCAVS, {
						label: "redSEBase",
						rebuildBase: true,
						respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(70)),
						template: cTempl.crane,
						structset: camAreaToStructSet("redScavBase2")
				});
		}
	}
	else
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(1)));
	}

	startedFromMenu = false;
	if (!getResearch("R-Script-ProloguePlayed", CAM_HUMAN_PLAYER).done)
	{
		// Player started from the menu
		startedFromMenu = true;

		// Total units (not including the first transport):
		// 4 Machinegunner Cyborgs
		// 4 Sarissas
		// 2 Repair Turrets
		// 6 Flamer Cyborgs
		// 4 Twin Machineguns
		const droids = [
			cTempl.cybmg, cTempl.cybmg, cTempl.cybmg, cTempl.cybmg,
			cTempl.pllsart, cTempl.pllsart, cTempl.pllsart, cTempl.pllsart,
			cTempl.pllrepw, cTempl.pllrepw,
			cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl, cTempl.cybfl,
			cTempl.plltmgt, cTempl.plltmgt, cTempl.plltmgt, cTempl.plltmgt,
		];
		// Store units "offworld" so that the player can bring them in via transport.
		for (const template of droids)
		{
			// Create the droid
			camAddDroid(CAM_HUMAN_PLAYER, -1, template);
			// NOTE: We can't give the offworld droid XP here, since the scripting API can't find it.
			// Instead, we'll grant XP when the transport drops it off.
		}

		// Also grant research from the prologue
		camCompleteRequiredResearch(camRec2PrologueResearch, CAM_HUMAN_PLAYER);

		// Place the MRA artifact...
		camAddArtifact({"redMiniPit": { tech: "R-Wpn-Rocket02-MRL" }}); // Mini-Rocket Array
	}
	else // Played through the prologue...
	{
		if (!camResearchIsAvailable("R-Wpn-Rocket-LtA-TMk1") && !getResearch("R-Wpn-Rocket-LtA-TMk1").done)
		{
			// The player didn't find the Sarissa in the prologue...
			camAddArtifact({"redFactory1": { tech: "R-Wpn-Rocket-LtA-TMk1" }}); // Sarissa
		}
		if (!camResearchIsAvailable("R-Wpn-Rocket02-MRL") && !getResearch("R-Wpn-Rocket02-MRL").done)
		{
			// The player didn't find the MRA in the prologue...
			camAddArtifact({"redMiniPit": { tech: "R-Wpn-Rocket02-MRL" }}); // Mini-Rocket Array
		}

		// In case the player skipped the end of P2 through Debug Mode
		camCompleteRequiredResearch(["R-Script-InfSensor-Debuff-Undo"], CAM_INFESTED);
	}

	sendPlayerTransporter();
	setReinforcementTime(camMinutesToSeconds(1.5)); // 1.5 minutes

	camAutoReplaceObjectLabel("heliTower");
	camDisableInfAutoManagement(); // MIS_ORANGE_SCAVS uses the same player number as CAM_INFESTED

	orangeAggrod = false;
	pinkAggrod = false;
	redAggrod = false;
	firstTransportLanded = false;
	camEnableFactory("orangeFactory2");
	camEnableFactory("pinkFactory3");

	queue("groupPatrol", camChangeOnDiff(camMinutesToMilliseconds(0.5)));
	queue("orangeAggro", camChangeOnDiff(camMinutesToMilliseconds(8)));
	queue("pinkAggro", camChangeOnDiff(camMinutesToMilliseconds(12)));
	queue("redAggro", camChangeOnDiff(camMinutesToMilliseconds(16)));
	queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(16)));

	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the fog to 1/4 default brightness
	camSetFog(4, 4, 16);
	// Darken the lighting and add a slight blue hue
	camSetSunIntensity(.4, .4, .5);

	// Give player briefing.
	camPlayVideos({video: "A1L1_BRIEF", type: MISS_MSG});
}