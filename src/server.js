import dotenv from 'dotenv'
import path from 'path'
import express from 'express'
import morgan from 'morgan'
import helmet from 'helmet'
import cors from 'cors'
import fileUpload  from 'express-fileupload'
import history from 'connect-history-api-fallback'

dotenv.config()

import rutas from './routes'

const app = express()

//middllewares
app.use(morgan('tiny'));
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(express.urlencoded({extended:true}));
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));


//setings
app.set('port', process.env.PORT || 3000 )


//Rutas
app.use('/api',rutas);

//Archivos estaticos
app.use(history());
app.use(express.static(path.join(__dirname ,'public')));


export default app
