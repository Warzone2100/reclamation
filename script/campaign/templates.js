var cTempl = {
////////////////////////////////////////////////////////////////////////////////

// Reclamation Campaign
// Player Units:
truck: { body: "Body1REC", prop: "wheeled01", weap: "Spade1Mk1" }, // Truck Viper Wheels
plmgw: { body: "Body1REC", prop: "wheeled01", weap: "MG1Mk1" }, // Machinegun Viper Wheels

// Scavenger Units:
bloke: { body: "B1BaBaPerson01", prop: "BaBaLegs", weap: "BabaMG" }, // Bloke
kevbloke: { body: "B1BaBaPerson01-Kev", prop: "BaBaLegs", weap: "BabaMG" }, // Armored Bloke
trike: { body: "B4body-sml-trike01", prop: "BaBaProp", weap: "BabaTrikeMG" }, // Trike
buggy: { body: "B3body-sml-buggy01", prop: "BaBaProp", weap: "BabaBuggyMG" }, // Buggy
bjeep: { body: "B2JeepBody", prop: "BaBaProp", weap: "BabaJeepMG" }, // Jeep
rbjeep: { body: "B2RKJeepBody", prop: "BaBaProp", weap: "BabaRocket" }, // Rocket Jeep
rbuggy: { body: "B3bodyRKbuggy01", prop: "BaBaProp", weap: "BabaRocket" }, // Rocket Buggy
civ: { body: "CivilianBody", prop: "BaBaLegs", weap: "InfestedMelee" }, // Civilian
helcan: { body: "ScavengerChopper", prop: "Helicopter", weap: "RustCannon1-VTOL" }, // Light Cannon Helicopter
helhmg: { body: "ScavengerChopper", prop: "Helicopter", weap: "RustMG3-VTOL" }, // HMG Helicopter
moncan: { body: "MonsterBus", prop: "tracked01", weap: "RustCannon1Mk1" }, // Light Cannon Monster Bus Tank
monhmg: { body: "MonsterBus", prop: "tracked01", weap: "RustMG3Mk1" }, // HMG Monster Bus Tank
monmrl: { body: "MonsterBus", prop: "tracked01", weap: "RustRocket-MRL" }, // MRA Monster Bus Tank
monsar: { body: "MonsterBus", prop: "tracked01", weap: "RustRocket-LtA-TMk1" }, // Sarissa Monster Bus Tank
buscan: { body: "BusBody", prop: "BaBaProp", weap: "RustCannon1Mk1" }, // Light Cannon school bus
firetruck: { body: "FireBody", prop: "BaBaProp", weap: "RustFlame1Mk1" }, // Flamer firetruck
minitruck: { body: "FireBody", prop: "BaBaProp", weap: "RustRocket-Pod" }, // Mini-Rocket Pod firetruck
sartruck: { body: "FireBody", prop: "BaBaProp", weap: "RustRocket-LtA-TMk1" }, // Sarissa firetruck
lance: { body: "BaBaLanceBody", prop: "BaBaLegs", weap: "BabaLance" }, // Rocket scav
kevlance: { body: "BaBaLanceBody-Kev", prop: "BaBaLegs", weap: "BabaLance" }, // Armored Rocket scav

// Infested Units:
infciv: { body: "InfestedCivilianBody", prop: "BaBaLegs", weap: "InfestedMelee" }, // Infested civilian (melee unit)
infciv2: { body: "InfestedCivilianBodyAlt", prop: "BaBaLegs", weap: "InfestedMelee" }, // Infested civilian (alternate animation)
infbloke: { body: "InfestedScavBody", prop: "BaBaLegs", weap: "BabaMG" }, // Infested bloke
infkevbloke: { body: "InfestedScavBody-Kev", prop: "BaBaLegs", weap: "BabaMG" }, // Infested Armored bloke
inflance: { body: "InfestedLanceBody", prop: "BaBaLegs", weap: "BabaLance" }, // Infested rocket scav
infkevlance: { body: "InfestedLanceBody-Kev", prop: "BaBaLegs", weap: "BabaLance" }, // Infested Armored rocket scav
infhelcan: { body: "InfestedScavengerChopper", prop: "Helicopter", weap: "InfRustCannon1-VTOL" }, // Infested Light Cannon Helicopter
infhelhmg: { body: "InfestedScavengerChopper", prop: "Helicopter", weap: "InfRustMG3-VTOL" }, // Infested HMG Helicopter
infmoncan: { body: "InfestedMonsterBus", prop: "tracked01", weap: "InfRustCannon1Mk1" }, // Infested Light Cannon Monster Bus Tank
infmonhmg: { body: "InfestedMonsterBus", prop: "tracked01", weap: "InfRustMG3Mk1" }, // Infested HMG Monster Bus Tank
infmonmrl: { body: "InfestedMonsterBus", prop: "tracked01", weap: "InfRustRocket-MRL" }, // Infested MRL Monster Bus Tank
infmonsar: { body: "InfestedMonsterBus", prop: "tracked01", weap: "InfRustRocket-LtA-TMk1" }, // Infested Sarissa Monster Bus Tank
infbuscan: { body: "InfestedBusBody", prop: "BaBaProp", weap: "InfRustCannon1Mk1" }, // Infested Light Cannon school bus
inffiretruck: { body: "InfestedFireBody", prop: "BaBaProp", weap: "InfRustFlame1Mk1" }, // Infested Flamer firetruck
infminitruck: { body: "InfestedFireBody", prop: "BaBaProp", weap: "InfRustRocket-Pod" }, // Infested Mini-Rocket Pod firetruck
infsartruck: { body: "InfestedFireBody", prop: "BaBaProp", weap: "InfRustRocket-LtA-TMk1" }, // Infested Sarissa firetruck
inftrike: { body: "Infestedtrike01", prop: "BaBaProp", weap: "BabaTrikeMG" }, // Infested Trike
infbuggy: { body: "Infestedsml-buggy01", prop: "BaBaProp", weap: "BabaBuggyMG" }, // Infested Buggy
infrbuggy: { body: "InfestedRKbuggy01", prop: "BaBaProp", weap: "InfBabaRocket" }, // Infested Rocket Buggy
infbjeep: { body: "InfestedJeepBody", prop: "BaBaProp", weap: "InfJeepMG" }, // Infested Jeep
infrbjeep: { body: "InfestedRKJeepBody", prop: "BaBaProp", weap: "InfBabaRocket" }, // Infested Rocket Jeep
stinger: { body: "CrawlerBody", prop: "CyborgLegs", weap: "StingerTail" }, // Stinger Crawler
vilestinger: { body: "CrawlerBody", prop: "CyborgLegs", weap: "VileStingerTail" }, // Vile Stinger Crawler
boomtick: { body: "BoomTickBody", prop: "BoomTickLegs", weap: "BoomTickSac" }, // Boom Tick Crawler


// Reclamation 2 Campaign
// Player/Allied Units:
pllcanw: { body: "Body1REC", prop: "wheeled01", weap: "Cannon1Mk1" }, // Light Cannon Viper Wheels
pllcanht: { body: "Body1REC", prop: "HalfTrack", weap: "Cannon1Mk1" }, // Light Cannon Viper Half-tracks
pllcant: { body: "Body1REC", prop: "tracked01", weap: "Cannon1Mk1" }, // Light Cannon Viper Tracks
plmmcant: { body: "Body5REC", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Medium Cannon Cobra Tracks
plmhpvht: { body: "Body5REC", prop: "HalfTrack", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Cobra Half-tracks
plmhpvt: { body: "Body5REC", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Cobra Tracks
plmacanht: { body: "Body5REC", prop: "HalfTrack", weap: "Cannon5VulcanMk1" }, // Assault Cannon Cobra Half-Tracks
plmacant: { body: "Body5REC", prop: "tracked01", weap: "Cannon5VulcanMk1" }, // Assault Cannon Cobra Tracks
plhhpvt: { body: "Body11ABT", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Python Tracks
plhacant: { body: "Body11ABT", prop: "tracked01", weap: "Cannon5VulcanMk1" }, // Assault Cannon Python Tracks
plhacanht: { body: "Body11ABT", prop: "HalfTrack", weap: "Cannon5VulcanMk1" }, // Assault Cannon Python Half-tracks
plhhcant: { body: "Body11ABT", prop: "tracked01", weap: "Cannon375mmMk1" }, // Heavy Cannon Python Tracks
plhhcanh: { body: "Body11ABT", prop: "hover01", weap: "Cannon375mmMk1" }, // Heavy Cannon Python Hover

pllmortw: { body: "Body1REC", prop: "wheeled01", weap: "Mortar1Mk1" }, // Mortar Viper Wheels
pllmortt: { body: "Body1REC", prop: "tracked01", weap: "Mortar1Mk1" }, // Mortar Viper Tracks
plmhmortw: { body: "Body5REC", prop: "wheeled01", weap: "Mortar2Mk1" }, // Bombard Cobra Wheels
plmhmortt: { body: "Body5REC", prop: "tracked01", weap: "Mortar2Mk1" }, // Bombard Cobra Tracks
plmrmortt: { body: "Body5REC", prop: "tracked01", weap: "Mortar3ROTARYMk1" }, // Pepperpot Cobra Tracks
plhrmortht: { body: "Body11ABT", prop: "HalfTrack", weap: "Mortar3ROTARYMk1" }, // Pepperpot Python Half-tracks
plhrmortt: { body: "Body11ABT", prop: "tracked01", weap: "Mortar3ROTARYMk1" }, // Pepperpot Python Tracks
plhrmorth: { body: "Body11ABT", prop: "hover01", weap: "Mortar3ROTARYMk1" }, // Pepperpot Python Hover
plhhowt: { body: "Body11ABT", prop: "tracked01", weap: "Howitzer105Mk1" }, // Howitzer Python Tracks
plhript: { body: "Body11ABT", prop: "tracked01", weap: "Rocket-IDF" }, // Ripple Rocket Python Tracks

pllmraw: { body: "Body1REC", prop: "wheeled01", weap: "Rocket-MRL" }, // Mini-Rocket Array Viper Wheels
pllmraht: { body: "Body1REC", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Viper Half-tracks
pllmrat: { body: "Body1REC", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Viper Tracks
plmmraht: { body: "Body5REC", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Cobra Half-tracks
plmmrat: { body: "Body5REC", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Cobra Tracks
plhhraht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Python Half-tracks
plhhrat: { body: "Body11ABT", prop: "tracked01", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Python Tracks

plhbalht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-Ballista" }, // Ballista Python Half-tracks
plhbalh: { body: "Body11ABT", prop: "hover01", weap: "Rocket-Ballista" }, // Ballista Python Hover

pllpodw: { body: "Body1REC", prop: "wheeled01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Viper Wheels
pllpodht: { body: "Body1REC", prop: "HalfTrack", weap: "Rocket-Pod" }, // Mini-Rocket Pod Viper Half-tracks
pllpodt: { body: "Body1REC", prop: "tracked01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Viper Tracks
plmpodht: { body: "Body5REC", prop: "HalfTrack", weap: "Rocket-Pod" }, // Mini-Rocket Pod Cobra Half-tracks
pllsarw: { body: "Body1REC", prop: "wheeled01", weap: "Rocket-LtA-TMk1" }, // Sarissa Viper Wheels
pllsart: { body: "Body1REC", prop: "tracked01", weap: "Rocket-LtA-TMk1" }, // Sarissa Viper Tracks
plllanht: { body: "Body1REC", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Viper Half-tracks
plllant: { body: "Body1REC", prop: "tracked01", weap: "Rocket-LtA-T" }, // Lancer Viper Tracks
plmatht: { body: "Body5REC", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Cobra Half-tracks
plmatt: { body: "Body5REC", prop: "tracked01", weap: "Rocket-LtA-T" }, // Lancer Cobra Tracks
plmhatw: { body: "Body5REC", prop: "wheeled01", weap: "Rocket-HvyA-T" }, // Tank Killer Cobra Wheels
plmhatht: { body: "Body5REC", prop: "HalfTrack", weap: "Rocket-HvyA-T" }, // Tank Killer Cobra Half-tracks
plmhatt: { body: "Body5REC", prop: "tracked01", weap: "Rocket-HvyA-T" }, // Tank Killer Cobra Tracks
plhhatw: { body: "Body11ABT", prop: "wheeled01", weap: "Rocket-HvyA-T" }, // Tank Killer Python Wheels
plhhatht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-HvyA-T" }, // Tank Killer Python Half-tracks
plhhatt: { body: "Body11ABT", prop: "tracked01", weap: "Rocket-HvyA-T" }, // Tank Killer Python Tracks
plhhath: { body: "Body11ABT", prop: "hover01", weap: "Rocket-HvyA-T" }, // Tank Killer Python Hover

pllaaw: { body: "Body1REC", prop: "wheeled01", weap: "QuadMg1AAGun" }, // Hurricane Viper Wheels
plmhaaht: { body: "Body5REC", prop: "HalfTrack", weap: "AAGun2Mk1" }, // Cyclone Cobra Half-tracks
plmhaat: { body: "Body5REC", prop: "tracked01", weap: "AAGun2Mk1" }, // Cyclone Cobra Tracks
plhhaaht: { body: "Body11ABT", prop: "HalfTrack", weap: "AAGun2Mk1" }, // Cyclone Python Half-tracks
plhhaat: { body: "Body11ABT", prop: "tracked01", weap: "AAGun2Mk1" }, // Cyclone Python Tracks
plhraat: { body: "Body11ABT", prop: "tracked01", weap: "QuadRotAAGun" }, // Whirlwind Python Tracks
plhraaht: { body: "Body11ABT", prop: "HalfTrack", weap: "QuadRotAAGun" }, // Whirlwind Python Half-tracks

pllrepw: { body: "Body1REC", prop: "wheeled01", weap: "LightRepair1" }, // Repair Turret Viper Wheels
pllrept: { body: "Body1REC", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Viper Tracks
plmrepht: { body: "Body5REC", prop: "HalfTrack", weap: "LightRepair1" }, // Repair Turret Cobra HalfTracks
plmrept: { body: "Body5REC", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Cobra Tracks
plhrepht: { body: "Body11ABT", prop: "HalfTrack", weap: "LightRepair1" }, // Repair Turret Python Half-tracks
plhrept: { body: "Body11ABT", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Python Tracks
// plmhrept: { body: "Body5REC", prop: "tracked01", weap: "HeavyRepair" }, // Heavy Repair Turret Cobra Tracks
// plhhrepht: { body: "Body11ABT", prop: "HalfTrack", weap: "HeavyRepair" }, // Heavy Repair Turret Python Half-tracks
// plhhrept: { body: "Body11ABT", prop: "tracked01", weap: "HeavyRepair" }, // Heavy Repair Turret Python Tracks

plltmgt: { body: "Body1REC", prop: "tracked01", weap: "MG2Mk1" }, // Twin Machinegun Viper Tracks
pllhmght: { body: "Body1REC", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Viper Half-tracks
plmhmght: { body: "Body5REC", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Cobra Half-tracks
plhasgnht: { body: "Body11ABT", prop: "HalfTrack", weap: "MG4ROTARYMk1" }, // Assault Gun Python Half-tracks
plhasgnt: { body: "Body11ABT", prop: "tracked01", weap: "MG4ROTARYMk1" }, // Assault Gun Python Tracks

pllcomht: { body: "Body1REC", prop: "HalfTrack", weap: "CommandBrain01" }, // Command Turret Viper Half-tracks
plmcomht: { body: "Body5REC", prop: "HalfTrack", weap: "CommandBrain01" }, // Command Turret Cobra Half-tracks
plhcomw: { body: "Body11ABT", prop: "wheeled01", weap: "CommandBrain01" }, // Command Turret Python Wheels
plhcomht: { body: "Body11ABT", prop: "HalfTrack", weap: "CommandBrain01" }, // Command Turret Python Half-tracks
plhcomt: { body: "Body11ABT", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Python Tracks
plhcomh: { body: "Body11ABT", prop: "hover01", weap: "CommandBrain01" }, // Command Turret Python Hover

pllflamt: { body: "Body1REC", prop: "tracked01", weap: "Flame1Mk1" }, // Flamer Viper Tracks
plhinfw: { body: "Body11ABT", prop: "wheeled01", weap: "Flame2" }, // Inferno Python Wheels
plhinfht: { body: "Body11ABT", prop: "HalfTrack", weap: "Flame2" }, // Inferno Python Half-tracks
plhinfh: { body: "Body11ABT", prop: "hover01", weap: "Flame2" }, // Inferno Python Hover

pllsenst: { body: "Body1REC", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Viper Tracks
pllstrikeht: { body: "Body1REC", prop: "HalfTrack", weap: "Sys-VstrikeTurret01" }, // VTOL Strike Turret Viper Half-tracks
plmsenst: { body: "Body5REC", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Cobra Tracks
plhsenst: { body: "Body11ABT", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Python Tracks
plhsensht: { body: "Body11ABT", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Python Half-tracks
plhsensh: { body: "Body11ABT", prop: "hover01", weap: "SensorTurret1Mk1" }, // Sensor Python Hover
plhstrikeht: { body: "Body11ABT", prop: "HalfTrack", weap: "Sys-VstrikeTurret01" }, // VTOL Strike Turret Python Half-tracks
plhstriket: { body: "Body11ABT", prop: "tracked01", weap: "Sys-VstrikeTurret01" }, // VTOL Strike Turret Python Tracks

plltruckht: { body: "Body1REC", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Viper Half-tracks
plltruckt: { body: "Body1REC", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Viper Tracks
plmtruckht: { body: "Body5REC", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Cobra Half-tracks
plmtruckt: { body: "Body5REC", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Cobra Tracks
plmtruckh: { body: "Body5REC", prop: "hover01", weap: "Spade1Mk1" }, // Truck Cobra Hover
plhtruckht: { body: "Body11ABT", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Python Half-tracks
plhtruckt: { body: "Body11ABT", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Python Tracks
plhtruckh: { body: "Body11ABT", prop: "hover01", weap: "Spade1Mk1" }, // Truck Python Hover

plmbbht: { body: "Body5REC", prop: "HalfTrack", weap: "Rocket-BB" }, // Bunker Buster Cobra Half-tracks
plhbbw: { body: "Body11ABT", prop: "wheeled01", weap: "Rocket-BB" }, // Bunker Buster Python Wheels
plhbbht: { body: "Body11ABT", prop: "HalfTrack", weap: "Rocket-BB" }, // Bunker Buster Python Half-tracks
plhbbt: { body: "Body11ABT", prop: "tracked01", weap: "Rocket-BB" }, // Bunker Buster Python Tracks
plhbbh: { body: "Body11ABT", prop: "hover01", weap: "Rocket-BB" }, // Bunker Buster Python Hover

pllcanv: { body: "Body1REC", prop: "V-Tol", weap: "Cannon1-VTOL" }, // Light Cannon Viper VTOL
pllpodv: { body: "Body1REC", prop: "V-Tol", weap: "Rocket-VTOL-Pod" }, // Mini-Rocket Pod Viper VTOL
pllhmgv: { body: "Body1REC", prop: "V-Tol", weap: "MG3-VTOL" }, // Heavy Machinegun Viper VTOL
pllsarv: { body: "Body1REC", prop: "V-Tol", weap: "Rocket-VTOL-LtA-TMk1" }, // Sarissa Viper VTOL
plllanv: { body: "Body1REC", prop: "V-Tol", weap: "Rocket-VTOL-LtA-T" }, // Lancer Viper VTOL
pllbombv: { body: "Body1REC", prop: "V-Tol", weap: "Bomb1-VTOL-LtHE" }, // Cluster Bomb Viper VTOL
pllagv: { body: "Body1REC", prop: "V-Tol", weap: "MG4ROTARY-VTOL" }, // Assault Gun Viper VTOL
pllbbv: { body: "Body1REC", prop: "V-Tol", weap: "Rocket-VTOL-BB" }, // Bunker Buster Viper VTOL
plmbbv: { body: "Body5REC", prop: "V-Tol", weap: "Rocket-VTOL-BB" }, // Bunker Buster Cobra VTOL
plmhatv: { body: "Body5REC", prop: "V-Tol", weap: "Rocket-VTOL-HvyA-T" }, // Tank Killer Cobra VTOL
plmagv: { body: "Body5REC", prop: "V-Tol", weap: "MG4ROTARY-VTOL" }, // Assault Gun Cobra VTOL
plmhpvv: { body: "Body5REC", prop: "V-Tol", weap: "Cannon4AUTO-VTOL" }, // Hyper Velocity Cannon Cobra VTOL
plmacanv: { body: "Body5REC", prop: "V-Tol", weap: "Cannon5Vulcan-VTOL" }, // Assault Cannon Cobra VTOL
plmbombv: { body: "Body5REC", prop: "V-Tol", weap: "Bomb1-VTOL-LtHE" }, // Cluster Bomb Cobra VTOL
plmphosv: { body: "Body5REC", prop: "V-Tol", weap: "Bomb3-VTOL-LtINC" }, // Phosphor Bomb Cobra VTOL
plmhbombv: { body: "Body5REC", prop: "V-Tol", weap: "Bomb2-VTOL-HvHE" }, // HEAP Bomb Cobra VTOL
plmtbombv: { body: "Body5REC", prop: "V-Tol", weap: "Bomb4-VTOL-HvyINC" }, // Thermite Bomb Cobra VTOL
plhhbombv: { body: "Body11ABT", prop: "V-Tol", weap: "Bomb2-VTOL-HvHE" }, // HEAP Bomb Python VTOL
plhacanv: { body: "Body11ABT", prop: "V-Tol", weap: "Cannon5Vulcan-VTOL" }, // Assault Cannon Python VTOL

// Cyborgs:
cybrp: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRepair" }, // Mechanic Cyborg
cyben: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgSpade" }, // Combat Engineer Cyborg
cybmg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgChaingun" }, // Machinegunner Cyborg
cybhg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgHeavyChaingun" }, // Heavy Machinegunner Cyborg
cybag: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRotMG" }, // Assault Gunner Cyborg
cybfl: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgFlamer01" }, // Flamer Cyborg
cybth: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Thermite" }, // Thermite Flamer Cyborg
cybmr: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-MRL" }, // Mini-Rocket Cyborg
scyhr: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-HRA" }, // Super Heavy Rocket Cyborg
cybgr: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Grenade" }, // Grenadier Cyborg
scygr: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Grenade" }, // Super Heavy Grenadier Cyborg
cybsa: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgLtRocket" }, // Sarissa Cyborg
cybla: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgRocket" }, // Lancer Cyborg
scytk: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-TK" }, // Super Tank-Killer Cyborg
cybca: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "CyborgCannon" }, // Heavy Gunner Cyborg
scymc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Mcannon" }, // Super Heavy-Gunner Cyborg
scyhc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-HPV" }, // Super HPC Cyborg
scyac: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "Cyb-Hvywpn-Acannon" }, // Super Auto-Cannon Cyborg
cybls: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "Cyb-Wpn-Laser" }, // Flashlight Gunner Cyborg
nxcyrail: { body: "CybNXRail1Jmp", prop: "CyborgLegs02", weap: "NX-Cyb-Rail1" }, // NEXUS Needle Cyborg
nxcyscou: { body: "CybNXMissJmp", prop: "CyborgLegs02", weap: "NX-CyborgMiss" }, // NEXUS Scourge Cyborg
nxcylas: { body: "CybNXPulseLasJmp", prop: "CyborgLegs02", weap: "NX-CyborgLas" }, // NEXUS Flashlight Cyborg

// Scavenger Units:
flatmrl: { body: "ScavTruckBody", prop: "BaBaProp", weap: ["RustRocket-Pod", "RustRocket-MRL"] }, // MRA Flatbed Truck
flatat: { body: "ScavTruckBody", prop: "BaBaProp", weap: ["RustRocket-Pod", "RustRocket-LtA-T"] }, // Lancer Flatbed Truck
gbjeep: { body: "B2RKJeepBody", prop: "BaBaProp", weap: "BabaMiniMortar" }, // Grenade Jeep
helpod: { body: "ScavengerHvyChopper", prop: "Helicopter", weap: "RustRocket-Pod-VTOL" }, // MRP Helicopter
monfire: { body: "MonsterFireBody", prop: "tracked01", weap: "RustFlame1Mk1" }, // Monster Fire Truck
monlan: { body: "MonsterBus", prop: "tracked01", weap: "RustRocket-LtA-T" }, // Lancer Monster Bus Tank
monmcan: { body: "MonsterBus", prop: "tracked01", weap: "RustCannon2A-TMk1" }, // Medium Cannon Monster Bus Tank
crane: { body: "ScavCraneBody", prop: "HalfTrack", weap: "ScavCrane" }, // Scavenger Crane (Constructor)

// Infested Units:
infgbjeep: { body: "InfestedRKJeepBody", prop: "BaBaProp", weap: "InfBabaMiniMortar" }, // Infested Grenade Jeep
infmonlan: { body: "InfestedMonsterBus", prop: "tracked01", weap: "InfRustRocket-LtA-T" }, // Infested Lancer Monster Bus Tank
infflatmrl: { body: "InfScavTruckBody", prop: "BaBaProp", weap: ["InfRustRocket-Pod", "InfRustRocket-MRL"] }, // Infested MRA Flatbed Truck
infflatat: { body: "InfScavTruckBody", prop: "BaBaProp", weap: ["InfRustRocket-Pod", "InfRustRocket-LtA-T"] }, // Infested Lancer Flatbed Truck
infhelpod: { body: "InfScavengerHvyChopper", prop: "Helicopter", weap: "InfRustRocket-Pod-VTOL" }, // Infested MRP Helicopter

infcybmg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "InfCyborgChaingun" }, // Infested Machinegunner Cyborg
infcybhg: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "InfCyborgHeavyChaingun" }, // Infested Heavy Machinegunner Cyborg
infcybag: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "InfCyborgRotMG" }, // Infested Assault Gunner Cyborg
infcybfl: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "InfCyborgFlamer01" }, // Infested Flamer Cyborg
infcybth: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "InfCyb-Wpn-Thermite" }, // Infested Thermite Flamer Cyborg
infcybmr: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "InfCyb-Wpn-MRL" }, // Infested Mini-Rocket Cyborg
infscyhr: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "InfCyb-Hvywpn-HRA" }, // Infested Super Heavy Rocket Cyborg
infcybgr: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "InfCyb-Wpn-Grenade" }, // Infested Grenadier Cyborg
infscygr: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "InfCyb-Hvywpn-Grenade" }, // Infested Super Heavy Grenadier Cyborg
infcybla: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "InfCyborgRocket" }, // Infested Lancer Cyborg
infscytk: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "InfCyb-Hvywpn-TK" }, // Infested Super Tank-Killer Cyborg
infcybca: { body: "CyborgLightBody", prop: "CyborgLegs", weap: "InfCyborgCannon" }, // Infested Heavy Gunner Cyborg
infscymc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "InfCyb-Hvywpn-Mcannon" }, // Infested Super Heavy-Gunner Cyborg
infscyhc: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "InfCyb-Hvywpn-HPV" }, // Infested Super HPC Cyborg
infscyac: { body: "CyborgHeavyBody", prop: "CyborgLegs", weap: "InfCyb-Hvywpn-Acannon" }, // Infested Super Auto-Cannon Cyborg

infcolcanht: { body: "InfBody2SUP", prop: "HalfTrack", weap: "InfCannon1Mk1" }, // Infested Light Cannon Leopard Half-tracks
infcolpodt: { body: "InfBody2SUP", prop: "tracked01", weap: "InfRocket-Pod" }, // Infested Mini-Rocket Pod Leopard Tracks
infcolhmght: { body: "InfBody2SUP", prop: "HalfTrack", weap: "InfMG3Mk1" }, // Infested Heavy Machinegun Leopard Half-tracks
infcolmrat: { body: "InfBody2SUP", prop: "tracked01", weap: "InfRocket-MRL" }, // Infested Mini-Rocket Array Leopard Tracks
infcolaaht: { body: "InfBody2SUP", prop: "HalfTrack", weap: "InfQuadMg1AAGun" }, // Infested Hurricane Leopard Half-tracks
infcomhmgt: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfMG3Mk1" }, // Infested Heavy Machinegun Panther Tracks
infcomatt: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfRocket-LtA-T" }, // Infested Lancer Panther Tracks
infcommrat: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfRocket-MRL" }, // Infested Mini-Rocket Array Panther Tracks
infcommcant: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfCannon2A-TMk1" }, // Infested Medium Cannon Panther Tracks
infcomhpvt: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfCannon4AUTOMk1" }, // Infested Hyper Velocity Cannon Panther Tracks
infcomacant: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfCannon5VulcanMk1" }, // Infested Assault Cannon Panther Tracks
infcomagt: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfMG4ROTARYMk1" }, // Infested Assault Gun Panther Tracks
infcominft: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfFlame2" }, // Infested Inferno Panther Tracks
infcomtruckht: { body: "InfBody6SUPP", prop: "HalfTrack", weap: "InfestedSpade1Trans" }, // Infested Truck Panther Half-tracks
infcomtruckt: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfestedSpade1Trans" }, // Infested Truck Panther Tracks
infcomhatt: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfRocket-HvyA-T" }, // Infested Tank Killer Panther Tracks
infcomhaat: { body: "InfBody6SUPP", prop: "tracked01", weap: "InfAAGun2Mk1" }, // Infested Cyclone Panther Tracks
infcohhcant: { body: "InfBody9REC", prop: "tracked01", weap: "InfCannon375mmMk1" }, // Infested Heavy Cannon Tiger Tracks
infcohhrat: { body: "InfBody9REC", prop: "tracked01", weap: "InfRocket-MRL-Hvy" }, // Infested Heavy Rocket Array Tiger Tracks

basher: { body: "BasherBody", prop: "BoomTickLegs", weap: "BasherMelee" }, // Basher

// Collective Units:
colpodw: { body: "Body2SUP", prop: "wheeled01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Leopard Wheels
colpodt: { body: "Body2SUP", prop: "tracked01", weap: "Rocket-Pod" }, // Mini-Rocket Pod Leopard Tracks
colatw: { body: "Body2SUP", prop: "wheeled01", weap: "Rocket-LtA-T" }, // Lancer Pod Leopard Wheels
compodht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-Pod" }, // Mini-Rocket Pod Panther Half-tracks
comatht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-LtA-T" }, // Lancer Panther Half-tracks
comatt: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-LtA-T" }, // Lancer Panther Tracks
comath: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-LtA-T" }, // Lancer Panther Hover
comhatht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-HvyA-T" }, // Tank Killer Panther Half-tracks
comhatt: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-HvyA-T" }, // Tank Killer Panther Tracks
comhath: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-HvyA-T" }, // Tank Killer Panther Hover
cohhatht: { body: "Body9REC", prop: "HalfTrack", weap: "Rocket-HvyA-T" }, // Tank Killer Tiger Half-tracks

combbht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-BB" }, // Bunker Buster Panther Half-tracks
combbh: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-BB" }, // Bunker Buster Panther Hover
cohbbht: { body: "Body9REC", prop: "HalfTrack", weap: "Rocket-BB" }, // Bunker Buster Tiger Half-tracks
cohbbt: { body: "Body9REC", prop: "tracked01", weap: "Rocket-BB" }, // Bunker Buster Tiger Tracks
cohbbh: { body: "Body9REC", prop: "hover01", weap: "Rocket-BB" }, // Bunker Buster Tiger Hover

colsensht: { body: "Body2SUP", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Leopard Half-tracks
colsenst: { body: "Body2SUP", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Leopard Tracks
comsensht: { body: "Body6SUPP", prop: "HalfTrack", weap: "SensorTurret1Mk1" }, // Sensor Panther Half-tracks
comsenst: { body: "Body6SUPP", prop: "tracked01", weap: "SensorTurret1Mk1" }, // Sensor Panther Tracks
comstriket: { body: "Body6SUPP", prop: "tracked01", weap: "Sys-VstrikeTurret01" }, // Sensor Panther Tracks
cohsensh: { body: "Body9REC", prop: "hover01", weap: "SensorTurret1Mk1" }, // Sensor Tiger Hover

coltruckht: { body: "Body2SUP", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Leopard Half-tracks
comtruckht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Spade1Mk1" }, // Truck Panther Half-tracks
comtruckt: { body: "Body6SUPP", prop: "tracked01", weap: "Spade1Mk1" }, // Truck Panther Tracks
cohtruckh: { body: "Body9REC", prop: "hover01", weap: "Spade1Mk1" }, // Truck Tiger Hover

colmortht: { body: "Body2SUP", prop: "HalfTrack", weap: "Mortar1Mk1" }, // Mortar Leopard Half-tracks
commortht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar1Mk1" }, // Mortar Panther Half-tracks
commortt: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar1Mk1" }, // Mortar Panther Tracks
comhmortht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar2Mk1" }, // Bombard Panther Half-tracks
comhmortt: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar2Mk1" }, // Bombard Panther Tracks
comrmortht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Mortar3ROTARYMk1" }, // Pepperpot Panther Half-tracks
comrmortt: { body: "Body6SUPP", prop: "tracked01", weap: "Mortar3ROTARYMk1" }, // Pepperpot Panther Tracks
cohrmorth: { body: "Body9REC", prop: "hover01", weap: "Mortar3ROTARYMk1" }, // Pepperpot Tiger Hover
cohhowt: { body: "Body9REC", prop: "tracked01", weap: "Howitzer105Mk1" }, // Howitzer Tiger Tracks
cohhhowtt: { body: "Body9REC", prop: "tracked01", weap: "Howitzer150Mk1" }, // Ground Shaker Tiger Tracks

colmraw: { body: "Body2SUP", prop: "wheeled01", weap: "Rocket-MRL" }, // Mini-Rocket Array Leopard Wheels
colmrat: { body: "Body2SUP", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Leopard Tracks
commraht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Half-tracks
commrat: { body: "Body6SUPP", prop: "tracked01", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Tracks
commrah: { body: "Body6SUPP", prop: "hover01", weap: "Rocket-MRL" }, // Mini-Rocket Array Panther Hover
cohhraht: { body: "Body9REC", prop: "HalfTrack", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Tiger Half-tracks
cohhrah: { body: "Body9REC", prop: "hover01", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Tiger Hover
cohhrat: { body: "Body9REC", prop: "tracked01", weap: "Rocket-MRL-Hvy" }, // Heavy Rocket Array Tiger Tracks
cohript: { body: "Body9REC", prop: "tracked01", weap: "Rocket-IDF" }, // Ripple Rocket Tiger Tracks

cohbalh: { body: "Body9REC", prop: "hover01", weap: "Rocket-Ballista" }, // Ballista Tiger Hover

colhmght: { body: "Body2SUP", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Leopard Half-tracks
colhmgt: { body: "Body2SUP", prop: "tracked01", weap: "MG3Mk1" }, // Heavy Machinegun Leopard Tracks
comhmght: { body: "Body6SUPP", prop: "HalfTrack", weap: "MG3Mk1" }, // Heavy Machinegun Panther Half-tracks
comhmgt: { body: "Body6SUPP", prop: "tracked01", weap: "MG3Mk1" }, // Heavy Machinegun Panther Tracks
comaght: { body: "Body6SUPP", prop: "HalfTrack", weap: "MG4ROTARYMk1" }, // Assault Gun Panther Half-tracks
comagt: { body: "Body6SUPP", prop: "tracked01", weap: "MG4ROTARYMk1" }, // Assault Gun Panther Tracks
cohasgnht: { body: "Body9REC", prop: "HalfTrack", weap: "MG4ROTARYMk1" }, // Assault Gun Tiger Half-tracks

colcanht: { body: "Body2SUP", prop: "HalfTrack", weap: "Cannon1Mk1" }, // Light Cannon Leopard Half-tracks
colmcant: { body: "Body2SUP", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Medium Cannon Leopard Tracks
commcant: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon2A-TMk1" }, // Medium Cannon Panther Tracks
comhpvht: { body: "Body6SUPP", prop: "HalfTrack", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Panther Half-tracks
comhpvt: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Panther Tracks
comhpvh: { body: "Body6SUPP", prop: "hover01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Panther Hover
comacant: { body: "Body6SUPP", prop: "tracked01", weap: "Cannon5VulcanMk1" }, // Assault Cannon Panther Tracks
cohhpvt: { body: "Body9REC", prop: "tracked01", weap: "Cannon4AUTOMk1" }, // Hyper Velocity Cannon Tiger Tracks
cohacant: { body: "Body9REC", prop: "tracked01", weap: "Cannon5VulcanMk1" }, // Assault Cannon Tiger Tracks
cohhcant: { body: "Body9REC", prop: "tracked01", weap: "Cannon375mmMk1" }, // Heavy Cannon Tiger Tracks
cohhcanh: { body: "Body9REC", prop: "hover01", weap: "Cannon375mmMk1" }, // Heavy Cannon Tiger Hover

colflamht: { body: "Body2SUP", prop: "HalfTrack", weap: "Flame1Mk1" }, // Flamer Leopard Half-tracks
colflamt: { body: "Body2SUP", prop: "tracked01", weap: "Flame1Mk1" }, // Flamer Leopard Tracks
cominft: { body: "Body6SUPP", prop: "tracked01", weap: "Flame2" }, // Inferno Panther Tracks
cominfh: { body: "Body6SUPP", prop: "hover01", weap: "Flame2" }, // Inferno Panther Hover
cohinfh: { body: "Body9REC", prop: "hover01", weap: "Flame2" }, // Inferno Tiger Hover

colrepht: { body: "Body2SUP", prop: "HalfTrack", weap: "LightRepair1" }, // Repair Turret Leopard Half-tracks
colrept: { body: "Body2SUP", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Leopard Tracks
comrepht: { body: "Body6SUPP", prop: "HalfTrack", weap: "LightRepair1" }, // Repair Turret Panther Half-tracks
comrept: { body: "Body6SUPP", prop: "tracked01", weap: "LightRepair1" }, // Repair Turret Panther Tracks
// comhrepht: { body: "Body6SUPP", prop: "HalfTrack", weap: "HeavyRepair" }, // Heavy Repair Turret Panther Half-tracks
// comhrept: { body: "Body6SUPP", prop: "tracked01", weap: "HeavyRepair" }, // Heavy Repair Turret Panther Tracks

colaaht: { body: "Body2SUP", prop: "HalfTrack", weap: "QuadMg1AAGun" }, // Hurricane Leopard Half-tracks
comaaht: { body: "Body6SUPP", prop: "HalfTrack", weap: "QuadMg1AAGun" }, // Hurricane Panther Half-tracks
comaat: { body: "Body6SUPP", prop: "tracked01", weap: "QuadMg1AAGun" }, // Hurricane Panther Tracks
comhaaht: { body: "Body6SUPP", prop: "HalfTrack", weap: "AAGun2Mk1" }, // Cyclone Panther Half-tracks
comhaat: { body: "Body6SUPP", prop: "tracked01", weap: "AAGun2Mk1" }, // Cyclone Panther Tracks
cohraat: { body: "Body9REC", prop: "tracked01", weap: "QuadRotAAGun" }, // Whirlwind Tiger Tracks

comsamt: { body: "Body6SUPP", prop: "tracked01", weap: "Missile-LtSAM" }, // Avenger SAM Panther Tracks

comcomt: { body: "Body6SUPP", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Panther Tracks
cohcomt: { body: "Body9REC", prop: "tracked01", weap: "CommandBrain01" }, // Command Turret Tiger Tracks
cohcomht: { body: "Body9REC", prop: "HalfTrack", weap: "CommandBrain01" }, // Command Turret Tiger Half-tracks
cohcomh: { body: "Body9REC", prop: "hover01", weap: "CommandBrain01" }, // Command Turret Tiger Hover

colbombv: { body: "Body2SUP", prop: "V-Tol", weap: "Bomb1-VTOL-LtHE" }, // Cluster Bomb Leopard VTOL
colphosv: { body: "Body2SUP", prop: "V-Tol", weap: "Bomb3-VTOL-LtINC" }, // Phosphor Bomb Leopard VTOL
colatv: { body: "Body2SUP", prop: "V-Tol", weap: "Rocket-VTOL-LtA-T" }, // Lancer Leopard VTOL
colpodv: { body: "Body2SUP", prop: "V-Tol", weap: "Rocket-VTOL-Pod" }, // Mini-Rocket Pod Leopard VTOL
colcanv: { body: "Body2SUP", prop: "V-Tol", weap: "Cannon1-VTOL" }, // Light Cannon Leopard VTOL
colhpvv: { body: "Body2SUP", prop: "V-Tol", weap: "Cannon4AUTO-VTOL" }, // Hyper Velocity Cannon Leopard VTOL
colhmgv: { body: "Body2SUP", prop: "V-Tol", weap: "MG3-VTOL" }, // Heavy Machinegun Leopard VTOL
colagv: { body: "Body2SUP", prop: "V-Tol", weap: "MG4ROTARY-VTOL" }, // Assault Gun Leopard VTOL

comagv: { body: "Body6SUPP", prop: "V-Tol", weap: "MG4ROTARY-VTOL" }, // Assault Gun Panther VTOL
combombv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb1-VTOL-LtHE" }, // Cluster Bomb Panther VTOL
comhbombv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb2-VTOL-HvHE" }, // HEAP Bomb Panther VTOL
comphosv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb3-VTOL-LtINC" }, // Phosphor Bomb Panther VTOL
comthermv: { body: "Body6SUPP", prop: "V-Tol", weap: "Bomb4-VTOL-HvyINC" }, // Thermite Bomb Panther VTOL
comhatv: { body: "Body6SUPP", prop: "V-Tol", weap: "Rocket-VTOL-HvyA-T" }, // Tank Killer Panther VTOL
combbv: { body: "Body6SUPP", prop: "V-Tol", weap: "Rocket-VTOL-BB" }, // Bunker Buster Panther VTOL
comacanv: { body: "Body6SUPP", prop: "V-Tol", weap: "Cannon5Vulcan-VTOL" }, // Assault Cannon Panther VTOL

cohacanv: { body: "Body9REC", prop: "V-Tol", weap: "Cannon5Vulcan-VTOL" }, // Assault Cannon Tiger VTOL

// NEXUS Units
nxlsensh: { body: "Body3MBT", prop: "hover02", weap: "SensorTurret1Mk1" }, // Sensor Retaliation Hover
nxmsens: { body: "Body7ABT", prop: "hover02", weap: "SensorTurret1Mk1" }, // Sensor Retribution Hover

nxtruckh: { body: "Body7ABT", prop: "hover02", weap: "Spade1Mk1" }, // Truck Retribution Hover

nxmcommh: { body: "Body7ABT", prop: "hover02", weap: "CommandTurret1" }, // Command Turret Retribution Hover

nxllinkh: { body: "Body3MBT", prop: "hover02", weap: "NEXUSlink" }, // NEXUS Link Turret Retaliation Hover
nxmlinkh: { body: "Body7ABT", prop: "hover02", weap: "NEXUSlink" }, // NEXUS Link Turret Retribution Hover

nxlflash: { body: "Body3MBT", prop: "hover02", weap: "Laser3BEAMMk1" }, // Flashlight Retaliation Hover
nxmpulseh: { body: "Body7ABT", prop: "hover02", weap: "Laser2PULSEMk1" }, // Pulse Laser Retribution Hover

nxmserh: { body: "Body7ABT", prop: "hover02", weap: "Missile-MdArt" }, // Seraph Retribution Hover

nxmreph: { body: "Body7ABT", prop: "hover02", weap: "LightRepair1" }, // Repair Turret Retribution Hover

nxlneedh: { body: "Body3MBT", prop: "hover02", weap: "RailGun1Mk1" }, // Needle Gun Retaliation Hover
nxmrailh: { body: "Body7ABT", prop: "hover02", weap: "RailGun2Mk1" }, // Rail Gun Retribution Hover
nxhgauss: { body: "Body10MBT", prop: "hover02", weap: "RailGun3Mk1" }, // Gauss Cannon Vengeance Hover

nxmscouh: { body: "Body7ABT", prop: "hover02", weap: "Missile-A-T" }, // Scourge Missile Retribution Hover

nxmsamh: { body: "Body3MBT", prop: "hover02", weap: "Missile-LtSAM" }, // Avenger Retaliation Hover
nxmhsamh: { body: "Body7ABT", prop: "hover02", weap: "Missile-HvySAM" }, // Vindicator Retribution Hover

nxlneedv: { body: "Body3MBT", prop: "V-Tol02", weap: "RailGun1-VTOL" }, // Needle Gun Retaliation VTOL
nxlscouv: { body: "Body3MBT", prop: "V-Tol02", weap: "Missile-VTOL-AT" }, // Scourge Missile Retaliation VTOL
nxlpulsev: { body: "Body3MBT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" }, // Pulse Laser Retaliation VTOL

nxmtherv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb4-VTOL-HvyINC" }, // Thermite Bomb Retribution VTOL
nxmheapv: { body: "Body7ABT", prop: "V-Tol02", weap: "Bomb2-VTOL-HvHE" }, // HEAP Bomb Retribution VTOL
nxmpulsev: { body: "Body7ABT", prop: "V-Tol02", weap: "Laser2PULSE-VTOL" }, // Pulse Laser Retribution VTOL

nxhrailv: { body: "Body10MBT", prop: "V-Tol02", weap: "RailGun2-VTOL" }, // Rail Gun Vengeance VTOL
};
