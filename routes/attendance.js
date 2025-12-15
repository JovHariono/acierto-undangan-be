const express = require("express");
const { pool } = require("../connection");
const { upload, uploadFolder } = require("../upload");
const path = require("path");
const fs = require("fs");

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post(
  "/",
  upload.single("tiket"),
  asyncHandler(async (req, res) => {
    const { company, name, kehadiran } = req.body;
    const tiket = req.file ? req.file.filename : null;

    if (!company || !name || kehadiran == null)
      return res.status(400).json({ error: "Missing fields" });

    const kehadiranInt = Number(kehadiran);
    if (!Number.isInteger(kehadiranInt))
      return res.status(400).json({ error: "Kehadiran must be integer" });

    const result = await pool.query(
      `INSERT INTO public.attendance (company, name, kehadiran, tiket)
     VALUES ($1, $2, $3, $4) RETURNING *`,
      [company, name, kehadiranInt, tiket]
    );

    res.status(201).json(result.rows[0]);
  })
);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await pool.query(
      `SELECT id, company, name, kehadiran, tiket, created_at
     FROM public.attendance ORDER BY created_at DESC`
    );
    res.json(result.rows);
  })
);

router.get(
  "/:id/tiket",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT tiket FROM public.attendance WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0 || !result.rows[0].tiket) {
      return res.status(404).json({ error: "File not found" });
    }

    const fileName = result.rows[0].tiket;
    const filePath = path.join(uploadFolder, fileName);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File missing on disk" });
    }

    res.setHeader("X-Filename", fileName);
    res.download(filePath, fileName);
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT tiket FROM public.attendance WHERE id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Attendance not found" });
    }

    const fileName = result.rows[0].tiket;

    if (fileName) {
      const filePath = path.join(uploadFolder, fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query(`DELETE FROM public.attendance WHERE id = $1`, [id]);

    res.status(200).json({
      message: "Attendance deleted successfully",
    });
  })
);

module.exports = router;
