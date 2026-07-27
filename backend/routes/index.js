const express = require('express');
const router = express.Router();

// Example route
router.get('/example', (req, res) => {
  res.json({
    message: 'This is an example route from the routes directory',
    timestamp: new Date().toISOString()
  });
});

// Add your own routes here
// router.use('/users', require('./users'));
// router.use('/products', require('./products'));
// router.use('/auth', require('./auth'));

module.exports = router;
