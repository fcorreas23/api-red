import { spawn } from 'child_process';

export default {

    none: (req, res) => {
        let seq = spawn('echo',['-e', `${req.body.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-w', req.body.width, req.body.case])
        let result = ''
        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    

        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                res.json({
                    status: "success",
                    msg: "sequene edited",
                    sequence: result
                })
            }else{
                res.json({
                    status: "failed",
                    message: `Error`,
                    result: ''
                })
            }   
        });
    },

    remove_gaps: (req, res) => {
        
        let seq = spawn('echo',['-e', `${req.body.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-g','-w', req.body.width, req.body.case])
        let result = ''

        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    
        
        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                res.json({
                    status: "success",
                    msg: "sequene edited",
                    sequence: result
                })
            }else{
                res.json({
                    status: "failed",
                    message: `Error`,
                    result: ''
                })
            }   
            
        });

    },
    
    reverse: (req, res) => {
        
        let seq = spawn('echo',['-e', `${req.body.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-r','-w', req.body.width, req.body.case])
        let result = ''

        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    
        
        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                res.json({
                    status: "success",
                    msg: "sequene edited",
                    sequence: result
                })
            }else{
                res.json({
                    status: "failed",
                    message: `Error`,
                    result: ''
                })
            }   
            
        });

    },

    complement: (req, res) => {

        let seq = spawn('echo',['-e', `${req.body.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-p','-w', req.body.width, req.body.case])
        let result = ''

        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    
        
        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                res.json({
                    status: "success",
                    msg: "sequene edited",
                    sequence: result
                })
            }else{
                res.json({
                    status: "failed",
                    message: `Error`,
                    result: ''
                })
            }   
            
        });

    },

    reverse_complement: (req, res) => {

        let seq = spawn('echo',['-e', `${req.body.sequence}`])
        let seqkit = spawn('seqkit', ['seq', '-r','-p','-w', req.body.width, req.body.case])
        let result = ''

        seq.stdout.on('data', (data) => {
            seqkit.stdin.write(data)
        })
        seq.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`);});
        seq.on('close', (code) => {
            console.log(`echo process exited with code ${code}`)
            seqkit.stdin.end();
        });

        seqkit.stdout.on('data', (data) => { result += data.toString();});    
        
        seqkit.on('close', (code) => {
            if(code == 0){
                console.log(`seqkit process exited with code ${code}`);
                res.json({
                    status: "success",
                    msg: "sequene edited",
                    sequence: result
                })
            }else{
                res.json({
                    status: "failed",
                    message: `Error`,
                    result: ''
                })
            }   
            
        });

    }
}