import express from 'express'
import { getDB } from '../utils/firebase.js'
import { ref, set, get } from 'firebase/database'

const router = express.Router()

router.get('/', (req, res) => res.send('Plume Pawn API is live'))

export default router