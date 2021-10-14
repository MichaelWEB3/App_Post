const express = require('express')
const mongoose = require('mongoose')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
require('./models/addUsuario')
require('./models/addpostagem')
const novoUsuario = mongoose.model('criaUsuario')
const postagens = mongoose.model('postagem')
const bcrypt = require("bcryptjs")
const app = express()
const passport = require("passport")
const session = require('express-session')
const { ObjectID } = require('mongodb')
require("./confing/auth")(passport)

//handlebars confing 
app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')


//passport
app.use(passport.initialize())

//bodyparser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//mongodb

mongoose.Promise = global.Promise
mongoose.connect("mongodb://localhost/posta_tudo").then(() => {
    console.log("conectado com mongo")
}).catch((e) => console.log("erro" + e))


app.use(session({ secret: '123' }))


app.get("/cadastrar", (req, resp) => {
    resp.render("criaUsuario")
    //redirecion
})

app.post("/criarUsuario", (req, resp) => {




    novoUsuario.findOne({ email: req.body.email }).then((usuario) => {
        if (usuario) {
            const erro = "email de usuario ja existente"
            resp.render("erro", { erro: erro })
        } else {
            const novo = new novoUsuario({
                email: req.body.email,
                senha: req.body.senha,
                nome: req.body.nome,
                apelido: req.body.apelido

            })
            bcrypt.genSalt(10, (erro, salt) => {
                bcrypt.hash(novo.senha, salt, (erro, hash) => {
                    if (erro) {
                        console.log("erro hash" + erro)
                        const erro = "erro hash de usuario ja existente"
                        resp.render("erro", { erro: erro })
                    }

                    novo.senha = hash


                    novo.save().then(() => {
                        resp.redirect("/login")
                    }).catch((e) => {
                        const erro = "erro ao salvar"
                        resp.render("erro", { erro: erro })
                    })
                })
            })


        }
    })



})

app.get("/", (req, resp) => {
    postagens.find().lean().then((post) => {

        resp.render('home', { post: post })
    }).catch((erro) => {
        const error = "erro"
        resp.render("./erro", { error })
    })
})


app.get("/home", (req, resp) => {
    postagens.find().lean().then((post) => {
        console.log(post)
        resp.render('homeLogin', { post: post })
    }).catch((erro) => {
        const error = "erro"
        resp.render("./erro", { error })
    })
})

app.get("/login", (req, resp) => {

    if (req.session.email) {
        resp.redirect('/perfil/' + req.session.email)
    }
    resp.render("login")
    //redirecion
})

app.get("/erro", (req, resp) => {
    resp.render("erro")
    //redirecion
})


app.post('/perfil', passport.authenticate('local', {
    successRedirect: '',
    failureRedirect: '/erro',
    session: true
}), (req, resp) => {

    //fazendo busca pelo id
    novoUsuario.findOne({ email: req.body.email }).lean().then((info) => {

        req.session.email = req.body.email
        console.log(req.session.email)
        resp.render('perfil', { info: info })

    }


    ).catch((erro) => {
        const error = "erro"
        resp.render("erro", { erro: erro })

    })

}

);


app.get('/perfil/:id', (req, resp) => {

    //fazendo busca pelo id
    novoUsuario.findOne({ email: req.params.id }).lean().then((info) => {


        resp.render('perfil', { info: info })

    }


    ).catch((erro) => {
        const error = "erro"
        resp.render("erro", { erro: erro })

    })


})


app.get('/sair', (req, resp) => {


    req.session.email = null
    resp.redirect('/login')

})

app.post('/perfil/addPoste/:email/:nome/:apelido', (req, resp) => {

    const novo = new postagens({

        tituloProduto: req.body.tituloProduto,
        photo: req.body.photo,
        preco: req.body.valorProduto,
        descricao: req.body.conteudo,
        email: req.params.email,
        nome: req.params.nome,
        apelido: req.params.apelido,


    })


    novo.save().then(() => {

        postagens.findOne({ email: req.params.email }).lean().then((info) => {

            const maisNovo = new novoUsuario({
                postagem: info._id

            });
            maisNovo.save().then(() => {
                resp.redirect("/")
            })

        })


    }).catch((e) => {
        const erro = "erro ao salvar"
        resp.render("erro", { erro: erro })
    })


})


app.get('/carrinho/:id/:tituloProduto/:preco/:descricao/:email/:nome/', (req, resp) => {


    if (req.params.email == req.session.email) {

        const erro = "seu produto não pode ser adicionado no seu carrinho"
        return resp.render("erro", { erro: erro })
    }


    const comprasNovo = {
        idProduto: req.params.id,
        tituloProduto: req.params.tituloProduto,
        preco: req.params.valorProduto,
        descricao: req.params.conteudo,
        email: req.params.email,
        nome: req.params.nome,

    }


    novoUsuario.findOneAndUpdate({ email: req.session.email }, {
        $push: {
            compras: comprasNovo
        }
    }).then((info) => {
        console.log("certoooooooooooooooooooooooo")
        resp.redirect('/home')
    }).catch(e => {
        const erro = "erro de compra"
        return resp.render("erro", { erro: erro })
    })




})


app.get('/cart', (req, resp) => {

    novoUsuario.findOne({ email: req.session.email }).lean().then(info => {

        const obj = []

        info.compras.map(info => {
            setTimeout(() => {
                postagens.findById({ "_id": new ObjectID(info.idProduto) }).lean().then(info => {
                    obj.push(info)
                    if (obj) {
                        console.log(obj)
                        resp.render('cart', { info: obj })

                    } else {
                        console.log('erro')
                        return
                    }

                }).catch((erro) => {
                    console.log(erro)
                })
            }, 3000)
        })
        if (!obj) {
            console.log("vazio")
            return
        }



    }).catch((err) => {
        const erro = "erro de busca no bd"
        return resp.render("erro", { erro: erro })
    })



})


const porta = 8081

app.listen(porta, () => {
    console.log("serivdor aberto na porta", porta)
})