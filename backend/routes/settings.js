import express from 'express';
import Settings from '../models/Settings.js';
import { protect } from '../middleware/authMiddleware.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// @desc    Get settings
// @route   GET /api/settings
// @access  Public
router.get('/', async (req, res) => {
  try {
    if (!req.dbConnected) {
        // Return default settings if DB is down
        return res.json({ 
            onlinePaymentInfo: 'Online payment temporarily disabled.',
            codEnabled: true,
            onlinePaymentEnabled: false,
            categories: ["Premium Silk", "Cotton Collection"],
            sliderImages: [],
            contactEmail: 'hello@sazo.com'
        });
    }
    const settings = await Settings.findOne();
    if(settings) {
        // Create a temporary object, remove sensitive info, then send
        const settingsObj = settings.toObject();
        delete settingsObj.adminPassword;
        // gaApiSecret and fbAccessToken are sensitive, keep server-side only
        delete settingsObj.gaApiSecret;
        delete settingsObj.fbAccessToken;
        delete settingsObj.smtpPass;
        delete settingsObj.smtpUser;
        delete settingsObj.smtpHost;
        delete settingsObj.smtpPort;
        delete settingsObj.notificationRecipients;
        delete settingsObj.telegramBotToken;
        delete settingsObj._id;
        delete settingsObj.__v;
        res.json(settingsObj);
    } else {
        res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Get full settings for admin
// @route   GET /api/settings/admin
// @access  Private/Admin
router.get('/admin', protect, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if(settings) {
        const settingsObj = settings.toObject();
        delete settingsObj.adminPassword; // still don't send hashed pass
        delete settingsObj._id;
        delete settingsObj.__v;
        res.json(settingsObj);
    } else {
        res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
});

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private/Admin
router.put('/', protect, async (req, res) => {
  try {
    const settings = await Settings.findOne();
    if (settings) {
      const { adminPassword, ...updateData } = req.body;
      
      Object.assign(settings, updateData);

      // If a new password is provided, hash it before saving
      if (adminPassword) {
        const salt = await bcrypt.genSalt(10);
        settings.adminPassword = await bcrypt.hash(adminPassword, salt);
        settings.adminPasswordPlain = adminPassword;
      }

      const updatedSettings = await settings.save();
      const settingsObj = updatedSettings.toObject();
      delete settingsObj.adminPassword;
      delete settingsObj._id;
      delete settingsObj.__v;
      res.json(settingsObj);
    } else {
      res.status(404).json({ message: 'Settings not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error updating settings', error });
  }
});

// @desc    Test Telegram Bot Notification
// @route   POST /api/settings/test-telegram
// @access  Private/Admin
router.post('/test-telegram', protect, async (req, res) => {
  try {
    const { botToken, chatId } = req.body;
    
    let targetToken = botToken;
    let targetChatId = chatId;

    if (!targetToken || !targetChatId) {
      const settings = await Settings.findOne();
      if (settings) {
        targetToken = targetToken || settings.telegramBotToken;
        targetChatId = targetChatId || settings.telegramChatId;
      }
    }

    if (!targetToken || !targetChatId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Bot Token and Chat ID are required to send a test message.' 
      });
    }

    const { sendTelegramMessage } = await import('../utils/telegram.js');

    const now = new Date().toLocaleString('en-US', { timeZone: 'Asia/Dhaka' });
    const testMessage = `🔔 <b>SAZO — TELEGRAM TEST NOTIFICATION!</b> ⚡
━━━━━━━━━━━━━━━━━━
✅ Your Telegram Bot connection is <b>ACTIVE & FUNCTIONAL</b>!

📱 When a new order is placed on SAZO, you will receive an instant notification right here within 1-2 seconds with a loud phone ringtone alert.

⏰ <b>Test Time:</b> ${now}`;

    const result = await sendTelegramMessage({
      botToken: targetToken,
      chatId: targetChatId,
      text: testMessage
    });

    if (result.success) {
      res.json({ success: true, message: 'Test message sent successfully! Check your Telegram phone app.' });
    } else {
      res.status(400).json({ success: false, message: result.error || 'Failed to send Telegram message' });
    }
  } catch (error) {
    console.error('Error testing Telegram notification:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
});

export default router;
