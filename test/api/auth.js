// not test env is used to fetch creds data from db
//process.env.NODE_ENV = 'test';

const expect = require('chai').expect;
const jwt = require('jsonwebtoken');
const request = require('supertest');

const app = require('../../app');
const db = require('../../db');

const user = {
    username: 'burberrydev',
    password: 'burberrydev'
}

describe('auth.js: POST /auth', () => {
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

    it('it responds with 401 status code if bad username or password', (done) => {
        request(app)
            .post('/auth')
            .set('Content-Type', 'application/json')
            .send({'username':'bad','password':'wrong'})
            .expect(401)
            .then((res) => {
                done();
            })
            .catch((err) => done(err));
    });

    it('it responds with 200 status code if good username or password', (done) => {
        request(app)
            .post('/auth')
            .set('Content-Type', 'application/json')
            .send({'username': user.username, 'password': user.password})
            .expect(200)
            .then((res) => {
                done();
            })
            .catch((err) => done(err));
    });

    it('it returns JWT token if good username or password', (done) => {
        request(app)
            .post('/auth')
            .set('Content-Type', 'application/json')
            .send({'username': user.username,'password': user.password})
            .then((res) => {
                expect(res.body).have.property('data');
                expect(res.body.data).to.be.a('string');
                done();
            })
            .catch((err) => done(err));

    });
});