import jimp from 'jimp';
import ws from 'ws';
import fs from 'fs';
import { createWorker } from 'tesseract.js';
import { NstrumentaClient } from 'nstrumenta'
import { readFile } from 'fs/promises';

const nstrumenta = new NstrumentaClient({ hostUrl: 'ws://localhost:8088' });
const completed = []

fs.watch('./images', async (eventType, filename) => {
  console.log(!completed.includes(filename) && `event type is: ${eventType}`);
  if (eventType == 'change') {
    completed.push(filename)
    console.log(`filename provided: ${filename}`);

    const screenshot = await readFile(`./images/${filename}`);

    const image = await jimp.read(`./images/${filename}`);
    const outImage = await image.invert().getBufferAsync(jimp.MIME_PNG);

    const worker = createWorker({
      logger: m => console.log(m)
    });
    const languageFile = 'eng'
    await worker.load();
    await worker.loadLanguage(languageFile);
    await worker.initialize(languageFile);
    const { data: { text } } = await worker.recognize(outImage ? outImage : screenshot);
    console.log(text);
    await worker.terminate();
    console.log(text);
    nstrumenta.send('ocr', text);
    fs.rm('./eng.traineddata', () => { });
    fs.rm(`./images/${filename}`, () => { });
  } else {
    console.log('filename not provided');
  }
});

nstrumenta.addListener("open", () => {
  console.log("websocket successfully opened")
});

console.log("nstrumenta init")

nstrumenta.init(ws);