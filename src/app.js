let express = require( 'express' );
let app = express();
let server = require( 'http' ).Server( app );
let io = require( 'socket.io' )( server );
let stream = require( './ws/stream' );
let path = require( 'path' );
let favicon = require( 'serve-favicon' );
let cors=require('cors')

app.use(cors())
app.use( favicon( path.join( __dirname, 'favicon.ico' ) ) );
app.use( '/assets', express.static( path.join( __dirname, 'assets' ) ) );
app.use('/static',express.static(path.join(__dirname,"..","build","static")))
app.use(express.static(path.join(__dirname,"build")))

app.get( '/', ( req, res ) => {
    res.sendFile( __dirname + '/index.html' );
} );

app.get('/compile',(req,res)=>{
    res.sendFile(path.join(__dirname,"..","build","app.html"))
    //res.send("hielo")
})


io.of( '/stream' ).on( 'connection', stream );

server.listen( 3000 );
