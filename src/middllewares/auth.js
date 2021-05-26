import jwt from 'jsonwebtoken';
import User from '../models/user';

export default {
    /*
    |--------------------------------------------------------------------------
    | Permiso para todo los usuarios
    |--------------------------------------------------------------------------
    */
    verifyUsuario: async ( req, res, next ) => {
        
        if( !req.headers.token ) {
            
            return res.status(401).send({
                status: 'danger',
                msg: 'No posee las credenciales para contiunar'
            });
        }
        
        const { _id } = jwt.verify( req.headers.token, process.env.SECRET_KEY );
        const user = await User.findOne({ _id, status:true });

        if(user){

            if (user.role === 'ADMIN' || user.role === 'USER'){
                next();
            
            } else{
                return res.status(403).json({
                    status: 'failed',
                    message: 'No tiene los permisos necesarios'
                });
            }

        }else{
            return res.status(403).json({
                status: 'danger',
                msg: 'No tiene los permisos necesarios'
            });
        }
    },

    /*
    |--------------------------------------------------------------------------
    | Permiso para solo administradores
    |--------------------------------------------------------------------------
    */

    verifyAdministrador: async (req,res,next) => {
        if( !req.headers.token ) {
            
            return res.status(401).send({
                status: 'danger',
                msg: 'No posee las credenciales para contiunar'
            });
        }
        
        const { _id } = jwt.verify( req.headers.token, process.env.SECRET_KEY );
        const user = await User.findOne({ _id, status:true });

        if(user){

            if (user.role === 'ADMIN'){
                next();
            
            } else{
                return res.status(403).json({
                    status: 'failed',
                    message: 'No tiene los permisos necesarios'
                });
            }

        }else{
            return res.status(403).json({
                status: 'danger',
                msg: 'No tiene los permisos necesarios'
            });
        }
    }
}