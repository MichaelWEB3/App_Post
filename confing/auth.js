const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

//model 
require("../models/addUsuario")
const Usuario =  mongoose.model('criaUsuario')

module.exports = function(passport){
    passport.use(new localStrategy({usernameField:'email',passwordField:'senha'},(email,senha,done)=>{
        Usuario.findOne({email:email}).lean().then((usuario)=>{

            if(!usuario){
                return done(null,false, {mensagem:"esse contato nao existe"})
            }

            bcrypt.compare(senha,usuario.senha,(erro,batem)=>{
                if(batem){
                    return done(null,usuario)
                }else{
                  return done(null,false,{mensagem:"senha incorreta"}) 
                }
            })
        })
    }))

    passport.serializeUser(function(user, done) {
        done(null, user._id);
        // if you use Model.id as your idAttribute maybe you'd want
        // done(null, user.id);
    });
    
    passport.deserializeUser(function(id, done) {
        Usuario.findById(id, function(err, user) {
        done(err, user);
      });
    });
}