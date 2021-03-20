import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import dotenv from 'dotenv'
import colors from 'colors'
import { dbConnect } from './configs/db'
import userRouter from './resources/users/user.router'


colors.enable()
dotenv.config()

const app = express()
app.disable('x-powered-by')

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))



app.use('/api/auth/user', userRouter)

export const startServer = async () => {
  try {
    dbConnect()
    const port = process.env.PORT
    app.listen(port || 4000, () => {
      console.log(`Server Running on port: ${port ? port : 4000}`.green)
    })
  } catch (error) {
    console.error(error.red)
  }
}
