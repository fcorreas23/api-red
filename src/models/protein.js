import {Schema , model} from 'mongoose';


const proteinSchema = new Schema({

    locus: {
        type: String, 
        required: true,
        unique: true,
    },

    assembly: {
        type: Schema.ObjectId, 
        ref: 'assembly',
        required: true
    },
    
    gene: {
        type: Schema.ObjectId, 
        ref: 'gene',
        required: true
    },
    
    sequence: {
        type: String, 
    },
    length: {
        type: Number
    },
    description: {
        type: String
    },
    alias:{
        type: String
    },
    cog_funcional:{
        type: String
    },
    gene_ontology:{
        type: String
    },
    kegg_ko:{
        type: String
    },
    kegg_pathway:{
        type: String
    }
},{
    timestamps: true
})

/* proteinSchema.virtual('mrna',{
    ref: 'gene',
    localField: 'locus', // Find people where `localField`
    foreignField: 'locus', // is equal to `foreignField`
    match: { isActive: true }
}) */
const Protein = model('protein', proteinSchema);

export default Protein;