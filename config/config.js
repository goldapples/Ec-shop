module.exports = {
    MONGOURI: "mongodb://localhost:27017/products",
    // MONGOURI: "mongodb://localhost:27017/products",
    secretOrKey: "secret",
    expireIn: 3600*24,
    allowed_origin: ['http://192.168.3.114:3000', 'https://192.168.3.114:4000']
}