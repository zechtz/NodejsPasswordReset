# Nodejs Password Reset

A simple nodejs Example App implementing the reset password feature

## Using 
- `git clone https://github.com/zechtz/nodejsPasswordRestApp` 
- `cd nodejsPasswordRestApp`
- Run `npm install && bower install`
- Rename the config/secrets.sample.js file to config/secrets.js and add the correct credentials 

### This is how the file looks like 

```javascript 
/* 
   rename this file to secrets.js and then add 
   your proper SendGrid/GMail credentials 
   @note: If you're using Gmail, you need to enable access to less sure apps
   for your gmail account 
*/

module.exports = {
  'SendGrid': {
    'username': 'yousendgrideusername',
    'password': 'yoursendgridpassword'
  }, 
  'Gmail': {
    'username': 'yourgmailusername',
    'password': 'yourgmailpassword'
  }
};
``` 
- Start the app by running `npm start`
- Create a new user by signing up, try to log in and then click forgot password link 
