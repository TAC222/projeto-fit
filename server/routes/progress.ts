import { Router } from "express";
import { getProgress, toggleProgressDay } from "../db";
import { isValidDay } from "../auth/validate";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", requireAuth, (req, res) => {
  res.json({ completedDays: getProgress(req.currentUser!.id) });
});

router.post("/toggle", requireAuth, (req, res) => {
  const { day } = req.body ?? {};
  if (!isValidDay(day)) {
    return res.status(400).json({ error: "Dia inválido (tem de ser um número entre 1 e 30)." });
  }
  const completedDays = toggleProgressDay(req.currentUser!.id, day);
  res.json({ completedDays });
});

export default router;
