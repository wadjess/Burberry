const mongoose = require('mongoose');

const Product = require('../models/product');
const Review = require('../models/review');

exports.get_all_products = (req, res, next) => {
    Product.find()
    .exec()
    .then(products => {
        res.status(200).json({
            message: products.length + ' products have been fetched successfully',
            data: products
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
};

exports.get_product_by_id = (req, res, next) => {
    const productId = req.params.productId;

    Product.findById(productId)
        .select({'id': 0})
        .exec()
        .then(product => {
            if (product) {
                res.status(200).json({
                    message: 'Product with id=' + productId + ' has been fetched successfully',
                    data: product
                });
            } else {
                res.status(404).json({
                    error: {
                        message: 'Product with id=' + productId + ' does not exist'
                    }
                });
            }
        })
        .catch(err => {
            switch (err.name) {
                case 'CastError':
                    res.status(400).json({
                        error: {
                            message: 'Invalid id=' + productId
                        }
                    });
                    break;
                // add here other possible cases
                default:
                    res.status(500).json({
                        error: err
                    });
              }
        });
};

exports.get_product_reviews = (req, res, next) => {
    const productId = req.params.productId;

    Review.find({ iProduct: productId })
        .select({'id': 0})
        .sort('-date')
        .exec()
        .then(reviews => {
            if (reviews.length) {
                res.status(200).json({
                    message: 'Reviews for product with id=' + productId + ' have been fetched successfully',
                    data: reviews
                });
            } else {
                res.status(404).json({
                    error: {
                        message: 'Reviews for product with id=' + productId + ' do not exist'
                    }
                });
            }
        })
        .catch(err => {
            switch (err.name) {
                case 'CastError':
                    res.status(400).json({
                        error: {
                            message: 'Invalid id=' + productId
                        }
                    });
                    break;
                // add other possible cases here
                default:
                    res.status(500).json({
                        error: err
                    });
              }
        });
};

exports.post_product = (req, res, next) => {
    Product({
        ...{_id: new mongoose.Types.ObjectId()},
        ...req.body
    })
    .save()
    .then(saveProductResult => {
        res.status(201).json({
            message: 'Product has been created successfully',
            data: saveProductResult
        });
    })
    .catch(err => {
        switch (err.name) {
            case 'ValidationError' || 'CastError':
                res.status(400).json({
                    error: err
                });
                break;

            // add here other possible cases
            default:
                res.status(500).json({
                    error: err
                });
          }
    });
};

exports.patch_product = (req, res, next) => {
    const productId = req.params.productId;
    // the original, unaltered document is returned by default, add {new: true} to return the updated value
    Product.findOneAndUpdate({ _id: productId }, req.body)
        .exec()
        .then(productUpdateResult => {
            // productUpdateResult equals null if the product with specified id is not found
            if (productUpdateResult) {
                res.status(200).json({
                    message: 'Product with id=' + productId + ' has been updated',
                    data: productUpdateResult
                });
            } else {
                res.status(404).json({
                    error: {
                        message: 'Product with id=' + productId + ' is not found',
                    }
                });
            }
        })
        .catch(err => {
            switch (err.name) {
                case 'CastError':
                    res.status(400).json({
                        error: {
                            message: 'Invalid id=' + productId
                        }
                    });
                    break;
                // add here other possible cases
                default:
                    res.status(500).json({
                        error: err
                    });
              }
        });
};

exports.delete_product = (req, res, next) => {
    const productId = req.params.productId;

    Product.deleteOne({ _id: productId })
        .exec()
        .then(deleteProductResult => {

            if (deleteProductResult.deletedCount) { // if count of deleted product > 0, reviews must be also deleted
                Review.deleteMany({ iProduct: productId })
                .exec()
                .then(deleteReviewsResult => {
                    res.status(200).json({
                        message: 'Product with specified id and dependent reviews have been removed',
                        data: [
                            {
                                deleteProductResult: deleteProductResult
                            },
                            {
                                deleteReviewsResult: deleteReviewsResult
                            },
                        ]
                    });
                })
            } else { // if count of deleted product === 0
                res.status(404).json({
                    error: {
                        message: 'Product with specified id=' + productId + ' does not exist',
                    }
                });
            }
        })
        .catch(err => {
            switch (err.name) {
                case 'CastError':
                    res.status(400).json({
                        error: {
                            message: 'Invalid id=' + productId
                        }
                    });
                    break;
                // add here other possible cases
                default:
                    res.status(500).json({
                        error: err
                    });
            }
        });
};