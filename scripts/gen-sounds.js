#!/usr/bin/env node
// Generates minimal WAV sound files for button feedback
const fs = require('fs');
const path = require('path');

function makeSine(freq, sampleRate, durationMs, amplitude, decay) {
  const numSamples = Math.floor(sampleRate * durationMs / 1000);
  const samples = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * decay);
    samples[i] = Math.round(amplitude * env * 32767 * Math.sin(2 * Math.PI * freq * t));
  }
  return samples;
}

function makeWav(samples, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const blockAlign = numChannels * (bitsPerSample / 8);
  const byteRate = sampleRate * blockAlign;
  const dataSize = samples.length * blockAlign;
  const buf = Buffer.alloc(44 + dataSize);
  let i = 0;
  buf.write('RIFF', i); i += 4;
  buf.writeUInt32LE(36 + dataSize, i); i += 4;
  buf.write('WAVE', i); i += 4;
  buf.write('fmt ', i); i += 4;
  buf.writeUInt32LE(16, i); i += 4;
  buf.writeUInt16LE(1, i); i += 2;
  buf.writeUInt16LE(numChannels, i); i += 2;
  buf.writeUInt32LE(sampleRate, i); i += 4;
  buf.writeUInt32LE(byteRate, i); i += 4;
  buf.writeUInt16LE(blockAlign, i); i += 2;
  buf.writeUInt16LE(bitsPerSample, i); i += 2;
  buf.write('data', i); i += 4;
  buf.writeUInt32LE(dataSize, i); i += 4;
  for (const s of samples) { buf.writeInt16LE(s, i); i += 2; }
  return buf;
}

const out = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(out, { recursive: true });

// click.wav — short high tick (button press)
fs.writeFileSync(
  path.join(out, 'click.wav'),
  makeWav(makeSine(900, 22050, 65, 0.55, 45), 22050)
);

// done.wav — softer lower confirmation tone
fs.writeFileSync(
  path.join(out, 'done.wav'),
  makeWav(makeSine(550, 22050, 130, 0.45, 22), 22050)
);

// dare.wav — rising whoosh for dare selection
const dareN = Math.floor(22050 * 0.09);
const dareSamples = new Int16Array(dareN);
for (let i = 0; i < dareN; i++) {
  const t = i / 22050;
  const env = Math.exp(-t * 18);
  const freq = 350 + (i / dareN) * 700;
  dareSamples[i] = Math.round(0.55 * env * 32767 * Math.sin(2 * Math.PI * freq * t));
}
fs.writeFileSync(path.join(out, 'dare.wav'), makeWav(dareSamples, 22050));

// ding.wav — 3-note C-E-G chime for timer end
const SR = 22050;
const noteMs = 160;
const noteN = Math.floor(SR * noteMs / 1000);
const notes = [523, 659, 784]; // C5 E5 G5
const dingTotal = noteN * notes.length;
const dingSamples = new Int16Array(dingTotal);
notes.forEach((freq, ni) => {
  const off = ni * noteN;
  for (let i = 0; i < noteN; i++) {
    const t = i / SR;
    const env = Math.exp(-t * 14);
    dingSamples[off + i] = Math.round(0.52 * env * 32767 * Math.sin(2 * Math.PI * freq * t));
  }
});
fs.writeFileSync(path.join(out, 'ding.wav'), makeWav(dingSamples, SR));

// spin.wav — wheel ratchet: fast ticks decelerating (matches Easing.out(cubic))
// 3.8s total matching wheel animation duration
const SPIN_SR = 22050;
const SPIN_DUR_S = 3.8;
const spinN = Math.floor(SPIN_SR * SPIN_DUR_S);
const spinSamples = new Int16Array(spinN);
// Tick times: velocity v(t) = (1-t/T)^2, integrate to get position, invert for tick times
// Tick density: starts at ~20/s, decelerates to ~0.5/s
const MAX_TICKS_PER_SEC = 22;
const MIN_TICKS_PER_SEC = 0.8;
const tickTimes = [];
let t = 0;
while (t < SPIN_DUR_S) {
  const frac = t / SPIN_DUR_S;
  const vel = (1 - frac) * (1 - frac); // cubic-out deceleration 0..1
  const ticksPerSec = MIN_TICKS_PER_SEC + (MAX_TICKS_PER_SEC - MIN_TICKS_PER_SEC) * vel;
  const interval = 1 / ticksPerSec;
  t += interval;
  if (t < SPIN_DUR_S) tickTimes.push(t);
}
const tickN = Math.floor(SPIN_SR * 0.018); // 18ms tick
for (const tt of tickTimes) {
  const start = Math.floor(tt * SPIN_SR);
  for (let i = 0; i < tickN && start + i < spinN; i++) {
    const env = Math.exp(-i / (SPIN_SR * 0.008));
    spinSamples[start + i] = Math.round(0.45 * env * 32767 * Math.sin(2 * Math.PI * 1200 * (i / SPIN_SR)));
  }
}
fs.writeFileSync(path.join(out, 'spin.wav'), makeWav(spinSamples, SPIN_SR));

console.log('Generated: click.wav, done.wav, dare.wav, ding.wav, spin.wav in assets/sounds/');
