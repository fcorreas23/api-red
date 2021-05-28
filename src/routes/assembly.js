import { Router } from 'express';
import auth from '../middllewares/auth';
import Assembly from '../controllers/assembly';

const route = Router();

route.post( '/add', auth.verifyAdministrador, Assembly.add );
route.get( '/list', Assembly.list);
route.get( '/find/:id', Assembly.find);
route.get( '/get-assembly/:id', Assembly.getAssembly);
route.put( '/edit/:id', auth.verifyAdministrador, Assembly.edit);
route.delete( '/delete/:id', auth.verifyAdministrador, Assembly.delete);

export default route;