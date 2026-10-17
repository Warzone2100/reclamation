//;; # `libcampaign.js` documentation
//;;
//;; `libcampaign.js` is a JavaScript library supplied with the game,
//;; which contains reusable code for campaign scenarios. It is designed to
//;; make scenario development as high-level and declarative as possible.
//;; It also contains a few simple convenient wrappers.
//;; Public API functions of `libcampaign.js` are prefixed with `cam`.
//;; To use `libcampaign.js`, add the following include into your scenario code:
//;;
//;; ```js
//;; include("script/campaign/libcampaign.js");
//;; ```
//;;
//;; Also, most of the `libcampaign.js` features require some of the game
//;; events handled by the library. Transparent JavaScript pre-hooks are
//;; therefore injected into your global event handlers upon include.
//;; For example, if `camSetArtifacts()` was called to let `libcampaign.js`
//;; manage scenario artifacts, then `eventPickup()` will be first handled
//;; by the library, and only then your handler will be called, if any.
//;; All of this happens automagically and does not normally require
//;; your attention.
//;;

/*
	Private vars and functions are prefixed with `__cam`.
	Private consts are prefixed with `__CAM_` or `__cam_`.
	Public vars/functions are prefixed with `cam`, consts with `CAM_` or `cam_`.
	Please do not use private stuff in scenario code, use only public API.

	It is encouraged to prefix any local consts with `__` in any function in the
	library if they are not objects/arrays. Mission scripts may use a `_` but
	only if the name seems like it could clash with a JS API global.

	Please CAPITALIZE const names for consistency for most of everything.
	The only exception to these rules is when the const is declared in a loop
	initialization or will be assigned as a global-context callback function,
	or if it will be a JS object/array as these aren't truly immutable. Follow
	standard camel case style as usual.

	Also, in the event you want a top level const for a mission script
	(and any include file) please prefix it with `MIS_` or `mis_` depending on
	if it's an object/array or not.

	We CANNOT put our private vars into an anonymous namespace, even though
	it's a common JS trick -

		(function(global) {
			var __camPrivateVar; // something like that
		})(this);

	because they would break on savegame-loadgame. So let's just agree
	that we'd never use them anywhere outside the file, so that it'd be easier
	to change them, and also think twice before we change the public API.

	The lib is split into sections, each section is separated with a slash line:

////////////////////////////////////////////////////////////////////////////////
// Section name.
////////////////////////////////////////////////////////////////////////////////

	yeah, like that. Also, it's exactly 80 characters wide.

	In each section, public stuff is on TOP, and private stuff
	is below, split from the public stuff with:

//////////// privates

	, for easier reading (all the useful stuff on top).

	Please leave camDebug() around if something that should never happen
	occurs, indicating an actual bug in campaign. Then a sensible message
	should be helpful as well. But normally, no warnings should ever be
	printed.

	In cheat mode, more warnings make sense, explaining what's going on
	under the hood. Use camTrace() for such warnings - they'd auto-hide
	outside cheat mode.

	Lines prefixed with // followed by ;; are docstrings for JavaScript API
	documentation.
*/

////////////////////////////////////////////////////////////////////////////////
// Library initialization.
////////////////////////////////////////////////////////////////////////////////

// Registers a private event namespace for this library, to avoid collisions with
// any event handling in code using this library. Make sure no other library uses
// the same namespace, or strange things will happen. After this, we can name our
// event handlers with the registered prefix, and they will still get called.
namespace("cam_");

//////////global vars start
//These are campaign player numbers.
const CAM_HUMAN_PLAYER = 0;
const CAM_NEW_PARADIGM = 1;
const CAM_THE_COLLECTIVE = 2;
const CAM_NEXUS = 3;
const CAM_INFESTED = 4;
const CAM_SCAV_6 = 6;
const CAM_SCAV_7 = 7;

const __CAM_MAX_PLAYERS = 10;
const __CAM_TICKS_PER_FRAME = 100;
const __CAM_AI_POWER = 999999;
const __CAM_INCLUDE_PATH = "script/campaign/libcampaign_includes/";

//level load codes here for reference. Might be useful for later code.
const CAM_A0_OUT = "A0_END"; // Fake next level for the final Act 0 mission.
const CAM_A4_OUT = "A4_END"; // Fake next level for the final Act 4 mission.
const __CAM_RECLAMATION_CAMPAIGN_NUMBER = 0;
const __CAM_PROLOGUE_CAMPAIGN_NUMBER = 1;
const __CAM_ACT1_CAMPAIGN_NUMBER = 2;
const __CAM_ACT2_CAMPAIGN_NUMBER = 3;
const __CAM_ACT3_CAMPAIGN_NUMBER = 4;
const __CAM_ACT4_CAMPAIGN_NUMBER = 5;
const __CAM_UNKNOWN_CAMPAIGN_NUMBER = -1;
const __cam_reclamationLevels = [
	"L1", // RECLAMATION
	"L2S", "L2", // LIBERATOR
	"L3", // STOMP OUT
	"L4S", "L4", // BREACH
	"L5S", "L5", // CLEANUP
	"L6S", "L6", // FRIENDLY SKIES
	"L7", // BLAST SHADOWS
]; // 7 missions
const __cam_prologueLevels = [
	"P1", // THE SUCCESSOR
	"P2", // SAFE HAVEN
]; // 2 missions
const __cam_act1Levels = [
	"A1L1", // WELCOME TO THE JUNGLE
	"A1L2S", "A1L2", // ALLIED ASSAULT
	"A1L3", // FROM THE HORIZON
	"A1L4S", "A1L4", // THE COLLECTIVE
	"A1L5S", "A1L5", // DECAPITATION
	"A1L6", // ONSLAUGHT
]; // 6 missions
const __cam_act2Levels = [
	"A2L1", // REASSEMBLY REQUIRED
	"A2L2S", "A2L2", // DISILLUSIONED
	"A2L3", // REFOCUS
	"A2L4S", "A2L4", // SPLIT THE SKY
	"A2L5", // CHOKEHOLD
	"A2L6S", "A2L6", // BREAKOUT
	"A2L7", // REPRISE
]; // 7 missions
const __cam_act3Levels = [
	"A3L1", // OUTBREAK
	"A3L2", // MALIGNANT
	"A3L3S", "A3L3", // SEARCH AND DESTROY
	"A3L4", // DEFIANCE
	"A3L5S", "A3L5", // ARMS RACE
	"A3L6", // TIGER'S DEN
	"A3L7S", "A3L7", // X-FACTOR
	"A3L8", // VICTORY HOUR
	"A3L9", // FALLING STAR
]; // 9 missions
const __cam_act4Levels = [
	"A4L1", // DEAD CENTER
	"A4L2S", "A4L2", // UPLINK
	"A4L3", // SHOWDOWN
	"A4L4S", "A4L4", // THE USURPER
	"A4L5", // MIGHT OF THE MACHINE
	"A4L6", // EXODUS
]; // 6 missions
// total missions: 37

// Holds all the sounds the campaign uses. Try to name things as they are said.
const cam_sounds = {
	baseDetection: {
		scavengerOutpostDetected: "pcv375.ogg",
		scavengerBaseDetected: "pcv374.ogg",
		enemyBaseDetected: "pcv379.ogg",
		enemyLZDetected: "pcv382.ogg",
	},
	baseElimination: {
		scavengerOutpostEradicated: "pcv391.ogg",
		scavengerBaseEradicated: "pcv392.ogg",
		enemyBaseEradicated: "pcv394.ogg",
		enemyLZEradicated: "pcv665.ogg",
	},
	lz: {
		returnToLZ: "pcv427.ogg",
		LZCompromised: "pcv445.ogg",
		LZClear: "lz-clear.ogg",
	},
	transport: {
		transportUnderAttack: "pcv443.ogg",
		transportReturningToBase: "pcv446.ogg",
		enemyTransportDetected: "pcv381.ogg",
		incomingEnemyTransport: "pcv395.ogg",
	},
	incoming: {
		incomingIntelligenceReport: "pcv456.ogg",
		incomingTransmission: "pcv455.ogg",
	},
	rescue: {
		unitsRescued: "pcv615.ogg",
		groupRescued: "pcv616.ogg",
		civilianRescued: "pcv612.ogg",
	},
	nexus: {
		defensesAbsorbed: "defabsrd.ogg",
		defensesNeutralized: "defnut.ogg",
		laugh1: "laugh1.ogg",
		laugh2: "laugh2.ogg",
		laugh3: "laugh3.ogg",
		productionCompleted: "pordcomp.ogg",
		researchAbsorbed: "resabsrd.ogg",
		structureAbsorbed: "strutabs.ogg",
		structureNeutralized: "strutnut.ogg",
		synapticLinksActivated: "synplnk.ogg",
		unitAbsorbed: "untabsrd.ogg",
		unitNeutralized: "untnut.ogg",
	},
	infested: {
		structureInfected: "pcv623.ogg",
		unitInfected: "pcv624.ogg",
	},
	missile: {
		launch: {
			missileLaunchAborted: "labort.ogg",
			missileLaunched: "mlaunch.ogg",
			finalMissileLaunchSequenceInitiated: "flseq.ogg",
			missileEnteringFinalLaunchPeriod: "meflp.ogg",
			missileLaunchIn60Minutes: "60min.ogg",
			missileLaunchIn50Minutes: "50min.ogg",
			missileLaunchIn40Minutes: "40min.ogg",
			missileLaunchIn30Minutes: "30min.ogg",
			missileLaunchIn20Minutes: "20min.ogg",
			missileLaunchIn10Minutes: "10min.ogg",
			missileLaunchIn5Minutes: "5min.ogg",
			missileLaunchIn4Minutes: "4min.ogg",
			missileLaunchIn3Minutes: "3min.ogg",
			missileLaunchIn2Minutes: "2min.ogg",
			missileLaunchIn1Minute: "1min.ogg",
		},
		detonate: {
			warheadActivatedCountdownBegins: "wactivat.ogg",
			finalDetonationSequenceInitiated: "fdetseq.ogg",
			detonationIn60Minutes: "det60min.ogg",
			detonationIn50Minutes: "det50min.ogg",
			detonationIn40Minutes: "det40min.ogg",
			detonationIn30Minutes: "det30min.ogg",
			detonationIn20Minutes: "det20min.ogg",
			detonationIn10Minutes: "det10min.ogg",
			detonationIn5Minutes: "det5min.ogg",
			detonationIn4Minutes: "det4min.ogg",
			detonationIn3Minutes: "det3min.ogg",
			detonationIn2Minutes: "det2min.ogg",
			detonationIn1Minute: "det1min.ogg",
		},
		countdown: "10to1.ogg",
	},
	radio: {
		click1: "radclik1.ogg",
		click2: "radclik2.ogg",
		click3: "radclik3.ogg",
		click4: "radclik4.ogg",
		click5: "radclik5.ogg",
		click6: "radclik6.ogg",
	},
	objective: {
		objectiveCaptured: "pcv621.ogg",
		primObjectiveCompleted: "pcv626.ogg",
		objectiveDestroyed: "pcv622.ogg",
	},
	reinforcementsAreAvailable: "pcv440.ogg",
	enemyEscaping: "pcv632.ogg",
	powerTransferred: "power-transferred.ogg",
	technologyTransferred: "pcv485.ogg",
	unitsTransferred: "pcv486.ogg",
	laserSatelliteFiring: "pcv650.ogg",
	artifactRecovered: "pcv352.ogg",
	enemyUnitDetected: "pcv378.ogg",
	enemyVtolsDetected: "pcv388.ogg",
	incomingAirStrike: "pcv634.ogg",
	beacon: "beacon.ogg",
	tracker: "pcv657.ogg", // Used to place a red dot on the minimap
	soundIdentifier: ".ogg", //Used by video.js to check for sound before a video.
};

//artifact
var __camArtifacts;
var __camNumArtifacts;

//base
var __camEnemyBases;
var __camNumEnemyBases;

// Contains coordinates for collectible Black Box features across all campaigns.
// These are separate from level scripts since some Black Boxes can be picked up in multiple missions.

const __camRec1BlackBoxes = [
	{ scripts: ["L1", "L2s", "L3", "L4s", "L5s", "L6s", "L7"], x: 5, y: 6 }, // #1
	{ scripts: ["L2"], x: 55, y: 22 }, // #2
	{ scripts: ["L3", "L4s", "L5s", "L6s", "L7"], x: 34, y: 82 }, // #3
	{ scripts: ["L4"], x: 60, y: 52 }, // #4
	{ scripts: ["L5"], x: 17, y: 72 }, // #5
	{ scripts: ["L5"], x: 16, y: 14 }, // #6
	{ scripts: ["L6"], x: 8, y: 29 }, // #7
];
const __camRec2BlackBoxes = [
	// Prologue
	{ scripts: ["P2"], x: 25, y: 59 }, // #1
	// Act 1
	{ scripts: ["A1L1", "A1L2s", "A1L3", "A1L4s", "A1L5s", "A1L6"], x: 3, y: 49 }, // #2
	{ scripts: ["A1L2"], x: 3, y: 76 }, // #3
	{ scripts: ["A1L3", "A1L4s", "A1L5s", "A1L6"], x: 123, y: 15 }, // #4
	{ scripts: ["A1L4"], x: 60, y: 76 }, // #5
	{ scripts: ["A1L5"], x: 4, y: 24 }, // #6
	// Act 2
	{ scripts: ["A2L1", "A2L2s", "A2L3", "A2L4s", "A2L5", "A2L6s", "A2L7"], x: 88, y: 117 }, // #7
	{ scripts: ["A2L2"], x: 43, y: 8 }, // #8
	{ scripts: ["A2L1", "A2L2s", "A2L3", "A2L4s", "A2L5", "A2L6s", "A2L7"], x: 66, y: 120 }, // #9
	{ scripts: ["A2L4"], x: 3, y: 18 }, // #10
	{ scripts: ["A2L5", "A2L6s", "A2L7"], x: 124, y: 37 }, // #11
	{ scripts: ["A2L6"], x: 3, y: 27 }, // #12
	// Act 3
	{ scripts: ["A3L1", "A3L2", "A3L3s", "A3L4", "A3L5s", "A3L6", "A3L7s", "A3L8", "A3L9"], x: 141, y: 3 }, // #13
	{ scripts: ["A3L2", "A3L3s", "A3L4", "A3L5s", "A3L6", "A3L7s", "A3L8", "A3L9"], x: 86, y: 75 }, // #14
	{ scripts: ["A3L3"], x: 50, y: 12 }, // #15
	{ scripts: ["A3L5"], x: 23, y: 12 }, // #16
	{ scripts: ["A3L6", "A3L7s", "A3L8", "A3L9"], x: 195, y: 85 }, // #17
	{ scripts: ["A3L6", "A3L7s", "A3L8", "A3L9"], x: 158, y: 103 }, // #18
	{ scripts: ["A3L7"], x: 74, y: 109 }, // #19
	{ scripts: ["A3L7"], x: 5, y: 4 }, // #20
	{ scripts: ["A3L8", "A3L9"], x: 30, y: 4 }, // #21
	{ scripts: ["A3L8", "A3L9"], x: 45, y: 132 }, // #22
	// Act 4
	{ scripts: ["A4L1", "A4L2s", "A4L3", "A4L4s", "A4L5"], x: 49, y: 3 }, // #23
	{ scripts: ["A4L2"], x: 3, y: 11 }, // #24
	{ scripts: ["A4L3", "A4L4s", "A4L5"], x: 128, y: 164 }, // #25
	{ scripts: ["A4L3", "A4L4s", "A4L5"], x: 172, y: 29 }, // #26
	{ scripts: ["A4L4"], x: 84, y: 33 }, // #27
	{ scripts: ["A4L6"], x: 4, y: 8 }, // #28
];

//dialogue
const CAM_RCLICK = "RADIO_CLICK";
var __camQueuedDialogue;
var __camLatestDialogueTime;

//reinforcements
const CAM_REINFORCE_NONE = 0;
const CAM_REINFORCE_GROUND = 1;
const CAM_REINFORCE_TRANSPORT = 2;

//debug
var __camMarkedTiles = {};
var __camCheatMode = false;
var __camDebuggedOnce = {};
var __camTracedOnce = {};

//events
var __camSaveLoading;
var __camInfestedGlobalAttackGroup;
var __camDisableFactoryAutoManagement;
const __camInfTruckSummonTemplates = [
	{ body: "InfestedScavBody", prop: "BaBaLegs", weap: "BabaMG" }, // Infested Blokes
	{ body: "InfestedScavBody", prop: "BaBaLegs", weap: "BabaMG" },
	{ body: "InfestedScavBody", prop: "BaBaLegs", weap: "BabaMG" },
	{ body: "InfestedScavBody", prop: "BaBaLegs", weap: "BabaMG" },
	{ body: "InfestedScavBody-Kev", prop: "BaBaLegs", weap: "BabaMG" },
	{ body: "InfestedLanceBody", prop: "BaBaLegs", weap: "BabaLance" }, // Infested Rocket Scavs
	{ body: "InfestedLanceBody-Kev", prop: "BaBaLegs", weap: "BabaLance" },
];
const __CAM_INFTRUCK_FODDER_COUNT = 6;

//group
var __camNewGroupCounter;
var __camNeverGroupDroids;
var __camRefillableGroupInfo;

//hook
var __camOriginalEvents = {};

//misc
const __camPowerLimits = [ // Power limits
	999999, // SUPEREASY
	100000, // EASY
	50000, // MEDIUM
	20000, // HARD
	10000, // INSANE
];
const __camTimerlessPowerLimits = [ // Timerless mode power limits 
	// Note that these are MUCH lower
	50000, // SUPEREASY
	24000, // EASY
	12000, // MEDIUM
	6000, // HARD
	4000, // INSANE
];
var __camCalledOnce = {};
var __camExpLevel;
var __camLabelInfo;
var __camPlayerVisibilities;
const __CAM_OBJ_VISION_RANGE = 8 * 128; // 8 tiles
var __camCapturedFactoryIdx;
const CAM_MAX_PLAYER_UNITS = 101; //note: the transporter is a unit you own
const CAM_MAX_PLAYER_COMMANDERS = 10;
const CAM_MAX_PLAYER_CONSTRUCTORS = 15;

//sky
const __camArizonaFogRGB = {r:176, g:143, b:95}; // Default RGB for arizona fog. IDEALLY, these would be read from palette.txt
const __camUrbanFogRGB = {r:16, g:16, b:64}; // Default RGB for urban fog.
const __camRockyFogRGB = {r:182, g:225, b:236}; // Default RGB for rocky fog.
var __camFogRGB;
const __camDefaultSunStats = {
	x: 225.0, 
	y: -600.0, 
	z: 450.0,
	ar: 0.5,
	ag: 0.5,
	ab: 0.5,
	dr: 1,
	dg: 1,
	db: 1,
	sr: 1,
	sg: 1,
	sb: 1
};
var __camSunStats;
const __CAM_GRADUAL_TICK_RATE = 100;
const CAM_WEATHER_DEFAULT = 0; // Set weather based on tileset
const CAM_WEATHER_CLEAR = 1; // No weather
const CAM_WEATHER_RAIN = 2; // Intermittent rain
const CAM_WEATHER_RAINSTORM = 3; // Constant rain
const CAM_WEATHER_SNOW = 4; // Intermittent snow
const CAM_WEATHER_SNOWSTORM = 5; // Constant snow
var __camWeatherType;
const CAM_SKY_DAY = 0;
const CAM_SKY_NIGHT = 1;
const CAM_SKY_ARIZONA = 2;
const CAM_SKY_URBAN = 3;
const __camArizonaSkyTexture = "texpages/page-25-sky-arizona.png";
const __camUrbanSkyTexture = "texpages/page-25-sky-urban.png";
const __camNightSkyTexture = "texpages/night-sky.png";
var __camSkyboxType;

//nexus
var __camLastNexusAttack;
var __camNexusActivated;

//production
var __camFactoryInfo;
var __camFactoryQueue;
var __camPreDamageModifier;
const __CAM_ASSEMBLY_DEFENSE_RADIUS = 8;
// These templates should normally be excluded from any pre-damage
const CAM_INFESTED_PREDAMAGE_EXCLUSIONS = [
	{ body: "CrawlerBody", prop: "CyborgLegs", weap: "StingerTail" }, // Stinger
	{ body: "CrawlerBody", prop: "CyborgLegs", weap: "VileStingerTail" }, // Vile Stinger
	{ body: "BoomTickBody", prop: "BoomTickLegs", weap: "BoomTickSac" }, // Boom Tick
	{ body: "BasherBody", prop: "BoomTickLegs", weap: "BasherMelee" }, // Basher
];

//tactics
const CAM_ORDER_ATTACK = 0;
const CAM_ORDER_DEFEND = 1;
const CAM_ORDER_PATROL = 2;
const CAM_ORDER_COMPROMISE = 3;
const CAM_ORDER_FOLLOW = 4;
const CAM_ORDER_STRIKE = 5;
var __camGroupInfo;
const __CAM_TARGET_TRACKING_RADIUS = 7;
const __CAM_PLAYER_BASE_RADIUS = 20;
const __CAM_DEFENSE_RADIUS = 4;
const __CAM_CLOSE_RADIUS = 2;
const __CAM_CLUSTER_SIZE = 8;
const __CAM_FALLBACK_TIME_ON_REGROUP = 5000;
var __camGroupAvgCoord = {x: 0, y: 0};
const DORDER_DROIDREPAIR = 26; // Until I figure out where the other orders are defined, I'll put these here
const DORDER_RTR_SPECIFIED = 35;

//time
const CAM_MILLISECONDS_IN_SECOND = 1000;
const CAM_SECONDS_IN_MINUTE = 60;
const CAM_MINUTES_IN_HOUR = 60;

//transport
var __camNumTransporterExits;
var __camPlayerTransports;
var __camIncomingTransports;
var __camTransporterQueue;
var __camTransporterMessage;

//truck
var __camTruckInfo;
var __camTruckAssignList;
const __camScavStructList = [ // List of structures that can generally be rebuilt by scavengers
	"A0BaBaBunker",
	"A0BaBaFactory",
	"A0BaBaFlameTower",
	"A0BaBaGunTower",
	"A0BaBaGunTowerEND",
	"A0BaBaHorizontalWall",
	"A0BaBaMortarPit",
	"A0BaBaPowerGenerator",
	"A0BaBaRocketPit",
	"A0BaBaRocketPitAT",
	"A0BaBaRocketPitAT-2",
	"A0BaBaCannonPit",
	"A0BaBaMRAPit",
	"A0BabaCornerWall",
	"LookOutTower",
	"A0CannonTower",
	"Sys-RustSensoTower01",
	"Sys-VTOL-RustyRadarTower01",
	"A0TankTrap",
];

//victory
const CAM_VICTORY_STANDARD = "__camVictoryStandard";
const CAM_VICTORY_PRE_OFFWORLD = "__camVictoryPreOffworld";
const CAM_VICTORY_OFFWORLD = "__camVictoryOffworld";
const CAM_VICTORY_EVACUATION = "__camVictoryEvacuation";
const CAM_VICTORY_SCRIPTED = "__camVictoryScripted";
var __camWinLossCallback;
var __camNextLevel;
var __camNeedBonusTime;
var __camDefeatOnTimeout;
var __camVictoryData;
var __camRTLZTicker;
var __camLZCompromisedTicker;
var __camLastAttackTriggered;
var __camLevelEnded;
var __camExtraObjectiveMessage;
var __camAllowVictoryMsgClear;
var __camBonusPowerGranted;

//video
var __camVideoSequences;

//vtol
var __camVtolDataSystem;
//////////globals vars end

// A hack to make sure we do not put this variable into the savegame. It is
// called from top level, because we need to call it again every time we load
// scripts. But other than this one, you should in general never call game
// functions from toplevel, since all game state may not be fully initialized
// yet at the time scripts are loaded. (Yes, function name needs to be quoted.)
hackDoNotSave("__camOriginalEvents");

include(__CAM_INCLUDE_PATH + "misc.js");
include(__CAM_INCLUDE_PATH + "debug.js");
include(__CAM_INCLUDE_PATH + "hook.js");
include(__CAM_INCLUDE_PATH + "events.js");

include(__CAM_INCLUDE_PATH + "time.js");
include(__CAM_INCLUDE_PATH + "research.js");
include(__CAM_INCLUDE_PATH + "artifact.js");
include(__CAM_INCLUDE_PATH + "base.js");
include(__CAM_INCLUDE_PATH + "reinforcements.js");
include(__CAM_INCLUDE_PATH + "tactics.js");
include(__CAM_INCLUDE_PATH + "production.js");
include(__CAM_INCLUDE_PATH + "truck.js");
include(__CAM_INCLUDE_PATH + "victory.js");
include(__CAM_INCLUDE_PATH + "transport.js");
include(__CAM_INCLUDE_PATH + "vtol.js");
include(__CAM_INCLUDE_PATH + "nexus.js");
include(__CAM_INCLUDE_PATH + "group.js");
include(__CAM_INCLUDE_PATH + "video.js");
include(__CAM_INCLUDE_PATH + "dialogue.js");
include(__CAM_INCLUDE_PATH + "blackBox.js");
include(__CAM_INCLUDE_PATH + "guide.js");
include(__CAM_INCLUDE_PATH + "infested.js");
include(__CAM_INCLUDE_PATH + "sky.js");
