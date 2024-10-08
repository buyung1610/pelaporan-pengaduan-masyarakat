const mongoose = require('mongoose');

const tanggapanSchema = new mongoose.Schema({
  id_pengaduan: {
    type: String,
    required: true
  },
  tgl_tanggapan: {
    type: Date,
    default: Date.now
  },
  tanggapan: {
    type: String,
    required: true
  },
  id_petugas: {
    type: String,
    required: true
  }
});

const Tanggapan = mongoose.model('Tanggapan', tanggapanSchema);

module.exports = Tanggapan;