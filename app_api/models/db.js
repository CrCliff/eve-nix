// Chris Clifford
// 1/2019
//
// Database for eve-nix RP
// 

var mongoose = require( 'mongoose' );
var readLine = require( 'readline' );
require( './orders' );

var URI;
const PROD_DB = 'mongodb://localhost:27017/prod';
const LIVE_DB = 'mongodb://localhost:27017/eve-nix';

if ( process.env.NODE_ENV === 'prod' ) {
  URI = PROD_DB;
}
else {
  URI = LIVE_DB;
}

mongoose.connect( URI );

/* Shutdown function for specific mongoose disconnects */
const cleanShutdown = function (msg, callback) {
  mongoose.connection.close( () => {
    console.log( 'Mongoose disconnected through ' + msg + '.' );
    callback();
  });
};

/* Emit SIGINT on Windows machines. */
if ( process.platform === 'win32' ) {
  var rl = readLine.createInterface ({
    input: process.stdin,
    output: process.stdout
  });
  rl.on( 'SIGINT' , () => {
    process.emit( 'SIGINT' );
  });
}

/* Mongoose successfully connected. */
mongoose.connection.on( 'connected' , () => {
  console.log( 'Mongoose connected to ' + URI );
});

/* Mongoose connection error. */
mongoose.connection.on( 'error', (connectErr) => {
  console.log( 'Mongoose connection error: ' + connectErr );
});

/* Mongoose connection ended. */
mongoose.connection.on( 'disconnected', () => {
  console.log( 'Mongoose disconnected.' );
});

/* SIGUSR2 msg = nodemon shutdown */
process.once( 'SIGUSR2', () => {
  cleanShutdown( 'nodemon restart', () => {
  	process.kill( process.pid, 'SIGUSR2' );
  });	
});

/* SIGINT msg = application shutdown */
process.once( 'SIGINT', () => {
  cleanShutdown( 'app termination', () => {
    process.exit(0);
  });
});

