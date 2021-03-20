// register errors
export const formErrors = {
  name: {
    required: 'This field can not be empty',
  },
  email: {
    required: 'Please enter a valid email address',
    alreadyRegistered: 'Email already in use',
  },
  password: {
    required: 'You must specify a password',
    minLength: 'Password must have at least 8 characters',
  },
  confirmPassword: {
    validate: 'The passwords do not match',
  },
}

