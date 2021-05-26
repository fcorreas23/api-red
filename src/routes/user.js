import { Router } from 'express';
import auth from '../middllewares/auth';
import User from '../controllers/user'

const route = Router();

route.post( '/add', auth.verifyAdministrador, User.add );
route.get( '/list', auth.verifyAdministrador, User.list );
route.put( '/edit/:id', auth.verifyAdministrador, User.edit);
route.delete( '/delete/:id', auth.verifyAdministrador, User.delete);
route.post( '/login', User.login);
route.post( '/logout', User.logout);

export default route