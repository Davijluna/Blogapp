const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")

require("../models/Categoria")
const Categoria = mongoose.model("categoria")
require("../models/Postagem")
const Postagem = mongoose.model("postagen")
const {eAdmin} = require("../helpers/eAdmin")

router.get('/', eAdmin, (req, res) => {
  res.render("admin/index")
})

router.get('/posts', eAdmin, (req, res) => {
  res.send("Página de posts")
})

router.get("/categorias", eAdmin, (req, res) => {
  Categoria.find().sort({date: "asc"}).then((categoria) => {
    res.render("admin/categorias", {categorias: categoria})
  }).catch((error) => {
    req.flash("error_msg", "Hove um erro ao listar as categorias")
    res.redirect("/admin")
  })
})

router.get("/categorias/add", eAdmin, (req, res) => {
  res.render("admin/addcategorias")
})

router.post("/categorias/nova", eAdmin, (req, res) => {
  var erros = []
  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
  }
  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erros.push({texto: "Slug inválido"})
  }
  if(erros.length > 0) {
    res.render("admin/addcategorias", {erros: erros})
  } else {
      const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
      }
      new Categoria(novaCategoria).save().then(() => {
        req.flash("success_msg", "categorias criada com sucesso!")
        res.redirect("/admin/categorias")
        console.log("Categoria salva com sucesso !")
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
        res.redirect("/admin")
      })
  }
})

router.get("/categorias/edit/:id", eAdmin, (req, res) => {
  Categoria.findOne({_id:req.params.id}).then((categoria) => {
    res.render("admin/editcategorias", {categoria: categoria})
  }).catch((err) => {
    req.flash("error_msg", "Esta categoria não existe")
    res.redirect("/admin/categorias")
  })
})

router.post("/categorias/edit", eAdmin, (req, res) => {
  var erroEdit = []

  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erroEdit.push({texto: "Nome inválido"})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
    erroEdit.push({texto: "Slug inválido"})

      if(erroEdit.length > 0) {
        res.render("admin/addcategorias", {erros: erroEdit});
      }
      } else {
      const categoriaEdit = {
        nome: req.body.nome,
        slug: req.body.slug
      }

    Categoria.findOne({_id: req.body.id}).then((categoria) => {
      categoria.nome = req.body.nome
      categoria.slug = req.body.slug
      categoria.save().then(() => {
        req.flash("success_msg", "Categoria editada com sucesso!")
        res.redirect("/admin/categorias")
      }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao salvar a categoria")
        res.redirect("/admin/categorias")
      })
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria")
      res.redirect("/admin/categorias")
    })
  }
})
// Em exercicio tive problemas para deletar pois a função "remove" na linha 105 não era reconhecida LINK que me ajudou a resolver.
// https://stackoverflow.com/questions/75913878/problem-with-user-remove-it-says-that-it-is-not-a-function
// Link da documentação Mangusto.
// https://mongoosejs.com/docs/models.html#deleting
router.post("/categorias/deletar", eAdmin, (req, res) => {
  Categoria.deleteOne({_id: req.body.id}).then(() => {
    req.flash("success_msg", "Categoria deletada com sucesso!")
    res.redirect("/admin/categorias")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar a categoria")
    res.redirect("/admin/categorias")
  })
})

router.get("/postagens", eAdmin, (req, res) => {
  Postagem.find().populate("categoria").sort({data: "desc"}).then((postagens) => {
    res.render("admin/postagens", {postagens: postagens})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as postagens", err)
    res.redirect("/admin")
  })

})

router.get("/postagens/add", eAdmin, (req, res) => {
  Categoria.find().then((categorias) => {
    res.render("admin/addpostagem", {categorias: categorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário")
    res.redirect("/admin")
  })
})

// está rota salva no banco de dados.
router.post("/postagens/nova", eAdmin, (req, res) => {
  var erros = []
  if(req.body.Categoria == "0") {
    erros.push({texto: "Categoria inválida, registre uma cadegoria"})
  }
  if(erros.length > 0) {
    res.render("admin/addpostagens", {erros: erros});
  }else{
    const novaPostagem = {
      titulo: req.body.titulo,
      slug: req.body.slug,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      categoria: req.body.categoria,
    }
    new Postagem(novaPostagem).save().then(() => {
      req.flash("success_msg", "Postagem criada com sucesso")
      res.redirect("/admin/postagens")
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
      res.redirect("/admin/postagens")
    })
  }
})

router.get("/postagens/edit/:id", eAdmin, (req, res) => {
  Postagem.findOne({_id: req.params.id}).then((postagem) => {

    Categoria.find().then((categorias) => {
      res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias")
      res.redirect("/admin/postagens")
    })

  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
    res.redirect("admin/postagens")

  })
})

router.post("/postagem/edit", eAdmin, (req, res) => {
  Postagem.findOne({_id: req.body.id}).then((postagem) => {
    postagem.titulo = req.body.titulo
    postagem.slug = req.body.slug
    postagem.descricao = req.body.descricao
    postagem.conteudo = req.body.conteudo
    postagem.categoria = req.body.categoria

    postagem.save().then(() => {
      req.flash("success_msg", "Postagem editada com sucesso")
      res.redirect("/admin/postagens")
    }).catch((err) => {
      req.flash("error_msg", "Erro interno")
      res.redirect("/admin/postagens")
    })

  }).catch((err) => {
    console.log(err,+'@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@')
    req.flash("error_msg", "Houve um erro ao salvar a edição@@@@@@"+err)
    res.redirect("/admin/postagens")
  })
})


router.get("/postagens/deletar/:id", eAdmin, (req, res) => {
  Postagem.deleteOne({_id:req.params.id}).then(() => {
    req.flash("success_msg", "postagem deletada com sucesso")
    res.redirect("/admin/postagens")
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar postagens"+err)
    res.redirect("/admin/postagens")
  })
})

module.exports = router