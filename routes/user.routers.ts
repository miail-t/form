import * as express from 'express';

const cors = require('cors')
const auth = require('../middleware/auth.middleware')

const {check, validationResult} = require('express-validator')
const User = require('../modules/User')
const router = express.Router();

const myValidationResult = validationResult.withDefaults({
    formatter: ({msg}: any) => msg
});

router.put('/phonenumber',
    cors(),
    auth,
    [
        check('phoneNumber','Некорректный номер телефона').isMobilePhone('ru-RU')
    ],
    async (req: any, res: express.Response) => {
        try {
            const errors = myValidationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    ...errors.mapped()
                })
            }

            const {phoneNumber} = req.body
            if (!phoneNumber) {
                return res.status(400).json({massage: "Не может быть пустым"})
            }

            const user = await User.findOne({_id: req.user.userId})
            await user.set({"phoneNumber": phoneNumber})
            await user.save();

            console.log(user)

            res.status(200).json({
                massage: "Номер успешно добавлен",
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    token: req.user.token
                }
            })
        } catch (e) {
            console.log(e)
            res.status(500).json({massage: 'Что-то пошло не так'})
        }
    })

router.delete('/phonenumber',
    cors(),
    auth,
    [
    ],
    async (req: any, res: express.Response) => {
        try {
            const user = await User.findOne({_id: req.user.userId})

            if (!user.phoneNumber) {
                return res.status(400).json({massage: "Номера не существует"})
            }
            await user.set({"phoneNumber": undefined})

            await user.save()
            res.status(200).json({
                massage: "Номер удален",
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    token: req.user.token
                }
            })
        } catch (e) {
            console.log(e)
            res.status(500).json({massage: 'Что-то пошло не так'})
        }
    })

module.exports = router;