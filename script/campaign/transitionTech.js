//Contains the campaign transition technology definitions.

// Basic base structures
const camBasicStructs = [
	"A0CommandCentre", "A0PowerGenerator", "A0ResourceExtractor",
	"A0ResearchFacility", "A0LightFactory", "A0CyborgFactory",
];

// Contains research granted at the very start
const camRec1StartResearch = [
	"R-Wpn-MG1Mk1", "R-Vehicle-Body01", "R-Sys-Spade1Mk1", "R-Vehicle-Prop-Wheels",
	"R-Comp-SynapticLink", "R-Cyborg-Wpn-MG", "R-Cyb-Sys-Construct",
];

// Contains everything that the player starts with in the Prologue to Reclamation
// Basically just everything the player acquires before L4.
const camRec2StartResearch = [
	// L1
	"R-Sys-Sensor-Turret01", // Artifact
	"R-Sys-Sensor-Tower01",
	"R-Wpn-Rocket05-MiniPod", // Artifact
	"R-Defense-Tower06", "R-Wpn-Rocket-Damage01",
	"R-Sys-Engineering01", // Found in NASDA's research facility
	"R-Sys-MobileRepairTurret01", "R-Cyb-Sys-Repair", "R-Wpn-MG-Damage01",
	"R-Defense-TankTrap01",
	"R-Vehicle-Prop-Tracks", // Artifact

	// L2
	"R-Wpn-Rocket-ROF01", // Artifact
	"R-Wpn-Mortar01Lt", // Artifact
	"R-Wpn-Mortar-Damage01", "R-Cyb-Wpn-Grenade",
	"R-Wpn-Cannon1Mk1", // Artifact
	"R-Defense-Cannon", "R-Cyborg-Wpn-Cannon", "R-Wpn-Cannon-Damage01",
	"R-Wpn-Cannon-ROF01",

	// L3
	"R-Wpn-MG2Mk1", // Artifact
	"R-Wpn-MG-Damage02", "R-Defense-Tower02",
	"R-Vehicle-Metals01", // Artifact
	"R-Cyborg-Metals01",
	"R-Wpn-Flamer01Mk1", // Artifact
	"R-Cyborg-Wpn-Flamer", "R-Wpn-Flamer-Damage01", "R-Defense-Flamer",
	"R-Wpn-Flamer-ROF01",
].concat(camRec1StartResearch);

// Contains the Rec 1 research after L3
// For documentation purposes only
// const camRec1RemainingResearch = [
// 	// L4
//	"R-Wpn-MG-ROF01", // Artifact
// 	"R-Struc-Research-Module", // Artifact
// 	"R-Wpn-Rocket-Accuracy01", "R-Wpn-Rocket-Damage02", "R-Wpn-Cannon-Accuracy01",
// 	"R-Wpn-Cannon-Damage02", "R-Vehicle-Engine01", "R-Wpn-Flamer-ROF02",
//	"R-Wpn-Flamer-Damage02",
// 	"R-Vehicle-Prop-Halftracks", // Artifact
// 	// L5
// 	"R-Struc-Materials01", // Artifact
// 	"R-Wpn-MG3Mk1", // Artifact
// 	"R-Defense-Tower01", "R-Wpn-MG-Damage03", "R-Cyborg-Wpn-HvyMG",
// 	"R-Wpn-Rocket-LtA-TMk1", // Artifact
// 	"R-Defense-Sarissa", "R-Cyborg-Wpn-LtRocket", "R-Wpn-Rocket-Damage03",
// 	"R-Wpn-Cannon-Damage03",
//	"R-Wpn-Mortar-ROF01", // Artifact
// 	// L6
// 	"R-Wpn-Rocket02-MRL", // Artifact
// 	"R-Defense-MRL", "R-Wpn-Rocket-ROF02", "R-Cyb-Wpn-MRL",
//	"R-Wpn-Cannon-ROF02",
// 	"R-Wpn-Rocket-Damage04", // Artifact
// 	"R-Wpn-Mortar-Damage02",
// ].concat(camRec2StartResearch);

// What is (assumed to be) acquired during the Prologue
const camRec2PrologueResearch = [
	//P2
	"R-Wpn-Rocket-LtA-TMk1", // Artifact
	"R-Defense-Sarissa", "R-Cyborg-Wpn-LtRocket", "R-Wpn-Rocket-Damage02",
];

// Used to grant research at the start of Act 1
const camAct1StartResearch = camRec2StartResearch.concat(camRec2PrologueResearch);

// Used to grant research to allies on A1L2
const camA1L2AllyResearch = camAct1StartResearch.concat([
	// A1L1
	"R-Wpn-Mortar-ROF01", // Artifact
	"R-Wpn-Mortar-Damage02",
	"R-Wpn-Flamer-Damage02", // Artifact
	"R-Wpn-Rocket02-MRL", // Artifact
	"R-Defense-MRL", "R-Cyb-Wpn-MRL",
]);

// Used to grant research to allies on A1L4
const camA1L4AllyResearch = camA1L2AllyResearch.concat([
	// A1L2
	"R-Wpn-Cannon-Accuracy01", // Artifact
	"R-Wpn-Cannon-Damage02",
	"R-Vehicle-Prop-Halftracks", // Artifact
	"R-Struc-PowerModuleMk1", // Found by capturing NASDA power systems
	"R-Vehicle-Engine01",
	"R-Vehicle-Prop-VTOL", // Found by capturing NASDA VTOL Factory
	"R-Struc-VTOLFactory", "R-Struc-VTOLPad", "R-Sys-VTOLStrike-Turret01", 
	"R-Sys-VTOLStrike-Tower01",
	"R-Wpn-MG3Mk1", // Artifact
	"R-Wpn-MG-Damage03", "R-Cyborg-Wpn-HvyMG", "R-Defense-Tower01",
	"R-Struc-RepairFacility", // Artifact
	// A1L3
	"R-Wpn-Rocket-Accuracy01", // Artifact
	"R-Wpn-Rocket-Damage03",
	"R-Wpn-Flamer-ROF02", // Artifact
	"R-Wpn-Flamer-Damage03",
	"R-Wpn-Mortar-Damage03", // Artifact
	"R-Wpn-MG-ROF01", // Artifact
]);

const camAct2StartResearch = camA1L4AllyResearch.concat([
	// A1L5
	"R-Vehicle-Body02", // Artifact
	"R-Vehicle-Metals02", "R-Cyborg-Metals02", "R-Vehicle-Engine02",
	"R-Wpn-AAGun03", // Artifact
	"R-Defense-AASite-QuadMg1", 
	"R-Struc-CommandRelay", // Artifact
	"R-Comp-CommandTurret01", 
	"R-Wpn-Rocket01-LtAT", // Artifact
	"R-Cyborg-Wpn-Rocket", "R-Defense-Pillbox06", "R-Defense-LancerTower", 
	"R-Defense-WallTower06", "R-Wpn-Rocket-Damage04",
	"R-Defense-HardcreteWall", // Artifact
	"R-Defense-HardcreteGate", "R-Defense-MortarPit", "R-Defense-Pillbox01", 
	"R-Defense-Pillbox04", "R-Defense-Pillbox05", "R-Defense-WallTower01", 
	"R-Defense-WallTower02", "R-Defense-WallUpgrade01", "R-Defense-WallUpgrade02", 
	"R-Struc-Materials01", "R-Struc-Materials02",
]);

// Used to grant research to team Delta on A2L2
const camA2L2AllyResearch = camAct2StartResearch.concat([
	// A2L1
	"R-Defense-WallUpgrade03", // Artifact
	"R-Struc-Materials03", 
	"R-Wpn-AAGun-Damage01", // Artifact
	"R-Struc-Factory-Module", // Artifact
	"R-Vehicle-Body05",
	"R-Wpn-Cannon2Mk1", // Artifact
	"R-Defense-WallTower03", "R-Wpn-Cannon-Damage03",
]);

// Used to grant research to teams Charlie and Golf on A2L6
const camA2L6AllyResearch = camA2L2AllyResearch.concat([
	// A2L2
	"R-Wpn-Bomb01", // Artifact
	"R-Wpn-Mortar-Damage04",
	"R-Wpn-Rocket-Accuracy02", // Artifact
	"R-Wpn-MG-ROF02", // Artifact
	"R-Wpn-Rocket-ROF02", // Artifact
	"R-Struc-Factory-Upgrade01", // Artifact
	"R-Struc-RprFac-Upgrade01",
	// A2L3
	"R-Vehicle-Prop-Hover", // Artifact
	"R-Vehicle-Engine03", 
	"R-Wpn-Cannon-ROF02", // Artifact
	"R-Wpn-Mortar-ROF02", 
	"R-Wpn-MG-Damage04", // Artifact
	// A2L4
	"R-Vehicle-Body06", // Artifact
	"R-Vehicle-Metals03", "R-Cyborg-Metals03",
	"R-Sys-CBSensor-Turret01", // Artifact
	"R-Sys-CBSensor-Tower01", "R-Sys-VTOLCBS-Turret01", "R-Sys-VTOLCBS-Tower01", 
	"R-Wpn-Mortar-Acc01", "R-Wpn-AAGun-Accuracy01",
	"R-Cyborg-Hvywpn-Mcannon", // Artifact
	"R-Wpn-AAGun-ROF01", // Artifact
	"R-Wpn-Mortar02Hvy", // Artifact
	"R-Defense-HvyMor", "R-Wpn-Mortar-Damage05",
	// A2L5
	"R-Wpn-Rocket03-HvAT", // Artifact
	"R-Wpn-Rocket-Damage05",
	"R-Wpn-AAGun02", // Artifact
	"R-Defense-AASite-QuadBof", "R-Wpn-AAGun-Damage02",
	"R-Struc-Research-Module", // Artifact
	"R-Cyb-Hvywpn-Grenade", // Artifact
]);

const camAct3StartResearch = camA2L6AllyResearch.concat([
	// A2L6
	"R-Wpn-Cannon4AMk1", // Artifact
	"R-Defense-Emplacement-HPVcannon", "R-Defense-WallTower-HPVcannon", "R-Cyborg-Hvywpn-HPV", 
	"R-Wpn-Cannon-Accuracy02", "R-Wpn-Cannon-Damage04", "R-Defense-HVCTower",
	"R-Wpn-Rocket-Accuracy03", // Artifact
	"R-Sys-Engineering02", // Artifact
	"R-Defense-WallUpgrade04", "R-Struc-Materials04",
	"R-Struc-VTOLPad-Upgrade01",
]);

// Used to grant research to team Charlie on A3L4
const camA3L4AllyResearch = camAct3StartResearch.concat([
	// A3L1
	"R-Wpn-Flame2", // Artifact
	"R-Wpn-Flamer-Damage04", "R-Cyb-Wpn-Thermite", "R-Defense-HvyFlamer",
	"R-Wpn-Bomb03",
	"R-Vehicle-Engine04", // Artifact
	// A3L2
	"R-Wpn-Mortar3", // Artifact
	"R-Defense-RotMor", "R-Wpn-Mortar-ROF03", 
	"R-Wpn-Rocket02-MRLHvy", // Artifact
	"R-Defense-MRLHvy", "R-Cyb-Hvywpn-HRA",
	"R-Wpn-Bomb-Damage01", // Artifact
	"R-Struc-Power-Upgrade01", // Artifact
	// A3L3
	"R-Wpn-MG4", // Artifact
	"R-Cyborg-Wpn-RotMG", "R-Defense-RotMG", "R-Defense-Wall-RotMg",
	"R-Defense-Pillbox-RotMG", "R-Wpn-MG-Damage05",
]);

// Used to grant research to team Delta on A3L7
const camA3L7AllyResearch = camA3L4AllyResearch.concat([
	// A3L4
	"R-Wpn-Cannon5", // Artifact
	"R-Defense-Wall-VulcanCan", "R-Cyborg-Hvywpn-Acannon", "R-Wpn-Cannon-Damage05",
	// A3L5
	"R-Wpn-Rocket08-Ballista", // Artifact
	"R-Defense-Ballista", "R-Wpn-Rocket-Accuracy04", "R-Wpn-Mortar-Acc02", 
	"R-Wpn-AAGun-Accuracy02",
	// A3L6
	"R-Vehicle-Metals04", // Artifact
	"R-Vehicle-Body11", "R-Cyborg-Metals04", "R-Vehicle-Armor-Heat01",
	"R-Cyborg-Armor-Heat01", "R-Vehicle-Engine05",
	"R-Defense-WallUpgrade05", // Artifact
	"R-Struc-Materials05",
	"R-Wpn-AAGun-Damage03", // Artifact
	"R-Wpn-Rocket-ROF03", // Artifact
	"R-Struc-Factory-Upgrade02", // Artifact
	"R-Struc-RprFac-Upgrade02", "R-Struc-VTOLPad-Upgrade02",
	"R-Wpn-HowitzerMk1", // Artifact
	"R-Defense-Howitzer", "R-Wpn-Howitzer-Damage01", "R-Wpn-Howitzer-ROF01",
	"R-Wpn-Mortar-Damage06",
]);

// Used to grant research to teams Foxtrot and Golf on A3L9
// Note that the tech gained on A3L8 is not included here
const camA3L9EnemyResearch = camA3L7AllyResearch.concat([
	// A3L7
	"R-Wpn-Flamer-Damage05", // Artifact
	"R-Wpn-MG-ROF03", // Artifact
	"R-Wpn-MG-Damage06",
	"R-Wpn-Rocket07-Tank-Killer", // Artifact
	"R-Cyborg-Hvywpn-TK", "R-Defense-WallTower-HvyA-Trocket", "R-Defense-HvyA-Trocket",
	"R-Defense-HvyAT-Tower",
	"R-Wpn-AAGun-ROF02", // Artifact
]);

const camAct4StartResearch = camA3L9EnemyResearch.concat([
	// A3L8
	"R-Vehicle-Body09", // Artifact
	"R-Vehicle-Metals05", "R-Vehicle-Armor-Heat02", "R-Cyborg-Metals05",
	"R-Cyborg-Armor-Heat02", "R-Vehicle-Engine06",
	"R-Wpn-Bomb02", // Artifact
	"R-Wpn-Rocket06-IDF", // Artifact
	"R-Defense-IDFRocket", "R-Wpn-Rocket-Damage06",
	"R-Sys-Sensor-Upgrade01", // Artifact
	"R-Wpn-Howitzer-Accuracy01", // Artifact
	"R-Wpn-Mortar-Acc03", "R-Wpn-AAGun-Accuracy03", "R-Wpn-Howitzer-Damage02"
]);

// Used to grant research to team Charlie (and Zulu) on A4L4
const camA4L4AllyResearch = camAct4StartResearch.concat([
	// A4L1
	"R-Wpn-Cannon3Mk1", // Artifact
	"R-Wpn-Cannon-Damage06", "R-Wpn-Cannon-ROF03",
	"R-Wpn-Howitzer-ROF02", "R-Defense-WallTower04",
	"R-Wpn-AAGun04", // Artifact
	"R-Wpn-AAGun-ROF03",
	// A4L2
	"R-Wpn-Bomb04", // Artifact
	// A4L3
	"R-Wpn-Flamer-ROF03", // Artifact
	"R-Wpn-Flamer-Damage06",
	"R-Struc-Factory-Upgrade03", // Artifact
	"R-Struc-RprFac-Upgrade03", "R-Struc-VTOLPad-Upgrade03",
	"R-Wpn-Rocket-Damage07", // Artifact
	"R-Wpn-Bomb-Damage02", // Artifact
	"R-Defense-WallUpgrade06", // Artifact
	"R-Struc-Materials06",
	"R-Vehicle-Metals06", // Artifact
	"R-Cyborg-Metals06", "R-Vehicle-Armor-Heat03", "R-Cyborg-Armor-Heat03",
]);

// Used to grant research to team Delta and team Charlie on A4L5 & A4L6
const camA4L5AllyResearch = camA4L4AllyResearch.concat([
	// A4L4
	"R-Wpn-Cannon-Damage07", // Artifact
	"R-Wpn-Howitzer-Damage03", "R-Wpn-MG-Damage07",
	"R-Wpn-Cannon-ROF04", // Artifact
	"R-Wpn-AAGun-ROF04", "R-Wpn-Mortar-ROF04", "R-Wpn-Howitzer-ROF03",
]);

// Contains all research after A4L4
// For documentation purposes only
// const camAct4RemainingResearch = [
// 	// A4L5
// 	// Nothing here...
// 	// A4L6
// 	"R-Wpn-HvyHowitzer", // Ground Shaker
// 	"R-Defense-HvyHowitzer", // Ground Shaker Emplacement

// 	// ???
// 	"R-Wpn-Howitzer-Damage04", // HEAP Howitzer Shells
// 	"R-Wpn-Howitzer-ROF04", // Howitzer Fast Loader	
// 	"R-Wpn-Howitzer-Accuracy02", // Target Prediction Artillery Shells
// ];

//...
