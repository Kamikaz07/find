/* eslint-disable @typescript-eslint/no-require-imports */
import { v2 as cloudinary } from 'cloudinary';
require('dotenv').config({ path: '.env.local' });

// Configure Cloudinary with credentials from .env.local
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test function to verify Cloudinary configuration
async function testCloudinaryConfig() {
  try {
    console.log('Testing Cloudinary configuration...');
    
    // Check if credentials are set
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Error: Cloudinary credentials are not set in .env.local file');
      console.log('Please add the following to your .env.local file:');
      console.log('CLOUDINARY_CLOUD_NAME=your_cloud_name');
      console.log('CLOUDINARY_API_KEY=your_api_key');
      console.log('CLOUDINARY_API_SECRET=your_api_secret');
      return;
    }
    
    // Test API connection by getting account info
    const result = await cloudinary.api.ping();
    
    if (result.status === 'ok') {
      console.log('✅ Cloudinary configuration is valid!');
      console.log('You can now use Cloudinary for image uploads in your application.');
    } else {
      console.error('❌ Cloudinary configuration test failed');
    }
  } catch (error) {
    console.error('❌ Cloudinary configuration test failed with error:');
    console.error(error);
    console.log('Please check your Cloudinary credentials in .env.local file');
  }
}

// Run the test
testCloudinaryConfig();

// Usage instructions
console.log('\nTo run this test:');
console.log('1. Make sure you have added your Cloudinary credentials to .env.local');
console.log('2. Run: node src/scripts/test-cloudinary.js');