import { Router } from 'express';
import auth from '../middllewares/auth';
import Protein from '../controllers/protein';

const route = Router();

route.post( '/add', auth.verifyAdministrador, Protein.add );
route.get( '/list', Protein.list);
route.get( '/find/:id', Protein.find);
route.put( '/edit/:id', auth.verifyAdministrador, Protein.edit);
route.delete( '/delete/:id', auth.verifyAdministrador, Protein.delete);

export default route;