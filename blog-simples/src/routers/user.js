
const express=require('express');
const mongoose = require('mongoose');
const bcryp=require('bcryptjs');
const passport=require('passport');

//Variables
const router=express.Router();
//Models
require('../../Models/usuario');
const Usuario=mongoose.model('usuarios');

// GET
router.get('/registro',(req,res)=>{
    res.render('usuario/registro');
});

router.get('/login',(req,res)=>{
    res.render('usuario/login');
});

router.get('/logout',(req,res,next)=>{
    req.logout((error)=>{
        
        if(error) return next(error);
        
        req.flash("success_msg","Deslogado com sucesso");
        res.redirect('/');
    
    });
});

// POST

router.post('/registro',(req,res)=>{
    var erros=[];

    if(!req.body.nome || typeof req.body.nome==undefined ||
    req.body.nome==null){
        erros.push({text:'Nome Invalido'});
    }
    if(!req.body.email || typeof req.body.email==undefined ||
    req.body.email==null){
        erros.push({text:'Email Invalido'});
    }
    if(!req.body.senha || typeof req.body.senha==undefined ||
        req.body.senha==null){
            erros.push({text:'Senha Invalido'});
    }
    if(!req.body.senha_2 || typeof req.body.senha_2==undefined ||
        req.body.senha_2==null){
            erros.push({text:'Senha repetida Invalido'});
    }

    if(req.body.nome.length<2){
        erros.push({text:'Nome e muito pequeno'});
    }
    if(req.body.senha.length<8){
        erros.push({text:'Senha deve ter no minimo 8 digitos'});
    }
    if(req.body.senha_2.length<8){
        erros.push({text:'Senha deve ter no minimo 8 digitos'});
    }

    if(req.body.senha!=req.body.senha_2){
        erros.push({text:'As senhas sao diferentes!'});
    }

    if(erros.length>0){
        res.render("usuario/registro",{erros:erros})
    }
    else{

        const novoUsuario=[{
            nome:req.body.nome,
            email:req.body.email,
            senha:req.body.senha
            // ,eAdmin:1
        }];

        //Gerar um hash - Codifica 

        bcryp.genSalt(10,(erro,salt)=>{
            bcryp.hash(novoUsuario[0].senha,salt,(erro,hash)=>{
                if(erro){
                    req.flash('error_msg','Houve um erro durante o salvamento do usuario');
                    res.redirect('/user/registro');
                }

                novoUsuario[0].senha=hash;

                const query={email:req.body.email};

                Usuario.findOne(query).then(usuario=>{
                
                    if(usuario){
                        req.flash('error_msg','Ja existe uma conta com este email no nosso sistema!');
                        res.redirect('/user/registro');
                    }
                    else{

                        Usuario.insertMany(novoUsuario).then(()=>{
                            req.flash('success_msg','Usuario criada com sucesso!');
                            res.redirect('/');
                        }).catch(error=>{
                            console.log('ERROR: '+error);
                            req.flash('error_msg','Houve um erro ao criar usuario, tente novamente!');
                            res.redirect('/user/registro');
                        })
                    }
                    
                }).catch(error=>{
                    req.flash('error_msg','Houve um erro interno');
                    res.redirect('/user/registro');
                });

            });
        });
        
        //res.render('usuario/registro');
    }

});

router.post('/login',(req,res,next)=>{
    var erros=[];

    if(!req.body.email || typeof req.body.email==undefined ||
    req.body.email==null){
        erros.push({text:'Email Invalido'});
    }
    if(!req.body.senha || typeof req.body.senha==undefined ||
        req.body.senha==null){
            erros.push({text:'Senha Invalido'});
    }

    if(req.body.senha.length<8){
        erros.push({text:'Senha deve ter no minimo 8 digitos'});
    }

    if(erros.length>0){
        res.render("usuario/login",{erros:erros})
    }
    else{

        const logarUsuario={
            email:req.body.email,
            senha:req.body.senha
        };

        passport.authenticate("local",{
            successRedirect:"/",
            failureRedirect:"/user/login",
            failureFlash:true
        })(req,res,next);

        //res.render('usuario/registro');
    }

});


module.exports=router;