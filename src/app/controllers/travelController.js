const express = require('express');
const authMiddleware = require('../middlewares/auth');
const Travel = require('../models/travel');

const router = express.Router();
router.use(authMiddleware);

router.get('/', async (req, res) => {
    try {
        const travels = await Travel.find().populate('user');

        return res.send({ travels });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error loading travels' });
    }
});

router.get('/:travelId', async (req, res) => {
    try {
        const travel = await Travel.findById(req.params.travelId).populate('user');

        return res.send({ travel });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error loading travel' });
    }
});

router.post('/', async (req, res) => {
    try {
        const travel = await Travel.create({ ...req.body, user: req.userId });

        return res.send({ travel });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error creating new travel' });
    }
});

router.patch('/:travelId', async (req, res) => {
    try {
        let travel = await Travel.findById(req.params.travelId).populate('user');
        if (!travel) {
            return res.status(400).send({ error: 'Travel not found' });
        }
        if (travel.user._id != req.userId) {
            return res.status(400).send({ error: 'This travel belongs to another user' });
        }
        await Travel.findByIdAndUpdate(req.params.travelId, {
            '$set': req.body
        });
        travel = await Travel.findById(req.params.travelId);

        return res.send({ travel });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error updating travel' });
    }
});

router.delete('/:travelId', async (req, res) => {
    try {
        const travel = await Travel.findById(req.params.travelId).populate('user');
        if (!travel) {
            return res.status(400).send({ error: 'Travel not found' });
        }

        if (travel.user._id != req.userId) {
            return res.status(400).send({ error: 'This travel belongs to another user' });
        }
        travel.remove();

        return res.send({ message: 'Travel successfully deleted' });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error deleting travel' });
    }
});

module.exports = app => app.use('/travels', router);