const { sign, verify } = require('jsonwebtoken');

const createToken = (user) => {
    const accessToken = sign({ email: user.email, id: user.id }, "jwtSecret");
    return accessToken;
}

const validateToken = (req, res, next) => {
    const token = req.cookies["access_token"];

    if (!token) {
        return res.status(400).json({ error: "User not authenticated" });

    }
    try {
        const validToken = verify(token, "jwtSecret");
        if (validToken) {
            req.authenticated = true;
            return next();
        }
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
}

module.exports = { createToken, validateToken };