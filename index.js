import jimp from 'jimp';
import ws from 'ws';
import fs from 'fs';
import { createWorker } from 'tesseract.js';
import { NstrumentaClient } from 'nstrumenta'
import { readFile } from 'fs/promises';
let previousBlob = ''

const nstrumenta = new NstrumentaClient({ hostUrl: 'ws://localhost:8088' });
// const completed = []

// fs.watch('./images', async (eventType, filename) => {
//   console.log(!completed.includes(filename) && `event type is: ${eventType}`);
//   if (eventType == 'change') {
//     completed.push(filename)
//     console.log(`filename provided: ${filename}`);

//     async function main() {
//       const image = await jimp.read(`./images/${filename}`);
//       image.threshold({ max: 200, replace: 200, autoGreyscale: true });
//     }

//     main();

//     const worker = createWorker({
//       logger: m => console.log(m)
//     });
//     const languageFile = 'eng'
//     await worker.load();
//     await worker.loadLanguage(languageFile);
//     await worker.initialize(languageFile);
//     const imageFile = await readFile();
//     const { data: { text } } = await worker.recognize(imageFile);
//     console.log(text);
//     await worker.terminate();
//     console.log(text);
//     nstrumenta.send('ocr', text);
//     fs.rm('./eng.traineddata', () => { });
//   } else {
//     console.log('filename not provided');
//   }
// });

nstrumenta.addListener("open", () => {
  console.log("websocket successfully opened")
  nstrumenta.subscribe('ocr', async (text) => {

    let blob = new File([text], "imageText");

    if (blob != previousBlob) {

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
      nstrumenta.send('images', picture);
      fs.rm('./eng.traineddata', () => { });
    } else {
      console.log('filename not provided');
    }
  });

  nstrumenta.addListener("open", () => {
    console.log("websocket successfully opened")
    nstrumenta.subscribe('ocr', async (text) => {

    })
  });
})

console.log("nstrumenta init")

nstrumenta.init(ws);