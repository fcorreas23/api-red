import { Schema, model } from 'mongoose'

const storageSchema = new Schema({

    user: {
        type: Schema.ObjectId, 
        ref: 'user',
    },

    filename: {
        type: String
    },

    path: {
        type: String
    },

    description: {
        type: String
    },

    type: {
        type: String,
        enum: ["fastq", "fasta", "csv", "other"]
    },

    category: {
        type: String,
        enum: ['uploaded', 'result'],
        default: "uploaded"
    }

},{

    timestamps: true

});

const Storage = model('storage', storageSchema);

export default Storage;