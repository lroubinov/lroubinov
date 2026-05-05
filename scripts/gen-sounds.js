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

console.log('Generated: click.wav, done.wav, dare.wav in assets/sounds/');
