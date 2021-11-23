import { Router } from 'express';
import auth from '../middllewares/auth';
import Biotools from '../controllers//biotools';


const route = Router();

route.post( '/blast', Biotools.blast);
route.post( '/in_silico_pcr', Biotools.in_silico_pcr);
route.post( '/perf', Biotools.perf);
route.post( '/corehunter', Biotools.corehunter)


route.post( '/fastqc', Biotools.fastqc);
route.post( '/bbduk', Biotools.bbduk);
route.post( '/fscreen', Biotools.fscreen);
route.post( '/unicycler', Biotools.unicycler);
route.post( '/quast', Biotools.quast);
route.post( '/prokka', Biotools.prokka);
route.post( '/busco', Biotools.busco);


export default route;