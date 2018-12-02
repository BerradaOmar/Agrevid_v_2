/*Create connections to mongodb Databases*/
let config = require('../../config');
let mongoose = require('mongoose');

let userPlaylistDb = mongoose.createConnection(config.userPlaylistDb,{ useNewUrlParser: true });

userPlaylistDb.on('error', function(err){
    if(err) throw err;
});

userPlaylistDb.once('open', function callback () {
    console.info('Connected to userPlaylistDb db successfully');
});



module.exports = userPlaylistDb;

//mongoose.set('useCreateIndex', true);