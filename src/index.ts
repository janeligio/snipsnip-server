import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './mongoDB/mongodb';
import snippets from './routes/snippet/';
import users from './routes/user/';

const server = express()
        .use(cors())
        .use(express.json())
        .use('/snippets', snippets)
        .use('/users', users);

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
