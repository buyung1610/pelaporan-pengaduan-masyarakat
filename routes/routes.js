const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const Pengaduan = require('../models/pengaduan');
const moment = require('moment'); 
const Tanggapan = require('../models/tanggapan');

router.get('/index', (req, res) => {
    try {
        res.render('index');
    } catch (error) {
        console.error('Error rendering home page:', error);
        res.status(500).send('Error rendering home page');
    }
});

router.get('/', verifyToken, async (req, res) => {
    try {
        if (req.user) {
            const role = req.user.role; 
            if (role === 'petugas' || role === 'admin') {
              return res.redirect('/verifikasi/laporan');
            }
        }   
        const nik = req.user.nik; 
        const pengaduanList = await Pengaduan.find({ nik: nik});
        const idList = pengaduanList.map(p => p._id);
        const tanggapanList = await Tanggapan.find({ id_pengaduan : { $in: idList } });

        const pengaduan = pengaduanList.map(p => {
            const tanggapan = tanggapanList.find(t => t.id_pengaduan.toString() === p._id.toString());
            return {
                ...p._doc,
                tanggapan: tanggapan ? tanggapan.tanggapan : 'Belum ada tanggapan' 
            };
        });        
        const formattedPengaduan = pengaduan.map(p => {
            p.tgl_pengaduan = moment(p.tgl_pengaduan).format('M/D/YYYY');
            return p;
        });
        res.render('home', { 
            pengaduan: formattedPengaduan, 
            user: req.user, 
            title: "Home Page" 
        });
    } catch (err) {
        res.json({ message: err.message, type: 'error' });
    }
});

module.exports = router