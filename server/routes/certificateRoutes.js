const express = require("express");
const fs = require("fs");
const multer = require("multer");
const path = require("path");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const Certificate = require("../models/Certificate");

const router = express.Router();

// File storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, uniqueName + path.extname(file.originalname));
  },
});

// File validation
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPG, JPEG and PNG files are allowed"));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

// Handle Multer upload errors
const handleCertificateUpload = (req, res, next) => {
  upload.single("certificate")(req, res, (error) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          message: "File too large. Maximum allowed size is 5 MB.",
        });
      }

      return res.status(400).json({
        message: error.message,
      });
    }

    if (error) {
      return res.status(400).json({
        message: error.message,
      });
    }

    next();
  });
};

// Upload certificate
router.post(
  "/upload",
  authMiddleware,
  handleCertificateUpload,
  async (req, res) => {
    try {
      const { title, issuer, issueDate, description } = req.body;

      if (!title || !issuer || !issueDate) {
        return res.status(400).json({
          message: "Title, issuer and issue date are required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          message: "Certificate file is required",
        });
      }

      const certificate = new Certificate({
        userId: req.user.id,
        title,
        issuer,
        issueDate,
        description,
        fileName: req.file.originalname,
        filePath: req.file.path,
      });

      await certificate.save();

      res.status(201).json({
        message: "Certificate uploaded successfully",
        certificate,
      });
    } catch (error) {
      console.error("Certificate upload error:", error);

      // Remove uploaded file if database save fails
      if (req.file && req.file.path) {
        try {
          if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log("Uploaded file removed after failed database save");
          }
        } catch (fileError) {
          console.error("Failed to remove uploaded file:", fileError);
        }
      }

      res.status(500).json({
        message: "Failed to upload certificate",
      });
    }
  },
);

// Get logged-in user's certificates
router.get("/", authMiddleware, async (req, res) => {
  try {
    const certificates = await Certificate.find({
      userId: req.user.id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      certificates,
    });
  } catch (error) {
    console.error("Fetch certificates error:", error);

    res.status(500).json({
      message: "Failed to fetch certificates",
    });
  }
});

// Get all certificates for Admin
router.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const certificates = await Certificate.find()
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      certificates,
    });
  } catch (error) {
    console.error("Admin fetch certificates error:", error);

    res.status(500).json({
      message: "Failed to fetch all certificates",
    });
  }
});

// Verify a certificate
router.patch(
  "/admin/:id/verify",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const certificate = await Certificate.findByIdAndUpdate(
        req.params.id,
        { status: "Verified" },
        { returnDocument: "after" },
      );

      if (!certificate) {
        return res.status(404).json({
          message: "Certificate not found",
        });
      }

      res.status(200).json({
        message: "Certificate verified successfully",
        certificate,
      });
    } catch (error) {
      console.error("Certificate verification error:", error);

      res.status(500).json({
        message: "Failed to verify certificate",
      });
    }
  },
);

// Reject a certificate
router.patch(
  "/admin/:id/reject",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const certificate = await Certificate.findByIdAndUpdate(
        req.params.id,
        { status: "Rejected" },
        { returnDocument: "after" },
      );

      if (!certificate) {
        return res.status(404).json({
          message: "Certificate not found",
        });
      }

      res.status(200).json({
        message: "Certificate rejected successfully",
        certificate,
      });
    } catch (error) {
      console.error("Certificate rejection error:", error);

      res.status(500).json({
        message: "Failed to reject certificate",
      });
    }
  },
);

// View an uploaded certificate
router.get("/:id/file", authMiddleware, async (req, res) => {
  try {
    if (!require("mongoose").Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid certificate ID",
      });
    }

    const certificate = await Certificate.findById(req.params.id);

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    const isOwner = certificate.userId.toString() === req.user.id.toString();

    const isAdmin = req.user.role === "Admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    if (!fs.existsSync(certificate.filePath)) {
      return res.status(404).json({
        message: "Certificate file not found",
      });
    }

    res.sendFile(path.resolve(certificate.filePath));
  } catch (error) {
    console.error("Certificate file error:", error);

    res.status(500).json({
      message: "Failed to open certificate",
    });
  }
});

module.exports = router;
