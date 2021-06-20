import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './mongoose/mongoose';
import snippets from './routes/snippet';
import auth from './routes/authentication';
import users from './routes/user';
import authRoutes from './routes/authentication.v2';
import userRoutes from './routes/user.v2';
import snippetRoutes from './routes/snippet.v2';

const server = express()
    .use(cors())
    .use(express.json())
    .use('/snippets', snippets)
    .use('/auth', auth)
    .use('/user', users)
    .use('/api/v2/auth', authRoutes)
    .use('/api/v2/user', userRoutes)
    .use('/api/v2/snippets', snippetRoutes)
    ;

let port: any;

if (process.env.NODE_ENV === 'production') {
    port = process.env.PORT;
} else {
    port = 3001;
}

connectToDatabase();

server.get('/', (req, res) => {
    res.send("Why are you here");
});

server.listen(port, () => console.log(`Server listening on localhost:${port}`));
