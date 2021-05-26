import os from 'os'
import path from 'path'
import fs from 'fs'


import Project from '../models/project'

const home = os.homedir()

export default {

    add: async( req, res ) => {
        try {
            let { code } = req.body
            let existProject = await Project.findOne({ code })

            if(existProject){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The Project code is already registered: ${code}`
                })
            }

            let project = await Project.create(req.body)

            fs.mkdir(path.join(home, `/Projects/${code}`), { recursive: true }, (err) => {
                if (err) throw err;

                res.json({
                    status: 'success',
                    msg: `Project ${project.code} has been created`,

                })               
            });
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    },

    list: async( req, res ) => {
        try {
            let project = await Project.find({});

            res.json({
                status: 'success',
                msg: `Total specie: `,
                result: project
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
    
            const project = await Project.findOne( { _id: id } );
    
            if(!project){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`,
                    result: ''
                })
            }
    
            await Project.findByIdAndUpdate( id, body, { new: true, runValidators: true });
    
            res.json({
                status: 'success',
                msg: `Project ${project.code} has been updated`,

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
    
            const project = await Project.findOne( { _id: id } );
    
            if(!project){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The record does not exist`
                })
            }
            
            await Project.findByIdAndDelete({ _id: id });
            //await User.findByIdAndUpdate( id, {status: false }, { new: true, runValidators: true } );
            fs.rmdir(path.join(home, `/Projects/${project.code}`), { recursive: true }, (error) => { 
                if (error) { 
                    res.status(500).json({
                        status: 'danger',
                        msg: 'cannot delete the user folder',
                    })
                }

                res.json({
                    status: 'success',
                    msg: `Project ${project.code} has been deleted`
                })
            });
            
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    }
}