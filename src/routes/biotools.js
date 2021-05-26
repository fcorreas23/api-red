import { Router } from 'express';
import auth from '../middllewares/auth';
import Biotools from '../controllers//biotools';


const route = Router();

route.post( '/blast', Biotools.blast);
route.post( '/fastqc', Biotools.fastqc);
route.post( '/bbduk', Biotools.bbduk);
route.post( '/fscreen', Biotools.fscreen);
route.post( '/unicycler', Biotools.unicycler);
route.post( '/quast', Biotools.quast);
route.post( '/prokka', Biotools.prokka);


export default route;