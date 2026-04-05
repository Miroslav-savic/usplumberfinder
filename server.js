const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Load clinics data
let clinicsData = [];
try {
  const dataPath = path.join(__dirname, 'data', 'clinics.json');
  const rawData = fs.readFileSync(dataPath, 'utf8');
  clinicsData = JSON.parse(rawData);
  console.log(`Loaded ${clinicsData.length} clinics from data file.`);
} catch (err) {
  console.error('Error loading clinics data:', err.message);
}

// API endpoint: Get all clinics (with optional filtering)
app.get('/api/clinics', (req, res) => {
  try {
    let results = [...clinicsData];

    const { search, type } = req.query;

    if (search && search.trim() !== '') {
      const query = search.trim().toLowerCase();
      results = results.filter(clinic => {
        return (
          clinic.name.toLowerCase().includes(query) ||
          clinic.type.toLowerCase().includes(query) ||
          clinic.address.toLowerCase().includes(query) ||
          clinic.description.toLowerCase().includes(query) ||
          clinic.services.some(s => s.toLowerCase().includes(query))
        );
      });
    }

    if (type && type !== 'All') {
      results = results.filter(clinic => clinic.type === type);
    }

    res.json({
      success: true,
      count: results.length,
      clinics: results
    });
  } catch (err) {
    console.error('Error fetching clinics:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API endpoint: Get single clinic by ID
app.get('/api/clinics/:id', (req, res) => {
  try {
    const clinic = clinicsData.find(c => c.id === parseInt(req.params.id));
    if (!clinic) {
      return res.status(404).json({ success: false, error: 'Clinic not found' });
    }
    res.json({ success: true, clinic });
  } catch (err) {
    console.error('Error fetching clinic:', err.message);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// API endpoint: Get all unique clinic types
app.get('/api/types', (req, res) => {
  try {
    const types = [...new Set(clinicsData.map(c => c.type))].sort();
    res.json({ success: true, types });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Fallback: serve index.html for any unmatched route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`LA Clinic Finder running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.`);
});
