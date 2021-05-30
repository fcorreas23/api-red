import { Router } from 'express';
import Seqkit from '../controllers/sekit';

const route = Router();

route.post( '/none', Seqkit.none );
route.post( '/remove_gaps', Seqkit.remove_gaps );
route.post( '/reverse', Seqkit.reverse );
route.post( '/complement', Seqkit.complement );
route.post( '/reverse_complement', Seqkit.reverse_complement);

export default route;