
////////////////////////////////////////////////////////////////////////////////
// Functions related to mid-mission messages (that aren't sequences)
////////////////////////////////////////////////////////////////////////////////


//;; ## camQueueDialogue(text, delay[, sound[, callback]])
//;;
//;; Queues up a dialogue, consisting of the text to be displayed, 
//;; the delay (in seconds), and the sound file to be played (if any).
//;; NOTE: Delay is amount of time to wait AFTER playing the previous dialogue,
//;; NOT how long to wait after this function is called
//;; If defined, callback is the name of a script function to call at the time of the dialogue.
//;; Useful for syncing script events to specific dialogue texts.
//;;
//;; @param {string|Object|Object[]} text
//;; @param {number} delay
//;; @param {string} sound
//;; @param {string} callback
//;; @returns {void}
//;;
function camQueueDialogue(text, delay, sound, callback)
{
	if (text instanceof Array)
	{
		for (const diaInfo of text)
		{
			const text = diaInfo.text;
			const delay = camSecondsToMilliseconds(diaInfo.delay);
			const sound = diaInfo.sound;
			const callback = diaInfo.callback;
			camQueueDialogue(text, delay, sound, callback);
		}
		return;
	}

	if (camDef(text) && !camIsString(text))
	{
		// Got an object instead of 3 different inputs
		sound = text.sound;
		delay = text.delay;
		callback = text.callback;
		text = text.text;
	}

	// Keep track of when the last dialogue is scheduled to play
	if (__camLatestDialogueTime < gameTime)
	{
		__camLatestDialogueTime = gameTime;
	}
	__camLatestDialogueTime += delay;

	__camQueuedDialogue.push({text: text, time: __camLatestDialogueTime, sound: sound, callback: callback});
}

//;; ## camSkipDialogue()
//;;
//;; Skip all queued dialogue. Useful for preventing dialogue from interrupting events, 
//;; or for starting new dialogue without waiting for old ones to finish.
//;; If any `callback` functions are defined in the dialogue queue, they are called immediately.
//;;
//;; @returns {void}
//;;
function camSkipDialogue()
{
	// Check for any callback functions
	for (const diaInfo of __camQueuedDialogue)
	{
		if (camDef(diaInfo.callback))
		{
			// If a callback function is defined, call it
			__camGlobalContext()[diaInfo.callback]();
		}
	}

	// Wipe out any queued dialogue
	__camQueuedDialogue = [];
	__camLatestDialogueTime = gameTime;
}

//;; ## camDialogueDone()
//;;
//;; If there hasn't been any dialogue for the past four seconds (and the queue is empty).
//;; Useful for scripting things to happen only after dialogue ends.
//;;
//;; @returns {boolean}
//;;
function camDialogueDone()
{
	return (__camLatestDialogueTime + camSecondsToMilliseconds(4) <= gameTime);
}

//////////// privates

// Find any dialogues in the queue that are due to play.
// If any are found, print the text, play the sound (if applicable),
// and then remove from the queue.
function __camPlayScheduledDialogues()
{
	const newQueue = [];
	for (const diaInfo of __camQueuedDialogue)
	{
		if (diaInfo.time <= gameTime)
		{
			// Play the dialogue (and then forget it)
			if (camDef(diaInfo.text))
			{
				console(diaInfo.text);
			}
			
			// If there's any associated sound(s), play it
			if (camDef(diaInfo.sound))
			{
				if (diaInfo.sound instanceof Array)
				{
					for (const sound of diaInfo.sound)
					{
						__camPlayDialogueSound(sound);
					}
				}
				else
				{
					__camPlayDialogueSound(diaInfo.sound);
				}
			}

			if (camDef(diaInfo.callback))
			{
				// If a callback function is defined, call it here
				__camGlobalContext()[diaInfo.callback]();
			}
		}
		else
		{
			// Save it in the queue
			newQueue.push(diaInfo);
		}
	}
	__camQueuedDialogue = newQueue;
}

// Simple wrapper for playSound() that replaces CAM_RCLICK with a random radio click sound
function __camPlayDialogueSound(sound)
{
	if (sound === CAM_RCLICK)
	{
		const radioClicks = [
			cam_sounds.radio.click1, cam_sounds.radio.click2,
			cam_sounds.radio.click3, cam_sounds.radio.click4,
			cam_sounds.radio.click5, cam_sounds.radio.click6,
		];
		playSound(camRandFrom(radioClicks));
	}
	else
	{
		playSound(sound);
	}
}