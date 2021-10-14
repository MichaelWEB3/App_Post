const mongoose = require('mongoose')
const Schema = mongoose.Schema

const novaPostagem = new Schema({

    tituloProduto: {
        type: String,
        require: true
    },
    preco: {
        type: String,
        require: true
    },
    photo: {
        type: String,
        require: true
    },
    descricao: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    nome: {
        type: String,
        require: true
    },

    apelido: {
        type: String,
        require: true
    },


})

mongoose.model("postagem", novaPostagem)