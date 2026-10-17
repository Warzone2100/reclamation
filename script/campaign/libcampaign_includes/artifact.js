
////////////////////////////////////////////////////////////////////////////////
// Artifacts management.
////////////////////////////////////////////////////////////////////////////////

//;; ## camSetArtifacts(artifacts)
//;;
//;; Tell `libcampaign.js` to manage a certain set of artifacts.
//;; The argument is a JavaScript map from object labels to artifact description.
//;; If the label points to a game object, artifact will be placed when this object
//;; is destroyed; if the label is a position, the artifact will be placed instantly.
//;; Artifact description is a JavaScript object with the following fields:
//;; * `tech` The technology to grant when the artifact is recovered.
//;;   Note that this can be made into an array to make artifacts give out
//;;   more than one technology, if desired.
//;;   On `let me win` cheat, all technologies stored in the artifacts
//;;   managed by this function are automatically granted.
//;;   Additionally, this function would call special event callbacks if they are defined
//;;   in your script, which should be named as follows, where LABEL is the artifact label:
//;; * `camArtifactPickup_LABEL` Called when the player picks up the artifact.
//;;
//;; @param {Object} artifacts
//;; @returns {void}
//;;
function camSetArtifacts(artifacts)
{
	__camArtifacts = artifacts;
	for (const alabel in __camArtifacts)
	{
		camAddArtifact(alabel);
	}
}

//;; ## camAddArtifact(artifact)
//;;
//;; Adds a single artifact to manage. If an artifact for this 
//;; label already exists, it will be replaced.
//;;
//;; @param {Object} artifact
//;; @returns {void}
//;;
function camAddArtifact(artifact)
{
	let alabel;

	// Artifact object from level script?
	if (artifact instanceof Object)
	{
		const keys = Object.keys(artifact);
		if (keys.length !== 1)
		{
			camDebug("Only one artifact can be added at a time");
			return;
		}
		alabel = keys[0];
		__camArtifacts[alabel] = artifact[alabel];
	}
	else if (camIsString(artifact))
	{
		alabel = artifact;
	}
	else
	{
		camDebug("unknown artifact type");
		return;
	}

	camTrace("Adding artifact", alabel);
	const ai = __camArtifacts[alabel];
	const pos = camMakePos(alabel);
	if (camDef(pos.id))
	{
		if (getObject(alabel).type === FEATURE && getObject(alabel).stattype === ARTIFACT)
		{
			// artifact object given
			addLabel(getObject(alabel), __camGetArtifactLabel(alabel));
			ai.placed = true;
		}
		else
		{
			// will place when object with this id is destroyed
			ai.id = "" + pos.id;
			ai.placed = false;
		}
	}
	else
	{
		// received position or area, place immediately
		const acrate = addFeature("Crate", pos.x, pos.y);
		addLabel(acrate, __camGetArtifactLabel(alabel));
		ai.placed = true;
	}
}

//;; ## camDeleteArtifact(artiLabel)
//;;
//;; Deletes the artifact from the list of managed artifacts.
//;;
//;; @param {String} artiLabel
//;; @returns {void}
//;;
function camDeleteArtifact(artiLabel, warnIfNotFound)
{
	if (!camDef(warnIfNotFound))
	{
		warnIfNotFound = true;
	}
	if (!camDef(artiLabel))
	{
		camDebug("Tried to delete undefined artifact label");
		return;
	}
	if (!(artiLabel in __camArtifacts))
	{
		if (warnIfNotFound)
		{
			camDebug("Artifact label doesn't exist in list of artifacts");
		}
		return;
	}
	if (__camArtifacts[artiLabel].placed)
	{
		const obj = getObject(__camGetArtifactLabel(artiLabel));
		if (camDef(obj) && obj !== null)
		{
			camSafeRemoveObject(obj, false);
		}
	}
	delete __camArtifacts[artiLabel];
}

//;; ## camAllArtifactsPickedUp()
//;;
//;; Returns `true` if all artifacts managed by `libcampaign.js` were picked up.
//;;
//;; @returns {boolean}
//;;
function camAllArtifactsPickedUp()
{
	// FIXME: O(n) lookup here
	return __camNumArtifacts >= Object.keys(__camArtifacts).length;
}

//;; ## camGetArtifacts()
//;;
//;; Returns the labels of all existing artifacts.
//;;
//;; @returns {Object[]}
//;;
function camGetArtifacts()
{
	const camArti = [];
	for (const alabel in __camArtifacts)
	{
		const artifact = __camArtifacts[alabel];
		const __LIB_LABEL = __camGetArtifactLabel(alabel);
		//libcampaign managed artifact that was placed on the map.
		if (artifact.placed && getObject(__LIB_LABEL) !== null)
		{
			camArti.push(__LIB_LABEL);
		}
		//Label for artifacts that will drop after an object gets destroyed. Or is manually managed.
		//NOTE: Must check for ID since "alabel" could be a AREA/POSITION label.
		const obj = getObject(alabel);
		if (obj !== null && camDef(obj.id))
		{
			camArti.push(alabel);
		}
	}
	return camArti;
}

//////////// privates

function __camGetArtifactLabel(alabel)
{
	return alabel + "_artifact_label";
}

function __camGetArtifactKey(objlabel)
{
	return objlabel.replace("_artifact_label", "");
}

// called from eventDestroyed
function __camCheckPlaceArtifact(obj)
{
	// FIXME: O(n) lookup here
	const __ALABEL = getLabel(obj);
	if (!camDef(__ALABEL) || !__ALABEL)
	{
		return;
	}
	const ai = __camArtifacts[__ALABEL];
	if (!camDef(ai))
	{
		return;
	}
	if (ai.placed)
	{
		camDebug("Object to which artifact", __ALABEL, "is bound, has died twice");
		return;
	}
	if (ai.tech instanceof Array)
	{
		camTrace("Placing multi-tech granting artifact");
		for (let i = 0; i < ai.tech.length; ++i)
		{
			const __TECH_STRING = ai.tech[i];
			camTrace(i, ":", __TECH_STRING);
		}
	}
	else
	{
		camTrace("Placing", ai.tech);
	}
	const acrate = addFeature("Crate", obj.x, obj.y);
	addLabel(acrate, __camGetArtifactLabel(__ALABEL));
	ai.placed = true;
}

function __camPickupArtifact(artifact)
{
	if (artifact.stattype !== ARTIFACT)
	{
		camDebug("Not an artifact");
		return;
	}
	// FIXME: O(n) lookup here
	const __ALABEL = __camGetArtifactKey(getLabel(artifact));
	const ai = __camArtifacts[__ALABEL];
	if (!camDef(__ALABEL) || !__ALABEL || !camDef(ai))
	{
		camTrace("Artifact", artifact.id, "is not managed");
		return;
	}
	if (Object.hasOwn(ai, "pickedUp") && ai.pickedUp === true)
	{
		camTrace("Already picked up the artifact", __ALABEL);
		return;
	}
	ai.pickedUp = true;

	camTrace("Picked up", ai.tech);
	playSound(cam_sounds.artifactRecovered);
	// artifacts are not self-removing...
	camSafeRemoveObject(artifact);
	if (ai.tech instanceof Array)
	{
		for (let i = 0; i < ai.tech.length; ++i)
		{
			const __TECH_STRING = ai.tech[i];
			enableResearch(__TECH_STRING);
		}
	}
	else
	{
		enableResearch(ai.tech);
	}
	// bump counter before the callback, so that it was
	// actual during the callback
	++__camNumArtifacts;
	const callback = __camGlobalContext()["camArtifactPickup_" + __ALABEL];
	if (camDef(callback))
	{
		callback();
	}

	__camSetupConsoleForVictoryConditions();
}

// Temporarily hide an artifact when an enemy truck picks it up.
// Check back in a few seconds and see if we can replace the artifact or stash it inside a structure.
function __camStoreArtifact(artifact)
{
	if (artifact.stattype !== ARTIFACT)
	{
		camDebug("Not an artifact");
		return;
	}
	// FIXME: O(n) lookup here
	const __ALABEL = __camGetArtifactKey(getLabel(artifact));
	const ai = __camArtifacts[__ALABEL];
	if (!camDef(__ALABEL) || !__ALABEL || !camDef(ai))
	{
		camTrace("Artifact", artifact.id, "is not managed");
		return;
	}
	if (Object.hasOwn(ai, "pickedUp") && ai.pickedUp === true)
	{
		camTrace("Already picked up the artifact", __ALABEL);
		return;
	}
	ai.placed = false;
	// Store the position of this artifact
	ai.pos = camMakePos(artifact);

	camTrace("Storing ", ai.tech);
	// Remove the artifact
	camSafeRemoveObject(artifact);

	// Check back on this artifact in a few seconds
	queue("__camCheckArtifactObject", camSecondsToMilliseconds(10), __ALABEL);
}

function __camCheckArtifactObject(aLabel)
{
	const ai = __camArtifacts[aLabel];
	const obj = getObject(ai.pos.x, ai.pos.y);
	if (obj === null)
	{
		// Nothing on the artifact position, simply replace the artifact object
		const acrate = addFeature("Crate", ai.pos.x, ai.pos.y);
		addLabel(acrate, __camGetArtifactLabel(aLabel));
		ai.placed = true;
		return;
	}
	if (obj.type === STRUCTURE && obj.status === BUILT)
	{
		// Fully built structure here, place the artifact inside
		// First, check if this structure already has a label
		// FIXME: O(n) lookup here
		const objLabel = getLabel(obj);

		if (!camDef(objLabel) || !objLabel)
		{
			// No label, give it the artifact label
			addLabel(obj, aLabel);
			return; // All done, the structure will re-drop the artifact when destroyed
		}
		else // Object already has a label
		{
			if (!camDef(__camArtifacts[objLabel]))
			{
				// Object has no artifact assigned
				// Transfer the artifact data to this label
				camAddArtifact({objLabel: ai.tech}); // TODO: Make sure this works!
			}
			else if (aLabel !== objLabel)
			{
				// Object already has a different artifact assigned
				// Merge the technologies of these two artifacts into one
				if (!(__camArtifacts[objLabel].tech instanceof Array))
				{
					__camArtifacts[objLabel].tech = [__camArtifacts[objLabel].tech];
				}
				if (!(ai.tech instanceof Array))
				{
					ai.tech = [ai.tech];
				}
				__camArtifacts[objLabel].tech = __camArtifacts[objLabel].tech.concat(ai.tech);

				// Remove the old artifact
				delete __camArtifacts[aLabel];
			}

			// If this structure already has the same label as the artifact (objLabel === aLabal), then we don't need to do anything

			return; // All done
		}
	}

	// Wait a bit longer, then check again (partially built structure?)
	queue("__camCheckArtifactObject", camSecondsToMilliseconds(2), aLabel);
}

function __camLetMeWinArtifacts()
{
	for (const alabel in __camArtifacts)
	{
		const ai = __camArtifacts[alabel];
		if (ai.placed)
		{
			const __LABEL = __camGetArtifactLabel(alabel);
			const artifact = getObject(__LABEL);
			if (!camDef(artifact) || !artifact)
			{
				continue;
			}
			__camPickupArtifact(artifact);
		}
		else
		{
			if (ai.tech instanceof Array)
			{
				for (let i = 0; i < ai.tech.length; ++i)
				{
					const __TECH_STRING = ai.tech[i];
					enableResearch(__TECH_STRING);
				}
			}
			else
			{
				enableResearch(ai.tech);
			}
		}
	}
}
