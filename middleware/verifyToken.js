const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;

function verifyToken(req, res, next) {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/index'); 
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.redirect('/index'); 
        }
        req.user = user;
        next();
    });
}

module.exports = verifyToken;
