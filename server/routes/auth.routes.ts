import { Router, Request, Response, NextFunction } from "express"; // Voeg NextFunction toe voor de volledigheid van het type
import { registerUser as importedRegisterUser, loginUser as importedLoginUser } from "../controllers/auth.controller";

const router = Router();

// Definieer het verwachte type voor een Express route handler
type ExpressRouteHandler = (req: Request, res: Response, next?: NextFunction) => Promise<void | any> | void | any;

const registerUser: ExpressRouteHandler = importedRegisterUser;
const loginUser: ExpressRouteHandler = importedLoginUser;

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

export default router;
