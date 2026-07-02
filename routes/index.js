const express = require('express');
const Contact = require('../models/Contact');
const Visitor = require('../models/Visitor');
const ViewCounter = require('../models/ViewCounter');
const basicAuth = require('../middleware/basicAuth');
const path = require('path');
const { sendContactNotification } = require('../utils/mailer');
const { trackVisitor } = require('../utils/trackVisitor');

function sanitize(str = '') {
  return String(str).replace(/<[^>]*>?/gm, '').trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function bumpViewCounter(page) {
  try {
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState !== 1) return null;
    const doc = await ViewCounter.findOneAndUpdate( { page }, { $inc: { count: 1 } }, { upsert: true, new: true } );
    return doc.count;
  } 

  catch {
    return null;
  }
}

module.exports = function(projects, skills, experience, education, achievements, services, contactLimiter) {
  const router = express.Router();

  /* Home Page */

  router.get('/', async (req, res) => {
    try {
      await trackVisitor(req, res, "home");

      res.render('index', {
        title: 'Vakul Kumar Gaur - Full Stack Developer',
        projects: projects.slice(0, 6),
        services,
        page: 'home'
      });
    } 

    catch (err) {
      console.error('Portfolio view counter error:', err);

      res.render('index', {
        title: 'Vakul Kumar Gaur - Full Stack Developer',
        projects: projects.slice(0, 6),
        services,
        page: 'home'
      });
    }
  });

  /* About Page */

  router.get('/about', async (req, res) => {
    try {
      await trackVisitor(req, res, "about");
    } catch (err) {
      console.error('About visitor tracking error:', err);
    }
    res.render('about', { title: 'About - Vakul Kumar Gaur', skills, experience, education, achievements, page: 'about' });
  });

  /* Portfolio Page */

  router.get("/portfolio", async (req, res) => {
    try {
      await trackVisitor(req, res, "portfolio");
    } catch (err) {
      console.error('Portfolio visitor tracking error:', err);
    }
    res.render("portfolio", { title: "Portfolio - Vakul Kumar Gaur", projects, page: "portfolio" });
  });

  /* Resume Page */

  router.get('/resume', async (req, res) => {
    try {
      await trackVisitor(req, res, "resume");
    } 
    catch (err) {
      console.error('Resume visitor tracking error:', err);
    }
    res.render('resume', { title: 'Resume - Vakul Kumar Gaur', experience, education, achievements, page: 'resume' });
  });

  /* Resume Download Route */

  router.get('/resume/download', async (req, res) => {
    await bumpViewCounter('resume-download');
    const filePath = path.join(__dirname, '../public/files/Vakul_Resume.pdf');
    res.download(filePath);
  });

  /* Contact Page */

  router.get('/contact', async (req, res) => {
    try {
      await trackVisitor(req, res, "contact");
    } catch (err) {
      console.error('Contact visitor tracking error:', err);
    }
    res.render('contact', { title: 'Contact - Vakul Kumar Gaur', page: 'contact' });
  });

  /* Contact Form Submission */

  router.post('/contact', contactLimiter, async (req, res) => {
    try {
      if (req.body.website && req.body.website.trim() !== '') {
        return res.json({ success: true, message: 'Thanks! I\'ll get back to you soon.' });
      }

      const name = sanitize(req.body.name);
      const email = sanitize(req.body.email);
      const phone = sanitize(req.body.phone);
      const subject = sanitize(req.body.subject);
      const message = sanitize(req.body.message);

      if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: 'Please fill all required fields.' });
      }
      if (!isValidEmail(email)) {
        return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      }
      if (message.length > 2000) {
        return res.status(400).json({ success: false, message: 'Message is too long (max 2000 characters).' });
      }

      const mongoose = require('mongoose');
      if (mongoose.connection.readyState === 1) {
        await Contact.create({ name, email, phone, subject, message });
      }

      sendContactNotification({ name, email, phone, subject, message }).catch(() => {});

      res.json({
        success: true,
        message: `Thanks ${name}! I'll get back to you soon. 🚀`
      });
    } 
    catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
    }
  });

  /* Admin Routes */

  router.get('/admin', basicAuth, async (req, res) => {
    try {
      const mongoose = require('mongoose');

      if (mongoose.connection.readyState !== 1) {
        return res.status(503).send('Admin panel requires MongoDB to be connected.');
      }

      const contacts = await Contact.find().sort({ createdAt: -1 }).lean();
      const portfolioCounter = await ViewCounter.findOne({ page: 'portfolio' }).lean();
      const resumeCounter = await ViewCounter.findOne({ page: 'resume-download' }).lean();
      const visitors = await Visitor.find().sort({ visitedAt: -1 }).limit(100).lean();
      const visitorCount = await Visitor.countDocuments();

      res.render('admin', { contacts, visitors, visitorCount, portfolioViews: portfolioCounter ? portfolioCounter.count : 0, resumeDownloads: resumeCounter ? resumeCounter.count : 0 });
    } 
    catch (err) {
      console.error(err);
      res.status(500).send('Error loading messages.');
    }
  });

  router.post('/admin/messages/:id/read', basicAuth, async (req, res) => {
    try {
      await Contact.findByIdAndUpdate(req.params.id, { read: true });
      res.json({ success: true });
    } 
    catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to update message.' });
    }
  });

  router.delete('/admin/messages/:id', basicAuth, async (req, res) => {
    try {
      await Contact.findByIdAndDelete(req.params.id);
      res.json({ success: true });
    } 
    catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Failed to delete message.' });
    }
  });

  router.post('/admin/messages/:id/star', basicAuth, async (req, res) => {
    try {
      const contact = await Contact.findById(req.params.id);
      if (!contact) return res.status(404).json({ success: false });
      contact.starred = !contact.starred;
      await contact.save();
      res.json({ success: true, starred: contact.starred });
    } 
    catch (err) {
      res.status(500).json({ success: false });
    }
  });

  router.post('/admin/messages/:id/note', basicAuth, async (req, res) => {
    try {
      const note = sanitize(req.body.note || '');
      await Contact.findByIdAndUpdate(req.params.id, { adminNote: note });
      res.json({ success: true });
    } 
    catch (err) {
      res.status(500).json({ success: false });
    }
  });

  /* Route for projects */

  router.get('/api/projects', (req, res) => {
    res.json({ success: true, data: projects });
  });

  /* Privacy Policy Route */

  router.get('/privacy-policy', async (req, res) => {
    try {
      await trackVisitor(req, res, "privacy-policy");
    } catch (err) {
      console.error('Privacy Policy visitor tracking error:', err);
    }
    res.render('privacy-policy', { title: 'Privacy Policy - Vakul Kumar Gaur', page: 'privacy-policy' });
  });

  /* Terms of Service Route */

  router.get('/terms-of-service', async (req, res) => {
    try {
      await trackVisitor(req, res, "terms-of-service");
    } catch (err) {
      console.error('Terms of Service visitor tracking error:', err);
    }
    res.render('terms-of-service', { title: 'Terms of Service - Vakul Kumar Gaur', page: 'terms-of-service' });
  });

  /* Security Route */

  router.get('/security', async (req, res) => {
    try {
      await trackVisitor(req, res, "security");
    } catch (err) {
      console.error('Security visitor tracking error:', err);
    }
    res.render('security', { title: 'Security - Vakul Kumar Gaur', page: 'security' });
  });

  return router;
};