include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

// Player values
const CIVILIANS = 1; // Used for civilian groups
const TRANSPORT = 2; // Used for the transport that comes to pick them up

var numWaves = 0; // How many infested attack waves have occured
var phaseTwo = false; // Spawning behaviour changes at 10 minutes remaining
var killSweepY = 30; // The height of the area where everything dies at the end of the level

var detonateInfo;

const INFESTED_RES = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Vehicle-Metals01", "R-Struc-Materials01", "R-Defense-WallUpgrade01",
];

// Damage infested reinforcements
function preDamageInfestedGroup(group)
{
	var units = enumGroup(group);
	for (var i = 0; i < units.length; ++i)
	{
		if (units[i].body !== "CrawlerBody") // Don't damage crawlers
		{
			// 50% to 80% base HP
			setHealth(units[i], 50 + camRand(31));
		}
	}
}

//Remove infested helicopters.
camAreaEvent("heliRemoveZone", function(droid)
{
	if (droid.player !== CAM_HUMAN_PLAYER)
	{
		if (isVTOL(droid))
		{
			camSafeRemoveObject(droid, false);
		}
	}

	resetLabel("heliRemoveZone", INFESTED);
});

// This function is called after a video is played, a delay is required for the 'alert' sound to play properly in all cases
function messageAlert()
{
	playSound("beep7.ogg"); // Play a little noise to notify the player that they have a new message
}

// Play alerts if the player's stuff gets infected by a Vile Stinger
function eventObjectTransfer(obj, from)
{
	if (from === CAM_HUMAN_PLAYER && obj.player === INFESTED)
	{
		if (obj.type === STRUCTURE)
		{
			playSound("pcv623.ogg"); // "Structure Infected"
		}
		else if (obj.type === DROID)
		{
			playSound("pcv624.ogg"); // "Unit Infected"
		}
	}
}

// Transition the level into phase two
// At this point, both ground and air attack waves will stop spawning to give the player some time to reorganize
// This function should always be called around when the timer hits 12 minutes remaining
function startPhaseTwo()
{
	phaseTwo = true;

	// Stop spawning new attacks for now
	removeTimer("infestedAttackWaves");
	camSetVtolSpawnStateAll(false);

	// Queue delivering the message of the big kaboom that's gonna badoom
	queue("detonationMessage", camMinutesToMilliseconds(1));

	// Set up the verbal countdown until detonation
	setTimer("countDown", camSecondsToMilliseconds(0.4));

	// Also queue the return of the infested attacks, but meaner this time
	queue("startAttackWaves", camSecondsToMilliseconds(125));
}

// Give a message and change the objective text
function detonationMessage()
{
	// Stop sending transports
	removeTimer("transportEvac");

	camPlayVideos(["pcv455.ogg", {video: "L7_DETMSG", type: MISS_MSG}]);
	queue("messageAlert", camSecondsToMilliseconds(3.4));
	camSetExtraObjectiveMessage("Defend the missile silos until nuclear detonation");
}

// Play countdown sounds as the timer ticks down
// Also calls the functions that do all the cool stuff at the end
function countDown()
{
	var skip = false;
	var currentTime = getMissionTime();

	for (var i = 0, len = detonateInfo.length; i < len; ++i)
	{
		if (currentTime <= detonateInfo[0].time)
		{
			if (len > 1 && (currentTime <= detonateInfo[1].time))
			{
				skip = true; //Huge time jump?
			}
			if (!skip)
			{
				playSound(detonateInfo[0].sound, CAM_HUMAN_PLAYER);
			}

			detonateInfo.shift();

			break;
		}
	}

	// Get ready for the cool explosions
	if (currentTime < 5)
	{
		camCallOnce("prepareEnding");
	}

	// Start the cool explosions
	if (currentTime < 1)
	{
		camCallOnce("endEffects");
	}
}

// Make preparations for all the cool stuff at the end
// Getting all of this stuff to work is really hacky and I wouldn't be suprised if this code makes someone cry
function prepareEnding()
{
	// Change the win conditions, this basically makes it so the player won't die and the timer won't end the level
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "THE_END");

	// Give everything the player has to the "transport" team
	// This is done so that when everything explodes in a few seconds, the player won't get a bunch of losses reported on the end screen
	// Also it's so the player can sit back and watch the fireworks
	camAbsorbPlayer(CAM_HUMAN_PLAYER, TRANSPORT);

	// Give the player full vision of the map by placing a spotter on the LZ that has an absurdley long radius
	addSpotter(32, 20, 0, 16384, false, 0);

	// Start causing a bunch of tiny explosions around the player's base
	setTimer("smallExplosionFX", camSecondsToMilliseconds(0.3));

	// Move the camera towards the player's base
	cameraSlide(4032, 2624);

	// Force the minimap to be active.
	setMiniMap(true);
}

// Cool explosions and stuff
function endEffects()
{
	// Make a big explosion at the player's base and stop the small ones
	fireWeaponAtLoc("LargeExplosion", 32, 17, CAM_HUMAN_PLAYER);
	removeTimer("smallExplosionFX");

	// Adjust the lighting
	setSunPosition(0, -0.2, -0.3);
	setSunIntensity(0.7, 0.5, 0.5, 1.4, 0.6, 0.6, 1.4, 0.6, 0.6);

	// Procedurally blow up everything on the map
	setTimer("killSweep", camSecondsToMilliseconds(0.3));

	// Stop spawning new attacks waves
	removeTimer("infestedAttackWaves");
	camSetVtolSpawnStateAll(false);

	// Set the fog to it's default colours
	camSetFog(182, 225, 236);
}

// Small explosions effects
function smallExplosionFX()
{
	fireWeaponAtLoc("SmallExplosion", 20 + camRand(26), 15 + camRand(16), CAM_HUMAN_PLAYER);

	// And make sure the minimap stays on.
	setMiniMap(true);
}

// Blow up everything in an area that rapidly grows to cover the whole map
function killSweep()
{
	// First check if we've already hit the end of the map
	// If we have, stop sweeping and queue up the end screen
	if (killSweepY === 128)
	{
		removeTimer("killSweep");
		if (difficulty !== INSANE)
		{
			queue("youWin", camSecondsToMilliseconds(4));
		}
		else
		{
			queue("hintMessage", camSecondsToMilliseconds(4));
			queue("youWin", camSecondsToMilliseconds(12));
		}
	}

	var list = enumArea(1, 1, 64, killSweepY, ALL_PLAYERS, false); // Get everything in the kill zone

	for (var i = 0; i < list.length; i++)
	{
		camSafeRemoveObject(list[i], true); // ... and then blow them up
	}

	// Increase the kill zone area by 2 units south
	killSweepY += 2;
}

// You win.
// Show the ending screen.
function youWin()
{
	camScriptedVictory();
}

// Give a hint on how to do something i guess.
function hintMessage()
{
	camPlayVideos({video: "HINTMSG", type: MISS_MSG});
	queue("messageAlert", camSecondsToMilliseconds(0.2));
}

// Start sending attack waves
function startAttackWaves()
{
	if (!phaseTwo)
	{
		setTimer("infestedAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(40)));
		queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
	}
	else
	{
		setTimer("infestedAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(25)));
		heliAttack();

		// Change the fog colour to a dark purple
		camSetFog(114, 73, 156);
	}
}

// Setup helicopter attacks.
function heliAttack()
{
	var list = [cTempl.infhelcan, cTempl.infhelhmg];
	var ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0
	};

	if (!phaseTwo)
	{
		var heliPositions = [camMakePos("heliSpawn1"), camMakePos("heliSpawn2")];

		// A helicopter will attack the player every minute, flying in from the bottom of the map
		camSetVtolData(INFESTED, heliPositions, "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(1)), undefined, ext);
	}
	else
	{
		// A helicopter will attack the player every 30 seconds, flying in from random locations
		camSetVtolData(INFESTED, undefined, "heliRemoveZone", list, camChangeOnDiff(camSecondsToMilliseconds(30)), undefined, ext);
	}
}

// Infested attack waves progressor
function infestedAttackWaves()
{
	numWaves++;

	/*
		The waves of infested will spawn from the various map "entrances"
		Additional infested waves will gradually spawn closer to the player's base as the level progresses
		The first wave from a new entrance will be comprised of allied civilians
		> Waves 1+ will spawn from the southern city entrance
		> Waves 4+ will spawn additional waves from the southwest city entrance
		> Waves 7+ will spawn additional waves from the southeast mountain entrance
		> Waves 12+ will spawn additional waves from the west marsh entrance
		> Waves 16+ will spawn additional waves from the east industrial entrance
		> Waves 21+ will spawn additional waves from the east road entrance
		> Waves 26+ will spawn additional waves from the west road entrance
		> Waves 30+ will spawn additional waves from the north mountain entrance
	*/

	// Each entrance has it's own "core" unit compositions, with a bunch of Infested Civilians added on top:
	var southCityDroids = [cTempl.stinger, cTempl.stinger, cTempl.infbloke, cTempl.infbloke, cTempl.inflance, cTempl.infbuggy];

	var southWestCityDroids = [cTempl.stinger, cTempl.stinger, cTempl.infbuggy, cTempl.infbuggy, cTempl.infrbuggy, cTempl.inftrike];

	var southEastMountainDroids = [cTempl.inftrike, cTempl.infminitruck, cTempl.infbuggy, cTempl.infmoncan, cTempl.infbuscan, cTempl.inffiretruck];

	var westMarshDroids = [cTempl.infmonhmg, cTempl.infbuscan, cTempl.inffiretruck, cTempl.boomtick, cTempl.infbloke, cTempl.infbjeep];

	var eastIndustryDroids = [cTempl.stinger, cTempl.infmoncan, cTempl.infrbjeep, cTempl.infbuscan, cTempl.inflance, cTempl.infbloke];

	var eastRoadDroids = [cTempl.boomtick, cTempl.infmoncan, cTempl.infrbjeep, cTempl.infsartruck, cTempl.infbloke, cTempl.inffiretruck];

	var westRoadDroids = [cTempl.stinger, cTempl.infbjeep, cTempl.infmonhmg, cTempl.infminitruck, cTempl.infbloke, cTempl.inflance];

	var northMountainDroids = [cTempl.stinger, cTempl.vilestinger, cTempl.infrbjeep, cTempl.stinger, cTempl.inffiretruck];

	// This switch block handles spawning waves of civilians from different entrances
	// Civilians will run towards the LZ for evac by transport
	// They also serve to clue in the player of where the infested are going to attack from next
	if (!phaseTwo)
	{
		switch(numWaves)
		{
			case 1:
				sendCivGroup("southCityEntrance");
				break;
			case 4:
				sendCivGroup("southWestCityEntrance");
				break;
			case 7:
				sendCivGroup("southEastMountainEntrance");
				break;
			case 12:
				sendCivGroup("westMarshEntrance");
				break;
			case 16:
				sendCivGroup("eastIndustryEntrance");
				break;
			case 21:
				sendCivGroup("eastRoadEntrance");
				break;
			case 26:
				sendCivGroup("westRoadEntrance");
				break;
			case 30:
				sendCivGroup("northMountainEntrance");
				break;
		}
	}

	// These ifs handle the spawning of the actual infested units
	if (numWaves > 1)
	{
		sendInfestedGroup("southCityEntrance", southCityDroids);
	}
	if (numWaves > 4)
	{
		sendInfestedGroup("southWestCityEntrance", southWestCityDroids);
	}
	if (numWaves > 7)
	{
		sendInfestedGroup("southEastMountainEntrance", southEastMountainDroids);
	}
	if (numWaves > 12)
	{
		sendInfestedGroup("westMarshEntrance", westMarshDroids);
	}
	if (numWaves > 16)
	{
		sendInfestedGroup("eastIndustryEntrance", eastIndustryDroids);
	}
	if (numWaves > 21)
	{
		sendInfestedGroup("eastRoadEntrance", eastRoadDroids);
	}
	if (numWaves > 26)
	{
		sendInfestedGroup("westRoadEntrance", westRoadDroids);
	}
	if (numWaves > 30)
	{
		sendInfestedGroup("northMountainEntrance", northMountainDroids);
	}
}

// Spawn a group of civilians who will go to the player's LZ
function sendCivGroup(entrance)
{
	var spawnPos = camMakePos(entrance);
	var lz = camMakePos("LZ");

	// Spawn 10 - 16 civilians
	for (var i = 0; i < (10 + camRand(7)); i++)
	{
		addDroid(CIVILIANS, spawnPos.x, spawnPos.y, "Civilian",
		"CivilianBody", "BaBaLegs", "", "", "BabaMG");
	}

	// Order all civilians on the map to move towards the LZ
	var civs = enumDroid(CIVILIANS);
	camManageGroup(camMakeGroup(civs, ALLIES), CAM_ORDER_DEFEND, {
		pos: lz
	});
}

// Spawn a group of infested at a given entrance
function sendInfestedGroup(entrance, droids)
{
	preDamageInfestedGroup(camSendReinforcement(INFESTED, camMakePos(entrance), randomTemplates(droids), CAM_REINFORCE_GROUND, 
		{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
	));
}

// Randomize the provided list of units and tack on a bunch of extra rocket fodder
// Each individual wave is a bit smaller than in L6, to compensate for there being way more of them
// Each wave also has a chance to include an extra Vile Stinger
function randomTemplates(coreUnits)
{
	var i = 0;
	var droids = [];
	var coreSize = 2 + camRand(3); // Maximum of 4 core units.
	var fodderSize = 8 + camRand(5); // 8 - 12 extra Infested Civilians to the swarm.

	for (i = 0; i < coreSize; ++i)
	{
		droids.push(coreUnits[camRand(coreUnits.length)]);
	}

	// Add a bunch of Infested Civilians.
	for (i = 0; i < fodderSize; ++i)
	{
		droids.push(cTempl.infciv);
	}

	// Random chance of adding a Vile Stinger, scales with difficulty
	if (camRand(101) > camChangeOnDiff(80))
	{
		droids.push(cTempl.vilestinger);
	}

	return droids;
}

// Check if there are any civilians near the LZ, if there are go pick them up with a transport
function transportEvac()
{
	var area = getObject("evacZone");
	var civs = enumArea(area.x, area.y, area.x2, area.y2, CIVILIANS, false);

	if (civs.length === 0)
	{
		return; // Don't do anything if there's no civilians at the LZ
	}

	// truck.
	var truck = [cTempl.truck];
	camSendReinforcement(TRANSPORT, camMakePos("LZ"), truck,
		CAM_REINFORCE_TRANSPORT, {
			entry: camMakePos("transporterEntry"),
			exit: camMakePos("transporterExit")
		}
	);
}

// Remove the transport truck and all civilians in the area
function eventTransporterLanded(transport)
{
	// Count all units on the "transport" team (there should only be two)
	var units = enumDroid(TRANSPORT);
	// Then remove the one that ISN'T a transport
	for (var i = 0; i < units.length; i++)
	{
		var droid = units[i];
		if (!camIsTransporter(droid)) // Remove every unit that isn't a transport
		{
			camSafeRemoveObject(droid, false);
		}
	}

	// Get all the civilians in the evac zone and remove them
	var area = getObject("evacZone");
	var civs = enumArea(area.x, area.y, area.x2, area.y2, CIVILIANS, false);
	for (var i = 0; i < civs.length; i++)
	{
		camSafeRemoveObject(civs[i], false);
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

function eventStartLevel()
{
	var startpos = getObject("startPosition");
	var lz = getObject("LZ");

	// Sounds to play before detonation (ripped straight from cam3-1 lol)
	// Lists sound files to play and the time remaining (in seconds) for them to be played
	detonateInfo = [
		{sound: "det10min.ogg", time: camMinutesToSeconds(10)},
		{sound: "det5min.ogg", time: camMinutesToSeconds(5)},
		{sound: "det4min.ogg", time: camMinutesToSeconds(4)},
		{sound: "det3min.ogg", time: camMinutesToSeconds(3)},
		{sound: "det2min.ogg", time: camMinutesToSeconds(2)},
		{sound: "det1min.ogg", time: camMinutesToSeconds(1)},
		{sound: "fdetseq.ogg", time: 20},
		{sound: "10to1.ogg", time: 10},
	];

   	camSetStandardWinLossConditions(CAM_VICTORY_TIMEOUT, "THE_END", {
		callback: "checkMissileSilos"
	});
	camSetExtraObjectiveMessage(["Survive until evacuation", "Defend the missile silos"]);
	setMissionTime(camMinutesToSeconds(30));

	// Setup lz and starting camera
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Give research upgrades to the infested
	camCompleteRequiredResearch(INFESTED_RES, INFESTED); 

	// Set alliances
	setAlliance(TRANSPORT, CAM_HUMAN_PLAYER, true);
	setAlliance(TRANSPORT, CIVILIANS, true);
	setAlliance(CIVILIANS, CAM_HUMAN_PLAYER, true);

	changePlayerColour(TRANSPORT, playerData[0].colour); // Transport to the player's colour
	changePlayerColour(CIVILIANS, 10); // Civilians to white

	// Give player briefing about the incoming infested waves.
	camPlayVideos({video: "L7_BRIEF", type: MISS_MSG});
	queue("messageAlert", camSecondsToMilliseconds(0.2));

	// Set up transport runs to pick up civilians
	setTimer("transportEvac", camMinutesToMilliseconds(2));

	// Give the player a bit to collect themselves
	queue("startAttackWaves", (camChangeOnDiff(camSecondsToMilliseconds(20))));

	// Start phase two when there's 12 minutes remaining
	queue("startPhaseTwo", camMinutesToMilliseconds(18))

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);
}
