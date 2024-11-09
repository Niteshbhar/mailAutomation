import express from "express";
import { fileURLToPath } from "url";
import path from "path";
import { sendEmailNodemailer } from "./utils/mail.js";
import EXCELJS from "exceljs";
import multer from "multer";
import { log } from "console";

const app = express();
const port = 3000;

// Middleware
app.use(express.json());

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// Define file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to read Excel file and convert to JSON
async function readExcel(filePath) {
  try {
    const workbook = new EXCELJS.Workbook();
    await workbook.xlsx.readFile(filePath); // Load the Excel file into the workbook

    let jsonData = []; // Initialize an empty array for JSON data
    workbook.worksheets.forEach(function (sheet) {
      const firstRow = sheet.getRow(1);
      let keys = firstRow.values.slice(1); // Get headers, ignoring any undefined index at the start

      sheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip the header row

        let values = row.values.slice(1); // Skip the undefined index for row values as well
        let obj = {};

        for (let i = 0; i < keys.length; i++) {
          obj[keys[i]] = values[i] !== undefined ? values[i] : null; // Map headers to row values
        }
        jsonData.push(obj); // Add each row's data as an object to the JSON array
      });
    });
    return jsonData;
  } catch (error) {
    console.error("Error reading Excel file:", error);
    throw error;
  }
}

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "public"); // Ensure this directory exists
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

// Route to handle file upload and email sending
app.post("/mail", upload.single("excelFile"), async (req, res) => {
  try {
    const filePath = req.file.destination; // Directory where the file is stored
    const fileName = req.file.filename; // Name of the uploaded file
    const fullFilePath = path.join(filePath, fileName); // Full path to the file

    const data = await readExcel(fullFilePath); // Read the Excel file data


    if (!data || data.length === 0) {
      return res.status(400).json({ message: "No data found in the uploaded file." });
    }

    // Send emails to each client in the JSON data
    data.forEach((value) => {
      const { email, name } = value;
     
      
      sendEmailNodemailer(email, name);
    });

    res.status(200).json({ message: "Emails sent successfully!" });
  } catch (err) {
    console.error("Error in /mail route:", err);
    res.status(500).json({ message: "Error in sending mails", error: err });
  }
});
