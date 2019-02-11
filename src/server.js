const express = require('express');
const app = new express();
var url = require('url');

app.get('/', function(request, response){
    response.sendfile('td.html');
    
});

app.get(/.png/, function(request, response){
    var path = __dirname.slice(0, -4);
    path = path + request.url;
    response.sendfile(path);
});

app.listen('8080');