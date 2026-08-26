const mongoose = require('mongoose');

const uri = 'mongodb+srv://asiriindrajithjayakodi_db_user:FcsYY4X6aKFIB9cE@cluster0.wq0lt9b.mongodb.net/my_portfolio?appName=Cluster0';

async function syncCVData() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log('Connected to MongoDB.');

  // 1. Update Profile
  const existingProfile = await db.collection('profiles').findOne({});
  const avatarUrl = existingProfile?.avatarUrl || 'https://avatars.githubusercontent.com/u/104332924?v=4';
  
  const updatedProfile = {
    name: 'Asiri Indrajith Jayakodi',
    titles: ['IT Undergraduate', 'Full Stack Developer', 'Cloud & Serverless Enthusiast', 'IoT Developer'],
    bio: 'Third-year IT Undergraduate at the University of Moratuwa (CGPA 3.58/4.0) with a strong foundation in computer science and full-stack software development. Skilled in modern web frameworks like Next.js and React, alongside serverless cloud architectures using AWS (Cognito, Lambda, AppSync, DynamoDB). Hands-on experience delivering enterprise-grade software solutions, and passionate about building scalable, secure applications while continuously expanding technical capabilities within the industry.',
    intro: 'Third-year IT Undergraduate at University of Moratuwa specializing in full-stack software engineering and serverless cloud architectures.',
    email: 'asiriindrajithjayakodi@gmail.com',
    phone: '+94 78 438 3898',
    location: 'Kurunegala / Colombo, Sri Lanka',
    github: 'https://github.com/AsiriJayakodi',
    linkedin: 'https://linkedin.com/in/asiri-indrajith',
    resumeUrl: '/cv.pdf',
    avatarUrl: avatarUrl,
    education: [
      { title: 'BSc (Hons) in Information Technology', subtitle: 'University of Moratuwa • CGPA: 3.58/4.0 (2023 - Present)' },
      { title: 'G.C.E. Advanced Level (2022/23)', subtitle: 'Maliyadeva College -- Kurunegala • ICT (A), Combined Maths (B), Physics (B)' },
      { title: 'G.C.E. Ordinary Level (2019)', subtitle: "9 A's" }
    ],
    certifications: [
      'Certificate Course in Web Development (CODL, Univ. of Moratuwa)',
      'Certificate Course in Computer Application Assistant (YES Computer Institute)',
      'Certificate Course in Web Design for Beginners (Sololearn)'
    ],
    cgpaVal: '3.58 CGPA',
    cgpaLabel: 'University of Moratuwa',
    softSkills: ['Leadership', 'Problem-Solving', 'Time Management', 'Presentation Skills', 'Critical Thinking'],
    updatedAt: new Date()
  };

  if (existingProfile) {
    await db.collection('profiles').updateOne({ _id: existingProfile._id }, { $set: updatedProfile });
    console.log('Profile updated in MongoDB.');
  } else {
    await db.collection('profiles').insertOne({ ...updatedProfile, createdAt: new Date() });
    console.log('Profile created in MongoDB.');
  }

  // 2. Experiences
  await db.collection('experiences').deleteMany({});
  await db.collection('experiences').insertMany([
    {
      title: 'Instructor of Web Design and Development',
      company: 'Southern IRAA (Pvt) Ltd.',
      duration: '2024 - 2025',
      description: 'Taught web design and development fundamentals, guiding students through practical, hands-on coursework.',
      category: 'Professional Experience',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Course Consultant Officer',
      company: 'eclub Business College',
      duration: '2023 - 2024',
      description: 'Advised prospective students on course selection and supported enrollment and onboarding processes.',
      category: 'Professional Experience',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('Experiences updated in MongoDB.');

  // 3. Projects
  await db.collection('projects').deleteMany({});
  await db.collection('projects').insertMany([
    {
      title: 'Enterprise HR Management System (HRMS) -- Enlear',
      description: 'Cloud-native, full-stack HR Management System supporting Admin, Manager, and Employee workflows with automated onboarding and serverless authentication using AWS Cognito, Lambda, AppSync GraphQL, DynamoDB, SES/SQS, and Next.js (App Router).',
      image: '/projects/hrms.jpg',
      tags: ['Full Stack', 'Next.js', 'TypeScript', 'AWS Cognito', 'AWS Lambda', 'AppSync', 'DynamoDB'],
      githubUrl: 'https://github.com/AsiriJayakodi',
      liveUrl: '',
      color: '#00f5d4',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Dynamic Developer Portfolio & CMS',
      description: 'Full-stack server-rendered portfolio with secure admin dashboard enabling dynamic content management, real-time CV uploads, MongoDB schemas, Nodemailer SMTP API, and kinetic Lenis animations.',
      image: '/projects/portfolio.jpg',
      tags: ['Full Stack', 'Next.js', 'React 19', 'TypeScript', 'MongoDB', 'Mongoose', 'Node.js'],
      githubUrl: 'https://github.com/AsiriJayakodi',
      liveUrl: 'https://asiriindrajith.vercel.app/',
      color: '#6366f1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Full-Stack E-Commerce Platform -- Slice of Heaven',
      description: 'Full-stack e-commerce platform for a cake shop, featuring a customer-facing storefront and a secure admin panel to manage products, orders, and offers with Cloudinary media delivery.',
      image: '/projects/ecommerce.jpg',
      tags: ['Full Stack', 'MongoDB', 'Express.js', 'React.js', 'Node.js', 'Vite'],
      githubUrl: 'https://github.com/AsiriJayakodi',
      liveUrl: '',
      color: '#f97316',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      title: 'Microcontroller-Based Application Development -- Project LoRa 10',
      description: 'ESP32-based LoRa communication system with LoRa, GPS, and Compass modules and OLED display, using FreeRTOS architecture for efficient task management and reliable long-range IoT data transmission.',
      image: '/projects/lora.jpg',
      tags: ['IoT', 'ESP32', 'LoRa', 'FreeRTOS', 'C/C++', 'Hardware'],
      githubUrl: 'https://github.com/AsiriJayakodi',
      liveUrl: '',
      color: '#a855f7',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  console.log('Projects updated in MongoDB.');

  // 4. Categories
  await db.collection('categories').deleteMany({});
  await db.collection('categories').insertMany([
    { name: 'Frontend Development', shortDescription: 'Interfaces, frameworks & client-side UI technologies.', accentColor: '#00f5d4', displayOrder: 1, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Backend Development', shortDescription: 'Server-side programming, logic & API architectures.', accentColor: '#6366f1', displayOrder: 2, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Cloud & Serverless', shortDescription: 'Cloud architectures, serverless computing & AWS services.', accentColor: '#a855f7', displayOrder: 3, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Databases', shortDescription: 'Relational and NoSQL database management systems.', accentColor: '#ec4899', displayOrder: 4, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Programming', shortDescription: 'Core programming languages and computational problem solving.', accentColor: '#3b82f6', displayOrder: 5, isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { name: 'Testing & Tools', shortDescription: 'Testing frameworks, version control and developer tooling.', accentColor: '#f97316', displayOrder: 6, isActive: true, createdAt: new Date(), updatedAt: new Date() }
  ]);
  console.log('Categories updated in MongoDB.');

  // 5. Skills
  await db.collection('skills').deleteMany({});
  await db.collection('skills').insertMany([
    // Programming
    { name: 'Python', category: 'Programming', description: 'General-purpose programming & scripting.', displayOrder: 1, isActive: true, cat: 'Programming', level: 85, color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
    { name: 'JavaScript', category: 'Programming', description: 'Core programming language of the Web.', displayOrder: 2, isActive: true, cat: 'Programming', level: 90, color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
    { name: 'TypeScript', category: 'Programming', description: 'Typed superset of JavaScript.', displayOrder: 3, isActive: true, cat: 'Programming', level: 85, color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Java', category: 'Programming', description: 'Object-oriented programming language.', displayOrder: 4, isActive: true, cat: 'Programming', level: 80, color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
    { name: 'C', category: 'Programming', description: 'Low-level procedural systems programming.', displayOrder: 5, isActive: true, cat: 'Programming', level: 75, color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
    { name: 'C++', category: 'Programming', description: 'High-performance systems programming language.', displayOrder: 6, isActive: true, cat: 'Programming', level: 75, color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },
    { name: 'PHP', category: 'Programming', description: 'Server-side web scripting language.', displayOrder: 7, isActive: true, cat: 'Programming', level: 70, color: '#3b82f6', createdAt: new Date(), updatedAt: new Date() },

    // Frontend Development
    { name: 'React JS', category: 'Frontend Development', description: 'Component-driven user interfaces.', displayOrder: 1, isActive: true, cat: 'Frontend Development', level: 90, color: '#00f5d4', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Next.js (App Router)', category: 'Frontend Development', description: 'Server-rendered React web framework.', displayOrder: 2, isActive: true, cat: 'Frontend Development', level: 90, color: '#00f5d4', createdAt: new Date(), updatedAt: new Date() },
    { name: 'TypeScript', category: 'Frontend Development', description: 'Strongly-typed frontend architecture.', displayOrder: 3, isActive: true, cat: 'Frontend Development', level: 85, color: '#00f5d4', createdAt: new Date(), updatedAt: new Date() },
    { name: 'CSS Modules', category: 'Frontend Development', description: 'Scoped & modular responsive styling.', displayOrder: 4, isActive: true, cat: 'Frontend Development', level: 85, color: '#00f5d4', createdAt: new Date(), updatedAt: new Date() },

    // Backend Development
    { name: 'Node.js', category: 'Backend Development', description: 'Asynchronous event-driven runtime.', displayOrder: 1, isActive: true, cat: 'Backend Development', level: 85, color: '#6366f1', createdAt: new Date(), updatedAt: new Date() },
    { name: 'AWS Lambda', category: 'Backend Development', description: 'Serverless compute & cloud functions.', displayOrder: 2, isActive: true, cat: 'Backend Development', level: 80, color: '#6366f1', createdAt: new Date(), updatedAt: new Date() },
    { name: 'GraphQL', category: 'Backend Development', description: 'Declarative query language & AWS AppSync APIs.', displayOrder: 3, isActive: true, cat: 'Backend Development', level: 80, color: '#6366f1', createdAt: new Date(), updatedAt: new Date() },
    { name: 'REST APIs', category: 'Backend Development', description: 'Stateless RESTful endpoint architecture.', displayOrder: 4, isActive: true, cat: 'Backend Development', level: 85, color: '#6366f1', createdAt: new Date(), updatedAt: new Date() },

    // Cloud & Serverless
    { name: 'AWS Cognito', category: 'Cloud & Serverless', description: 'Secure user authentication and token handling.', displayOrder: 1, isActive: true, cat: 'Cloud & Serverless', level: 85, color: '#a855f7', createdAt: new Date(), updatedAt: new Date() },
    { name: 'AWS Amplify', category: 'Cloud & Serverless', description: 'Full-stack cloud application development platform.', displayOrder: 2, isActive: true, cat: 'Cloud & Serverless', level: 80, color: '#a855f7', createdAt: new Date(), updatedAt: new Date() },
    { name: 'DynamoDB', category: 'Cloud & Serverless', description: 'Fully-managed serverless NoSQL database.', displayOrder: 3, isActive: true, cat: 'Cloud & Serverless', level: 80, color: '#a855f7', createdAt: new Date(), updatedAt: new Date() },
    { name: 'SES / SQS', category: 'Cloud & Serverless', description: 'Email delivery and asynchronous message queueing.', displayOrder: 4, isActive: true, cat: 'Cloud & Serverless', level: 75, color: '#a855f7', createdAt: new Date(), updatedAt: new Date() },
    { name: 'AWS CDK', category: 'Cloud & Serverless', description: 'Infrastructure as Code with modern languages.', displayOrder: 5, isActive: true, cat: 'Cloud & Serverless', level: 75, color: '#a855f7', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Amazon Bedrock', category: 'Cloud & Serverless', description: 'Generative AI Foundation Models integration.', displayOrder: 6, isActive: true, cat: 'Cloud & Serverless', level: 70, color: '#a855f7', createdAt: new Date(), updatedAt: new Date() },

    // Databases
    { name: 'MySQL', category: 'Databases', description: 'Open-source relational database management system.', displayOrder: 1, isActive: true, cat: 'Databases', level: 80, color: '#ec4899', createdAt: new Date(), updatedAt: new Date() },
    { name: 'MongoDB', category: 'Databases', description: 'Document-oriented flexible NoSQL database.', displayOrder: 2, isActive: true, cat: 'Databases', level: 85, color: '#ec4899', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Amazon DynamoDB', category: 'Databases', description: 'High-performance managed key-value database.', displayOrder: 3, isActive: true, cat: 'Databases', level: 80, color: '#ec4899', createdAt: new Date(), updatedAt: new Date() },

    // Testing & Tools
    { name: 'Vitest', category: 'Testing & Tools', description: 'Blazing fast unit & integration testing framework.', displayOrder: 1, isActive: true, cat: 'Testing & Tools', level: 80, color: '#f97316', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Git', category: 'Testing & Tools', description: 'Distributed version control & GitHub workflows.', displayOrder: 2, isActive: true, cat: 'Testing & Tools', level: 90, color: '#f97316', createdAt: new Date(), updatedAt: new Date() },
    { name: 'Postman / API Testing', category: 'Testing & Tools', description: 'Comprehensive API testing & automation.', displayOrder: 3, isActive: true, cat: 'Testing & Tools', level: 85, color: '#f97316', createdAt: new Date(), updatedAt: new Date() },
  ]);
  console.log('Skills updated in MongoDB.');

  process.exit(0);
}

syncCVData().catch(err => {
  console.error(err);
  process.exit(1);
});
