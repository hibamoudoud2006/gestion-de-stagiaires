import express from 'express'
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const adapter = new JSONFile('db.json')
const defaultData = { stagiaires: [] }
const db = new Low(adapter, defaultData)

await db.read()

app.use(express.json())

app.use('/LOGO', express.static(path.join(__dirname, 'LOGO')))
app.use('/stag', express.static(path.join(__dirname, 'stag')))
app.use('/', express.static(__dirname))

app.post('/api/stagiaires', async (req, res) => {
  const { nom, email, source } = req.body
  db.data.stagiaires.push({ nom, email, source, date: new Date().toISOString() })
  await db.write()
  res.json({ message: 'Stagiaire enregistré avec succès !' })
})

app.get('/api/stagiaires', async (req, res) => {
  await db.read()
  res.json(db.data.stagiaires)
})

app.delete('/api/stagiaires/:index', async (req, res) => {
  const index = parseInt(req.params.index)
  await db.read()

  if (index >= 0 && index < db.data.stagiaires.length) {
    db.data.stagiaires.splice(index, 1)
    await db.write()
    res.json({ message: 'Stagiaire supprimé.' })
  } else {
    res.status(400).json({ message: 'Index invalide.' })
  }
})

const PORT = 3000
app.listen(PORT, () => console.log(`✅ Serveur actif sur http://localhost:${PORT}`))
