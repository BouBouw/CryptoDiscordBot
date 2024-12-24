const express = require('express');

const client = require('../../../index');
const connection = require('../../../index');

const router = express.Router();

router.get('/', async (req, res) => {
    res.render('Welcome', {
        user: req.user,
        bot: client,
        db: connection
    })
});

module.exports = router;