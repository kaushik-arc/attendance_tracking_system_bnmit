const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const ExcelJS = require('exceljs');  // Updated to use ExcelJS

const app = express();
const port = 3000;

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Change to your database username
  password: '', // Change to your database password
  database: 'attendance_system',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to the database');
});

// Middleware to parse JSON bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API to add attendance record
app.post('/attendance', (req, res) => {
  const { name, usn, latitude, longitude, timestamp } = req.body;
  const query = `INSERT INTO attendance (name, usn, latitude, longitude, timestamp) VALUES (?, ?, ?, ?, ?)`;
  db.query(query, [name, usn, latitude, longitude, timestamp], (err, result) => {
    if (err) throw err;
    res.status(200).send('Attendance added successfully');
  });
});

// API to retrieve attendance records
app.get('/attendance', (req, res) => {
  const query = 'SELECT * FROM attendance';
  db.query(query, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// API to download attendance data as Excel file
app.get('/attendance/download', (req, res) => {
  const query = 'SELECT * FROM attendance';
  db.query(query, (err, results) => {
    if (err) throw err;

    // Create an Excel file using ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');

    // Define columns for the worksheet
    worksheet.columns = [
      { header: 'Name', key: 'name' },
      { header: 'USN', key: 'usn' },
      { header: 'Latitude', key: 'latitude' },
      { header: 'Longitude', key: 'longitude' },
      { header: 'Timestamp', key: 'timestamp' },
    ];

    // Add rows to the worksheet
    worksheet.addRows(results);

    // Write the Excel file to the response
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.xlsx');

    workbook.xlsx.write(res).then(() => {
      res.end();
    });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
