const mongoose = require('mongoose');

const masyarakatSchema = new mongoose.Schema({
  nik: {
    type: String,
    required: true,
    unique: true,
    minlength: 16,
    maxlength: 16
  },
  nama: {
    type: String,
    required: true,
    maxlength: 36
  },
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 25
  },
  password: {
    type: String,
    required: true,
    maxlength: 255
  },
  telephone: {
    type: String,
    required: true,
    maxlength: 13
  }
});

const Masyarakat = mongoose.model('Masyarakat', masyarakatSchema);

module.exports = Masyarakat;