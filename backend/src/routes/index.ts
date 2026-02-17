import { Router } from "express";

const router = Router();

router.get("/", (_, res) => {
  res.json({ message: "EstateFlow API v1" });
});

export default router;
