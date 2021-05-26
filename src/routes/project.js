import { Router } from 'express';
import auth from '../middllewares/auth';
import Project from '../controllers/project';

const route = Router();

route.post( '/add', auth.verifyAdministrador, Project.add );
route.get( '/list', Project.list);
route.put( '/edit/:id', auth.verifyAdministrador, Project.edit);
route.delete( '/delete/:id', auth.verifyAdministrador, Project.delete);

export default route;