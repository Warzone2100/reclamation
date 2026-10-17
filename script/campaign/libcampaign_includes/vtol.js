
////////////////////////////////////////////////////////////////////////////////
// VTOL management.
// These functions create the hit and run vtols for the given player.
// Vtol rearming is handled in group management.
////////////////////////////////////////////////////////////////////////////////

//;; ## camSetVtolData(player, startPos, exitPos, templates, timer, [obj[, extras]])
//;;
//;; Setup hit and runner VTOLs. NOTE: Will almost immediately spawn VTOLs upon calling this function.
//;; `Player`: What player number the VTOLs will belong to.
//;; `StartPos`: Starting position object where VTOLs will spawn. Can be an array. Use undefined for random map edge location.
//;; `ExitPos`: Exit position object where VTOLs will despawn at.
//;; `Templates`: An array of templates that the spawn uses.
//;; `Timer`: How much time in milliseconds the VTOLs will wait to spawn again.
//;; `Obj`: A game object that will stop the spawn when it no longer exists. May be undefined for no explicit end condition.
//;; `Extras`: An object with possible members:
//;;		`limit`: Numeric limit of a VTOL design in regards to the parameter Templates. May be an array paired to Templates.
//;;		`alternate`: A boolean to force the spawn to use one of the designs at a time in parameter Templates.
//;;		`altIdx`: Which design index the spawn will first cycle through the list of templates from.
//;;		`minVTOLs`: Minimum amount of VTOLs that will spawn.
//;;		`maxRandomVTOLs`: Random amount of VTOLs that will spawn in addition to minVTOLs.
//;;		`callback`: Callback function for strike targets. If defined, VTOLs will be given CAM_ORDER_STRIKE instead of CAM_ORDER_ATTACK.
//;;
//;; @param {number} player
//;; @param {Object|Object[]|undefined} startPos
//;; @param {Object} exitPos
//;; @param {Object[]} templates
//;; @param {number} timer
//;; @param {Object} obj
//;; @param {Object} extras
//;; @returns {void}
//;;
function camSetVtolData(player, startPos, exitPos, templates, timer, obj, extras)
{
	__camVtolDataSystem.push({
		player: player,
		startPosition: startPos,
		exitPosition: camMakePos(exitPos),
		templates: templates,
		spawnStopObject: obj,
		extras: extras,
		vtolIds: [], // Store the IDs of the spawned VTOL droids (only used in dynamic mode)
		timer: timer,
		nextSpawnTime: timer + gameTime,
		isFirstSpawn: true,
		active: true,
		dMultiplier: 1.0
	});
}

//;; ## camSetVtolSpawnState(state, identifier)
//;;
//;; Sets the active status of a VTOL spawn point. The identifier can either be the
//;; the index number or the label of the object that stops the spawn naturally.
//;;
//;; @param {boolean} state
//;; @param {number|string} identifier
//;; @returns {void}
//;;
function camSetVtolSpawnState(state, identifier)
{
	if (typeof identifier === "number")
	{
		__camVtolDataSystem[identifier].active = state;
	}
	else if (typeof identifier === "string")
	{
		for (let idx = 0, len = __camVtolDataSystem.length; idx < len; ++idx)
		{
			if (__camVtolDataSystem[idx].spawnStopObject === identifier)
			{
				__camVtolDataSystem[idx].active = state;
			}
		}
	}
	else
	{
		camDebug("camSetVtolSpawn() expected a number or game object label string");
	}
}

//;; ## camSetVtolSpawnStateAll(state)
//;;
//;; Sets the active status of all VTOL spawns to `state`.
//;;
//;; @param {boolean} state
//;; @returns {void}
//;;
function camSetVtolSpawnStateAll(state)
{
	for (let idx = 0, len = __camVtolDataSystem.length; idx < len; ++idx)
	{
		camSetVtolSpawnState(state, idx);
	}
}

//////////// privates

// function __checkVtolSpawnObject()
// {
// 	for (let idx = 0, len = __camVtolDataSystem.length; idx < len; ++idx)
// 	{
// 		if (/*__camVtolDataSystem[idx].active && */camDef(__camVtolDataSystem[idx].spawnStopObject))
// 		{
// 			if (getObject(__camVtolDataSystem[idx].spawnStopObject) === null)
// 			{
// 				camSetVtolSpawnState(false, idx); //Deactivate hit and runner VTOLs.
// 			}
// 			else
// 			{
// 				camSetVtolSpawnState(true, idx); // Remain active/reactivate
// 			}
// 		}
// 	}
// }

function __camSpawnVtols()
{
	for (let idx = 0; idx < __camVtolDataSystem.length; ++idx)
	{
		const vds = __camVtolDataSystem[idx];
		if (!vds.active 
			|| (camDef(vds.spawnStopObject) && getObject(vds.spawnStopObject) === null))
		{
			continue;
		}
		if (gameTime < vds.nextSpawnTime)
		{
			if (vds.isFirstSpawn)
			{
				vds.isFirstSpawn = false;
			}
			else
			{
				continue;
			}
		}
		else
		{
			if (camDef(vds.timer))
			{
				vds.nextSpawnTime = gameTime + (vds.timer * vds.dMultiplier);
			}
			else
			{
				// One-time VTOL spawn
				vds.active = false;
			}
		}

		// Default VTOL amounts
		let minVtolAmount = 5;
		let maxRandomAdditions = 2;

		if (camDef(vds.extras))
		{
			if (camDef(vds.extras.minVTOLs))
			{
				minVtolAmount = vds.extras.minVTOLs;
			}
			if (camDef(vds.extras.maxRandomVTOLs))
			{
				maxRandomAdditions = vds.extras.maxRandomVTOLs;
			}
		}

		const __AMOUNT = minVtolAmount + camRand(maxRandomAdditions + 1);
		const droids = [];
		let pos;
		let targetPlayer;
		let targetPos;
		let targetRadius;

		//Make sure to catch multiple start positions also.
		if (vds.startPosition instanceof Array)
		{
			pos = camRandFrom(vds.startPosition);
		}
		else if (camDef(vds.startPosition) && vds.startPosition)
		{
			pos = vds.startPosition;
		}
		else
		{
			pos = camGenerateRandomMapEdgeCoordinate();
		}

		if (!camDef(vds.extras))
		{
			//Pick some droids randomly.
			for (let i = 0; i < __AMOUNT; ++i)
			{
				droids.push(camRandFrom(vds.templates));
			}
		}
		else
		{
			let lim = __AMOUNT;
			let alternate = false;
			targetPlayer = vds.extras.targetPlayer;
			targetPos = vds.extras.pos;
			targetRadius = vds.extras.radius;
			callback = vds.extras.callback;
			if (camDef(vds.extras.alternate))
			{
				alternate = vds.extras.alternate; //Only use one template type
			}
			if (!camDef(vds.extras.altIdx))
			{
				vds.extras.altIdx = 0;
			}
			if (camDef(vds.extras.limit))
			{
				//support an array of limits for each template
				if (vds.extras.limit instanceof Array)
				{
					lim = vds.extras.limit[vds.extras.altIdx]; //max templates to use
				}
				else
				{
					lim = vds.extras.limit;
				}
			}

			for (let i = 0; i < lim; ++i)
			{
				if (!alternate)
				{
					droids.push(camRandFrom(vds.templates));
				}
				else
				{
					droids.push(vds.templates[vds.extras.altIdx]);
				}
			}

			if (vds.extras.altIdx < (vds.templates.length - 1))
			{
				++vds.extras.altIdx;
			}
			else
			{
				vds.extras.altIdx = 0;
			}
		}

		//...And send them.
		// (Also store the group of the new VTOLs)
		const group = camSendReinforcement(vds.player, camMakePos(pos), droids, CAM_REINFORCE_GROUND, {
			order: (camDef(callback)) ? CAM_ORDER_STRIKE : CAM_ORDER_ATTACK,
			data: {
				regroup: false,
				count: -1,
				targetPlayer: targetPlayer,
				pos: targetPos,
				radius: targetRadius,
				callback: callback,
				altOrder: CAM_ORDER_ATTACK
			}
		});

		if (camDef(vds.extras) && vds.extras.dynamic)
		{
			// If dynamic mode is enabled, assume all VTOLs will die, and adjust the time modifier accordingly.
			// When all VTOLs die, the multiplier increases by 0.5, up to a max of 2x spawn delay.
			// If all VTOLs end up surviving, the multiplier will decrease by a net change of 0.5, down to 0.5x spawn delay (or double speed).
			vds.dMultiplier = Math.min(2.0, vds.dMultiplier + 0.5);

			// Store a list of the VTOL droid IDs
			const groupDroids = enumGroup(group);
			for (const droid of groupDroids)
			{
				vds.vtolIds.push(droid.id);
			}
		}
	}
}

function __camRetreatVtols()
{
	for (let idx = 0; idx < __camVtolDataSystem.length; ++idx)
	{
		const vds = __camVtolDataSystem[idx];
		if (vds.active &&
			camDef(vds.exitPosition.x) &&
			camDef(vds.exitPosition.y) &&
			enumStruct(vds.player, REARM_PAD).length === 0)
		{
			const __VTOL_RETURN_ARMED = 1; // run-away if weapon ammo is less than...
			const vtols = enumDroid(vds.player).filter((obj) => (isVTOL(obj)));

			for (let i = 0, len = vtols.length; i < len; ++i)
			{
				const vt = vtols[i];
				for (let c = 0, len2 = vt.weapons.length; c < len2; ++c)
				{
					if ((vt.order === DORDER_RTB) || (vt.weapons[c].armed < __VTOL_RETURN_ARMED))
					{
						orderDroidLoc(vt, DORDER_MOVE, vds.exitPosition.x, vds.exitPosition.y);
						break;
					}
				}
			}
		}
	}
}

// Called when a VTOL successfully escapes the map
// Used to update dynamic VTOL spawn times
function __camVtolEscaped(id)
{
	// Check which VTOL system the escapee belongs to
	for (let idx = 0; idx < __camVtolDataSystem.length; ++idx)
	{
		const vds = __camVtolDataSystem[idx];
		if (camDef(vds.extras) && vds.extras.dynamic)
		{
			// See if this VTOL matches one of the ones in the system group
			for (const vtolId of vds.vtolIds)
			{
				if (id === vtolId)
				{
					// Reduce the time multiplier
					// NOTE: the (* 2) part is to offset the presumptive change made when the VTOLs were spawned
					vds.dMultiplier = Math.max(0.5, vds.dMultiplier - (0.5 / vds.vtolIds.length * 2));
					return; // No need to check further
				}
			}
		}
	}
}
