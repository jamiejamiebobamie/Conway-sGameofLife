const express = require('express')
const app = express()
const path = require('path')

var exphbs = require('express-handlebars');

app.use(express.static(path.join(__dirname, '/public')));

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

const port = process.env.PORT || 14000;

 app.get('/', (req, res) => {
     res.render('index', {});
 });


app.listen(port);
