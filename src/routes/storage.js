import { Router } from 'express';
import auth from '../middllewares/auth';
import Storage from '../controllers/storage'

const route = Router();

route.post( '/upload', Storage.upload );
route.delete( '/delete/:id', auth.verifyUsuario, Storage.delete);
route.get( '/list', auth.verifyUsuario, Storage.list);
route.get( '/find/:uid', Storage.find);
route.get( '/download/:id', auth.verifyUsuario, Storage.download);
route.post( '/download', auth.verifyUsuario, Storage.fastDownload);

export default route