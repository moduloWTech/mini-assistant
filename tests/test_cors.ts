import express from 'express';
import cors from 'cors';

const app = express();

const strictCors = cors({ origin: 'https://agente.moduloweb.com.br' });
const openCors = cors({ origin: '*' });

const webRouter = express.Router();
webRouter.post('/message', (req, res) => res.send('web message'));

const postRouter = express.Router();
postRouter.post('/task', (req, res) => res.send('task'));

app.use('/channels/web', openCors, webRouter);
app.use('/', strictCors, postRouter);

app.listen(3001, () => console.log('started on 3001'));
