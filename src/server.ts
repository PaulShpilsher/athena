import dotenv from 'dotenv';
import express from 'express';

// initialize configuration
dotenv.config();

const app = express();

app.get('/', (request, response) => {
  response.send('Hello world!');
});

app.listen(process.env.SERVER_PORT, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${process.env.SERVER_PORT}` );
});