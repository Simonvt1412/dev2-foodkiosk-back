import express, { Application, Request, Response } from "express";

const app: Application = express();
const PORT: number = 3000;

app.listen(PORT, () => {
  console.log(`Server draait op http://localhost:${PORT}`);
});