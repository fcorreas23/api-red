import Gene from '../models/gene';

export default {

    add: async( req, res ) => {
        try {
            let { locus } = req.body
            let existGene = await Gene.findOne({ locus })

            if(existGene){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The gene is already registered: ${locus}`
                })
            }

            await Gene.create(req.body)

            res.json({
                status: 'success',
                msg: `Gene ${locus} has been created`
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
            const { id } = req.params;

            let genes = await Gene.find({assembly: id}).populate('assembly', { code:1 });

            res.json({
                status: 'success',
                msg: `Total gene: `,
                result: genes
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
    
            const gene = await Gene.findOne( { _id: id } );
    
            if(!gene){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`,
                    result: ''
                })
            }
    
            await Gene.findByIdAndUpdate( id, body, { new: true, runValidators: true });
    
            res.json({
                status: 'success',
                msg: `Gene ${gene.locus} has been updated`,

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
    
            const Gene = await Gene.findOne( { _id: id } );
    
            if(!gene){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`
                })
            }
            
            await Gene.findByIdAndDelete({ _id: id });
            //await User.findByIdAndUpdate( id, {status: false }, { new: true, runValidators: true } );

            res.json({
                status: 'success',
                msg: `Gene ${gene.locus}  has been deleted`
            })

        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    }
}