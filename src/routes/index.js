import { Router } from 'express';
import userRoute from './user';
import storageRoute from "./storage";
import specieRoute from './specie';
import projectRoute from './project';
import assemblyRoute from './assembly';
import databaseRoute from './database';
import geneRoute from './gene';
import proteinRoute from './protein';
import biotoolsRoute from './biotools'

const route = Router();

route.use( '/user', userRoute );
route.use( '/storage', storageRoute);
route.use( '/specie', specieRoute);
route.use( '/project', projectRoute);
route.use( '/assembly', assemblyRoute);
route.use( '/database', databaseRoute);
route.use( '/gene', geneRoute);
route.use( '/protein', proteinRoute);
route.use( '/biotools', biotoolsRoute);


export default route;