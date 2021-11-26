import jimp from 'jimp';
import ws from 'ws';
import fs from 'fs';
import { createWorker } from 'tesseract.js';
import { NstrumentaClient } from 'nstrumenta'
import { readFile } from 'fs/promises';
let previousBlob = ''

const nstrumenta = new NstrumentaClient({ hostUrl: 'ws://localhost:8088' });

nstrumenta.addListener("open", () => {
  console.log("websocket successfully opened")
  nstrumenta.subscribe('ocr', async (blob) => {
    
    console.log(blob)

    async function main() {
      const image = await jimp.read(blob);
      image.threshold({ max: 200, replace: 200, autoGreyscale: true });
    }

    main();

    const worker = createWorker({
      logger: m => console.log(m)
    });
    const languageFile = 'eng'
    await worker.load();
    await worker.loadLanguage(languageFile);
    await worker.initialize(languageFile);
    // const imageFile = await readFile();
    const { data: { text } } = await worker.recognize(blob);
    console.log(text);
    await worker.terminate();
    console.log(text);
    nstrumenta.send('images', text);
    fs.rm('./eng.traineddata', () => { });
  });

  nstrumenta.addListener("open", () => {
    console.log("websocket successfully opened")
    nstrumenta.subscribe('ocr', () => {
    })
  });
})

console.log("nstrumenta init")

nstrumenta.init(ws);