
const localStrategy=require("passport-local").Strategy;
const mogoose=require("mongoose");
const bcrypt=require("bcryptjs");

// Models do usuario
require('../Models/usuario');
const Usuario=mogoose.model("usuarios");

module.exports=function(passport){

    passport.use(new localStrategy({usernameField:'email',passwordField:'senha'},(email,senha,done)=>{

        Usuario.findOne({email:email}).then((usuario)=>{

            if(!usuario){
                //done(dados_da_conta_auteticada,se_deu_certo_ou_nao,messagem)
                return done(null,false,{message:"Esta conta nao existe"});
            }

            bcrypt.compare(senha,usuario.senha,(erro,batem)=>{

                if(batem){
                    return done(null,usuario);
                }
                else{
                    return done(null,false,{message:`Senha Incorreta!`});
                }

            });

        }).catch((error)=>{
            return done(null,false,{message:"Houve erro interno!"});
        });

    }));

    //Salvar dados
    passport.serializeUser((usuario,done)=>{
        done(null,usuario.id);
    });

    //Terminar a funcao
    passport.deserializeUser((id,done)=>{
        
        /*
        Usuario.findById(id,(err,usuario)=>{
            done(err,usuario);
        })
        */
        Usuario.findById(id).then((usuario)=>{
            //done(err,usuario); 
            done(null,usuario);  
        }).catch(error=>{
            done(null,error);
        })
        
        /*
        Usuario.findOne({_id:id}).then((err,usuario)=>{
            if(usuario){
                done(err,usuario);
            }
        }).catch(error=>{
            console.log('ERROR: '+error);
        })*/

    });

}
