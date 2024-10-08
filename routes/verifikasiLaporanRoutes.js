const express = require('express');
const router = express.Router();
const Pengaduan = require('../models/pengaduan');
const verifyToken = require('../middleware/verifyToken');
const moment = require('moment');
const checkRole = require('../middleware/checkRole');
const Masyarakat = require('../models/masyarakat');

router.get('/laporan', verifyToken, checkRole(['admin', 'petugas']), async (req, res) => {
    try {
        const pengaduanList = await Pengaduan.find({ status: '0' });
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
        res.render('verifikasiLaporan', { user: user, pengaduan: pengaduan, title: "Verifikasi Laporan" });

    } catch (err) {
        res.json({ message: err.message, type: 'error' });
    }
});

router.post('/laporan/:id', verifyToken, checkRole(['admin', 'petugas']), async (req, res) => {
    let id = req.params.id;

    try {
        const pengaduan = await Pengaduan.findByIdAndUpdate(id, { status: 'proses' }, { new: true });

        if (!pengaduan) {
            return res.status(404).json({ message: 'Pengaduan not found', type: 'error' });
        }

        res.redirect('/verifikasi/laporan'); 
    } catch (err) {
        console.error('Error updating pengaduan status:', err);
        res.json({ message: err.message, type: 'danger' });
    }
});

module.exports = router;