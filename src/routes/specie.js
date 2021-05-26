import { Router } from 'express';
import auth from '../middllewares/auth';
import Specie from '../controllers/specie';

const route = Router();

route.post( '/add', auth.verifyAdministrador, Specie.add );
route.get( '/list', Specie.list);
route.put( '/edit/:id', auth.verifyAdministrador, Specie.edit);
route.delete( '/delete/:id', auth.verifyAdministrador, Specie.delete);

export default route;