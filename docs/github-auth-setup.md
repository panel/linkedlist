# GitHub OAuth Setup Guide for LinkedList

This guide explains how to set up GitHub OAuth authentication for the LinkedList application.

## 1. Create a GitHub OAuth Application

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on "OAuth Apps" in the sidebar
3. Click "New OAuth App" button
4. Fill in the application details:
   - **Application name**: LinkedList
   - **Homepage URL**: http://localhost:5173 (for development)
   - **Application description** (optional): A link saving application with chronological notes
   - **Authorization callback URL**: http://localhost:5173/auth/callback/github
5. Click "Register application"
6. You'll be taken to the application settings page
7. Make note of the **Client ID** that is displayed
8. Click "Generate a new client secret" and make note of the **Client Secret** that is displayed
   - ⚠️ **Important**: This is the only time the client secret will be shown, so save it securely

## 2. Configure Environment Variables

Create a `.env` file in the root of your project with the following variables:

```
# GitHub OAuth Configuration
VITE_GITHUB_CLIENT_ID=your_client_id_here
VITE_GITHUB_CLIENT_SECRET=your_client_secret_here

# Database Configuration (if using a real database)
DATABASE_URL="postgres://user:password@host:port/db-name"
USE_REAL_DATA="false"  # Change to true if using a real database
```

Replace `your_client_id_here` and `your_client_secret_here` with the values from your GitHub OAuth application.

## 3. Authentication Flow

The authentication flow works as follows:

1. User clicks "Continue with GitHub" on the login page
2. User is redirected to GitHub for authorization
3. After authorization, GitHub redirects back to our callback URL
4. The callback handler exchanges the code for an access token
5. User information is retrieved from GitHub API
6. A user record is created or updated in our database
7. A session is established and the user is redirected to the home page

## 4. Testing the Authentication

1. Start the development server: `npm run dev`
2. Navigate to http://localhost:5173/login
3. Click "Continue with GitHub"
4. Authorize the application on GitHub
5. You should be redirected back to the application and logged in

## 5. Production Considerations

For production deployment, you'll need to:

1. Create a new GitHub OAuth application with your production domain
2. Update the callback URL to use your production domain
3. Set the appropriate environment variables in your production environment
4. Consider implementing proper database session storage for production use

## 6. Troubleshooting

If you encounter any issues:

- Check that your environment variables are set correctly
- Verify that the callback URL exactly matches what's configured in GitHub
- Check the browser console and server logs for error messages
- Make sure your application is accessible at the URL you've configured