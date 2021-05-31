import { exec, spawn } from 'child_process'
import os from 'os'
import path from 'path'
import fs from 'fs'
import compress, { zip } from 'zip-a-folder'
import zipdir from 'zip-dir'
import csv from 'csv-parser';
import Storage from '../models/storage'
import Report from '../services/report'
import Assembly from '../models/assembly';
import { Z_PARTIAL_FLUSH } from 'zlib'

const home = os.homedir()
const databasesRoot = path.join(os.homedir(), 'Databases');
const bbduk  = '/opt/biotools/bbmap/bbduk.sh'
const spades = '/opt/biotools/Spades/SPAdes-3.13.0-Linux/bin/spades.py'
const prokka = '/opt/biotools/prokka/bin/prokka'
const fqScreen = '/opt/biotools/FastQ-Screen-0.14.1/fastq_screen'


function percent (result, total){
    let percent = (result * 100) / total;
    return percent.toFixed(2)
}

export default {

    blast: (req, res ) => {
        try {
            console.log(req.body)
            let database = path.join('/srv/databases', req.body.database)
            let outfmt = "6 qseqid qlen sseqid slen stitle pident qcovs length mismatch gapopen evalue bitscore"
            let headers = ['qseqid', 'qlen', 'sseqid', 'slen','stitle', 'pident', 'qcovs','length', 'mismatch', 'gapopen', 'evalue', 'bitscore']         
            let sequences = spawn('echo',[`${req.body.sequences}`])
            let blast= spawn(`${req.body.type}`, ['-db', database,'-max_target_seqs', 30 ,'-evalue', 1e-25, '-num_threads', process.env.THREADSM, '-outfmt', outfmt])
            let output = ''
            sequences.stdout.on('data', (data) => { blast.stdin.write(data) });
            sequences.stderr.on('data', (data) => { console.error(`stderr seq: ${data}`); });
            sequences.on('close', (code) => {
                if (code != 0) {
                    console.log(`echo process exited with code ${code}`);
                    return res.json({
                        status: 'danger',
                        msg: 'ERROR sequences blast'
                    })
                }
                blast.stdin.end();
            });

            blast.stdout.on('data', (data) => { output += data.toString();});    
            blast.stderr.on('data', (data) => { console.error(`blaststderr: ${data}`);});

            blast.on('close', (code) => {
                console.log(`blast process exited with code ${code}`);
                if (code !== 0) {
                    return res.json({
                        status: 'danger',
                        msg: 'ERROR Blast'
                    })
                }

                res.json({
                    status: 'success',
                    msg: 'Blast finished',
                    result : Report.blastReport(output, headers)
                })
    
                /* res.json({
                    status: 'success',
                    msg: 'Blast finished',
                    result: JSON.parse(result) //outfmt 15
                }) */
            });

        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }

    },

    in_silico_pcr: async( req, res ) => {
        try {
            let stats = '';
            let amplicon = '';
            let tax = await Assembly.findOne({code : req.body.seq}, {group: 1})
            let input = `/srv/ftp/public/Pseudomonas/${tax.group}/${req.body.seq}/${req.body.seq}${req.body.target}`

            const in_silico = spawn('in_silico_PCR.pl', ['-s', input, '-a', req.body.forward, '-b', req.body.reverse, '-m', req.body.mismatch]);

            in_silico.stdout.on('data', (data) =>{ console.log( stats += data.toString())});
            in_silico.stderr.on('data', (data) =>{ console.log( amplicon += data.toString())});

            in_silico.on('close', (code) => {
                console.log(`in_silico_pcr process exited with code ${code}`);
                if(code != 0){
                    return res.json({
                        status: 'danger',
                        msg: 'ERROR PCR in silico finished',
                        result: ''
                    })
                }
                res.json({
                    status: 'success',
                    msg: 'PCR in silico finished',
                    result: {
                        pcr_stats : Report.tsv2Json(stats),
                        amplicon
                    }
                })
            })
           
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }

    },

    perf : async( req, res) => {
        const file_name = Date.now()
        const report = []
        const headers = ['Chromosome','Repeat Start','Repeat Stop', 'Repeat Class', 'Repeat Length', 'Repeat Strand', 'Motif Number', 'Actual Repeat']
        
        fs.writeFile(`/tmp/${file_name}.motif`, `2\t${req.body.di}\n3\t${req.body.tri}\n4\t${req.body.tetra}\n5\t${req.body.penta}\n6\t${req.body.hexa}`, (err) => {
            if (err) return res.json({status: 'danger', msg: err});
            
            let sampleFile = req.files.file;
            let path_file = `/tmp/${sampleFile.name}`;
            let name = path.basename(path_file).split('.')    
            sampleFile.mv(path_file, (err) => {
                if (err) return res.json({status: 'danger', msg: err});

                let cmd_perf = spawn('PERF', ['-i', path_file, '-u', `/tmp/${file_name}.motif`,'-a' ,'-t', 4])
                cmd_perf.stdout.on('data', (data) => {console.log(data.toString())});

                cmd_perf.on('close', (code)=> {
                    console.log(`PERF process exited with code ${code}`);
                    if(code == 0){

                        fs.createReadStream(`/tmp/${name[0]}_perf.tsv`)
                        .pipe(csv({ separator: '\t', headers }))
                        .on('data', (data) => report.push(data))
                        .on('end', () => {
                            res.json({
                                status: 'success',
                                msg: 'PERF complete',
                                result: {
                                    stats: report,
                                    html: `/tmp/${name[0]}_perf.html`,
                                    tsv: `/tmp/${name[0]}_perf.tsv`,
                                }
                           })
                        });
                    }else{
                        res.json({
                            status: 'danger',
                            msg: 'ERROR',
                            result: ''
                        })
                    }  
                })
            })
        })
    },

    /* 
        PRE ASSEMBLY
    */
    fastqc: (req, res) => {
       try {
            let fastq= path.join(os.homedir(), req.body.fastq)
            let output = path.join(os.homedir(), `Storage/${req.body.user._id}/tmp/`);
            let file_name = path.basename(req.body.fastq).split('.');

            let fastqc = spawn('fastqc',['-t', 2, '-o', output, '--extract', fastq])

            fastqc.stderr.on('data', (data) => {console.log(data.toString())});
       
            fastqc.on('close', (code) => {
                console.log(`fastqc process exited with code ${code}`);
                if(code == 0){
                    
                    Report.fastqcSumary(`${output}${file_name[0]}_fastqc/summary.txt`, (err, sumary) => {
                        if(err) console.log('Something went wrong!', err);

                        Report.fastqcData(`${output}${file_name[0]}_fastqc/fastqc_data.txt`, (err, data) => {
                            if(err) console.log('Something went wrong!', err);
                            
                            return res.json({
                                status: 'success',
                                msg: 'FastQC finished',
                                result: {
                                    basic: data,
                                    summary: sumary,
                                    report: `Storage/${req.body.user._id}/tmp/${file_name[0]}_fastqc.zip`
                                }
                            })
                        })
                    })

                }else{
                    res.json({
                        status: 'danger',
                        msg: 'FastQC finished with error',
                        result: ''
                    })
                }            
            })
           
       } catch (error) {
        res.status(500).json({
            status: 'danger',
            msg: error
        });
       }

    },

    bbduk: async(req, res ) => {
        try {
            let baseName = await Storage.findOne( {filename: `${req.body.basename}_R1_good.fq.gz`} );

            if(baseName){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The Basename is already registered: ${req.body.basename}`
                })

            }else{
                let fq1 = path.join(os.homedir(), req.body.fq1)
                let fq2 = path.join(os.homedir(), req.body.fq2)
                let output = path.join(os.homedir(), `Storage/${req.body.user._id}/results`)
                let log = ''
                let msg = 'Input is being processed as paired'
                let params = [  
                    `in1=${fq1}`,
                    `out1=${output}/${req.body.basename}_R1_good.fq.gz`, 
                    `in2=${fq2}`,
                    `out2=${output}/${req.body.basename}_R2_good.fq.gz`, 
                    'ref=/opt/biotools/bbmap/resources/adapters.fa', 
                    `minavgquality=${req.body.minavgquality}`,
                    `trimq=${req.body.trimq}`,
                    `qtrim=${req.body.qtrim}`, 
                    `minlen=${req.body.length}`,
                    'ftm=5',
                    `ftl=${req.body.ftl}`,
                    'json=t'
                ]
                if(!req.body.paired){
                    params.splice(2,2)
                    msg='Input is being processed as unpaired'
                } 
        
                let  cmd_bbduk = spawn(bbduk, params)
            
                cmd_bbduk.stderr.on('data', (data) => {
                    log += data.toString()
                    console.log(data.toString())
                });

                cmd_bbduk.on('close', (code) => {
                    console.log(`BBDuk process exited with code ${code}`);
                    if(code == 0){

                        let trimfq1 = {
                            user: req.body.user._id,
                            filename: `${req.body.basename}_R1_good.fq.gz`,
                            description: `BBDuk triming result`,
                            path: `Storage/${req.body.user._id}/results/${req.body.basename}_R1_good.fq.gz`,
                            type: 'fastq',
                            category: 'result'
                        }

                        let trimfq2 = {
                            user: req.body.user._id,
                            filename: `${req.body.basename}_R2_good.fq.gz`,
                            description: `BBDuk triming result`,
                            path: `Storage/${req.body.user._id}/results/${req.body.basename}_R2_good.fq.gz`,
                            type: 'fastq',
                            category: 'result'
                        }
                        let json = JSON.parse(log)

                        Storage.insertMany([trimfq1, trimfq2], (err, data) => {
                            if(err) console.log('Something went wrong!', err);
                            res.json({
                                status: 'success',
                                msg,
                                result: {
                                    readsIn: json.readsIn,
                                    basesIn: json.basesIn,
                                    readsKFiltered: `${json.readsKFiltered} (${percent( json.readsKFiltered, json.basesIn)}%)`,
                                    basesKFiltered: `${json.basesKFiltered} (${percent( json.basesKFiltered, json.basesIn)}%)`,
                                    readsQTrimmed: `${json.readsQTrimmed} (${percent( json.readsQTrimmed, json.readsIn)}%)`,
                                    basesQTrimmed: `${json.basesQTrimmed} (${percent( json.basesQTrimmed, json.basesIn)}%)`,
                                    readsRemoved: `${json.readsRemoved} (${percent( json.readsRemoved, json.readsIn)}%)`,
                                    basesRemoved: `${json.basesRemoved} (${percent( json.basesRemoved, json.basesIn)}%)`,
                                    readsOut: `${json.readsOut} (${percent( json.readsOut, json.readsIn)}%)`,
                                    basesOut: `${json.basesOut} (${percent( json.basesOut, json.basesIn)}%)`,

                                }
                            })
                        })
                    }else{
                        res.json({
                            status: 'danger',
                            msg: 'BBDuk finished with error',
                            result: ''
                        })
                    }
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    },

    fscreen: async (req, res ) => {
        try {
            let baseName = await Storage.findOne( {filename: `${req.body.basename}.zip`} );

            if(baseName){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The Basename is already registered: ${req.body.basename}`
                })

            }else{

                let fastq = path.join(os.homedir(), req.body.fastq)
                let output = path.join(os.homedir(), `Storage/${req.body.user._id}/tmp/${req.body.basename}`)
                let config = path.join(os.homedir(), `Storage/${req.body.user._id}/tmp/fscreen.conf.txt`)
                let basename = path.basename(fastq).split('.')
                let file_config = fs.createWriteStream(config);

                let databases =  req.body.databases.map(x => {
                    let name = x.split(path.sep)
                    let nameCapitalized = name[name.length-1].charAt(0).toUpperCase() + name[name.length-1].slice(1)
                    return `DATABASE\t${nameCapitalized}\t${path.join('/srv/databases', x)}`
                }) 

                file_config.on('error', function(err) {
                    console.log(err)
                    res.status(500).json({
                        status: 'danger',
                        msg: error
                    });
                });

                databases.forEach(value => file_config.write(`${value}\r\n`));

                file_config.on('finish', () => {
                    console.log(`wrote all the array data to file ${config}`);
                    
                    let cmd_fscreen = spawn(fqScreen, ['--aligner', 'bowtie2', '--conf', config, '--outdir', output, '--threads', 6, '--force', '--subset', req.body.subset, fastq])
                    
                    cmd_fscreen.stdout.on('data', (data) => {console.log(data.toString())});
                    cmd_fscreen.stderr.on('data', (data) => {console.log(data.toString())});

                    cmd_fscreen.on('close', (code) => {
                        console.log(`fastq screen process exited with code ${code}`);
                        if(code == 0){

                            zipdir(output, { saveTo: `${home}/Storage/${req.body.user._id}/results/${req.body.basename}.zip` }, function (err, buffer) {
                                if(err) console.log('Something went wrong!', err);
                            })

                            let aResult = {
                                user: `${req.body.user._id}`,
                                filename: `${req.body.basename}.zip`,
                                path: `Storage/${req.body.user._id}/results/${req.body.basename}.zip`,
                                description: `Fastq Screen result`,
                                type: 'other',
                                category: 'result'
                            }
                            
                            Storage.create(aResult, (err, data) => {
                                if(err) console.log('Something went wrong!', err);

                                Report.getImg(`${output}/${basename[0]}_screen.png`, (err, img) => {
                                    if(err) console.log('Something went wrong!', err);
                                    res.json({
                                        status: 'success',
                                        msg: 'Fastq Screen',
                                        result: {
                                            report: data,
                                            img
                                        }        
                                    })
                                })
                            })
                        }else{
                            res.json({
                                status: 'danger',
                                msg: 'Unicycler finished with error',
                                result: ''
                            })
                        }
                    })
                });
                
                file_config.end();
            }
            
            
        } catch (error) {
            console.log(`Error: ${error}`)
             
        }
    },

    /*
     ASSEMBLY
    */
    unicycler: async(req, res) => {
        try {

            let projectName = await Storage.findOne( {filename: `${req.body.name}.zip`} );

            if(projectName){
                return res.status(400).json({
                    status: 'warning',
                    msg: `The project name is already registered: ${req.body.name}`
                })
            }else{
                let fq1 = path.join(os.homedir(), req.body.fq1)
                let fq2 = path.join(os.homedir(), req.body.fq2)
                let output = path.join(os.homedir(), `Storage/${req.body.user._id}/tmp/${req.body.name}`)
                let unicycler = spawn('unicycler',['-1', fq1, '-2', fq2,'--mode', req.body.mode, '--min_fasta_length', req.body.length, '-t', process.env.THREADSH,'-o', output,'--spades_path', spades, '--keep', 0])
                
                unicycler.stderr.on('data', (data) => {console.log(data.toString())});
                unicycler.stdout.on('data', (data) => {console.log(data.toString())});
                
                unicycler.on('close', (code) => {
                    console.log(`unicycler process exited with code ${code}`);
                    if(code == 0){

                        compress.zipFolder(output, `${home}/Storage/${req.body.user._id}/results/${req.body.name}.zip`, function(err){
                            if(err){ return cb(err, null)}

                            fs.rename(`${output}/assembly.fasta`, `${home}/Storage/${req.body.user._id}/results/${req.body.name}_genomic.fna`, (err) => {
                                if(err) console.log('Something went wrong!', err);
                                
                            });

                        })

                        /* zipdir(output, { saveTo: `${home}/Storage/${req.body.user._id}/results/${req.body.name}.zip` }, function (err, buffer) {
                            if(err) console.log('Something went wrong!', err);

                            fs.rename(`${output}/assembly.fasta`, `${home}/Storage/${req.body.user._id}/results/${req.body.name}_genomic.fna`, (err) => {
                                if(err) console.log('Something went wrong!', err);
                                
                            });
                        }) */
                        
                        let aResult = {
                            user: `${req.body.user._id}`,
                            filename: `${req.body.name}.zip`,
                            path: `Storage/${req.body.user._id}/results/${req.body.name}.zip`,
                            description: `Unicycler assembly result`,
                            type: 'other',
                            category: 'result'
                        }

                        let aGenomic = {
                            user: `${req.body.user._id}`,
                            filename: `${req.body.name}_genomic.fna`,
                            path: `Storage/${req.body.user._id}/results/${req.body.name}_genomic.fna`,
                            description: `Draft genome Unicycler assembly`,
                            type: 'fasta',
                            category: 'result'
                            
                        }

                        Storage.insertMany([aResult, aGenomic], (err, data) => {
                            if(err) return console.error('Something went wrong!', err);

                            console.log('Unicycler finished')

                            /* res.json({

                                msg:'Unicycler finished'
                            }) */
                            
                            /* Report.assemblyStats(`${home}/Storage/${req.body.user._id}/results/${req.body.name}_genomic.fna`, (err, stdout) => {
                                if(err) return console.error('Something went wrong!', err); 

                                res.json({
                                    status: 'success',
                                    status: 'success',
                                    result: {
                                        stats: JSON.parse(stdout),
                                        unicycler: data[0]
                                    }
                                })
                            })*/                  
                        })
                    }else{
                        res.json({
                            status: 'danger',
                            msg: 'Unicycler finished with error',
                            result: ''
                        })
                    }
                })

                res.json({
                    status: 'success',
                    msg: `Proyecto ${req.body.name} esta corriendo. Una vez terminado se avisará al correo ${req.body.user.email}`
                })
            }
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });
        }
    },

    /*
        POST ASSEMBLY
    */
    quast: (req, res ) => {

        try {

            console.log(req.body)
            let assembly = path.join(os.homedir(), req.body.assembly)
            let reference = `/srv/databases/genomes/${req.body.reference}_genomic`
            let output = path.join(os.homedir(), `Storage/${req.body.user._id}/tmp/${req.body.name}`);
            
            let quast = spawn('quast.py', ['-r', `${reference}.fna`, '-g', `${reference}.gff`, '-t', process.env.THREADSM, '-o', output, '--no-html','--no-icarus', assembly])
            
            quast.stdout.on('data', (data) => {console.log(data.toString())})

            quast.on('close', (code) => {
                console.log(`Quast process exited with code ${code}`);
                if(code == 0){
                    zipdir(output, { saveTo: `${home}/Storage/${req.body.user._id}/results/${req.body.name}.zip` }, function (err, buffer) {
                        if(err) console.log('Something went wrong!', err);
                        console.log('Quast result zipped')
                    })

                    let qResult = {
                        user: `${req.body.user._id}`,
                        filename: `${req.body.name}.zip`,
                        path: `Storage/${req.body.user._id}/results/${req.body.name}.zip`,
                        description: 'Quast report result',
                        type: 'other',
                        category: 'result'
                    }

                    Storage.create(qResult, (err, data) => {
                        if(err) console.log('Something went wrong!', err);
                        Report.quastReport(`${output}/report.tsv`, (err, report) => {
                            if(err) console.log('Something went wrong!', err);
                            
                            Report.quastReport(`${output}/contigs_reports/unaligned_report.tsv`, (err, unaligned) => {
                                if(err) console.log('Something went wrong!', err);

                                res.json({
                                    status: 'success',
                                    msg:'Quast finished',
                                    result: {
                                        quast: data,
                                        report,
                                        unaligned
                                    }
                                })
                            })
                        })
                    })
                    
                }else{
                    return res.json({
                        status: 'danger',
                        msg: 'Quast finished with error',
                        result: ''
                    })
                }  
            }) 
            
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            });  
        }

    },

    prokka: (req, res) => {
        try {
            console.log(req.body)
            let assembly = path.join(os.homedir(), req.body.assembly)
            let output = path.join(os.homedir(), `Storage/${req.body.user._id}/tmp/${req.body.name}`);
           
            let cmd_prokka = spawn( prokka, ['--outdir', output, '--prefix', req.body.name, '--locustag', req.body.locustag, '--kingdom', req.body.kingdom, '--cpus', process.env.THREADSH, '--force', assembly])
            
            console.log(cmd_prokka)
            cmd_prokka.stderr.on('data', (data) => {console.log(data.toString())});


            cmd_prokka.on('close', (code) => {
                console.log(`prokka process exited with code ${code}`);
                if(code == 0){

                    zipdir(output, { 
                        saveTo: `${home}/Storage/${req.body.user._id}/results/${req.body.name}.zip` 
                    }, function (err, buffer) {
                        if(err) console.log('Something went wrong!', err);
                        
                        console.log('Prokka result zipped')
                    })

                    let pResult = {
                        user: req.body.user._id,
                        filename: `${req.body.name}.zip`,
                        path: `Storage/${req.body.user._id}/results/${req.body.name}.zip`,
                        description: 'Prokka prediccion result',
                        type: 'other',
                        category: 'result'
                    }

                    Storage.create(pResult, (err, data) => {
                        if(err) console.log('Something went wrong!', err);
                        res.json({
                            status: 'success',
                            msg:'Prokka finished',
                            result: {
                                prokka: data,
                                report: `${output}/${req.body.name}.txt`
                            }
                        })
                    })                
                }else{
                    return res.json({
                        status: 'danger',
                        msg: 'Prokka finished with error',
                        result: ''
                    })
                }
            }) 
            
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            }); 
        }
    },

    busco: (req, res) => {
        try {
            let config = '/opt/biotools/busco/config/config.ini'
            let fasta = path.join(os.homedir(), req.body.assembly)
            let linage = `/srv/databases/busco/${req.body.linage}`
            let output = path.join(os.homedir(), `Storage/${req.body.user._id}/tmp/`);
            let parametros = ['-i', fasta, '-o', req.body.name, '--out_path', output, '-l', linage, '-m', req.body.mode, '-c', process.env.THREADSM, '--config', config, '--offline', '-f']

            const cmd_busco = spawn('busco', parametros)
            cmd_busco.stderr.on('data', (data) => {console.log(data.toString())});
            cmd_busco.stdout.on('data', (data) => {console.log(data.toString())});

            
            cmd_busco.on('close', (code) => {
                console.log(`BUSCO process exited with code ${code}`);
                if(code == 0){

                    let bResult = {
                        user: req.body.user._id,
                        filename: `${req.body.name}.zip`,
                        path: `Storage/${req.body.user._id}/results/${req.body.name}.zip`,
                        description: 'Busco análsis resultados',
                        type: 'other',
                        category: 'result'
                    }

                    let info = fs.readFileSync(`${output}/${req.body.name}/short_summary.specific.${req.body.linage}.${req.body.name}.txt`,'utf8')
                    //let lines = data.split('\n')
                    zipdir(`${output}/${req.body.name}`, {saveTo: `${home}/Storage/${req.body.user._id}/results/${req.body.name}.zip`}, function (err, buffer) {
                        if(err) console.log('Something went wrong!', err);
                        Storage.create(bResult, (err, data) => {
                            if(err) console.log('Something went wrong!', err);
                            res.json({
                                status: 'success',
                                msg:'Busco finished',
                                result: {
                                    info,
                                    busco: data
                                }
                            })
                        }) 
                    })
                }else{
                    return res.json({
                        status: 'danger',
                        msg: 'BUSCO finished with error',
                        result: ''
                    })
                }

            })
           /*  res.json({
                status: 'success',
                msg:'Busco finished',
                result: parametros
            })  */           
        } catch (error) {
            res.status(500).json({
                status: 'danger',
                msg: error
            }); 
        }
    }

}