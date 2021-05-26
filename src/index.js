import mongoose from 'mongoose';
import app from './server'



// DATABSES CONECTION
const uri = 'mongodb://localhost:27017/'+process.env.DATABASE
//const uri = `mongodb+srv://${process.env.USERNAME}:${process.env.PASSWORD}@cluster0.kosui.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`
const option = {
    useCreateIndex: true,
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
};

app.listen(app.get('port'), () => {

    console.log('Sirviendo en puerto ', app.get('port'));
    
    mongoose.connect(uri, option)
    .then(() => console.log(`conenctado a base de datos ${process.env.DATABASE}`))
    .catch(e => console.log(e));

});