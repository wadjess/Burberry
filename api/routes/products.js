const express = require('express');
const checkAuth = require('../middlewares/auth');
const ProductsController = require('../controllers/product');

const router = express.Router();

router.get('/', checkAuth, ProductsController.get_all_products);
router.get('/:productId', checkAuth, ProductsController.get_product_by_id);
router.get('/:productId/reviews', checkAuth, ProductsController.get_product_reviews);
router.post('/', checkAuth, ProductsController.post_product);
router.patch('/:productId', checkAuth, ProductsController.patch_product);
router.delete('/:productId', checkAuth, ProductsController.delete_product);

module.exports = router;