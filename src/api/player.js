
const {
  createAudioPlayer,
  NoSubscriberBehavior,
} = require('@discordjs/voice');
const { log } = require("../config");
const player = createAudioPlayer({
  behaviors: {
    noSubscriber: NoSubscriberBehavior.Pause,
  },
});

player.on('stateChange', (oldState, newState) => {
	log.info(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
});

module.exports = {
  player
}