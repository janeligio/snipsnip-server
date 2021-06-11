import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './mongoose/mongoose';
import snippets from './routes/snippet';
import auth from './routes/authentication';
import users from './routes/user';

const server = express()
        .use(cors())
        .use(express.json())
        .use('/snippets', snippets)
        .use('/auth', auth)
        .use('/user', users);

let port:any;

if(process.env.NODE_ENV === 'production') {
    port = process.env.PORT;
} else {
    port = 3001;
}

connectToDatabase();

server.get('/', (req, res) => {
    res.send("Why are you here");
});

server.listen(port, () => console.log(`Server listening on localhost:${port}`));
