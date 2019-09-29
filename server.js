let express = require("express")
let validator = require("validator")
let mongodb = require("mongodb")

let app = express()

let db

let port = process.env.PORT
if (port == "" || port == null) {
  port = 3000
}
app.use(express.static('public'))

let connectionString = 'mongodb+srv://mahesh:mahesh123@cluster0-uabni.gcp.mongodb.net/TodoApp?retryWrites=true&w=majority'
mongodb.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}, (err, client) => {
  db = client.db()
  //ddd
  app.listen(port)

})
app.use(express.urlencoded({
  extended: false
}))

app.use(express.json())


app.get("/", (req, res) => {
  db.collection('items').find().toArray(function (err, items) {
    console.log(items)
    res.send(`
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Simple To-Do App</title>
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.2.1/css/bootstrap.min.css" integrity="sha384-GJzZqFGwb1QTTN6wy59ffF1BuGJpLSa9DkKMp0DgiMDm4iYMj70gZWKYbI706tWS" crossorigin="anonymous">
</head>
<body>
  <div class="container">
    <h1 class="display-4 text-center py-1">To-Do App</h1>
    
    <div class=" p-3 shadow-sm">
      <form action ="create-item" method = "POST">
        <div class="d-flex align-items-center">
          <input name="item" autofocus autocomplete="off" class="form-control mr-3" type="text" style="flex: 1;">
          <button class="btn btn-primary">Add New Item</button>
        </div>
      </form>
    </div>
    
    <ul class="list-group pb-5">
      ${items.map(function(item){
          return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
          <span class="item-text">${item.text}</span>
          <div>
            <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
            <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
          </div>
        </li>
        `
      }).join('')}
    </ul>
    
  </div>
  <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
  <script src = "/browser.js"></script>
</body>
</html>`)
  })


})

let validator = text => validator.escape(text).trim().toString()

app.post("/create-item", (req, res) => {



  sanitizedText = validator.escape(req.body.item).trim().toString()
  if (sanitizedText.trim() != "" && sanitizedText.length < 50) {
    db.collection('items').insertOne({
      text: sanitizedText
    }, function () {
      res.redirect("/")
    })
  } else {
    res.redirect("/")
  }





})

app.post("/update-item", (req, res) => {

  sanitizedText = validator.escape(req.body.item).trim().toString()
  if (sanitizedText != "" && sanitizedText < 50) {
    db.collection('items').findOneAndUpdate({
      _id: new mongodb.ObjectId(req.body.id)
    }, {
      $set: {
        text: sanitizedText
      }
    }, () => {
      res.send({
        message: "success"
      })
    })
  }
})

app.post("/delete-item", (req, res) => {
  console.log(req.body.id)
  db.collection('items').deleteOne({
    _id: new mongodb.ObjectId(req.body.id)
  }, function () {
    res.send("Done deleted.")
  })

})

