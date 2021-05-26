import {Schema , model} from 'mongoose';

const geneSchema = new Schema({

    locus: {
        type: String, 
        required: true,
        unique: true
    },

    assembly: {
        type: Schema.ObjectId, 
        ref: 'assembly',
        required: true
    },

    sequence: {
        type: String, 
        required: true
    },

    length: {
        type: String
    },
    
    product: {
        type: String,
        enum: ['mRNA', 'tRNA', 'rRNA', 'tmRNA','smallRNA']
    },

    description: {
        type: String
    }
},{
    timestamps: true
});
const Gene = model('gene', geneSchema);

export default Gene;