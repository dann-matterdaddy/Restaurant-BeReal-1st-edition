const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/database');
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/auth'));
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/check-in', require('./routes/checkin'));
app.use('/api/traffic', require('./routes/traffic'));
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date() });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`RestaurantBeReal API running on port ${PORT}`);
});
module.exports = app;