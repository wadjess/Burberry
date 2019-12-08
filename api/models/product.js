const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: {
        type: String,
        maxlength: 100,
        required: [true, 'Product name is required']
    },
    price:  {
        type: Number,
        min: 0,
        required: [true, 'Product price is required']
    },
    options: {
        type: Array,
        required: [true, 'Product options required'],
        validate : {
            validator : array => {
                return array.length > 0 && array.every((v) => typeof v === 'object');
            },
            message: 'Product options are required. Should be array of objects'
        }
    } 
}, { versionKey: false });

module.exports = mongoose.model('Product', productSchema);