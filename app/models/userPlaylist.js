let mongoose = require('mongoose');
userPlaylistDb = require('../db/userPlaylistDb');

let Schema = mongoose.Schema;

//the Schema
let UserPlaylistSchema = new Schema({
    idUser : { type : String, required: true },
    namePlaylist : { type : String, required: true, index: {unique: true}},
    playlist : {type:Array, default:[]}
});


//exporting model
module.exports = userPlaylistDb.model('UserPlaylist', UserPlaylistSchema);