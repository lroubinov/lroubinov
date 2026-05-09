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
// Extra instances of sounds for simultaneous playback
let ding2: Audio.Sound | null = null;
let ding3: Audio.Sound | null = null;
let click2: Audio.Sound | null = null;
let dare2: Audio.Sound | null = null;
let loaded = false;

async function load() {
  if (loaded) return;
  loaded = true;
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: false, allowsRecordingIOS: false });
    [click, done, dare, ding, spin, ding2, ding3, click2, dare2] = await Promise.all([
      Audio.Sound.createAsync(CLICK).then(r => r.sound),
      Audio.Sound.createAsync(DONE).then(r => r.sound),
      Audio.Sound.createAsync(DARE).then(r => r.sound),
      Audio.Sound.createAsync(DING).then(r => r.sound),
      Audio.Sound.createAsync(SPIN).then(r => r.sound),
      Audio.Sound.createAsync(DING).then(r => r.sound),
      Audio.Sound.createAsync(DING).then(r => r.sound),
      Audio.Sound.createAsync(CLICK).then(r => r.sound),
      Audio.Sound.createAsync(DARE).then(r => r.sound),
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

  // Confetti: triple ding burst on results screen
  playConfetti: () => {
    play(ding);
    setTimeout(() => play(ding2), 170);
    setTimeout(() => play(ding3), 340);
  },

  // Card flip/reveal: dare sound then a ding overlay
  playReveal: (isDare: boolean) => {
    if (isDare) {
      play(dare2);
      setTimeout(() => play(ding2), 300);
    } else {
      play(ding);
      setTimeout(() => play(click2), 180);
    }
  },

  // Forfeit: two rapid clicks + dare sound (ominous)
  playForfeit: () => {
    play(click);
    setTimeout(() => play(click2), 120);
    setTimeout(() => play(dare2), 320);
  },

  // Win fanfare: done + ding + ding cascade
  playWin: () => {
    play(done);
    setTimeout(() => play(ding), 250);
    setTimeout(() => play(ding2), 500);
    setTimeout(() => play(ding3), 750);
  },
};
