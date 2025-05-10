# Find - Marketplace Application

This is a Next.js application for a marketplace platform where users can create, view, and manage advertisements.

## Features

- Public page with all advertisements
- User dashboard for authenticated users
- Create, edit, and delete advertisements
- Search advertisements by keyword
- Authentication with NextAuth.js
- Image upload and management with Cloudinary

## Cloudinary Integration

This application uses Cloudinary for image storage and management. Follow these steps to set up Cloudinary for your environment:

### 1. Create a Cloudinary Account

1. Sign up for a free account at [cloudinary.com](https://cloudinary.com/)
2. After signing up, you'll be provided with your Cloud Name, API Key, and API Secret

### 2. Configure Environment Variables

Add your Cloudinary credentials to the `.env.local` file:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Replace `your_cloud_name`, `your_api_key`, and `your_api_secret` with the values from your Cloudinary dashboard.

### 3. Verify Configuration

To verify that Cloudinary is properly configured, you can use the included test script:

```bash
node src/scripts/test-cloudinary.js
```

This script will check if your Cloudinary credentials are valid and if the connection to Cloudinary's API is working.

You can also verify the configuration by:

1. Starting the application with `npm run dev`
2. Navigating to the "Criar Anúncio" page
3. Uploading an image when creating a new advertisement
4. If the image uploads successfully and appears in the advertisement, Cloudinary is properly configured

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env.local`
4. Run the development server: `npm run dev`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Building for Production

```bash
npm run build
npm start
```

### Running Tests

```bash
npm run test
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deployment

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.
