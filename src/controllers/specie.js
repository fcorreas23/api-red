import Specie from '../models/specie';

export default {

    add: async(req, res) => {
        try {
            let { scientific_name } = req.body
            let existSpecie = await Specie.findOne({ scientific_name })

            if(existSpecie){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The specie is already registered: ${scientific_name}`
                })
            }

            await Specie.create(req.body)

            res.json({
                status: 'success',
                msg: `Specie ${scientific_name} has been created`
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
            let species = await Specie.find({});

            res.json({
                status: 'success',
                msg: `Total specie: `,
                result: species
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
    
            const specie = await Specie.findOne( { _id: id } );
    
            if(!specie){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`,
                    result: ''
                })
            }
    
            await Specie.findByIdAndUpdate( id, body, { new: true, runValidators: true });
    
            res.json({
                status: 'success',
                msg: `Specie ${specie.scientific_name} has been updated`,
                result: specie

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
    
            const specie = await Specie.findOne( { _id: id } );
    
            if(!specie){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`
                })
            }
            
            await Specie.findByIdAndDelete({ _id: id });
            //await User.findByIdAndUpdate( id, {status: false }, { new: true, runValidators: true } );

            res.json({
                status: 'success',
                msg: `Specie ${specie.scientific_name}  has been deleted`
            })

        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    }
}