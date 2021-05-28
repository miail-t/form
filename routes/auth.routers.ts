import * as express from 'express';
const bcrypt = require('bcryptjs');
const config = require('config');
const cors = require('cors')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const User = require('../modules/User')
const router = express.Router();

const myValidationResult = validationResult.withDefaults({
    formatter: ({msg}: any) => msg
});

router.post('/registeraon',
    cors(),
    [
        check('email','Некорректный e-mail').isEmail(),
        check('password', 'Минимальная длина пароля 6 символов' ).isLength({ min:6 }),
        check('firstName', 'Не может быть пустым' ).notEmpty(),
        check('lastName', 'Не может быть пустым' ).notEmpty()
    ],
    async ( req: express.Request , res: express.Response ) => {
    try {
        const errors = myValidationResult( req );
        if(!errors.isEmpty()) {
            return res.status(400).json({
                ...errors.mapped()
            })
        }

        const {email, password, firstName, lastName} = req.body
        const newUser = await User.findOne({email})

        if (newUser) {
            return res.status(400).json({massage: "Такой пользователь уже существует"})
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({email, password: hashedPassword, firstName, lastName});
        await user.save()

        res.status(201).json({massage: "Пользователь создан", user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                token: getToken(user.id)
            }} )
    }catch (e) {
        res.status(500).json({massage: 'Что-то пошло не так'})
    }
})

router.post('/login',
    cors(),
    [
        check('email','Введите корректный email').normalizeEmail().isEmail(),
        check('password', 'Введите пароль' ).exists(),
        check('password', 'Не похоже на пароль' ).isLength({min: 6})
    ],
    async ( req: express.Request , res: express.Response ) => {
    try {
        const errors = myValidationResult( req )
        if(!errors.isEmpty()) {
            return res.status(400).json({
                ...errors.mapped()
            })
        }

        const {email, password } = req.body
        const user = await User.findOne({email})
        if (!user) {
            return res.status(400).json({email: "Пользователь не существует"})
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch) {
            return res.status(400).json({password: 'Неверный пароль'})
        }

        res.json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                token: getToken(user.id)
            })

    }catch (e) {
        res.status(500).json({massage: 'Что-то пошло не так'})
    }
})

router.post('/getuser',
    cors(),
    async ( req: express.Request , res: express.Response ) => {
        try {
            const { userId } = req.body
            console.log(userId)
            const user = await User.findOne({userId})
            /*if (!user) {
                return res.status(400).json({massage: ""})
            }

            const isMatch = await bcrypt.compare(password, user.password)
            if(!isMatch) {
                return res.status(400).json({massage: 'Неверный пароль'})
            }

            res.json({
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                token: getToken(user.id)
            })*/

        }catch (e) {
            res.status(500).json({massage: 'Что-то пошло не так'})
        }
    })

const getToken = (userId: string) => {
    return jwt.sign(
        {userId: userId},
        config.get('jwtSecret'),
        {expiresIn: '5m'}
    )
}

module.exports = router;
