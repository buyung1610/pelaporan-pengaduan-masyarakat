const mongoose = require('mongoose');

const petugasSchema = new mongoose.Schema({
  nama_petugas: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  telp: {
    type: String
  },
  level: {
    type: String,
    enum: ['admin', 'petugas'],
    required: true
  }
});

const Petugas = mongoose.model('Petugas', petugasSchema);

module.exports = Petugas;