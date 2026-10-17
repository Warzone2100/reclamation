
////////////////////////////////////////////////////////////////////////////////
// Victory celebration helpers.
////////////////////////////////////////////////////////////////////////////////

//;; ## camEndMission([gameWon])
//;;
//;; Immediately ends the mission in victory.
//;; If `gameWon` is defined and false, then end the mission in defeat instead. 
//;;
//;; @param {boolean|undefined} gameWon
//;; @returns {void}
//;;
function camEndMission(gameWon)
{
	if (camDef(gameWon) && !gameWon)
	{
		__camGameLost();
	}
	else
	{
		__camGameWon();
	}
}

//;; ## camNextLevel(nextLevel)
//;;
//;; A wrapper around `loadLevel()`. 
//;;
//;; @param {string} nextLevel
//;; @returns {void}
//;;
function camNextLevel(nextLevel)
{
	camGrantBonusPower();
	camBreakAlliances();
	//Set these limits again for the home map before exiting this mission
	setStructureLimits("A0CommandCentre", 1, CAM_HUMAN_PLAYER);
	setStructureLimits("A0ComDroidControl", 1, CAM_HUMAN_PLAYER);

	loadLevel(nextLevel);
}

//;; ## camSetStandardWinLossConditions(kind, nextLevel, data)
//;;
//;; Set victory and defeat conditions to one of the common options. On victory, load nextLevel.
//;; The extra data parameter contains extra data required to define some of the victory conditions.
//;; The following options are available:
//;; * `CAM_VICTORY_STANDARD` Defeat if all ground factories and construction droids are lost, or on mission timeout.
//;;   Victory when all enemies are destroyed and all artifacts are recovered.
//;; * `CAM_VICTORY_EVACUATION` Defeat if all units lost or timeout and the objective callback does not return `true`.
//;;   Victory otherwise. Also allows using transports to move units off-map.
//;; * `CAM_VICTORY_SCRIPTED` Defeat if all units lost. Victory when the level script calls `camEndMission()`.
//;; * `CAM_VICTORY_PRE_OFFWORLD` Defeat on timeout. Victory on transporter launch, then load the sub-level.
//;; * `CAM_VICTORY_OFFWORLD` Defeat on timeout or all units lost.
//;;   Victory when all artifacts are recovered and either all enemies are dead (not just bases) or all droids are at the LZ.
//;;   Also automatically handles the "LZ compromised" message, which is why it needs to know reinforcement interval to restore.
//;;   The following data parameter fields are available:
//;; For standard and offworld victory, some extra data parameters can be defined:
//;; * `callback` A function callback to check for extra win/loss conditions. Return values are interpreted as follows:
//;;   * `false` means instant defeat ("objective failed"),
//;;   * `true` means victory as long as other standard victory conditions are met,
//;;   * `undefined` means suppress other victory checks ("clearly not won yet").
//;; * `victoryVideo` Pass in the name of a video string here and it will be played before attempting to load the next level.
//;; * `defeatOnDeath` Whether losing all droids should result in defeat. Optional.
//;;   * `false` means the player only loses on timeout or if the script calls `camEndMission()`,
//;;   * `true` means the player loses once all constructors and factories are destroyed (default),
//;; * `enableLastAttack` Whether all remaining enemies should rush the player at the end of the mission. Optional.
//;;   * `false` means enemies will not change their behavior at the en of the mission,
//;;   * `true` means all remaining enemies will attack the player once all bases and artifacts are collected (default),
//;; * `waitForDialogue` Whether the mission should for dialogue before ending. Optional.
//;;   * `false` means the mission will end once all objectives are complete (default),
//;;   * `true` means that the mission will wait until all dialogue to finish playing before ending,
//;; * `earlyPowerBonus` Whether to grant bonus power and remove the mission timer early. Optional.
//;;   * `false` means the player will not receive bonus power until the very last moment before switching levels (default),
//;;   * `true` means the player will receive bonus power once all objectives are complete,
//;; * `showArtifacts` Whether to show artifacts in the victory info. Optional.
//;;   * `false` means the player will not see any artifact info victory condition text,
//;;   * `true` means the player will see how many artifacts are left to collect in the victory info text (default),
//;; * `ignoreInfestedUnits` Whether the mission should count Infested units for victory. Optional.
//;;   * `false` means that all units belonging to all enemy players must be destroyed for annihilation victory (default),
//;;   * `true` means that units belonging to CAM_INFESTED will be ignored and don't need to be destroyed for victory purposes,
//;; For offworld victory, some more extra data parameters can be defined:
//;; * `area` The landing zone to return to.
//;; * `message` The "Return to LZ" message ID. Optional.
//;; * `reinforcements` Reinforcements interval, in seconds.
//;; * `retlz` Force the player to return to the LZ area:
//;;   * `false` mission does not require a LZ return,
//;;   * `true` mission requires all units to be at LZ to win.
//;; * `annihilate` Player must destroy every thing on map to win:
//;;   * `false` mission does not require everything destroyed,
//;;   * `true` mission requires total map annihilation.
//;; * `eliminateBases` Instant win when all enemy units and bases are destroyed:
//;;   * `false` does not require all bases to be destroyed,
//;;   * `true` requires all bases destroyed.
//;;
//;; @param {string} kind
//;; @param {string} nextLevel
//;; @param {Object} data
//;; @returns {void}
//;;
function camSetStandardWinLossConditions(kind, nextLevel, data)
{
	switch (kind)
	{
		case CAM_VICTORY_STANDARD: // Victory when no enemies remain
			__camWinLossCallback = CAM_VICTORY_STANDARD;
			__camNeedBonusTime = true;
			__camDefeatOnTimeout = true;
			__camVictoryData = data;
			useSafetyTransport(false);
			break;
		case CAM_VICTORY_PRE_OFFWORLD: // Victory on transport liftoff
			__camWinLossCallback = CAM_VICTORY_PRE_OFFWORLD;
			__camNeedBonusTime = false;
			__camDefeatOnTimeout = true;
			useSafetyTransport(false);
			break;
		case CAM_VICTORY_OFFWORLD: // Victory 
			__camWinLossCallback = CAM_VICTORY_OFFWORLD;
			__camNeedBonusTime = true;
			__camDefeatOnTimeout = true;
			__camVictoryData = data;
			setReinforcementTime((__camNumTransporterExits > 0) ? __camVictoryData.reinforcements : -1);
			useSafetyTransport(false);
			break;
		case CAM_VICTORY_EVACUATION: // Victory unless the level script returns `false` on callback
			__camWinLossCallback = CAM_VICTORY_EVACUATION;
			__camNeedBonusTime = true;
			__camDefeatOnTimeout = false;
			__camVictoryData = data;
			setReinforcementTime((__camVictoryData.reinforcements > -1) ? __camVictoryData.reinforcements : -1);
			useSafetyTransport(true);
			break;
		case CAM_VICTORY_SCRIPTED: // Victory dictated entirely by level script
			__camWinLossCallback = CAM_VICTORY_SCRIPTED;
			__camNeedBonusTime = true;
			__camDefeatOnTimeout = false;
			__camVictoryData = data;
			useSafetyTransport(false);
			break;
		default:
			camDebug("Unknown standard victory condition", kind);
			return;
	}

	// Define these parameters if not defined by the script
	__camVictoryData = (camDef(__camVictoryData)) ? __camVictoryData : {};
	__camVictoryData.defeatOnDeath = (camDef(__camVictoryData.defeatOnDeath)) ? __camVictoryData.defeatOnDeath : true;
	__camVictoryData.enableLastAttack = (camDef(__camVictoryData.enableLastAttack)) ? __camVictoryData.enableLastAttack : true;
	__camVictoryData.waitForDialogue = (camDef(__camVictoryData.waitForDialogue)) ? __camVictoryData.waitForDialogue : false;
	__camVictoryData.earlyPowerBonus = (camDef(__camVictoryData.earlyPowerBonus)) ? __camVictoryData.earlyPowerBonus : false;
	__camVictoryData.showArtifacts = (camDef(__camVictoryData.showArtifacts)) ? __camVictoryData.showArtifacts : true;
	__camVictoryData.ignoreInfestedUnits = (camDef(__camVictoryData.ignoreInfestedUnits)) ? __camVictoryData.ignoreInfestedUnits : false;

	__camNextLevel = nextLevel;

	__camResetPower();
}

//;; ## camCheckExtraObjective()
//;;
//;; Checks for extra win conditions defined in level scripts being met, if any.
//;;
//;; @returns {boolean|undefined}
//;;
function camCheckExtraObjective()
{
	let extraObjMet = true;
	if (camDef(__camVictoryData) && camDef(__camVictoryData.callback))
	{
		const __RESULT = __camGlobalContext()[__camVictoryData.callback]();
		if (camDef(__RESULT))
		{
			if (!__RESULT)
			{
				__camGameLost();
				return;
			}
		}
		else
		{
			extraObjMet = false;
		}
	}

	return extraObjMet;
}

//;; ## camSetExtraObjectiveMessage(message)
//;;
//;; Message(s) the mission script can set to further explain specific victory conditions.
//;; Allows a single string or an array of strings.
//;;
//;; @param {string|Object[]} message
//;; @returns {void}
//;;
function camSetExtraObjectiveMessage(message)
{
	__camExtraObjectiveMessage = message;
}

//;; ## camClearConsoleOnVictoryMessage(clear)
//;;
//;; If the script wants to allow `__camSetupConsoleForVictoryConditions()` to clear the console.
//;;
//;; @param {boolean} clear
//;; @returns {void}
//;;
function camClearConsoleOnVictoryMessage(clear)
{
	__camAllowVictoryMsgClear = clear;
}

//;; ## camGrantBonusPower()
//;;
//;; Grants bonus power for completing the mission faster (if not in Timerless mode).
//;; In Timerless mode, sets the player's power to the max.
//;; Also removes the mission timer and disables player power generation for the rest of the mission.
//;; This function is automatically called at the end of a mission, but it can also be called earlier via the mission script.
//;;
//;; @returns {void}
//;;
function camGrantBonusPower()
{
	if (__camNeedBonusTime && !__camBonusPowerGranted)
	{
		if (camDiscoverCampaign() === __CAM_PROLOGUE_CAMPAIGN_NUMBER)
		{
			return; // Don't grant bonus power in the prologue
		}

		if (!tweakOptions.rec_timerlessMode)
		{
			// Calculate bonus power based on remaining mission time
			let bonusTime = getMissionTime();
			if (bonusTime > 0)
			{
				camTrace("Bonus time", bonusTime);
				extraPowerTime(bonusTime);
			}
		}
		else
		{
			// In Timerless mode, just set the player to max power at the end of the level
			setPower(__camGetPowerLimit(), CAM_HUMAN_PLAYER);
		}
	setPowerModifier(0, CAM_HUMAN_PLAYER);
	setMissionTime(-1);

	__camBonusPowerGranted = true;
	}
}

//////////// privates

function __camGameLostCB()
{
	gameOverMessage(false, false);
}

function __camGameLost()
{
	camCallOnce("__camGameLostCB");
}

function __camGameWon()
{
	if (__camVictoryData.waitForDialogue && !camDialogueDone())
	{
		// Don't finish yet if we need to wait for dialogue
		return;
	}


	if (__camVictoryData.earlyPowerBonus)
	{
		// Grant bonus power now if enabled
		camGrantBonusPower();
	}

	__camLevelEnded = true;
	if (camDef(__camVictoryData) && camDef(__camVictoryData.victoryVideo))
	{
		camPlayVideos(__camVictoryData.victoryVideo);
	}

	if (camDef(__camNextLevel) && !(__camNextLevel === CAM_A0_OUT || __camNextLevel === CAM_A4_OUT))
	{
		camTrace(__camNextLevel);
		camNextLevel(__camNextLevel);
	}
	else
	{
		//If nothing to load, go to main menu.
		gameOverMessage(true, false);
	}
}

//Checks if the player is considered to be alive on all non-offworld missions.
function __camPlayerDead()
{
	if (!__camVictoryData.defeatOnDeath)
	{
		// The player cannot lose by running out of units in this case
		return false;
	}

	let dead = true;
	let haveFactories = enumStruct(CAM_HUMAN_PLAYER, FACTORY).filter(function(obj) {
		return obj.status === BUILT;
	}).length > 0;
	
	//If no normal factories are found, check for any cyborg factories since the player can build Combat Engineers
	if (!haveFactories)
	{
		haveFactories = enumStruct(CAM_HUMAN_PLAYER, CYBORG_FACTORY).filter(function(obj) {
			return obj.status === BUILT;
		}).length > 0;
	}

	if (haveFactories)
	{
		dead = false;
	}

	if (enumDroid(CAM_HUMAN_PLAYER, DROID_CONSTRUCT).length > 0)
	{
		//A construction unit is currently on the map.
		dead = false;
	}
	else
	{
		//Check the transporter.
		const transporter = enumDroid(CAM_HUMAN_PLAYER, DROID_SUPERTRANSPORTER);
		if (transporter.length > 0)
		{
			const cargoDroids = enumCargo(transporter[0]);
			for (let i = 0, len = cargoDroids.length; i < len; ++i)
			{
				const virDroid = cargoDroids[i];
				if (camDef(virDroid) && virDroid && virDroid.droidType === DROID_CONSTRUCT)
				{
					dead = false;
					break;
				}
			}
		}
	}

	if (__camWinLossCallback === CAM_VICTORY_EVACUATION)
	{
		// Check if no units are alive on map while having no factories.
		let droidCount = 0;
		enumDroid(CAM_HUMAN_PLAYER).forEach((obj) => {
			if (obj.droidType === DROID_SUPERTRANSPORTER)
			{
				//Don't count the transporter itself. This is for the case where
				//they have no units and no factories and have the transporter
				//sitting at base unable to launch.
				droidCount += enumCargo(obj).length;
			}
			else
			{
				droidCount += 1;
			}
		});
		dead = droidCount <= 0 && !haveFactories;

		const __EXTRA_OBJ = camCheckExtraObjective();
		if (dead && __EXTRA_OBJ)
		{
			// If the player is dead, but the level script's objective is complete, 
			cam_eventMissionTimeout(); // Early victory trigger
			return false;
		}
	}

	return dead;
}

function __camTriggerLastAttack()
{
	if (!__camLastAttackTriggered && __camVictoryData.enableLastAttack)
	{
		// Do not order systems (sensor/trucks/repairs) to attack stuff.
		const enemies = enumArea(0, 0, mapWidth, mapHeight, ENEMIES, false).filter((obj) => (
			obj.type === DROID && !camIsTransporter(obj) && !camIsSystemDroid(obj)
		));
		camTrace(enemies.length, "enemy droids remaining");
		camManageGroup(camMakeGroup(enemies), CAM_ORDER_ATTACK);
		__camLastAttackTriggered = true;
	}
}

function __camVictoryStandard()
{
	const __EXTRA_OBJ = camCheckExtraObjective();
	// check if game is lost
	if (__camPlayerDead())
	{
		__camGameLost();
		return;
	}
	// check if game is won
	if (camAllArtifactsPickedUp() && camAllEnemyBasesEliminated() && __EXTRA_OBJ)
	{
		let enemiesRemaining = enumArea(0, 0, mapWidth, mapHeight, ENEMIES, false).filter((obj) => (
			!(obj.type === STRUCTURE && (obj.status !== BUILT || obj.stattype === WALL)) // Don't count walls or unbuilt structures
		)).length;
		if (__camVictoryData.ignoreInfestedUnits)
		{
			// If we're to ignore Infested units, subtract them from the number of enemies remaining
			enemiesRemaining -= countDroid(DROID_ANY, CAM_INFESTED);
		}
		if (enemiesRemaining === 0)
		{
			__camGameWon();
		}
		else
		{
			__camTriggerLastAttack();
		}
	}
}

function __camVictoryPreOffworld()
{
	if (__camPlayerDead())
	{
		__camGameLost();
	}
	// victory hooked from eventTransporterExit
}

function __camVictoryEvacuation()
{
	if (__camPlayerDead())
	{
		__camGameLost();
	}
	// victory hooked from eventMissionTimeout
}

function __camVictoryScripted()
{
	if (__camPlayerDead())
	{
		__camGameLost();
	}
	// victory happens whenever the script calls `camEndMission()`
}

function __camVictoryOffworld()
{
	const lz = __camVictoryData.area;
	if (!camDef(lz))
	{
		camDebug("Landing zone area is required for OFFWORLD");
		return;
	}

	const __TOTAL = countDroid(DROID_ANY, CAM_HUMAN_PLAYER); // for future use
	if (__TOTAL === 0 && __camVictoryData.defeatOnDeath)
	{
		__camGameLost();
		return;
	}

	const __FORCE_LZ = camDef(__camVictoryData.retlz) ? __camVictoryData.retlz : false;
	const __DESTROY_ALL = camDef(__camVictoryData.annihilate) ? __camVictoryData.annihilate : false;
	const __ELIM_BASES = camDef(__camVictoryData.eliminateBases) ? __camVictoryData.eliminateBases : false;
	let enemyLen = enumArea(0, 0, mapWidth, mapHeight, ENEMIES, false).filter((obj) => (
		!(obj.type === STRUCTURE && (obj.status !== BUILT || obj.stattype === WALL)) // Don't count walls or unbuilt structures
	)).length;

	if (camCheckExtraObjective() && camAllArtifactsPickedUp())
	{
		if (__ELIM_BASES && camAllEnemyBasesEliminated())
		{
			let enemyDroids = enumArea(0, 0, mapWidth, mapHeight, ENEMIES, false).filter((obj) => (
				obj.type === DROID
			)).length;

			if (__camVictoryData.ignoreInfestedUnits)
			{
				// If we're to ignore Infested units, subtract them from the number of enemies remaining
				enemyDroids -= countDroid(DROID_ANY, CAM_INFESTED);
			}

			if (enemyDroids === 0)
			{
				__camGameWon();
			}
			else
			{
				__camTriggerLastAttack();
			}
		}
		else if (!__ELIM_BASES)
		{
			if (!__FORCE_LZ)
			{
				if (__camVictoryData.ignoreInfestedUnits)
				{
					// If we're to ignore Infested units, subtract them from the number of enemies remaining
					enemyLen -= countDroid(DROID_ANY, CAM_INFESTED);
				}

				if (enemyLen === 0)
				{
					// No need to return to LZ
					__camGameWon();
					return;
				}
			}

			//Missions that are not won based on artifact count (see missions 2-1 and 3-2).
			//If either __FORCE_LZ or __DESTROY_ALL is true then ignore this.
			if (__camNumArtifacts === 0 && !__FORCE_LZ && !__DESTROY_ALL)
			{
				__camGameWon();
				return;
			}

			//Make sure to only count droids here.
			const __TOTAL_AT_LZ = enumArea(lz, CAM_HUMAN_PLAYER, false).filter((obj) => (
				obj.type === DROID && !camIsTransporter(obj)
			)).length;
			if (((!__FORCE_LZ && !__DESTROY_ALL) || (__FORCE_LZ && __DESTROY_ALL && !enemyLen) || (__FORCE_LZ && !__DESTROY_ALL)) && (__TOTAL_AT_LZ === __TOTAL))
			{
				__camGameWon();
				return;
			}
			else
			{
				__camTriggerLastAttack();
			}

			if (!__DESTROY_ALL || (__FORCE_LZ && !enemyLen))
			{
				if (__camVictoryData.earlyPowerBonus)
				{
					// Grant bonus power now if enabled
					camGrantBonusPower();
				}

				const __REMIND_RETURN = 60; // every X seconds
				if (__camRTLZTicker === 0 && camDef(__camVictoryData.message))
				{
					camTrace("Return to LZ message displayed");
					camMarkTiles(lz);
					if (camDef(__camVictoryData.message))
					{
						hackAddMessage(__camVictoryData.message, PROX_MSG, CAM_HUMAN_PLAYER, false);
					}
				}
				if (__camRTLZTicker % __REMIND_RETURN === 0)
				{
					const pos = camMakePos(lz);
					playSound(cam_sounds.lz.returnToLZ, pos.x, pos.y, 0);
					console(_("Return to LZ"));
				}
				++__camRTLZTicker;
			}
		}
	}
	if (enumArea(lz, ENEMIES, false).filter((obj) => (obj.type === STRUCTURE || (obj.type == DROID && !obj.isVTOL))).length > 0)
	{
		const __REMIND_COMPROMISED = 30; // every X seconds
		//Protect against early access to reinforcements GUI if it shouldn't be available yet
		if (__camVictoryData.reinforcements >= 0)
		{
			setReinforcementTime(LZ_COMPROMISED_TIME);
		}
		if (__camLZCompromisedTicker === 0)
		{
			camTrace("LZ compromised");
		}
		if (__camLZCompromisedTicker % __REMIND_COMPROMISED === 1)
		{
			const pos = camMakePos(lz);
			playSound(cam_sounds.lz.LZCompromised, pos.x, pos.y, 0);
		}
		++__camLZCompromisedTicker;
		if (__camRTLZTicker === 0)
		{
			camMarkTiles(lz);
		}
	}
	else if (__camLZCompromisedTicker > 0)
	{
		camTrace("LZ clear");
		const pos = camMakePos(lz);
		playSound(cam_sounds.lz.LZClear, pos.x, pos.y, 0);
		setReinforcementTime(__camVictoryData.reinforcements);
		__camLZCompromisedTicker = 0;
		if (__camRTLZTicker === 0)
		{
			camUnmarkTiles(lz);
		}
	}
}

function __camSetupConsoleForVictoryConditions()
{
	// Console clears are only done when collecting artifacts or destroying bases.
	if (__camAllowVictoryMsgClear)
	{
		clearConsole();
	}

	queue("__camShowVictoryConditions", camSecondsToMilliseconds(0.5));
}

function __camShowVictoryConditions()
{
	if (camDef(tweakOptions.victoryHints) && !tweakOptions.victoryHints)
	{
		return; // Disabled.
	}
	if (!camDef(__camNextLevel))
	{
		return; // fastplay / tutorial. Should be a better identifier for this.
	}

	if (__camWinLossCallback === CAM_VICTORY_PRE_OFFWORLD)
	{
		// Only show the extra objective message (if one exists)
		__camShowExtraObjectiveMessage();
		return;
	}

	const __TOTAL_ARTIFACTS = Object.keys(__camArtifacts).length;
	if (__camVictoryData.showArtifacts && __TOTAL_ARTIFACTS > 0)
	{
		console(__camNumArtifacts + "/" + __TOTAL_ARTIFACTS + " " + _("Artifacts collected"));
	}

	const __ANNIHILATE_OBJ = (camDef(__camVictoryData.annihilate) && __camVictoryData.annihilate) || __camWinLossCallback === CAM_VICTORY_STANDARD;
	const __DESTROY_OBJ = __ANNIHILATE_OBJ || (camDef(__camVictoryData.eliminateBases) && __camVictoryData.eliminateBases);

	if (__DESTROY_OBJ)
	{
		// If our objective is to destroy enemies (or enemy bases), display how many bases remain
		const __NUM_BASES = camNumEnemyBasesRemaining();
		if (__NUM_BASES > 0)
		{
			console(__NUM_BASES + " " + _("Enemy bases remaining"));
		}
		else
		{
			// If no bases remain, list the remaining enemy units & structures
			let unitsOnMap = 0;
			let structuresOnMap = 0;

			enumArea(0, 0, mapWidth, mapHeight, ENEMIES, false).forEach((obj) => {
				if (obj.type === DROID)
				{
					++unitsOnMap;
				}
				else if (obj.type === STRUCTURE && obj.status === BUILT && obj.stattype !== WALL) // Only count BUILT, non-wall structures
				{
					++structuresOnMap;
				}
			});

			if (__camVictoryData.ignoreInfestedUnits)
			{
				// If we're to ignore Infested units, remove them from the unit count
				unitsOnMap -= countDroid(DROID_ANY, CAM_INFESTED);
			}

			if (unitsOnMap > 0)
			{
				console(unitsOnMap + " " + _("Enemy units remaining"));
			}

			if (structuresOnMap > 0 && __ANNIHILATE_OBJ)
			{
				// If the player must destroy EVERYTHING, also list the remaining structures
				console(structuresOnMap + " " + _("Enemy structures remaining"));
			}	
		}
	}

	if (__camWinLossCallback === CAM_VICTORY_OFFWORLD)
	{
		if (camDef(__camVictoryData.retlz) && __camVictoryData.retlz)
		{
			console(_("Return to LZ required"));
		}

		// if (camDef(__camVictoryData.annihilate) && __camVictoryData.annihilate)
		// {
		// 	console(__ANNIHILATE_MESSAGE);
		// }

		if (camDef(__camVictoryData.eliminateBases) && __camVictoryData.eliminateBases)
		{
			console(_("Destroy all enemy units and bases"));
		}
	}

	if (__ANNIHILATE_OBJ)
	{
		console(_("Destroy all enemy units and structures"));
	}

	//More specific messages set through the mission scripts.
	__camShowExtraObjectiveMessage();
}

function __camShowExtraObjectiveMessage()
{
	if (camDef(__camExtraObjectiveMessage))
	{
		if (__camExtraObjectiveMessage instanceof Array)
		{
			for (let i = 0, len = __camExtraObjectiveMessage.length; i < len; ++i)
			{
				const __MES = __camExtraObjectiveMessage[i];
				console(__MES);
			}
		}
		else
		{
			console(__camExtraObjectiveMessage);
		}
	}
}
