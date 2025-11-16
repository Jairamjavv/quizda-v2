const dotenv = require('dotenv');

dotenv.config();

let R2Client = null;
let R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
let R2_API_URL = process.env.R2_API_URL;
let R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;

try {
  const { R2 } = require('@cloudflare/r2');
  R2Client = new R2({
    accountId: process.env.R2_ACCOUNT_ID,
    accessKey: process.env.R2_ACCESS_KEY,
    secretKey: process.env.R2_SECRET_KEY,
    bucket: process.env.R2_BUCKET_NAME,
  });
} catch (e) {
  console.warn('Cloudflare R2 client not available in this environment; R2 operations will be disabled.');
  R2Client = null;
}

// Example function to interact with R2

const uploadToR2 = async (fileName, fileContent) => {
  if (!R2Client) {
    throw new Error('R2 client not configured in this environment');
  }
  const url = `${R2_API_URL}/${R2_BUCKET_NAME}/${fileName}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${R2_ACCOUNT_ID}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(fileContent),
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to R2: ${response.statusText}`);
  }

  return response.json();
};

module.exports = { R2Client, uploadToR2 };