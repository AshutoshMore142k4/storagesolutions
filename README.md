# S3 File Browser

A modern, minimal dark-mode file browser for Amazon S3 built with Next.js 15, Clerk authentication, and shadcn/ui components.

![S3 File Browser](https://img.shields.io/badge/Next.js-15.4.4-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![AWS S3](https://img.shields.io/badge/AWS-S3-FF9900?style=flat-square&logo=amazon-aws)

## ✨ Features

### 🔐 Authentication
- **Clerk Integration**: Secure user authentication with custom dark theme
- **Protected Routes**: Automatic redirect to sign-in for unauthenticated users

### 📁 File Management
- **Upload Files**: Drag & drop or click to upload files with presigned URLs
- **Download Files**: Direct download links for all file types
- **Delete Files/Folders**: Single or batch deletion with confirmation dialogs
- **Rename Files/Folders**: In-place renaming with validation
- **Create Folders**: New folder creation at any directory level

### 🔍 Advanced Features
- **Global Search**: Search across all files and folders in your S3 bucket
- **File Preview**: Built-in preview for images, text files, and documents
- **Breadcrumb Navigation**: Easy navigation through folder hierarchies
- **File Type Detection**: Smart icons based on file extensions
- **Responsive Design**: Works perfectly on desktop and mobile devices

### 🎨 UI/UX
- **Minimal Dark Theme**: Clean, professional dark mode interface
- **Hover Actions**: Context-sensitive actions appear on hover
- **Loading States**: Smooth loading indicators for all operations
- **Error Handling**: Comprehensive error messages and retry options
- **Keyboard Navigation**: Full keyboard accessibility support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- AWS account with S3 bucket
- Clerk account for authentication

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd my-clerk-app
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Fill in your environment variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_secret

# AWS Configuration
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
AWS_S3_BUCKET_NAME=your-bucket-name
```

4. **Run the development server**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Project Structure

```
my-clerk-app/
├── app/
│   ├── api/
│   │   ├── objects/route.ts        # List S3 objects
│   │   ├── upload/route.ts         # Generate presigned upload URLs
│   │   ├── file/route.ts           # Get file download URLs
│   │   ├── delete/route.ts         # Delete files/folders
│   │   ├── rename/route.ts         # Rename files/folders
│   │   ├── create-folder/route.ts  # Create new folders
│   │   └── search/route.ts         # Search functionality
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout with Clerk
│   └── page.tsx                    # Main application page
├── components/
│   └── ui/
│       ├── file-structure.tsx      # Main file browser component
│       ├── file-preview.tsx        # File preview dialog
│       ├── nav.tsx                 # Navigation component
│       └── [shadcn components]     # UI components
├── lib/
│   └── utils.ts                    # Utility functions
└── middleware.ts                   # Clerk middleware
```

## 🔧 Configuration

### AWS S3 Setup

1. **Create an S3 bucket** in your AWS console
2. **Configure CORS** for your bucket:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

3. **Set up IAM permissions** for S3 operations:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::your-bucket-name",
        "arn:aws:s3:::your-bucket-name/*"
      ]
    }
  ]
}
```

### Clerk Authentication Setup

1. **Create a Clerk application** at [clerk.com](https://clerk.com)
2. **Configure sign-in options** (email, social providers, etc.)
3. **Add your domain** to allowed origins
4. **Copy your API keys** to the environment variables

## 📱 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/objects` | GET | List files and folders |
| `/api/upload` | GET | Generate presigned upload URL |
| `/api/file` | GET | Get file download URL |
| `/api/delete` | DELETE | Delete file or folder |
| `/api/rename` | PUT | Rename file or folder |
| `/api/create-folder` | POST | Create new folder |
| `/api/search` | GET | Search files and folders |

## 🎨 Customization

### Theme Colors
The application uses a consistent dark color palette:
- `gray-950`: Background
- `gray-900`: Cards and containers
- `gray-800`: Borders and hover states
- `gray-300`: Primary text
- `gray-500`: Secondary text

### Extending Features
The modular architecture makes it easy to add new features:

1. **Add new API routes** in `app/api/`
2. **Create new components** in `components/ui/`
3. **Update the main component** in `file-structure.tsx`

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect your repository** to Vercel
2. **Add environment variables** in Vercel dashboard
3. **Deploy** - automatic deployments on push

### Manual Deployment

1. **Build the application**
```bash
pnpm build
```

2. **Start the production server**
```bash
pnpm start
```

## 🔍 Troubleshooting

### Common Issues

**CORS Errors**: Ensure your S3 bucket CORS configuration includes your domain

**Authentication Issues**: Verify your Clerk keys and domain configuration

**File Upload Failures**: Check AWS credentials and S3 permissions

**Hydration Errors**: Add `suppressHydrationWarning` to components if needed

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Clerk](https://clerk.com/) - Authentication platform
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [AWS SDK](https://aws.amazon.com/sdk-for-javascript/) - AWS integration
- [Lucide Icons](https://lucide.dev/) - Beautiful icons

## 📞 Support

For support, email your-email@example.com or create an issue in this repository.

---

**Made with ❤️ using Next.js and AWS S3**
