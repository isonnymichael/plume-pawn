import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import routes from './routes/index.js'
import { initFirebase } from './utils/firebase.js'

const app = express()
const PORT = process.env.PORT || 3301
const API_VERSION = process.env.API_VERSION || 1

// Init Firebase DB
initFirebase()

// Middleware
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

// Routes
app.use(`/api/v${API_VERSION}`, routes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})