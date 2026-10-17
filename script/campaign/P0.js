include("script/campaign/libcampaign.js");

function eventStartLevel()
{
	// Set the fog to black so that players don't get flashbanged
	camSetFog(0, 0, 0);

	// Go DIRECTLY to P1
	camSetStandardWinLossConditions(CAM_VICTORY_SCRIPTED, "P1", {defeatOnDeath: false});
	// Do NOT pass "GO"
	queue("camEndMission", camSecondsToMilliseconds(0.5));
	// Do NOT collect 200 Power
}
