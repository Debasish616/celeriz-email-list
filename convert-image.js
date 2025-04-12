import fs from 'fs'
import path from 'path'

const imagePath = path.join(process.cwd(), 'public', 'images', 'logo.png')
const imageBuffer = fs.readFileSync(imagePath)
const base64Image = imageBuffer.toString('base64')
const dataUrl = `data:image/png;base64,${base64Image}`

console.log('Base64 Image Data URL:')
console.log(dataUrl) 