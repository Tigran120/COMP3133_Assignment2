require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const multer = require('multer');
const connectDB = require('./config/db');
const typeDefs = require('./graphql/schema');
const resolvers = require('./graphql/resolvers');
const { uploadToCloudinary } = require('./utils/cloudinary');
const { getUserIdFromRequest } = require('./utils/authContext');

connectDB();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  })
);
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

app.post('/api/upload', upload.single('photo'), async (req, res) => {
  try {
    if (!getUserIdFromRequest(req)) {
      return res.status(401).json({ success: false, message: 'Unauthorized', url: null });
    }
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      return res.status(503).json({ success: false, message: 'Cloudinary not configured. Set CLOUDINARY_* env vars.', url: null });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded', url: null });
    }
    const url = await uploadToCloudinary(req.file.buffer);
    res.json({ success: true, message: 'Image uploaded', url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Upload failed', url: null });
  }
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({
    userId: getUserIdFromRequest(req),
  }),
  formatError: (err) => ({
    message: err.message,
    extensions: err.extensions,
  }),
});

async function start() {
  await server.start();
  server.applyMiddleware({ app, path: '/graphql' });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
    console.log(`Image upload: POST http://localhost:${PORT}/api/upload`);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
