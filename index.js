import jimp from 'jimp';
import ws from 'ws';
import fs from 'fs';
import minimist from 'minimist';
import { createWorker } from 'tesseract.js';
import { NstrumentaClient } from 'nstrumenta'

const argv = minimist(process.argv.slice(2));
const wsUrl = argv.wsUrl;

const nstClient = new NstrumentaClient({
  apiKey: "",
  projectId: "",
  wsUrl,
});

nstClient.addListener("open", () => {
  console.log("websocket successfully opened")

  nstClient.subscribe('ocr', async (message) => {

    const blob = message

    async function main() {
      const image = await jimp.read(blob);
      const outImage = await image.invert().getBufferAsync(jimp.MIME_PNG);
      nstClient.sendBuffer('jimp', outImage);
    }
    main();

    const worker = createWorker({
      logger: m => console.log(m)
    });
    const languageFile = 'eng'
    await worker.load();
    await worker.loadLanguage(languageFile);
    await worker.initialize(languageFile);
    const { data: { text } } = await worker.recognize(outImage);
    console.log(text);
    await worker.terminate();
    console.log(text);
    nstClient.send('images', text);
    fs.rm('./eng.traineddata', () => { });
  });

  nstClient.addListener("open", () => {
    console.log("websocket successfully opened")
    nstClient.subscribe('ocr', () => {
    })
  });
})

console.log("nstClient init")

nstClient.init(ws);