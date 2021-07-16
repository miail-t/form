const jwt = require('jsonwebtoken');
const configure = require('config')

module.exports = ( req: any ,res: any, next: any ) => {
    if ( req.method === 'OPTIONS' ) {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1]

        if(!token) {
            return res.status(401).json({massage: "ДИЧЬ"});
        }

        const decoded = jwt.verify( token, configure.get('jwtSecret') )
        console.log(decoded)
        req.user = decoded;
        next();
    } catch (e) {
        res.status(401).json({massage: "Мимо"});
    }
}