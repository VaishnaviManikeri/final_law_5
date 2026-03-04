const Admission = require('../models/Admission');
const excelWriter = require('../config/excelWriter');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

/*
|--------------------------------------------------------------------------
| MULTER CONFIGURATION
|--------------------------------------------------------------------------
*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {

    const uploadDir = path.join(__dirname, '../uploads/admissions');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {

    const uniqueSuffix =
      Date.now() + '-' + Math.round(Math.random() * 1e9);

    cb(
      null,
      file.fieldname +
        '-' +
        uniqueSuffix +
        path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes =
      /jpeg|jpg|png|gif|pdf|doc|docx/;

    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    const mimetype = allowedTypes.test(
      file.mimetype
    );

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          'Only images, PDFs, and documents are allowed'
        )
      );
    }
  },
}).fields([
  { name: 'gradCertificate', maxCount: 1 },
  { name: 'marksheet10', maxCount: 1 },
  { name: 'marksheet12', maxCount: 1 },
  { name: 'leavingCertificate', maxCount: 1 },
  { name: 'migrationCertificate', maxCount: 1 },
  { name: 'gapAffidavit', maxCount: 1 },
  { name: 'photo', maxCount: 1 },
  { name: 'casteCertificate', maxCount: 1 },
  { name: 'marriageCertificate', maxCount: 1 },
  { name: 'aadharCard', maxCount: 1 },
]);

/*
|--------------------------------------------------------------------------
| SUBMIT ADMISSION
|--------------------------------------------------------------------------
*/

exports.submitAdmission = async (req, res) => {
  try {
    upload(req, res, async (err) => {

      if (err) {
        return res.status(400).json({
          error: 'File upload error',
          details: err.message,
        });
      }

      try {

        /*
        |--------------------------------------------------------------------------
        | SAFE JSON PARSE (IMPORTANT FIX)
        |--------------------------------------------------------------------------
        */

        const formData = req.body.formData
          ? JSON.parse(req.body.formData)
          : {};

        /*
        |--------------------------------------------------------------------------
        | HANDLE DOCUMENTS
        |--------------------------------------------------------------------------
        */

        const documents = {};

        if (req.files && Object.keys(req.files).length > 0) {

          Object.keys(req.files).forEach((key) => {

            const file = req.files[key][0];

            documents[key] = {
              filename: file.originalname,
              path: file.path,
              mimetype: file.mimetype,
              size: file.size,
            };

          });

        }

        formData.documents = {
          ...formData.documents,
          ...documents,
        };

        /*
        |--------------------------------------------------------------------------
        | GET IP ADDRESS
        |--------------------------------------------------------------------------
        */

        const ipAddress =
          req.headers['x-forwarded-for'] ||
          req.socket.remoteAddress;

        /*
        |--------------------------------------------------------------------------
        | CREATE ADMISSION
        |--------------------------------------------------------------------------
        */

        const admission = new Admission({
          ...formData,
          ipAddress,
        });

        /*
        |--------------------------------------------------------------------------
        | SAVE DATABASE
        |--------------------------------------------------------------------------
        */

        await admission.save();

        /*
        |--------------------------------------------------------------------------
        | WRITE TO EXCEL
        |--------------------------------------------------------------------------
        */

        await excelWriter.appendToExcel(
          admission.toObject()
        );

        /*
        |--------------------------------------------------------------------------
        | RESPONSE
        |--------------------------------------------------------------------------
        */

        res.status(201).json({
          success: true,
          message: 'Application submitted successfully',
          applicationNumber: admission.applicationNumber,
          data: admission,
        });

      } catch (error) {

        console.error(
          'Error processing submission:',
          error
        );

        res.status(500).json({
          error: 'Failed to submit application',
          details: error.message,
        });

      }
    });

  } catch (error) {

    console.error(
      'Error in submitAdmission:',
      error
    );

    res.status(500).json({
      error: 'Server error',
      details: error.message,
    });

  }
};

/*
|--------------------------------------------------------------------------
| GET ALL ADMISSIONS
|--------------------------------------------------------------------------
*/

exports.getAllAdmissions = async (req, res) => {
  try {

    const admissions = await Admission.find().sort({
      submittedAt: -1,
    });

    res.json({
      success: true,
      count: admissions.length,
      data: admissions,
    });

  } catch (error) {

    res.status(500).json({
      error: 'Failed to fetch admissions',
      details: error.message,
    });

  }
};

/*
|--------------------------------------------------------------------------
| GET ADMISSION BY ID
|--------------------------------------------------------------------------
*/

exports.getAdmissionById = async (req, res) => {
  try {

    const admission =
      await Admission.findById(req.params.id);

    if (!admission) {
      return res
        .status(404)
        .json({ error: 'Admission not found' });
    }

    res.json({
      success: true,
      data: admission,
    });

  } catch (error) {

    res.status(500).json({
      error: 'Failed to fetch admission',
      details: error.message,
    });

  }
};

/*
|--------------------------------------------------------------------------
| GET BY APPLICATION NUMBER
|--------------------------------------------------------------------------
*/

exports.getAdmissionByAppNumber = async (
  req,
  res
) => {
  try {

    const admission =
      await Admission.findOne({
        applicationNumber:
          req.params.appNumber,
      });

    if (!admission) {
      return res
        .status(404)
        .json({ error: 'Admission not found' });
    }

    res.json({
      success: true,
      data: admission,
    });

  } catch (error) {

    res.status(500).json({
      error: 'Failed to fetch admission',
      details: error.message,
    });

  }
};

/*
|--------------------------------------------------------------------------
| DOWNLOAD EXCEL
|--------------------------------------------------------------------------
*/

exports.downloadExcel = async (req, res) => {

  try {

    const filePath = path.join(
      __dirname,
      '../exports/admissions.xlsx'
    );

    if (!fs.existsSync(filePath)) {
      return res
        .status(404)
        .json({ error: 'Excel file not found' });
    }

    res.download(filePath);

  } catch (error) {

    res.status(500).json({
      error: 'Failed to download Excel',
      details: error.message,
    });

  }
};

/*
|--------------------------------------------------------------------------
| DELETE ADMISSION
|--------------------------------------------------------------------------
*/

exports.deleteAdmission = async (req, res) => {

  try {

    const admission =
      await Admission.findById(req.params.id);

    if (!admission) {
      return res
        .status(404)
        .json({ error: 'Admission not found' });
    }

    if (admission.documents) {

      Object.values(admission.documents).forEach(
        (doc) => {

          if (
            doc.path &&
            fs.existsSync(doc.path)
          ) {
            fs.unlinkSync(doc.path);
          }

        }
      );
    }

    await admission.deleteOne();

    res.json({
      success: true,
      message: 'Admission deleted successfully',
    });

  } catch (error) {

    res.status(500).json({
      error: 'Failed to delete admission',
      details: error.message,
    });

  }
};

/*
|--------------------------------------------------------------------------
| STATISTICS
|--------------------------------------------------------------------------
*/

exports.getStatistics = async (req, res) => {

  try {

    const total =
      await Admission.countDocuments();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayCount =
      await Admission.countDocuments({
        submittedAt: { $gte: today },
      });

    const monthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    const monthCount =
      await Admission.countDocuments({
        submittedAt: { $gte: monthStart },
      });

    res.json({
      success: true,
      data: {
        total,
        today: todayCount,
        thisMonth: monthCount,
      },
    });

  } catch (error) {

    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error.message,
    });

  }
};