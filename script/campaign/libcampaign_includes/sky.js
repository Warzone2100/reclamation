
////////////////////////////////////////////////////////////////////////////////
// Various sun, fog, and weather functions.
////////////////////////////////////////////////////////////////////////////////

//;; ## camSetFog(r, g, b)
//;; Changes the colour of the fog and stores its RGB values for save-loading.
//;; If no arguments are provided, sets the fog to its default RGB values.
//;;
//;; @param {number} r
//;; @param {number} g
//;; @param {number} b
//;; @returns {void}
//;;
function camSetFog(r, g, b)
{
	if (!camDef(r))
	{
		// No arguments provided; set fog to default color based on tileset
		if (tilesetType === "ARIZONA")
		{
			r = __camArizonaFogRGB.r;
			g = __camArizonaFogRGB.g;
			b = __camArizonaFogRGB.b;
		}
		else if (tilesetType === "URBAN")
		{
			r = __camUrbanFogRGB.r;
			g = __camUrbanFogRGB.g;
			b = __camUrbanFogRGB.b;
		}
		else if (tilesetType === "ROCKIES")
		{
			r = __camRockyFogRGB.r;
			g = __camRockyFogRGB.g;
			b = __camRockyFogRGB.b;
		}
	}

	__camFogRGB = {
		r: r, 
		g: g, 
		b: b
	};

	setFogColour(r, g, b);
}

//;; ## camSetSunPos(x, y, z)
//;; Changes the position of the sun and stores its XYZ values for save-loading.
//;; If no arguments are provided, sets the sun to its default XYZ values.
//;;
//;; @param {number} x
//;; @param {number} y
//;; @param {number} z
//;; @returns {void}
//;;
function camSetSunPos(x, y, z)
{
	if (!camDef(x))
	{
		// No arguments provided; set sun to default position
		x = __camDefaultSunStats.x;
		y = __camDefaultSunStats.y;
		z = __camDefaultSunStats.z;
	}

	// Sun coordinates and their corresponding sun directions (where the sun is relative to the world):
	// -x: EAST, +x: WEST
	// -y: UP, +y: DOWN
	// -z: NORTH, +z: SOUTH
	// (remember that shadows are casted in the OPPOSITE direction of the sun)
	__camSunStats.x = x;
	__camSunStats.y = y;
	__camSunStats.z = z;

	setSunPosition(x, y, z);
}

//;; ## camSetSunIntensity(ar, ag, ab[, dr, dg, db[, sr, sg, sb]])
//;; Changes the intensity of the sun and stores its RGB lighting values for save-loading.
//;; If only ambient RGB values are provided, then diffuse and specular values will be assigned
//;; 2x their respective ambient values.
//;; If only speculative RGB values are NOT provided, then they will be assigned the same values
//;; as their respective diffuse values.
//;; If no arguments are provided, sets the sun to its default RGB values.
//;;
//;; @param {number} ar
//;; @param {number} ag
//;; @param {number} ab
//;; @param {number} dr
//;; @param {number} dg
//;; @param {number} db
//;; @param {number} sr
//;; @param {number} sg
//;; @param {number} sb
//;; @returns {void}
//;;
function camSetSunIntensity(ar, ag, ab, dr, dg, db, sr, sg, sb)
{
	if (!camDef(ar))
	{
		// No arguments provided; set sun to default intensity
		ar = __camDefaultSunStats.ar;
		ag = __camDefaultSunStats.ag;
		ab = __camDefaultSunStats.ab;
		dr = __camDefaultSunStats.dr;
		dg = __camDefaultSunStats.dg;
		db = __camDefaultSunStats.db;
		sr = __camDefaultSunStats.sr;
		sg = __camDefaultSunStats.sg;
		sb = __camDefaultSunStats.sb;
	}
	else if (!camDef(dr))
	{
		// Only ambient values provided
		dr = ar * 2;
		dg = ag * 2;
		db = ab * 2;
		sr = ar * 2;
		sg = ag * 2;
		sb = ab * 2;
	}
	else if (!camDef(sr))
	{
		// Ambient and diffuse values provided
		sr = dr;
		sg = dg;
		sb = db;
	}

	__camSunStats.ar = ar;
	__camSunStats.ag = ag;
	__camSunStats.ab = ab;
	__camSunStats.dr = dr;
	__camSunStats.dg = dg;
	__camSunStats.db = db;
	__camSunStats.sr = sr;
	__camSunStats.sg = sg;
	__camSunStats.sb = sb;

	setSunIntensity(
		__camSunStats.ar, __camSunStats.ag, __camSunStats.ab,
		__camSunStats.dr, __camSunStats.dg, __camSunStats.db,
		__camSunStats.sr, __camSunStats.sg, __camSunStats.sb
	);
}

//;; ## camGradualFog(time[, r, g, b])
//;; Gradually changes the current color of the fog towards the given values over the given timespan (in milliseconds).
//;; If no color arguments are provided, sets the fog to its default RGB values.
//;;
//;; @param {number} time
//;; @param {number} r
//;; @param {number} g
//;; @param {number} b
//;; @returns {void}
//;;
function camGradualFog(time, r, g, b)
{
	if (!camDef(r))
	{
		// No color arguments provided; set fog to default color based on tileset
		if (tilesetType === "ARIZONA")
		{
			r = __camArizonaFogRGB.r;
			g = __camArizonaFogRGB.g;
			b = __camArizonaFogRGB.b;
		}
		else if (tilesetType === "URBAN")
		{
			r = __camUrbanFogRGB.r;
			g = __camUrbanFogRGB.g;
			b = __camUrbanFogRGB.b;
		}
		else if (tilesetType === "ROCKIES")
		{
			r = __camRockyFogRGB.r;
			g = __camRockyFogRGB.g;
			b = __camRockyFogRGB.b;
		}
	}

	__camFogTargetRGB = {
		time: gameTime + time,
		r: r,
		g: g,
		b: b
	};
}

//;; ## camGradualSunIntensity(time[, ar, ag, ab[, dr, dg, db[, sr, sg, sb]]])
//;; Gradually changes the intensity of the sun towards the given values over the given timespan (in milliseconds).
//;; If no color arguments are provided, sets the sun to its default RGB values.
//;;
//;; @param {number} time
//;; @param {number} ar
//;; @param {number} ag
//;; @param {number} ab
//;; @param {number} dr
//;; @param {number} dg
//;; @param {number} db
//;; @param {number} sr
//;; @param {number} sg
//;; @param {number} sb
//;; @returns {void}
//;;
function camGradualSunIntensity(time, ar, ag, ab, dr, dg, db, sr, sg, sb)
{
	if (!camDef(ar))
	{
		// No intensity arguments provided; set sun to default intensity
		ar = __camDefaultSunStats.ar;
		ag = __camDefaultSunStats.ag;
		ab = __camDefaultSunStats.ab;
		dr = __camDefaultSunStats.dr;
		dg = __camDefaultSunStats.dg;
		db = __camDefaultSunStats.db;
		sr = __camDefaultSunStats.sr;
		sg = __camDefaultSunStats.sg;
		sb = __camDefaultSunStats.sb;
	}
	else if (!camDef(dr))
	{
		// Only ambient values provided
		dr = ar * 2;
		dg = ag * 2;
		db = ab * 2;
		sr = ar * 2;
		sg = ag * 2;
		sb = ab * 2;
	}
	else if (!camDef(sr))
	{
		// Ambient and diffuse values provided
		sr = dr;
		sg = dg;
		sb = db;
	}

	__camSunTargetIntensity = {
		time: gameTime + time,
		ar: ar,
		ag: ag,
		ab: ab,
		dr: dr,
		dg: dg,
		db: db,
		sr: sr,
		sg: sg,
		sb: sb
	};
}

//;; ## camSetWeather(weatherType)
//;; Sets the current weather type.
//;;
//;; @param {number} weatherType
//;; @returns {void}
//;;
function camSetWeather(weatherType)
{
	if (weatherType === CAM_WEATHER_DEFAULT)
	{
		// Set the default weather based on the tileset
		if (tilesetType === "ARIZONA")
		{
			weatherType = CAM_WEATHER_CLEAR;
		}
		else if (tilesetType === "URBAN")
		{
			weatherType = CAM_WEATHER_RAIN;
		}
		else if (tilesetType === "ROCKIES")
		{
			weatherType = CAM_WEATHER_SNOW;
		}
	}

	__camWeatherType = weatherType;

	__camWeatherCycle();
}

//;; ## camSetSkyType(skyType)
//;; Sets the current skybox type, either CAM_SKY_DAY, or CAM_SKY_NIGHT.
//;;
//;; @param {number} skyType
//;; @returns {void}
//;;
function camSetSkyType(skyType)
{
	if (camDef(skyType))
	{
		__camSkyboxType = skyType;
	}

	if (__camSkyboxType === CAM_SKY_NIGHT)
	{
		// Night-time skybox
		setSky(__camNightSkyTexture, 0.5, 10000.0);
	}
	else if (__camSkyboxType === CAM_SKY_ARIZONA)
	{
		// Arid skybox
		setSky(__camArizonaSkyTexture, 0.5, 10000.0);
	}
	else if (__camSkyboxType === CAM_SKY_URBAN)
	{
		// Blue skies & clouds
		setSky(__camUrbanSkyTexture, 0.5, 10000.0);
	}
	else // Automatically set daytime skybox based on tileset
	{
		if (tilesetType === "ARIZONA")
		{
			// Arid skybox
			setSky(__camArizonaSkyTexture, 0.5, 10000.0);
		}
		else
		{
			// Blue skies & clouds
			setSky(__camUrbanSkyTexture, 0.5, 10000.0);
		}
	}
}

function __camWeatherCycle()
{
    const RAND_WEATHER = camRand(100) > 33;
    switch (__camWeatherType)
    {
		case CAM_WEATHER_CLEAR: // Stop weather effects
			setWeather(WEATHER_CLEAR);
			return;
		case CAM_WEATHER_RAIN: // Chance of rain
			if (RAND_WEATHER)
			{
				setWeather(WEATHER_RAIN);
			}
			else
			{
				setWeather(WEATHER_CLEAR);
			}
			return;
		case CAM_WEATHER_RAINSTORM: // Constant rain
			setWeather(WEATHER_RAIN);
			return;
    	case CAM_WEATHER_SNOW: // Chance of snow
    		if (RAND_WEATHER)
    		{
    			setWeather(WEATHER_SNOW);
    		}
    		else
    		{
    			setWeather(WEATHER_CLEAR);
    		}
    		return;
    	case CAM_WEATHER_SNOWSTORM: // Constant snow
			setWeather(WEATHER_SNOW);
			return;
    }
}

// Move the current fog color/sun intensity towards the desired values
function __camGradualEffectsTick()
{
	// Adjust fog
	if (__camFogTargetRGB.time > gameTime)
	{
		// Calculate the remaining number of times the color can be incremented before the deadline
		const INCREMENTS_REMAINING = Math.floor((__camFogTargetRGB.time - gameTime) / __CAM_GRADUAL_TICK_RATE);

		// Calculate the new fog color by adding the difference between the target color and the current color, divided by the number of increments remaining
		const DELTA_R = (__camFogTargetRGB.r - __camFogRGB.r) / INCREMENTS_REMAINING;
		const DELTA_G = (__camFogTargetRGB.g - __camFogRGB.g) / INCREMENTS_REMAINING;
		const DELTA_B = (__camFogTargetRGB.b - __camFogRGB.b) / INCREMENTS_REMAINING;

		camSetFog(
			__camFogRGB.r + DELTA_R,
			__camFogRGB.g + DELTA_G,
			__camFogRGB.b + DELTA_B
		);
	}

	// Adjust sun intensity
	if (__camSunTargetIntensity.time > gameTime)
	{
		// Calculate the remaining number of times the intensity can be incremented before the deadline
		const INCREMENTS_REMAINING = Math.floor((__camSunTargetIntensity.time - gameTime) / __CAM_GRADUAL_TICK_RATE);

		// Calculate the new fog color by adding the difference between the target color and the current color, divided by the number of increments remaining
		const DELTA_AR = (__camSunTargetIntensity.ar - __camSunStats.ar) / INCREMENTS_REMAINING;
		const DELTA_AG = (__camSunTargetIntensity.ag - __camSunStats.ag) / INCREMENTS_REMAINING;
		const DELTA_AB = (__camSunTargetIntensity.ab - __camSunStats.ab) / INCREMENTS_REMAINING;
		const DELTA_DR = (__camSunTargetIntensity.dr - __camSunStats.dr) / INCREMENTS_REMAINING;
		const DELTA_DG = (__camSunTargetIntensity.dg - __camSunStats.dg) / INCREMENTS_REMAINING;
		const DELTA_DB = (__camSunTargetIntensity.db - __camSunStats.db) / INCREMENTS_REMAINING;
		const DELTA_SR = (__camSunTargetIntensity.sr - __camSunStats.sr) / INCREMENTS_REMAINING;
		const DELTA_SG = (__camSunTargetIntensity.sg - __camSunStats.sg) / INCREMENTS_REMAINING;
		const DELTA_SB = (__camSunTargetIntensity.sb - __camSunStats.sb) / INCREMENTS_REMAINING;

		camSetSunIntensity(
			__camSunStats.ar + DELTA_AR, 
			__camSunStats.ag + DELTA_AG, 
			__camSunStats.ab + DELTA_AB, 
			__camSunStats.dr + DELTA_DR, 
			__camSunStats.dg + DELTA_DG, 
			__camSunStats.db + DELTA_DB, 
			__camSunStats.sr + DELTA_SR, 
			__camSunStats.sg + DELTA_SG, 
			__camSunStats.sb + DELTA_SB
		);
	}
}