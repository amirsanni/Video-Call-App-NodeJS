let express = require( 'express' );
let app = express();
let server = require( 'http' ).Server( app );
let io = require( 'socket.io' )( server );
let stream = require( './ws/stream' );
let path = require( 'path' );
let favicon = require( 'serve-favicon' );

app.use( favicon( path.join( __dirname, 'favicon.ico' ) ) );
app.use( '/assets', express.static( path.join( __dirname, 'assets' ) ) );

app.get( '/', ( req, res ) => {
    console.log("Request received")
    res.sendFile( __dirname + '/index.html' );
});


io.of( '/stream' ).on( 'connection', stream );

server.listen( 3000, (err) => {
    if(!err){
        console.log("Server listening to port 3000")
    }else{
        console.log("Error in starting the app: ",err)
    } 
} );
