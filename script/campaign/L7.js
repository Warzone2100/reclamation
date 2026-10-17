include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");

// Player values
const MIS_CIVILIANS = 1; // Used for civilian groups
const MIS_TRANSPORT = 2; // Used for the transport that comes to pick them up

var numWaves; // How many infested attack waves have occured
var phase; // Spawning behaviour changes at 10 minutes remaining
var killSweepY; // The height of the area where everything dies at the end of the level
var endingBlast;


const mis_infestedRes = [
	"R-Wpn-MG-Damage02", "R-Wpn-Rocket-Damage02",
	"R-Wpn-Mortar-Damage01", "R-Wpn-Flamer-Damage02",
	"R-Wpn-Cannon-Damage02", "R-Wpn-MG-ROF01", "R-Wpn-Rocket-ROF02",
	"R-Wpn-Mortar-ROF01", "R-Wpn-Flamer-ROF02", "R-Wpn-Cannon-ROF02",
	"R-Vehicle-Metals01", "R-Struc-Materials01",
];

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

	resetLabel("heliRemoveZone", CAM_INFESTED);
});

// Transition the level into phase two
// At this point, both ground and air attack waves will stop spawning to give the player some time to reorganize
// This function should always be called around when the timer hits 12 minutes remaining
function startPhaseTwo()
{
	phase = 2;

	// Stop spawning new attacks for now
	removeTimer("infestedAttackWaves");
	camSetVtolSpawnStateAll(false);

	// Stop sending transports
	removeTimer("transportEvac");
	const civs = enumDroid(MIS_CIVILIANS);
	for (const civilian of civs)
	{
		// Quietly remove any remaining civilians on the map
		camSafeRemoveObject(civilian);
	}

	// Queue delivering the message of the big kaboom that's gonna badoom
	queue("startPhaseThree", camMinutesToMilliseconds(6.75));

	// Set up the verbal countdown until detonation
	// setTimer("countDown", camSecondsToMilliseconds(0.4));

	// Also queue the return of the infested attacks, but meaner this time
	queue("startAttackWaves", camSecondsToMilliseconds(125));

	// Play a message assuring the player that they just need to hold on a little longer
	camQueueDialogue([
		{text: "ASSOCIATE: Excellent work, Commander Alpha.", delay: 0, sound: CAM_RCLICK},
		{text: "ASSOCIATE: All civilians and critical personnel are being transported to a safe distance.", delay: 2, sound: CAM_RCLICK},
		{text: "ASSOCIATE: We'll be sending the transports back around for you once they're secured.", delay: 3, sound: CAM_RCLICK},
		{text: "ASSOCIATE: Just hold your position for another few minutes.", delay: 3, sound: CAM_RCLICK},
		{text: "ASSOCIATE: This will all be over soon...", delay: 4, sound: CAM_RCLICK},
	]);
}

// Reveal Clayde's betrayal
// After this point, Infested units will pour in at an absurd rate, but """victory""" is guaranteed.
// The timer will disappear, and the mission will end once the silos are gone
// This function should be called at around 5 minutes remaining
function startPhaseThree()
{
	phase = 3;

	camPlayVideos([cam_sounds.incoming.incomingTransmission, {video: "L7_REVEAL", type: MISS_MSG}]);
	camSetExtraObjectiveMessage();
	// Remove the mission timer
	setMissionTime(-1);

	// Change the win conditions, this basically makes it so the player can't die normally
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, CAM_A0_OUT, {
		defeatOnDeath: false
	});

	// Give one last (very short) break before going absolutely ballistic
	removeTimer("infestedAttackWaves");
	queue("startAttackWaves", camSecondsToMilliseconds(30));

	// Set up a timer for checking if the ending sequence should start
	setTimer("checkEndingStart", camSecondsToMilliseconds(0.4));
}

// Check if the nukes should blow up
function checkEndingStart()
{
	if (!checkMissileSilos())
	{
		// The missile silos are gone...
		removeTimer("checkEndingStart");
		camCallOnce("prepareEnding"); // Start mini-blasts and transfer any remaining player objects
		queue("endEffects", camSecondsToMilliseconds(5)); // Kaboom
	}
}

// Make preparations for all the cool stuff at the end
// Getting all of this stuff to work is really hacky and I wouldn't be surprised if this code makes someone cry
function prepareEnding()
{
	// Give everything the player has to the "transport" team
	// This is done so that when everything explodes in a few seconds, the player get a bunch of messages about "unit lost/under attack"
	// Also it's so the player can sit back and watch the fireworks
	camAbsorbPlayer(CAM_HUMAN_PLAYER, MIS_TRANSPORT);

	// Give the player full vision of the map by placing a spotter on the LZ that has an absurdly long radius
	addSpotter(32, 20, CAM_HUMAN_PLAYER, 16384, false, 0);

	// Start causing a bunch of tiny explosions around the player's base
	setTimer("smallExplosionFX", camSecondsToMilliseconds(0.3));

	// Move the camera towards the player's base
	const startpos = getObject("startPosition");
	cameraSlide(startpos.x * 128, startpos.y * 128);
	cameraZoom(5000, 5000);

	// Force the minimap to be active (since the player no longer has an HQ).
	setMiniMap(true);
}

// Cool explosions and stuff
function endEffects()
{
	// Make a big explosion at the player's base and stop the small ones
	fireWeaponAtLoc("LargeExplosion", 32, 17, CAM_HUMAN_PLAYER);
	removeTimer("smallExplosionFX");

	// Procedurally blow up everything on the map
	setTimer("killSweep", camSecondsToMilliseconds(0.3));

	// Stop spawning new attacks waves
	endingBlast = true;
	camSetVtolSpawnStateAll(false);

	// Adjust the lighting and fog
	camSetSunPos(0, -0.2, -0.3);
	camSetFog(140, 100, 100);
	camSetSunIntensity(0.7, 0.5, 0.5, 1.4, 0.6, 0.6);
	camSetWeather(CAM_WEATHER_CLEAR);
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
	if (killSweepY >= 128)
	{
		removeTimer("killSweep");

		// Gradually darken the skies
		camGradualFog(camSecondsToMilliseconds(12), 1, 1, 1);
		camGradualSunIntensity(camSecondsToMilliseconds(12), 0.01, 0.01, 0.01);
		camSetSkyType(CAM_SKY_NIGHT);

		// Cue the end screen
		queue("youWin", camSecondsToMilliseconds(12));
	}

	const list = enumArea(1, 1, 64, killSweepY, ALL_PLAYERS, false); // Get everything in the kill zone

	for (let i = 0; i < list.length; i++)
	{
		camSafeRemoveObject(list[i], true); // ... and then blow them up
	}

	// Create a visual "shockwave" effect by causing explosions at the edge of the kill zone
	for (let x = ((killSweepY % 4 === 0) ? 1 : 2); x < 64; x += 2)
	{
		fireWeaponAtLoc("ShockwaveExplosion", x, killSweepY, CAM_HUMAN_PLAYER);
	}

	// Increase the kill zone area by 2 units south
	killSweepY += 2;

}

// You win.
// Show the ending screen.
function youWin()
{
	camPlayVideos({video: "L7_FLIGHT", type: MISS_MSG});
	queue("camEndMission", camSecondsToMilliseconds(0.2));
}

// Start sending attack waves
function startAttackWaves()
{
	if (phase == 1)
	{
		setTimer("infestedAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(40)));
		queue("heliAttack", camChangeOnDiff(camMinutesToMilliseconds(6)));
	}
	else if (phase == 2)
	{
		// Much faster attack waves
		setTimer("infestedAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(25)));
		heliAttack();

		// Change the fog colour to a dark purple
		camGradualFog(camSecondsToMilliseconds(30), 114, 73, 156);
		// Decrease the lighting, and give it a stronger pink/purple hue
		camGradualSunIntensity(camSecondsToMilliseconds(30), .5,.45,.5);
		camSetWeather(CAM_WEATHER_SNOW);
		camQueueDialogue({text: "--- ANOMALOUS SIGNAL DETECTED ---", delay: 0, sound: cam_sounds.beacon});
	}
	else if (phase == 3)
	{
		// Make the attack waves go absolutely nuts
		setTimer("infestedAttackWaves", camChangeOnDiff(camSecondsToMilliseconds(12)));

		// Change the fog colour to a darker purple
		camGradualFog(camSecondsToMilliseconds(20), 95, 60, 130);
		// MORE PURPLE !!!
		camGradualSunIntensity(camSecondsToMilliseconds(20), .5,.4,.5);
		camSetWeather(CAM_WEATHER_SNOWSTORM);
		camQueueDialogue({text: "--- ANOMALOUS SIGNAL DETECTED ---", delay: 0, sound: cam_sounds.beacon});
	}
}

// Setup helicopter attacks.
function heliAttack()
{
	const list = [cTempl.infhelcan, cTempl.infhelhmg];
	const ext = {
		limit: [1, 1], //paired with template list
		alternate: true,
		altIdx: 0
	};

	if (phase == 1)
	{
		const heliPositions = [camMakePos("heliSpawn1"), camMakePos("heliSpawn2")];

		// A helicopter will attack the player every minute, flying in from the bottom of the map
		camSetVtolData(CAM_INFESTED, heliPositions, "heliRemoveZone", list, camChangeOnDiff(camMinutesToMilliseconds(1)), undefined, ext);
	}
	else
	{
		// A helicopter will attack the player every 30 seconds, flying in from random locations
		camSetVtolData(CAM_INFESTED, undefined, "heliRemoveZone", list, camChangeOnDiff(camSecondsToMilliseconds(30)), undefined, ext);
	}
}

// Infested attack waves progression
function infestedAttackWaves()
{
	if (endingBlast)
	{
		return; // Don't spawn more during the ending blast
	}

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
	const southCityDroids = [cTempl.stinger, cTempl.stinger, cTempl.infbloke, cTempl.infbloke, cTempl.inflance, cTempl.infbuggy];

	const southWestCityDroids = [cTempl.stinger, cTempl.stinger, cTempl.infbuggy, cTempl.infbuggy, cTempl.infrbuggy, cTempl.inftrike];

	const southEastMountainDroids = [cTempl.inftrike, cTempl.infminitruck, cTempl.infbuggy, cTempl.infmoncan, cTempl.infbuscan, cTempl.inffiretruck];

	const westMarshDroids = [cTempl.infmonhmg, cTempl.infbuscan, cTempl.inffiretruck, cTempl.boomtick, cTempl.infkevbloke, cTempl.infbjeep];

	const eastIndustryDroids = [cTempl.stinger, cTempl.infmoncan, cTempl.infrbjeep, cTempl.infbuscan, cTempl.infkevlance, cTempl.infkevbloke];

	const eastRoadDroids = [cTempl.boomtick, cTempl.infmoncan, cTempl.infrbjeep, cTempl.infsartruck, cTempl.infbloke, cTempl.inffiretruck];

	const westRoadDroids = [cTempl.stinger, cTempl.infbjeep, cTempl.infmonhmg, cTempl.infminitruck, cTempl.infkevbloke, cTempl.inflance];

	const northMountainDroids = [cTempl.stinger, cTempl.vilestinger, cTempl.infrbjeep, cTempl.stinger, cTempl.inffiretruck];

	// This switch block handles spawning waves of civilians from different entrances
	// Civilians will run towards the LZ for evac by transport
	// They also serve to clue in the player of where the infested are going to attack from next
	if (phase == 1)
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

	// Check if the player has abandoned the southern half of the map
	const NUM_SOUTH_OBJECTS = enumArea("southZone", CAM_HUMAN_PLAYER, false).length; // Count the number of objects in the south half of the map
	const NUM_EXCLUDED_OBJECTS = enumArea("southExclusionZone", CAM_HUMAN_PLAYER, false).length; // Exclude the objects in the SE "industrial" area
	const SOUTH_ABANDONED = (NUM_SOUTH_OBJECTS - NUM_EXCLUDED_OBJECTS === 0);

	const entrances = [];
	const droidPools = [];

	// Spawn Infested from entrances when appropriate
	if (numWaves > 1)
	{
		entrances.push("southCityEntrance");
		droidPools.push(southCityDroids);
	}
	if (numWaves > 4 && !SOUTH_ABANDONED)
	{
		entrances.push("southWestCityEntrance");
		droidPools.push(southWestCityDroids);
	}
	if (numWaves > 7 && !SOUTH_ABANDONED)
	{
		entrances.push("southEastMountainEntrance");
		droidPools.push(southEastMountainDroids);
	}
	if (numWaves > 12 && !SOUTH_ABANDONED)
	{
		entrances.push("westMarshEntrance");
		droidPools.push(westMarshDroids);
	}
	if (numWaves > 16)
	{
		entrances.push("eastIndustryEntrance");
		droidPools.push(eastIndustryDroids);
	}
	if (numWaves > 21)
	{
		entrances.push("eastRoadEntrance");
		droidPools.push(eastRoadDroids);
	}
	if (numWaves > 26)
	{
		entrances.push("westRoadEntrance");
		droidPools.push(westRoadDroids);
	}
	if (numWaves > 30)
	{
		entrances.push("northMountainEntrance");
		droidPools.push(northMountainDroids);
	}

	for (const idx in entrances)
	{
		// If the south half of the map is abandoned, increase the size of the Infested groups
		sendInfestedGroup(entrances[idx], droidPools[idx], SOUTH_ABANDONED);
	}
}

// Spawn a group of civilians who will go to the player's LZ
function sendCivGroup(entrance)
{
	const spawnPos = camMakePos(entrance);
	const lz = camMakePos("LZ");

	// Spawn 10 - 16 civilians
	for (let i = 0; i < (10 + camRand(7)); i++)
	{
		camAddDroid(MIS_CIVILIANS, spawnPos, cTempl.civ, _("Civilian"));
	}

	// Order all civilians on the map to move towards the LZ
	const civs = enumDroid(MIS_CIVILIANS);
	camManageGroup(camMakeGroup(civs, ALLIES), CAM_ORDER_DEFEND, {
		pos: lz
	});
}

// Spawn a group of infested at a given entrance
function sendInfestedGroup(entrance, coreDroids, extraDroids)
{
	let coreSize = 2 + camRand(3); // Maximum of 4 core units.
	let fodderSize = 8 + camRand(5); // 8 - 12 extra Infested Civilians to the swarm.

	if (extraDroids)
	{
		// Make the groups a bit larger
		coreSize += 2;
		fodderSize += 4;
	}

	const droids = camRandInfTemplates(coreDroids, coreSize, fodderSize);

	// Random chance of adding a Vile Stinger, scales with difficulty
	if (camRand(101) > camChangeOnDiff(80))
	{
		droids.push(cTempl.vilestinger);
	}

	camSendReinforcement(CAM_INFESTED, camMakePos(entrance), droids, CAM_REINFORCE_GROUND, 
		{order: CAM_ORDER_ATTACK, data: {targetPlayer: CAM_HUMAN_PLAYER}}
	);
}

// Check if there are any civilians near the LZ, if there are go pick them up with a transport
function transportEvac()
{
	const area = getObject("evacZone");
	const civs = enumArea(area.x, area.y, area.x2, area.y2, MIS_CIVILIANS, false);

	if (civs.length === 0)
	{
		return; // Don't do anything if there's no civilians at the LZ
	}

	// truck.
	const truck = [cTempl.truck];
	camSendReinforcement(MIS_TRANSPORT, camMakePos("LZ"), truck,
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
	const units = enumDroid(MIS_TRANSPORT);
	// Then remove the one that ISN'T a transport
	for (let i = 0; i < units.length; i++)
	{
		const droid = units[i];
		if (!camIsTransporter(droid)) // Remove every unit that isn't a transport
		{
			camSafeRemoveObject(droid, false);
		}
	}

	// Get all the civilians in the evac zone and remove them
	const area = getObject("evacZone");
	const civs = enumArea(area.x, area.y, area.x2, area.y2, MIS_CIVILIANS, false);
	for (let i = 0; i < civs.length; i++)
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
	const startpos = getObject("startPosition");
	const lz = getObject("LZ");

   	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, CAM_A0_OUT, {
		callback: "checkMissileSilos"
	});
	camSetExtraObjectiveMessage([_("Survive until evacuation"), _("Defend the missile silos")]);
	setMissionTime(camMinutesToSeconds(30));
	// NOTE: This mission is basically unchanged in timerless mode

	// Setup lz and starting camera
	centreView(startpos.x, startpos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);

	// Give research upgrades to the infested
	camCompleteRequiredResearch(mis_infestedRes, CAM_INFESTED); 

	// Set alliances
	setAlliance(MIS_TRANSPORT, CAM_HUMAN_PLAYER, true);
	setAlliance(MIS_TRANSPORT, MIS_CIVILIANS, true);
	setAlliance(MIS_CIVILIANS, CAM_HUMAN_PLAYER, true);

	changePlayerColour(MIS_TRANSPORT, playerData[0].colour); // Transport to the player's colour
	changePlayerColour(MIS_CIVILIANS, 10); // Civilians to white

	numWaves = 0;
	phase = 1;
	killSweepY = 30;
	endingBlast = false;

	// Give player briefing about the incoming infested waves.
	camPlayVideos({video: "L7_BRIEF", type: MISS_MSG});

	// Set up transport runs to pick up civilians
	setTimer("transportEvac", camMinutesToMilliseconds(2));

	// Give the player a bit to collect themselves
	queue("startAttackWaves", (camChangeOnDiff(camSecondsToMilliseconds(20))));

	// Start phase two when there's 12 minutes remaining
	queue("startPhaseTwo", camMinutesToMilliseconds(18));

	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Change the fog colour to a light pink/purple
	camSetFog(185, 182, 236);
	// Increase the lighting, and give it a SLIGHT pink/purple hue
	camSetSunIntensity(.6,.58,.6);
	// Shift the sun towards the east
	camSetSunPos(-450.0, -400.0, 225.0);
	// Clear skies
	camSetWeather(CAM_WEATHER_CLEAR);
}
