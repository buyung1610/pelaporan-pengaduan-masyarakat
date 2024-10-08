const mongoose = require('mongoose');

const pengaduanSchema = new mongoose.Schema({ 
  tgl_pengaduan: {
    type: Date,
    required: true,
    default: Date.now
  },
  nik: {
    type: String,
    minlength: 16,
    maxlength: 16
  },
  isi_laporan: {
    type: String,
    required: true
  },
  foto: {
    type: String,
    maxlength: 256
  },
  status: {
    type: String,
    enum: ['0', 'proses', 'selesai'],
    default: '0'
  }
}, { timestamps: true });

const Pengaduan = mongoose.model('Pengaduan', pengaduanSchema);

module.exports = Pengaduan;