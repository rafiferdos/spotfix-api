import 'dotenv/config'
import app from './app.js'
import config from './config/index.js'
import { prisma } from './lib/prisma.js'

const PORT = config.port

async function main() {
	try {
		await prisma.$connect()
		console.log('connection established with database, ready to go!')

		app.listen(PORT, () => {
			console.log('Server is running on port: ', PORT)
		})
	} catch (error) {
		console.log(error)
		await prisma.$disconnect()
		process.exit(1)
	}
}

main()
