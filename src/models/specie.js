import { Schema, model } from 'mongoose'


const specieSchema = new Schema({

    name: {
        type: String
    },

    scientific_name: {
        type: String,
        unique: true
    },

    short_name: {
        type: String,
        unique: true
    },

    alias: {
        type: String,
    },

    kingdom: {
        type: String,
        enum: ["Bacteria", "Fungi", "Plantae", "Virus", "Animalia"],
        required: true
    },

    description: {
        type: String
    },

    img: {
        type: String
    },

    status: {
        type: Boolean,
        enum: [true, false],
        default: true
    }
},{

  timestamps: true

})

const Specie = model('specie', specieSchema);


export default Specie;