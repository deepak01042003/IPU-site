import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const port =process.env.PORT || 4000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '.')));

app.listen(4000, () => {
    console.log(`Frontend server listening at http://localhost:4000`);
});
