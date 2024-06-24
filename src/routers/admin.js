
const express=require('express');
const mongoose = require('mongoose');

//Variables
const router=express.Router();
//Models
require('../../Models/categoria');
const Categoria=mongoose.model('categorias');

require('../../Models/postagen');
const Postagen=mongoose.model('postagens');

const {eAdmin}=require('../../helpers/eAdmin');

//GET
router.get('/',eAdmin,(req,res)=>{
    res.render("admin/index");

});

router.get('/posts',eAdmin,(req,res)=>{
    res.send('Posts Pages')
});

router.get('/categorias',eAdmin,(req,res)=>{

    Categoria.find().sort({date:'desc'}).then(categorias=>{
        res.render("admin/categorias",{categorias:categorias});//{categorias:categorias}
        //console.log(categorias);
    }).catch((error)=>{
        req.flash('error_msg','Houve um erro ao listar categorias');
        res.redirect('/admin');
    });
    
});

router.get('/categorias/add',eAdmin,(req,res)=>{
    res.render("admin/addcategorias");
});

router.get('/categorias/edit/:id',eAdmin,(req,res)=>{
    Categoria.findOne({_id:req.params.id}).then(categoria=>{
        res.render("admin/editcategorias",{categoria:categoria});
    }).catch(error=>{
        req.flash('error_msg','Esta categoria nao existem');
        res.redirect('/admin/categorias');
    });
});

// Postagens

router.get('/postagens',eAdmin,(req,res)=>{
    Postagen.find().populate('categoria').sort({data:'desc'}).then(postagens=>{
        res.render("admin/postagens",{postagens:postagens});
        //.populate('categorias')
    }).catch((error)=>{
        console.log('ERROR: ',error);
        req.flash('error_msg','Houve um erro ao listar postagens');
        res.redirect('/admin');
    });
    
});

router.get('/postagens/add',eAdmin,(req,res)=>{
    Categoria.find().then(categorias=>{
        res.render("admin/addpostagens",{categorias:categorias});
    }).catch(error=>{
        req.flash('error_msg','Houve um erro ao carregar categoria');
        res.redirect('/admin/postagens');
    });
});

router.get('/postagens/edit/:id',(req,res)=>{
    Postagen.findOne({_id:req.params.id}).then(postagem=>{
        
        Categoria.find().then(categorias=>{
            res.render("admin/editpostagem",{postagem:postagem,categorias:categorias});
        }).catch(error=>{
            req.flash('error_msg','Houve um erro ao carregar categoria');
            res.redirect('/admin/postagens');
        });
        
    }).catch(error=>{
        req.flash('error_msg','Esta postagem nao existem');
        res.redirect('/admin/categorias');
    });
});

//POST

router.post('/categorias/nova',eAdmin,(req,res)=>{
    
    var erros=[];

    if(!req.body.nome || typeof req.body.nome==undefined ||
    req.body.nome==null){
        erros.push({text:'Nome Invalido'});
    }
    if(!req.body.slug || typeof req.body.slug==undefined ||
    req.body.slug==null){
        erros.push({text:'Slug Invalido'});
    }
    if(req.body.nome.length<2){
        erros.push({text:'Nome da categoria e muito pequeno'});
    }

    if(erros.length>0){
        res.render("admin/addcategorias",{erros:erros})
    }
    else{

        const novaCategoria=[{
            nome:req.body.nome,
            slug:req.body.slug
        }];
    
        Categoria.insertMany(novaCategoria).then(()=>{
            //console.log('Categoria Salva com sucesso!');
            req.flash('success_msg','Categoria criada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch(error=>{
            console.log('ERROR: '+error);
            req.flash('error_msg','Houve um erro ao salvar a categoria, tente novamente!');
            res.redirect('/admin')
        })

    }
});


router.post('/categorias/edit',eAdmin,(req,res)=>{
    
    var erros=[];

    if(!req.body.nome || typeof req.body.nome==undefined ||
    req.body.nome==null){
        erros.push({text:'Nome Invalido'});
    }
    if(!req.body.slug || typeof req.body.slug==undefined ||
    req.body.slug==null){
        erros.push({text:'Slug Invalido'});
    }
    if(req.body.nome.length<2){
        erros.push({text:'Nome da categoria e muito pequeno'});
    }

    if(erros.length>0){
        res.render("admin/addcategorias",{erros:erros})
    }
    else{

        const novaCategoria={
            nome:req.body.nome,
            slug:req.body.slug
        };

        const query={_id:req.body.id};

        Categoria.findOneAndUpdate(query,novaCategoria,{upsert:true}).then(()=>{
            //console.log('Categoria Salva com sucesso!');
            req.flash('success_msg','Categoria editada com sucesso!');
            res.redirect('/admin/categorias');
        }).catch(error=>{
            console.log('ERROR: '+error);
            req.flash('error_msg','Houve um erro ao editar a categoria, tente novamente!');
            res.redirect('/admin')
        });

    }
});

router.post('/categorias/delete',eAdmin,(req,res)=>{

    const query={_id:req.body.id};
    
    Categoria.findOneAndDelete(query,{upsert:true}).then(()=>{
        req.flash('success_msg','Categoria deletada com sucesso!');
        res.redirect('/admin/categorias');
    }).catch(error=>{
        console.log('ERROR: '+error);
        req.flash('error_msg','Houve um erro ao deletar a categoria, tente novamente!');
        res.redirect('/admin/categorias');
    });

});

// Postagens

router.post('/postagens/nova',eAdmin,(req,res)=>{
    
    var erros=[];

    if(!req.body.titulo || typeof req.body.titulo==undefined ||
    req.body.titulo==null){
        erros.push({text:'Titulo Invalido'});
    }
    if(!req.body.slug || typeof req.body.slug==undefined ||
    req.body.slug==null){
        erros.push({text:'Slug Invalido'});
    }
    if(!req.body.descricao || typeof req.body.descricao==undefined ||
        req.body.descricao==null){
            erros.push({text:'Descricao Invalido'});
    }
    if(!req.body.conteudo || typeof req.body.conteudo==undefined ||
        req.body.conteudo==null){
            erros.push({text:'Conteudo Invalido'});
    }
    if(!req.body.categoria || typeof req.body.categoria==undefined ||
        req.body.conteudo==null){
            erros.push({text:'Categoria Invalido'});
    }
    if(req.body.categoria=='0'){
            erros.push({text:'Categoria Invalido'});
    }
    if(req.body.titulo.length<2){
        erros.push({text:'Nome da categoria e muito pequeno'});
    }

    if(erros.length>0){

        Categoria.find().then(categorias=>{
            res.render("admin/addpostagens",{categorias:categorias,erros:erros});
        }).catch(error=>{
            req.flash('error_msg','Houve um erro ao carregar categoria');
            res.redirect('/admin/postagens');
        });
        //res.render("admin/addpostagens",{})
    }
    else{

        const novaPostagen=[{
            titulo:req.body.titulo,
            slug:req.body.slug,
            descricao:req.body.descricao,
            conteudo:req.body.conteudo,
            categoria:req.body.categoria
        }];
    
        Postagen.insertMany(novaPostagen).then(()=>{
            req.flash('success_msg','Postagen criada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch(error=>{
            console.log('ERROR: '+error);
            req.flash('error_msg','Houve um erro ao salvar a postagen, tente novamente!');
            res.redirect('/admin/postagens');
        })

    }
});

router.post('/postagens/edit',eAdmin,(req,res)=>{
    var erros=[];

    if(!req.body.titulo || typeof req.body.titulo==undefined ||
    req.body.titulo==null){
        erros.push({text:'Titulo Invalido'});
    }
    if(!req.body.slug || typeof req.body.slug==undefined ||
    req.body.slug==null){
        erros.push({text:'Slug Invalido'});
    }
    if(!req.body.descricao || typeof req.body.descricao==undefined ||
        req.body.descricao==null){
            erros.push({text:'Descricao Invalido'});
    }
    if(!req.body.conteudo || typeof req.body.conteudo==undefined ||
        req.body.conteudo==null){
            erros.push({text:'Conteudo Invalido'});
    }
    if(!req.body.categoria || typeof req.body.categoria==undefined ||
        req.body.conteudo==null){
            erros.push({text:'Categoria Invalido'});
    }
    if(req.body.categoria=='0'){
            erros.push({text:'Categoria Invalido'});
    }
    if(req.body.titulo.length<2){
        erros.push({text:'Nome da categoria e muito pequeno'});
    }

    if(erros.length>0){

        Postagen.findOne({_id:req.params.id}).then(postagem=>{
        
            Categoria.find().then(categorias=>{
                res.render("admin/editpostagem",{postagem:postagem,categorias:categorias});
            }).catch(error=>{
                req.flash('error_msg','Houve um erro ao carregar categoria');
                res.redirect('/admin/postagens');
            });
            
        }).catch(error=>{
            req.flash('error_msg','Esta postagem nao existem');
            res.redirect('/admin/categorias');
        });

    }
    else{

        const novaPostagen={
            titulo:req.body.titulo,
            slug:req.body.slug,
            descricao:req.body.descricao,
            conteudo:req.body.conteudo,
            categoria:req.body.categoria
        };

        const query={_id:req.body.id}
    
        Postagen.findOneAndUpdate(query,novaPostagen,{upsert:true}).then(()=>{
            req.flash('success_msg','Postagen actualizada com sucesso!');
            res.redirect('/admin/postagens');
        }).catch(error=>{
            console.log('ERROR: '+error);
            req.flash('error_msg','Houve um erro ao actualizar a postagen, tente novamente!');
            res.redirect('/admin/postagens');
        })

    }
});

router.post('/postagens/delete',eAdmin,(req,res)=>{

    const query={_id:req.body.id};
    
    Postagen.findOneAndDelete(query,{upsert:true}).then(()=>{
        req.flash('success_msg','Postagem deletada com sucesso!');
        res.redirect('/admin/postagens');
    }).catch(error=>{
        console.log('ERROR: '+error);
        req.flash('error_msg','Houve um erro ao deletar a postagem, tente novamente!');
        res.redirect('/admin/postagens');
    });

});

module.exports=router;
