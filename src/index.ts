import express from 'express';
import 'dotenv/config';
import router from './routes/index';

import db from './db/models/index'

const app = express();
app.use(express.json());
app.use('/', router());

const port = process.env.SERVER_PORT || 5000;

db.sequelize.sync().then(() => {
    app.listen(port, () => {
        console.log(`Server started at ${port}`);
    });
}).catch((err: Error) => {
    console.error(err);
})
