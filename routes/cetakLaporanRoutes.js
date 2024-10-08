// routes/pengaduan.js
const express = require('express');
const PDFDocument = require('pdfkit');
const Pengaduan = require('../models/pengaduan');
const Masyarakat = require('../models/masyarakat');
const path = require('path');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const moment = require('moment');
const router = express.Router();

router.get('/laporan', verifyToken, checkRole(['admin', 'petugas']), async (req, res) => {
  try {
      const pengaduanList = await Pengaduan.find({ status: 'selesai' });
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
      res.render('generateLaporan', { user: user, pengaduan: pengaduan, title: "Generate Laporan" });

  } catch (err) {
      res.json({ message: err.message, type: 'error' });
  }
});

router.get('/laporan/:id', async (req, res) => {
  try {
    const pengaduan = await Pengaduan.findById(req.params.id);
    const masyarakat = await Masyarakat.findOne({ nik: pengaduan.nik });
    
    if (!pengaduan) {
      return res.status(404).send('Pengaduan tidak ditemukan');
    }

    // Membuat dokumen PDF
    const doc = new PDFDocument();
    let filename = `laporan_pengaduan_${pengaduan.tgl_pengaduan.toISOString().split('T')[0]}`; // Format nama file
    filename = encodeURIComponent(filename);
    
    res.setHeader('Content-disposition', `attachment; filename="${filename}.pdf"`);
    res.setHeader('Content-type', 'application/pdf');

    doc.pipe(res); // Mengalirkan PDF ke response

    // Menambahkan konten ke PDF
    doc.fontSize(20).font('Helvetica-Bold').text('Laporan Pengaduan', { align: 'center' }); // Menebalkan judul
    doc.moveDown();

    doc.fontSize(12).font('Helvetica-Bold').text(`Tanggal Pengaduan: `);
    doc.font('Helvetica').text(`${pengaduan.tgl_pengaduan.toLocaleDateString()}`);

    doc.font('Helvetica-Bold').text(`NIK: `);
    doc.font('Helvetica').text(`${pengaduan.nik || 'Tidak ada NIK'}`);

    // Menebalkan hanya "Nama:"
    doc.font('Helvetica-Bold').text(`Nama: `); // Menebalkan "Nama:"
    doc.font('Helvetica').text(`${masyarakat ? masyarakat.nama : 'Tidak ada nama masyarakat'}`); // Nilai nama
    
    // Menambahkan informasi laporan dan status
    doc.font('Helvetica-Bold').text(`Isi Laporan: `);
    doc.font('Helvetica').text(`${pengaduan.isi_laporan}`);

    doc.font('Helvetica-Bold').text(`Status: `);
    doc.font('Helvetica').text(`${pengaduan.status}`);

    doc.font('Helvetica-Bold').text(`Foto:`);
    
    if (pengaduan.foto) {
      const fullPath = path.join(__dirname, '../uploads', pengaduan.foto); // Mengambil path lengkap
      doc.moveDown();
      doc.image(fullPath, {
          fit: [500, 400],
          align: 'center',
          valign: 'center'
      });
    }
    
    doc.end(); 
  } catch (error) {
    console.error(error);
    res.status(500).send('Terjadi kesalahan saat mencetak laporan');
  }
});

module.exports = router;
