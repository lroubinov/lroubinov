import { Audio } from 'expo-av';

const CLICK = require('../../assets/sounds/click.wav');
const DONE  = require('../../assets/sounds/done.wav');
const DARE  = require('../../assets/sounds/dare.wav');
const DING  = require('../../assets/sounds/ding.wav');
const SPIN  = require('../../assets/sounds/spin.wav');

let click: Audio.Sound | null = null;
let done:  Audio.Sound | null = null;
let dare:  Audio.Sound | null = null;
let ding:  Audio.Sound | null = null;
let spin:  Audio.Sound | null = null;
let loaded = false;

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: false, allowsRecordingIOS: false });
    [click, done, dare, ding, spin] = await Promise.all([
      Audio.Sound.createAsync(CLICK).then(r => r.sound),
      Audio.Sound.createAsync(DONE).then(r => r.sound),
      Audio.Sound.createAsync(DARE).then(r => r.sound),
      Audio.Sound.createAsync(DING).then(r => r.sound),
      Audio.Sound.createAsync(SPIN).then(r => r.sound),
    ]);
  } catch {}
}

async function play(sound: Audio.Sound | null) {
  if (!sound) return;
  try {
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch {}
}

load();

export const Sounds = {
  playClick: () => play(click),
  playDone:  () => play(done),
  playDare:  () => play(dare),
  playDing:  () => play(ding),
  playWheelSpin: () => play(spin),
  stopWheelSpin: async () => {
    if (!spin) return;
    try { await spin.stopAsync(); } catch {}
  },
  playConfetti: () => {
    // Play ding three times with short delays for a celebratory pop sound
    play(ding);
    setTimeout(() => play(ding), 180);
    setTimeout(() => play(ding), 360);
  },
};
