const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authConfig = require('../../config/auth');
const crypto = require('crypto');
const mailer = require('../../modules/mailer');

const User = require('../models/User');
const authMiddleware = require('../middlewares/auth');
const router = express.Router();

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 86400
    });
}

router.get('/users', authMiddleware, async (req, res) => {
    try {
        const users = await User.find();

        return res.send({ users });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error loading users' });
    }
});

router.get('/user/:userId', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        return res.send({ user });
    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error loading user' });
    }
});

router.post('/user', async (req, res) => {
    const { email } = req.body;

    try {
        if (await User.findOne({ email })) {
            return res.status(400).send({ error: 'User already exists' });
        }

        const user = await User.create(req.body);
        user.password = undefined;

        return res.send({
            user,
            token: generateToken({ id: user._id }),
        });
    } catch (err) {
        return res.status(400).send({ error: 'Error creating user' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(400).send({ error: 'Invalid password' });
        }

        return res.send({
            token: generateToken({ id: user._id }),
        });
    } catch (err) {
        return res.status(400).send({ error: 'Error logging in' });
    }
});

router.post('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        }

        return res.send({ user });
    } catch (err) {
        return res.status(400).send({ error: 'Error validating logged user' });
    }
});

router.patch('/user/:userId', authMiddleware, async (req, res) => {
    try {
        if (req.userId != req.params.userId) {
            return res.status(403).send({ error: 'Cannot update another user' });
        }
        const { name, email, password } = req.body;
        const user = await User.findById(req.params.userId);
        user.password = password;
        user.name = name;
        await user.save();
        user.password = undefined;

        return res.send({ user });
    } catch (err) {
        console.log(err)
        return res.status(400).send({ error: 'Error updating user' });
    }
});

router.delete('/user/:userId', authMiddleware, async (req, res) => {
    try {
        if (req.userId != req.params.userId) {
            return res.status(403).send({ error: 'Cannot delete another user' });
        }

        await User.findByIdAndRemove(req.params.userId);

        return res.send({ message: 'User successfully deleted' });
    } catch (err) {
        return res.status(400).send({ error: 'Error deleting user' });
    }
});

router.post('/forgot_password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        }

        const token = crypto.randomBytes(20).toString('hex');

        const now = new Date();
        now.setHours(now.getHours() + 1);

        await User.findByIdAndUpdate(user.id, {
            '$set': {
                passwordResetToken: token,
                passwordResetExpires: now
            }
        });

        mailer.sendMail({
            to: email,
            from: 'rafaelpenczkoski@gmail.com',
            template: 'auth/forgot_password',
            context: { token }
        }, (err) => {
            if (err) {
                console.log(err);
                return res.status(400).send({ error: 'Cannot send forgotten password email' });
            }
            return res.send({ message: 'Recovery email sent' });
        });

    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error recovering password' });
    }
})

router.post('/reset_password', async (req, res) => {
    const { email, token, password } = req.body;

    try {
        const user = await User.findOne({ email })
            .select('+passwordResetToken passwordResetExpires');

        if (!user) {
            return res.status(400).send({ error: 'User not found' });
        }

        if (token !== user.passwordResetToken) {
            return res.status(400).send({ error: 'Invalid token' });
        }

        const now = new Date();

        if (now > user.passwordResetExpires) {
            return res.status(400).send({ error: 'Expired token, generate a new one' });
        }

        user.password = password;
        await user.save();

        return res.send({ message: 'Password reseted' })

    } catch (err) {
        console.log(err);
        return res.status(400).send({ error: 'Error recovering password' });
    }
})

module.exports = app => app.use('/', router);