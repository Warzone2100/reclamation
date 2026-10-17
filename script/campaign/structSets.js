// Contains structure sets used by trucks for building/maintaining bases.
// The sets here are usually bases that aren't present on the map at the start of the level,
// but are built later on by trucks.

// A1L2
// Charlie LZ
const camCharlieA1L2Structs = [
	{stat: "Cannon-Emplacement", x: 25, y: 70}, {stat: "A0TankTrap", x: 25, y: 71}, {stat: "A0TankTrap", x: 28, y: 69},
	{stat: "Flamer-Emplacement", x: 29, y: 69}, {stat: "A0TankTrap", x: 30, y: 69}, {stat: "GuardTower6", x: 28, y: 70},
	{stat: "Emplacement-MRL-pit", x: 26, y: 72}, {stat: "Emplacement-MRL-pit", x: 30, y: 71}, {stat: "Emplacement-MRL-pit", x: 32, y: 71},
];

// Foxtrot LZ
const camFoxtrotA1L2Structs = [
	{stat: "GuardTower6", x: 3, y: 58}, {stat: "Flamer-Emplacement", x: 6, y: 58}, {stat: "Sarissa-Tower", x: 7, y: 58},
	{stat: "Sarissa-Tower", x: 8, y: 57}, {stat: "GuardTower6", x: 6, y: 60}, {stat: "Flamer-Emplacement", x: 9, y: 59},
	{stat: "GuardTower6", x: 6, y: 64}, {stat: "A0TankTrap", x: 8, y: 62}, {stat: "A0TankTrap", x: 8, y: 63},
	{stat: "Flamer-Emplacement", x: 9, y: 63}, {stat: "Sarissa-Tower", x: 8, y: 65}, {stat: "Sarissa-Tower", x: 11, y: 65},
	{stat: "Emplacement-MRL-pit", x: 6, y: 66},
];

// Golf LZ
const camGolfA1L2Structs = [
	{stat: "Cannon-Emplacement", x: 59, y: 25}, {stat: "A0TankTrap", x: 60, y: 25}, {stat: "Cannon-Emplacement", x: 56, y: 26},
	{stat: "A0TankTrap", x: 56, y: 27}, {stat: "GuardTower2", x: 60, y: 26}, {stat: "GuardTower2", x: 57, y: 28},
	{stat: "GuardTower6", x: 57, y: 34}, {stat: "GuardTower6", x: 60, y: 34},
];

// A1L3
// Collective LZ ground defenses
const camA1L3LZStructs = [
	{stat: "A0TankTrap", x: 118, y: 29},
	{stat: "A0TankTrap", x: 124, y: 29}, {stat: "A0TankTrap", x: 118, y: 33}, {stat: "A0TankTrap", x: 124, y: 33},
	{stat: "Cannon-Emplacement", x: 121, y: 28},
	{stat: "Cannon-Emplacement", x: 118, y: 31}, {stat: "Cannon-Emplacement", x: 124, y: 31}, {stat: "Cannon-Emplacement", x: 121, y: 34},
	{stat: "GuardTower1", x: 119, y: 29}, {stat: "GuardTower1", x: 123, y: 29}, {stat: "GuardTower1", x: 119, y: 33},
	{stat: "GuardTower1", x: 123, y: 33}, {stat: "GuardTower6", x: 119, y: 18}, {stat: "GuardTower6", x: 114, y: 24},
	{stat: "GuardTower6", x: 114, y: 26}, {stat: "Sys-SensoTower01", x: 116, y: 20},
];
// Addtional AA defenses
const camA1L3AntiAir = [
	{stat: "AASite-QuadMg1", x: 121, y: 20, rot: 3}, {stat: "AASite-QuadMg1", x: 117, y: 27, rot: 3}, {stat: "AASite-QuadMg1", x: 116, y: 30, rot: 3},
	{stat: "AASite-QuadMg1", x: 116, y: 34, rot: 3},
];
// Uplink defenses
const camA1L3UplinkStructs = [
	{stat: "GuardTower1", x: 107, y: 46}, {stat: "GuardTower1", x: 106, y: 53}, {stat: "Cannon-Emplacement", x: 106, y: 48},
	{stat: "Cannon-Emplacement", x: 106, y: 51}, {stat: "GuardTower6", x: 109, y: 48}, {stat: "GuardTower6", x: 109, y: 51},
	{stat: "AASite-QuadMg1", x: 108, y: 53}, {stat: "Sys-SensoTower01", x: 111, y: 50}, {stat: "A0TankTrap", x: 107, y: 45}, 
	{stat: "A0TankTrap", x: 106, y: 46}, {stat: "A0TankTrap", x: 106, y: 49}, {stat: "A0TankTrap", x: 106, y: 50},
	{stat: "A0TankTrap", x: 105, y: 53}, {stat: "A0TankTrap", x: 106, y: 54},
];

// A1L4
// Collective LZ defenses
const camA1L4ColLZ1Structs = [
	{stat: "PillBox4", x: 58, y: 25}, {stat: "AASite-QuadMg1", x: 59, y: 28, rot: 3}, {stat: "GuardTower6H", x: 54, y: 24},
	{stat: "PillBox1", x: 53, y: 26}, {stat: "GuardTower6H", x: 54, y: 29}, 
];
const camA1L4ColLZ2Structs = [
	{stat: "AASite-QuadMg1", x: 48, y: 11}, {stat: "Sys-SensoTower02", x: 47, y: 14}, {stat: "PillBox5", x: 50, y: 15},
	{stat: "GuardTower3", x: 53, y: 13}, {stat: "PillBox4", x: 53, y: 14}, {stat: "Emplacement-MortarPit01", x: 54, y: 11},
	{stat: "Emplacement-MortarPit01", x: 56, y: 12}, {stat: "GuardTower6H", x: 45, y: 19}, {stat: "GuardTower3", x: 48, y: 17},
];
const camA1L4ColLZ3Structs = [
	{stat: "GuardTower6H", x: 59, y: 58}, {stat: "AASite-QuadMg1", x: 59, y: 55, rot: 2}, {stat: "AASite-QuadMg1", x: 57, y: 60},
	{stat: "PillBox1", x: 54, y: 59}, {stat: "PillBox1", x: 53, y: 55}, {stat: "GuardTower5", x: 55, y: 59},
];

// A1L6
// Collective LZ defenses
const camA1L6ColLZ1Structs = [
	{stat: "PillBox1", x: 74, y: 8}, {stat: "AASite-QuadMg1", x: 76, y: 9, rot: 3}, {stat: "AASite-QuadMg1", x: 76, y: 12, rot: 3},
	{stat: "GuardTower6H", x: 70, y: 10}, {stat: "A0TankTrap", x: 69, y: 10}, {stat: "A0TankTrap", x: 70, y: 11},
	{stat: "GuardTower6H", x: 70, y: 14}, {stat: "A0TankTrap", x: 69, y: 14}, {stat: "A0TankTrap", x: 70, y: 15},
	{stat: "PillBox4", x: 73, y: 14}, {stat: "A0TankTrap", x: 74, y: 14}, {stat: "GuardTower5", x: 74, y: 13},
];
const camA1L6ColLZ2Structs = [
	{stat: "A0TankTrap", x: 85, y: 34}, {stat: "AASite-QuadMg1", x: 86, y: 34, rot: 3}, {stat: "A0TankTrap", x: 86, y: 35},
	{stat: "A0TankTrap", x: 88, y: 34}, {stat: "AASite-QuadMg1", x: 88, y: 35}, {stat: "A0TankTrap", x: 89, y: 35},
	{stat: "GuardTower3", x: 82, y: 35}, {stat: "Sys-SensoTower02", x: 81, y: 37}, {stat: "PillBox4", x: 81, y: 38, rot: 3},
	{stat: "Emplacement-MortarPit01", x: 88, y: 37}, {stat: "Emplacement-MortarPit01", x: 86, y: 38}, {stat: "Emplacement-MortarPit01", x: 88, y: 39},
	{stat: "GuardTower5", x: 82, y: 40}, {stat: "GuardTower6H", x: 86, y: 40},
];
const camA1L6ColLZ3Structs = [
	{stat: "PillBox6", x: 57, y: 53}, {stat: "GuardTower3", x: 60, y: 53}, {stat: "GuardTower3", x: 56, y: 56},
	{stat: "A0TankTrap", x: 62, y: 53}, {stat: "AASite-QuadMg1", x: 62, y: 54, rot: 3}, {stat: "A0TankTrap", x: 61, y: 54},
	{stat: "A0TankTrap", x: 61, y: 57}, {stat: "AASite-QuadMg1", x: 62, y: 57, rot: 3}, {stat: "A0TankTrap", x: 62, y: 58},
	{stat: "Emplacement-MRL-pit", x: 59, y: 57},
];
const camA1L6ColLZ4Structs = [
	{stat: "PillBox1", x: 8, y: 46}, {stat: "PillBox4", x: 11, y: 51}, {stat: "AASite-QuadMg1", x: 4, y: 49, rot: 1},
	{stat: "Emplacement-MortarPit01", x: 4, y: 51}, {stat: "Emplacement-MortarPit01", x: 6, y: 53}, {stat: "AASite-QuadMg1", x: 9, y: 52, rot: 2},
	{stat: "A0TankTrap", x: 5, y: 47}, {stat: "GuardTower6H", x: 5, y: 48}, {stat: "A0TankTrap", x: 6, y: 48},
	{stat: "A0TankTrap", x: 9, y: 48}, {stat: "Sys-SensoTower02", x: 9, y: 49}, {stat: "A0TankTrap", x: 10, y: 49},
];

// A2L6
// Allied forward outposts
const camA2L6CharlieForwardStructs1 = [
	{stat: "WallTower06", x: 78, y: 14}, {stat: "A0HardcreteMk1Wall", x: 79, y: 14}, {stat: "WallTower06", x: 80, y: 14},
	{stat: "A0RepairCentre3", x: 78, y: 17}, {stat: "Emplacement-MRL-pit", x: 81, y: 18}, {stat: "PillBox1", x: 84, y: 15},
	{stat: "AASite-QuadBof", x: 80, y: 25}, {stat: "AASite-QuadBof", x: 82, y: 26}, {stat: "GuardTower6H", x: 84, y: 25},
];
const camA2L6GolfForwardStructs = [
	{stat: "AASite-QuadBof", x: 69, y: 14}, {stat: "AASite-QuadBof", x: 70, y: 13}, {stat: "AASite-QuadBof", x: 71, y: 12},
	{stat: "Emplacement-MortarPit02", x: 74, y: 10}, {stat: "Emplacement-MortarPit02", x: 75, y: 11}, {stat: "Emplacement-MortarPit02", x: 76, y: 10},
	{stat: "GuardTower6H", x: 67, y: 8}, {stat: "A0RepairCentre3", x: 76, y: 6}, {stat: "WallTower03", x: 80, y: 6},
	{stat: "A0HardcreteMk1Wall", x: 80, y: 7}, {stat: "A0HardcreteMk1Wall", x: 80, y: 8}, {stat: "WallTower03", x: 80, y: 9},
	{stat: "Sys-CB-Tower01", x: 84, y: 7}, {stat: "Sys-SensoTower02", x: 84, y: 8}, {stat: "PillBox6", x: 84, y: 10},
];
const camA2L6CharlieForwardStructs2 = [
	{stat: "PillBox1", x: 137, y: 24}, {stat: "PillBox1", x: 137, y: 29}, {stat: "PillBox1", x: 133, y: 34},
	{stat: "PillBox1", x: 147, y: 27}, {stat: "PillBox1", x: 140, y: 28}, {stat: "PillBox1", x: 140, y: 37},
	{stat: "GuardTower6H", x: 141, y: 28}, {stat: "GuardTower6H", x: 148, y: 28}, {stat: "GuardTower6H", x: 141, y: 36},
	{stat: "GuardTower6H", x: 148, y: 37}, {stat: "Emplacement-MRL-pit", x: 138, y: 30}, {stat: "Emplacement-MRL-pit", x: 147, y: 28},
	{stat: "Sys-SensoTower02", x: 142, y: 33}, {stat: "AASite-QuadBof", x: 140, y: 32, rot: 3}, {stat: "AASite-QuadBof", x: 140, y: 34, rot: 3},
];

// A2L7
// Collective LZ defenses
const camA2L7ColLZ1Structs = [
	{stat: "TankTrapC", x: 75, y: 29},
	{stat: "TankTrapC", x: 74, y: 30},
	{stat: "AASite-QuadBof", x: 75, y: 30, rot: 3},
	{stat: "TankTrapC", x: 75, y: 31},
	{stat: "TankTrapC", x: 77, y: 27},
	{stat: "TankTrapC", x: 78, y: 26},
	{stat: "AASite-QuadBof", x: 78, y: 27, rot: 2},
	{stat: "TankTrapC", x: 79, y: 27},
	{stat: "Sys-SensoTower02", x: 80, y: 29},
	{stat: "WallTower-HPVcannon", x: 80, y: 31},
	{stat: "GuardTower5", x: 76, y: 32},
	{stat: "PillBox1", x: 79, y: 32},
];
const camA2L7ColLZ2Structs = [
	{stat: "WallTower-HPVcannon", x: 42, y: 63},
	{stat: "AASite-QuadBof", x: 44, y: 61, rot: 2},
	{stat: "AASite-QuadBof", x: 46, y: 61, rot: 2},
	{stat: "WallTower-HvATrocket", x: 48, y: 63},
	{stat: "A0HardcreteMk1Wall", x: 42, y: 64, rot: 1},
	{stat: "WallTower-HPVcannon", x: 42, y: 65},
	{stat: "GuardTower6H", x: 43, y: 66},
	{stat: "Sys-SensoTower02", x: 47, y: 66},
	{stat: "PillBox1", x: 47, y: 67},
	{stat: "PillBox1", x: 48, y: 66},
];
const camA2L7ColLZ3Structs = [
	{stat: "Emplacement-MortarPit02", x: 24, y: 95},
	{stat: "AASite-QuadBof", x: 26, y: 94, rot: 2},
	{stat: "AASite-QuadBof", x: 21, y: 96},
	{stat: "Emplacement-MortarPit02", x: 21, y: 99},
	{stat: "Emplacement-MortarPit02", x: 23, y: 96},
	{stat: "Sys-CB-Tower01", x: 23, y: 98},
	{stat: "AASite-QuadBof", x: 21, y: 101},
	{stat: "Emplacement-MortarPit02", x: 23, y: 100},
	{stat: "Sys-SensoTower02", x: 25, y: 101},
	{stat: "AASite-QuadBof", x: 25, y: 102},
	{stat: "PillBoxHPC", x: 26, y: 101},
	{stat: "WallTower-HPVcannon", x: 28, y: 96},
	{stat: "Tower-Projector", x: 29, y: 98},
];
const camA2L7ColLZ4Structs = [
	{stat: "PillBox6", x: 91, y: 60},
	{stat: "AASite-QuadBof", x: 93, y: 57},
	{stat: "PillBox1", x: 92, y: 58},
	{stat: "AASite-QuadBof", x: 95, y: 56},
	{stat: "Sys-SensoTower02", x: 95, y: 58},
	{stat: "WallTower-HPVcannon", x: 93, y: 62},
	{stat: "AASite-QuadBof", x: 97, y: 57},
	{stat: "Emplacement-MRLHvy-pit", x: 97, y: 59},
	{stat: "Emplacement-MRLHvy-pit", x: 98, y: 58},
	{stat: "WallTower-HPVcannon", x: 97, y: 62},
	{stat: "Tower-Projector", x: 99, y: 61},
];

// A3L4
// Collective LZ defenses
const camA3L4ColLZ1Structs = [
	{stat: "PillBoxHPC", x: 102, y: 32}, {stat: "AASite-QuadBof", x: 104, y: 33, rot: 1}, {stat: "WallTower-HPVcannon", x: 105, y: 35},
	{stat: "WallTower-HPVcannon", x: 104, y: 38}, {stat: "Sys-SensoTower02", x: 103, y: 37}, {stat: "Emplacement-MortarPit02", x: 101, y: 37},
	{stat: "Emplacement-MortarPit02", x: 100, y: 36}, {stat: "AASite-QuadBof", x: 99, y: 38},
];
const camA3L4ColLZ2Structs = [
	{stat: "Pillbox-RotMG", x: 120, y: 7}, {stat: "AASite-QuadBof", x: 122, y: 6, rot: 2}, {stat: "Wall-VulcanCan", x: 124, y: 7},
	{stat: "Wall-VulcanCan", x: 120, y: 11}, {stat: "AASite-QuadBof", x: 123, y: 11}, {stat: "Pillbox-RotMG", x: 125, y: 10},
	{stat: "A0TankTrap", x: 123, y: 12}, {stat: "A0TankTrap", x: 124, y: 11},
];
const camA3L4ColLZ3Structs = [
	{stat: "WallTower04", x: 106, y: 57}, {stat: "Wall-VulcanCan", x: 110, y: 58}, {stat: "AASite-QuadBof", x: 104, y: 58, rot: 3},
	{stat: "AASite-QuadBof", x: 104, y: 60, rot: 3}, {stat: "Emplacement-MRLHvy-pit", x: 106, y: 60}, {stat: "Emplacement-MRLHvy-pit", x: 107, y: 61},
	{stat: "Wall-VulcanCan", x: 109, y: 61},
];
const camA3L4ColLZ4Structs = [
	{stat: "WallTower-HvATrocket", x: 132, y: 49}, {stat: "AASite-QuadBof", x: 134, y: 48}, {stat: "Wall-VulcanCan", x: 136, y: 49},
	{stat: "PillBoxHPC", x: 132, y: 52}, {stat: "Wall-VulcanCan", x: 135, y: 53}, {stat: "Pillbox-RotMG", x: 137, y: 51},
	{stat: "AASite-QuadBof", x: 132, y: 54, rot: 2},
];

// A3L9
// Foxtrot & Golf structures
const camA3L9FoxtrotDefenseStructs = [
	{stat: "Sys-SensoTower02", x: 5, y: 6}, {stat: "AASite-QuadBof", x: 7, y: 5}, {stat: "AASite-QuadBof", x: 6, y: 7},
	{stat: "AASite-QuadBof", x: 5, y: 9}, {stat: "Emplacement-MRLHvy-pit", x: 6, y: 15}, {stat: "A0RepairCentre3", x: 8, y: 10},
	{stat: "A0RepairCentre3", x: 10, y: 11}, {stat: "A0RepairCentre3", x: 8, y: 12}, {stat: "AASite-QuadBof", x: 14, y: 13},
	{stat: "Emplacement-Ballista", x: 14, y: 15}, {stat: "Pillbox-RotMG", x: 4, y: 16}, {stat: "GuardTower-TK", x: 6, y: 17},
	{stat: "GuardTower-TK", x: 8, y: 18}, {stat: "Emplacement-MRLHvy-pit", x: 10, y: 17}, {stat: "Pillbox-RotMG", x: 10, y: 19},
	{stat: "Emplacement-MRLHvy-pit", x: 13, y: 19}, {stat: "WallTower-HvATrocket", x: 12, y: 20}, {stat: "A0HardcreteMk1Wall", x: 13, y: 20},
	{stat: "Wall-RotMg", x: 14, y: 20}, {stat: "Tower-Projector", x: 14, y: 21}, {stat: "AASite-QuadBof", x: 17, y: 7},
	{stat: "Emplacement-Ballista", x: 19, y: 6}, {stat: "GuardTower-RotMg", x: 20, y: 6}, {stat: "GuardTower-RotMg", x: 23, y: 6},
	{stat: "AASite-QuadBof", x: 16, y: 8}, {stat: "WallTower-HvATrocket", x: 17, y: 10}, {stat: "AASite-QuadBof", x: 16, y: 13},
	{stat: "Emplacement-Ballista", x: 16, y: 15}, {stat: "Tower-Projector", x: 19, y: 12}, {stat: "WallTower-HvATrocket", x: 22, y: 8},
	{stat: "WallTower-HvATrocket", x: 23, y: 14}, {stat: "Emplacement-Ballista", x: 24, y: 6}, {stat: "AASite-QuadBof", x: 26, y: 7},
	{stat: "Emplacement-Ballista", x: 29, y: 6}, {stat: "Sys-SensoTower02", x: 31, y: 4}, {stat: "Emplacement-Ballista", x: 31, y: 5},
	{stat: "Emplacement-Ballista", x: 31, y: 7}, {stat: "WallTower-HvATrocket", x: 26, y: 12}, {stat: "AASite-QuadBof", x: 26, y: 15},
	{stat: "Sys-SensoTower02", x: 27, y: 14}, {stat: "AASite-QuadBof", x: 28, y: 8}, {stat: "AASite-QuadBof", x: 28, y: 13},
	{stat: "Tower-Projector", x: 17, y: 19}, {stat: "Emplacement-MRLHvy-pit", x: 21, y: 19}, {stat: "Wall-RotMg", x: 20, y: 20},
	{stat: "Tower-Projector", x: 20, y: 21}, {stat: "A0HardcreteMk1Wall", x: 21, y: 20}, {stat: "WallTower-HvATrocket", x: 22, y: 20},
	{stat: "Pillbox-RotMG", x: 24, y: 19}, {stat: "PillBoxTK", x: 27, y: 19}, {stat: "PillBoxTK", x: 29, y: 17},
	{stat: "GuardTower-RotMg", x: 28, y: 18}, {stat: "Pillbox-RotMG", x: 34, y: 3}, {stat: "Emplacement-MRLHvy-pit", x: 33, y: 4},
	{stat: "Emplacement-MRLHvy-pit", x: 33, y: 5}, {stat: "TankTrapC", x: 34, y: 4}, {stat: "TankTrapC", x: 34, y: 5},
	{stat: "Pillbox-RotMG", x: 34, y: 6}, {stat: "Pillbox-RotMG", x: 33, y: 10}, {stat: "Wall-RotMg", x: 45, y: 5},
	{stat: "Tower-Projector", x: 44, y: 7, rot: 3}, {stat: "A0HardcreteMk1Wall", x: 45, y: 6, rot: 1}, {stat: "WallTower-HvATrocket", x: 45, y: 7},
	{stat: "Wall-RotMg", x: 41, y: 14}, {stat: "A0HardcreteMk1Wall", x: 41, y: 15, rot: 1}, {stat: "Tower-Projector", x: 42, y: 13, rot: 2},
	{stat: "A0HardcreteMk1Wall", x: 42, y: 14}, {stat: "WallTower-HvATrocket", x: 43, y: 14}, {stat: "Tower-Projector", x: 46, y: 11, rot: 3},
	{stat: "WallTower-HvATrocket", x: 41, y: 16}, {stat: "AASite-QuadBof", x: 44, y: 18}, {stat: "AASite-QuadBof", x: 46, y: 18},
	{stat: "AASite-QuadBof", x: 45, y: 20}, {stat: "AASite-QuadBof", x: 47, y: 20}, {stat: "PillBoxTK", x: 43, y: 26},
	{stat: "Emplacement-MRLHvy-pit", x: 44, y: 24}, {stat: "Sys-SensoTower02", x: 45, y: 26}, {stat: "Pillbox-RotMG", x: 45, y: 27},
	{stat: "Emplacement-MRLHvy-pit", x: 46, y: 24}, {stat: "PillBoxTK", x: 47, y: 26}, {stat: "A0RepairCentre3", x: 50, y: 5},
	{stat: "A0RepairCentre3", x: 50, y: 7}, {stat: "A0RepairCentre3", x: 52, y: 5}, {stat: "AASite-QuadBof", x: 55, y: 7, rot: 1},
	{stat: "AASite-QuadBof", x: 54, y: 10, rot: 1}, {stat: "WallTower-HvATrocket", x: 55, y: 14}, {stat: "Emplacement-Ballista", x: 57, y: 7},
	{stat: "Emplacement-Ballista", x: 58, y: 5}, {stat: "Emplacement-Ballista", x: 59, y: 7}, {stat: "Emplacement-Ballista", x: 60, y: 5},
	{stat: "Emplacement-MRLHvy-pit", x: 63, y: 5}, {stat: "AASite-QuadBof", x: 56, y: 10, rot: 1}, {stat: "Emplacement-MRLHvy-pit", x: 56, y: 13},
	{stat: "A0HardcreteMk1Wall", x: 56, y: 14}, {stat: "Tower-Projector", x: 56, y: 15}, {stat: "Wall-RotMg", x: 57, y: 14},
	{stat: "Sys-SensoTower02", x: 58, y: 13}, {stat: "AASite-QuadBof", x: 59, y: 12}, {stat: "GuardTower-TK", x: 61, y: 9},
	{stat: "Pillbox-RotMG", x: 60, y: 10}, {stat: "Pillbox-RotMG", x: 62, y: 8}, {stat: "Emplacement-MRLHvy-pit", x: 51, y: 22},
	{stat: "Tower-Projector", x: 53, y: 16}, {stat: "WallTower-HvATrocket", x: 52, y: 20}, {stat: "A0HardcreteMk1Wall", x: 52, y: 21, rot: 1},
	{stat: "Tower-Projector", x: 53, y: 21}, {stat: "A0HardcreteMk1Wall", x: 52, y: 22, rot: 1}, {stat: "Wall-RotMg", x: 52, y: 23},
	{stat: "Emplacement-MRLHvy-pit", x: 65, y: 4}, {stat: "PillBoxTK", x: 64, y: 7},
];
const camA3L9FoxtrotLZStructs = [
	{stat: "WallTower-HvATrocket", x: 17, y: 10}, {stat: "Tower-Projector", x: 19, y: 12}, {stat: "WallTower-HvATrocket", x: 22, y: 8},
	{stat: "WallTower-HvATrocket", x: 23, y: 14}, {stat: "WallTower-HvATrocket", x: 26, y: 12},
];
const camA3L9GolfDefenseStructs = [
	{stat: "PillBoxTK", x: 4, y: 75}, {stat: "Wall-VulcanCan", x: 8, y: 75}, {stat: "A0HardcreteMk1Wall", x: 9, y: 75},
	{stat: "WallTower-HPVcannon", x: 10, y: 75}, {stat: "A0HardcreteMk1Wall", x: 11, y: 75}, {stat: "Sys-SensoTower02", x: 9, y: 76},
	{stat: "A0HardcreteMk1Wall", x: 12, y: 75}, {stat: "WallTower-HPVcannon", x: 13, y: 75}, {stat: "A0HardcreteMk1Wall", x: 14, y: 75},
	{stat: "A0HardcreteMk1Wall", x: 15, y: 75}, {stat: "Emplacement-Howitzer105", x: 8, y: 83}, {stat: "Emplacement-Howitzer105", x: 10, y: 83},
	{stat: "Emplacement-Howitzer105", x: 8, y: 85}, {stat: "Emplacement-Howitzer105", x: 8, y: 87}, {stat: "Emplacement-Howitzer105", x: 10, y: 85},
	{stat: "Emplacement-Howitzer105", x: 10, y: 87}, {stat: "AASite-QuadBof", x: 12, y: 84, rot: 1}, {stat: "AASite-QuadBof", x: 12, y: 86, rot: 1},
	{stat: "AASite-QuadBof", x: 14, y: 85, rot: 1}, {stat: "AASite-QuadBof", x: 14, y: 87, rot: 1}, {stat: "Emplacement-Howitzer105", x: 8, y: 89},
	{stat: "Emplacement-Howitzer105", x: 10, y: 89}, {stat: "AASite-QuadBof", x: 12, y: 88, rot: 1}, {stat: "WallTower-HPVcannon", x: 16, y: 75},
	{stat: "Emplacement-Ballista", x: 17, y: 79}, {stat: "Emplacement-RotMor", x: 19, y: 79}, {stat: "WallTower-HPVcannon", x: 22, y: 79},
	{stat: "Emplacement-Ballista", x: 17, y: 83}, {stat: "Emplacement-RotMor", x: 18, y: 81}, {stat: "Emplacement-RotMor", x: 19, y: 83},
	{stat: "Emplacement-RotMor", x: 18, y: 85}, {stat: "Sys-SensoTower02", x: 21, y: 82}, {stat: "A0HardcreteMk1Wall", x: 22, y: 80, rot: 1},
	{stat: "Wall-VulcanCan", x: 22, y: 81}, {stat: "A0HardcreteMk1Wall", x: 22, y: 82, rot: 1}, {stat: "Wall-VulcanCan", x: 22, y: 83},
	{stat: "A0HardcreteMk1Wall", x: 22, y: 84, rot: 1}, {stat: "WallTower-HPVcannon", x: 22, y: 85}, {stat: "AASite-QuadBof", x: 18, y: 91, rot: 1},
	{stat: "AASite-QuadBof", x: 18, y: 93, rot: 1}, {stat: "AASite-QuadBof", x: 19, y: 95, rot: 1}, {stat: "PillBoxHPC", x: 21, y: 95},
	{stat: "WallTower-HPVcannon", x: 11, y: 100}, {stat: "A0HardcreteMk1Wall", x: 11, y: 101, rot: 1}, {stat: "Wall-VulcanCan", x: 11, y: 102},
	{stat: "A0HardcreteMk1Wall", x: 11, y: 103, rot: 1}, {stat: "AASite-QuadBof", x: 15, y: 103, rot: 2}, {stat: "WallTower-HPVcannon", x: 8, y: 104},
	{stat: "A0HardcreteMk1Wall", x: 9, y: 104}, {stat: "A0HardcreteMk1Wall", x: 10, y: 104}, {stat: "WallTower-HPVcannon", x: 11, y: 104},
	{stat: "AASite-QuadBof", x: 13, y: 110, rot: 2}, {stat: "AASite-QuadBof", x: 11, y: 112, rot: 2}, {stat: "PillBoxHPC", x: 10, y: 119},
	{stat: "AASite-QuadBof", x: 15, y: 112, rot: 2}, {stat: "Wall-VulcanCan", x: 8, y: 121}, {stat: "Wall-VulcanCan", x: 8, y: 125},
	{stat: "Wall-VulcanCan", x: 12, y: 121}, {stat: "PillBoxHPC", x: 14, y: 123}, {stat: "Wall-VulcanCan", x: 12, y: 125},
	{stat: "PillBoxTK", x: 22, y: 98}, {stat: "AASite-QuadBof", x: 17, y: 104, rot: 2}, {stat: "Emplacement-Ballista", x: 19, y: 109},
	{stat: "AASite-QuadBof", x: 20, y: 105, rot: 2}, {stat: "Emplacement-Ballista", x: 20, y: 107}, {stat: "Sys-SensoTower02", x: 23, y: 104},
	{stat: "Emplacement-Ballista", x: 22, y: 107}, {stat: "Sys-CB-Tower01", x: 21, y: 109}, {stat: "Emplacement-Ballista", x: 20, y: 111},
	{stat: "Emplacement-Ballista", x: 23, y: 109}, {stat: "Emplacement-Ballista", x: 22, y: 111}, {stat: "PillBoxHPC", x: 25, y: 102},
	{stat: "PillBoxHPC", x: 28, y: 105}, {stat: "PillBoxHPC", x: 30, y: 107}, {stat: "WallTower-HPVcannon", x: 31, y: 109},
	{stat: "A0HardcreteMk1Wall", x: 31, y: 110, rot: 1}, {stat: "Wall-VulcanCan", x: 31, y: 111}, {stat: "A0RepairCentre3", x: 16, y: 115},
	{stat: "A0RepairCentre3", x: 18, y: 117}, {stat: "Emplacement-Howitzer105", x: 21, y: 116}, {stat: "Emplacement-Howitzer105", x: 21, y: 118},
	{stat: "Emplacement-Howitzer105", x: 23, y: 117}, {stat: "Emplacement-Howitzer105", x: 23, y: 119}, {stat: "Emplacement-Howitzer105", x: 21, y: 120},
	{stat: "Emplacement-Howitzer105", x: 21, y: 122}, {stat: "Emplacement-Howitzer105", x: 23, y: 121}, {stat: "Emplacement-Howitzer105", x: 23, y: 123},
	{stat: "Emplacement-Howitzer105", x: 21, y: 124}, {stat: "Emplacement-Howitzer105", x: 23, y: 125}, {stat: "AASite-QuadBof", x: 25, y: 115, rot: 1},
	{stat: "AASite-QuadBof", x: 26, y: 117, rot: 1}, {stat: "AASite-QuadBof", x: 26, y: 120, rot: 1}, {stat: "AASite-QuadBof", x: 26, y: 123, rot: 1},
	{stat: "AASite-QuadBof", x: 25, y: 125, rot: 1}, {stat: "Emplacement-RotMor", x: 29, y: 122}, {stat: "Emplacement-RotMor", x: 30, y: 120},
	{stat: "Sys-CB-Tower01", x: 31, y: 122}, {stat: "Emplacement-RotMor", x: 30, y: 124}, {stat: "PillBoxTK", x: 32, y: 111},
	{stat: "Sys-SensoTower02", x: 32, y: 117}, {stat: "Wall-VulcanCan", x: 33, y: 116}, {stat: "A0HardcreteMk1Wall", x: 33, y: 117, rot: 1},
	{stat: "WallTower-HPVcannon", x: 33, y: 118}, {stat: "PillBoxTK", x: 35, y: 116}, {stat: "A0HardcreteMk1Wall", x: 34, y: 118},
	{stat: "WallTower-HPVcannon", x: 35, y: 118}, {stat: "Emplacement-RotMor", x: 32, y: 120}, {stat: "Emplacement-RotMor", x: 33, y: 122},
	{stat: "AASite-QuadBof", x: 35, y: 120, rot: 1}, {stat: "Emplacement-RotMor", x: 32, y: 124}, {stat: "Emplacement-Ballista", x: 35, y: 124},
	{stat: "AASite-QuadBof", x: 36, y: 122, rot: 1}, {stat: "AASite-QuadBof", x: 37, y: 124, rot: 1}, {stat: "WallTower-HPVcannon", x: 41, y: 124},
	{stat: "A0HardcreteMk1Wall", x: 42, y: 124}, {stat: "A0HardcreteMk1Wall", x: 43, y: 124}, {stat: "WallTower-HPVcannon", x: 44, y: 124},
	{stat: "Sys-CB-Tower01", x: 44, y: 125}, {stat: "A0HardcreteMk1Wall", x: 45, y: 124}, {stat: "A0HardcreteMk1Wall", x: 46, y: 124},
	{stat: "WallTower-HPVcannon", x: 47, y: 124}, {stat: "Emplacement-RotMor", x: 46, y: 126}, {stat: "A0HardcreteMk1Wall", x: 48, y: 124},
	{stat: "A0HardcreteMk1Wall", x: 49, y: 124}, {stat: "Emplacement-RotMor", x: 48, y: 126}, {stat: "WallTower-HPVcannon", x: 50, y: 124},
	{stat: "A0HardcreteMk1Wall", x: 51, y: 124}, {stat: "Emplacement-RotMor", x: 50, y: 126}, {stat: "A0HardcreteMk1Wall", x: 52, y: 124},
	{stat: "WallTower-HPVcannon", x: 53, y: 124}, {stat: "Emplacement-RotMor", x: 52, y: 126}, {stat: "A0HardcreteMk1Wall", x: 54, y: 124},
	{stat: "A0HardcreteMk1Wall", x: 55, y: 124}, {stat: "WallTower-HPVcannon", x: 56, y: 124}, {stat: "Sys-SensoTower02", x: 56, y: 125},
	{stat: "A0HardcreteMk1Wall", x: 57, y: 124}, {stat: "A0HardcreteMk1Wall", x: 58, y: 124}, {stat: "WallTower-HPVcannon", x: 59, y: 124},
	{stat: "PillBoxHPC", x: 58, y: 127}, {stat: "AASite-QuadBof", x: 19, y: 130, rot: 2}, {stat: "AASite-QuadBof", x: 21, y: 129, rot: 2},
	{stat: "AASite-QuadBof", x: 23, y: 130, rot: 2}, {stat: "AASite-QuadBof", x: 25, y: 129, rot: 2}, {stat: "AASite-QuadBof", x: 45, y: 128, rot: 1},
	{stat: "AASite-QuadBof", x: 45, y: 130, rot: 1}, {stat: "Emplacement-Howitzer105", x: 47, y: 128}, {stat: "Emplacement-Howitzer105", x: 49, y: 128},
	{stat: "Emplacement-Howitzer105", x: 48, y: 130}, {stat: "Emplacement-Howitzer105", x: 51, y: 128}, {stat: "Emplacement-Howitzer105", x: 50, y: 130},
	{stat: "PillBoxTK", x: 54, y: 131}, {stat: "PillBoxTK", x: 55, y: 130}, {stat: "PillBoxHPC", x: 52, y: 132},
];
const camA3L9GolfLZStructs = [
	{stat: "PillBoxHPC", x: 10, y: 119}, {stat: "Wall-VulcanCan", x: 8, y: 121}, {stat: "Wall-VulcanCan", x: 8, y: 125},
	{stat: "Wall-VulcanCan", x: 12, y: 121}, {stat: "PillBoxHPC", x: 14, y: 123}, {stat: "Wall-VulcanCan", x: 12, y: 125},
];

// A4L2
// Delta forward base structures
const camA4L2DeltaUplinkStructs = [
	{stat: "Wall-VulcanCan", x: 72, y: 61}, {stat: "A0HardcreteMk1Wall", x: 73, y: 61}, {stat: "A0HardcreteMk1Wall", x: 72, y: 62, rot: 1},
	{stat: "Wall-RotMg", x: 72, y: 63}, {stat: "A0HardcreteMk1Wall", x: 74, y: 61}, {stat: "Wall-RotMg", x: 75, y: 61},
	{stat: "PillBoxHPC", x: 78, y: 59}, {stat: "AASite-QuadBof", x: 78, y: 62, rot: 2}, {stat: "Wall-RotMg", x: 80, y: 59},
	{stat: "A0HardcreteMk1Wall", x: 81, y: 59}, {stat: "A0HardcreteMk1Wall", x: 82, y: 59}, {stat: "Wall-VulcanCan", x: 83, y: 59},
	{stat: "AASite-QuadBof", x: 81, y: 62, rot: 2}, {stat: "Pillbox-RotMG", x: 84, y: 61}, {stat: "A0HardcreteMk1Wall", x: 72, y: 64, rot: 1},
	{stat: "Wall-VulcanCan", x: 72, y: 65}, {stat: "Sys-SensoTower02", x: 73, y: 64}, {stat: "PillBoxHPC", x: 74, y: 67},
	{stat: "Wall-VulcanCan", x: 74, y: 70}, {stat: "A0HardcreteMk1Wall", x: 74, y: 71, rot: 1}, {stat: "AASite-QuadBof", x: 76, y: 64, rot: 3},
	{stat: "AASite-QuadBof", x: 76, y: 67, rot: 3}, {stat: "Sys-CB-Tower01", x: 78, y: 64}, {stat: "AASite-QuadBof", x: 78, y: 69},
	{stat: "Wall-VulcanCan", x: 74, y: 72}, {stat: "A0HardcreteMk1Wall", x: 75, y: 72}, {stat: "Wall-RotMg", x: 76, y: 72},
	{stat: "A0HardcreteMk1Wall", x: 77, y: 72}, {stat: "Wall-VulcanCan", x: 78, y: 72},
	{stat: "Sys-VTOL-RadarTower02", x: 81, y: 67}, {stat: "Emplacement-RotMor", x: 83, y: 64}, {stat: "Emplacement-RotMor", x: 83, y: 66},
	{stat: "AASite-QuadBof", x: 81, y: 69}, {stat: "GuardTower-RotMg", x: 83, y: 70}, {stat: "Emplacement-RotMor", x: 84, y: 65},
	{stat: "Emplacement-RotMor", x: 84, y: 67}, {stat: "Sys-SensoTower02", x: 86, y: 66}, {stat: "Wall-VulcanCan", x: 84, y: 69},
	{stat: "A0HardcreteMk1Wall", x: 84, y: 70, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 84, y: 71, rot: 1}, {stat: "Wall-VulcanCan", x: 81, y: 72},
	{stat: "A0HardcreteMk1Wall", x: 82, y: 72}, {stat: "A0HardcreteMk1Wall", x: 83, y: 72}, {stat: "Wall-VulcanCan", x: 84, y: 72},
];
const camA4L2DeltaOutpostStructs = [
	{stat: "Wall-RotMg", x: 55, y: 46}, {stat: "A0HardcreteMk1Wall", x: 55, y: 47, rot: 1}, {stat: "Wall-VulcanCan", x: 58, y: 42},
	{stat: "A0HardcreteMk1Wall", x: 59, y: 42}, {stat: "Emplacement-RotMor", x: 59, y: 45}, {stat: "A0HardcreteMk1Wall", x: 60, y: 42},
	{stat: "Wall-VulcanCan", x: 61, y: 42}, {stat: "PillBoxHPC", x: 62, y: 43}, {stat: "Emplacement-RotMor", x: 60, y: 47},
	{stat: "GuardTower-RotMg", x: 63, y: 44}, {stat: "A0HardcreteMk1Wall", x: 55, y: 48, rot: 1}, {stat: "Wall-VulcanCan", x: 55, y: 49},
	{stat: "AASite-QuadBof", x: 54, y: 51, rot: 3}, {stat: "AASite-QuadBof", x: 53, y: 53, rot: 3}, {stat: "GuardTower-RotMg", x: 54, y: 56},
	{stat: "Emplacement-Howitzer105", x: 56, y: 53}, {stat: "Emplacement-RotMor", x: 56, y: 55}, {stat: "Emplacement-Howitzer105", x: 58, y: 52},
	{stat: "Emplacement-Howitzer105", x: 58, y: 54}, {stat: "AASite-QuadBof", x: 60, y: 50, rot: 3}, {stat: "Sys-CB-Tower01", x: 61, y: 50},
	{stat: "AASite-QuadBof", x: 61, y: 51}, {stat: "Emplacement-RotMor", x: 62, y: 48}, {stat: "Emplacement-Howitzer105", x: 60, y: 53},
	{stat: "Emplacement-RotMor", x: 60, y: 55}, {stat: "Sys-VTOL-RadarTower02", x: 63, y: 54}, {stat: "Pillbox-RotMG", x: 56, y: 57},
	{stat: "Sys-SensoTower02", x: 60, y: 57}, {stat: "GuardTower-RotMg", x: 62, y: 56}, {stat: "PillBoxHPC", x: 64, y: 45},
	{stat: "Wall-VulcanCan", x: 65, y: 47}, {stat: "A0HardcreteMk1Wall", x: 65, y: 48, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 65, y: 49, rot: 1},
	{stat: "Wall-RotMg", x: 65, y: 50}, {stat: "Wall-RotMg", x: 64, y: 53}, {stat: "A0HardcreteMk1Wall", x: 64, y: 54, rot: 1},
	{stat: "Wall-VulcanCan", x: 64, y: 55}, {stat: "Pillbox-RotMG", x: 65, y: 54},
];
const camA4L2DeltaOverlookStructs = [
	{stat: "Pillbox-RotMG", x: 93, y: 5}, {stat: "Emplacement-RotMor", x: 94, y: 7}, {stat: "PillBoxHPC", x: 90, y: 8},
	{stat: "Pillbox-RotMG", x: 91, y: 11}, {stat: "Emplacement-RotMor", x: 92, y: 8}, {stat: "Emplacement-RotMor", x: 93, y: 10},
	{stat: "Emplacement-RotMor", x: 95, y: 9}, {stat: "GuardTower-RotMg", x: 96, y: 7}, {stat: "AASite-QuadBof", x: 96, y: 11},
	{stat: "PillBoxHPC", x: 97, y: 10}, {stat: "Sys-CB-Tower01", x: 94, y: 8},
];

// A4L3
// Foxtrot and Golf forward base structures
const camA4L3GolfForwardBaseStructs = [
	{stat: "PillBoxHPC", x: 91, y: 111}, {stat: "WallTower04", x: 94, y: 108}, {stat: "A0HardcreteMk1Gate", x: 94, y: 109, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 95, y: 108}, {stat: "A0HardcreteMk1Gate", x: 94, y: 110, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 94, y: 111, rot: 1},
	{stat: "WallTower04", x: 87, y: 115}, {stat: "PillBoxHPC", x: 85, y: 119}, {stat: "A0HardcreteMk1Gate", x: 87, y: 116, rot: 1},
	{stat: "A0HardcreteMk1Gate", x: 87, y: 117, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 87, y: 118, rot: 1}, {stat: "WallTower04", x: 87, y: 119},
	{stat: "WallTower04", x: 84, y: 121}, {stat: "A0HardcreteMk1Wall", x: 85, y: 121}, {stat: "A0HardcreteMk1Wall", x: 86, y: 121, rot: 2},
	{stat: "A0HardcreteMk1Wall", x: 87, y: 120, rot: 1}, {stat: "WallTower-HvATrocket", x: 87, y: 121}, {stat: "Sys-SensoTower02", x: 88, y: 113},
	{stat: "WallTower04", x: 89, y: 112}, {stat: "A0HardcreteMk1Wall", x: 90, y: 112}, {stat: "WallTower-HvATrocket", x: 91, y: 112},
	{stat: "Emplacement-Rocket06-IDF", x: 90, y: 114}, {stat: "Emplacement-Rocket06-IDF", x: 91, y: 116}, {stat: "A0HardcreteMk1Wall", x: 92, y: 112},
	{stat: "A0HardcreteMk1Wall", x: 93, y: 112}, {stat: "Emplacement-Rocket06-IDF", x: 92, y: 114}, {stat: "Sys-CB-Tower01", x: 92, y: 115},
	{stat: "WallTower04", x: 94, y: 112}, {stat: "Emplacement-Rocket06-IDF", x: 94, y: 114}, {stat: "Emplacement-Rocket06-IDF", x: 93, y: 116},
	{stat: "A0HardcreteMk1Wall", x: 88, y: 121, rot: 2}, {stat: "AASite-QuadBof", x: 89, y: 120, rot: 2}, {stat: "A0HardcreteMk1Wall", x: 89, y: 121, rot: 2},
	{stat: "WallTower04", x: 90, y: 121}, {stat: "AASite-QuadBof", x: 91, y: 120, rot: 2}, {stat: "A0HardcreteMk1Wall", x: 91, y: 121},
	{stat: "A0HardcreteMk1Wall", x: 92, y: 121}, {stat: "WallTower04", x: 93, y: 121}, {stat: "A0HardcreteMk1Gate", x: 94, y: 121},
	{stat: "A0HardcreteMk1Gate", x: 95, y: 121}, {stat: "A0HardcreteMk1Wall", x: 96, y: 108}, {stat: "AASite-QuadBof", x: 96, y: 109},
	{stat: "WallTower-HvATrocket", x: 97, y: 108}, {stat: "A0HardcreteMk1Wall", x: 98, y: 108}, {stat: "AASite-QuadBof", x: 98, y: 109},
	{stat: "A0HardcreteMk1Wall", x: 99, y: 108}, {stat: "WallTower04", x: 100, y: 108}, {stat: "A0HardcreteMk1Wall", x: 100, y: 109, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 100, y: 110, rot: 1}, {stat: "WallTower04", x: 100, y: 111}, {stat: "A0HardcreteMk1Wall", x: 101, y: 111},
	{stat: "A0HardcreteMk1Wall", x: 102, y: 111}, {stat: "A0HardcreteMk1Wall", x: 103, y: 111}, {stat: "WallTower04", x: 104, y: 111},
	{stat: "Emplacement-RotMor", x: 99, y: 113}, {stat: "Emplacement-Ballista", x: 98, y: 115}, {stat: "WallTower04", x: 97, y: 119},
	{stat: "Emplacement-RotMor", x: 99, y: 117}, {stat: "A0HardcreteMk1Wall", x: 98, y: 119}, {stat: "A0HardcreteMk1Wall", x: 99, y: 119},
	{stat: "A0RepairCentre3", x: 101, y: 113}, {stat: "AASite-QuadBof", x: 103, y: 114, rot: 3}, {stat: "A0RepairCentre3", x: 101, y: 117},
	{stat: "WallTower-HvATrocket", x: 100, y: 119}, {stat: "A0HardcreteMk1Wall", x: 101, y: 119}, {stat: "AASite-QuadBof", x: 103, y: 116, rot: 3},
	{stat: "A0HardcreteMk1Wall", x: 102, y: 119}, {stat: "A0HardcreteMk1Wall", x: 103, y: 119}, {stat: "A0HardcreteMk1Gate", x: 96, y: 121},
	{stat: "A0HardcreteMk1Wall", x: 97, y: 120, rot: 1}, {stat: "WallTower04", x: 97, y: 121}, {stat: "A0HardcreteMk1Wall", x: 104, y: 112, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 104, y: 113, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 104, y: 114, rot: 1}, {stat: "WallTower-HvATrocket", x: 104, y: 115},
	{stat: "A0HardcreteMk1Wall", x: 104, y: 116, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 104, y: 117, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 104, y: 118, rot: 1},
	{stat: "WallTower04", x: 104, y: 119},
];
const camA4L3FoxtrotForwardStructs1 = [
	{stat: "PillBoxTK", x: 116, y: 27}, {stat: "AASite-QuadBof", x: 117, y: 26}, {stat: "GuardTower-RotMg", x: 118, y: 25},
	{stat: "Emplacement-Ballista", x: 119, y: 26}, {stat: "TankTrapC", x: 116, y: 28}, {stat: "TankTrapC", x: 116, y: 29},
	{stat: "GuardTower-RotMg", x: 117, y: 29}, {stat: "Tower-Projector", x: 116, y: 30}, {stat: "GuardTower-TK", x: 122, y: 23},
	{stat: "Emplacement-MRLHvy-pit", x: 123, y: 23}, {stat: "GuardTower-TK", x: 124, y: 23}, {stat: "Sys-SensoTower02", x: 121, y: 24},
	{stat: "Emplacement-Ballista", x: 121, y: 26}, {stat: "Emplacement-Ballista", x: 123, y: 26}, {stat: "Emplacement-Ballista", x: 120, y: 28},
	{stat: "Emplacement-Ballista", x: 122, y: 28}, {stat: "AASite-QuadBof", x: 125, y: 24, rot: 1}, {stat: "Emplacement-MRLHvy-pit", x: 125, y: 26},
	{stat: "Tower-Projector", x: 119, y: 32}, {stat: "TankTrapC", x: 119, y: 33}, {stat: "TankTrapC", x: 119, y: 34}, {stat: "PillBoxTK", x: 119, y: 35},
	{stat: "GuardTower-RotMg", x: 120, y: 33}, {stat: "Emplacement-MRLHvy-pit", x: 122, y: 32}, {stat: "AASite-QuadBof", x: 123, y: 34},
	{stat: "GuardTower-TK", x: 125, y: 35}, {stat: "AASite-QuadBof", x: 126, y: 36}, {stat: "A0ResourceExtractor", x: 124, y: 31},
];
const camA4L3FoxtrotForwardStructs2 = [
	{stat: "AASite-QuadBof", x: 98, y: 3}, {stat: "AASite-QuadBof", x: 96, y: 4}, {stat: "GuardTower-TK", x: 96, y: 6},
	{stat: "Emplacement-MRLHvy-pit", x: 96, y: 7}, {stat: "AASite-QuadBof", x: 100, y: 4},
	{stat: "PillBoxTK", x: 97, y: 9}, {stat: "GuardTower-RotMg", x: 98, y: 10}, {stat: "TankTrapC", x: 99, y: 11},
	{stat: "Emplacement-MRLHvy-pit", x: 100, y: 10}, {stat: "TankTrapC", x: 100, y: 11}, {stat: "Tower-Projector", x: 101, y: 11},
];
const camA4L3FoxtrotForwardStructs3 = [
	{stat: "Tower-Projector", x: 91, y: 17}, {stat: "Tower-Projector", x: 88, y: 21}, {stat: "TankTrapC", x: 88, y: 22},
	{stat: "TankTrapC", x: 88, y: 23}, {stat: "GuardTower-RotMg", x: 89, y: 23}, {stat: "PillBoxTK", x: 91, y: 20},
	{stat: "TankTrapC", x: 92, y: 17}, {stat: "TankTrapC", x: 93, y: 17}, {stat: "GuardTower-RotMg", x: 92, y: 18},
	{stat: "TankTrapC", x: 94, y: 17}, {stat: "Emplacement-Ballista", x: 92, y: 21}, {stat: "Emplacement-Ballista", x: 95, y: 20},
	{stat: "Emplacement-Ballista", x: 92, y: 24}, {stat: "TankTrapC", x: 88, y: 24}, {stat: "Emplacement-Ballista", x: 95, y: 23},
	{stat: "GuardTower-RotMg", x: 92, y: 26}, {stat: "PillBoxTK", x: 95, y: 26}, {stat: "PillBoxTK", x: 97, y: 23},
	{stat: "Sys-SensoTower02", x: 96, y: 25}, {stat: "A0ResourceExtractor", x: 93, y: 23},
];
const camA4L3FoxtrotForwardStructs4 = [
	{stat: "Sys-SensoTower02", x: 75, y: 29}, {stat: "Pillbox-RotMG", x: 78, y: 28}, {stat: "AASite-QuadBof", x: 78, y: 31},
	{stat: "GuardTower-TK", x: 80, y: 28}, {stat: "GuardTower-RotMg", x: 81, y: 29}, {stat: "GuardTower-RotMg", x: 82, y: 30},
	{stat: "GuardTower-TK", x: 83, y: 31}, {stat: "Emplacement-Ballista", x: 75, y: 35}, {stat: "AASite-QuadBof", x: 73, y: 36, rot: 3},
	{stat: "TankTrapC", x: 73, y: 37}, {stat: "TankTrapC", x: 73, y: 38}, {stat: "Pillbox-RotMG", x: 73, y: 39},
	{stat: "GuardTower-TK", x: 74, y: 37}, {stat: "TankTrapC", x: 74, y: 39}, {stat: "PillBoxTK", x: 75, y: 39},
	{stat: "Emplacement-Ballista", x: 76, y: 33}, {stat: "A0ResourceExtractor", x: 77, y: 35}, {stat: "AASite-QuadBof", x: 79, y: 32},
	{stat: "Emplacement-Ballista", x: 78, y: 34}, {stat: "Emplacement-MRLHvy-pit", x: 76, y: 37}, {stat: "TankTrapC", x: 76, y: 39},
	{stat: "Tower-Projector", x: 77, y: 39}, {stat: "AASite-QuadBof", x: 83, y: 33}, {stat: "GuardTower-RotMg", x: 82, y: 35},
	{stat: "Pillbox-RotMG", x: 83, y: 35}, {stat: "Emplacement-MRLHvy-pit", x: 80, y: 36}, {stat: "Tower-Projector", x: 81, y: 38},
	{stat: "GuardTower-TK", x: 82, y: 37}, {stat: "TankTrapC", x: 83, y: 36}, {stat: "TankTrapC", x: 83, y: 37},
	{stat: "TankTrapC", x: 82, y: 38}, {stat: "PillBoxTK", x: 83, y: 38},
];
const camA4L3FoxtrotForwardStructs5 = [
	{stat: "TankTrapC", x: 94, y: 57}, {stat: "TankTrapC", x: 95, y: 57}, {stat: "Pillbox-RotMG", x: 94, y: 58},
	{stat: "TankTrapC", x: 94, y: 59}, {stat: "GuardTower-TK", x: 95, y: 59}, {stat: "Tower-Projector", x: 94, y: 60, rot: 3},
	{stat: "AASite-QuadBof", x: 96, y: 57, rot: 2}, {stat: "Emplacement-MRLHvy-pit", x: 97, y: 58}, {stat: "AASite-QuadBof", x: 99, y: 59, rot: 2},
	{stat: "A0ResourceExtractor", x: 97, y: 60}, {stat: "Tower-Projector", x: 96, y: 63, rot: 3}, {stat: "Emplacement-MRLHvy-pit", x: 100, y: 60},
	{stat: "AASite-QuadBof", x: 101, y: 61, rot: 1}, {stat: "AASite-QuadBof", x: 101, y: 63}, {stat: "TankTrapC", x: 96, y: 64},
	{stat: "Pillbox-RotMG", x: 96, y: 65}, {stat: "GuardTower-TK", x: 97, y: 64}, {stat: "Sys-SensoTower02", x: 99, y: 65},
	{stat: "AASite-QuadBof", x: 98, y: 66},
];

// A4L4
// Charlie LZ defenses
const camA4L4CharlieLZStructs = [
	{stat: "PillBoxHPC", x: 3, y: 102}, {stat: "A0RepairCentre3", x: 3, y: 109}, {stat: "A0RepairCentre3", x: 3, y: 111},
	{stat: "Tower-Projector", x: 5, y: 105}, {stat: "WallTower-HvATrocket", x: 15, y: 103}, {stat: "PillBoxHPC", x: 9, y: 105},
	{stat: "GuardTower-TK", x: 11, y: 106}, {stat: "GuardTower-RotMg", x: 13, y: 104}, {stat: "AASite-QuadRotMg", x: 13, y: 107},
	{stat: "A0RepairCentre3", x: 3, y: 113}, {stat: "WallTower04", x: 3, y: 116}, {stat: "A0HardcreteMk1Wall", x: 4, y: 116},
	{stat: "Pillbox-RotMG", x: 4, y: 117}, {stat: "A0HardcreteMk1Wall", x: 5, y: 116}, {stat: "Wall-RotMg", x: 6, y: 116},
	{stat: "Tower-Projector", x: 8, y: 114}, {stat: "A0VtolPad", x: 13, y: 116}, {stat: "A0VtolPad", x: 12, y: 118},
	{stat: "A0VtolPad", x: 13, y: 118}, {stat: "A0VtolPad", x: 14, y: 116}, {stat: "A0VtolPad", x: 15, y: 116},
	{stat: "A0VtolPad", x: 14, y: 118}, {stat: "AASite-QuadRotMg", x: 15, y: 118}, {stat: "A0HardcreteMk1Wall", x: 16, y: 103},
	{stat: "A0HardcreteMk1Wall", x: 17, y: 103}, {stat: "WallTower-HvATrocket", x: 18, y: 103}, {stat: "A0HardcreteMk1Wall", x: 19, y: 103},
	{stat: "A0HardcreteMk1Wall", x: 20, y: 103}, {stat: "WallTower-HvATrocket", x: 21, y: 103}, {stat: "Emplacement-RotMor", x: 16, y: 105},
	{stat: "Emplacement-Ballista", x: 17, y: 106}, {stat: "Emplacement-RotMor", x: 18, y: 105}, {stat: "Emplacement-Ballista", x: 19, y: 106},
	{stat: "Emplacement-RotMor", x: 20, y: 105}, {stat: "GuardTower-RotMg", x: 22, y: 104}, {stat: "Emplacement-Rocket06-IDF", x: 22, y: 108},
	{stat: "Emplacement-Rocket06-IDF", x: 22, y: 110}, {stat: "Sys-SensoTower02", x: 24, y: 105}, {stat: "AASite-QuadRotMg", x: 25, y: 106, rot: 2},
	{stat: "Emplacement-Rocket06-IDF", x: 24, y: 109}, {stat: "Emplacement-Rocket06-IDF", x: 24, y: 111}, {stat: "AASite-QuadRotMg", x: 26, y: 108, rot: 1},
	{stat: "WallTower04", x: 27, y: 110}, {stat: "A0HardcreteMk1Wall", x: 27, y: 111, rot: 1}, {stat: "AASite-QuadRotMg", x: 16, y: 116},
	{stat: "A0VtolPad", x: 17, y: 116}, {stat: "A0VtolPad", x: 16, y: 118}, {stat: "A0VtolPad", x: 17, y: 118},
	{stat: "A0VtolPad", x: 18, y: 116}, {stat: "A0VtolPad", x: 19, y: 116}, {stat: "A0VtolPad", x: 18, y: 118},
	{stat: "AASite-QuadRotMg", x: 22, y: 112}, {stat: "Sys-CB-Tower01", x: 21, y: 117}, {stat: "WallTower04", x: 27, y: 112},
];
// LZ repair facilities (isolated)
const camA4L4CharlieLZRepairStructs = [
	{stat: "A0RepairCentre3", x: 3, y: 109}, {stat: "A0RepairCentre3", x: 3, y: 111}, {stat: "A0RepairCentre3", x: 3, y: 113},
];
// Charlie forward defenses
const camA4L4CharlieForwardStructs = [
	{stat: "WallTower-HvATrocket", x: 22, y: 37}, {stat: "A0HardcreteMk1Wall", x: 23, y: 37}, {stat: "WallTower-HvATrocket", x: 24, y: 37},
	{stat: "WallTower04", x: 26, y: 38}, {stat: "A0HardcreteMk1Wall", x: 26, y: 39}, {stat: "WallTower04", x: 26, y: 40},
	{stat: "Emplacement-RotMor", x: 23, y: 41}, {stat: "Emplacement-Ballista", x: 22, y: 40}, {stat: "Emplacement-RotMor", x: 21, y: 41},
	{stat: "PillBoxHPC", x: 26, y: 42}, {stat: "Sys-SensoTower02", x: 25, y: 40}, {stat: "PillBoxHPC", x: 20, y: 38},
	{stat: "AASite-QuadRotMg", x: 19, y: 39, rot: 2}, {stat: "AASite-QuadRotMg", x: 16, y: 41, rot: 2}, {stat: "AASite-QuadRotMg", x: 20, y: 44, rot: 1},
	{stat: "A0RepairCentre3", x: 17, y: 44}, {stat: "A0RepairCentre3", x: 16, y: 46}, {stat: "A0RepairCentre3", x: 17, y: 48},
	{stat: "Pillbox-RotMG", x: 15, y: 50}, {stat: "AASite-QuadRotMg", x: 17, y: 51}, {stat: "Pillbox-RotMG", x: 19, y: 52},
	{stat: "AASite-QuadRotMg", x: 20, y: 48}, {stat: "GuardTower-TK", x: 23, y: 50}, {stat: "WallTower04", x: 13, y: 44},
	{stat: "A0HardcreteMk1Wall", x: 13, y: 45}, {stat: "A0HardcreteMk1Wall", x: 13, y: 46}, {stat: "WallTower04", x: 13, y: 47},
];

// A4L5
// Collective LZ defenses
const camA4L5ColLZ1Structs = [
	{stat: "Pillbox-RotMG", x: 146, y: 15}, {stat: "WallTower04", x: 147, y: 15}, {stat: "Pillbox-RotMG", x: 150, y: 13},
	{stat: "WallTower-HvATrocket", x: 151, y: 15}, {stat: "AASite-QuadBof", x: 152, y: 15, rot: 1}, {stat: "AASite-QuadBof", x: 145, y: 17, rot: 3},
	{stat: "PillBoxHPC", x: 145, y: 20}, {stat: "Sys-SensoTower02", x: 146, y: 20}, {stat: "PillBoxHPC", x: 146, y: 21},
	{stat: "AASite-QuadBof", x: 148, y: 19}, {stat: "WallTower04", x: 151, y: 19}, {stat: "AASite-QuadBof", x: 150, y: 21},
	{stat: "Emplacement-Howitzer105", x: 154, y: 16}, {stat: "Emplacement-Howitzer105", x: 155, y: 18}, {stat: "PillBox6", x: 152, y: 20},
];
const camA4L5ColLZ2Structs = [
	{stat: "Pillbox-RotMG", x: 55, y: 141}, {stat: "AASite-QuadBof", x: 58, y: 139, rot: 2}, {stat: "WallTower04", x: 58, y: 140},
	{stat: "AASite-QuadBof", x: 62, y: 139, rot: 2}, {stat: "Sys-CB-Tower01", x: 60, y: 140}, {stat: "WallTower04", x: 62, y: 140},
	{stat: "AASite-QuadBof", x: 57, y: 144, rot: 3}, {stat: "WallTower04", x: 58, y: 144}, {stat: "Emplacement-Howitzer105", x: 58, y: 146},
	{stat: "AASite-QuadBof", x: 60, y: 145}, {stat: "Emplacement-Howitzer105", x: 60, y: 147}, {stat: "WallTower04", x: 62, y: 144},
	{stat: "AASite-QuadBof", x: 63, y: 144, rot: 1}, {stat: "Emplacement-Howitzer105", x: 62, y: 146}, {stat: "Pillbox-RotMG", x: 64, y: 139},
	{stat: "Tower-Projector", x: 65, y: 142},
];
const camA4L5ColLZ3Structs = [
	{stat: "WallTower04", x: 9, y: 122}, {stat: "A0HardcreteMk1Wall", x: 9, y: 123, rot: 1}, {stat: "Pillbox-RotMG", x: 10, y: 120},
	{stat: "A0HardcreteMk1Wall", x: 9, y: 124, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 9, y: 125, rot: 1}, {stat: "WallTower04", x: 9, y: 126},
	{stat: "WallTower-HvATrocket", x: 13, y: 122}, {stat: "Tower-Projector", x: 14, y: 121}, {stat: "AASite-QuadBof", x: 13, y: 125, rot: 1},
	{stat: "AASite-QuadBof", x: 4, y: 128, rot: 1}, {stat: "AASite-QuadBof", x: 4, y: 130, rot: 1}, {stat: "Emplacement-MortarPit02", x: 6, y: 130},
	{stat: "Emplacement-MortarPit02", x: 8, y: 129}, {stat: "Emplacement-MortarPit02", x: 11, y: 130}, {stat: "Emplacement-MortarPit02", x: 9, y: 132},
	{stat: "AASite-QuadBof", x: 13, y: 129}, {stat: "PillBoxHPC", x: 14, y: 128},
];
const camA4L5ColLZ4Structs = [
	{stat: "PillBox6", x: 121, y: 80}, {stat: "PillBox6", x: 121, y: 87}, {stat: "WallTower04", x: 124, y: 82},
	{stat: "WallTower04", x: 124, y: 86}, {stat: "AASite-QuadBof", x: 129, y: 80, rot: 1}, {stat: "WallTower04", x: 128, y: 82},
	{stat: "WallTower04", x: 128, y: 86}, {stat: "AASite-QuadBof", x: 130, y: 84, rot: 1}, {stat: "AASite-QuadBof", x: 128, y: 89, rot: 1},
];
const camA4L5ColLZ5Structs = [
	{stat: "Pillbox-RotMG", x: 102, y: 98}, {stat: "Sys-SensoTower02", x: 100, y: 103}, {stat: "WallTower04", x: 103, y: 100},
	{stat: "WallTower04", x: 103, y: 104}, {stat: "Pillbox-RotMG", x: 106, y: 97}, {stat: "WallTower04", x: 107, y: 100},
	{stat: "GuardTower5", x: 108, y: 98}, {stat: "PillBoxHPC", x: 109, y: 101}, {stat: "AASite-QuadBof", x: 105, y: 107, rot: 1},
	{stat: "WallTower04", x: 107, y: 104}, {stat: "AASite-QuadBof", x: 110, y: 105, rot: 3},
];
const camA4L5ColLZ6Structs = [
	{stat: "WallTower04", x: 65, y: 110}, {stat: "Sys-SensoTower02", x: 65, y: 111}, {stat: "A0HardcreteMk1Wall", x: 66, y: 110},
	{stat: "WallTower-HvATrocket", x: 67, y: 110}, {stat: "A0HardcreteMk1Wall", x: 68, y: 110}, {stat: "WallTower04", x: 69, y: 110},
	{stat: "AASite-QuadBof", x: 65, y: 112, rot: 3}, {stat: "Emplacement-Howitzer105", x: 66, y: 114}, {stat: "Emplacement-Howitzer105", x: 69, y: 115},
	{stat: "Pillbox-RotMG", x: 70, y: 113}, {stat: "AASite-QuadBof", x: 68, y: 116},
];
const camA4L5ColLZ7Structs = [
	{stat: "WallTower04", x: 96, y: 43}, {stat: "A0HardcreteMk1Wall", x: 96, y: 44, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 96, y: 45, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 96, y: 46, rot: 1}, {stat: "WallTower04", x: 96, y: 47}, {stat: "Tower-Projector", x: 100, y: 43},
	{stat: "AASite-QuadBof", x: 100, y: 47}, {stat: "Emplacement-MRLHvy-pit", x: 102, y: 45}, {stat: "AASite-QuadBof", x: 105, y: 46},
	{stat: "PillBox6", x: 107, y: 47}, {stat: "AASite-QuadBof", x: 96, y: 50}, {stat: "Pillbox-RotMG", x: 98, y: 51},
	{stat: "PillBox6", x: 96, y: 54}, {stat: "PillBoxHPC", x: 102, y: 49}, {stat: "Pillbox-RotMG", x: 104, y: 48},
];
const camA4L5ColLZ8Structs = [
	{stat: "Tower-Projector", x: 90, y: 19}, {stat: "WallTower-HvATrocket", x: 91, y: 20}, {stat: "Pillbox-RotMG", x: 93, y: 17},
	{stat: "Emplacement-MortarPit02", x: 93, y: 19}, {stat: "Emplacement-MRLHvy-pit", x: 94, y: 17}, {stat: "Emplacement-MortarPit02", x: 95, y: 18},
	{stat: "Emplacement-MortarPit02", x: 95, y: 20}, {stat: "Pillbox-RotMG", x: 88, y: 24}, {stat: "GuardTower5", x: 89, y: 25},
	{stat: "WallTower04", x: 91, y: 24}, {stat: "AASite-QuadBof", x: 92, y: 26}, {stat: "WallTower-HvATrocket", x: 95, y: 24},
	{stat: "AASite-QuadBof", x: 95, y: 26}, {stat: "AASite-QuadBof", x: 96, y: 20, rot: 1}, {stat: "Emplacement-MortarPit02", x: 97, y: 22},
	{stat: "AASite-QuadBof", x: 97, y: 23, rot: 1}, {stat: "Sys-SensoTower02", x: 96, y: 25},
];
const camA4L5ColLZ9Structs = [
	{stat: "Pillbox-RotMG", x: 29, y: 27}, {stat: "WallTower04", x: 31, y: 28}, {stat: "WallTower04", x: 31, y: 32},
	{stat: "AASite-QuadBof", x: 34, y: 26}, {stat: "WallTower04", x: 35, y: 28}, {stat: "AASite-QuadBof", x: 38, y: 27},
	{stat: "Tower-Projector", x: 38, y: 28}, {stat: "Pillbox-RotMG", x: 32, y: 34}, {stat: "WallTower04", x: 35, y: 32},
	{stat: "Pillbox-RotMG", x: 37, y: 33},
];
const camA4L5ColLZ10Structs = [
	{stat: "Emplacement-Howitzer105", x: 15, y: 60}, {stat: "Emplacement-MortarPit02", x: 14, y: 62}, {stat: "Emplacement-Howitzer105", x: 16, y: 62},
	{stat: "WallTower04", x: 18, y: 62}, {stat: "WallTower-HvATrocket", x: 23, y: 58}, {stat: "AASite-QuadBof", x: 21, y: 60, rot: 2},
	{stat: "PillBoxHPC", x: 22, y: 62}, {stat: "AASite-QuadBof", x: 24, y: 61, rot: 1}, {stat: "Sys-SensoTower02", x: 25, y: 60},
	{stat: "AASite-QuadBof", x: 24, y: 63, rot: 1}, {stat: "Emplacement-Howitzer105", x: 15, y: 64}, {stat: "Pillbox-RotMG", x: 17, y: 67},
	{stat: "AASite-QuadBof", x: 18, y: 66}, {stat: "WallTower04", x: 22, y: 66},
];

// A4L6
// Charlie, Delta, and Collective forward base structures
const camA4L6CharlieBase2Structs = [
	{stat: "WallTower-HvATrocket", x: 70, y: 71}, {stat: "A0HardcreteMk1Wall", x: 71, y: 71}, {stat: "Sys-VTOL-RadarTower02", x: 69, y: 73},
	{stat: "Sys-SensoTower02", x: 69, y: 74}, {stat: "AASite-QuadRotMg", x: 71, y: 72}, {stat: "Wall-RotMg", x: 70, y: 75},
	{stat: "A0HardcreteMk1Wall", x: 70, y: 76, rot: 1}, {stat: "WallTower04", x: 70, y: 77}, {stat: "AASite-QuadRotMg", x: 71, y: 76, rot: 1},
	{stat: "WallTower04", x: 72, y: 71}, {stat: "WallTower04", x: 76, y: 70}, {stat: "A0HardcreteMk1Wall", x: 77, y: 70},
	{stat: "WallTower-HvATrocket", x: 78, y: 70}, {stat: "Tower-Projector", x: 78, y: 71}, {stat: "Emplacement-Ballista", x: 73, y: 73},
	{stat: "Emplacement-Ballista", x: 72, y: 74}, {stat: "WallTower04", x: 75, y: 78}, {stat: "AASite-QuadRotMg", x: 76, y: 77, rot: 2},
	{stat: "A0HardcreteMk1Wall", x: 76, y: 78}, {stat: "A0HardcreteMk1Wall", x: 77, y: 78}, {stat: "Tower-Projector", x: 78, y: 77},
	{stat: "WallTower-HvATrocket", x: 78, y: 78},
];
const camA4L6CharlieBase3Structs = [
	{stat: "Wall-RotMg", x: 103, y: 73}, {stat: "A0HardcreteMk1Wall", x: 103, y: 74, rot: 1}, {stat: "Wall-RotMg", x: 103, y: 75},
	{stat: "Tower-Projector", x: 102, y: 77}, {stat: "WallTower04", x: 110, y: 67}, {stat: "A0HardcreteMk1Wall", x: 111, y: 67},
	{stat: "PillBoxTK", x: 108, y: 69}, {stat: "WallTower04", x: 109, y: 68}, {stat: "A0HardcreteMk1Wall", x: 109, y: 69, rot: 1},
	{stat: "Wall-RotMg", x: 109, y: 70}, {stat: "GuardTower-TK", x: 104, y: 72}, {stat: "WallTower04", x: 104, y: 77},
	{stat: "A0HardcreteMk1Gate", x: 104, y: 78, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 104, y: 79, rot: 1}, {stat: "A0RepairCentre3", x: 111, y: 74},
	{stat: "A0RepairCentre3", x: 109, y: 76}, {stat: "Emplacement-RotMor", x: 109, y: 79}, {stat: "Emplacement-RotMor", x: 111, y: 79},
	{stat: "A0HardcreteMk1Gate", x: 104, y: 80, rot: 1}, {stat: "WallTower04", x: 104, y: 81}, {stat: "Emplacement-Ballista", x: 107, y: 80},
	{stat: "PillBoxTK", x: 106, y: 82}, {stat: "Pillbox-RotMG", x: 107, y: 83}, {stat: "Emplacement-Ballista", x: 109, y: 81},
	{stat: "Emplacement-Ballista", x: 111, y: 81}, {stat: "Sys-SensoTower02", x: 110, y: 83}, {stat: "WallTower04", x: 108, y: 84},
	{stat: "A0HardcreteMk1Wall", x: 109, y: 84}, {stat: "A0HardcreteMk1Wall", x: 110, y: 84}, {stat: "WallTower04", x: 111, y: 84},
	{stat: "WallTower-HvATrocket", x: 112, y: 67}, {stat: "AASite-QuadRotMg", x: 113, y: 68, rot: 1}, {stat: "PillBoxHPC", x: 114, y: 69},
	{stat: "Wall-RotMg", x: 115, y: 71}, {stat: "A0HardcreteMk1Wall", x: 115, y: 72, rot: 1}, {stat: "Wall-RotMg", x: 115, y: 73},
	{stat: "AASite-QuadRotMg", x: 116, y: 73, rot: 2}, {stat: "AASite-QuadRotMg", x: 118, y: 74, rot: 1}, {stat: "WallTower-HvATrocket", x: 119, y: 75},
	{stat: "Sys-VTOL-RadarTower02", x: 117, y: 77}, {stat: "WallTower-HvATrocket", x: 116, y: 78}, {stat: "A0HardcreteMk1Gate", x: 116, y: 79, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 117, y: 78}, {stat: "A0HardcreteMk1Wall", x: 119, y: 76, rot: 1}, {stat: "WallTower04", x: 119, y: 77},
	{stat: "WallTower04", x: 118, y: 78}, {stat: "Tower-Projector", x: 119, y: 79}, {stat: "Emplacement-Ballista", x: 113, y: 80},
	{stat: "Wall-RotMg", x: 112, y: 83}, {stat: "A0HardcreteMk1Wall", x: 113, y: 83}, {stat: "WallTower-HvATrocket", x: 114, y: 83},
	{stat: "A0HardcreteMk1Gate", x: 116, y: 80, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 116, y: 81, rot: 1}, {stat: "WallTower04", x: 116, y: 82},
];
const camA4L6CharlieBase4Structs = [
	{stat: "GuardTower-TK", x: 114, y: 45}, {stat: "AASite-QuadRotMg", x: 115, y: 44, rot: 2}, {stat: "Wall-RotMg", x: 115, y: 46},
	{stat: "A0HardcreteMk1Wall", x: 115, y: 47, rot: 1}, {stat: "Emplacement-Howitzer105", x: 118, y: 43}, {stat: "Emplacement-RotMor", x: 119, y: 47},
	{stat: "Wall-RotMg", x: 125, y: 36}, {stat: "AASite-QuadRotMg", x: 124, y: 38, rot: 3}, {stat: "A0HardcreteMk1Wall", x: 126, y: 36},
	{stat: "WallTower04", x: 127, y: 36}, {stat: "Emplacement-Howitzer105", x: 120, y: 42}, {stat: "Emplacement-Howitzer105", x: 122, y: 40},
	{stat: "Emplacement-Howitzer105", x: 123, y: 42}, {stat: "Emplacement-Howitzer105", x: 120, y: 44}, {stat: "Sys-CB-Tower01", x: 122, y: 44},
	{stat: "WallTower04", x: 123, y: 46}, {stat: "A0HardcreteMk1Gate", x: 123, y: 47, rot: 1}, {stat: "Emplacement-Ballista", x: 126, y: 41},
	{stat: "Emplacement-Ballista", x: 127, y: 43}, {stat: "A0HardcreteMk1Wall", x: 124, y: 46}, {stat: "A0HardcreteMk1Wall", x: 125, y: 46},
	{stat: "WallTower-HvATrocket", x: 126, y: 46}, {stat: "A0HardcreteMk1Wall", x: 127, y: 46}, {stat: "WallTower-HvATrocket", x: 115, y: 48},
	{stat: "A0HardcreteMk1Wall", x: 115, y: 49, rot: 1}, {stat: "Wall-RotMg", x: 115, y: 50}, {stat: "AASite-QuadRotMg", x: 116, y: 51},
	{stat: "Emplacement-RotMor", x: 118, y: 49}, {stat: "Emplacement-Ballista", x: 119, y: 51}, {stat: "AASite-QuadRotMg", x: 117, y: 53},
	{stat: "GuardTower-TK", x: 118, y: 54}, {stat: "Emplacement-Ballista", x: 120, y: 49}, {stat: "Emplacement-Ballista", x: 121, y: 51},
	{stat: "A0HardcreteMk1Gate", x: 123, y: 48, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 123, y: 49, rot: 1}, {stat: "WallTower04", x: 123, y: 50},
	{stat: "A0HardcreteMk1Wall", x: 123, y: 51, rot: 1}, {stat: "Emplacement-Ballista", x: 120, y: 53}, {stat: "Sys-VTOL-RadarTower02", x: 122, y: 53},
	{stat: "WallTower-HvATrocket", x: 123, y: 52}, {stat: "A0HardcreteMk1Wall", x: 123, y: 53, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 123, y: 54, rot: 1},
	{stat: "WallTower04", x: 123, y: 55}, {stat: "Pillbox-RotMG", x: 124, y: 53}, {stat: "Wall-RotMg", x: 120, y: 56},
	{stat: "A0HardcreteMk1Wall", x: 121, y: 56}, {stat: "Wall-RotMg", x: 122, y: 56}, {stat: "GuardTower-TK", x: 128, y: 37},
	{stat: "Emplacement-Ballista", x: 128, y: 41}, {stat: "AASite-QuadRotMg", x: 129, y: 40}, {stat: "Sys-SensoTower02", x: 129, y: 43},
	{stat: "Wall-RotMg", x: 130, y: 42}, {stat: "A0HardcreteMk1Wall", x: 130, y: 43, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 128, y: 46},
	{stat: "Tower-Projector", x: 128, y: 47}, {stat: "WallTower04", x: 129, y: 46}, {stat: "Wall-RotMg", x: 130, y: 44},
];
const camA4L6DeltaBase2Structs = [
	{stat: "PillBoxHPC", x: 87, y: 12}, {stat: "Wall-RotMg", x: 88, y: 11}, {stat: "A0HardcreteMk1Wall", x: 88, y: 12, rot: 1},
	{stat: "WallTower04", x: 88, y: 13}, {stat: "AASite-QuadRotMg", x: 90, y: 12}, {stat: "WallTower04", x: 92, y: 11},
	{stat: "A0HardcreteMk1Wall", x: 93, y: 11}, {stat: "Pillbox-RotMG", x: 94, y: 10}, {stat: "A0HardcreteMk1Wall", x: 94, y: 11},
	{stat: "WallTower04", x: 95, y: 11}, {stat: "PillBoxHPC", x: 89, y: 19}, {stat: "WallTower04", x: 90, y: 18},
	{stat: "A0HardcreteMk1Wall", x: 90, y: 19, rot: 1}, {stat: "Wall-RotMg", x: 90, y: 20}, {stat: "A0RepairCentre3", x: 93, y: 19},
	{stat: "A0RepairCentre3", x: 95, y: 19}, {stat: "Wall-RotMg", x: 92, y: 21}, {stat: "A0HardcreteMk1Wall", x: 93, y: 21},
	{stat: "A0HardcreteMk1Wall", x: 94, y: 21}, {stat: "Wall-RotMg", x: 95, y: 21}, {stat: "WallTower04", x: 101, y: 7},
	{stat: "Emplacement-RotMor", x: 103, y: 7}, {stat: "A0HardcreteMk1Gate", x: 96, y: 11, rot: 2}, {stat: "A0HardcreteMk1Gate", x: 97, y: 11, rot: 2},
	{stat: "A0HardcreteMk1Gate", x: 98, y: 11, rot: 2}, {stat: "Pillbox-RotMG", x: 99, y: 10}, {stat: "WallTower04", x: 99, y: 11},
	{stat: "A0HardcreteMk1Wall", x: 101, y: 8, rot: 1}, {stat: "Wall-RotMg", x: 101, y: 9}, {stat: "A0HardcreteMk1Wall", x: 100, y: 11},
	{stat: "A0HardcreteMk1Wall", x: 101, y: 10, rot: 1}, {stat: "WallTower04", x: 101, y: 11}, {stat: "Emplacement-RotMor", x: 103, y: 9},
	{stat: "Emplacement-RotMor", x: 103, y: 11}, {stat: "Sys-SensoTower02", x: 100, y: 12}, {stat: "AASite-QuadRotMg", x: 107, y: 6},
	{stat: "Emplacement-Howitzer105", x: 109, y: 6}, {stat: "Emplacement-Howitzer105", x: 111, y: 7}, {stat: "Emplacement-RotMor", x: 105, y: 8},
	{stat: "Emplacement-RotMor", x: 105, y: 10}, {stat: "Sys-VTOL-RadarTower02", x: 107, y: 14}, {stat: "Sys-CB-Tower01", x: 109, y: 8},
	{stat: "Emplacement-Howitzer105", x: 109, y: 10}, {stat: "Emplacement-Howitzer105", x: 111, y: 9}, {stat: "Wall-RotMg", x: 108, y: 13},
	{stat: "A0HardcreteMk1Wall", x: 109, y: 13}, {stat: "A0HardcreteMk1Wall", x: 108, y: 14, rot: 1}, {stat: "WallTower04", x: 108, y: 15},
	{stat: "PillBoxHPC", x: 109, y: 15}, {stat: "A0HardcreteMk1Wall", x: 110, y: 13}, {stat: "WallTower04", x: 111, y: 13},
	{stat: "Wall-RotMg", x: 99, y: 19}, {stat: "GuardTower-HVC", x: 97, y: 20}, {stat: "AASite-QuadRotMg", x: 98, y: 20},
	{stat: "A0HardcreteMk1Wall", x: 100, y: 19}, {stat: "WallTower04", x: 101, y: 19}, {stat: "A0HardcreteMk1Gate", x: 102, y: 19},
	{stat: "A0HardcreteMk1Gate", x: 103, y: 19}, {stat: "PillBoxHPC", x: 101, y: 20}, {stat: "A0HardcreteMk1Gate", x: 104, y: 19},
	{stat: "WallTower04", x: 105, y: 19}, {stat: "A0HardcreteMk1Wall", x: 106, y: 19}, {stat: "A0HardcreteMk1Wall", x: 107, y: 19},
	{stat: "PillBoxHPC", x: 105, y: 20}, {stat: "A0HardcreteMk1Gate", x: 108, y: 16, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 108, y: 17, rot: 1},
	{stat: "A0HardcreteMk1Gate", x: 108, y: 18, rot: 1}, {stat: "WallTower04", x: 108, y: 19}, {stat: "PillBoxHPC", x: 109, y: 19},
	{stat: "A0HardcreteMk1Wall", x: 108, y: 20, rot: 1}, {stat: "Wall-RotMg", x: 108, y: 21}, {stat: "A0HardcreteMk1Wall", x: 109, y: 21},
	{stat: "A0HardcreteMk1Wall", x: 110, y: 21}, {stat: "WallTower04", x: 111, y: 21}, {stat: "WallTower04", x: 114, y: 4},
	{stat: "A0HardcreteMk1Wall", x: 114, y: 5, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 114, y: 6, rot: 1}, {stat: "WallTower04", x: 114, y: 7},
	{stat: "A0HardcreteMk1Wall", x: 114, y: 8, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 114, y: 9, rot: 1}, {stat: "WallTower04", x: 114, y: 10},
	{stat: "A0HardcreteMk1Wall", x: 112, y: 13}, {stat: "WallTower04", x: 113, y: 13},
];
const camA4L6DeltaBase3Structs = [
	{stat: "WallTower04", x: 142, y: 56}, {stat: "GuardTower-RotMg", x: 142, y: 57}, {stat: "A0HardcreteMk1Wall", x: 143, y: 56},
	{stat: "AASite-QuadRotMg", x: 143, y: 59, rot: 3}, {stat: "Sys-SensoTower02", x: 143, y: 62}, {stat: "GuardTower-HVC", x: 147, y: 43},
	{stat: "Wall-RotMg", x: 144, y: 47}, {stat: "Pillbox-RotMG", x: 145, y: 46}, {stat: "AASite-QuadRotMg", x: 146, y: 45, rot: 3},
	{stat: "WallTower04", x: 148, y: 42}, {stat: "A0HardcreteMk1Wall", x: 149, y: 42}, {stat: "Sys-SensoTower02", x: 149, y: 43},
	{stat: "A0HardcreteMk1Wall", x: 150, y: 42}, {stat: "WallTower04", x: 151, y: 42}, {stat: "Emplacement-Howitzer105", x: 149, y: 45},
	{stat: "Emplacement-Howitzer105", x: 148, y: 47}, {stat: "Emplacement-Howitzer105", x: 150, y: 47}, {stat: "GuardTower-HVC", x: 152, y: 43},
	{stat: "AASite-QuadRotMg", x: 153, y: 45, rot: 1}, {stat: "Sys-VTOL-RadarTower02", x: 154, y: 47}, {stat: "A0HardcreteMk1Wall", x: 144, y: 48, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 144, y: 49, rot: 1}, {stat: "WallTower04", x: 144, y: 50}, {stat: "A0HardcreteMk1Gate", x: 144, y: 51, rot: 1},
	{stat: "AASite-QuadRotMg", x: 147, y: 49}, {stat: "A0HardcreteMk1Gate", x: 144, y: 52, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 144, y: 53, rot: 1},
	{stat: "WallTower04", x: 144, y: 54}, {stat: "A0HardcreteMk1Wall", x: 144, y: 55, rot: 1}, {stat: "Emplacement-Howitzer105", x: 149, y: 49},
	{stat: "Sys-CB-Tower01", x: 151, y: 49}, {stat: "A0RepairCentre3", x: 151, y: 53}, {stat: "A0RepairCentre3", x: 150, y: 55},
	{stat: "Wall-RotMg", x: 144, y: 56}, {stat: "Emplacement-Howitzer105", x: 147, y: 58}, {stat: "PillBoxHPC", x: 145, y: 63},
	{stat: "Emplacement-RotMor", x: 146, y: 61}, {stat: "Emplacement-Howitzer105", x: 149, y: 59}, {stat: "Emplacement-RotMor", x: 148, y: 61},
	{stat: "Emplacement-RotMor", x: 150, y: 62}, {stat: "A0RepairCentre3", x: 152, y: 55}, {stat: "WallTower04", x: 156, y: 48},
	{stat: "A0HardcreteMk1Wall", x: 157, y: 48}, {stat: "AASite-QuadRotMg", x: 156, y: 50, rot: 3}, {stat: "A0HardcreteMk1Wall", x: 158, y: 48},
	{stat: "Wall-RotMg", x: 159, y: 48}, {stat: "Emplacement-RotMor", x: 158, y: 50}, {stat: "Emplacement-RotMor", x: 157, y: 52},
	{stat: "Emplacement-RotMor", x: 159, y: 52}, {stat: "Wall-RotMg", x: 158, y: 54}, {stat: "A0HardcreteMk1Wall", x: 158, y: 55, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 159, y: 54}, {stat: "Emplacement-RotMor", x: 153, y: 62}, {stat: "Emplacement-RotMor", x: 155, y: 63},
	{stat: "WallTower04", x: 158, y: 56}, {stat: "A0HardcreteMk1Gate", x: 158, y: 57, rot: 1}, {stat: "A0HardcreteMk1Gate", x: 158, y: 58, rot: 1},
	{stat: "A0HardcreteMk1Gate", x: 158, y: 59, rot: 1}, {stat: "WallTower04", x: 158, y: 60}, {stat: "A0HardcreteMk1Wall", x: 158, y: 61, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 158, y: 62, rot: 1}, {stat: "Wall-RotMg", x: 158, y: 63}, {stat: "A0HardcreteMk1Wall", x: 160, y: 48},
	{stat: "A0HardcreteMk1Wall", x: 161, y: 48}, {stat: "Emplacement-RotMor", x: 160, y: 50}, {stat: "WallTower04", x: 162, y: 48},
	{stat: "Sys-SensoTower02", x: 163, y: 49}, {stat: "PillBoxHPC", x: 163, y: 51}, {stat: "A0HardcreteMk1Wall", x: 160, y: 54},
	{stat: "WallTower04", x: 161, y: 54}, {stat: "AASite-QuadRotMg", x: 162, y: 52, rot: 1}, {stat: "Wall-RotMg", x: 147, y: 64},
	{stat: "A0HardcreteMk1Wall", x: 148, y: 64}, {stat: "A0HardcreteMk1Wall", x: 149, y: 64}, {stat: "Wall-RotMg", x: 150, y: 64},
	{stat: "WallTower04", x: 152, y: 65}, {stat: "A0HardcreteMk1Gate", x: 153, y: 65}, {stat: "PillBoxHPC", x: 153, y: 66},
	{stat: "A0HardcreteMk1Wall", x: 154, y: 65}, {stat: "WallTower04", x: 155, y: 65}, {stat: "AASite-QuadRotMg", x: 157, y: 64},
];
const camA4L6DeltaBase4Structs = [
	{stat: "AASite-QuadRotMg", x: 193, y: 7, rot: 1}, {stat: "AASite-QuadRotMg", x: 193, y: 14, rot: 1}, {stat: "Pillbox-RotMG", x: 198, y: 11},
	{stat: "GuardTower-HVC", x: 196, y: 14, rot: 1}, {stat: "TankTrapC", x: 197, y: 14}, {stat: "TankTrapC", x: 197, y: 15},
	{stat: "GuardTower-HVC", x: 201, y: 9}, {stat: "TankTrapC", x: 201, y: 10}, {stat: "TankTrapC", x: 202, y: 10},
	{stat: "TankTrapC", x: 197, y: 16},
];
const camA4L6ColBase6Structs = [
	{stat: "PillBox6", x: 143, y: 49, rot: 3}, {stat: "PillBox6", x: 141, y: 55, rot: 3}, {stat: "WallTower04", x: 142, y: 54, rot: 3},
	{stat: "A0HardcreteMk1Wall", x: 142, y: 55, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 142, y: 56, rot: 1}, {stat: "WallTower04", x: 142, y: 57, rot: 3},
	{stat: "Emplacement-MRLHvy-pit", x: 143, y: 56}, {stat: "AASite-QuadBof", x: 143, y: 59, rot: 3}, {stat: "WallTower04", x: 143, y: 62},
	{stat: "AASite-QuadBof", x: 147, y: 43, rot: 3}, {stat: "WallTower04", x: 144, y: 47, rot: 3}, {stat: "AASite-QuadBof", x: 145, y: 46, rot: 2},
	{stat: "GuardTower-RotMg", x: 146, y: 45}, {stat: "Wall-VulcanCan", x: 148, y: 42, rot: 2}, {stat: "A0HardcreteMk1Wall", x: 149, y: 42},
	{stat: "A0HardcreteMk1Wall", x: 150, y: 42}, {stat: "Sys-SensoTower02", x: 150, y: 43}, {stat: "Wall-VulcanCan", x: 151, y: 42, rot: 2},
	{stat: "Emplacement-MRLHvy-pit", x: 149, y: 44}, {stat: "Emplacement-MortarPit02", x: 148, y: 46}, {stat: "Emplacement-MortarPit02", x: 151, y: 45},
	{stat: "Emplacement-MortarPit02", x: 150, y: 47}, {stat: "AASite-QuadBof", x: 152, y: 43, rot: 1}, {stat: "Pillbox-RotMG", x: 154, y: 43},
	{stat: "GuardTower-RotMg", x: 153, y: 45}, {stat: "Emplacement-MortarPit02", x: 152, y: 47}, {stat: "AASite-QuadBof", x: 154, y: 47, rot: 2},
	{stat: "Pillbox-RotMG", x: 158, y: 42}, {stat: "A0ResourceExtractor", x: 157, y: 43}, {stat: "A0HardcreteMk1Wall", x: 144, y: 48, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 144, y: 49, rot: 1}, {stat: "Emplacement-MRLHvy-pit", x: 145, y: 48}, {stat: "WallTower04", x: 144, y: 50, rot: 3},
	{stat: "PillBoxHPC", x: 147, y: 49}, {stat: "Tower-Projector", x: 145, y: 53, rot: 3}, {stat: "Emplacement-MortarPit02", x: 148, y: 48},
	{stat: "WallTower-HvATrocket", x: 149, y: 51}, {stat: "Emplacement-MortarPit02", x: 151, y: 49}, {stat: "Emplacement-Howitzer105", x: 145, y: 58},
	{stat: "Emplacement-Howitzer105", x: 147, y: 56}, {stat: "GuardTower-RotMg", x: 144, y: 60}, {stat: "A0HardcreteMk1Wall", x: 144, y: 62},
	{stat: "WallTower-HvATrocket", x: 145, y: 62}, {stat: "AASite-QuadBof", x: 145, y: 63}, {stat: "Sys-SensoTower02", x: 147, y: 62},
	{stat: "Sys-CB-Tower01", x: 149, y: 56}, {stat: "Emplacement-Howitzer105", x: 148, y: 59}, {stat: "Emplacement-Howitzer105", x: 150, y: 57},
	{stat: "Emplacement-MRLHvy-pit", x: 149, y: 63}, {stat: "Emplacement-Howitzer105", x: 151, y: 60}, {stat: "Emplacement-MortarPit02", x: 153, y: 50},
	{stat: "WallTower04", x: 154, y: 48, rot: 2}, {stat: "A0HardcreteMk1Wall", x: 155, y: 48}, {stat: "A0RepairCentre3", x: 152, y: 54},
	{stat: "A0HardcreteMk1Wall", x: 156, y: 48}, {stat: "Emplacement-MRLHvy-pit", x: 156, y: 49}, {stat: "Wall-VulcanCan", x: 157, y: 48, rot: 2},
	{stat: "A0HardcreteMk1Wall", x: 158, y: 48}, {stat: "Wall-VulcanCan", x: 159, y: 48, rot: 2}, {stat: "Pillbox-RotMG", x: 156, y: 52},
	{stat: "WallTower04", x: 158, y: 54}, {stat: "A0HardcreteMk1Wall", x: 159, y: 54}, {stat: "PillBoxHPC", x: 153, y: 59},
	{stat: "WallTower-HvATrocket", x: 155, y: 57}, {stat: "Emplacement-MRLHvy-pit", x: 155, y: 62}, {stat: "WallTower04", x: 156, y: 61, rot: 1},
	{stat: "A0HardcreteMk1Wall", x: 156, y: 62, rot: 1}, {stat: "WallTower-HvATrocket", x: 156, y: 63}, {stat: "A0HardcreteMk1Wall", x: 157, y: 63},
	{stat: "Pillbox-RotMG", x: 158, y: 61}, {stat: "WallTower04", x: 158, y: 63, rot: 1}, {stat: "A0HardcreteMk1Wall", x: 160, y: 48},
	{stat: "Emplacement-MRLHvy-pit", x: 160, y: 49}, {stat: "A0HardcreteMk1Wall", x: 161, y: 48}, {stat: "WallTower04", x: 162, y: 48, rot: 2},
	{stat: "AASite-QuadBof", x: 163, y: 49, rot: 1}, {stat: "Pillbox-RotMG", x: 163, y: 51}, {stat: "Emplacement-MRLHvy-pit", x: 160, y: 53},
	{stat: "A0HardcreteMk1Wall", x: 160, y: 54}, {stat: "Tower-Projector", x: 160, y: 55}, {stat: "WallTower04", x: 161, y: 54},
	{stat: "AASite-QuadBof", x: 162, y: 52, rot: 1}, {stat: "Wall-VulcanCan", x: 147, y: 64}, {stat: "A0HardcreteMk1Wall", x: 148, y: 64},
	{stat: "A0HardcreteMk1Wall", x: 149, y: 64}, {stat: "Wall-VulcanCan", x: 150, y: 64}, {stat: "AASite-QuadBof", x: 152, y: 65},
	{stat: "PillBoxHPC", x: 153, y: 66}, {stat: "AASite-QuadBof", x: 155, y: 65}, {stat: "AASite-QuadBof", x: 157, y: 64},
];
const camA4L6ColLZ1Structs = [
	{stat: "WallTower04", x: 173, y: 87, rot: 3}, {stat: "A0HardcreteMk1Wall", x: 173, y: 88, rot: 3}, {stat: "WallTower04", x: 173, y: 89, rot: 3},
	{stat: "Tower-Projector", x: 176, y: 83}, {stat: "A0ResourceExtractor", x: 177, y: 83}, {stat: "Sys-SensoTower02", x: 178, y: 83},
	{stat: "AASite-QuadBof", x: 177, y: 84}, {stat: "WallTower-HvATrocket", x: 180, y: 86}, {stat: "WallTower-HvATrocket", x: 176, y: 90},
	{stat: "Pillbox-RotMG", x: 180, y: 90},
];
const camA4L6ColLZ2Structs = [
	{stat: "WallTower04", x: 150, y: 15}, {stat: "Emplacement-MRLHvy-pit", x: 153, y: 14}, {stat: "WallTower04", x: 155, y: 12},
	{stat: "AASite-QuadRotMg", x: 159, y: 12}, {stat: "A0HardcreteMk1Wall", x: 150, y: 16, rot: 1}, {stat: "WallTower04", x: 150, y: 17},
	{stat: "Tower-Projector", x: 155, y: 16}, {stat: "WallTower04", x: 153, y: 21}, {stat: "A0HardcreteMk1Wall", x: 153, y: 22, rot: 1},
	{stat: "WallTower04", x: 153, y: 23}, {stat: "Emplacement-MRLHvy-pit", x: 157, y: 19}, {stat: "WallTower04", x: 159, y: 16},
	{stat: "A0ResourceExtractor", x: 158, y: 18},
];
const camA4L6ColLZ3Structs = [
	{stat: "AASite-QuadBof", x: 115, y: 44, rot: 2}, {stat: "PillBoxHPC", x: 118, y: 43}, {stat: "AASite-QuadBof", x: 116, y: 45, rot: 1},
	{stat: "Emplacement-MortarPit02", x: 116, y: 47}, {stat: "AASite-QuadBof", x: 124, y: 38, rot: 3}, {stat: "AASite-QuadBof", x: 125, y: 39},
	{stat: "WallTower-HvATrocket", x: 121, y: 42}, {stat: "PillBoxHPC", x: 122, y: 40}, {stat: "GuardTower-RotMg", x: 121, y: 46},
	{stat: "GuardTower-RotMg", x: 125, y: 42}, {stat: "Tower-Projector", x: 125, y: 46}, {stat: "Emplacement-MortarPit02", x: 117, y: 49},
	{stat: "Sys-SensoTower02", x: 116, y: 51}, {stat: "Emplacement-MortarPit02", x: 119, y: 48}, {stat: "Emplacement-MortarPit02", x: 119, y: 51},
	{stat: "Emplacement-MortarPit02", x: 121, y: 50}, {stat: "Emplacement-MortarPit02", x: 120, y: 53}, {stat: "WallTower04", x: 124, y: 51},
	{stat: "A0HardcreteMk1Wall", x: 124, y: 52, rot: 1}, {stat: "WallTower04", x: 124, y: 53}, {stat: "WallTower04", x: 120, y: 56},
	{stat: "A0HardcreteMk1Wall", x: 121, y: 56}, {stat: "WallTower04", x: 122, y: 56}, {stat: "WallTower04", x: 128, y: 46},
	{stat: "A0HardcreteMk1Wall", x: 128, y: 47, rot: 1}, {stat: "WallTower04", x: 128, y: 48},
];
const camA4L6ColLZ4Structs = [
	{stat: "Tower-Projector", x: 73, y: 6}, {stat: "WallTower04", x: 74, y: 5}, {stat: "A0HardcreteMk1Wall", x: 74, y: 6, rot: 1},
	{stat: "WallTower04", x: 74, y: 7}, {stat: "Emplacement-MRLHvy-pit", x: 75, y: 7}, {stat: "Emplacement-MortarPit02", x: 78, y: 4},
	{stat: "Emplacement-MortarPit02", x: 80, y: 3}, {stat: "Emplacement-MortarPit02", x: 81, y: 5}, {stat: "Pillbox-RotMG", x: 80, y: 7},
	{stat: "Emplacement-MortarPit02", x: 83, y: 4}, {stat: "WallTower04", x: 86, y: 3}, {stat: "WallTower-HvATrocket", x: 86, y: 7},
	{stat: "Sys-SensoTower02", x: 83, y: 8}, {stat: "Pillbox-RotMG", x: 86, y: 10}, {stat: "WallTower04", x: 90, y: 3},
	{stat: "WallTower04", x: 90, y: 7}, {stat: "Pillbox-RotMG", x: 90, y: 10}, {stat: "WallTower04", x: 92, y: 10},
	{stat: "A0HardcreteMk1Wall", x: 93, y: 10}, {stat: "Tower-Projector", x: 93, y: 11}, {stat: "WallTower04", x: 94, y: 10},
	{stat: "AASite-QuadBof", x: 77, y: 6}, {stat: "AASite-QuadBof", x: 92, y: 6},
];
const camA4L6ColLZ5Structs = [
	{stat: "WallTower04", x: 103, y: 73}, {stat: "A0HardcreteMk1Wall", x: 103, y: 74, rot: 1}, {stat: "WallTower04", x: 103, y: 75},
	{stat: "TankTrapC", x: 102, y: 77}, {stat: "TankTrapC", x: 102, y: 78}, {stat: "GuardTower-RotMg", x: 103, y: 78},
	{stat: "WallTower04", x: 106, y: 69}, {stat: "A0HardcreteMk1Wall", x: 107, y: 69}, {stat: "Tower-Projector", x: 107, y: 70},
	{stat: "TankTrapC", x: 110, y: 67}, {stat: "TankTrapC", x: 111, y: 67}, {stat: "WallTower04", x: 108, y: 69},
	{stat: "AASite-QuadBof", x: 110, y: 68}, {stat: "Sys-SensoTower02", x: 104, y: 73}, {stat: "Emplacement-MRLHvy-pit", x: 104, y: 75},
	{stat: "WallTower04", x: 108, y: 74}, {stat: "WallTower04", x: 108, y: 78}, {stat: "WallTower-HvATrocket", x: 106, y: 82},
	{stat: "Emplacement-MortarPit02", x: 108, y: 80}, {stat: "AASite-QuadBof", x: 108, y: 83, rot: 2}, {stat: "Emplacement-MortarPit02", x: 110, y: 81},
	{stat: "AASite-QuadBof", x: 111, y: 83, rot: 2}, {stat: "TankTrapC", x: 108, y: 84}, {stat: "TankTrapC", x: 109, y: 84},
	{stat: "TankTrapC", x: 110, y: 84}, {stat: "TankTrapC", x: 111, y: 84}, {stat: "TankTrapC", x: 112, y: 67},
	{stat: "AASite-QuadBof", x: 112, y: 68}, {stat: "WallTower04", x: 112, y: 74}, {stat: "WallTower04", x: 112, y: 78},
	{stat: "Emplacement-MortarPit02", x: 112, y: 80}, {stat: "WallTower04", x: 112, y: 83}, {stat: "Sys-SensoTower02", x: 113, y: 82},
	{stat: "A0HardcreteMk1Wall", x: 113, y: 83}, {stat: "Emplacement-MortarPit02", x: 114, y: 81}, {stat: "WallTower04", x: 114, y: 83},
];
const camA4L6ColLZ6Structs = [
	{stat: "Pillbox-RotMG", x: 71, y: 42}, {stat: "WallTower04", x: 70, y: 45}, {stat: "A0HardcreteMk1Wall", x: 70, y: 46, rot: 1},
	{stat: "WallTower04", x: 70, y: 47}, {stat: "A0HardcreteMk1Wall", x: 71, y: 47}, {stat: "Emplacement-MortarPit02", x: 73, y: 38},
	{stat: "Emplacement-MortarPit02", x: 75, y: 39}, {stat: "AASite-QuadBof", x: 76, y: 37, rot: 2}, {stat: "Tower-Projector", x: 78, y: 37, rot: 2},
	{stat: "Emplacement-MortarPit02", x: 79, y: 39}, {stat: "Emplacement-MortarPit02", x: 73, y: 40}, {stat: "Emplacement-MRLHvy-pit", x: 75, y: 42},
	{stat: "WallTower04", x: 72, y: 47}, {stat: "Pillbox-RotMG", x: 75, y: 46}, {stat: "Emplacement-MortarPit02", x: 77, y: 40},
	{stat: "Emplacement-MortarPit02", x: 78, y: 42}, {stat: "A0ResourceExtractor", x: 78, y: 43}, {stat: "AASite-QuadBof", x: 78, y: 49, rot: 3},
	{stat: "Sys-SensoTower02", x: 79, y: 48}, {stat: "TankTrapC", x: 78, y: 50}, {stat: "TankTrapC", x: 79, y: 50},
	{stat: "AASite-QuadBof", x: 81, y: 43, rot: 3}, {stat: "AASite-QuadBof", x: 80, y: 46, rot: 3}, {stat: "Emplacement-Howitzer105", x: 82, y: 46},
	{stat: "Emplacement-Howitzer105", x: 81, y: 48}, {stat: "PillBoxHPC", x: 80, y: 50}, {stat: "TankTrapC", x: 83, y: 50},
	{stat: "TankTrapC", x: 83, y: 51}, {stat: "GuardTower-RotMg", x: 84, y: 50}, {stat: "Sys-CB-Tower01", x: 79, y: 44},
];