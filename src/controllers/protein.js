import Protein from '../models/protein';
import Gene from '../models/gene';

export default {

    add: async( req, res ) => {
        try {
            let { locus } = req.body
            let existProtein = await Protein.findOne({ locus })

            if(existProtein){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The Protein is already registered: ${locus}`
                })
            }

            await Protein.create(req.body)

            res.json({
                status: 'success',
                msg: `Protein ${locus} has been created`
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

            let proteins = await Protein.find({}).populate('assembly', { code: 1 }).populate('gene');

            res.json({
                status: 'success',
                msg: `Total Proteins: `,
                result: proteins
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
            const { id } = req.params;

            //let proteins = await Protein.find({assembly: id}).populate('assembly', { code: 1 }).populate('gene', { locus:1, sequence:1 });
            let proteins = await Protein.find({assembly: id}).populate('assembly', { code: 1 });

            res.json({
                status: 'success',
                msg: `Total Proteins: `,
                result: proteins
            });


        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    },

    search: async(req, res) => {
        try {
            const text = req.params.text
            const resultados = await Protein.find({ 
                $or: [
                    {id : {$regex : text , $options: 'i' }},
                    {description: {$regex : text , $options: 'i' }},
                    {alias: {$regex : text , $options: 'i' }}
                ] 
                }).populate('assembly', { code: 1, group: 1 })
            if(resultados.length > 0){
                res.json({
                    status: "success",
                    msg: `${resultados.length} items found`,
                    result: resultados
                });
            }else{
                res.json({
                    resultados,
                    status: "danger",
                    message: `No item was found`
                });
            }
            
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error,
            });
        }

    },

    edit: async( req, res ) => {
        try {
            const { id } = req.params;
            const { body } = req;
    
            const protein = await Protein.findOne( { _id: id } );
    
            if(!protein){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`,
                    result: ''
                })
            }
    
            await Protein.findByIdAndUpdate( id, body, { new: true, runValidators: true });
    
            res.json({
                status: 'success',
                msg: `Protein ${protein.locus} has been updated`,

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
    
            const protein = await Protein.findOne( { _id: id } );
    
            if(!protein){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`
                })
            }
            
            await Protein.findByIdAndDelete({ _id: id });
            //await User.findByIdAndUpdate( id, {status: false }, { new: true, runValidators: true } );

            res.json({
                status: 'success',
                msg: `Protein ${protein.locus}  has been deleted`
            })

        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    },

    getSequence: async( req, res ) => {
        try {
            const locus = req.params.locus
            const protein = await Protein.findOne({locus}).populate('assembly', { code: 1, group: 1 })
            const nucl = await Gene.findOne({locus}, {sequence: 1})

            res.json({
                status: "success",
                result: {
                    protein,
                    nucl
                }
            });
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error,
            }); 
        }
    }
}