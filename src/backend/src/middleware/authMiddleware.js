const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
dotenv.config()



// const authMiddleware = (req, res, next) => {
//     const authHeader = req.headers['token'];
//     if (!authHeader) {
//         return res.status(401).json({
//             message: 'No token provided',
//             status: 'ERROR'
//         });
//     }

//     const token = authHeader.split(' ')[1];

//     console.log('Received token:', token);
//     console.log('Access Token Secret:', process.env.ACCESS_TOKEN);

//     jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
//         if (err) {
//             console.error('Token verification error:', err);
//             return res.status(403).json({
//                 message: 'Failed to authenticate token',
//                 status: 'ERROR'
//             });
//         }

//         console.log('Decoded user:', user);

//         if (user?.isAdmin) {
//             req.user = user;
//             next();
//         } else {
//             return res.status(403).json({
//                 message: 'You do not have the required permissions',
//                 status: 'ERROR'
//             });
//         }
//     });
// };




const authMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1]
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'The authentication',
                status: 'ERROR'
            });
        }
        if (user?.isAdmin) {
            next();
        } else {
            return res.status(404).json({
                message: 'The authentication',
                status: 'ERROR'
            });
        }
    });
};

const authUserMiddleware = (req, res, next) => {
    const token = req.headers.token.split(' ')[1]
    const userId = req.params.id
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, user) {
        if (err) {
            return res.status(404).json({
                message: 'The authentication',
                status: 'ERROR'
            })
        }
        if (user?.isAdmin || user?.id === userId) {
            next()
        } else {
            return res.status(404).json({
                message: 'The authentication',
                status: 'ERROR'
            })
        }
    });
}


module.exports = {
    authMiddleware,
    authUserMiddleware,
}