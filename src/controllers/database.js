import Database from '../models/database';

export default {

    add: async( req, res ) => {
        try {
            let { name } = req.body
            let existDatabase = await Database.findOne({ name })

            if(existDatabase){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The gene is already registered: ${name}`
                })
            }

            await Database.create(req.body)

            res.json({
                status: 'success',
                msg: `Database ${name} has been created`
            })

        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    },
    list: async( req, res ) => {
        try {
            let databases = await Database.find({});

            res.json({
                status: 'success',
                msg: `List databases `,
                result: databases
            });


        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    },

    find: async( req, res ) => {
        try {
            const { database } = req.params;

            let databases = await Database.find({database});

            res.json({
                status: 'success',
                msg: `List databases `,
                result: databases
            });


        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    },

    edit: async( req, res ) => {
        try {
            const { id } = req.params;
            const { body } = req;
    
            const database = await Database.findOne( { _id: id } );
    
            if(!database){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`,
                    result: ''
                })
            }
    
            await Database.findByIdAndUpdate( id, body, { new: true, runValidators: true });
    
            res.json({
                status: 'success',
                msg: `Database ${database.name} ha been updated`,

            })
    
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error,
            });
        }
    },

    delete: async( req, res ) => {
        try {
            const { id } = req.params;
    
            const database = await Database.findOne( { _id: id } );
    
            if(!database){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`
                })
            }
            
            await Database.findByIdAndDelete({ _id: id });
            //await User.findByIdAndUpdate( id, {status: false }, { new: true, runValidators: true } );

            res.json({
                status: 'success',
                msg: `Database ${database.name} has been deleted`
            })

        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    }
}