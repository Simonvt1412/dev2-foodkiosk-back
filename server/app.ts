import express, { Application, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

const app: Application = express();
const PORT: number = 3000;

// Serve static files from the project root
app.use(express.static(path.join(__dirname, '..')));

// Route to serve index.html when accessing the root URL
app.get('/', (req: Request, res: Response) => {
    const filePath = path.resolve(__dirname, '..', 'server', 'views', 'index.html');
    console.log(`Attempting to serve file from: ${filePath}`);

    // Check if the file exists before sending
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            console.error(`File not found: ${filePath}`);
            return res.status(404).send('Index file not found');
        }
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error(`Error sending file: ${err}`);
                res.status(500).send('Error serving index.html');
            }
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
});