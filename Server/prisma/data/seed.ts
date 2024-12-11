import { PrismaClient } from "@prisma/client";
import * as fs from 'fs'
import * as path from 'path'

// To seed db run npx prisma db seed


const prisma = new PrismaClient()

// function to add spells from the json file to the db
async function main() {
    // Load spells from the json file
    const spellFilePath = path.resolve(__dirname, 'spells.json')
    const data = fs.readFileSync(spellFilePath, 'utf-8')
    const spells = JSON.parse(data)

    await prisma.spell.createMany({
        data: spells
    })

    console.log('Spells added correctly')
}

main()
.catch(e => {
    console.error(e)
    process.exit(1)
})
.finally(async () => {
    await prisma.$disconnect()
})