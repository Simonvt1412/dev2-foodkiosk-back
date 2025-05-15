import express from "express";
// import path from "path"; // Als u views serveert
import authRoutes from "../server/routes/auth.routes"; // Controleer dit pad!

const app = express();
const port = process.env.PORT || 3000; // Of uw voorkeurspoort

// Middleware
app.use(express.json()); // Om JSON request bodies te parsen
app.use(express.urlencoded({ extended: true })); // Om URL-encoded bodies te parsen

// Uw index.html serveren (voorbeeld, pas aan indien nodig)
// Als uw index.html in server/views/ staat:
// app.use(express.static(path.join(__dirname, "server/views"))); 
// app.get("/", (req, res) => {
//    res.sendFile(path.join(__dirname, "server/views/index.html"));
// });

// API Routes
app.use("/api/auth", authRoutes);
// Hier komen later andere routes zoals /api/products, /api/categories etc.

app.listen(port, () => {
  console.log(`Server draait op http://localhost:${port}` );
});

export default app; // Voor Vercel of testen
