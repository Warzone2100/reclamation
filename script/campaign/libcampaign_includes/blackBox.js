
////////////////////////////////////////////////////////////////////////////////
// Black Box management.
////////////////////////////////////////////////////////////////////////////////


//;; ## camCollectBlackBox(x, y)
//;;
//;; Collect a Black Box on the current level at the specified coordinates.
//;; Grants the appropriate text log and research.
//;; See 'libcampaign.js' for Individual Black Box info
//;;
//;; @param {number} x
//;; @param {number} y
//;; @returns {void}
//;;
function camCollectBlackBox(x, y)
{
	let boxInfo;

	if (camDiscoverCampaign() === __CAM_RECLAMATION_CAMPAIGN_NUMBER)
	{
		// Reclamation 1 black boxes
		boxInfo = __camRec1BlackBoxes;
	}
	else
	{
		// Reclamation 2 black boxes
		boxInfo = __camRec2BlackBoxes;
	}

	let idx = 0;
	let foundBox = false;
	while (idx < boxInfo.length && !foundBox)
	{
		if (boxInfo[idx].scripts.includes(scriptName) // Check if level script is included
			&& boxInfo[idx].x === x // Check coordinates
			&& boxInfo[idx].y === y)
		{
			foundBox = true;
		}
		else
		{
			idx++;
		}
	}

	if (!foundBox)
	{
		// This box doesn't match any managed Black Boxes
		camTrace("No matching Black Box!");
		return;
	}
	else
	{
		const __LOG_INDEX = idx + 1;

		playSound("beep7.ogg");
		console(_("Black Box #") + __LOG_INDEX + _(" collected"));

		// Display coorisponding guide page
		__camAddNewLogTopic(__LOG_INDEX);

		// Grant special research
		__camGrantBlackBoxResearch();
	}
}