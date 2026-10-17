include("script/campaign/transitionTech.js");
include("script/campaign/libcampaign.js");
include("script/campaign/templates.js");
include("script/campaign/structSets.js");

const MIS_TEAM_FOXTROT = 5;
const MIS_TEAM_GOLF = 6;

const MIS_FOXTROT_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(90));
const MIS_GOLF_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(120));
const MIS_CYBORG_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(60));
const MIS_VTOL_FACTORY_TIME = camChangeOnDiff(camSecondsToMilliseconds(130));
const MIS_FOXTROT_COMMANDER_DELAY = camChangeOnDiff(camMinutesToMilliseconds(8));
const MIS_DONATED_UNIT_RANK = "Regular";

var foxtrotCommanderDeathTime;
var foxtrotRank;
var foxtrotDefeated;

var golfSensorsGroup;
var golfVtolAttackGroup;
var golfVtolStrikeGroup;
var golfDefeated;

var banterIdx;

var infFactoryOnlyWave; // If true, ONLY spawn Infested units from entrances "bound" to a factory

const mis_infestedResearch = [
	"R-Wpn-MG-Damage05", "R-Wpn-Rocket-Damage05", "R-Wpn-Mortar-Damage05", 
	"R-Wpn-Flamer-Damage05", "R-Wpn-Cannon-Damage05", "R-Wpn-MG-ROF03",
	"R-Wpn-Rocket-ROF03", "R-Wpn-Mortar-ROF03", "R-Wpn-Flamer-ROF02",
	"R-Wpn-Cannon-ROF03", "R-Vehicle-Metals04", "R-Struc-Materials05", 
	"R-Defense-WallUpgrade05", "R-Cyborg-Metals04", "R-Wpn-AAGun-ROF02", 
	"R-Wpn-AAGun-Damage02", "R-Vehicle-Engine04",
];
const mis_teamExtraResearch = [ // Added on top of everything the player starts Act 4 with
	"R-Wpn-Cannon-Damage06", "R-Wpn-Cannon-ROF03", "R-Wpn-Bomb-Damage02",
	"R-Struc-VTOLPad-Upgrade03", "R-Wpn-Flamer-ROF03", "R-Wpn-Flamer-Damage06",
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03", "R-Struc-RprFac-Upgrade03",
	"R-Wpn-Howitzer-ROF02",
];

camAreaEvent("heliRemoveZone", function(droid)
{
	camSafeRemoveObject(droid, false);
	resetLabel("heliRemoveZone", CAM_INFESTED);
});

function heliAttack()
{
	const templates = [cTempl.infhelcan, cTempl.infhelhmg, cTempl.infhelpod];
	const ext = {
		limit: 1,
		alternate: true,
	};
	camSetVtolData(CAM_INFESTED, undefined, "heliRemoveZone", templates, camChangeOnDiff(camSecondsToMilliseconds(45)), undefined, ext);
}

// Activate Infested stuff
function activateInfested()
{
	setTimer("sendInfestedReinforcements", camChangeOnDiff(camSecondsToMilliseconds(80)));
	camEnableFactory("infFactory1");
	camEnableFactory("infFactory2");
	camEnableFactory("infFactory3");
	camEnableFactory("infFactory4");
	camEnableFactory("infFactory5");
	camEnableFactory("infHvyFactory");
	camEnableFactory("infCybFactory1");
	camEnableFactory("infCybFactory2");

	// Reduce the Infested presence on SUPEREASY
	if (difficulty > SUPEREASY)
	{
		camQueueDialogue({text: "--- ANOMALOUS SIGNAL DETECTED ---", delay: 0, sound: cam_sounds.beacon});

		// Call this twice to spawn twice the reinforcements on the first wave
		sendInfestedReinforcements();
		sendInfestedReinforcements();
		heliAttack();
	}

	// Have the Lieutenant try reasoning again
	camQueueDialogue([
		// Delay...
		{text: "LIEUTENANT: Foxtrot, Golf! Please!", delay: 12, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Clayde is lying to you!", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: He killed Team Alpha to protect himself!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: He's manipulating all of NARS for his own ends!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: We can prove it!", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: So stop-", delay: 2, sound: CAM_RCLICK},
		{text: "FOXTROT: Silence, Lieutenant.", delay: 1, sound: CAM_RCLICK},
		{text: "FOXTROT: You're the one who betrayed us all.", delay: 2, sound: CAM_RCLICK},
		{text: "FOXTROT: You've lead Commanders Bravo and Charlie astray with your lies.", delay: 3, sound: CAM_RCLICK},
		{text: "FOXTROT: And now they'll both pay the price with their lives.", delay: 3, sound: CAM_RCLICK},
	]);
}

function activateTeamFactories()
{
	camEnableFactory("foxtrotFactory1");
	camEnableFactory("foxtrotFactory2");
	camEnableFactory("foxtrotFactory3");
	camEnableFactory("foxtrotFactory4");
	camEnableFactory("foxtrotCybFactory1");
	camEnableFactory("foxtrotCybFactory2");
	camEnableFactory("foxtrotCybFactory3");
	camEnableFactory("foxtrotCybFactory4");
	camEnableFactory("golfFactory1");
	camEnableFactory("golfFactory2");
	camEnableFactory("golfFactory3");
	camEnableFactory("golfVtolFactory1");
	camEnableFactory("golfVtolFactory2");
	camEnableFactory("golfVtolFactory3");
}

// Misc. dialogue between Foxtrot, Golf, and the Lieutenant
function teamBanter()
{
	if (foxtrotDefeated && golfDefeated)
	{
		// Stop all banter if both teams are defeated
		removeTimer("teamBanter");
		return;
	}

	let desperate = (foxtrotDefeated || golfDefeated) ? true : false;

	if (!desperate)
	{
		switch (banterIdx)
		{
		case 1:
			// Foxtrot tries to get Bravo to surrender
			camQueueDialogue([
				{text: "FOXTROT: Commander Bravo.", delay: 4, sound: CAM_RCLICK},
				{text: "FOXTROT: You're out-manned and outgunned.", delay: 2, sound: CAM_RCLICK},
				{text: "FOXTROT: You have nowhere left to run, and no one is coming to help you.", delay: 3, sound: CAM_RCLICK},
				{text: "FOXTROT: Save us all the time and stand down.", delay: 3, sound: CAM_RCLICK},
				{text: "FOXTROT: Show that at least a part of you still has loyalty to NARS.", delay: 3, sound: CAM_RCLICK},
			]);
			break;
		case 2:
			// Golf the Lieutenant that they're coming for him, and that Bravo is their only major obstacle
			camQueueDialogue([
				{text: "GOLF: We're coming for you next, Lieutenant!", delay: 4, sound: CAM_RCLICK},
				{text: "GOLF: First Bravo, then Charlie, then you.", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: I'm not scared of you, Commander Golf.", delay: 4, sound: CAM_RCLICK},
				{text: "GOLF: You don't have to be.", delay: 4, sound: CAM_RCLICK},
				{text: "GOLF: Everyone here knows that Commander Bravo is the only competent one among you.", delay: 2, sound: CAM_RCLICK},
				{text: "FOXTROT: That's why we're here.", delay: 4, sound: CAM_RCLICK},
				{text: "FOXTROT: Once Team Bravo is gone, your mutiny is done for.", delay: 2, sound: CAM_RCLICK},
			]);
			break;
		case 3:
			// The Lieutenant tries to reason with Foxtrot
			camQueueDialogue([
				{text: "LIEUTENANT: Listen, Foxtrot.", delay: 4, sound: CAM_RCLICK},
				{text: "LIEUTENANT: I don't know what Clayde has told you about me, or about us.", delay: 2, sound: CAM_RCLICK},
				{text: "LIEUTENANT: But I can prove that Clayde has been lying to you.", delay: 3, sound: CAM_RCLICK},
				{text: "FOXTROT: Lieutenant, you're wasting your effort.", delay: 4, sound: CAM_RCLICK},
				{text: "FOXTROT: Even if any of your words held value, my loyalty is to the Supreme General.", delay: 3, sound: CAM_RCLICK},
				{text: "FOXTROT: He SAVED me from the Collective's prison, Lieutenant.", delay: 3, sound: CAM_RCLICK},
				{text: "LIEUTENANT: WE saved you, Foxtrot!", delay: 4, sound: CAM_RCLICK},
				{text: "LIEUTENANT: We all took part in the assault.", delay: 3, sound: CAM_RCLICK},
				{text: "FOXTROT: But that wouldn't have worked without Clayde's planning, would it?", delay: 4, sound: CAM_RCLICK},
				{text: "FOXTROT: I owe the Supreme General everything.", delay: 3, sound: CAM_RCLICK},
				{text: "FOXTROT: And I'd go to hell and back for him.", delay: 2, sound: CAM_RCLICK},
				{text: "FOXTROT: But right now, it looks like I just have to get through one Commander...", delay: 3, sound: CAM_RCLICK},
			]);
			break;
		case 4:
			// Foxtrot "comforts" the Lieutenant by telling him Clayde wants his life spared
			camQueueDialogue([
				{text: "FOXTROT: You should be grateful, Lieutenant.", delay: 4, sound: CAM_RCLICK},
				{text: "LIEUTENANT: What?", delay: 4, sound: CAM_RCLICK},
				{text: "FOXTROT: The Supreme General told us to deal with Commanders Bravo and Charlie as we saw fit.", delay: 4, sound: CAM_RCLICK},
				{text: "FOXTROT: But he ordered us to take YOU alive.", delay: 3, sound: CAM_RCLICK},
				{text: "FOXTROT: After all you've done, he still sees value in you, Lieutenant.", delay: 3, sound: CAM_RCLICK},
				{text: "FOXTROT: Which is more than can be said for the Commanders you've misled.", delay: 3, sound: CAM_RCLICK},
			]);
			break;
		case 5:
			// The Lieutenant tries to reason with Golf
			camQueueDialogue([
				{text: "LIEUTENANT: Golf, I-", delay: 4, sound: CAM_RCLICK},
				{text: "GOLF: I don't even want to hear it, Lieutenant.", delay: 1, sound: CAM_RCLICK},
				{text: "GOLF: The Supreme General's twice the man you'll ever be.", delay: 3, sound: CAM_RCLICK},
				{text: "GOLF: He knows how to make tough choices.", delay: 3, sound: CAM_RCLICK},
				{text: "GOLF: How to get RESULTS.", delay: 2, sound: CAM_RCLICK},
				{text: "GOLF: Meanwhile, you've been scurrying around trying to undermine us!", delay: 3, sound: CAM_RCLICK},
				{text: "GOLF: Where would we be now if we all listened to you?", delay: 3, sound: CAM_RCLICK},
			]);
			break;
		case 6:
			// Golf gets frustrated and tells Bravo to give up (again)
			camQueueDialogue([
				{text: "GOLF: I'm running out of patience here, Bravo.", delay: 4, sound: CAM_RCLICK},
				{text: "GOLF: Eventually, your defenses will crack, and we'll finish you off for good.", delay: 3, sound: CAM_RCLICK},
				{text: "GOLF: So save us all the time, and SURRENDER.", delay: 3, sound: CAM_RCLICK},
				{text: "GOLF: You can't hold out forever, anyway.", delay: 4, sound: CAM_RCLICK},
			]);
			break;
		default: // No more dialogue...
			break;
		}
	}
	else // One of the teams has been defeated
	{
		if (golfDefeated) // Foxtrot remaining
		{
			switch (banterIdx)
			{
			case 1:
				// Foxtrot tries to call for backup
				camQueueDialogue([
					{text: "FOXTROT: Supreme General Clayde!", delay: 4, sound: CAM_RCLICK},
					{text: "FOXTROT: We've engaged Team Bravo, and have encountered some...", delay: 2, sound: CAM_RCLICK},
					{text: "FOXTROT: Major difficulties.", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: Team Golf has been overrun.", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: Requesting immediate reinforcements, sir!", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: ...", delay: 2},
					{text: "FOXTROT: Yes sir, I understand, but-", delay: 4, sound: CAM_RCLICK},
					{text: "FOXTROT: ...", delay: 2},
					{text: "FOXTROT: But sir, they've withstood both of our combined efforts.", delay: 4, sound: CAM_RCLICK},
					{text: "FOXTROT: Without reinforcements, we can't-", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: ...", delay: 2},
					{text: "FOXTROT: I don't-", delay: 4, sound: CAM_RCLICK},
					{text: "FOXTROT: ...Yes, sir.", delay: 4, sound: CAM_RCLICK},
					{text: "FOXTROT: We'll fight as best we can.", delay: 2, sound: CAM_RCLICK},
				]);
				break;
			case 2:
				// The Lieutenant attempts to reason with Foxtrot one last time
				camQueueDialogue([
					{text: "LIEUTENANT: Foxtrot, I-", delay: 4, sound: CAM_RCLICK},
					{text: "FOXTROT: Silence.", delay: 1, sound: CAM_RCLICK},
					{text: "FOXTROT: Save it for the Supreme General.", delay: 3, sound: CAM_RCLICK},
					{text: "LIEUTENANT: But what about Team Alpha?", delay: 4, sound: CAM_RCLICK},
					{text: "LIEUTENANT: Clayde lied about them! I can prove it!", delay: 2, sound: CAM_RCLICK},
					{text: "LIEUTENANT: He lied to-", delay: 2, sound: CAM_RCLICK},
					{text: "FOXTROT: Team Alpha?", delay: 1, sound: CAM_RCLICK},
					{text: "FOXTROT: What about Team Golf?", delay: 2, sound: CAM_RCLICK},
					{text: "FOXTROT: What about the rest of NARS?!", delay: 2, sound: CAM_RCLICK},
					{text: "FOXTROT: You've betrayed us all, Lieutenant.", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: And for what?", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: For some conspiracy against Clayde?", delay: 2, sound: CAM_RCLICK},
					{text: "FOXTROT: Was your plan to take control of NARS for yourself?!", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: You'll pay for your crimes eventually, Lieutenant.", delay: 4, sound: CAM_RCLICK},
					{text: "FOXTROT: But Commander Bravo?", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: They'll pay for theirs right now.", delay: 3, sound: CAM_RCLICK},
				]);
				break;
			case 3:
				// Foxtrot threatens Bravo
				camQueueDialogue([
					{text: "FOXTROT: It's you and me, Commander Bravo.", delay: 4, sound: CAM_RCLICK},
					{text: "FOXTROT: Your campaign ends here, even if I have to put you down myself.", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: And once I'm through with you, I'll take down Charlie and the Lieutenant, too.", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: When this is all over...", delay: 3, sound: CAM_RCLICK},
					{text: "FOXTROT: There will be nothing left of you but a bad memory.", delay: 3, sound: CAM_RCLICK},
				]);
				break;
			default: // No more dialogue...
				break;
			}
		}
		else // Golf remaining
		{
			switch (banterIdx)
			{
			case 1:
				// Golf tries to call for backup
				camQueueDialogue([
					{text: "GOLF: Supreme General!", delay: 4, sound: CAM_RCLICK},
					{text: "GOLF: Sir, Team Foxtrot is GONE!", delay: 2, sound: CAM_RCLICK},
					{text: "GOLF: We need reinforcements, ASAP.", delay: 3, sound: CAM_RCLICK},
					{text: "GOLF: ...", delay: 2},
					{text: "GOLF: What?!", delay: 4, sound: CAM_RCLICK},
					{text: "GOLF: Sir, we're not gonna last much longer out here!", delay: 4, sound: CAM_RCLICK},
					{text: "GOLF: Team Bravo, they're-", delay: 4, sound: CAM_RCLICK},
					{text: "GOLF: ...", delay: 2},
					{text: "GOLF: But sir, that isn't fair!", delay: 4, sound: CAM_RCLICK},
					{text: "GOLF: How are we supposed to-", delay: 3, sound: CAM_RCLICK},
					{text: "GOLF: ...", delay: 2},
					{text: "GOLF: No sir, I've always been loyal, sir.", delay: 3, sound: CAM_RCLICK},
					{text: "GOLF: But-", delay: 3, sound: CAM_RCLICK},
					{text: "GOLF: ...", delay: 2},
					{text: "GOLF: ...Yes, sir.", delay: 4, sound: CAM_RCLICK},
					{text: "GOLF: I'll finish the job, sir.", delay: 2, sound: CAM_RCLICK},
					{text: "GOLF: You can count on me.", delay: 3, sound: CAM_RCLICK},
				]);
				break;
			case 2:
				// The Lieutenant attempts to reason with Golf one last time
				camQueueDialogue([
					{text: "LIEUTENANT: Golf, we can still stop this.", delay: 4, sound: CAM_RCLICK},
					{text: "LIEUTENANT: We can still work together, and fight for what's right!", delay: 3, sound: CAM_RCLICK},
					{text: "LIEUTENANT: I can prove that he's been lying to you!", delay: 3, sound: CAM_RCLICK},
					{text: "LIEUTENANT: I can prove that Team Alpha-", delay: 3, sound: CAM_RCLICK},
					{text: "GOLF: Team Alpha this, Commander Alpha that...", delay: 2, sound: CAM_RCLICK},
					{text: "GOLF: Shut it!", delay: 3, sound: CAM_RCLICK},
					{text: "GOLF: Team Alpha is DEAD!", delay: 2, sound: CAM_RCLICK},
					{text: "GOLF: And if I get my way, YOU'RE going to join them!", delay: 2, sound: CAM_RCLICK},
				]);
				break;
			case 3:
				// Golf threatens Bravo (top 10 hate mail moments (number 3 will surprise you!1!!))
				camQueueDialogue([
					{text: "GOLF: I'll end you, Bravo.", delay: 4, sound: CAM_RCLICK},
					{text: "GOLF: Even if I have to do it alone.", delay: 3, sound: CAM_RCLICK},
					{text: "GOLF: I'll show Clayde that at least one of his Commanders is worthy.", delay: 3, sound: CAM_RCLICK},
					{text: "GOLF: You've caused NARS enough pain, Bravo.", delay: 4, sound: CAM_RCLICK},
					{text: "GOLF: So do us-", delay: 3, sound: CAM_RCLICK},
					{text: "GOLF: No. Do ME a favor...", delay: 1, sound: CAM_RCLICK},
					{text: "GOLF: And DIE.", delay: 3, sound: CAM_RCLICK},
				]);
				break;
			default: // No more dialogue...
				break;
			}
		}
	}

	banterIdx++;
}

// Boost the strength of teams Foxtrot and Golf
// Called when one of the teams is defeated
function boostTeams()
{
	const NEW_FOXTROT_FACTORY_TIME = MIS_FOXTROT_FACTORY_TIME * 2/3;
	const NEW_FOXTROT_CYBORG_FACTORY_TIME = MIS_CYBORG_FACTORY_TIME * 2/3;
	const NEW_GOLF_FACTORY_TIME = MIS_GOLF_FACTORY_TIME * 3/4;
	const NEW_VTOL_FACTORY_TIME = MIS_VTOL_FACTORY_TIME * 3/4;

	camSetFactories({
		"foxtrotFactory1": {
			throttle: NEW_FOXTROT_FACTORY_TIME,
			templates: []
		},
		"foxtrotFactory2": {
			throttle: NEW_FOXTROT_FACTORY_TIME,
			templates: []
		},
		"foxtrotFactory3": {
			throttle: NEW_FOXTROT_FACTORY_TIME,
			templates: []
		},
		"foxtrotFactory4": {
			throttle: NEW_FOXTROT_FACTORY_TIME,
			templates: []
		},
		"foxtrotCybFactory1": {
			throttle: NEW_FOXTROT_CYBORG_FACTORY_TIME,
			templates: []
		},
		"foxtrotCybFactory2": {
			throttle: NEW_FOXTROT_CYBORG_FACTORY_TIME,
			templates: []
		},
		"foxtrotCybFactory3": {
			throttle: NEW_FOXTROT_CYBORG_FACTORY_TIME,
			templates: []
		},
		"foxtrotCybFactory4": {
			throttle: NEW_FOXTROT_CYBORG_FACTORY_TIME,
			templates: []
		},
		"golfFactory1": {
			throttle: NEW_GOLF_FACTORY_TIME,
			templates: []
		},
		"golfFactory2": {
			throttle: NEW_GOLF_FACTORY_TIME,
			templates: []
		},
		"golfFactory3": {
			throttle: NEW_GOLF_FACTORY_TIME,
			templates: []
		},
		"golfVtolFactory1": {
			assembly: "golfVtolAssembly1",
			throttle: NEW_VTOL_FACTORY_TIME,
			templates: []
		},
		"golfVtolFactory2": {
			assembly: "golfVtolAssembly2",
			throttle: NEW_VTOL_FACTORY_TIME,
			templates: []
		},
		"golfVtolFactory3": {
			assembly: "golfVtolAssembly3",
			throttle: NEW_VTOL_FACTORY_TIME,
			templates: []
		},
	});

	// Re-enable the factories (if they're still alive)
	activateTeamFactories();

	// Increase the size of Golf's VTOL attack/strike groups
	camSetRefillableGroupData(golfVtolAttackGroup, {
		templates: [ // 6 HEAP Bombs, 6 Thermite Bombs
			cTempl.plmhbombv, cTempl.plmhbombv,
			cTempl.plmtbombv, cTempl.plmtbombv,
			cTempl.plmhbombv, cTempl.plmhbombv,
			cTempl.plmtbombv, cTempl.plmtbombv,
			cTempl.plmhbombv, cTempl.plmhbombv,
			cTempl.plmtbombv, cTempl.plmtbombv,
		]
	});
	camSetRefillableGroupData(golfVtolStrikeGroup, {
		templates: [ // 12 HEAP Bombs
			cTempl.plmhbombv, cTempl.plmhbombv, cTempl.plmhbombv,
			cTempl.plmhbombv, cTempl.plmhbombv, cTempl.plmhbombv,
			cTempl.plmhbombv, cTempl.plmhbombv, cTempl.plmhbombv,
			cTempl.plmhbombv, cTempl.plmhbombv, cTempl.plmhbombv,
		]
	});

	// Restart banter queue
	banterIdx = 1;
	removeTimer("teamBanter");
	setTimer("teamBanter", camMinutesToMilliseconds(5));
}

function eventDestroyed(obj)
{
	if (obj.player === MIS_TEAM_FOXTROT)
	{
		if (obj.type === DROID)
		{
			if (obj.droidType === DROID_COMMAND)
			{
				// Mark the time that the Foxtrot commander died
				foxtrotCommanderDeathTime = gameTime;
			}
			else if (obj.droidType === DROID_CONSTRUCT)
			{
				// Foxtrot Truck/Engineer destroyed
				checkFoxtrotDefeated();
			}
		}
		else if (obj.type === STRUCTURE 
			&& (obj.stattype === FACTORY
				|| obj.stattype === CYBORG_FACTORY
				|| obj.stattype === RESEARCH_LAB
				|| obj.stattype === POWER_GEN
				|| obj.stattype === COMMAND_CONTROL
				|| obj.stattype === HQ))
		{
			// Foxtrot base structure destroyed
			checkFoxtrotDefeated();
		}
	}
	else if (obj.player === MIS_TEAM_GOLF)
	{
		if (obj.type === DROID && obj.droidType === DROID_CONSTRUCT)
		{
			// Golf Truck destroyed
			checkGolfDefeated();
		}
		else if (obj.type === STRUCTURE 
			&& (obj.stattype === FACTORY
				|| obj.stattype === VTOL_FACTORY
				|| obj.stattype === RESEARCH_LAB
				|| obj.stattype === POWER_GEN
				|| obj.stattype === COMMAND_CONTROL
				|| obj.stattype === HQ))
		{
			// Golf base structure destroyed
			checkGolfDefeated();
		}
	}
}

// Foxtrot/Golf are "defeated" when:
// All "base" structures are destroyed (Factories/HQs/Command Relays/Generators/Research Facilities)
// All Trucks/Engineers assigned to their main bases are destroyed

// Called when Foxtrot objects are destroyed
function checkFoxtrotDefeated()
{
	// Check if Foxtrot has any "base structures" remaining
	if (enumStruct(MIS_TEAM_FOXTROT, FACTORY).length === 0 // No Factories...
		&& enumStruct(MIS_TEAM_FOXTROT, CYBORG_FACTORY).length === 0 // No Cyborg Factories...
		&& enumStruct(MIS_TEAM_FOXTROT, RESEARCH_LAB).length === 0 // No Research Facilities...
		&& enumStruct(MIS_TEAM_FOXTROT, POWER_GEN).length === 0 // No Power Generators...
		&& enumStruct(MIS_TEAM_FOXTROT, COMMAND_CONTROL).length === 0 // No Command Relay Posts...
		&& enumStruct(MIS_TEAM_FOXTROT, HQ).length === 0) // No Command Centers...
	{
		// Check if Foxtrot has any Trucks/Engineers that can rebuild those structures
		const mainTrucks = camGetTrucksFromLabel("foxtrotMainBase").concat(camGetTrucksFromLabel("foxtrotAltBase"));
		for (const truck of mainTrucks)
		{
			if (camDef(truck) && truck !== null)
			{
				return; // Truck still alive
			}
		}

		// Surrender if no constructors are found
		camCallOnce("foxtrotDefeat");
	}
}

// Called when Golf objects are destroyed
function checkGolfDefeated()
{
	// Check if Golf has any "base structures" remaining
	if (enumStruct(MIS_TEAM_GOLF, FACTORY).length === 0 // No Factories...
		&& enumStruct(MIS_TEAM_GOLF, VTOL_FACTORY).length === 0 // No VTOL Factories...
		&& enumStruct(MIS_TEAM_GOLF, RESEARCH_LAB).length === 0 // No Research Facilities...
		&& enumStruct(MIS_TEAM_GOLF, POWER_GEN).length === 0 // No Power Generators...
		&& enumStruct(MIS_TEAM_GOLF, COMMAND_CONTROL).length === 0 // No Command Relay Posts...
		&& enumStruct(MIS_TEAM_GOLF, HQ).length === 0) // No Command Centers...
	{
		// Check if Golf has any Trucks that can rebuild those structures
		const mainTrucks = camGetTrucksFromLabel("golfMainBase").concat(camGetTrucksFromLabel("golfVtolBase"));
		for (const truck of mainTrucks)
		{
			if (camDef(truck) && truck !== null)
			{
				return; // Truck still alive
			}
		}

		// Surrender if no constructors are found
		camCallOnce("golfDefeat");
	}
}

function foxtrotDefeat()
{
	camSetBaseAffiliation("foxtrotMainBase", true);
	camSetBaseAffiliation("foxtrotAltBase", true);
	camSetBaseAffiliation("foxtrotEastRidgeBase", true);
	camSetBaseAffiliation("foxtrotNorthHillBase", true);
	camSetBaseAffiliation("foxtrotCraterHillBase", true);
	camSetBaseAffiliation("foxtrotWestRidgeBase", true);
	camSetBaseAffiliation("foxtrotWaterRidgeBase", true);

	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_FOXTROT, true);

	// Lieutenant tells Team Foxtrot members to surrender
	camSkipDialogue(); // Interrupt any ongoing dialogue
	camQueueDialogue([
		{text: "LIEUTENANT: Attention all members of Team Foxtrot.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Your Commander has been defeated.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: You are to surrender and relinquish control to Commander Bravo immediately.", delay: 3, sound: CAM_RCLICK},
		{delay: 5, callback: "donateFoxtrot"},
	]);
}

function donateFoxtrot()
{
	// Grab all of Foxtrot's droids and structures
	const objs = enumDroid(MIS_TEAM_FOXTROT).concat(enumStruct(MIS_TEAM_FOXTROT));

	for (const obj of objs)
	{
		// Give the droids some EXP
		if (obj.type === DROID && obj.droidType !== DROID_COMMAND)
		{
			camSetDroidRank(obj, MIS_DONATED_UNIT_RANK);
		}
	}
	// Donate them all to the player
	camEnsureDonateObject(objs, CAM_HUMAN_PLAYER);

	if (golfDefeated)
	{
		camSetExtraObjectiveMessage();
	}
	else
	{
		// Live Golf Reaction:
		camQueueDialogue([
			{text: "GOLF: Foxtrot!?", delay: 8, sound: CAM_RCLICK},
			{text: "GOLF: No...", delay: 2, sound: CAM_RCLICK},
			{text: "GOLF: How did-", delay: 2, sound: CAM_RCLICK},
			{text: "GOLF: YOU.", delay: 6, sound: CAM_RCLICK},
			{text: "GOLF: You're going to PAY for that, Bravo!", delay: 2, sound: CAM_RCLICK},
		]);
		camSetExtraObjectiveMessage(_("Defeat Team Golf"));
	}

	foxtrotDefeated = true;
	camCallOnce("boostTeams");
}

function golfDefeat()
{
	camSetBaseAffiliation("golfMainBase", true);
	camSetBaseAffiliation("golfBridgeBase", true);
	camSetBaseAffiliation("golfVtolBase", true);
	camSetBaseAffiliation("golfForwardBase", true);

	setAlliance(CAM_HUMAN_PLAYER, MIS_TEAM_GOLF, true);

	// Lieutenant tells Team Golf members to surrender
	camSkipDialogue(); // Interrupt any ongoing dialogue
	camQueueDialogue([
		{text: "LIEUTENANT: Attention all members of Team Golf.", delay: 2, sound: CAM_RCLICK},
		{text: "LIEUTENANT: Your Commander has been defeated.", delay: 3, sound: CAM_RCLICK},
		{text: "LIEUTENANT: You are to surrender and relinquish control to Commander Bravo immediately.", delay: 3, sound: CAM_RCLICK},
		{delay: 5, callback: "donateGolf"},
	]);
}

function donateGolf()
{
	// Grab all of Golf's droids and structures
	const objs = enumDroid(MIS_TEAM_GOLF).concat(enumStruct(MIS_TEAM_GOLF));

	// Donate them all to the player (and grant the droids some EXP)
	camSetDroidRank(objs, MIS_DONATED_UNIT_RANK);
	camEnsureDonateObject(objs, CAM_HUMAN_PLAYER);

	if (foxtrotDefeated)
	{
		camSetExtraObjectiveMessage();
	}
	else
	{
		// Live Foxtrot Reaction:
		camQueueDialogue([
			{text: "FOXTROT: Commander Golf?", delay: 8, sound: CAM_RCLICK},
			{text: "FOXTROT: Commander Golf, do you read?", delay: 3, sound: CAM_RCLICK},
			{text: "FOXTROT: Commander Golf, respond!", delay: 3, sound: CAM_RCLICK},
			{text: "FOXTROT: Bravo, did you...", delay: 3, sound: CAM_RCLICK},
			{text: "FOXTROT: Oh... You're going to regret this, Commander Bravo.", delay: 4, sound: CAM_RCLICK},
		]);
		camSetExtraObjectiveMessage(_("Defeat Team Foxtrot"));
	}
	
	golfDefeated = true;
	camCallOnce("boostTeams");
}

function eventDroidBuilt(droid, structure)
{
	if (droid.player === MIS_TEAM_FOXTROT && camDroidMatchesTemplate(droid, cTempl.plhcomw))
	{
		// Foxtrot commander rebuilt
		addLabel(droid, "foxtrotCommander");
		camSetDroidRank(droid, foxtrotRank);
	}
	else if (droid.player === MIS_TEAM_GOLF && camDroidMatchesTemplate(droid, cTempl.plhsenst) && droid.group === golfSensorsGroup)
	{
		// Golf (lone) sensor rebuilt
		addLabel(droid, "golfSensor");
	}
}

function sendInfestedReinforcements()
{	
	const coreDroids = [
		[ // Scavs & crawlers
			cTempl.vilestinger, // Vile Stingers
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, // Boom Ticks
			cTempl.infmoncan, cTempl.infmoncan, // Bus Tanks
			cTempl.infmonhmg,
			cTempl.infmonmrl,
			cTempl.infmonlan,
			cTempl.infflatmrl, cTempl.infflatmrl, // Flatbeds
			cTempl.infflatat,
			cTempl.infminitruck, // MRP Trucks
			cTempl.infsartruck, // Sarissa Trucks
			cTempl.infbuscan, cTempl.infbuscan, // School Buses
			cTempl.inffiretruck, // Fire Trucks
			cTempl.infbjeep, cTempl.infbjeep, cTempl.infbjeep, // Jeeps
			cTempl.infrbjeep, cTempl.infrbjeep, // Rocket Jeeps
			cTempl.infgbjeep, cTempl.infgbjeep, // Grenade Jeeps
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		],
		[ // Light tanks & cyborgs + some scav stuff
			cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, cTempl.infcybca, // Heavy Gunners
			cTempl.infcybhg, cTempl.infcybhg, cTempl.infcybhg, // Heavy Machinegunners
			cTempl.infcybmr, cTempl.infcybmr, // Mini-Rocket Cyborgs
			cTempl.infcybla, cTempl.infcybla, // Lancers
			cTempl.infscymc, // Super Heavy Gunners
			cTempl.infscyhr, // Super Heavy Rockets
			cTempl.infcybfl, // Flamers
			cTempl.infcolpodt, cTempl.infcolpodt, cTempl.infcolpodt, // MRPs
			cTempl.infcolaaht, // Hurricanes
			cTempl.infcommcant, cTempl.infcommcant, // Medium Cannons
			cTempl.infcomatt, // Lancers
			cTempl.infcohhcant, // Heavy Cannon
			cTempl.infcohhrat, // HRA
			cTempl.infbuggy, cTempl.infbuggy, // Buggies
			cTempl.infrbuggy, // Rocket Buggies
			cTempl.inftrike, // Trikes
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, cTempl.inflance, cTempl.inflance, // Lances
			cTempl.infkevlance, cTempl.infkevlance,
		],
		[ // Bashers, Stingers, and Infantry
			cTempl.vilestinger, // Vile Stingers
			cTempl.infcomtruckt, // Infested Trucks
			cTempl.infcomtruckht,
			cTempl.stinger, cTempl.stinger, cTempl.stinger, cTempl.stinger, // Stingers
			cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, cTempl.basher, // Bashers
			cTempl.boomtick, cTempl.boomtick, // Boom Ticks
			cTempl.infbloke,  cTempl.infbloke, cTempl.infbloke, // Blokes
			cTempl.infkevbloke, cTempl.infkevbloke,
			cTempl.inflance, // Lances
		].concat((difficulty >= EASY) ? cTempl.infcomhaat : []), // Add a Cyclone tank
	];
	const CORE_SIZE = 4;
	const FODDER_SIZE = 12;
	const B_CHANCE = (difficulty * 5) + 5;

	const entrances = [];

	// Disable these entrances if their factory is destroyed
	if (getObject("infFactory2") !== null) entrances.push("infEntry11");
	if (getObject("infCybFactory2") !== null) entrances.push("infEntry14");

	if (!infFactoryOnlyWave)
	{
		entrances.push(
			"infEntry1", "infEntry2", "infEntry3",
			"infEntry4", "infEntry5", "infEntry6",
			"infEntry7", "infEntry8", "infEntry9",
			"infEntry10", "infEntry12", "infEntry13",
			"infEntry15"
		);
	}
	else // Only spawn if there is a nearby factory
	{
		if (getObject("infHvyFactory") !== null) entrances.push("infEntry9");
		if (getObject("infFactory1") !== null) entrances.push("infEntry10");
		if (getObject("infFactory3") !== null) entrances.push("infEntry12");
		if (getObject("infFactory5") !== null) entrances.push("infEntry15");
	}

	const NUM_GROUPS = difficulty + 2;
	const NUM_ENTRANCES = entrances.length;
	for (let i = 0; i < (Math.min(NUM_ENTRANCES, NUM_GROUPS)); i++)
	{
		// Spawn units at a random entrance
		const INDEX = camRand(entrances.length);
		camSendReinforcement(CAM_INFESTED, getObject(entrances[INDEX]), camRandInfTemplates(camRandFrom(coreDroids), CORE_SIZE, FODDER_SIZE, B_CHANCE), CAM_REINFORCE_GROUND);
		entrances.splice(INDEX, 1);
	}

	if (difficulty > SUPEREASY)
	{
		// Always stay in factory-only mode on SUPEREASY
		infFactoryOnlyWave = !infFactoryOnlyWave;
	}
}

// Delay when Foxtrot can rebuild their commander
function allowFoxtrotCommanderRebuild()
{
	return (difficulty > EASY) && (gameTime >= foxtrotCommanderDeathTime + MIS_FOXTROT_COMMANDER_DELAY) && (enumStruct(MIS_TEAM_FOXTROT, COMMAND_CONTROL).length > 0);
}

// Returns a list of targets that should be focused by team Golf's bomber squadron
function golfStrikeTargets()
{
	// First, target any player Factories, Command Ceners, Repair Facilities and Power Generators
	let targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
		struct.stattype === FACTORY || struct.stattype === CYBORG_FACTORY
		|| struct.stattype === VTOL_FACTORY || struct.stattype === HQ
		|| struct.stattype === REPAIR_FACILITY || struct.stattype === POWER_GEN
	));

	if (targets.length === 0)
	{
		// Second, target any AA structures
		targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (
			struct.stattype === DEFENSE && struct.canHitAir && !struct.canHitGround
		));
	}

	if (targets.length === 0)
	{
		// Lastly, target any non-wall structure
		targets = enumStruct(CAM_HUMAN_PLAYER).filter((struct) => (struct.stattype !== WALL));
	}

	return targets;
}

// Returns true if both Foxtrot and Golf have been defeated and all of their stuff has been absorbed by the player
function teamsDefeated()
{
	if (foxtrotDefeated && golfDefeated)
	{
		return true;
	}
	return undefined;
}

function eventStartLevel()
{
	const startPos = camMakePos("landingZone");
	const lz = getObject("landingZone"); //player lz

	centreView(startPos.x, startPos.y);
	setNoGoArea(lz.x, lz.y, lz.x2, lz.y2, CAM_HUMAN_PLAYER);
	
	camSetStandardWinLossConditions(CAM_VICTORY_STANDARD, "A4L4S", {
		ignoreInfestedUnits: true,
		callback: "teamsDefeated"
	});
	camSetExtraObjectiveMessage([_("Defeat Team Foxtrot"), _("Defeat Team Golf")]);

	setAlliance(MIS_TEAM_FOXTROT, MIS_TEAM_GOLF, true);

	changePlayerColour(MIS_TEAM_FOXTROT, (playerData[0].colour !== 13) ? 13 : 4); // Foxtrot to infrared or red
	changePlayerColour(MIS_TEAM_GOLF, (playerData[0].colour !== 7) ? 7 : 12); // Golf to cyan or neon green

	camSetArtifacts({
		"foxtrotResearch1": { tech: "R-Wpn-Flamer-ROF03" }, // Flamer Autoloader Mk3
		"foxtrotResearch2": { tech: "R-Wpn-Rocket-Damage07" }, // HESH Rocket Warhead
		"foxtrotFactory1": { tech: "R-Struc-Factory-Upgrade03" }, // Advanced Manufacturing
		"golfResearch1": { tech: "R-Wpn-Bomb-Damage02" }, // Improved Bomb Warhead
		"golfResearch2": { tech: "R-Defense-WallUpgrade06" }, // Supercrete Mk3
		// "golfPower": { tech: "R-Struc-Power-Upgrade03" }, // Gas Turbine Generator Mk3
		"golfFactory3": { tech: "R-Vehicle-Metals06" }, // Dense Composite Alloys Mk3
	});

	camCompleteRequiredResearch(camAct4StartResearch, MIS_TEAM_FOXTROT);
	camCompleteRequiredResearch(mis_teamExtraResearch, MIS_TEAM_FOXTROT);
	camCompleteRequiredResearch(camAct4StartResearch, MIS_TEAM_GOLF);
	camCompleteRequiredResearch(mis_teamExtraResearch, MIS_TEAM_GOLF);
	camCompleteRequiredResearch(mis_infestedResearch, CAM_INFESTED);

	camSetEnemyBases({
		"infWestBase": {
			cleanup: "infBase1",
			detectMsg: "INF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infWestCanyonBase": {
			cleanup: "infBase2",
			detectMsg: "INF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthWestHillBase": {
			cleanup: "infBase3",
			detectMsg: "INF_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infSouthCanyonBase": {
			cleanup: "infBase4",
			detectMsg: "INF_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infCraterBase": {
			cleanup: "infBase5",
			detectMsg: "INF_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infEastHillBase": {
			cleanup: "infBase6",
			detectMsg: "INF_BASE6",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"infEastCanyonBase": {
			cleanup: "infBase7",
			detectMsg: "INF_BASE7",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"foxtrotMainBase": {
			cleanup: "foxtrotBase1",
			detectMsg: "FOXTROT_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"foxtrotAltBase": {
			cleanup: "foxtrotBase2",
			detectMsg: "FOXTROT_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"foxtrotEastRidgeBase": {
			cleanup: "foxtrotBase3",
			detectMsg: "FOXTROT_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: MIS_TEAM_FOXTROT
		},
		"foxtrotNorthHillBase": {
			cleanup: "foxtrotBase4",
			detectMsg: "FOXTROT_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: MIS_TEAM_FOXTROT
		},
		"foxtrotCraterHillBase": {
			cleanup: "foxtrotBase5",
			detectMsg: "FOXTROT_BASE5",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: MIS_TEAM_FOXTROT
		},
		"foxtrotWestRidgeBase": {
			cleanup: "foxtrotBase6",
			detectMsg: "FOXTROT_BASE6",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: MIS_TEAM_FOXTROT
		},
		"foxtrotWaterRidgeBase": {
			cleanup: "foxtrotBase7",
			detectMsg: "FOXTROT_BASE7",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: MIS_TEAM_FOXTROT
		},
		"golfMainBase": {
			cleanup: "golfBase1",
			detectMsg: "GOLF_BASE1",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"golfBridgeBase": {
			cleanup: "golfBase2",
			detectMsg: "GOLF_BASE2",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"golfVtolBase": {
			cleanup: "golfBase3",
			detectMsg: "GOLF_BASE3",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
		},
		"golfForwardBase": {
			cleanup: "golfBase4",
			detectMsg: "GOLF_BASE4",
			detectSnd: cam_sounds.baseDetection.enemyBaseDetected,
			eliminateSnd: cam_sounds.baseElimination.enemyBaseEradicated,
			player: MIS_TEAM_GOLF
		},
	});

	camSetFactories({
		"foxtrotFactory1": {
			throttle: MIS_FOXTROT_FACTORY_TIME,
			// The team factories hold no templates; they just restock refillable groups
			templates: []
		},
		"foxtrotFactory2": {
			throttle: MIS_FOXTROT_FACTORY_TIME,
			templates: []
		},
		"foxtrotFactory3": {
			throttle: MIS_FOXTROT_FACTORY_TIME,
			templates: []
		},
		"foxtrotFactory4": {
			throttle: MIS_FOXTROT_FACTORY_TIME,
			templates: []
		},
		"foxtrotCybFactory1": {
			throttle: MIS_CYBORG_FACTORY_TIME,
			templates: []
		},
		"foxtrotCybFactory2": {
			throttle: MIS_CYBORG_FACTORY_TIME,
			templates: []
		},
		"foxtrotCybFactory3": {
			throttle: MIS_CYBORG_FACTORY_TIME,
			templates: []
		},
		"foxtrotCybFactory4": {
			throttle: MIS_CYBORG_FACTORY_TIME,
			templates: []
		},
		"golfFactory1": {
			throttle: MIS_GOLF_FACTORY_TIME,
			templates: []
		},
		"golfFactory2": {
			throttle: MIS_GOLF_FACTORY_TIME,
			templates: []
		},
		"golfFactory3": {
			throttle: MIS_GOLF_FACTORY_TIME,
			templates: []
		},
		"golfVtolFactory1": {
			assembly: "golfVtolAssembly1",
			throttle: MIS_VTOL_FACTORY_TIME,
			templates: []
		},
		"golfVtolFactory2": {
			assembly: "golfVtolAssembly2",
			throttle: MIS_VTOL_FACTORY_TIME,
			templates: []
		},
		"golfVtolFactory3": {
			assembly: "golfVtolAssembly3",
			throttle: MIS_VTOL_FACTORY_TIME,
			templates: []
		},
		"infFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infbuscan, cTempl.infrbuggy, cTempl.infgbjeep, cTempl.infsartruck ]
		},
		"infFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infmonlan, cTempl.inftrike, cTempl.infflatmrl, cTempl.infbjeep, cTempl.infrbjeep ]
		},
		"infFactory3": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infkevbloke, cTempl.infmonhmg, cTempl.infkevlance, cTempl.infmoncan ]
		},
		"infFactory4": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.infmonmrl, cTempl.infgbjeep, cTempl.infminitruck, cTempl.infbuscan ]
		},
		"infFactory5": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(22)),
			templates: [ cTempl.inffiretruck, cTempl.infrbjeep, cTempl.infflatat, cTempl.infbuggy ]
		},
		"infHvyFactory": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(35)),
			templates: [ cTempl.infcolaaht, cTempl.infcolpodt, cTempl.infcommcant, cTempl.infcomatt, cTempl.infcomhmgt ]
		},
		"infCybFactory1": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.infcybhg, cTempl.infcybfl, cTempl.infcybgr, cTempl.infcybla ]
		},
		"infCybFactory2": {
			throttle: camChangeOnDiff(camSecondsToMilliseconds(28)),
			templates: [ cTempl.infscymc, cTempl.infcybca, cTempl.infcybmr ]
		},
	});

	// Set up trucks...
	const FOXTROT_TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 90 : 180));
	const GOLF_TRUCK_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 60 : 120));
	const ENGINEER_TIME = camChangeOnDiff(camSecondsToMilliseconds((tweakOptions.rec_timerlessMode) ? 30 : 60));
	// Foxtrot...
	camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotMainBase",
			respawnDelay: FOXTROT_TRUCK_TIME,
			rebuildBase: (tweakOptions.rec_timerlessMode || difficulty > MEDIUM),
			truckDroid: getObject("foxtrotTruck1"),
			structset: camAreaToStructSet("foxtrotBase1")
	});
	camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotMainBase",
			respawnDelay: FOXTROT_TRUCK_TIME,
			rebuildBase: (tweakOptions.rec_timerlessMode || difficulty > MEDIUM),
			truckDroid: getObject("foxtrotTruck2"),
			structset: camAreaToStructSet("foxtrotBase1")
	});
	camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotAltBase",
			respawnDelay: FOXTROT_TRUCK_TIME,
			rebuildBase: (tweakOptions.rec_timerlessMode || difficulty > MEDIUM),
			truckDroid: getObject("foxtrotTruck3"),
			structset: camAreaToStructSet("foxtrotBase2")
	});
	camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotEastRidgeBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: true,
			template: cTempl.cyben,
			structset: camA4L3FoxtrotForwardStructs1
	});
	camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotNorthHillBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: true,
			template: cTempl.cyben,
			structset: camA4L3FoxtrotForwardStructs2
	});
	camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotCraterHillBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: true,
			template: cTempl.cyben,
			structset: camA4L3FoxtrotForwardStructs3
	});
	camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotWestRidgeBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: true,
			template: cTempl.cyben,
			structset: camA4L3FoxtrotForwardStructs4
	});
	camManageTrucks(
		MIS_TEAM_FOXTROT, {
			label: "foxtrotWaterRidgeBase",
			respawnDelay: ENGINEER_TIME,
			rebuildBase: true,
			template: cTempl.cyben,
			structset: camA4L3FoxtrotForwardStructs5
	});
	if (difficulty >= HARD || tweakOptions.rec_timerlessMode)
	{
		camManageTrucks(
			MIS_TEAM_FOXTROT, {
				label: "foxtrotMainBase",
				respawnDelay: ENGINEER_TIME,
				rebuildBase: true,
				template: cTempl.cyben,
				structset: camAreaToStructSet("foxtrotBase1")
		});
		if (difficulty === INSANE)
		{
			camManageTrucks(
				MIS_TEAM_FOXTROT, {
					label: "foxtrotMainBase",
					respawnDelay: ENGINEER_TIME,
					rebuildBase: true,
					template: cTempl.cyben,
					structset: camAreaToStructSet("foxtrotBase1")
			});
		}
	}

	// Golf...
	camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfMainBase",
			respawnDelay: GOLF_TRUCK_TIME,
			rebuildBase: (tweakOptions.rec_timerlessMode || difficulty > MEDIUM),
			truckDroid: getObject("golfTruck1"),
			structset: camAreaToStructSet("golfBase1")
	});
	camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfMainBase",
			respawnDelay: GOLF_TRUCK_TIME,
			rebuildBase: (tweakOptions.rec_timerlessMode || difficulty > MEDIUM),
			truckDroid: getObject("golfTruck2"),
			structset: camAreaToStructSet("golfBase1")
	});
	camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfBridgeBase",
			respawnDelay: GOLF_TRUCK_TIME,
			rebuildBase: (tweakOptions.rec_timerlessMode || difficulty > MEDIUM),
			truckDroid: getObject("golfTruck3"),
			structset: camAreaToStructSet("golfBase2")
	});
	camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfVtolBase",
			respawnDelay: GOLF_TRUCK_TIME,
			rebuildBase: (tweakOptions.rec_timerlessMode || difficulty > MEDIUM),
			truckDroid: getObject("golfTruck4"),
			structset: camAreaToStructSet("golfBase3")
	});
	camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfVtolBase",
			respawnDelay: GOLF_TRUCK_TIME,
			rebuildBase: (tweakOptions.rec_timerlessMode || difficulty > MEDIUM),
			truckDroid: getObject("golfTruck5"),
			structset: camAreaToStructSet("golfBase3")
	});	
	camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfForwardBase",
			respawnDelay: GOLF_TRUCK_TIME,
			rebuildBase: true,
			template: cTempl.plhtruckt,
			structset: camA4L3GolfForwardBaseStructs
	});
	camManageTrucks(
		MIS_TEAM_GOLF, {
			label: "golfForwardBase",
			respawnDelay: GOLF_TRUCK_TIME,
			rebuildBase: true,
			template: cTempl.plhtruckt,
			structset: camA4L3GolfForwardBaseStructs
	});
	if (difficulty >= HARD || tweakOptions.rec_timerlessMode)
	{
		camManageTrucks(
			MIS_TEAM_GOLF, {
				label: "golfMainBase",
				respawnDelay: GOLF_TRUCK_TIME,
				rebuildBase: true,
				template: cTempl.plhtruckt,
				structset: camAreaToStructSet("golfBase1")
		});
		camManageTrucks(
			MIS_TEAM_GOLF, {
				label: "golfVtolBase",
				respawnDelay: GOLF_TRUCK_TIME,
				rebuildBase: true,
				template: cTempl.plhtruckt,
				structset: camAreaToStructSet("golfBase3")
		});
		if (difficulty === INSANE)
		{
			camManageTrucks(
				MIS_TEAM_GOLF, {
					label: "golfVtolBase",
					respawnDelay: GOLF_TRUCK_TIME,
					rebuildBase: true,
					template: cTempl.plhtruckt,
					structset: camAreaToStructSet("golfBase3")
			});
		}
	}

	if (!tweakOptions.rec_timerlessMode)
	{
		setMissionTime(camChangeOnDiff(camHoursToSeconds(2)));
	}

	// Manage refillable groups
	// Foxtrot groups...
	camSetDroidRank(getObject("foxtrotCommander"), foxtrotRank);
	camMakeRefillableGroup(
		camMakeGroup("foxtrotCommander"), {
			templates: [cTempl.plhcomw],
			factories: ["foxtrotFactory1", "foxtrotFactory2"],
			callback: "allowFoxtrotCommanderRebuild"
		}, CAM_ORDER_ATTACK, {
			repair: 75,
			targetPlayer: CAM_HUMAN_PLAYER
	});
	camMakeRefillableGroup(
		camMakeGroup("foxtrotCommandGroup"), {
			templates: [ // 8 Tank Killers, 6 Thermite Flamers, 4 Bunker Busters
				cTempl.plhhatw, cTempl.plhhatw,
				cTempl.cybth, cTempl.cybth,
				cTempl.plhbbw, cTempl.plhbbw,
				cTempl.plhhatw, cTempl.plhhatw,
				cTempl.cybth, cTempl.cybth,
				cTempl.plhbbw, cTempl.plhbbw,
				cTempl.plhhatw, cTempl.plhhatw,
				cTempl.cybth, cTempl.cybth,
				cTempl.cybth, cTempl.cybth, // 2 Thermite Flamers (Hard+)
				cTempl.plhbbw, cTempl.plhbbw, // 2 Bunker Busters (Insane)
			],
			factories: ["foxtrotFactory1", "foxtrotFactory2", "foxtrotCybFactory1", "foxtrotCybFactory2"]
		}, CAM_ORDER_FOLLOW, {
			leader: "foxtrotCommander",
			repair: 75,
			suborder: CAM_ORDER_ATTACK,
			data: {
				targetPlayer: CAM_HUMAN_PLAYER,
				repair: 75
			}
	});
	camMakeRefillableGroup(
		camMakeGroup("foxtrotHoverGroup"), {
			templates: [ // 6 Tank Killers, 6 Bunker Busters, 4 Infernos
				cTempl.plhhath, cTempl.plhhath,
				cTempl.plhbbh, cTempl.plhbbh,
				cTempl.plhinfh, cTempl.plhinfh,
				cTempl.plhhath, cTempl.plhhath,
				cTempl.plhbbh, cTempl.plhbbh,
				cTempl.plhinfh, cTempl.plhinfh,
				cTempl.plhhath, cTempl.plhhath,
				cTempl.plhbbh, cTempl.plhbbh,
			],
			factories: ["foxtrotFactory3", "foxtrotFactory4"]
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("hoverPatrolPos1"),
				camMakePos("hoverPatrolPos2"),
				camMakePos("hoverPatrolPos3"),
				camMakePos("hoverPatrolPos4"),
				camMakePos("hoverPatrolPos5"),
			],
			interval: camSecondsToMilliseconds(24),
			radius: 20,
			count: 16,
			// morale: 60,
			repair: 75,
			fallback: camMakePos("hoverFallbackPos")
	});
	camMakeRefillableGroup(
		camMakeGroup("foxtrotSupportGroup1"), {
			templates: [
				cTempl.plhbbht, cTempl.plhbbht, // 2 Bunker Busters
				cTempl.plhinfht, cTempl.plhinfht, // 2 Infernos
				cTempl.plhhaaht, cTempl.plhhaaht, // 2 Cyclones
				cTempl.cybth, cTempl.cybth, // 6 Thermite Flamers
				cTempl.scytk, cTempl.scytk, // 6 Super Tank Killers
				cTempl.cybth, cTempl.cybth,
				cTempl.scytk, cTempl.scytk,
				cTempl.cybth, cTempl.cybth,
				cTempl.scytk, cTempl.scytk,
			],
			globalFill: true,
			player: MIS_TEAM_FOXTROT,
		}, CAM_ORDER_ATTACK, {
			targetPlayer: CAM_HUMAN_PLAYER,
			count: -1,
			regroup: true,
			repair: 75
	});
	camMakeRefillableGroup(
		camMakeGroup("foxtrotSupportGroup2"), {
			templates: [
				cTempl.plhhatht, cTempl.plhhatht, // 2 Tank Killers
				cTempl.plhinfht, cTempl.plhinfht, // 2 Infernos
				cTempl.plhhaaht, cTempl.plhhaaht, cTempl.plhhaaht, cTempl.plhhaaht, // 4 Cyclones
				cTempl.cybth, cTempl.cybth, // 4 Thermite Flamers
				cTempl.scytk, cTempl.scytk, // 6 Super Tank Killers
				cTempl.cybth, cTempl.cybth,
				cTempl.scytk, cTempl.scytk, cTempl.scytk, cTempl.scytk,
			],
			globalFill: true,
			player: MIS_TEAM_FOXTROT,
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("foxtrotPatrolPos1"),
				camMakePos("foxtrotPatrolPos2"),
				camMakePos("foxtrotPatrolPos3"),
				camMakePos("foxtrotPatrolPos4"),
			],
			radius: 20,
			count: -1,
			regroup: true,
			repair: 75
	});

	// Golf groups...
	camMakeRefillableGroup(
		camMakeGroup("golfAttackGroup"), {
			templates: [ // 6 HRAs, 4 Heavy Cannons, 4 Cyclones, 1 Sensor 
				cTempl.plhhcant, cTempl.plhhcant,
				cTempl.plhhrat, cTempl.plhhrat,
				cTempl.plhhaat, cTempl.plhhaat,
				cTempl.plhsenst,
				cTempl.plhhcant, cTempl.plhhcant,
				cTempl.plhhrat, cTempl.plhhrat,
				cTempl.plhhaat, cTempl.plhhaat,
				cTempl.plhhrat, cTempl.plhhrat,
			],
			factories: ["golfFactory1", "golfFactory3"]
		}, CAM_ORDER_ATTACK, {
			targetPlayer: CAM_HUMAN_PLAYER,
			repair: 50
	});
	golfSensorsGroup = camMakeRefillableGroup(
		camMakeGroup("golfSensor"), {
			templates: [cTempl.plhsenst],
			factories: ["golfFactory2"]
		}, CAM_ORDER_ATTACK, {
			repair: 50,
			targetPlayer: CAM_HUMAN_PLAYER
	});
	camMakeRefillableGroup(
		camMakeGroup("golfDefenseGroup"), {
			templates: [ // 2 HRAs, 2 Heavy Cannons, 4 Cyclones
				cTempl.plhhrat,
				cTempl.plhhcant,
				cTempl.plhhaat, cTempl.plhhaat,
				cTempl.plhhrat,
				cTempl.plhhcant,
				cTempl.plhhaat, cTempl.plhhaat,
			],
			factories: ["golfFactory1", "golfFactory2"]
		}, CAM_ORDER_PATROL, {
			pos: [
				camMakePos("golfPatrolPos1"),
				camMakePos("golfPatrolPos2"),
				camMakePos("golfPatrolPos3"),
			],
			interval: camSecondsToMilliseconds(38),
			repair: 50
	});
	camMakeRefillableGroup(
		camMakeGroup("golfSensorGroup"), {
			templates: [ // 6 Howitzers, 2 Cyclones
				cTempl.plhhowt, cTempl.plhhowt, cTempl.plhhowt,
				cTempl.plhhaat, cTempl.plhhaat,
				cTempl.plhhowt, cTempl.plhhowt, cTempl.plhhowt,
			],
			factories: ["golfFactory2"]
		}, CAM_ORDER_FOLLOW, {
			leader: "golfSensor",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("golfBase2"),
				repair: 50
			}
	});
	camMakeRefillableGroup(
		camMakeGroup("golfCBGroup1"), {
			templates: [ // 4 Ripple Rockets
				cTempl.plhript, cTempl.plhript, cTempl.plhript, cTempl.plhript,
			],
			obj: "golfCBTower1",
			factories: ["golfFactory3"]
		}, CAM_ORDER_FOLLOW, {
			leader: "golfCBTower1",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("golfCBGroup1"),
				repair: 50
			}
	});
	camMakeRefillableGroup(
		camMakeGroup("golfCBGroup2"), {
			templates: [ // 4 Ripple Rockets
				cTempl.plhript, cTempl.plhript, cTempl.plhript, cTempl.plhript,
			],
			obj: "golfCBTower2",
			factories: ["golfFactory1"]
		}, CAM_ORDER_FOLLOW, {
			leader: "golfCBTower2",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("golfCBGroup2"),
				repair: 50
			}
	});
	golfVtolAttackGroup = camMakeRefillableGroup(
		camMakeGroup("golfVtolAttackGroup"), {
			templates: [ // 4 HEAP Bombs, 4 Thermite Bombs
				cTempl.plmhbombv, cTempl.plmhbombv,
				cTempl.plmtbombv, cTempl.plmtbombv,
				cTempl.plmhbombv, cTempl.plmhbombv,
				cTempl.plmtbombv, cTempl.plmtbombv,
			],
			factories: ["golfVtolFactory1"]
		}, CAM_ORDER_ATTACK, {
			repair: 50,
			targetPlayer: CAM_HUMAN_PLAYER,
	});
	camMakeRefillableGroup(
		camMakeGroup("golfVtolTowerGroup1"), {
			templates: [ // 2 HEAP Bombs, 2 Thermite Bombs
				cTempl.plmhbombv, cTempl.plmtbombv,
				cTempl.plmhbombv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_GOLF,
			obj: "golfVtolTower1",
		}, CAM_ORDER_FOLLOW, {
			leader: "golfVtolTower1",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("golfVtolAssembly2"),
				radius: 20,
				repair: 50,
			}
	});
	camMakeRefillableGroup(
		camMakeGroup("golfVtolTowerGroup2"), {
			templates: [ // 2 HEAP Bombs, 2 Thermite Bombs
				cTempl.plmhbombv, cTempl.plmtbombv,
				cTempl.plmhbombv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_GOLF,
			obj: "golfVtolTower2",
		}, CAM_ORDER_FOLLOW, {
			leader: "golfVtolTower2",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("golfVtolAssembly2"),
				radius: 20,
				repair: 50,
			}
	});
	camMakeRefillableGroup(
		camMakeGroup("golfVtolCBGroup1"), {
			templates: [ // 2 HEAP Bombs, 2 Thermite Bombs
				cTempl.plmhbombv, cTempl.plmtbombv,
				cTempl.plmhbombv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_GOLF,
			obj: "golfVtolCBTower1",
		}, CAM_ORDER_FOLLOW, {
			leader: "golfVtolCBTower1",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("golfVtolAssembly2"),
				radius: 20,
				repair: 50,
			}
	});
	camMakeRefillableGroup(
		camMakeGroup("golfVtolCBGroup2"), {
			templates: [ // 2 HEAP Bombs, 2 Thermite Bombs
				cTempl.plmhbombv, cTempl.plmtbombv,
				cTempl.plmhbombv, cTempl.plmtbombv,
			],
			globalFill: true,
			player: MIS_TEAM_GOLF,
			obj: "golfVtolCBTower2",
		}, CAM_ORDER_FOLLOW, {
			leader: "golfVtolCBTower2",
			repair: 50,
			suborder: CAM_ORDER_DEFEND,
			data: {
				pos: camMakePos("golfVtolAssembly2"),
				radius: 20,
				repair: 50,
			}
	});
	golfVtolStrikeGroup = camMakeRefillableGroup(
		camMakeGroup("golfVtolStrikeGroup"), {
			templates: [ // 9 HEAP Bombs
				cTempl.plmhbombv, cTempl.plmhbombv, cTempl.plmhbombv,
				cTempl.plmhbombv, cTempl.plmhbombv, cTempl.plmhbombv,
				cTempl.plmhbombv, cTempl.plmhbombv, cTempl.plmhbombv,
			],
			factories: ["golfVtolFactory2", "golfVtolFactory3"]
		}, CAM_ORDER_STRIKE, {
			repair: 50,
			callback: "golfStrikeTargets",
			minCount: 9,
			altOrder: CAM_ORDER_DEFEND,
			radius: 20,
			pos: camMakePos("golfVtolAssembly2"),
	});

	// Remove the droids from some of the starting groups based on difficulty
	let deleteDroids = [];
	if (difficulty < HARD)
	{
		deleteDroids = deleteDroids.concat(enumArea("foxtrotSupportGroup1", MIS_TEAM_FOXTROT, false));
		deleteDroids = deleteDroids.concat(enumArea("golfVtolAttackGroup", MIS_TEAM_GOLF, false));
	}
	if (difficulty < MEDIUM)
	{
		deleteDroids = deleteDroids.concat(enumArea("foxtrotHoverGroup", MIS_TEAM_FOXTROT, false));
		deleteDroids = deleteDroids.concat(enumArea("golfVtolStrikeGroup", MIS_TEAM_GOLF, false));
	}

	for (const droid of deleteDroids)
	{
		camSafeRemoveObject(droid);
	}

	foxtrotCommanderDeathTime = 0;
	foxtrotRank = (difficulty <= MEDIUM) ? 6 : difficulty + 4; // Elite to Hero
	foxtrotDefeated = false;
	golfDefeated = false;
	infFactoryOnlyWave = true;
	banterIdx = 1;

	camAutoReplaceObjectLabel(["golfVtolTower1", "golfVtolTower2", "golfVtolCBTower1", "golfVtolCBTower2", "golfCBTower1", "golfCBTower2"]);

	// These factories start active immediately
	camEnableFactory("foxtrotFactory1");
	camEnableFactory("foxtrotCybFactory1");

	queue("activateInfested", camChangeOnDiff(camMinutesToMilliseconds(2)));
	queue("activateTeamFactories", camChangeOnDiff(camMinutesToMilliseconds(3)));

	setTimer("teamBanter", camMinutesToMilliseconds(5));

	// Give player briefing.
	camPlayVideos({video: "A4L3_BRIEF", type: MISS_MSG});

	// Additional dialogue...
	camQueueDialogue([
		// Long delay
		{text: "GOLF: Surprise, Bravo!", delay: 40, sound: CAM_RCLICK},
		{text: "FOXTROT: Give it up, Bravo.", delay: 4, sound: CAM_RCLICK},
		{text: "FOXTROT: We've got you cornered; there's nowhere for you to go.", delay: 2, sound: CAM_RCLICK},
		{text: "GOLF: That's right!", delay: 4, sound: CAM_RCLICK},
		{text: "GOLF: No more running away!", delay: 2, sound: CAM_RCLICK},
	]);

	// Most Infested units start out pre-damaged
	camSetPreDamageModifier(CAM_INFESTED, [50, 80], [60, 90], CAM_INFESTED_PREDAMAGE_EXCLUSIONS);

	// Give the fog a pink hue
	camSetFog(24, 16, 64);
	// Shift the sun towards the west
	camSetSunPos(450.0, -400.0, 225.0);
	// Add a purple-blue tint
	camSetSunIntensity(.45, .4, .5);
}