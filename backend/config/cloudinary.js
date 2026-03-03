const { v2: cloudinary } = require('cloudinary');

const requiredVars = [
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missing = requiredVars.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  throw new Error(
    `Cloudinary config missing: ${missing.join(', ')}. Set these in .env`
  );
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
