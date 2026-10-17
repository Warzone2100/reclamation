
////////////////////////////////////////////////////////////////////////////////
// Research related functions.
////////////////////////////////////////////////////////////////////////////////

//;; ## camEnableRes(researchIds, playerId)
//;;
//;; Grants research from the given list to player
//;;
//;; @param {string[]} researchIds
//;; @param {number} playerId
//;; @returns {void}
//;;
function camEnableRes(researchIds, playerId)
{
	for (let i = 0, l = researchIds.length; i < l; ++i)
	{
		const __RESEARCH_ID = researchIds[i];
		enableResearch(__RESEARCH_ID, playerId);
		completeResearch(__RESEARCH_ID, playerId);
	}
}

//;; ## camCompleteRequiredResearch(researchIds, playerId)
//;;
//;; Grants research from the given list to player and also researches the required research for that item.
//;;
//;; @param {string[]} researchIds
//;; @param {number} playerId
//;; @returns {void}
//;;
function camCompleteRequiredResearch(researchIds, playerId)
{
	dump("\n*Player " + playerId + " requesting accelerated research.");

	for (let i = 0, l = researchIds.length; i < l; ++i)
	{
		const __RESEARCH_ID = researchIds[i];
		dump("Searching for required research of item: " + __RESEARCH_ID);
		let reqRes = findResearch(__RESEARCH_ID, playerId).reverse();

		if (reqRes.length === 0)
		{
			//HACK: autorepair like upgrades don't work after mission transition.
			if (__RESEARCH_ID === "R-Sys-NEXUSrepair")
			{
				completeResearch(__RESEARCH_ID, playerId, true);
			}
			continue;
		}

		reqRes = camRemoveDuplicates(reqRes);
		for (let s = 0, r = reqRes.length; s < r; ++s)
		{
			const __RESEARCH_REQ = reqRes[s].name;
			dump("	Found: " + __RESEARCH_REQ);
			enableResearch(__RESEARCH_REQ, playerId);
			completeResearch(__RESEARCH_REQ, playerId);
		}
	}
}

//;; ## camCompleteRequiredResearch(researchId)
//;;
//;; Returns true if the player has the given research available in their menu, false otherwise.
//;;
//;; @param {string} researchIds
//;; @returns {boolean}
//;;
function camResearchIsAvailable(researchId)
{
	const resList = enumResearch();
	for (let i = 0; i < resList.length; i++)
	{
		if (resList[i].id === researchId)
		{
			return true;
		}
	}
	return false;
}

//////////// privates

//granted shortly after mission start to give enemy players instant droid production.
function __camGrantSpecialResearch()
{
	for (let i = 1; i < __CAM_MAX_PLAYERS; ++i)
	{
		if ((countDroid(DROID_ANY, i) > 0 || enumStruct(i).length > 0))
		{
			//Boost AI production to produce all droids within a factory throttle
			completeResearch("R-Struc-Factory-Upgrade-AI", i);
		}
	}
}

// Give the player the next Black Box schematic (if any more exist)
function __camGrantBlackBoxResearch()
{
	const partialName = "R-Special";
	let idxNum = 1;
	let resIdx = "01";
	let research = getResearch(partialName + resIdx, CAM_HUMAN_PLAYER);
	while (research !== null && (camResearchIsAvailable(partialName + resIdx) || research.started || research.done))
	{
		// If this schematic has already been granted, check the next one
		idxNum++;
		resIdx = ((idxNum < 10) ? ("0" + idxNum) : idxNum);
		research = getResearch(partialName + resIdx, CAM_HUMAN_PLAYER);
	}

	if (research === null)
	{
		// No more schematics left
		return;
	}
	else
	{
		enableResearch(partialName + resIdx, CAM_HUMAN_PLAYER);
	}
}
