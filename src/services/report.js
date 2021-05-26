import csv from 'csv-parser';
import { exec } from 'child_process'
import fs from 'fs';
import imageToBase64 from 'image-to-base64'


export default {


    fastqcSumary: (input, callback) => {
        let headers = ['status','module','library']
        let report = []
        fs.createReadStream(input)
        .on('error', () => {
           return callback('ERROR PARSE SUMARY', null)
        })
        .pipe(csv({ separator: '\t', headers }))
        .on('data', (data) => report.push(data))
        .on('end', () => {
            return callback(null, report)
        });
    },

    fastqcData: (input, callback ) => {
        let data = fs.readFileSync(input,'utf8')
        let lines = data.split('\n')
        let headers = ['measure','value']
        let statistics = lines.slice(3,10)
        if(data){
            return callback(null, statistics.map(line => {
                let data = line.split('\t');
                return headers.reduce((obj, nextKey, index) => {
                    obj[nextKey] = data[index];
                    return obj;
                }, {});
            }))
        }else{
            return callback('ERROR fastqData', null)
        }
    },

    assemblyStats: (input, callback) => {
        exec(`assembly-scan.py ${input}`, (error, stdout, stderr) => {
            if (error) {
                return callback(error, null);
            }
            return callback(null, stdout)
        });                        
    },

    quastReport: (input, callback) => {
        let headers = ['item','value']
        let report = []
        fs.createReadStream(input)
        .on('error', () => {
           return callback('ERROR PARSE SUMARY', null)
        })
        .pipe(csv({ separator: '\t', headers }))
        .on('data', (data) => report.push(data))
        .on('end', () => {
            return callback(null, report)
        });
        
    },

    getImg: (path, callback) => {
        
        imageToBase64(path) // Path to the image
        .then((response) => {
            return callback(null, response)
        }).catch((error) => {
            return callback(error, null)
        })
    }
}