//Loading module
const express=require('express');
const {engine}=require('express-handlebars');
const handlebars=require('handlebars');
const {allowInsecurePrototypeAccess}=require('@handlebars/allow-prototype-access');

const bodyParser=require('body-parser');
const cors=require('cors');
const mongoose=require('mongoose');
const session=require('express-session');
const flash=require('connect-flash');

const passport=require('passport');

//Variables
const app=express();
const admin=require('./routers/admin');
const user=require('./routers/user');
const path=require('path'); 

require('../Models/postagen');
const Postagem=mongoose.model('postagens');

require('../Models/categoria');
const Categoria=mongoose.model('categorias');

//Auth
require("../config/auth")(passport);

//Setttings

    //Express Session
    app.use(session({
        secret:'cursodenode',
        resave:true,
        saveUninitialized:true
    }));
    //Initialized Passport
    app.use(passport.initialize());
    app.use(passport.session());
    //Connect Fash
    app.use(flash())

    //Midleware
    app.use((req,res,next)=>{
        //Variaveis Globais
        res.locals.success_msg=req.flash("success_msg");
        res.locals.error_msg=req.flash("error_msg");

        res.locals.error=req.flash("error");
        res.locals.user=req.user || null;

        next();
    });

    //Body Parser
    app.use(cors());
    app.use(bodyParser.urlencoded({extended:true}));
    app.use(bodyParser.json());

    //Handlebars
    app.engine('handlebars',engine({defaultLayout:'main'}))
    app.engine('handlebars',engine({handlebars:allowInsecurePrototypeAccess(handlebars)}));
    app.set('view engine','handlebars');

    const endpointDbName = 'mongodb://localhost:27017/blogapp';
    //Mongoose
    mongoose.connect(endpointDbName).then(()=>{
        console.log('Connected to mongodb');
    }).catch((error)=>{
        console.log('ERROR: '+error);
    });

    //Public - static archieve
    //app.use(express.static(path.join(__dirname,"public")));
    //app.use(express.static("public"));

    app.use("/css",express.static(process.cwd()+"/public/css"));
    app.use("/js",express.static(process.cwd()+"/public/js"));

    //console.log(express.static(__dirname+"/public/js"))

    //Midleware
    app.use((req,res,next)=>{
       // console.log('Oi eu sou midleware');

        next();//Parar a requisiscao
    });

//Routers
    //Home
    app.get('/',(req,res)=>{
        Postagem.find().populate('categoria').sort({data:'desc'}).then(postagem=>{
        
            res.render('index',{postagem:postagem});
            
        }).catch(error=>{
            req.flash('error_msg','Houve um erro ao carregar postagens');
            res.redirect('/404');
        });
        
    });
    //Postagem: Ler mais
    app.get('/postagem/:slug',(req,res)=>{
        Postagem.findOne({slug:req.params.slug}).then(postagem=>{
        
            if(postagem){
                res.render('postagem/index',{postagem:postagem});
            }else{
                req.flash('error_msg','Essa postagem nao existem');
                res.redirect('/');
            }
            
        }).catch(error=>{
            req.flash('error_msg','Houve um erro interno');
            res.redirect('/');
        });
    });
    //Categorias
    app.get('/categorias',(req,res)=>{
        Categoria.find().sort({date:'desc'}).then(categorias=>{
            res.render("categoria/index",{categorias:categorias});//{categorias:categorias}
        }).catch((error)=>{
            req.flash('error_msg','Houve um erro ao listar categorias');
            res.redirect('/');
        });
    });
    app.get('/categorias/:slug',(req,res)=>{
        
        Categoria.findOne({slug:req.params.slug}).then(categorias=>{
        
            if(categorias){
                Postagem.find({categoria:categorias._id}).then(postagem=>{
                    res.render("categoria/postagens",{postagem:postagem,categorias:categorias});
                }).catch(error=>{
                    req.flash('error_msg','Houve um erro ao carregar postagem');
                    res.redirect('/categorias');
                });
            }
            else{
                req.flash('error_msg','Esta categoria nao existe');
                res.redirect('/404');
            }
            
        }).catch(error=>{
            req.flash('error_msg','Houve um erro ao listar categorias');
            res.redirect('/categorias');
        });

    });

    //404
    app.get('/404',(req,res)=>{
        res.send('Erro 404!');
        
    });

    //Admin
    app.use('/admin',admin);

    //User
    app.use('/user',user);

//Others
const PORT=8081;
app.listen(PORT,()=>{
    console.log("The server is running");
})
