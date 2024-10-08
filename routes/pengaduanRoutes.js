const express = require('express');
const router = express.Router();
const Pengaduan = require('../models/pengaduan');
const verifyToken = require('../middleware/verifyToken');
const upload = require('../middleware/uploadImage');
const checkRole = require('../middleware/checkRole');
const fs = require('fs');

router.get('/', verifyToken, checkRole(['masyarakat']), (req, res) => {
    try {
        const user = req.user;
        res.render('pengaduan', { user : user, title : "Laporan Pengaduan"});
    } catch (error) {
        console.error('Error rendering pengaduan page:', error);
        res.status(500).send('Error rendering pengaduan page');
    }
});

router.get('/edit/:id', verifyToken, checkRole(['masyarakat']), (req, res) => {
    Pengaduan.findById(req.params.id).then(pengaduan => {
        if (!pengaduan || pengaduan == null) {
            res.redirect('/');
        } else {
            const user = req.user;
            res.render('editPengaduan', { pengaduan: pengaduan, user: user, title: "Edit Pengaduan" })
        }
    }).catch(err => {
        res.json({ message: err.message, type: 'danger' });
    })
});

router.get('/delete/:id', async (req, res) => {
    let id = req.params.id;
    let pengaduan = await Pengaduan.findById(id);
    let image_path = './uploads/' + pengaduan.foto;
    try {
        fs.unlinkSync(image_path);
        await Pengaduan.findByIdAndDelete(id);
        req.session.message = {
            type: 'success',
            message: 'Pengaduan deleted successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});




router.post('/', upload, verifyToken, checkRole(['masyarakat']), async (req, res) => {
    try {
        console.log(req.file); 
        if (!req.file) {
            throw new Error('File upload failed');
        }

        const pengaduan = new Pengaduan({
            nik: req.body.nik,
            isi_laporan: req.body.isiLaporan,
            foto: req.file.filename
        });

        await pengaduan.save(); 
        req.session.message = {
            type: 'success',
            message: 'Pengaduan added successfully'
        };
        res.redirect('/');
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

router.post('/edit/:id', upload, verifyToken, checkRole(['masyarakat']), async (req, res) => {
    try {
        // Cari pengaduan berdasarkan ID
        const pengaduan = await Pengaduan.findById(req.params.id);

        if (!pengaduan) {
            throw new Error('Pengaduan tidak ditemukan');
        }

        // Jika ada file baru yang diupload, gunakan file baru
        if (req.file) {
            pengaduan.foto = req.file.filename;
        }

        // Update data pengaduan dari form
        pengaduan.nik = req.body.nik || pengaduan.nik;  // Tetap gunakan nik yang lama jika tidak ada perubahan
        pengaduan.isi_laporan = req.body.isiLaporan;

        // Simpan perubahan
        await pengaduan.save(); 

        req.session.message = {
            type: 'success',
            message: 'Pengaduan berhasil diperbarui'
        };

        res.redirect('/');  // Redirect ke halaman utama atau halaman pengaduan
    } catch (err) {
        res.json({ message: err.message, type: 'danger' });
    }
});

module.exports = router;
