import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import cors from 'cors'
import multer from 'multer'

const app = express()
app.use(cors()) // enables api queries
app.use(express.json()) // enables req.body
const PORT = process.env.PORT || 5001
app.listen(PORT, err => err ? console.log(err) : console.log(`SERVER OK, PORT: ${PORT}`))
mongoose.connect(`mongodb+srv://enotowitch:qwerty123@cluster0.9tnodta.mongodb.net/cron?retryWrites=true&w=majority`)
	.then(console.log('DB OK')).catch(err => console.log('ERROR', err))

// ! routes
import * as post from "./controllers/post.js"

// ! multer
// Define the destination folder for uploaded files
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/'); // Specify the folder where uploaded files will be stored
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage: storage });

app.post('/create', upload.single('img'), post.create, (req, res) => {
	// Handle the uploaded file
	console.log(req.file); // This will log information about the uploaded file

	// Your processing logic here

	res.sendStatus(200);
});

app.post("/posts", post.posts)

// ! cron

import fs from 'fs';
import path from 'path';
import cron from 'node-cron';

// Function to clear the "upload/folder1" directory of files older than 15 seconds
function clearFolder() {
	console.log(`TRIED: ${Date()}`)
	const folderPath = 'uploads/';

	// Calculate the timestamp for 15 seconds ago
	const fifteenSecondsAgo = new Date();
	fifteenSecondsAgo.setSeconds(fifteenSecondsAgo.getSeconds() - 15);

	// Check if the folder exists, and create it if not
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath, { recursive: true });
		console.log(`Created folder ${folderPath}`);
	}

	// Read the contents of the folder
	fs.promises.readdir(folderPath)
		.then((files) => {
			// Iterate through files in the folder
			files.forEach((file) => {
				const filePath = path.join(folderPath, file);

				// Get the file's stats (including modification time)
				fs.promises.stat(filePath)
					.then((stats) => {
						// Check if the file is older than 15 seconds
						if (stats.mtime < fifteenSecondsAgo) {
							// Delete the file
							fs.promises.unlink(filePath)
								.then(() => {
									console.log(`Deleted file ${filePath}`);
								})
								.catch((err) => {
									console.error(`Error deleting file ${filePath}:`, err);
								});
						}
					})
					.catch((err) => {
						console.error(`Error getting file stats for ${filePath}:`, err);
					});
			});
		})
		.catch((err) => {
			console.error('Error reading folder:', err);
		});
}

// Schedule the clearFolder function to run every second (*/15 * * * * *)
cron.schedule('*/5 * * * * *', () => {
	clearFolder(); // Call your script function here
});
