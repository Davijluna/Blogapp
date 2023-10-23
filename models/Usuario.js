const mongoose = require('mongoose')
const Schema = mongoose.Schema
// Aqui fizemos o verificação para saber se o usuário é admin ou não.
const Usuario = new Schema({
  nome: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  eAdmin: {
    type: Number,
    default: 0,
  },
  senha:{ 
    type:String,
    required: true
  }
})

mongoose.model("usuarios", Usuario)