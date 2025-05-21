"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import path from "path"; // Als u views serveert
const auth_routes_1 = __importDefault(require("../server/routes/auth.routes")); // Controleer dit pad!
const app = (0, express_1.default)();
const port = process.env.PORT || 3000; // Of uw voorkeurspoort
// Middleware
app.use(express_1.default.json()); // Om JSON request bodies te parsen
app.use(express_1.default.urlencoded({ extended: true })); // Om URL-encoded bodies te parsen
// Uw index.html serveren (voorbeeld, pas aan indien nodig)
// Als uw index.html in server/views/ staat:
// app.use(express.static(path.join(__dirname, "server/views"))); 
// app.get("/", (req, res) => {
//    res.sendFile(path.join(__dirname, "server/views/index.html"));
// });
// API Routes
app.use("/api/auth", auth_routes_1.default);
// Hier komen later andere routes zoals /api/products, /api/categories etc.
app.listen(port, () => {
    console.log(`Server draait op http://localhost:${port}`);
});
exports.default = app; // Voor Vercel of testen
//# sourceMappingURL=app.js.map