import express from 'express';
import 'dotenv/config'

const app = express();

const port = process.env.SERVER_PORT || 5000
app.listen(port, () => {
    console.log(`Server started at ${port}`);
});
