const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/user');

const router = express.Router();

router.post('/', (req, res, next) => {
	User.find({ username: req.body.username })
		.exec()
		.then(users => {
            //DB doesn't contain 2 users with identical usernames. If users.length > 0, the user with provided username exists and equals users[0]
			if (users.length < 1) {
				return res.status(401).json({
                    // 'user doesn't exist' message may be sent. But it's better to send general error where auth is failed in security reasons
					message: '9Username or password is incorrect'
				});
            }

			let user = users[0];
			
			bcrypt.compare(req.body.password, user.password, (err, result) => {
				if (err) {
					return res.status(401).json({
						message: 'Username or password is incorrect'
					});
				}
				if (result) {
					// generate token
					const token = jwt.sign(
						{
							username: user.username,
							_id: user._id
						},
						process.env.JWT_KEY
					);
					return res.status(200).json({
						message: 'Auth successful',
						data: token
					});
				}
				res.status(401).json({
					message: 'Username or password is incorrect'
				});
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
});

module.exports = router;