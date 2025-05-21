"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express"); // Voeg NextFunction toe voor de volledigheid van het type
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
const registerUser = auth_controller_1.registerUser;
const loginUser = auth_controller_1.loginUser;
// POST /api/auth/register
router.post("/register", registerUser);
// POST /api/auth/login
router.post("/login", loginUser);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map