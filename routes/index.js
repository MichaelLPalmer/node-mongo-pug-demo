const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();

const mongoose = require('mongoose');
const Registration = mongoose.model('Registration');

const path = require('path');
const auth = require('http-auth');

const basic = auth.basic({
  file: path.join(__dirname, '../users.htpasswd'),
});

router.get('/', basic.check((req, res) => {
  res.render('home', { title: 'Registration app' });
}));

router.get('/register', (req, res) => {
  res.render('form', { title: 'Registration form' });
});

router.post('/register',
  [
    check('name')
      .isLength({min:1, max: undefined})
      .withMessage('Please enter a name'),
    check('email')
      .isLength({ min: 1 })
      .withMessage('Please enter an email'),
  ],
  (req, res) => {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
      const registration = new Registration(req.body);
      registration.save()
        .then(() => { res.send('Thank you for your registration!'); 
          console.log("Registered: ");
          console.log(req.body);
      })
        .catch((err) => {
          console.log(err);
          res.send('There was an error saving your registration.');
        });
    } else {
      console.log("Error: ");
      console.log(req.body);
      console.log(errors.array());
      res.render('form', {
        title: 'Registration form',
        errors: errors.array(),
        data: req.body,
      });
    }
  }
);

router.get('/registrations', basic.check((req, res) => {
  Registration.find()
    .then((registrations) => {
      res.render('index', { title: 'Listing registrations', registrations });
    })
    .catch(() => { res.send('Error retrieving registrations.'); });
}));

module.exports = router;

