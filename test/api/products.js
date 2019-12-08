process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../../app');
const db = require('../../db');

const user = {
    _id: '5ded15d11c9d4400007607bb',
    username: 'burberrydev',
    password: 'burberrydev'
}

describe('products.js:', () => {
    const token = jwt.sign(
        {
            username: user.username,
            _id: user._id
        },
        process.env.JWT_KEY
    );

    const product = {
        name: 'Small Vintage Check and Leather Crossbody Bag',
        price: 910,
        options: [{ 'color': 'beige' }, { 'size': 'one size' }]
    };

    const productToUpdate = {
        name: 'Small Vintage Check and Leather Crossbody Bag',
        price: 900,
        options: [{ 'color': 'beige' }, { 'size': 'one size' }]
    };

    const review = {
        author: 'Jane Air',
        date: '2019-08-19',
        text: 'Awesome product',
        iProduct: null
    };

    before((done) => {
        db.connect()
            .then(() => done())
            .catch((err) => done(err));
    })

    after((done) => {
        db.close()
            .then(() => done())
            .catch((err) => done(err));
    })

    it('GET /products - it responds with 401 status code if no authorization header', (done) => {
        request(app)
            .get('/products')
            .expect(401)
            .then((res) => {
                done();
            })
            .catch((err) => done(err));
    });

    it('GET /products - it returns an empty array of products', (done) => {
        request(app).get('/products')
            .set({ 'Authorization': 'Bearer ' + token })
            .then((res) => {
                const body = res.body;
                expect(res.body.data.length).to.equal(0);
                done();
            })
            .catch((err) => done(err));
    });

    it('GET /products/:productId - it returns 1 product by id', (done) => {
        request(app)
            .post('/products')
            .set({ 'Authorization': 'Bearer ' + token })
            .send(product)
            .then((res) => {
                const id = res.body.data._id;
                request(app).get('/products/' + id)
                    .set({ 'Authorization': 'Bearer ' + token })
                    .then((res) => {
                        expect(res.body.data).to.be.a('object')
                        expect(res.body).have.property('data');
                        expect(res.body.data).have.property('_id');
                        expect(res.body.data._id).to.equal(id);
                        expect(res.body.data).have.property('name');
                        expect(res.body.data.name).to.equal(product.name);
                        expect(res.body.data).have.property('price');
                        expect(res.body.data.price).to.equal(product.price);
                        expect(res.body.data).have.property('options');
                        expect(res.body.data.options).to.eql(product.options);
                        done();
                    })
            })
            .catch((err) => done(err));
    });

    it('GET /products/:productId/reviews - it returns all reviews of product', (done) => {
        request(app)
            .post('/products')
            .set({ 'Authorization': 'Bearer ' + token })
            .send(product)
            .then((res) => {
                request(app)
                    .get('/products')
                    .set({ 'Authorization': 'Bearer ' + token })
                    .then((res) => {
                        review.iProduct = res.body.data[0]._id;
                        request(app)
                            .post('/reviews')
                            .set({ 'Authorization': 'Bearer ' + token })
                            .send(review)
                            .then((res) => {
                                request(app)
                                    .get('/products/' + review.iProduct + '/reviews')
                                    .set({ 'Authorization': 'Bearer ' + token })
                                    .expect(200)
                                    .then((res) => {
                                        expect(res.body.data.length).to.equal(1);
                                        expect(res.body).have.property('data');
                                        expect(res.body.data[0]).have.property('_id');
                                        expect(res.body.data[0]).have.property('author');
                                        expect(res.body.data[0].author).to.equal(review.author);
                                        expect(res.body.data[0]).have.property('text');
                                        expect(res.body.data[0].text).to.equal(review.text);
                                        expect(res.body.data[0]).have.property('date');
                                        expect(res.body.data[0].date).to.eql(review.date);
                                        expect(res.body.data[0]).have.property('iProduct');
                                        expect(res.body.data[0].iProduct).to.eql(review.iProduct);
                                        done();
                                    })
                                    .catch((err) => done(err));
                            })
                            .catch((err) => done(err));
                    })
                    .catch((err) => done(err));
            })
            .catch((err) => done(err));
        });

        it('PATCH /products/:productId - it updates 1 product by id', (done) => {
            request(app)
                .post('/products')
                .set({ 'Authorization': 'Bearer ' + token })
                .send(product)
                .then((res) => {
                    request(app)
                        .get('/products')
                        .set({ 'Authorization': 'Bearer ' + token })
                        .then((res) => {
                            let id = res.body.data[0]._id;
                            request(app)
                                .patch('/products/' + id)
                                .set({ 'Authorization': 'Bearer ' + token })
                                .send(productToUpdate)
                                .then((res) => {
                                    // old not updated record is returned by db by default
                                    //therefore, one more GET req is required to check the results
                                    request(app)
                                        .get('/products')
                                        .set({ 'Authorization': 'Bearer ' + token })
                                        .then((res) => {
                                            expect(res.body.data[0].price).to.equal(productToUpdate.price);
                                            done();
                                        })
                                        .catch((err) => done(err));
                                })
                                .catch((err) => done(err));
                        })
                })
                .catch((err) => done(err));
        });

        it('PATCH /products/:productId - it responds with 400 status code if specified product id is not valid', (done) => {
            let notValidId = 'id';
                request(app)
                    .patch('/products/' + notValidId)
                    .set({ 'Authorization': 'Bearer ' + token })
                    .send(productToUpdate)
                    .expect(400)
                    .then((res) => {
                        expect(res.body).to.have.property('error')
                        done();
                    })
                    .catch((err) => done(err));
        });

        it('PATCH /products/:productId - it responds with 404 status code if product with spesified id doesn\'t exist', (done) => {
            let notExistProductId = '5de81fc15ab5264604d45000';
                request(app)
                    .patch('/products/' + notExistProductId)
                    .set({ 'Authorization': 'Bearer ' + token })
                    .send(productToUpdate)
                    .expect(404)
                    .then((res) => {
                        expect(res.body).to.have.property('error')
                        done();
                    })
                    .catch((err) => done(err));
        });

        it('DELETE /products/:productId - it deletes a product by id and all related reviews', (done) => {
            request(app)
                .post('/products')
                .set({ 'Authorization': 'Bearer ' + token })
                .send(product)
                .then((res) => {
                    request(app)
                        .get('/products')
                        .set({ 'Authorization': 'Bearer ' + token })
                        .then((res) => {
                            let id = res.body.data[0]._id;
                            request(app)
                                .delete('/products/' + id)
                                .set({ 'Authorization': 'Bearer ' + token })
                                .then((res) => {
                                    request(app)
                                        .get('/products/' + id)
                                        .set({ 'Authorization': 'Bearer ' + token })
                                        .expect(404)
                                        .then((res) => {
                                            request(app)
                                                .get('/products/' + id + '/reviews')
                                                .set({ 'Authorization': 'Bearer ' + token })
                                                .expect(404)
                                                .then((res) => {
                                                    done();
                                                })
                                                .catch((err) => done(err));
                                        })
                                        .catch((err) => done(err));
                                })
                                .catch((err) => done(err));
                        })
                })
                .catch((err) => done(err));
        });

        it('DELETE /products/:productId - it responds with 400 status code if specified product id is not valid', (done) => {
            let notValidId = 'id';
                request(app)
                    .delete('/products/' + notValidId)
                    .set({ 'Authorization': 'Bearer ' + token })
                    .expect(400)
                    .then((res) => {
                        expect(res.body).to.have.property('error')
                        done();
                    })
                    .catch((err) => done(err));
        });

        it('DELETE /products/:productId - it responds with 404 status code if product with spesified id doesn\'t exist', (done) => {
            let notExistProductId = '5de81fc15ab5264604d45000';
                request(app)
                    .delete('/products/' + notExistProductId)
                    .set({ 'Authorization': 'Bearer ' + token })
                    .expect(404)
                    .then((res) => {
                        expect(res.body).to.have.property('error')
                        done();
                    })
                    .catch((err) => done(err));
        });
    })