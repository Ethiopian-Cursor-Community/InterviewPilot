import { Hono } from "hono";
import * as voiceController from "../controllers/voice.controller.js";
import { requireAuth, type AuthVariables } from "../middleware/auth.js";

const voiceRoutes = new Hono<{ Variables: AuthVariables }>();

voiceRoutes.use("/*", requireAuth);

voiceRoutes.get("/health", voiceController.voiceHealth);
voiceRoutes.post("/speak", voiceController.speak);
voiceRoutes.post("/transcribe", voiceController.transcribe);

export { voiceRoutes };
