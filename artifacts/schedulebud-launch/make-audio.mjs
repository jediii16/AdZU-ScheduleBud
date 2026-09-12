import fs from 'node:fs';

const sampleRate = 48000;
const duration = 15;
const count = sampleRate * duration;
const samples = new Int16Array(count);

const smooth = (x) => x * x * (3 - 2 * x);
const bell = (t, start, length, freq, gain) => {
  const x = (t - start) / length;
  if (x < 0 || x > 1) return 0;
  const env = Math.sin(Math.PI * x) ** 2 * Math.exp(-2.2 * x);
  return Math.sin(2 * Math.PI * freq * (t - start)) * env * gain;
};
const whoosh = (t, start, length, gain) => {
  const x = (t - start) / length;
  if (x < 0 || x > 1) return 0;
  const env = Math.sin(Math.PI * x) ** 2;
  const n = Math.sin(2 * Math.PI * (120 + 1100 * smooth(x)) * t) * .55
    + Math.sin(2 * Math.PI * (260 + 1700 * smooth(x)) * t) * .25;
  return n * env * gain;
};

for (let i = 0; i < count; i++) {
  const t = i / sampleRate;
  const fade = Math.min(1, t / .45, (duration - t) / .7);
  const pad = (
    Math.sin(2 * Math.PI * 110 * t) * .05 +
    Math.sin(2 * Math.PI * 164.81 * t) * .035 +
    Math.sin(2 * Math.PI * 220 * t) * .022
  ) * fade * (0.82 + .18 * Math.sin(2 * Math.PI * .18 * t));
  let v = pad;
  for (const tr of [2.55, 5.65, 9.05, 12.45]) v += whoosh(t, tr - .18, .48, .14);
  v += bell(t, .35, .55, 660, .16);
  v += bell(t, 2.72, .38, 880, .12);
  v += bell(t, 5.82, .42, 740, .12);
  v += bell(t, 9.23, .42, 990, .12);
  v += bell(t, 12.72, .7, 660, .16) + bell(t, 12.78, .8, 990, .09);
  samples[i] = Math.max(-32767, Math.min(32767, Math.round(v * 32767)));
}

const dataSize = samples.byteLength;
const wav = Buffer.alloc(44 + dataSize);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + dataSize, 4); wav.write('WAVE', 8);
wav.write('fmt ', 12); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20);
wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24);
wav.writeUInt32LE(sampleRate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write('data', 36); wav.writeUInt32LE(dataSize, 40);
Buffer.from(samples.buffer).copy(wav, 44);
fs.writeFileSync(new URL('./soundtrack.wav', import.meta.url), wav);
