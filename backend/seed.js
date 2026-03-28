const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Project = require('./models/Project');
const Admin = require('./models/Admin');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🌱 Connected to database for seeding...');

    // Clear existing projects/admin
    await Project.deleteMany({});
    await Admin.deleteMany({});

    // 1. Create Default Admin
    const admin = new Admin({
      email: process.env.ADMIN_EMAIL || 'admin@college.edu',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });
    await admin.save();
    console.log('✅ Default Admin created: admin@college.edu / admin123');

    // 2. Generate 70 Projects
    const projects = [];
    const techStacks = ['MERN Stack', 'Next.js & Supabase', 'Python/Flask', 'Django/PostgreSQL', 'Flutter & Firebase', 'Android Native', 'Blockchain/Web3', 'AI/ML/TensorFlow', 'IoT & Arduino', 'Cybersecurity Solution'];
    const projectTypes = ['HealthTech', 'EduTech', 'FinTech', 'AgriTech', 'Environment', 'Smart City', 'E-commerce', 'Social Networking', 'Game Development', 'Logistics'];

    for (let i = 1; i <= 70; i++) {
        const stackIdx = Math.floor(Math.random() * techStacks.length);
        const typeIdx = Math.floor(Math.random() * projectTypes.length);
        
        projects.push({
            title: `Hackathon Project ${i}: ${projectTypes[typeIdx]} Solution`,
            teamName: `Team Alpha-${i}`,
            description: `A revolutionary ${projectTypes[typeIdx]} platform built using ${techStacks[stackIdx]}. This solution addresses real-world problems in efficiency and scalability within the ${projectTypes[typeIdx]} sector. Includes features like real-time analytics, user validation, and intuitive Dashboard.`,
            votes: {
                best: Math.floor(Math.random() * 5),
                good: Math.floor(Math.random() * 8),
                moderate: Math.floor(Math.random() * 10)
            }
        });
    }

    await Project.insertMany(projects);
    console.log('✅ Successfully seeded 70 projects!');

    mongoose.connection.close();
    console.log('👋 Seeding completed, connection closed.');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seedData();
