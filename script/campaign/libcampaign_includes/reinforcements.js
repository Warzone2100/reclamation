
////////////////////////////////////////////////////////////////////////////////
// Reinforcement related stuff.
////////////////////////////////////////////////////////////////////////////////

//;; ## camSendReinforcement(playerId, position, templates, kind[, data])
//;;
//;; Give a single bunch of droids (template list) for a player at a position label. Kind can be one of:
//;; * `CAM_REINFORCE_GROUND` Reinforcements magically appear on the ground.
//;; * `CAM_REINFORCE_TRANSPORT` Reinforcements are unloaded from a transporter.
//;;   **NOTE:** the game engine doesn't seem to support two simultaneous incoming transporters for the same player.
//;;   Avoid this at all costs!
//;;   The following data fields are required:
//;;   * `entry` Transporter entry position.
//;;   * `exit` Transporter exit position.
//;;   * `message` `PROX_MSG` to display when transport is landing.
//;;   * `order` Order to give to newly landed droids
//;;   * `data` Order data.
//;;   **NOTE:** the game engine doesn't seem to support two simultaneous incoming transporters for the same player.
//;;   If a transporter is already on map, it will be correctly queued up and sent later.
//;;   If the reinforcement type is CAM_REINFORCE_GROUND, this function will return the group ID of the newly created group. 
//;;
//;; @param {number} playerId
//;; @param {string|Object|undefined} position
//;; @param {Object[]} templates
//;; @param {number} kind
//;; @param {Object} [data]
//;; @returns {number|undefined} group
//;;
function camSendReinforcement(playerId, position, templates, kind, data)
{
	let pos = camMakePos(position);
	let order = CAM_ORDER_ATTACK;
	let order_data = { regroup: false, count: -1 };
	if (camDef(data) && camDef(data.order))
	{
		order = data.order;
		if (camDef(data.data))
		{
			order_data = data.data;
		}
	}
	if (playerId === CAM_INFESTED)
	{
		// Simplify order logic for Infested groups
		order_data.simplified = true; 
	}
	switch (kind)
	{
		case CAM_REINFORCE_GROUND:
		{
			const droids = [];
			for (let i = 0, l = templates.length; i < l; ++i)
			{
				if (camDef(position.x2))
				{
					// If position is an area, choose random coordinates inside of it
					pos = camRandPosIn(position);
				}

				const template = templates[i];
				const __PROP = template.prop;
				let droid;
				if (typeof template.weap === "object" && camDef(template.weap[2]))
				{
					droid = addDroid(playerId, pos.x, pos.y, camNameTemplate(template), template.body, __PROP, "", "", template.weap[0], template.weap[1], template.weap[2]);
				}
				else if (typeof template.weap === "object" && camDef(template.weap[1]))
				{
					droid = addDroid(playerId, pos.x, pos.y, camNameTemplate(template), template.body, __PROP, "", "", template.weap[0], template.weap[1]);
				}
				else
				{
					droid = addDroid(playerId, pos.x, pos.y, camNameTemplate(template), template.body, __PROP, "", "", template.weap);
				}
				
				__camPreDamageDroid(droid);
				droids.push(droid);
			}
			const __GROUP = camMakeGroup(droids);
			camManageGroup(__GROUP, order, order_data);
			return __GROUP;
		}
		case CAM_REINFORCE_TRANSPORT:
		{
			__camTransporterQueue.push({
				player: playerId,
				position: pos,
				list: templates,
				data: data,
				order: order,
				order_data: order_data,
				silent: data.silent
			});
			__camDispatchTransporterSafe();
			break;
		}
		default:
		{
			camTrace("Unknown reinforcement type");
			break;
		}
	}
}

//;; ## camSetBaseReinforcements(baseLabel, interval, callbackName, kind, data)
//;;
//;; Periodically brings reinforcements to an enemy base, until the base is eliminated.
//;; Interval is the pause, in milliseconds, between reinforcements.
//;; Callback is name of a function that returns a list of droid templates to spawn,
//;; which may be different every time. Kind and data work similarly to `camSendReinforcement()`.
//;; Use `CAM_REINFORCE_NONE` as kind to disable previously set reinforcements.
//;;
//;; @param {string} baseLabel
//;; @param {number} interval
//;; @param {string} callbackName
//;; @param {number} kind
//;; @param {Object} data
//;; @returns {void}
//;;
function camSetBaseReinforcements(baseLabel, interval, callbackName, kind, data)
{
	if (!camIsString(callbackName))
	{
		camDebug("Callback name must be a string (received", callbackName, ")");
	}
	const bi = __camEnemyBases[baseLabel];
	bi.reinforce_kind = kind;
	bi.reinforce_interval = interval;
	bi.reinforce_callback = callbackName;
	bi.reinforce_data = data;
}
