const mongoose = require('mongoose')
const Schema = mongoose.Schema

const novoUsuario = new Schema({
        email:{
            type:String,
            require:true
        },
        senha:{
            type:String,
            require:true
        },
        nome:{
            type:String,
            require:true
        },
        apelido:{
            type:String,
            require:true
        },
        compras:[
            {}
        ]
        
})

mongoose.model("criaUsuario",novoUsuario)