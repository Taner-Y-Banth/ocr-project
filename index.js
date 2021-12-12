import jimp from 'jimp';
import ws from 'ws';
import fs from 'fs';
import minimist from 'minimist';
import { createWorker } from 'tesseract.js';
import { NstrumentaClient } from 'nstrumenta'

const argv = minimist(process.argv.slice(2));
const wsUrl = argv.wsUrl;

const nstrumenta = new NstrumentaClient({
  apiKey: "",
  projectId: "",
  wsUrl,
});

nstrumenta.addListener("open", () => {
  console.log("websocket successfully opened")

  nstrumenta.subscribe('ocr', async (message) => {

    const blob = message

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