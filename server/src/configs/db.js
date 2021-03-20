import mongoose from 'mongoose'

export const dbConnect = async () => {
  try {
    const dbURI = process.env.MONGO_URI  // add URI mongodb atlas <====> 
    const dbConnection = await mongoose.connect(
      `${dbURI ? dbURI : 'mongodb://localhost:27017/authentication'}`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: true,
      }
    )
    console.log(`Database connected on: ${dbConnection.connection.host}`.green)
  } catch (error) {
    console.error(`${error}`.red)
  }
}
