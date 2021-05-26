import { Schema, model } from 'mongoose'


const userSchema = new Schema({

    username: {
        type: String
    },

    email: {
        type: String,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['ADMIN', 'USER'],
        default: 'USER'
    },

    status: {
        type: Boolean,
        enum: [true, false],
        default: true
    }
},{

  timestamps: true

})

const User = model('user', userSchema);


export default User;