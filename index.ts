const express = require('express')
const config = require('config')
const mongoose = require('mongoose')
const cors = require('cors')

const app = express()

app.use(cors())
app.use(express.json({ extended: true }))
app.use('/api/auth', require('./routes/auth.routers'))

const PORT = config.get('port') || 5000;

async function start() {
    try {
        await mongoose.connect(config.get('mongoUri'), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex:true
        })
        app.listen(PORT , () => console.log('Вроде работает'))
    } catch (e) {
        console.log('Server error');
        process.exit(1)
    }
}

start();
