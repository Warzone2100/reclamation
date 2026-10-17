include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

const mis_scavRes = [
	"R-Wpn-Flamer-Damage01", "R-Wpn-Cannon-Damage01",
];

// Player values
const MIS_NASDA = 1; // NASDA Base
const MIS_CYAN_SCAVS = 2; // Cyan Scavengers
const MIS_YELLOW_SCAVS = 3; // Yellow Scavengers

// Whether the player has been detected by either of the scavenger factions
var playerCyanDetected;
var playerYellowDetected;
// Whether the player can use the chat to change colors, disabled when capturing the NASDA base.
var allowColourChange;
// Changing the player's colour only updates playerData after save-loading or level progression.
// This variable is to make sure the transport correctly matches the player's colour on this level.
var playerColour;

// Damage NASDA structures
function preDamageNasdaStructs()
{
	const structures = enumStruct(MIS_NASDA);

	for (let i = 0; i < structures.length; ++i)
	{
		const struc = structures[i];
		// 60% to 90% base HP
		setHealth(struc, 60 + camRand(31));
	}
}

// This triggers when the player moves a droid into the NASDA base
camAreaEvent("captureZone", function(droid)
{
	// Give the player some power
	setPower(camChangeOnDiff(1000), CAM_HUMAN_PLAYER);

	camAbsorbPlayer(MIS_NASDA, CAM_HUMAN_PLAYER); // Give NASDA base to player
	changePlayerColour(MIS_NASDA, playerColour); // NASDA Base to player's colour

	const lz = getObject("LZ");
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER); // Set up LZ

	camCallOnce("sendPlayerTransporter"); // Call in a truck transporter

	enableResearch("R-Sys-Engineering01", CAM_HUMAN_PLAYER); // "Find" Engineering upgrade in Research Facility

	queue("researchFlash", camSecondsToMilliseconds(1));

	// Tell the player to use the inbound trucks
	camQueueDialogue([
		{text: "CLAYDE: Well done, Commander.", delay: 0, sound: CAM_RCLICK},
		{text: "CLAYDE: I'm sure the Council will be pleased to know of our success.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: I've dispatched a transport with trucks to your position.", delay: 4, sound: CAM_RCLICK},
		{text: "CLAYDE: Use them to get this base up and running as soon as possible.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Make sure to construct a generator and", delay: 4, sound: CAM_RCLICK},
		{text: "investigate that research facility for anything useful.", delay: 0},
	]);

	// Activate scavenger factories after a 35 second delay
	queue("expandMap", camSecondsToMilliseconds(35));

	// Remove the beacon over the NASDA base
	hackRemoveMessage("NASDA_BASE", PROX_MSG, CAM_HUMAN_PLAYER);

	// Re-damage the NASDA base (because apparently donating structures resets health)
	queue("reDamageNasdaStructs", camSecondsToMilliseconds(0.25));

	// Don't let the player change colors anymore
	allowColourChange = false;
});

// Damage NASDA structures again (because apparently donating structures resets health)
function reDamageNasdaStructs()
{
	const structures = enumStruct(CAM_HUMAN_PLAYER);

	for (let i = 0; i < structures.length; ++i)
	{
		const struc = structures[i];
		// 60% to 90% base HP
		setHealth(struc, 60 + camRand(31));
	}
}

// Make the research button flash
function researchFlash()
{
	setReticuleFlash(2, true);
}

// This triggers when the player moves a droid into river town area
camAreaEvent("townMsg", function(droid)
{
	// Only trigger if the player move a droid in
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// Tell the player about the scavengers fighting in the town
		camQueueDialogue([
			{text: "CLAYDE: Look how this small town has been torn apart by these warring gangs...", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: If we succeed in our goal, we can bring an end to all this chaos.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: We will build a new world.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: A better world.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: But for now...", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: These scavengers only serve to stand in our way.", delay: 3, sound: CAM_RCLICK},
		]);
	}
	else
	{
		resetLabel("townMsg", CAM_HUMAN_PLAYER);
	}
});

function expandMap()
{
	// Reveal the whole map.
	setScrollLimits(0, 0, 64, 64);

	// Set up victory conditions (kill everything... you know, the usual)
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "L2S", {
		callback: "checkMissileSilos"
	});

	if (tweakOptions.rec_timerlessMode)
	{
		if (difficulty >= HARD)
		{
			// Crane for the cyan scav bases
			// NOTE: The player doesn't really have any effective anti-structure weapons at this point, so we're being nice with the Cranes for now...
			camManageTrucks(
				MIS_CYAN_SCAVS, {
					label: "CyanBase",
					rebuildBase: false,
					respawnDelay: camChangeOnDiff(camSecondsToMilliseconds(120)),
					template: cTempl.crane,
					structset: camAreaToStructSet("cScavBase3")
			});
		}
	}
	else
	{
		setMissionTime(camMinutesToSeconds(60)); // Set mission timer to 60 minutes
	}

	camSetExtraObjectiveMessage(_("Defend the missile silos"));

	// Enable scavenger factories (leaving out the second yellow scav factory for now)
	camEnableFactory("yScavFactory1");
	camEnableFactory("cScavFactory");

	// The player will automatically be detected after some time 
	setTimer("yScavPlayerDetected", camMinutesToMilliseconds(8));
	setTimer("cScavPlayerDetected", camMinutesToMilliseconds(12));

	// Tell the player to go and kill all the scavs
	// (and defend the base)
	camPlayVideos({video: "L1_SCAVMSG", type: MISS_MSG});

	// Hack to prevent the south half of the map from being dark after the expansion
	camSetSunPos(-225.0, -601.0, 450.0); // Move the sun just a wee bit
}

// This is used to start make scavengers "detect" the player once they're attacked
function eventDestroyed(obj)
{
	if (obj.type !== STRUCTURE)
	{
		return; // Only care about structures
	}

	// NOTE: This assumes that the scavengers will not destroy eachother's structures before the player gets involved!
	if (obj.player === MIS_CYAN_SCAVS && !playerCyanDetected)
	{
		camCallOnce("cScavDetectCountdown");
	}
	else if (obj.player === MIS_YELLOW_SCAVS && !playerYellowDetected)
	{
		camCallOnce("yScavDetectCountdown");
	}
}

// Give the landed trucks to the player
function eventTransporterLanded(transport)
{
	// Count all "NASDA" units
	const units = enumDroid(MIS_NASDA);

	for (let i = 0, len = units.length; i < len; i++)
	{
		const droid = units[i];
		if (!camIsTransporter(droid)) // Give every unit that isn't a transport
		{
			donateObject(droid, CAM_HUMAN_PLAYER);
		}
	}
}

// Overwrite the long detection timers with much shorter ones.
// This happens if any scavengers are attacked by the player.
function cScavDetectCountdown()
{
	removeTimer("cScavPlayerDetected");
	setTimer("cScavPlayerDetected", camSecondsToMilliseconds(30));
}

function yScavDetectCountdown()
{
	removeTimer("yScavPlayerDetected");
	setTimer("yScavPlayerDetected", camSecondsToMilliseconds(30));
}

// The player has been detected by the yellow scavengers:
function yScavPlayerDetected()
{
	removeTimer("yScavPlayerDetected");
	playerYellowDetected = true;

	// Tell the player that they've been detected if they haven't already recieved a message before.
	if (!playerCyanDetected)
	{
		// camSetFactories({"cScavFactory": {}}); // Clears factory data (disabling the factory)

		camQueueDialogue([
			{text: "CLAYDE: Commander, we've been monitoring scavenger radio transmissions from your area.", delay: 0, sound: CAM_RCLICK},
			{text: "CLAYDE: It would appear that some of the scavengers near you are now aware of your presence.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: If their chatter is anything to go by, it looks like they're preparing to retaliate.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Be ready to defend our base.", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: Do not allow them to compromise the mission!", delay: 2, sound: CAM_RCLICK},
		]);
	}

	// Set the first yellow factory to attack the player (if it still exists)
	camSetFactories({
		"yScavFactory1": {
			assembly: "yScavAssembly1",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ cTempl.trike, cTempl.bloke ]
		}
	});

	// Enable both yellow factories
	camEnableFactory("yScavFactory1");
	camEnableFactory("yScavFactory2");
}

// The player has been detected by the cyan scavengers:
function cScavPlayerDetected()
{
	removeTimer("cScavPlayerDetected");
	playerCyanDetected = true;

	// Tell the player that they've been detected if they haven't already recieved a message before.
	if (!playerYellowDetected)
	{
		// camSetFactories({"yScavFactory1": {}}); // Clears factory data (disabling the factory)

		camQueueDialogue([
			{text: "CLAYDE: Commander, we've been monitoring scavenger radio chatter from your area.", delay: 0, sound: CAM_RCLICK},
			{text: "CLAYDE: It would appear that some of the scavengers near you are now aware of your presence.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: If their chatter is anything to go by, it looks like they're preparing to retaliate.", delay: 3, sound: CAM_RCLICK},
			{text: "CLAYDE: Be ready to defend our base.", delay: 4, sound: CAM_RCLICK},
			{text: "CLAYDE: Do not allow them to compromise the mission!", delay: 2, sound: CAM_RCLICK},
		]);
	}

	// Set the cyan factory to attack the player (if it still exists)
	const templates = [cTempl.bjeep, cTempl.bloke, cTempl.rbjeep];
	if (difficulty <= HARD)
	{
		templates.push(cTempl.bloke);
	}
	else
	{
		// Add a kevlar bloke on Hard+
		templates.push(cTempl.kevbloke);
	}
	camSetFactories({
		"cScavFactory": {
			assembly: "cScavAssembly",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 4,
			maxSize: 8,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(13)),
			templates: templates
		},
	});

	// Enable the cyan factory
	camEnableFactory("cScavFactory");
}

// This triggers when the player moves a droid near the east wall
camAreaEvent("wallMsg", function(droid)
{
	// Tell the player to break through the wall
	camQueueDialogue([
		{text: "CLAYDE: You're almost there now, Commander.", delay: 0, sound: CAM_RCLICK},
		{text: "CLAYDE: This appears to be the base's eastern wall.", delay: 2, sound: CAM_RCLICK},
		{text: "CLAYDE: Use your weapons to bring it down.", delay: 3, sound: CAM_RCLICK},
		{text: "CLAYDE: Then move inside and secure the area.", delay: 2, sound: CAM_RCLICK}
	]);
});

function sendPlayerTransporter()
{
	const trucks = [cTempl.truck, cTempl.truck, cTempl.truck, cTempl.truck]; // 4 trucks

	camSendReinforcement(MIS_NASDA, camMakePos("LZ"), trucks,
		CAM_REINFORCE_TRANSPORT, {
			entry: { x: 2, y: 2 },
			exit: { x: 2, y: 2 }
		}
	);
}

function enableBaseStructures()
{
	for (let i = 0; i < camBasicStructs.length; ++i)
	{
		enableStructure(camBasicStructs[i], CAM_HUMAN_PLAYER);
	}
}

// Check to make sure at least 1 silo still exists.
function checkMissileSilos()
{
	if (!countStruct("NX-CruiseSite", CAM_HUMAN_PLAYER))
	{
		return false;
	}
	else
		return true;
}

// Stop refilling the central groups once the player is detected
function allowCentralRefilling()
{
	return (!playerCyanDetected && !playerYellowDetected);
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

	if (allowColourChange) // Only let the player change colors before capturing the NASDA base.
	{
		playerColour = colour;
		changePlayerColour(CAM_HUMAN_PLAYER, colour);

		// Make sure the scavengers aren't choosing conflicting colours with the player
		if (colour === 7)
		{
			changePlayerColour(MIS_CYAN_SCAVS, 12); // Switch to neon green
		}
		else
		{
			changePlayerColour(MIS_CYAN_SCAVS, 7); // Keep as cyan
		}

		if (colour === 8)
		{
			changePlayerColour(MIS_YELLOW_SCAVS, 1); // Switch to orange
		}
		else
		{
			changePlayerColour(MIS_YELLOW_SCAVS, 8); // Keep as yellow
		}

		playSound("beep6.ogg");
	}
	else
	{
		playSound("beep8.ogg");
	}	
}

function eventStartLevel()
{
	playerColour = playerData[0].colour;

	// Make sure the scavengers aren't choosing conflicting colours with the player
	if (playerColour !== 7)
	{
		changePlayerColour(MIS_CYAN_SCAVS, 7); // Primary scavengers to cyan
	}
	else
	{
		changePlayerColour(MIS_CYAN_SCAVS, 12); // Switch to neon green if player is already cyan
	}

	if (playerColour !== 8)
	{
		changePlayerColour(MIS_YELLOW_SCAVS, 8); // Secondary scavengers to yellow
	}
	else
	{
		changePlayerColour(MIS_YELLOW_SCAVS, 1); // Switch to orange if player is already yellow
	}
	changePlayerColour(MIS_NASDA, 10); // NASDA Base to white (it doesn't really matter if the player is already white)

	// Make extra sure no one attacks the base before it's captured 
	setAlliance(MIS_CYAN_SCAVS, MIS_NASDA, true);
	setAlliance(MIS_YELLOW_SCAVS, MIS_NASDA, true);
	setAlliance(CAM_HUMAN_PLAYER, MIS_NASDA, true);

	// Restrict the map for now.
	setScrollLimits(0, 0, 64, 30);

	// Temporary conditions...
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "L2S", {
		defeatOnDeath: false, // The player doesn't start with any trucks
	});

	const startpos = getObject("startPosition");
	centreView(startpos.x, startpos.y);

	enableBaseStructures(); // Allow the player to build base structures (Command Center, Factory, etc.)
	camCompleteRequiredResearch(camRec1StartResearch, CAM_HUMAN_PLAYER); // Give starting tech
	camCompleteRequiredResearch(mis_scavRes, MIS_CYAN_SCAVS); // Give scavengers weapon upgrades
	camCompleteRequiredResearch(mis_scavRes, MIS_YELLOW_SCAVS);

	// Give player briefing.
	camPlayVideos({video: "L1_BRIEF", type: MISS_MSG});

	// Set artifact placement
	camSetArtifacts({
		// "yScavFactory1": { tech: "R-Wpn-MG-Damage01" }, // Hardened MG Bullets
		"yScavFactory2": { tech: "R-Wpn-Rocket05-MiniPod" }, // Mini-Rocket Pod
		"cScavFactory": { tech: "R-Vehicle-Prop-Tracks" }, // Tracked Propulsion
		"cScavSensor": { tech: "R-Sys-Sensor-Turret01" }, // Sensor Turret
	});

	// Set up bases
	camSetEnemyBases({
		"SensorOutpost": {
			cleanup: "cScavBase1",
			detectMsg: "CSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"BridgeDefences": {
			cleanup: "cScavBase2",
			detectMsg: "CSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerOutpostDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerOutpostEradicated
		},
		"CyanBase": {
			cleanup: "cScavBase3",
			detectMsg: "CSCAV_BASE3",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"GasStation": {
			cleanup: "yScavBase1",
			detectMsg: "YSCAV_BASE1",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
		"YellowBase": {
			cleanup: "yScavBase2",
			detectMsg: "YSCAV_BASE2",
			detectSnd: cam_sounds.baseDetection.scavengerBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.scavengerBaseEradicated
		},
	});

	// Set up factories
	camSetFactories({
		"yScavFactory1": {
			assembly: "yScavAssembly1",
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("scavPatrol1"),
					camMakePos("scavPatrol2"),
				],
			},
			groupSize: 3,
			maxSize: 3,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			templates: [ ] // Empty; we just need this factory to refill a group for now
		},
		// This factory only activates when the player is detected
		"yScavFactory2": {
			assembly: "yScavAssembly2",
			order: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER
			},
			groupSize: 4,
			maxSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(16)),
			templates: [ cTempl.bloke, cTempl.trike, cTempl.bloke, cTempl.buggy ]
		},
		"cScavFactory": {
			assembly: "cScavAssembly",
			order: CAM_ORDER_PATROL,
			data: {
				pos: [
					camMakePos("scavPatrol1"),
					camMakePos("scavPatrol2"),
				],
			},
			groupSize: 4,
			maxSize: 4,
			throttle: camChangeOnDiff(camSecondsToMilliseconds(20)),
			templates: [ ] // Empty; we just need this factory to refill a group for now
		},
	});

	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.trike, cTempl.bloke,
				cTempl.bloke, cTempl.trike,
			],
			factories: ["yScavFactory1"],
			callback: "allowCentralRefilling" // Stop refilling the central groups once the player is detected
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("scavPatrol1"),
				camMakePos("scavPatrol2"),
			]
	});

	camMakeRefillableGroup(
		undefined, {
			templates: [
				cTempl.bjeep, cTempl.bloke, cTempl.bloke,
				cTempl.bjeep, cTempl.bloke, cTempl.bloke,
			],
			factories: ["cScavFactory"],
			callback: "allowCentralRefilling"
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("scavPatrol1"),
				camMakePos("scavPatrol2"),
			]
	});

	playerCyanDetected = false;
	playerYellowDetected = false;
	allowColourChange = true;

	// Place a beacon on the NASDA base
	hackAddMessage("NASDA_BASE", PROX_MSG, CAM_HUMAN_PLAYER);

	// Set the sky to night
	camSetSkyType(CAM_SKY_NIGHT);
	// Darken the lighting somewhat
	camSetSunIntensity(.4,.4,.4);
	// Darken the fog to 1/4 default brightness
	camSetFog(45, 56, 59);
	// Move the sun to the east
	camSetSunPos(-225.0, -600.0, 450.0);
	// Make it snow constantly
	camSetWeather(CAM_WEATHER_SNOWSTORM);


	// All NASDA structures start out partially damaged
	preDamageNasdaStructs();

	// Replace the scav's sensor tower with its rusty version
	camUpgradeOnMapStructures("Sys-SensoTower01", "Sys-RustSensoTower01", MIS_CYAN_SCAVS);
}
