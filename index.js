require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const db = require('./config/dbConfig');
const cookieParser = require('cookie-parser'); 

const routes = require('./routes/routes');
const authRoutes = require('./routes/authRoutes');
const pengaduanRoutes = require('./routes/pengaduanRoutes');
const tanggapanRoutes = require('./routes/tanggapanRoutes');
const cetakLaporanRoutes = require('./routes/cetakLaporanRoutes');
const verifikasiRoutes = require('./routes/verifikasiLaporanRoutes')

const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', 'views'); 

db.on('error', (error) => console.log(error));
db.once('open', () => console.log('Connected to Database'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser()); 
app.use('/uploads', express.static('uploads'));

app.use(session({
    secret: process.env.SECRET_KEY, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
        done(err, user);
    });
});


app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

app.use('/', routes)
app.use('/auth', authRoutes);
app.use('/pengaduan', pengaduanRoutes);
app.use('/tanggapan', tanggapanRoutes);
app.use('/cetak', cetakLaporanRoutes);
app.use('/verifikasi', verifikasiRoutes)

app.listen(port, () => {
    console.log(`Server started at http://localhost:${port}`);
});
