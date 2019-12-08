const mongoose = require('mongoose');

const Product = require('../models/product');
const Review = require('../models/review');

exports.get_all_reviews = (req, res, next) => {
    Review.find()
    .exec()
    .then(reviews => {
        res.status(200).json({
            message: reviews.length + ' reviews have been fetched successfully',
            data: reviews
        });
    })
    .catch(err => {
        res.status(500).json({
            error: err
        });
    });
};

exports.get_review_by_id = (req, res, next) => {
    const reviewId = req.params.reviewId;

    Review.findById(reviewId)
        .exec()
        .then(review => {
            if (review) {
                res.status(200).json({
                    message: 'Review with id=' + reviewId + ' has been fetched successfully',
                    data: review
                });
            } else {
                res.status(404).json({
                    error: {
                        message: 'Review with id=' + reviewId + ' does not exist'
                    }
                });
            }
        })
        .catch(err => {
            switch (err.name) {
                case 'CastError':
                    res.status(400).json({
                        error: {
                            message: 'Invalid id=' + reviewId
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

exports.post_review = (req, res, next) => {
    let productId = req.body.iProduct;

    Product.findById(productId)
        .exec()
        .then(product => {
            if (product) {
                Review({
                    ...{_id: new mongoose.Types.ObjectId()},
                    ...req.body
                })
                .save()
                .then(saveReviewResult => {
                    res.status(201).json({
                        message: 'Review has been created successfully',
                        data: saveReviewResult
                    });
                })
                .catch(err => {
                    switch (err.name) {
                        case 'ValidationError' || 'CastError':
                            res.status(400).json({
                                error: err
                            });
                            break;
                        // add other possible cases here
                        default:
                            res.status(500).json({
                                error: err
                            });
                      }
                });
            } else {
                res.status(404).json({
                    error: {
                        message: 'Review has not been saved. Product with id=' + productId + ' does not exist'
                    }
                });
            }
        })
        .catch(err => {
            switch (err.name) {
                case 'CastError':
                    res.status(400).json({
                        error: {
                            message: 'Invalid iProduct=' + productId
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

exports.patch_review = (req, res, next) => {
    const reviewId = req.params.reviewId;
    // the original, unaltered document is returned by default, add {new: true} to return the updated value
    Review.findOneAndUpdate({ _id: reviewId }, req.body)
        .exec()
        .then(reviewUpdateResult => {
            // reviewUpdateResult equals null if the review with specified id is not found
            if (reviewUpdateResult) {
                res.status(200).json({
                    message: 'Review with id=' + reviewId + ' has been updated',
                    data: reviewUpdateResult
                });
            } else {
                res.status(404).json({
                    error: {
                        message: 'Review with id=' + reviewId + ' is not found',
                    }
                });
            }
        })
        .catch(err => {
            switch (err.name) {
                case 'CastError':
                    res.status(400).json({
                        error: {
                            message: 'Invalid id=' + reviewId
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

exports.delete_review = (req, res, next) => {
    const reviewId = req.params.reviewId;

    Review.deleteOne({ _id: reviewId })
        .exec()
        .then(deleteReviewResult => {
            if(deleteReviewResult.deletedCount) {
                res.status(200).json({
                    message: 'Review with id=' + reviewId + ' has been removed',
                    data: [
                        {
                            deleteReviewResult: deleteReviewResult
                        }
                    ]
                });
            } else {
                res.status(404).json({
                    error: {
                        message: 'Review with id=' + reviewId + ' is not found',
                    }
                });
            }
        })
        .catch(err => {
            switch (err.name) {
                case 'CastError':
                    res.status(400).json({
                        error: {
                            message: 'Invalid id=' + reviewId
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