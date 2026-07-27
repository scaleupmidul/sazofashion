import express from 'express';
import ContactMessage from '../models/ContactMessage.js';
import Settings from '../models/Settings.js';
import { protect } from '../middleware/authMiddleware.js';
import nodemailer from 'nodemailer';

const router = express.Router();

// Dynamic settings-aware SMTP Transporter for Customer Inquiries
const sendContactEmailToAdmin = async (messageData) => {
  // Retrieve settings first to get SMTP details and recipient list
  let settings = null;
  try {
    settings = await Settings.findOne();
  } catch (err) {
    console.error("[Concierge Server] Error retrieving settings from database:", err);
  }

  // Determine dynamic sender email and name
  let smtpUser = process.env.GMAIL_USER;
  let smtpPass = process.env.GMAIL_PASS;
  let smtpHost = 'smtp.gmail.com';
  let smtpPort = 587;
  let smtpSecure = false;
  let smtpSenderName = 'SAZO | Concierge';

  // Overwrite if database settings have SMTP configured
  const hasCustomSmtp = settings && settings.smtpUser && settings.smtpPass;
  if (hasCustomSmtp) {
    smtpUser = settings.smtpUser;
    smtpPass = settings.smtpPass;
    smtpHost = settings.smtpHost || 'smtp.gmail.com';
    smtpPort = Number(settings.smtpPort) || 587;
    smtpSecure = settings.smtpSecure ?? false;
    smtpSenderName = settings.smtpSenderName || 'SAZO | Concierge';
  }

  if (!smtpUser || !smtpPass) {
    console.error("[Concierge Server] Warning: SMTP credentials not configured (neither database custom SMTP nor process.env.GMAIL_USER/GMAIL_PASS are set). Discarding inquiry email.");
    return false;
  }

  // Create transporter dynamically so it always reflects the latest credentials
  let transporter;
  try {
    const config = {
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      },
      tls: {
        rejectUnauthorized: false
      }
    };
    
    // Auto-configure Gmail service if using default credentials
    if (smtpHost === 'smtp.gmail.com' && !hasCustomSmtp) {
      config.service = 'gmail';
    }

    transporter = nodemailer.createTransport(config);
  } catch (err) {
    console.error("[Concierge Server] Failed to build SMTP nodemailer transporter:", err);
    return false;
  }

  // Ensure notifications are delivered to all key addresses to prevent missing inquiries
  const recipientsSet = new Set();
  
  // 1. User's active operational emails
  recipientsSet.add('sazo.ceo@gmail.com');
  recipientsSet.add('sazo.system@gmail.com');
  
  // 2. Custom recipients from dynamic settings
  if (settings && settings.notificationRecipients) {
    settings.notificationRecipients.split(',').forEach(email => {
      const trimmed = email.trim().toLowerCase();
      if (trimmed) recipientsSet.add(trimmed);
    });
  }

  // 3. Configured adminEmail in database (unless it is a placeholder)
  if (settings && settings.adminEmail && settings.adminEmail.toLowerCase().trim() !== 'admin@sazo.com') {
    recipientsSet.add(settings.adminEmail.toLowerCase().trim());
  }

  // 4. System sender email so the owner can find it in their inbox/sent
  if (smtpUser) {
    recipientsSet.add(smtpUser.toLowerCase().trim());
  }

  const recipients = Array.from(recipientsSet).join(', ');
  console.log(`[Concierge Server] Dispatching inquiry from ${messageData.name || 'Customer'} via ${smtpHost}:${smtpPort} to: ${recipients}`);

  const mailOptions = {
    from: `"${smtpSenderName}" <${smtpUser}>`,
    to: recipients,
    subject: `📩 New Message from ${messageData.name || 'Customer'}`,
    html: `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: auto; border: 1px solid #f5f5f5; border-radius: 40px; overflow: hidden; background-color: #fff; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
      <div style="background: #1c1917; padding: 40px; color: white; text-align: center;">
        <h1 style="margin:0; font-size: 28px; letter-spacing: 4px; font-weight: normal; font-style: italic;">SAZO</h1>
        <p style="margin:10px 0 0 0; opacity: 0.6; font-size: 10px; text-transform: uppercase; letter-spacing: 3px;">Inquiry Received</p>
      </div>
      <div style="padding: 40px;">
        <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #a8a29e; font-weight: bold; margin-bottom: 15px;">Customer Dossier</p>
        <p style="line-height: 2; color: #1c1917; font-size: 14px; margin: 0;">
            <strong>Identity:</strong> ${messageData.name}<br>
            <strong>Contact:</strong> ${messageData.email}<br>
            <strong>Date:</strong> ${new Date().toLocaleString()}
        </p>
        <hr style="border: 0; border-top: 1px solid #f5f5f5; margin: 30px 0;" />
        <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 10px; color: #a8a29e; font-weight: bold; margin-bottom: 15px;">Message Content</p>
        <div style="padding: 20px; background: #fcf8f6; border-radius: 20px; color: #1c1917; font-size: 14px; line-height: 1.8; font-style: italic;">
            "${messageData.message}"
        </div>
      </div>
      <div style="background: #fdfdfd; padding: 30px; text-align: center; color: #a8a29e; font-size: 9px; text-transform: uppercase; letter-spacing: 2px;">
        SAZO CONCIERGE &copy; 2026 | Direct Inquiry Dispatch
      </div>
    </div>`
  };

  try { 
    await transporter.sendMail(mailOptions); 
    console.log(`[Concierge Server] Inquiry email notification sent successfully to: ${recipients}`);
    return true; 
  } catch (e) { 
    console.error('[Concierge Server] Critical SMTP error sending message notification:', e);
    return false; 
  }
};

// @desc    Fetch all messages
// @route   GET /api/messages
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    if (!req.dbConnected) return res.json([]);
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Create new message
// @route   POST /api/messages
// @access  Public
router.post('/', async (req, res) => {
  try {
    if (!req.dbConnected) {
        return res.status(201).json({ message: 'Message acknowledged (Simulation Mode - DB offline)' });
    }
    const newMessageData = {
        ...req.body,
        date: new Date().toISOString().split('T')[0],
        isRead: false,
    };
    const message = new ContactMessage(newMessageData);
    await message.save();

    // Send email notification to admin asynchronously
    sendContactEmailToAdmin(newMessageData).catch(err => console.error("Async Contact Email fail:", err.message));

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error sending message', error });
  }
});

// @desc    Update message read status
// @route   PUT /api/messages/:id/read
// @access  Private/Admin
router.put('/:id/read', protect, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (message) {
      message.isRead = req.body.isRead;
      const updatedMessage = await message.save();
      res.json(updatedMessage);
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Error updating message', error });
  }
});

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
router.delete('/:id', protect, async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (message) {
      await message.deleteOne();
      res.json({ message: 'Message removed' });
    } else {
      res.status(404).json({ message: 'Message not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
