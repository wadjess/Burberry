const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    author: {
        type: String,
        required: [true, 'Review author is required']
    },
    date: {
        type: String,
        validate: {
            validator: (v) => {
                return /^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/.test(v);
            },
            message: props => props.value + ' is not a valid date'
        },
        required: [true, 'Review date is required']
    },
    text: {
        type: String,
        maxlength: 200,
        required: [true, 'Review text is required']
    },
    iProduct: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'iProduct is required']
    }
}, { versionKey: false });

module.exports = mongoose.model('Review', reviewSchema);