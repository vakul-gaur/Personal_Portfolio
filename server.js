require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// MongoDB connection
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.log('⚠️  MongoDB not connected:', err.message));
}

// Data
const projects = [
  {
    id: 1,
    title: 'AI Music Player',
    img: 'img/AI_Music.png',
    desc: 'An AI-powered music player featuring intelligent song recommendations, personalized playlists, smart search, and an interactive listening experience.',
    tags: ['React','Node.js', 'MongoDB', 'Express.js', 'AI'],
    link: '#',
    category: 'ai'
  },
  {
    id: 2,
    title: 'E-Learning Website',
    img: 'img/E-learning.webp',
    desc: 'A responsive online learning platform featuring interactive courses, quizzes, progress tracking, and student-friendly dashboards.',
    tags: ['HTML', 'CSS', 'JS', 'PHP', 'MySQL'],
    link: '#',
    category: 'fullstack'
  },
  {
    id: 3,
    title: 'Vehicle PUC Booking System',
    img: 'img/puc-platform.png',
    desc: 'An online appointment booking system for vehicle PUC testing with slot scheduling, digital records, and booking management.',
    tags: ['Node.js', 'Express.js', 'MongoDB',],
    link: '#',
    category: 'fullstack'
  },
  {
    id: 4,
    title: 'Medicine Recommendation System',
    img: 'img/medicine-recommendation.png',
    desc: 'An AI-powered healthcare platform that recommends medicines based on symptoms while providing disease insights and precautionary guidance.',
    tags: ['Python', 'Machine Learning'],
    link: '#',
    category: 'ai'
  },
  {
    id: 5,
    title: 'Personal Portfolio',
    img: 'img/Portfolio.png',
    desc: 'A modern portfolio website showcasing projects, technical skills, achievements, certifications, and contact details.',
    tags: ['HTML', 'CSS', 'JS', 'Node.js', 'Express.js', 'MongoDB'],
    link: '#',
    category: 'fullstack'
  },
  {
    id: 6,
    title: 'Pizza Ordering & Delivery System',
    img: 'img/pizza-app.png',
    desc: 'A full-stack pizza ordering platform where users can customize and place orders while admins manage menus, update delivery status, and track orders in real time.',
    tags: ['React','Node.js', 'MongoDB'],
    link: '#',
    category: 'fullstack'
  },
  {
    id: 7,
    title: 'Job Portal',
    img: 'img/job-portal.jpg',
    desc: 'A full-featured recruitment platform connecting employers and job seekers with resume uploads, job applications, and advanced search filters.',
    tags: ['HTML', 'CSS', 'PHP', 'MySQL'],
    link: '',
    category: 'fullstack'
  },
  {
    id: 8,
    title: 'News Website',
    img: 'img/news_website.png',
    desc: 'A responsive news platform delivering trending headlines, category-wise articles, and real-time updates through news APIs.',
    tags: ['HTML', 'CSS', 'JS', 'API'],
    link: '#',
    category: 'frontend'
  },
  {
    id: 9,
    title: 'Weather Forecast App',
    img: 'img/weather.png',
    desc: 'A weather application providing real-time forecasts, location-based search, humidity, wind speed, and multi-day predictions.',
    tags: ['HTML', 'CSS', 'JS', 'API'],
    link: '#',
    category: 'frontend'
  },
  {
    id: 10,
    title: 'Property Listing Web App',
    img: 'img/wanderlust.png',
    desc: 'A real estate platform where users can browse, search, and list properties with images, pricing, and location-based filtering.',
    tags: ['Node.js', 'MongoDB', 'Express.js'],
    link: '#',
    category: 'fullstack'
  },
  {
    id: 11,
    title: 'House Price Prediction',
    img: 'img/house_price.png',
    desc: 'A machine learning application that predicts house prices based on features like location, area, number of bedrooms, and market trends.',
    tags: ['Python', 'Machine Learning'],
    link: '#',
    category: 'ai'
  },
  {
    id: 12,
    title: 'Spotify Clone',
    img: 'img/Spotify.png',
    desc: 'A responsive Spotify-inspired music streaming interface with playlists, player controls, and a modern user experience.',
    tags: ['HTML', 'CSS', 'JS'],
    link: '#',
    category: 'frontend'
  },
  {
    id: 13,
    title: 'Smartwatch Landing Page',
    img: 'img/landing-page.png',
    desc: 'A premium product landing page showcasing smartwatch features, specifications, animations, and responsive design.',
    tags: ['HTML', 'CSS', 'JS'],
    link: '#',
    category: 'frontend'
  },
];

const skills = {
  languages: [
    { name: 'C', level: 90, icon: 'https://img.icons8.com/color/48/c-programming.png' },
    { name: 'C++', level: 95, icon: 'https://img.icons8.com/color/48/c-plus-plus-logo.png' },
    { name: 'Python', level: 70, icon: 'https://img.icons8.com/color/48/python--v1.png' },
    { name: 'Java', level: 70, icon: 'https://img.icons8.com/color/48/java--v1.png' },
    { name: 'JavaScript', level: 90, icon: 'https://img.icons8.com/color/48/javascript--v1.png' },
    { name: 'PHP', level: 50, icon: 'https://img.icons8.com/officel/48/php-logo.png' },
  ],

  frontend: [
    { name: 'HTML', level: 98, icon: 'https://img.icons8.com/color/48/html-5--v1.png' },
    { name: 'CSS', level: 95, icon: 'https://img.icons8.com/color/48/css3.png' },
    { name: 'Bootstrap', level: 95, icon: 'https://img.icons8.com/color/48/bootstrap.png' },
    { name: 'Tailwind CSS', level: 95, icon: 'https://img.icons8.com/color/48/tailwindcss.png' },
    { name: 'React', level: 80, icon: 'https://img.icons8.com/color/48/react-native.png' },
  ],

  backend: [
    { name: 'Node.js', level: 95, icon: 'https://cdn.simpleicons.org/nodedotjs/5FA04E' },
    { name: 'Express.js', level: 95, icon: 'https://cdn.simpleicons.org/express/ffffff' },
    { name: 'Passport.js', level: 80, icon: 'https://cdn.simpleicons.org/passport/34E27A' },
    { name: 'Cloudinary', level: 85, icon: 'https://cdn.simpleicons.org/cloudinary/3448C5' },
  ],

  database: [
    { name: 'MySQL', level: 95, icon: 'https://img.icons8.com/color/48/mysql-logo.png' },
    { name: 'MongoDB', level: 90, icon: 'https://img.icons8.com/color/48/mongodb.png' },
  ],

  tools: [
    { name: 'Git', level: 95, icon: 'https://img.icons8.com/color/48/git.png' },
    { name: 'GitHub', level: 95, icon: 'https://img.icons8.com/ios-filled/48/ffffff/github.png' },
    { name: 'VS Code', level: 98, icon: 'https://img.icons8.com/color/48/visual-studio-code-2019.png' },
    { name: 'Postman', level: 95, icon: 'https://cdn.simpleicons.org/postman/FF6C37' },
    { name: 'Hoppscotch', level: 90, icon: 'https://cdn.simpleicons.org/hoppscotch/31C48D' },
    { name: 'Render', level: 90, icon: 'https://cdn.simpleicons.org/render/46E3B7' },
    { name: 'Power BI', level: 85, icon: 'https://img.icons8.com/color/48/power-bi.png' },
  ],

  concepts: [
    { name: 'REST APIs', level: 90, icon: 'https://img.icons8.com/color/48/api-settings.png' },
    { name: 'MVC Architecture', level: 90, icon: 'https://img.icons8.com/color/48/flow-chart.png' },
    { name: 'Data Structures', level: 90, icon: 'https://img.icons8.com/color/48/tree-structure.png' },
    { name: 'Algorithms', level: 90, icon: 'https://img.icons8.com/color/48/flow-chart.png' },
    { name: 'Object-Oriented Programming', level: 90, icon: 'https://img.icons8.com/color/48/object.png' },
    { name: 'Operating Systems', level: 95, icon: 'https://img.icons8.com/color/48/windows-10.png' },
    { name: 'DBMS', level: 95, icon: 'https://img.icons8.com/color/48/database.png' },
  ],
};

const experience = [
  { period: 'June 2024 – July 2024', role: 'Web Developer Intern', company: 'CodSoft', desc: 'Developed 3+ responsive web applications using HTML, CSS, JavaScript, and Bootstrap. Built clean, user-friendly interfaces, implemented responsive layouts, and improved frontend functionality while following modern web development practices.', tags: ['HTML', 'CSS', 'JavaScript', 'Bootstrap'] },
  { period: 'June 2025 – July 2025', role: 'Machine Learning Intern', company: 'Info Bharat Interns', desc: 'Worked on machine learning projects involving data preprocessing, model development, and performance evaluation. Applied Python and popular ML libraries to build predictive models and gain practical experience with real-world datasets.', tags: ['Python', 'Machine Learning', 'Scikit-learn'] },
];

const education = [
  { period: 'Aug 2023 – August 2027', degree: 'B.Tech CSE (AI & ML)', institution: 'COER University, Roorkee', gpa: '8.71 CGPA', desc: 'Pursuing specialization in Artificial Intelligence and Machine Learning. Active in hackathons and internships.' },
  { period: 'Apr 2022 – Mar 2023', degree: 'Senior Secondary (CBSE)', institution: 'The Oxford School, Haridwar', gpa: '77.8%', desc: 'Developed strong interest in computer programming and problem-solving.' },
  { period: 'Apr 2020 – Mar 2021', degree: 'Secondary (CBSE)', institution: 'The Oxford School, Haridwar', gpa: '86.3%', desc: 'Built strong fundamentals in Mathematics and Science.' },
];

const achievements = [
  { year: 'March 2025', title: '1st Prize – Hackathon Winner', org: 'COER University', desc: 'Contributed to the development of an IoT-based Flood Monitoring System as part of a team during a 48-hour university hackathon. Collaborated with senior team members to design and implement the solution, earning 1st place.' },
  { year: '2024', title: 'CSS & Python (Basic)', org: 'HackerRank', desc: 'Earned certifications in CSS and Python (Basic) demonstrating proficiency in frontend styling and programming fundamentals.' },
  { year: '2024', title: 'Gold Badge – 5★ Java', org: 'HackerRank', desc: 'Earned a 5-star rating in Java by demonstrating strong programming fundamentals and problem-solving skills.' },
  { year: '2026', title: '100+ Problems Solved',  org: 'LeetCode', desc: 'Solved 100+ coding problems covering Data Structures and Algorithms, strengthening problem-solving and coding skills.' },
];

const services = [
  { icon: 'fas fa-pencil-ruler', title: 'Web Design', desc: 'Custom UI/UX design, mobile-first layouts, and aesthetic visuals that represent your brand perfectly.' },
  { icon: 'fas fa-grip-horizontal', title: 'Landing Pages', desc: 'High-converting landing pages tailored for campaigns, product launches, and lead generation.' },
  { icon: 'fas fa-laptop-code', title: 'Responsive Design', desc: 'Mobile, tablet, and desktop-friendly designs that adapt beautifully across all screen sizes.' },
  { icon: 'fa-solid fa-layer-group', title: 'Full Stack Apps', desc: 'Scalable web applications using modern frontend technologies with robust backend integration.' },
  { icon: 'fa-solid fa-code-fork', title: 'Build & Deploy', desc: 'Setting up efficient build processes and deploying applications to cloud hosting platforms.' },
  { icon: 'fa-brands fa-github', title: 'Version Control', desc: 'Collaborative development using Git and GitHub for efficient code management and team workflows.' },
  { icon: 'fa-solid fa-database', title: 'Database Design', desc: 'Structuring and optimizing databases for performance and scalability using SQL and NoSQL.' },
  { icon: 'fa-solid fa-shield-halved', title: 'Auth & Security', desc: 'Secure login systems, JWT authentication, role-based access control, and data protection.' },
  { icon: 'fa-solid fa-network-wired', title: 'Maintenance', desc: 'Ongoing support and updates to keep your website fresh, secure, and standards-compliant.' },
];

const router = require('./routes/index');
app.use('/', router(projects, skills, experience, education, achievements, services, contactLimiter));

app.use((req, res) => {
  res.status(404).render('404', { title: '404 – Page Not Found', page: '404' });
});

app.listen(PORT, () => {
  console.log(`🚀 Portfolio running at http://localhost:${PORT}`);
});

module.exports = app;