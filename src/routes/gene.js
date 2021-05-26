import { Router } from 'express';
import auth from '../middllewares/auth';
import Gene from '../controllers/gene';

const route = Router();

route.post( '/add', auth.verifyAdministrador, Gene.add );
route.get( '/list/:id', Gene.list);
route.put( '/edit/:id', auth.verifyAdministrador, Gene.edit);
route.delete( '/delete/:id', auth.verifyAdministrador, Gene.delete);

export default route;