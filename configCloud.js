const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({ // configuring backend w/ cloudinary so it has access to our cloudinary account
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret:process.env.CLOUD_API_SECRET
});

const storage = new CloudinaryStorage({ // declaring which folder in cloudinary to be used to store the files
    cloudinary: cloudinary,
    params: {
      folder: 'wanderlust_DEV',
      allowedFormats: ["png", "jpg", "jpeg"],
    },
  });

  module.exports = { cloudinary, storage }