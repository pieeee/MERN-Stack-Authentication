import nodemailer from 'nodemailer'
import hbs from 'nodemailer-handlebars'

// treansporter config
const gmailSMTP = {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
}
const mailTramSMTP = {
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: '',
    pass: '',
  },
}

// Check out mailtrap here https://mailtrap.io/

const transporter = nodemailer.createTransport(mailTramSMTP)
const handlebarOptions = {
  viewEngine: {
    extName: '.hbs',
    partialsDir: './src/utils/emails/views',
    layoutsDir: './src/utils/emails/views',
    defaultLayout: '',
  },
  viewPath: './src/utils/emails/views',
  extName: '.hbs',
}

transporter.use('compile', hbs(handlebarOptions))
transporter.verify(function (error, success) {
  if (error) {
    console.log(error)
  } else {
    console.log('Server is ready to take our messages')
  }
})

// email config
const emailConfig = {
  verifyAccount: {
    subject: 'Verify your account on PIEDEVS',
    template: 'verifyAccount',
  },
  passwordReset: {
    subject: '[Important] Reset Password',
    template: 'passwordReset',
  },
}

/**
 *
 * @param {String} type
 * @param {String} to
 * @param {Obj} context
 * @param {Boolean} send
 */

const sendEmail = ({ type, to, context, send = false }) =>
  transporter.sendMail({
    headers: {
      priority: 'high',
    },
    from: {
      name: 'no-reply',
      address: `${
        send ? 'smtp_email' : 'mail_trap_key@inbox.mailtrap.io'
      }`,
    },
    to,
    subject: emailConfig[type].subject,
    template: emailConfig[type].template,
    context,
  })

export default sendEmail
