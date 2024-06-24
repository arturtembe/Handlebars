const mongoose=require("mongoose");

//Configurar mongoose

const url="mongodb://127.0.0.1:27017/my_node_aula";

//mongoose.Promise=global.Promise;

mongoose.connect(url,{
    //useNewUrlParser:true,
    //useCreateIndex:true,
    //useUnifiedTopology:true
}).then(()=>{
    console.log("Connected!!");
}).catch((error)=>{
    console.log("Houve um error: "+error);
})

//Model - Users
//Definindo model

const UsuariosSchema=mongoose.Schema(
    {
        nome:{
            type: String,
            require:true //Campo obrigatorio ou nao
        },
        sobrenome:{
            type: String,
            require:true 
        },
        email:{
            type: String,
            require:true 
        },
        idade:{
            type: Number,
            require:true 
        },
        pais:{
            type: String,
            require:false 
        }
    }
)
//Criando collection model
const users=mongoose.model("users",UsuariosSchema);

//const users=mongoose.model("users");

users.insertMany(
    [
        {
            nome:"Artur",
            sobrenome:"Tembe",
            email:"artur@email.com",
            idade:26,
            pais:"Mocambique"
        }
    ]
).then(()=>{
    console.log("Data inserted!")
}).catch((error)=>{
    console.log("Error: "+error);
})
