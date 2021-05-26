import { Router } from 'express';
import auth from '../middllewares/auth';
import Database from '../controllers/database';

const route = Router();

route.post( '/add', auth.verifyAdministrador, Database.add );
route.get( '/list', Database.list);
route.get( '/find/:database', Database.find);
route.put( '/edit/:id', auth.verifyAdministrador, Database.edit);
route.delete( '/delete/:id', auth.verifyAdministrador, Database.delete);

export default route;