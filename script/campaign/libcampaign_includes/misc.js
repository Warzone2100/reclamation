
////////////////////////////////////////////////////////////////////////////////
// Misc useful stuff.
////////////////////////////////////////////////////////////////////////////////

//;; ## camDef(something)
//;;
//;; Returns `false` if something is JavaScript-undefined, `true` otherwise.
//;;
//;; @param {*} something
//;; @returns {boolean}
//;;
function camDef(something)
{
	return typeof something !== "undefined";
}

//;; ## camIsString(something)
//;;
//;; Returns `true` if something is a string, `false` otherwise.
//;;
//;; @param {*} something
//;; @returns {boolean}
//;;
function camIsString(something)
{
	return typeof something === "string";
}

//;; ## camRand(max)
//;;
//;; A non-synchronous random integer in range [0, max - 1].
//;;
//;; @param {number} max
//;; @returns {number}
//;;
function camRand(max)
{
	if (max > 0)
	{
		return Math.floor(Math.random() * max);
	}
	camDebug("Max should be positive");
}

//;; ## camRandFrom(array)
//;;
//;; Returns a random element from the given array.
//;;
//;; @param {number} max
//;; @returns {number}
//;;
function camRandFrom(array)
{
	if (array.length > 0)
	{
		return array[camRand(array.length)];
	}
	camDebug("Array has no elements!");
}

//;; ## camRandPosIn(area)
//;;
//;; Returns a position from the given area object/label.
//;;
//;; @param {string|Object} area
//;; @returns {Object}
//;;
function camRandPosIn(area)
{
	if (camIsString(area))
	{
		area = getObject(area);
	}

	if (camDef(area.x2))
	{
		return {
			x: area.x + camRand(area.x2 - area.x),
			y: area.y + camRand(area.y2 - area.y)
		};
	}
	camDebug("Couldn't make random coordinates in area!");
}

//;; ## camCallOnce(functionName)
//;;
//;; Call a function by name, but only if it has not been called yet.
//;;
//;; @param {string} functionName
//;; @returns {void}
//;;
function camCallOnce(functionName)
{
	if (camDef(__camCalledOnce[functionName]) && __camCalledOnce[functionName])
	{
		return;
	}
	__camCalledOnce[functionName] = true;
	__camGlobalContext()[functionName]();
}

//;; ## camSafeRemoveObject(obj[, specialEffects])
//;;
//;; Remove a game object (by value or label) if it exists, do nothing otherwise.
//;;
//;; @param {string|Object} obj
//;; @param {boolean} [specialEffects]
//;; @returns {void}
//;;
function camSafeRemoveObject(obj, specialEffects)
{
	if (__camLevelEnded)
	{
		return;
	}
	if (camIsString(obj))
	{
		obj = getObject(obj);
	}
	if (camDef(obj) && obj)
	{
		if (obj.type === DROID && obj.isVTOL && !specialEffects)
		{
			// If we're quietly removing a VTOL, assume it "escapes" the map
			__camVtolEscaped(obj.id);
		}

		removeObject(obj, specialEffects);
	}
}

//;; ## camMakePos(label|object|x[, y])
//;;
//;; Make a `POSITION`-like object, unless already done.
//;; Often useful for making functions that would accept positions in both `x,y` and `{x: x, y: y}` forms.
//;; Also accepts labels. If label of `AREA` is given, returns the center of the area.
//;; If an existing object or label of such is given, returns a safe JavaScript object containing its `x`, `y` and `id`.
//;;
//;; @param {number|string|Object|undefined} x
//;; @param {number} [y]
//;; @returns {Object|undefined}
//;;
function camMakePos(x, y)
{
	if (camDef(y))
	{
		return { x: x, y: y };
	}
	if (!camDef(x))
	{
		return undefined;
	}
	let obj = x;
	if (camIsString(x))
	{
		obj = getObject(x);
	}
	if (!camDef(obj) || !obj)
	{
		camDebug("Failed at", x);
		return undefined;
	}
	switch (obj.type)
	{
		case DROID:
		case STRUCTURE:
		case FEATURE:
			// store ID for those as well.
			return { x: obj.x, y: obj.y, id: obj.id };
		case POSITION:
		case RADIUS:
			return obj;
		case AREA:
			return {
				x: Math.floor((obj.x + obj.x2) / 2),
				y: Math.floor((obj.y + obj.y2) / 2)
			};
		case GROUP:
		default:
			// already a pos-like object?
			if (camDef(obj.x) && camDef(obj.y))
			{
				return { x: obj.x, y: obj.y };
			}
			camDebug("Not implemented:", obj.type);
			return undefined;
	}
}

//;; ## camDist(x1, y1, x2, y2 | pos1, x2, y2 | x1, y1, pos2 | pos1, pos2)
//;;
//;; A wrapper for `distBetweenTwoPoints()`.
//;;
//;; @param {number|Object} x1
//;; @param {number|Object} y1
//;; @param {number} [x2]
//;; @param {number} [y2]
//;; @returns {number}
//;;
function camDist(x1, y1, x2, y2)
{
	if (camDef(y2)) // standard
	{
		return distBetweenTwoPoints(x1, y1, x2, y2);
	}
	if (!camDef(x2)) // pos1, pos2
	{
		return distBetweenTwoPoints(x1.x, x1.y, y1.x, y1.y);
	}
	const pos2 = camMakePos(x2);
	if (camDef(pos2.x)) // x2 is pos2
	{
		return distBetweenTwoPoints(x1, y1, pos2.x, pos2.y);
	}
	else // pos1, x2, y2
	{
		return distBetweenTwoPoints(x1.x, x1.y, y1, x2);
	}
}

//;; ## camPlayerMatchesFilter(playerId, playerFilter)
//;;
//;; A function to handle player filters in a way similar to how JS API functions (eg. `enumDroid(filter, ...)`) handle them.
//;;
//;; @param {number} playerId
//;; @param {number} playerFilter
//;; @returns {boolean}
//;;
function camPlayerMatchesFilter(playerId, playerFilter)
{
	switch (playerFilter) {
		case ALL_PLAYERS:
			return true;
		case ALLIES:
			return playerId === CAM_HUMAN_PLAYER || allianceExistsBetween(playerId, CAM_HUMAN_PLAYER);
		case ENEMIES:
			return playerId >= 0 && playerId < __CAM_MAX_PLAYERS && playerId !== CAM_HUMAN_PLAYER && !allianceExistsBetween(playerId, CAM_HUMAN_PLAYER);
		default:
			return playerId === playerFilter;
	}
}

//;; ## camRemoveDuplicates(items)
//;;
//;; Remove duplicate items from an array.
//;;
//;; @param {*[]} items
//;; @returns {*[]}
//;;
function camRemoveDuplicates(items)
{
	let prims = {"boolean":{}, "number":{}, "string":{}};
	const objs = [];

	return items.filter((item) => {
		const type = typeof item;
		if (type in prims)
		{
			return prims[type].hasOwnProperty(item) ? false : (prims[type][item] = true);
		}
		else
		{
			return objs.indexOf(item) >= 0 ? false : objs.push(item);
		}
	});
}

//;; ## camCountStructuresInArea(label[, playerFilter])
//;;
//;; Mimics wzscript's `numStructsButNotWallsInArea()`.
//;;
//;; @param {string} label
//;; @param {number} [playerFilter]
//;; @returns {number}
//;;
function camCountStructuresInArea(label, playerFilter)
{
	if (!camDef(playerFilter))
	{
		playerFilter = CAM_HUMAN_PLAYER;
	}
	const list = enumArea(label, playerFilter, false);
	let ret = 0;
	for (let i = 0, l = list.length; i < l; ++i)
	{
		const object = list[i];
		if (object.type === STRUCTURE && object.stattype !== WALL && object.status === BUILT)
		{
			++ret;
		}
	}
	return ret;
}

//;; ## camChangeOnDiff(numericValue[, inverse])
//;;
//;; Change a numeric value based on campaign difficulty.
//;;
//;; @param {number} numericValue
//;; @param {number} inverse
//;; @returns {number}
//;;
function camChangeOnDiff(numericValue, inverse)
{
	let modifier = 0;

	switch (difficulty)
	{
		case SUPEREASY:
			modifier = 2;
			break;
		case EASY:
			modifier = 1.5;
			break;
		case MEDIUM:
			modifier = 1;
			break;
		case HARD:
			modifier = 0.85;
			break;
		case INSANE:
			modifier = 0.70;
			break;
		default:
			modifier = 1;
			break;
	}

	if (camDef(inverse) && inverse)
	{
		if (difficulty !== SUPEREASY)
		{
			modifier = 2 - modifier;
		}
		else
		{
			// Don't let the modifier equal zero
			modifier = 0.25;
		}
	}

	return Math.floor(numericValue * modifier);
}

//;; ## camIsSystemDroid(gameObject)
//;;
//;; Determine if the passed in object is a non-weapon based droid.
//;;
//;; @param {Object} gameObject
//;; @returns {boolean}
//;;
function camIsSystemDroid(gameObject)
{
	if (!camDef(gameObject) || !gameObject)
	{
		return false;
	}

	if (gameObject.type !== DROID)
	{
		camTrace("Non-droid: " + gameObject.type + " pl: " + gameObject.name);
		return false;
	}

	return (gameObject.droidType === DROID_SENSOR || gameObject.droidType === DROID_CONSTRUCT || gameObject.droidType === DROID_REPAIR);
}

//;; ## camMakeGroup(what[, playerFilter])
//;;
//;; Make a new group out of array of droids, single game object, or label string,
//;; with fuzzy auto-detection of argument type.
//;; Only droids would be added to the group. `playerFilter` can be one of a
//;; player index, `ALL_PLAYERS`, `ALLIES` or `ENEMIES`; defaults to `ALL_PLAYERS`.
//;;
//;; @param {string|Object|Object[]} what
//;; @param {number} [playerFilter]
//;; @returns {number|void}
//;;
function camMakeGroup(what, playerFilter)
{
	if (!camDef(playerFilter))
	{
		playerFilter = ALL_PLAYERS;
	}
	let array;
	let obj;
	if (camIsString(what)) // label
	{
		obj = getObject(what);
	}
	else if (camDef(what.length)) // array
	{
		array = what;
	}
	else if (camDef(what.type)) // object
	{
		obj = what;
	}
	if (camDef(obj))
	{
		switch (obj.type) {
			case POSITION:
				obj = getObject(obj.x, obj.y);
				// fall-through
			case DROID:
			case STRUCTURE:
			case FEATURE:
				array = [ obj ];
				break;
			case AREA:
				array = enumArea(obj.x, obj.y, obj.x2, obj.y2, ALL_PLAYERS, false);
				break;
			case RADIUS:
				array = enumRange(obj.x, obj.y, obj.radius, ALL_PLAYERS, false);
				break;
			case GROUP:
				array = enumGroup(obj.id);
				break;
			default:
				camDebug("Unknown object type", obj.type);
		}
	}
	if (camDef(array))
	{
		const group = camNewGroup();
		for (let i = 0, l = array.length; i < l; ++i)
		{
			const o = array[i];
			if (!camDef(o) || !o)
			{
				camDebug("Trying to add", o);
				continue;
			}
			if (o.type === DROID && o.droidType !== DROID_CONSTRUCT && camPlayerMatchesFilter(o.player, playerFilter))
			{
				groupAdd(group, o);
			}
		}
		return group;
	}
	camDebug("Cannot parse", what);
}

//;; ## camBreakAlliances()
//;;
//;; Break alliances between all players.
//;;
//;; @returns {void}
//;;
function camBreakAlliances()
{
	for (let i = 0; i < __CAM_MAX_PLAYERS; ++i)
	{
		for (let c = 0; c < __CAM_MAX_PLAYERS; ++c)
		{
			if (i !== c && allianceExistsBetween(i, c) === true)
			{
				setAlliance(i, c, false);
			}
		}
	}
}

//;; ## camGenerateRandomMapEdgeCoordinate(reachPosition)
//;;
//;; Returns a random coordinate anywhere on the edge of the map that reachs a position.
//;;
//;; @param {Object} reachPosition
//;; @returns {Object}
//;;
function camGenerateRandomMapEdgeCoordinate(reachPosition)
{
	const limits = getScrollLimits();
	let loc;

	do
	{
		const location = {x: 0, y: 0};
		let xWasRandom = false;

		if (camRand(100) < 50)
		{
			location.x = camRand(limits.x2 + 1);
			if (location.x < (limits.x + 2))
			{
				location.x = limits.x + 2;
			}
			else if (location.x > (limits.x2 - 2))
			{
				location.x = limits.x2 - 2;
			}
			xWasRandom = true;
		}
		else
		{
			location.x = (camRand(100) < 50) ? (limits.x2 - 2) : (limits.x + 2);
		}

		if (!xWasRandom && (camRand(100) < 50))
		{
			location.y = camRand(limits.y2 + 1);
			if (location.y < (limits.y + 2))
			{
				location.y = limits.y + 2;
			}
			else if (location.y > (limits.y2 - 2))
			{
				location.y = limits.y2 - 2;
			}
		}
		else
		{
			location.y = (camRand(100) < 50) ? (limits.y2 - 2) : (limits.y + 2);
		}

		loc = location;
	} while (camDef(reachPosition) && reachPosition && !propulsionCanReach("wheeled01", reachPosition.x, reachPosition.y, loc.x, loc.y));

	return loc;
}

//;; ## camGenerateRandomMapCoordinate(reachPosition)
//;;
//;; Returns a random coordinate anywhere on the map
//;;
//;; @param {Object} reachPosition
//;; @returns {Object}
//;;
function camGenerateRandomMapCoordinate(reachPosition, distFromReach, scanObjectRadius)
{
	if (!camDef(distFromReach))
	{
		distFromReach = 10;
	}
	if (!camDef(scanObjectRadius))
	{
		scanObjectRadius = 2;
	}

	const limits = getScrollLimits();
	let pos;

	do
	{
		let randomPos = {x: camRand(limits.x2), y: camRand(limits.y2)};

		if (randomPos.x < (limits.x + 2))
		{
			randomPos.x = limits.x + 2;
		}
		else if (randomPos.x > (limits.x2 - 2))
		{
			randomPos.x = limits.x2 - 2;
		}

		if (randomPos.y < (limits.y + 2))
		{
			randomPos.y = limits.y;
		}
		else if (randomPos.y > (limits.y2 - 2))
		{
			randomPos.y = limits.y2 - 2;
		}

		pos = randomPos;
	} while (camDef(reachPosition) &&
		reachPosition &&
		!propulsionCanReach("wheeled01", reachPosition.x, reachPosition.y, pos.x, pos.y) &&
		(camDist(pos, reachPosition) < distFromReach) &&
		(enumRange(pos.x, pos.y, scanObjectRadius, ALL_PLAYERS, false).length > 0));

	return pos;
}

//;; ## camDiscoverCampaign()
//;;
//;; Figures out what campaign we are in without reliance on the source at all.
//;;
//;; @returns {number}
//;;
function camDiscoverCampaign()
{
	if (__cam_reclamationLevels.includes(__camNextLevel) || __camNextLevel === CAM_A0_OUT)
	{
		return __CAM_RECLAMATION_CAMPAIGN_NUMBER;
	}
	else if (__cam_prologueLevels.includes(__camNextLevel) || __camNextLevel === __cam_act1Levels[0])
	{
		return __CAM_PROLOGUE_CAMPAIGN_NUMBER;
	}
	else if (__cam_act1Levels.includes(__camNextLevel) || __camNextLevel === __cam_act2Levels[0])
	{
		return __CAM_ACT1_CAMPAIGN_NUMBER;
	}
	else if (__cam_act2Levels.includes(__camNextLevel) || __camNextLevel === __cam_act3Levels[0])
	{
		return __CAM_ACT2_CAMPAIGN_NUMBER;
	}
	else if (__cam_act3Levels.includes(__camNextLevel) || __camNextLevel === __cam_act4Levels[0])
	{
		return __CAM_ACT3_CAMPAIGN_NUMBER;
	}
	else if (__cam_act4Levels.includes(__camNextLevel) || __camNextLevel === CAM_A4_OUT)
	{
		return __CAM_ACT4_CAMPAIGN_NUMBER;
	}

	return __CAM_UNKNOWN_CAMPAIGN_NUMBER;
}

//;; ## camSetDroidRank(droid, rank)
//;; Sets a droid's rank to the given value.
//;; `droid` must be a droid object, while `rank`
//;; can be either an integer or name of a rank.
//;; `droid` may also be an array of droid objects.
//;;
//;; @param {Object|[Object]} droid
//;; @param {number | String} rank
//;; @returns {void}
//;;
function camSetDroidRank(droid, rank)
{
	if (droid instanceof Array)
	{
		// Array of droids...
		for (const droidling of droid)
		{
			camSetDroidRank(droidling, rank);
		}
		return;
	}

	if (!camDef(droid) || droid.type !== DROID)
	{
		camTrace("Tried setting an unknown object's rank.");
		return;
	}

	if (droid.droidType === DROID_CONSTRUCT || droid.droidType === DROID_REPAIR)
	{
		camTrace("Tried setting the rank of a non-sensor system droid.");
		return;
	}

	let xpAmount = 0;
	if (camIsString(rank)) // Rank as a string?
	{
		switch (rank)
		{
			case "Green":
				xpAmount = 4;
				break;
			case "Trained":
				xpAmount = 8;
				break;
			case "Regular":
				xpAmount = 16;
				break;
			case "Professional":
				xpAmount = 32;
				break;
			case "Veteran":
				xpAmount = 64;
				break;
			case "Elite":
				xpAmount = 128;
				break;
			case "Special":
				xpAmount = 256;
				break;
			case "Hero":
				xpAmount = 512;
				break;
			default:
				camDebug("unknown rank given to camSetDroidRank!");
				return;
		}
	}
	else // Rank as an integer?
	{
		if (rank > 0)
		{
			xpAmount = Math.pow(2, rank + 1);
		}
	}

	if (droid.droidType === DROID_COMMAND)
	{
		xpAmount *= 4; // Commanders need 4x the xp
	}

	setDroidExperience(droid, xpAmount);
}

//;; Returns a droid's rank as an integer.
//;; ```droid``` must be a droid object.
//;;
//;; @param {Object} droid
//;; @returns {number}
//;;
function camGetDroidRank(droid)
{
	if (!camDef(droid) || droid.type !== DROID)
	{
		camTrace("Tried getting an unknown object's rank.");
		return;
	}

	let xpAmount = droid.experience;
	if (droid.droidType === DROID_COMMAND)
	{
		// Pretend commanders have 1/4th the XP they actually do
		xpAmount /= 4;
	}

	if (xpAmount >= 512) return 8; // Hero
	if (xpAmount >= 256) return 7; // Special
	if (xpAmount >= 128) return 6; // Elite
	if (xpAmount >= 64) return 5; // Veteran
	if (xpAmount >= 32) return 4; // Professional
	if (xpAmount >= 16) return 3; // Regular
	if (xpAmount >= 8) return 2; // Trained
	if (xpAmount >= 4) return 1; // Green
	return 0; // Rookie
}

//;; Returns the amount of units a commander can handle base on rank.
//;; ```droid``` must be a commander droid.
//;;
//;; @param {Object} commander
//;; @returns {number|undefined}
//;;
function camGetCommanderMaxGroupSize(commander)
{
	if (!camDef(commander) || commander.type !== DROID || commander.droidType !== DROID_COMMAND)
	{
		camDebug("camGetCommanderMaxGroupSize must be given a commander droid object.");
		return;
	}

	return 6 + (2 * camGetDroidRank(commander));
}

//;; Returns true if the given position lies within the given area label
//;;
//;; @param {Object | string} pos
//;; @param {Object | string} area
//;; @returns {boolean}
//;;
function camWithinArea(pos, area)
{
	const p = camMakePos(pos);
	let a = area;
	if (camIsString(area))
	{
		a = getObject(area);
	}
	if (!camDef(a))
	{
		console("area is undefined!");
	}
	if (a === null)
	{
		console("area is null!");
	}
	
	return (p.x >= a.x 
		&& p.x <= a.x2
		&& p.y >= a.y 
		&& p.y <= a.y2);
}

//;; Returns an array where all instances of item1 are replaced with item2
//;;
//;; @param {*[]} array
//;; @param {*} area
//;; @returns {*[]}
//;;
function camArrayReplaceWith(array, item1, item2)
{
	let index = array.indexOf(item1);
	while (index !== -1)
	{
		array[index] = item2;
		index = array.indexOf(item1);
	}
	return array;
}

//;; ## camGetCompStats(compName, compType[, player])
//;;
//;; Returns stats about the given component from the global Stats data structure.
//;; If a player is provided, look up stats from their specified Upgrades structure,
//;; which contains stats that can be modified through research upgrades.
//;; For example, `camGetCompStats("Lancer", "Weapon", CAM_HUMAN_PLAYER)` can be used
//;; to get the current stats of the player's Lancer rockets.
//;; ```compType``` can be "Body", "Brain", "Building", "Construct", "ECM", "Propulsion",
//;; "Repair", "Sensor" or "Weapon".
//;;
//;; @param {string} compName
//;; @param {string} compType
//;; @param {number} player
//;; @returns {Object}
//;; 
function camGetCompStats(compName, compType, player)
{
	if (camDef(player))
	{
		return Upgrades[player][compType][compName];
	}
	else
	{
		return Stats[compType][compName];
	}
}

//;; ## camGetCompNameFromId(compId, compType)
//;;
//;; Returns the external name of a component from it's internal ID name.
//;; For example, `camGetCompNameFromId("Rocket-LtA-T", "Weapon")` returns "Lancer".
//;;
//;; @param {string} compName
//;; @param {string} compType
//;; @returns {string}
//;; 
function camGetCompNameFromId(compId, compType)
{
	// FIXME: O(n) lookup here
	const compList = Stats[compType];
	for (let compName in compList)
	{
		if (compList[compName].Id === compId)
		{
			return compName;
		}
	}	
}

// Simple wrapper for enumStruct. Allows the use of ALL_PLAYERS.
function camEnumStruct(player)
{
	if (player !== ALL_PLAYERS)
	{
		return enumStruct(player);
	}
	else
	{
		let structList = [];
		for (let i = 0; i <= __CAM_MAX_PLAYERS; i++)
		{
			structList = structList.concat(enumStruct(i));
		}
		return structList;
	}
}

// Simple wrapper for enumDroid. Allows the use of ALL_PLAYERS.
function camEnumDroid(player)
{
	if (player !== ALL_PLAYERS)
	{
		return enumDroid(player);
	}
	else
	{
		let droidList = [];
		for (let i = 0; i <= __CAM_MAX_PLAYERS; i++)
		{
			droidList = droidList.concat(enumDroid(i));
		}
		return droidList;
	}
}

//;; ## camNameTemplate(weapon, body, propulsion)
//;; Returns a nice name for the passed in template
//;; Takes in either a template object or a turret + body + propulsion
//;;
//;; @param {string | Object} weapon
//;; @param {string} body
//;; @param {string} propulsion
//;; @returns {string}
//;;
function camNameTemplate(weapon, body, propulsion)
{
	if (!camDef(body))
	{
		// Template passed in...
		propulsion = weapon.prop;
		body = weapon.body;
		weapon = weapon.weap;
	}

	const __MULTI_TURRET = (typeof weapon === "object" && camDef(weapon[1]));
	// If `weapon` is an array of weapons, we only care about the first one.
	weapon = __MULTI_TURRET ? weapon[0] : weapon;

	let name;
	let weapName = camGetCompNameFromId(weapon, "Weapon");
	if (!camDef(weapName))
	{
		// Sensor unit?
		weapName = camGetCompNameFromId(weapon, "Sensor");
		if (!camDef(weapName))
		{
			// Truck??
			weapName = camGetCompNameFromId(weapon, "Construct");
			if (!camDef(weapName))
			{
				// Repair Turret???
				weapName = camGetCompNameFromId(weapon, "Repair");
				if (!camDef(weapName))
				{
					// Commander????
					weapName = camGetCompNameFromId(weapon, "Brain");
					if (!camDef(weapName))
					{
						// ?????
						weapName = "?";
					}
				}
			}
		}
	}

	if (body === "CyborgLightBody" || body === "CyborgHeavyBody")
	{
		// Just use the weapon name for cyborgs
		name = weapName;
	}
	else
	{
		const __BODY_NAME = camGetCompNameFromId(body, "Body");
		const __PROP_NAME = camGetCompNameFromId(propulsion, "Propulsion");
		name = (__MULTI_TURRET) 
			? [ _(weapName), _("Hydra"), _(__BODY_NAME), _(__PROP_NAME) ].join(" ") // Add "Hydra" if multiple turrets
			: [ _(weapName), _(__BODY_NAME), _(__PROP_NAME) ].join(" ");
	}
	return name;
}

//;; ## camDroidMatchesTemplate(droid, template)
//;; Returns true if a given droid matches a given template
//;; NOTE: Multi-turret droids/templates are not properly supported!
//;;
//;; @param {Object} droid
//;; @param {Object} template
//;; @returns {boolean}
//;;
function camDroidMatchesTemplate(droid, template)
{
	// First check if the propulsion and body match
	if (template.prop != droid.propulsion || template.body != droid.body)
	{
		return false;
	}

	// Now handle the turret
	switch (droid.droidType)
	{
		case DROID_CONSTRUCT:
		{
			return (template.weap == "Spade1Mk1" || template.weap == "CyborgSpade");
		}
		case DROID_REPAIR:
		{
			// FIXME: We currently can't tell which repair turret is equipped on a unit!
			// We can only determine if a unit has *a* repair turret!
			return (template.weap == "LightRepair1" || template.weap == "HeavyRepair" || template.weap == "CyborgRepair");
		}
		case DROID_SENSOR:
		{
			// FIXME: We currently can't tell the CB and non CB sensor turrets apart!
			return ((droid.isSensor && (template.weap == "SensorTurret1Mk1" || template.weap == "Sys-VstrikeTurret01"))
				|| (droid.isCB && (template.weap == "Sys-CBTurret01" || template.weap == "Sys-VTOLCBTurret01")));
		}
		case DROID_COMMAND:
		{
			return (template.weap == "CommandBrain01");
		}
		default:
		{
			return (template.weap == droid.weapons[0].name);
		}
	}
}

//;; ## camFactoryCanProduceTemplate(template, factory)
//;; Returns true if a given template can be built by the given factory object.
//;;
//;; @param {Object} template
//;; @param {Object} factory
//;; @returns {boolean}
//;;
function camFactoryCanProduceTemplate(template, factory)
{
	// First, check if the factory has enough modules to produce the template's body
	const bodyName = camGetCompNameFromId(template.body, "Body"); // Returns a body's name (e.g. "Cobra")
	const bodySize = camGetCompStats(bodyName, "Body").Size; // Get body size (NOTE: The capitalization of "Size" is correct here!)
	// Return false if the body size is too large for the factory
	if (factory.modules < bodySize) return false;

	// Next, do a check to make sure scavenger factories can't produce non-scavenger units
	if (factory.name === "Scavenger Factory" || factory.name === "Infested Scavenger Factory")
	{
		// NOTE: We only need to check light bodies here, since larger bodies will automatically fail the previous check!
		if (template.body === "Body4ABT" || template.body === "Body1REC" || template.body === "Body2SUP" || template.body === "Body3MBT")
		{
			return false;
		}
		// NOTE: While Cyborg bodies are also technically "LIGHT", any sane cyborg template should be vetted by the next check.
	}
	else
	{
		if (template.body === "ScavCraneBody")
		{
			// Don't buid scav cranes out of normal factories
			return false;
		}
	}

	// Last, check if the propulsion matches the factory type
	switch (factory.stattype)
	{
		case CYBORG_FACTORY:
		{
			// Cyborg Legs
			return (template.prop === "CyborgLegs" || template.prop === "CyborgLegs02" || template.prop === "CyborgLegs03" || template.prop === "BoomTickLegs");
		}
		case VTOL_FACTORY:
		{
			// Any VTOL or Helicopter propulsion
			return (template.prop === "V-Tol" || template.prop === "V-Tol02" || template.prop === "V-Tol03" || template.prop === "Helicopter");
		}
		case FACTORY:
		{
			// Anything else
			return (template.prop !== "V-Tol" && template.prop !== "V-Tol02" && template.prop !== "V-Tol03" && template.prop !== "Helicopter"
				&& template.prop !== "CyborgLegs" && template.prop !== "CyborgLegs02" && template.prop !== "CyborgLegs03" && template.prop !== "BoomTickLegs");
		}
		default:
		{
			camDebug("Unknown factory type!");
			return false;
		}
	}
}

//;; ## camAutoReplaceObjectLabel(label[, data])
//;; Mark an object for automatic label replacement.
//;; If the object with this label is destroyed and then rebuilt, this label will automatically
//;; be reapplied.
//;; NOTE: Since position is used to determine if the object is the "same", this function only works with
//;; structures!
//;; See `cam_eventStructureBuilt` in `events.js` for how this is used.
//;; NOTE: Factories automatically call this function when set! There's no need to call this again within the level scripts.
//;;
//;; @param {string|string[]} label
//;; @returns {void}
//;;
function camAutoReplaceObjectLabel(label, data)
{
	if (!camIsString(label)) // Array of labels?
	{
		for (const subLabel of label)
		{
			camAutoReplaceObjectLabel(subLabel);
		}
		return;
	}

	let player;
	let x;
	let y;
	let stattype;
	const obj = getObject(label);
	
	if (camDef(data))
	{
		player = data.player;
		x = data.x;
		y = data.y;
		stattype = data.stattype;
	}
	else
	{
		if ((obj === null || obj.type !== STRUCTURE))
		{
			// No data
			camTrace("camAutoReplaceObjectLabel: No data for label \"" + label + "\"!");
			return;
		}
		else 
		{
			// Get data from the structure object
			player = obj.player;
			x = obj.x;
			y = obj.y;
			stattype = obj.stattype;
		}
	}

	__camLabelInfo.push({label: label, player: player, x: x, y: y, stattype: stattype});
}

//;; ## camAreaSecure(area[, player])
//;; Returns true if the area contains no units or structures hostile to the given player.
//;; If no player is provided, defaults to CAM_HUMAN_PLAYER.
//;; NOTE: This function ignores VTOL-like droids when considering if an area is secure
//;;
//;; @param {string|Object} area
//;; @param {number} player
//;; @returns {boolean}
//;;
function camAreaSecure(area, player)
{
	let a = area;
	if (camIsString(area))
	{
		a = getObject(area);
	}
	let x1 = a.x;
	let y1 = a.y;
	let x2 = a.x2;
	let y2 = a.y2;

	if (!player)
	{
		player = CAM_HUMAN_PLAYER;
	}

	return enumArea(x1, y1, x2, y2, ALL_PLAYERS, false).filter((obj) => (
		(obj.type === STRUCTURE || (obj.type === DROID && !obj.isVTOL)) && !allianceExistsBetween(obj.player, player))
	).length === 0;
}

//;; ## camSetObjectVision(playerId[, state])
//;; Makes objects belonging to the specified player grant vision to the player.
//;; `state` defaults to true if undefined.
//;;
//;; @param {number} playerId
//;; @param {boolean} state
//;; @returns {void}
//;;
function camSetObjectVision(playerId, state)
{
	if (!camDef(state))
	{
		state = true;
	}
	__camPlayerVisibilities[playerId] = state;
}

// NOTE: This function used to be in rules.js
function __camSetLimits()
{
	setDroidLimit(CAM_HUMAN_PLAYER, CAM_MAX_PLAYER_UNITS, DROID_ANY);
	setDroidLimit(CAM_HUMAN_PLAYER, CAM_MAX_PLAYER_COMMANDERS, DROID_COMMAND);
	setDroidLimit(CAM_HUMAN_PLAYER, CAM_MAX_PLAYER_CONSTRUCTORS, DROID_CONSTRUCT);

	for (let i = 0; i < maxPlayers; ++i)
	{
		setStructureLimits("A0PowerGenerator", 5, i);
		setStructureLimits("A0ResourceExtractor", 200, i);
		setStructureLimits("A0ResearchFacility", 5, i);
		setStructureLimits("A0LightFactory", 5, i);
		setStructureLimits("A0CyborgFactory", 5, i);
		setStructureLimits("A0VTolFactory1", 5, i);
		//non human players get five of these
		setStructureLimits("A0CommandCentre", i === CAM_HUMAN_PLAYER ? 1 : 5, i);
		setStructureLimits("A0ComDroidControl", i === CAM_HUMAN_PLAYER ? 1 : 5, i);
		setStructureLimits("A0CommandCentreNP", 5, i);
		setStructureLimits("A0CommandCentreCO", 5, i);
		setStructureLimits("A0CommandCentreNE", 5, i);
	}
}

//;; ## camEnsureDonateObject(obj, player)
//;; A hacky wrapper for donateObject that ensures that the given objects are donated to the player without conflicting with unit limits.
//;; `obj` can be a single object or a list of objects.
//;; NOTE: This function supports donating any object to any player, but should only be necessary for donating DROIDs to CAM_HUMAN_PLAYER.
//;;
//;; @param {Object|[Object]} obj
//;; @param {number} player
//;; @returns {void}
//;;
function camEnsureDonateObject(obj, player)
{
	// Raise the player's unit limit(s) 
	// NOTE: This is unnecessary for non-droid donations, but we don't bother checking the object types here.
	if (player === CAM_HUMAN_PLAYER) // NOTE: By default, all non-human players are only limited by the 16-bit limit
	{
		const __16BIT_LIMIT = 32767; // (2^15 - 1)
		setDroidLimit(player, __16BIT_LIMIT, DROID_ANY);
		setDroidLimit(player, __16BIT_LIMIT, DROID_COMMAND);
		setDroidLimit(player, __16BIT_LIMIT, DROID_CONSTRUCT);
	}

	// Donate the object(s)
	if (obj instanceof Array)
	{
		for (const ob of obj)
		{
			donateObject(ob, player);
		}
	}
	else // Single object
	{
		donateObject(obj, player);
	}

	// Restore the player's unit limit(s) to the default
	if (player === CAM_HUMAN_PLAYER)
	{
		__camSetLimits();
	}
}

//////////// privates

function __camGlobalContext()
{
	return Function('return this')(); // eslint-disable-line no-new-func
}

function __camFindClusters(list, size)
{
	// The good old cluster analysis algorithm taken from NullBot AI.
	const ret = { clusters: [], xav: [], yav: [], maxIdx: 0, maxCount: 0 };
	for (let i = list.length - 1; i >= 0; --i)
	{
		const __X = list[i].x;
		const __Y = list[i].y;
		let found = false;
		let n = 0;
		for (let j = 0; j < ret.clusters.length; ++j)
		{
			if (camDist(ret.xav[j], ret.yav[j], __X, __Y) < size)
			{
				n = ret.clusters[j].length;
				ret.clusters[j][n] = list[i];
				ret.xav[j] = Math.floor((n * ret.xav[j] + __X) / (n + 1));
				ret.yav[j] = Math.floor((n * ret.yav[j] + __Y) / (n + 1));
				if (ret.clusters[j].length > ret.maxCount)
				{
					ret.maxIdx = j;
					ret.maxCount = ret.clusters[j].length;
				}
				found = true;
				break;
			}
		}
		if (!found)
		{
			n = ret.clusters.length;
			ret.clusters[n] = [list[i]];
			ret.xav[n] = __X;
			ret.yav[n] = __Y;
			if (1 > ret.maxCount)
			{
				ret.maxIdx = n;
				ret.maxCount = 1;
			}
		}
	}
	return ret;
}

/* Called every second after eventStartLevel(). */
function __camTick()
{
	if (camDef(__camWinLossCallback))
	{
		__camGlobalContext()[__camWinLossCallback]();
	}
	__camBasesTick();
}

//Reset AI power back to highest storage possible.
function __camAiPowerReset()
{
	for (let i = 1; i < __CAM_MAX_PLAYERS; ++i)
	{
		setPower(__CAM_AI_POWER, i);
	}
}

// This used to be in `rules.js``
function __camResetPower()
{	
	// Rate changes by 15% per difficulty level, with Normal at 100%
	let powerProductionRate = 100 - (15 * (difficulty - 2));
	
	const __POWER_LIMIT = __camGetPowerLimit();

	setPowerModifier(powerProductionRate, CAM_HUMAN_PLAYER);
	setPowerStorageMaximum(__POWER_LIMIT, CAM_HUMAN_PLAYER);
	if (playerPower(CAM_HUMAN_PLAYER) >= __POWER_LIMIT)
	{
		setPower(__POWER_LIMIT - 1, CAM_HUMAN_PLAYER);
	}
}

function __camGetPowerLimit()
{
	let powerLimit;
	if (!tweakOptions.rec_timerlessMode || (camDef(__camNextLevel) && (__camNextLevel === CAM_A0_OUT || __camNextLevel === CAM_A0_OUT)))
	{
		powerLimit = __camPowerLimits[difficulty];
	}
	else
	{
		// Enforce stricter power limits on timerless mode
		powerLimit = __camTimerlessPowerLimits[difficulty];
	}

	// Increase the power limits as the player progresses through the acts
	const __CAM_NUM = camDiscoverCampaign();
	if (difficulty >= MEDIUM && __CAM_NUM > 1)
	{
		// Increase by 20% per Act after the Prologue.
		powerLimit += (powerLimit * 0.2) * (__CAM_NUM - 1);
	}

	return powerLimit;
}



// Grant the player momentary vision of all objects specified by camSetObjectVision()
function __camViewObjects()
{
	let objList = [];

	for (const player in __camPlayerVisibilities)
	{
		if (__camPlayerVisibilities[player])
		{
			objList = objList.concat(enumStruct(player).filter((struct) => (struct.stattype !== WALL)));
			objList = objList.concat(enumDroid(player));
		}
	}

	for (let i = 0; i < objList.length; i++)
	{
		addSpotter(objList[i].x, objList[i].y, CAM_HUMAN_PLAYER, __CAM_OBJ_VISION_RANGE, false, gameTime + camSecondsToMilliseconds(1));
	}
}