
////////////////////////////////////////////////////////////////////////////////
// Campaign library events.
////////////////////////////////////////////////////////////////////////////////

function cam_eventPickup(feature, droid)
{
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		if (feature.stattype === ARTIFACT)
		{
			__camPickupArtifact(feature);
		}
		else if (feature.stattype === OIL_DRUM && feature.name === "Black Box")
		{
			camCollectBlackBox(feature.x, feature.y);
		}
	}
	else if (feature.stattype === ARTIFACT && droid.droidType === DROID_CONSTRUCT)
	{
		// AI Truck picking up the artifact
		__camStoreArtifact(feature);
	}
}

function cam_eventGroupLoss(obj, group, newsize)
{
	if (__camSaveLoading === true)
	{
		return;
	}
	if (newsize === 0)
	{
		__camCheckBaseEliminated(group);
	}
	if (camDef(__camGroupInfo[group]))
	{
		profile("__camCheckGroupMorale", group);
	}
}

function cam_eventCheatMode(entered)
{
	if (entered)
	{
		__camCheatMode = true;
		camTrace("Cheats enabled!");
	}
	else
	{
		camTrace("Cheats disabled!");
		__camCheatMode = false;
	}
	__camUpdateMarkedTiles();
}

function cam_eventChat(from, to, message)
{
	if (message === "win info")
	{
		__camShowVictoryConditions();
	}
	if (message === "skip")
	{
		camSkipDialogue();
	}
	if (!camIsCheating())
	{
		return;
	}
	camTrace(from, to, message);
	if (message === "let me win" && __camNextLevel !== "A4L6")
	{
		__camLetMeWin();
	}
	if (message === "make cc")
	{
		setMiniMap(true);
		setDesign(true);
	}
	if (message.lastIndexOf("ascend ", 0) === 0)
	{
		__camNextLevel = message.substring(7).toUpperCase().replace(/-/g, "_");
		__camLetMeWin();
	}
	if (message === "deity")
	{
		for (const baseLabel in __camEnemyBases)
		{
			camDetectEnemyBase(baseLabel);
		}
	}
	if (message === "research available")
	{
		while (true) // eslint-disable-line no-constant-condition
		{
			const research = enumResearch();
			if (research.length === 0)
			{
				break;
			}
			for (let i = 0, len = research.length; i < len; ++i)
			{
				const __RESEARCH_NAME = research[i].name;
				completeResearch(__RESEARCH_NAME, CAM_HUMAN_PLAYER);
			}
		}
	}
}

function cam_eventStartLevel()
{
	receiveAllEvents(true);
	// Variables initialized here are the ones that should not be
	// re-initialized on save-load. Otherwise, they are initialized
	// on the global scope (or wherever necessary).
	__camGroupInfo = {};
	__camRefillableGroupInfo = {};
	__camLabelInfo = [];
	__camFactoryInfo = {};
	__camFactoryQueue = {};
	__camTruckInfo = [];
	__camTruckAssignList = [];
	__camNeedBonusTime = false;
	__camDefeatOnTimeout = false;
	__camRTLZTicker = 0;
	__camLZCompromisedTicker = 0;
	__camLastAttackTriggered = false;
	__camLevelEnded = false;
	__camPlayerTransports = {};
	__camIncomingTransports = {};
	__camTransporterQueue = [];
	__camNumArtifacts = 0;
	__camArtifacts = {};
	__camNumEnemyBases = 0;
	__camEnemyBases = {};
	__camVtolDataSystem = [];
	__camLastNexusAttack = 0;
	__camNexusActivated = false;
	__camNewGroupCounter = 0;
	__camVideoSequences = [];
	__camSaveLoading = false;
	__camNeverGroupDroids = [];
	__camNumTransporterExits = 0;
	__camAllowVictoryMsgClear = true;
	__camExpLevel = 0;
	__camQueuedDialogue = [];
	__camLatestDialogueTime = 0;
	__camFogRGB = {};
	__camFogTargetRGB = {time: 0};
	__camSunStats = {};
	__camSunTargetIntensity = {time: 0};
	__camPlayerVisibilities = [];
	__camBonusPowerGranted = false;
	__camPreDamageModifier = [];
	__camDisableFactoryAutoManagement = false;
	__camCapturedFactoryIdx = 0;
	__camAiPowerReset(); //grant power to the AI
	camSetFog(); // Set fog to it's default color
	camSetSunPos(); // Set the sun to it's default position
	camSetSunIntensity(); // Set the sun to it's default position
	camSetWeather(CAM_WEATHER_DEFAULT);
	camSetSkyType(CAM_SKY_DAY);
	__camSetLimits();
	setTimer("__camSpawnVtols", camSecondsToMilliseconds(0.5));
	setTimer("__camRetreatVtols", camSecondsToMilliseconds(0.9));
	// setTimer("__checkVtolSpawnObject", camSecondsToMilliseconds(5));
	setTimer("__checkEnemyFactoryProductionTick", camSecondsToMilliseconds(0.8));
	setTimer("__camTick", camSecondsToMilliseconds(1)); // campaign pollers
	setTimer("__camTruckTick", camSecondsToMilliseconds(5));
	setTimer("__camAiPowerReset", camMinutesToMilliseconds(3)); //reset AI power every so often
	setTimer("__camShowVictoryConditions", camMinutesToMilliseconds(5));
	setTimer("__camViewObjects", camSecondsToMilliseconds(1));
	setTimer("__camTacticsTick", camSecondsToMilliseconds(0.1));
	setTimer("__camPlayScheduledDialogues", camSecondsToMilliseconds(0.1));
	setTimer("__camGradualEffectsTick", __CAM_GRADUAL_TICK_RATE);
	queue("__camGrantSpecialResearch", camSecondsToMilliseconds(6));
	queue("__camEnableGuideTopics", camSecondsToMilliseconds(0.1)); // delayed to handle when mission scripts add research
	queue("__camResetPower", camSecondsToMilliseconds(1));
	setTimer("__camWeatherCycle", camSecondsToMilliseconds(45));
}

function cam_eventDroidBuilt(droid, structure)
{
	if (!camDef(structure)) // "clone wars" cheat
	{
		return;
	}
	if (structure.player === CAM_HUMAN_PLAYER || droid.player === CAM_HUMAN_PLAYER)
	{
		return;
	}
	if (droid.player === CAM_INFESTED && !__camDisableFactoryAutoManagement)
	{
		// If an Infested droid was produced from a factory, immediately set it to target the player
		if (!camDef(__camInfestedGlobalAttackGroup))
		{
			__camInfestedGlobalAttackGroup = camMakeGroup(droid);
			camManageGroup(__camInfestedGlobalAttackGroup, CAM_ORDER_ATTACK, {
				simplified: true,
				removable: false,
				targetPlayer: CAM_HUMAN_PLAYER
			});
		}
		else
		{
			groupAdd(__camInfestedGlobalAttackGroup, droid);
		}
	}
	if (camGetNexusState() && droid.player === CAM_NEXUS && __camNextLevel === "CAM3C" && camRand(100) < 7)
	{
		// Occasionally hint that NEXUS is producing units on Gamma 5.
		playSound(cam_sounds.nexus.productionCompleted);
	}
	if (droid.player === CAM_HUMAN_PLAYER)
	{
		// handling guide topics for built units
		if (droid.isVTOL)
		{
			camCallOnce("__camDoAddVTOLUseTopics");
		}
		else if (droid.droidType === DROID_COMMAND)
		{
			camCallOnce("__camDoAddCommanderUseTopics");
		}
	}
	if (!camDef(__camFactoryInfo))
	{
		return;
	}
	if (droid.droidType === DROID_CONSTRUCT)
	{
		__camAssignTruck(droid);
		return;
	}
	__camPreDamageDroid(droid);
	if (droid.player !== CAM_INFESTED || __camDisableFactoryAutoManagement)
	{
		__camAddDroidToFactoryGroup(droid, structure);
	}
}

function cam_eventStructureBuilt(struct, droid)
{
	if (struct.player !== CAM_HUMAN_PLAYER)
	{
		if (struct.stattype === FACTORY || struct.stattype === VTOL_FACTORY 
			|| struct.stattype === RESEARCH_LAB || struct.stattype === POWER_GEN)
		{
			__camTruckCheckForModules(struct.player);
		}

		// Check if we should re-apply a label to this structure.
		// If it has, then automatically start managing it again.
		const PLAYER = struct.player;
		const X_COORD = struct.x;
		const Y_COORD = struct.y;
		const STATTYPE = struct.stattype;

		for (let i = 0; i < __camLabelInfo.length; i++)
		{
			const labelInfo = __camLabelInfo[i];

			// Determine if this newly built structure is the same as the old one
			if (PLAYER === labelInfo.player && X_COORD === labelInfo.x && Y_COORD === labelInfo.y 
				&& STATTYPE === labelInfo.stattype)
			{
				// Everything matches, set the label to refer to the newly built structure now
				// console("re-applied label: " + labelInfo.label)
				addLabel(struct, labelInfo.label);

				break;
			}
		}
		__camUpdateBaseGroups(struct);
	}
}

function cam_eventDestroyed(obj)
{
	if (obj.type === FEATURE && obj.stattype === ARTIFACT)
	{
		return;
	}
	__camCheckPlaceArtifact(obj);
	if (obj.type === DROID)
	{
		if (obj.droidType === DROID_CONSTRUCT)
		{
			__camCheckDeadTruck(obj);
		}
		else if (camIsTransporter(obj))
		{
			__camRemoveIncomingTransporter(obj.player);
			if (obj.player === CAM_HUMAN_PLAYER)
			{
				// Player will lose if their transporter gets destroyed outside of evacuation missions
				// If we're in an evacuation mission, end the mission in victory or failure now
				if (__camWinLossCallback === CAM_VICTORY_EVACUATION && camCheckExtraObjective())
				{
					// Player can progress anyway
					camEndMission();
					return;
				}

				// Otherwise, game over
				camEndMission(false);
				return;
			}
			if (camDef(__camPlayerTransports[obj.player]))
			{
				delete __camPlayerTransports[obj.player];
			}
		}
		else if (camDef(obj.weapons[0]))
		{
			if (obj.weapons[0].id === "BoomTickSac")
			{

				const BOOM_BAIT_ID = addDroid(CAM_INFESTED, obj.x, obj.y, "Boom Bait",
					"BoomBaitBody", "BaBaLegs", "", "", "InfestedMelee").id; // Spawn an special infested civilian where the boom tick died...
				queue("__camDetonateBoomtick", __CAM_TICKS_PER_FRAME, BOOM_BAIT_ID + ""); // ...then blow them up

				// Cause an explosion at the location of the Boom Tick
				// fireWeaponAtLoc("BoomTickBlast", obj.x, obj.y, CAM_INFESTED);
				// fireWeaponAtLoc("SmallExplosion", obj.x, obj.y, CAM_INFESTED);
			}
			else if (obj.weapons[0].id === "InfestedSpade1Trans")
			{
				// Summon one last group of Infested on death__camScavStructList
				camSendReinforcement(obj.player, camMakePos(obj), 
					camRandInfTemplates(__camInfTruckSummonTemplates, difficulty, __CAM_INFTRUCK_FODDER_COUNT), CAM_REINFORCE_GROUND);
			}
		}
	}
	else if (obj.type === STRUCTURE)
	{
		if (obj.player !== CAM_HUMAN_PLAYER)
		{
			__camTruckCheckMissingStructs(obj.player);
		}
	}
}

function cam_eventObjectSeen(viewer, seen)
{
	__camCheckBaseSeen(seen);
}

function cam_eventGroupSeen(viewer, group)
{
	__camCheckBaseSeen(group);
}

function cam_eventTransporterExit(transport)
{
	camTrace("Transporter for player", transport.player + " has exited");

	if (transport.player === CAM_HUMAN_PLAYER)
	{
		__camNumTransporterExits += 1;

		//Audio cue to let the player know they can bring in reinforcements. This
		//assumes the player can bring in reinforcements immediately after the first
		//transporter leaves the map. Mission scripts can handle special situations.
		if (//__camNumTransporterExits === 1 &&
			((__camWinLossCallback === CAM_VICTORY_OFFWORLD &&
			__camVictoryData.reinforcements > -1) ||
			__camWinLossCallback === CAM_VICTORY_STANDARD))
		{
			const __REINFORCEMENTS_AVAILABLE_SOUND = cam_sounds.reinforcementsAreAvailable;
			playSound(__REINFORCEMENTS_AVAILABLE_SOUND);
			//Show the transporter reinforcement timer when it leaves for the first time.
			if (__camWinLossCallback === CAM_VICTORY_OFFWORLD)
			{
				setReinforcementTime(__camVictoryData.reinforcements);
			}
		}
		// Show how long until the transporter comes on evacuation missions
		if (__camWinLossCallback === CAM_VICTORY_EVACUATION)
		{
			setReinforcementTime(__camVictoryData.reinforcements);
		}
	}

	if (transport.player !== CAM_HUMAN_PLAYER ||
		(__camWinLossCallback === CAM_VICTORY_STANDARD &&
		transport.player === CAM_HUMAN_PLAYER))
	{
		__camRemoveIncomingTransporter(transport.player);
	}
	else if (__camWinLossCallback === CAM_VICTORY_PRE_OFFWORLD)
	{
		camTrace("Transporter is away.");
		__camGameWon();
	}
}

function cam_eventTransporterLanded(transport)
{
	if (transport.player !== CAM_HUMAN_PLAYER)
	{
		__camLandTransporter(transport.player, camMakePos(transport));
	}
	else
	{
		// Make the transporter timer on evac missions disappear, since the transporter has arrived.
		if (__camWinLossCallback === CAM_VICTORY_EVACUATION)
		{
			setReinforcementTime(-1);
		}
		// Handle enabling guide topics relevant to units potentially "gifted" by libcampaign
		__camEnableGuideTopicsForTransport(transport);
	}
}

function cam_eventMissionTimeout()
{
	if (__camDefeatOnTimeout)
	{
		camTrace("0 minutes remaining.");
		__camGameLost();
	}
	else if (__camWinLossCallback !== CAM_VICTORY_SCRIPTED)
	{
		const __WON = camCheckExtraObjective();
		if (!__WON)
		{
			camEndMission(false);
			return;
		}
		camEndMission();
	}
}

function cam_eventAttacked(victim, attacker)
{
	if (camDef(victim) && victim)
	{
		if (victim.type === DROID)
		{
			if (victim.player !== CAM_HUMAN_PLAYER && !allianceExistsBetween(CAM_HUMAN_PLAYER, victim.player))
			{
				//Try dynamically creating a group of nearby droids not part
				//of a group. Only supports those who can hit ground units.
				if (victim.group === null)
				{
					const __DEFAULT_RADIUS = 6;
					const loc = {x: victim.x, y: victim.y};
					const droids = enumRange(loc.x, loc.y, __DEFAULT_RADIUS, victim.player, false).filter((obj) => (
						obj.type === DROID &&
						obj.group === null &&
						(obj.canHitGround || obj.isSensor) &&
						obj.droidType !== DROID_CONSTRUCT &&
						!camIsTransporter(obj) &&
						!camInNeverGroup(obj) &&
						obj.body.indexOf("Broken") == -1 // Do not autogroup "derelict" units
					));
					if (droids.length === 0)
					{
						return;
					}
					camManageGroup(camMakeGroup(droids), CAM_ORDER_ATTACK, {
						count: -1,
						regroup: false,
						repair: 70,
						targetPlayer: CAM_HUMAN_PLAYER
					});
				}

				if (camDef(__camGroupInfo[victim.group]))
				{
					__camGroupInfo[victim.group].lastHit = gameTime;
				}
			}

			if (victim.droidType === DROID_WEAPON && camDef(victim.weapons[0]) 
				&& victim.weapons[0].name === "InfestedSpade1Trans" && victim.id === attacker.id)
			{
				// Release a group of Infested from the Infested Truck...
				camSendReinforcement(victim.player, camMakePos(victim), 
					camRandInfTemplates(__camInfTruckSummonTemplates, difficulty, __CAM_INFTRUCK_FODDER_COUNT), CAM_REINFORCE_GROUND);
			}
		}
		else if (victim.type === STRUCTURE && __camPlayerVisibilities[attacker.player] && !attacker.hasIndirect)
		{
			// If we're sharing vision with a player, reveal bases that they hit with non-artillery attacks
			__camCheckBaseSeen(victim);
		}
	}
}

//Work around some things that break on save-load.
function cam_eventGameLoaded()
{
	receiveAllEvents(true);
	__camSaveLoading = true;

	// Reset the fog, sun, and sky to the correct values
	setFogColour(__camFogRGB.r, __camFogRGB.g, __camFogRGB.b);
	camSetSunPos(__camSunStats.x, __camSunStats.y, __camSunStats.z);
	setSunIntensity(
		__camSunStats.ar, __camSunStats.ag, __camSunStats.ab,
		__camSunStats.dr, __camSunStats.dg, __camSunStats.db,
		__camSunStats.sr, __camSunStats.sg, __camSunStats.sb
	);
	camSetSkyType();
	__camWeatherCycle();

	if (__camWinLossCallback === CAM_VICTORY_EVACUATION
		&& enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER).length === 0)
	{
		// If the transport is gone on an evac mission, put a timer up to show when it'll be back
		setReinforcementTime(__camVictoryData.reinforcements);
	}

	if (__camBonusPowerGranted)
	{
		// Bonus power has already been granted, don't let the player generate more power
		setPowerModifier(0, CAM_HUMAN_PLAYER);
	}

	//Subscribe to eventGroupSeen again.
	camSetEnemyBases();

	// Ensure appropriate guide topics are displayed
	__camEnableGuideTopics();

	//Reset any vars
	__camCheatMode = false;

	__camSaveLoading = false;
	queue("__camResetPower", camSecondsToMilliseconds(1));
}

//Plays Nexus sounds if nexusActivated is true.
function cam_eventObjectTransfer(obj, from)
{
	if (camGetNexusState() && from === CAM_HUMAN_PLAYER && obj.player === CAM_NEXUS)
	{
		let snd;
		if (obj.type === STRUCTURE)
		{
			if (obj.stattype === DEFENSE)
			{
				snd = cam_sounds.nexus.defensesAbsorbed;
			}
			else if (obj.stattype === RESEARCH_LAB)
			{
				snd = cam_sounds.nexus.researchAbsorbed;
			}
			else
			{
				snd = cam_sounds.nexus.structureAbsorbed;
			}
		}
		else if (obj.type === DROID)
		{
			snd = cam_sounds.nexus.unitAbsorbed;
		}

		if (camDef(snd))
		{
			playSound(snd);
		}
		queue("camNexusLaugh", camSecondsToMilliseconds(1.5));
	}
	else if (obj.player === CAM_INFESTED)
	{
		// Swap to infested structure/droid variant
		__camInfestObj(obj, from);

		if (from === CAM_HUMAN_PLAYER)
		{
			// Play a sound alerting the player that their stuff's getting stealed
			if (obj.type === STRUCTURE)
			{
				playSound(cam_sounds.infested.structureInfected); // "Structure Infected"
			}
			else if (obj.type === DROID)
			{
				playSound(cam_sounds.infested.unitInfected); // "Unit Infected"
			}
		}
	}
}

function cam_eventVideoDone()
{
	__camEnqueueVideos(); //Play any remaining videos automatically.
}

function cam_eventResearched(research, structure, player)
{
	if (player !== CAM_HUMAN_PLAYER)
	{
		return;
	}
	let researchedByStruct = (camDef(structure) && structure);
	if (!researchedByStruct)
	{
		return; // for now, return - don't think we need to process if researched by API call here?
	}
	// only pass the research in if it was completed by a structure (not if given by an API call, in which structure would be null)
	__camProcessResearchGatedGuideTopics(research);
}
