
////////////////////////////////////////////////////////////////////////////////
// Guide topics management.
////////////////////////////////////////////////////////////////////////////////

function __camDoAddVTOLUseTopicsImpl()
{
	addGuideTopic("wz2100::units::propulsions::vtols::defending");
	addGuideTopic("wz2100::units::propulsions::vtols::attacking", SHOWTOPIC_FIRSTADD);
}

function __camDoAddCommanderUseTopicsImpl()
{
	addGuideTopic("wz2100::units::commanders::targeting");
	addGuideTopic("wz2100::units::commanders::detaching");
	addGuideTopic("wz2100::units::commanders::repairs");
	addGuideTopic("wz2100::units::commanders::attaching", SHOWTOPIC_FIRSTADD);
}

function __camDoAddVTOLUseTopics()
{
	queue("__camDoAddVTOLUseTopicsImpl", camSecondsToMilliseconds(1));
}

function __camDoAddCommanderUseTopics()
{
	queue("__camDoAddCommanderUseTopicsImpl", camSecondsToMilliseconds(1));
}

function __camGuideTopicCheckResearchComplete(targetResearchName, justResearchedObj = null)
{
	if (justResearchedObj && justResearchedObj.name == targetResearchName)
	{
		return true;
	}
	else if (justResearchedObj == null)
	{
		const res = getResearch(targetResearchName);
		if (res && res.done)
		{
			return true;
		}
	}
	return false;
}

function __camProcessResearchGatedGuideTopics(research = null)
{
	let showFlags = (research == null) ? 0 : SHOWTOPIC_FIRSTADD;

	// sensor turret researched
	if (__camGuideTopicCheckResearchComplete("R-Sys-Sensor-Turret01", research))
	{
		// in this case, the category topic must come first (as adding the child topics will also add it, but we want the category topic to be what"s displayed)
		addGuideTopic("wz2100::units::sensors", showFlags);
		addGuideTopic("wz2100::units::sensors::unassigning");
		addGuideTopic("wz2100::units::sensors::using");
	}

	// First Anti Tank weapon researched
	if (__camGuideTopicCheckResearchComplete("R-Wpn-Rocket05-MiniPod", research))
	{
		addGuideTopic("wz2100::units::weapons::antitank", showFlags);
	}

	// First Artillery weapon researched
	if (__camGuideTopicCheckResearchComplete("R-Wpn-Mortar01Lt", research))
	{
		addGuideTopic("wz2100::units::weapons::artillery", showFlags);
	}

	// First All Rounder weapon researched
	if (__camGuideTopicCheckResearchComplete("R-Wpn-Cannon1Mk1", research))
	{
		addGuideTopic("wz2100::units::weapons::allrounder", showFlags);
	}

	// First Flamer weapon researched
	// Also first thermal weapon
	if (__camGuideTopicCheckResearchComplete("R-Wpn-Flamer01Mk1", research))
	{
		addGuideTopic("wz2100::units::weapons::flamer", showFlags);
		addGuideTopic("wz2100::units::thermaldamage");
	}

	// First AA weapon researched
	if (__camGuideTopicCheckResearchComplete("R-Wpn-AAGun03", research))
	{
		addGuideTopic("wz2100::units::weapons::antiair", showFlags);
	}

	// First (and only) Bunker Buster weapon researched
	if (__camGuideTopicCheckResearchComplete("R-Wpn-Rocket03-HvAT", research))
	{
		addGuideTopic("wz2100::units::weapons::bunkerbuster", showFlags);
	}

	// Repair Turret researched
	if (__camGuideTopicCheckResearchComplete("R-Sys-MobileRepairTurret01", research))
	{
		addGuideTopic("wz2100::units::repairing", showFlags);
	}

	// First Module researched
	// Note that the Research Module comes first in Reclamation 1, but the Power Module comes first in Reclamation 2.
	if (__camGuideTopicCheckResearchComplete("R-Struc-Research-Module", research) || __camGuideTopicCheckResearchComplete("R-Struc-PowerModuleMk1", research))
	{
		addGuideTopic("wz2100::structures::modules", showFlags);
	}

	// Command Turret researched
	if (__camGuideTopicCheckResearchComplete("R-Comp-CommandTurret01", research))
	{
		// in this case, the category topic must come first (as adding the child topics will also add it, but we want the category topic to be what"s displayed)
		addGuideTopic("wz2100::units::commanders", showFlags);
	}

	// Repair Facility researched
	if (__camGuideTopicCheckResearchComplete("R-Struc-RepairFacility", research))
	{
		addGuideTopic("wz2100::structures::repairfacility", showFlags);
	}

	// VTOL Factory researched
	if (__camGuideTopicCheckResearchComplete("R-Struc-VTOLFactory", research))
	{
		addGuideTopic("wz2100::structures::vtolfactory", showFlags);
	}

	// VTOL Propulsion researched
	if (__camGuideTopicCheckResearchComplete("R-Vehicle-Prop-VTOL", research))
	{
		addGuideTopic("wz2100::units::propulsions::vtols::weapons");
		addGuideTopic("wz2100::units::propulsions::vtols::using", showFlags);
	}

	// CB Turret researched
	if (__camGuideTopicCheckResearchComplete("R-Sys-CBSensor-Turret01", research))
	{
		addGuideTopic("wz2100::units::sensors::cb", showFlags);
	}

	// Tracked Propulsion researched
	if (__camGuideTopicCheckResearchComplete("R-Vehicle-Prop-Tracks", research))
	{
		addGuideTopic("wz2100::units::propulsions::tracks", showFlags);
	}

	// Half-tracked Propulsion researched
	if (__camGuideTopicCheckResearchComplete("R-Vehicle-Prop-Halftracks", research))
	{
		addGuideTopic("wz2100::units::propulsions::halftracks", showFlags);
	}

	// Hover Propulsion researched
	if (__camGuideTopicCheckResearchComplete("R-Vehicle-Prop-Hover", research))
	{
		addGuideTopic("wz2100::units::propulsions::hover", showFlags);
	}

	// First (explosive) bomb researched
	if (__camGuideTopicCheckResearchComplete("R-Wpn-Bomb01", research))
	{
		addGuideTopic("wz2100::units::weapons::bombs::explosive", showFlags);
	}

	// First incendiary bomb researched
	if (__camGuideTopicCheckResearchComplete("R-Wpn-Bomb03", research))
	{
		addGuideTopic("wz2100::units::weapons::bombs::incendiary", showFlags);
	}

	// Also re-add previously collected Logs
	if (research == null)
	{
		const partialName = "R-Script-Log";
		let idxNum = 1;
		let resIdx = "01";
		let research = getResearch(partialName + resIdx, CAM_HUMAN_PLAYER);
		while (research !== null)
		{
			// If this topic is already completed, re-add the log entry
			if (research.done)
			{
				__camAddNewLogTopic(idxNum, true);
			}
			idxNum++;
			resIdx = ((idxNum < 10) ? ("0" + idxNum) : idxNum);
			research = getResearch(partialName + resIdx, CAM_HUMAN_PLAYER);
		}
	}
}

function __camEnableGuideTopics()
{
	// Always enable general topics & unit orders
	addGuideTopic("wz2100::general::**");
	addGuideTopic("wz2100::unitorders::**");

	// Basic base / structure topics
	addGuideTopic("wz2100::structures::building");
	addGuideTopic("wz2100::structures::demolishing");

	// Basic structure topics
	addGuideTopic("wz2100::structures::hq");
	addGuideTopic("wz2100::structures::researchfacility");
	addGuideTopic("wz2100::structures::oilderrick");
	addGuideTopic("wz2100::structures::powergenerator");
	addGuideTopic("wz2100::structures::rallypoint");
	addGuideTopic("wz2100::structures::factory");
	addGuideTopic("wz2100::structures::cyborgfactory");

	// Basic units topics
	addGuideTopic("wz2100::units::building");
	addGuideTopic("wz2100::units::designing");
	addGuideTopic("wz2100::units::experience");

	// Weapon/propulsion topics (the player always has these components)
	addGuideTopic("wz2100::units::weapons::antipersonnel");
	addGuideTopic("wz2100::units::propulsions::cyborg");
	addGuideTopic("wz2100::units::propulsions::wheels");

	// Handle research-driven topics (for things already researched - i.e. on savegame load or starting a later campaign)
	__camProcessResearchGatedGuideTopics();

	// Handle built-unit triggered topics
	if (countDroid(DROID_COMMAND, CAM_HUMAN_PLAYER) > 0)
	{
		addGuideTopic("wz2100::units::commanders::**");
	}
	let foundDroids_VTOL = false;
	const droids = enumDroid(CAM_HUMAN_PLAYER);
	for (let x = 0; x < droids.length; ++x)
	{
		const droid = droids[x];
		if (droid.isVTOL)
		{
			foundDroids_VTOL = true;
			break; // if checking for anything else in the future, remove this
		}
	}
	if (foundDroids_VTOL)
	{
		addGuideTopic("wz2100::units::propulsions::vtols::defending");
		addGuideTopic("wz2100::units::propulsions::vtols::attacking");
	}
}

function __camEnableGuideTopicsForTransport(transport)
{
	const droids = enumCargo(transport);
	for (let i = 0, len = droids.length; i < len; ++i)
	{
		const droid = droids[i];
		if (droid.droidType === DROID_COMMAND)
		{
			addGuideTopic("wz2100::units::commanders::**");
		}
	}
}

function __camAddNewLogTopic(index, reAdd)
{
	let listNum;
	if (camDiscoverCampaign() === __CAM_RECLAMATION_CAMPAIGN_NUMBER)
	{
		// Reclamation 1 black boxes
		listNum = 1;
		boxInfo = __camRec1BlackBoxes;
	}
	else
	{
		// Reclamation 2 black boxes
		listNum = 2;
		boxInfo = __camRec2BlackBoxes;
	}

	if (index < 10)
	{
		index = "0" + index;
	}

	// Remember that this log has been collected when saveloading
	if (!reAdd)
	{
		completeResearch("R-Script-Log" + index, CAM_HUMAN_PLAYER);
	}
	
	const showFlag = (reAdd) ? 0 : SHOWTOPIC_FIRSTADD;
	const topicString = "wz2100::logs::R" + listNum + "L" + index;
	addGuideTopic(topicString, showFlag);
}