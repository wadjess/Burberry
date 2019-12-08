const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    username: {
        type: String,
        maxlength: 200,
        required: [true, 'Username is required']
    },
    password: {
        type: String,
        maxlength: 200,
        required: [true, 'Password is required']
    }
}, { versionKey: false });

module.exports = mongoose.model('User', userSchema);