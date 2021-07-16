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
        //check('phonenumber','Некорректный номер телефона').isMobilePhone()
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
            await user.updateOne({phoneNumber})
            await user.save()

            res.status(200).json({massage: "Добавил номер"})
        } catch (e) {
            console.log(e)
            res.status(500).json({massage: 'Что-то пошло не так'})
        }
    })

router.delete('/phonenumber',
    cors(),
    auth,
    [
        //check('phonenumber','Некорректный номер телефона').isMobilePhone()
    ],
    async (req: any, res: express.Response) => {
        try {
            const user = await User.findById(req.user.userId)
            await user.update({}, {phoneNumber: ''})
            console.log(user)
            await user.save()
            res.status(200).json({massage: "Номер удален"})
        } catch (e) {
            console.log(e)
            res.status(500).json({massage: 'Что-то пошло не так'})
        }
    })

module.exports = router;