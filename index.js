var hapi = require('hapi');
var boom = require('boom');
var good = require('good');
var path = require('path');
// own files
var fortune = require('./lib/fortune.js');
// call server contructor
var server = new hapi.Server();
server.connection({ port: 3000 });
// configure templating
server.views({
  engines: {
    // file extension: engine
    hbs: require('handlebars') // use hbs, not html
  },
  path: path.join(__dirname, 'templates'), // set templates directory
  layout: 'main', // use a 'main' layout
  layoutKeyword: 'content' // where the 'main' layout's templates will be placed
});

// serve static files
server.route({
  path: "/public/{path*}",
  method: "GET",
  handler: {
    // serving a directory of files
    directory: {
      path: "./public", // req. directory root path
      index: false // determines if index.html will be served
    }
  }
});

// catch first two routes
server.route({
  method:'GET',
  path: '/',
  handler: function(request, reply){
    // return reply('Meadowlark Travel').type('text/plain');
    return reply.view('home');
  }
});

server.route({
  method:'GET',
  path: '/about',
  handler: function(request, reply){
    // return reply('About Meadowlark Travel').type('text/plain');
    return reply.view('about', { fortune: fortune.getFortune() });
  }
});
// must be the last catch all
// custom 404 page
server.route({
  method: '*',
  path: '/{p*}',
  handler: function(request, reply){
    return reply(boom.notFound('Error 404'));
  }
});

// custom 500 page
// server.route({
//   method: '*',
//   path: '/*',
//   handler: function(request, reply){
//     var error = new Error('Server Error');
//     boom.wrap(error, 500);
//   }
// });

// add good for console info
server.register({
  register: good,
  options: {
    reporters: [{
      reporter: require('good-console'),
      args:[{ log: '*', response: '*' }]
    }]
  }
}, function (err) {
  if (err) {
    throw err; // something bad happened loading the plugin
  }

  server.start(function () {
    server.log('info', 'Server running at: ' + server.info.uri);
  });
});
