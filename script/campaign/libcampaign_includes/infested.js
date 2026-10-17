
////////////////////////////////////////////////////////////////////////////////
// Infested-related functions.
////////////////////////////////////////////////////////////////////////////////

//;; ## camRandInfTemplates(coreTemplates, coreSize, fodderSize[, overrideChance])
//;; Returns a list of templates created by randomly choosing a number of core templates and adding Infested Civilians.
//;; If provided, `overrideChance` (a number between 0 and 99) determines of replacing the fodder units with Bashers.
//;; If this chance succeeds, 1 Basher is added for every 2 Civilians that would be added.
//;;
//;; @param {Object[]} coreTemplates
//;; @param {number} coreSize
//;; @param {number} fodderSize
//;; @param {number} overrideChance
//;; @returns {Object[]}
//;;
function camRandInfTemplates(coreTemplates, coreSize, fodderSize, overrideChance)
{
	const droids = [];

	// Add core templates
	for (let i = 0; i < coreSize; ++i)
	{
		droids.push(camRandFrom(coreTemplates));
	}

	// Add fodder
	if (!camDef(overrideChance) || camRand(100) > overrideChance)
	{
		const infCiv = [cTempl.infciv, cTempl.infciv2]; // These templates have slightly different animations
		for (let i = 0; i < fodderSize; ++i)
		{
			droids.push(camRandFrom(infCiv));
		}
	}
	else
	{
		// Override fodder with Bashers
		for (let i = 0; i < fodderSize; i += 2) // Increment by 2
		{
			droids.push(cTempl.basher);
		}
	}

	return droids;
}

// Cause an explosion after a boomtick dies
function __camDetonateBoomtick(boomBaitId)
{
	const bait = getObject(DROID, CAM_INFESTED, boomBaitId);
	if (!camDef(bait))
	{
		return;
	}
	else
	{
		fireWeaponAtObj("BoomTickBlast", bait, CAM_INFESTED);
		// Remove the bait after the boom
		queue("__camRemoveBoomBait", __CAM_TICKS_PER_FRAME, boomBaitId + "");
	}
}

// Loudly remove the boom bait object
function __camRemoveBoomBait(boomBaitId)
{
	camSafeRemoveObject(getObject(DROID, CAM_INFESTED, boomBaitId), true);
}

// Replaces structures and components with "Infested" ones.
// Called when something is absorbed by the Infested.
function __camInfestObj(obj, fromPlayer)
{
	if (obj.type === DROID)
	{
		// Droid absorbed; check if it is an illegal type
		if (!__camIsLegalInfDroid(obj))
		{
			// Illegal Infested unit; blow it up!
			camSafeRemoveObject(obj, true);
		}
		else
		{
			// Let the research handle its components
			completeResearch("R-Script-Infest", CAM_INFESTED, true);

			// Add the unit to the Infested global attack group
			if (!camDef(__camInfestedGlobalAttackGroup))
			{
				__camInfestedGlobalAttackGroup = camMakeGroup(obj);
				camManageGroup(__camInfestedGlobalAttackGroup, CAM_ORDER_ATTACK, {
					simplified: true,
					removable: false,
					targetPlayer: CAM_HUMAN_PLAYER
				});
			}
			else
			{
				groupAdd(__camInfestedGlobalAttackGroup, obj);
			}
		}
	}
	else if (obj.type === STRUCTURE)
	{
		// Structure absorbed; replace it with an infested variant if applicable

		const structId = camGetCompStats(obj.name, "Building").Id;
		const __IS_FACTORY = obj.stattype === FACTORY || obj.stattype === CYBORG_FACTORY; // Ignore VTOL Factories...

		let infStructId;
		if (structId === "A0PowerGenerator")
		{
			// Special case for Power Generators
			if (obj.modules > 0)
			{
				// Has modules
				infStructId = "InfA0PowerGeneratorMod";
			}
			else
			{
				// No modules
				infStructId = "InfA0PowerGenerator";
			}
			
		}
		else if (structId === "LookOutTower")
		{
			// Special case for Lookout Towers
			infStructId = "InfestedLookOutTower";
		}
		else
		{
			infStructId = "Inf" + structId.replace(/A0BaBa|A0/, ""); // Fancy-pants regular expression
		}

		// Check if there's an Infested variant of this structure to swap to
		// NOTE: Don't swap structures that aren't fully built
		// NOTE: Also don't swap Oil Derricks, since WZ doesn't seem to like that
		if (obj.status === BUILT && structId !== "A0ResourceExtractor" && camDef(camGetCompNameFromId(infStructId, "Building")))
		{
			// Infested variant exists; remove this object and replace it with a new structure
			const structInfo = {
				x: obj.x * 128,
				y: obj.y * 128,
				direction: obj.direction,
				modules: obj.modules
			};

			let infLabel;
			let artTech;

			// Before we remove it, check if this structure has any artifacts inside
			const objLabel = getLabel(obj);
			if (camDef(objLabel) && camGetArtifacts().includes(objLabel))
			{
				// Artifact inside; remove it and assign it to the new infested structure
				infLabel = "inf" + objLabel;
				artTech = __camArtifacts[objLabel];

				camDeleteArtifact(objLabel);
				// We'll add the new artifact after placing the new structure
			}

			camSafeRemoveObject(obj, false);
			const newStruct = addStructure(infStructId, CAM_INFESTED, structInfo.x, structInfo.y, structInfo.direction);
			__camPreDamageStruct(newStruct);

			if (camDef(infLabel))
			{
				// If the old structure had an artifact, assign it to the new structure
				addLabel(newStruct, infLabel);
				camAddArtifact({infLabel: { tech: artTech }});
			}

			// Add modules if applicable
			if (structId !== "A0PowerGenerator")
			{
				for (let i = 0; i < structInfo.modules; i++)
				{
					if (__IS_FACTORY)
					{
						addStructure("A0FacMod1", CAM_INFESTED, structInfo.x, structInfo.y);
					}
					else // Assume it's a Research Facility
					{
						addStructure("A0ResearchModule1", CAM_INFESTED, structInfo.x, structInfo.y);
					}
				}
			}

			// If a factory was infested, start managing it
			// Select templates based on the type of factory that was captured
			// NOTE: Infested can't use VTOL factories!
			if (__IS_FACTORY)
			{
				let templates;
				let throttle;
				// Manage the factory depending on the type and the faction it was taken from
				// NOTE: New Paradigm and NEXUS factories are not supported!
				if (infStructId === "InfFactory") // Scavenger factory
				{
					throttle = camChangeOnDiff(camSecondsToMilliseconds(12));
					templates = [ // TODO: Move these to libcampaign?
						cTempl.infbloke, cTempl.infbjeep, cTempl.inftrike,
						cTempl.infkevlance, cTempl.infbuscan, cTempl.infminitruck,
						cTempl.infmoncan, cTempl.infrbjeep, cTempl.infbuggy,
						cTempl.infkevbloke, cTempl.monhmg, cTempl.infbjeep,
					];
				}
				else if (fromPlayer === CAM_THE_COLLECTIVE) // Collective factory
				{
					if (infStructId === "InfLightFactory") // Standard factory
					{
						throttle = camChangeOnDiff(camSecondsToMilliseconds(40));
						templates = [ // (light templates only)
							cTempl.infcolpodt, cTempl.infcolhmght, cTempl.infcolcanht,
							cTempl.infcolmrat,
						];
						if (structInfo.modules >= 1)
						{
							templates = templates.concat([
								cTempl.infcommcant, cTempl.infcomatt,
							]);
						}
						if (structInfo.modules >= 2)
						{
							templates = templates.concat([
								cTempl.infcohhcant,
							]);
						}
					}
					else // Cyborg factory
					{
						throttle = camChangeOnDiff(camSecondsToMilliseconds(20));
						templates = [
							cTempl.infcybhg, cTempl.infcybca, cTempl.infcybhg,
							cTempl.infscymc,
						];
					}
				}
				else if (fromPlayer === CAM_HUMAN_PLAYER) // Player factory
				{
					// Instead of a pre-defined list, sample all of the player's units on the map...
					const droids = enumDroid(CAM_HUMAN_PLAYER);
					templates = [];
					for (const droid of droids)
					{
						if (__camIsLegalInfDroid(droid) && droid.droidType !== DROID_COMMAND)
						{
							// NOTE: Technically, command droids are legal, but we don't want the Infested to spam useless commanders if the player has them
							let newBody = droid.body;
							if (droid.body === "Body1REC" || // Viper
								droid.body === "Body2SUP" || // Leopard
								droid.body === "Body5REC" || // Cobra
								droid.body === "Body6SUPP" || // Panther
								droid.body === "Body11ABT" || // Python
								droid.body === "Body9REC") // Tiger
							{
								newBody = "Inf" + droid.body;
							}

							// NOTE: This assumes that the player doesn't have any multi-weapon units!
							templates.push({body: newBody, prop: droid.propulsion, weap: "Inf" + droid.weapons[0].name});
						}
					}
					// templates = camRemoveDuplicates(templates);

					if (infStructId === "InfLightFactory") // Standard factory
					{
						throttle = camChangeOnDiff(camSecondsToMilliseconds(40));
						templates = templates.filter((temp) => (temp.prop !== "CyborgLegs")); // Filter out all cyborgs
						// NOTE: We can assume this list doesn't include any VTOLs, since they're an "illegal" unit
						if (structInfo.modules < 2)
						{
							templates = templates.filter((temp) => (temp.body !== "InfBody11ABT" && temp.body !== "InfBody9REC")); // Filter out all heavy bodies
						}
						if (structInfo.modules < 1)
						{
							templates = templates.filter((temp) => (temp.body !== "InfBody5REC" && temp.body !== "InfBody6SUPP")); // Filter out all medium bodies
						}
					}
					else // Cyborg factory
					{
						throttle = camChangeOnDiff(camSecondsToMilliseconds(20));
						templates = templates.filter((temp) => (temp.prop === "CyborgLegs")); // Filter out all non-cyborgs
					}
				}
				else
				{
					// Whose factory is this???
					throttle = camChangeOnDiff(camSecondsToMilliseconds(30));
					templates = []; // Empty
					// TODO: Handle factories from other NARS teams?
				}

				// Start managing the factory!
				if (!camDef(infLabel))
				{
					// Assign a new label if we haven't given one already
					infLabel = "infCapturedFactory" + __camCapturedFactoryIdx++;
				}
				addLabel(newStruct, infLabel);
				camSetFactoryData(infLabel, {
					order: CAM_ORDER_ATTACK,
					throttle: throttle,
					templates: templates
				});
				camEnableFactory(infLabel);
			}
		}
		else
		{
			// No Infested variant exists; blow up this structure!
			camSafeRemoveObject(obj, true);
			return; // Nothing else to do...
		}
	}
}

// Returns true if the given droid is "legal" for the Infested to use
// Illegal droids are:
// Constructors (Trucks & Engineers)
// Repair Turrets
// Sensors
// VTOLs
// Weapons with more range than a Mortar (18 tiles)
// All other units are acceptable...
function __camIsLegalInfDroid(droid)
{
	return !(droid.droidType === DROID_CONSTRUCT 
		|| droid.droidType === DROID_REPAIR 
		|| droid.droidType === DROID_SENSOR 
		|| droid.isVTOL
		|| (droid.droidType === DROID_WEAPON && camGetCompStats(droid.weapons[0].fullname, "Weapon").MaxRange > (18 * 128)) // NOTE: "MaxRange" is correct here!
	);
}