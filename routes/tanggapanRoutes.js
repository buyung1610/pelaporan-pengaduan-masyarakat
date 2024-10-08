const express = require('express');
const router = express.Router();
const Tanggapan = require('../models/tanggapan');
const Pengaduan = require('../models/pengaduan');
const verifyToken = require('../middleware/verifyToken');
const moment = require('moment')
const checkRole = require('../middleware/checkRole');
const Masyarakat = require('../models/masyarakat');

router.get('/', verifyToken, checkRole(['admin', 'petugas']), async (req, res) => {
    try {
        const pengaduanList = await Pengaduan.find({ status: 'proses' });
        const nikList = pengaduanList.map(p => p.nik);
        const masyarakatData = await Masyarakat.find({ nik: { $in: nikList } });

        const pengaduan = pengaduanList.map(p => {
            const masyarakat = masyarakatData.find(m => m.nik === p.nik);
            return {
                ...p._doc, 
                nama: masyarakat ? masyarakat.nama : 'Nama tidak ditemukan' 
            };
        });

        const formattedPengaduan = pengaduan.map(p => {
            p.tgl_pengaduan = moment(p.tgl_pengaduan).format('M/D/YYYY');
            return p;
        });

        const user = req.user;
        res.render('tanggapan', { pengaduan: formattedPengaduan, user: user, title: "Berikan Tanggapan" });

    } catch (err) {
        res.json({ message: err.message, type: 'error' });
    }
});



router.get('/form/:id', verifyToken, checkRole(['admin', 'petugas']), (req, res) => {
    Pengaduan.findById(req.params.id).then(pengaduan => {
        if (!pengaduan || pengaduan == null) {
            res.redirect('/');
        } else {
            const user = req.user;
            res.render('tanggapanForm', { pengaduan: pengaduan, user: user, title: "Tanggapan" })
        }
    }).catch(err => {
        res.json({ message: err.message, type: 'danger' });
    })
});

router.post('/kirim/:id', verifyToken, checkRole(['admin', 'petugas']), async (req, res) => {
    const {tanggapanLaporan} = req.body

    try {
        const tanggapan = new Tanggapan({
            id_pengaduan: req.params.id,
            tanggapan: tanggapanLaporan,
            id_petugas: req.user.id_petugas 
        });

        await tanggapan.save();

        await Pengaduan.findByIdAndUpdate(req.params.id, { status: "selesai" });

        req.session.message = {
            type: 'success',
            message: 'Tanggapan berhasil diberikan'
        };
        res.redirect('/'); 
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});


module.exports = router;