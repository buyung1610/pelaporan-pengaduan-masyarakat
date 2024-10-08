const express = require('express');
const router = express.Router();
const Masyarakat = require('../models/masyarakat');
const Petugas = require('../models/petugas');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const SECRET_KEY = process.env.SECRET_KEY;

router.get('/login', (req, res) => {
    try {
        res.render('login'); 
    } catch (error) {
        console.error('Error rendering login page:', error);
        res.status(500).send('Error rendering login page');
    }
});

router.get('/register', (req, res) => {
    try {
        res.render('register');
    } catch (error) {
        console.error('Error rendering register page:', error);
        res.status(500).send('Error rendering register page');
    }
});

router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        let user = await Masyarakat.findOne({ username });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const accessToken = jwt.sign({ id: user.id, username: user.username, nik: user.nik, nama: user.nama, role: "masyarakat" }, SECRET_KEY, { expiresIn: '1h' });
                res.cookie('token', accessToken, { httpOnly: true });
                return res.redirect('/'); 
            } else {
                req.session.message = 'password salah'; 
                return res.redirect('/auth/login');
            }
        }

        user = await Petugas.findOne({ username });
        if (user) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch) {
                const accessToken = jwt.sign({ id: user.id, username: user.username, id_petugas: user.id, role: user.level }, SECRET_KEY, { expiresIn: '1h' });
                res.cookie('token', accessToken, { httpOnly: true });
                return res.redirect('/'); 
            } else {
                req.session.message = 'password salah';
                return res.redirect('/auth/login');
            }
        }

        req.session.message = 'username tidak ditemukan'; 
        res.redirect('/auth/login');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/register', async (req, res) => {
    const { nik, nama, username, password, telephone } = req.body;
    const hashPassword = bcrypt.hashSync(password, 10);

    try {
        const user = new Masyarakat({
            nik: nik,
            nama: nama,
            username: username,
            password: hashPassword,
            telephone: telephone
        });

        await user.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect('/auth/login');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token'); 

    req.session.destroy((err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Failed to log out');
        }
        
        req.session = null; 

        res.redirect('/');
    });
});




module.exports = router;
