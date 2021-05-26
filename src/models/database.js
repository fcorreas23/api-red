import { Schema, model } from 'mongoose'

const databaseSchema = new Schema({

    name: {
        type: String
    },

    database: {
        type: String,
        enum:['blastdb', 'bowtie2', 'busco', 'references', 'pfam']
    },

    datatype: {
        type: String,
        enum: ['nucl', 'prot']
    },

    path: {
        type: String
    }
})

const Databases = model('database', databaseSchema);

export default Databases