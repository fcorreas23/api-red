import os from 'os'
import path from 'path'
import fs from 'fs-extra'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';


const home = os.homedir()

export default {

    add: async( req, res ) => {

        try {

            let { username, email, password, role } = req.body
            let emailExist = await User.findOne( {email} );

            if(emailExist){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The email is already registered: ${email}`
                })
            }

            password = await bcrypt.hash(password, 10);
            let user = await User.create({ username, email, password, role });
            
            fs.mkdir(path.join(home, `/Storage/${user._id}/tmp`), { recursive: true }, (err) => { 
                if (err) throw err;

                fs.mkdir(path.join(home, `/Storage/${user._id}/results`), { recursive: true }, (err) => {
                    if (err) throw err;

                    res.json({
                        status: 'success',
                        msg: `User ${user._id} has been created`
                    })                
                });                                   
            }); 
            
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }

    },

    list: async(req, res) => {
        try {

            let users = await User.find({},{ password:0, updatedAt:0 });
            let amount = await User.countDocuments({}); 
            
            res.json({
                status: 'success',
                msg: `Total users: ${amount}`,
                result: users
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
    
            const user = await User.findOne( { _id: id } );
    
            if(!user){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`,
                    result: ''
                })
            }
    
            await User.findByIdAndUpdate( id, body, { new: true, runValidators: true });
    
            res.json({
                status: 'success',
                msg: `User ${id} updated`,
                result: ''

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
    
            const user = await User.findOne( { _id: id } );
    
            if(!user){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`
                })
            }
            
            await User.findByIdAndDelete({ _id: id });
            //await User.findByIdAndUpdate( id, {status: false }, { new: true, runValidators: true } );

            fs.rmdir(path.join(home, `/storage/${id}`), { recursive: true }, (error) => { 
                if (error) { 
                    res.status(500).json({
                        status: 'danger',
                        msg: 'cannot delete the user folder',
                    })
                }

                res.json({
                    status: 'success',
                    msg: `User ${user.username} Deleted`
                })
            });

        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    },

    login: async( req, res ) => {
        try {
            const user = await User.findOne({ email: req.body.email, status: true });
            
            if(user){
                let match = await bcrypt.compare(req.body.password, user.password)
                
                if(match){
                    
                    let payload = {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        status: user.status
                    }

                    //Generando token
                    const token = jwt.sign(payload, process.env.SECRET_KEY, {
                        expiresIn: 60 * 60 * 24  // expires in 24 hours
                    })

                    //let tokenReturn = encode(payload)
                    res.status(200).json({
                        status: 'success',
                        msg: `Welcome ${user.username}`,
                        token              
                    });

                }else{
                    res.status(404).json({
                        status: 'warning',
                        msg: "Username or password is incorrect"
                    });
                }
            }else{
                
                res.status(404).json({
                    status: 'warning',
                    msg: "Username or password is incorrect"
                });           
            }

        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: 'Unable to Sign In',
                result: error
            })
        }
    },

    logout: (req, res) => {
        let tmp = path.join(home, `Storage/${req.body.user}/tmp`)
        fs.emptyDir(tmp, (err) => {
            if (err) return console.error(err)
            
            res.json({
                status: 'success',
                msg: 'GoodBay, removed temp files'
            })
        })
    }
}
