const express = require('express');
const app = new express();
var url = require('url');

app.get('/', function(request, response){
    response.sendfile('src/home.html');
});

app.use(express.static('assets'));
app.use(express.static('src'));
app.use(express.static('node_modules'));
app.use(express.static('spec'));

app.listen('8080');