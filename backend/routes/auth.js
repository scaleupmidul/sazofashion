
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Settings from '../models/Settings.js';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import 'dotenv/config';

const router = express.Router();

// Rate limiter for login attempts: 5 requests per 15 minutes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
    message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate: { trustProxy: false }, // We already set app.set('trust proxy', 1)
});

// Helper to generate a random secure password
const generateRandomPassword = (length = 10) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// @desc    Auth admin & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', loginLimiter, async (req, res) => {
    const { email, password } = req.body;
    
    if (!req.dbConnected) {
        return res.status(503).json({ message: 'Service unavailable' });
    }

    try {
        const settings = await Settings.findOne();
        if (!settings) {
            return res.status(404).json({ message: 'Configuration error' });
        }

        const inputEmail = (email || "").trim().toLowerCase();
        const storedEmail = (settings.adminEmail || "").trim().toLowerCase();
        const inputPassword = password || "";

        if (!inputEmail || !inputPassword) {
            return res.status(400).json({ message: 'Credentials required' });
        }

        // Use bcryptjs for comparison with explicit error handling
        let isPasswordMatch = false;
        try {
            if (settings.adminPassword && inputPassword) {
                isPasswordMatch = await bcrypt.compare(inputPassword, settings.adminPassword);
            }
        } catch (bcryptErr) {
            console.error('[Login] Security comparison error');
            return res.status(500).json({ message: 'Authentication failure' });
        }

        if (inputEmail === storedEmail && isPasswordMatch) {
            const token = jwt.sign(
                { id: settings._id }, 
                process.env.JWT_SECRET || 's3cr3t_f0r_saz0_app_2026', 
                { expiresIn: '1d' }
            );
            return res.json({ token });
        } else {
            // General error message for both wrong email and wrong password
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('[Login Error]');
        return res.status(500).json({ message: 'Authentication error' });
    }
});

// @desc    Retrieve admin access credentials and notify via email
// @route   POST /api/auth/reset-access
// @access  Public
router.post('/reset-access', async (req, res) => {
    const { email } = req.body;
    const systemEmail = process.env.GMAIL_USER;
    const systemPass = process.env.GMAIL_PASS;

    try {
        const settings = await Settings.findOne();
        if (!settings) return res.status(404).json({ message: 'System not initialized' });

        const inputEmail = email.toLowerCase();
        const storedAdminEmail = settings.adminEmail.toLowerCase();
        const masterEmail = systemEmail ? systemEmail.toLowerCase() : null;

        // Security logic: Allow if matches stored admin email OR the master system email (Vercel Key)
        if (inputEmail !== storedAdminEmail && inputEmail !== masterEmail) {
            return res.status(403).json({ message: 'Access Denied: Email mismatch' });
        }

        // Retrieve the current plain password stored, fallback to default if none exists
        let currentPass = settings.adminPasswordPlain || 'sazo_admin_2026';

        // If master email was used to reclaim access, update the admin email and reset to default
        if (inputEmail === masterEmail && settings.adminEmail !== systemEmail) {
            settings.adminEmail = systemEmail;
            const salt = await bcrypt.genSalt(10);
            currentPass = 'sazo_admin_2026';
            settings.adminPassword = await bcrypt.hash(currentPass, salt);
            settings.adminPasswordPlain = currentPass;
            await settings.save();
        }

        // Notify admin via email with the current credentials
        if (systemEmail && systemPass) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: systemEmail, pass: systemPass }
            });

            const mailOptions = {
                from: `"SAZO Security" <${systemEmail}>`,
                to: inputEmail,
                subject: '🚨 SAZO Admin: Administrative Access Details',
                html: `
                    <div style="font-family: 'Georgia', serif; padding: 40px; border: 1px solid #f5f5f5; border-radius: 40px; max-width: 500px; margin: auto; background-color: #fff; box-shadow: 0 20px 40px rgba(0,0,0,0.05);">
                        <div style="text-align: center; margin-bottom: 40px;">
                             <h1 style="color: #1c1917; margin: 0; font-size: 32px; letter-spacing: 4px; font-weight: normal; font-style: italic;">SAZO</h1>
                             <p style="color: #a8a29e; font-size: 10px; text-transform: uppercase; font-weight: bold; letter-spacing: 4px; margin-top: 10px;">Security Atelier</p>
                        </div>
                        <div style="padding: 30px; background-color: #fcf8f6; border-radius: 24px; border: 1px solid #fff1f2; margin-bottom: 30px; text-align: center;">
                            <h2 style="color: #1c1917; font-size: 18px; margin-top: 0; font-style: italic;">Access Credentials Retrieved</h2>
                            <p style="color: #78716c; font-size: 14px; line-height: 1.8;">Here are your current administrative access credentials for the SAZO terminal.</p>
                        </div>
                        
                        <div style="background: #ffffff; padding: 30px; border-radius: 24px; margin: 30px 0; border: 1px solid #f5f5f5; text-align: left;">
                            <p style="margin: 0 0 5px 0; font-size: 10px; color: #a8a29e; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Your Registered Email:</p>
                            <div style="padding: 10px 0 20px 0; font-size: 16px; color: #1c1917; font-weight: bold; font-family: monospace;">
                                ${settings.adminEmail}
                            </div>
                            
                            <p style="margin: 0 0 5px 0; font-size: 10px; color: #a8a29e; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Your Current Password:</p>
                            <div style="padding: 10px 0 0 0; font-size: 16px; color: #1c1917; font-weight: bold; font-family: monospace;">
                                ${currentPass}
                            </div>
                        </div>

                        <p style="color: #78716c; font-size: 12px; line-height: 2; text-align: center; max-width: 300px; margin: 0 auto;">
                            <strong>Instructions:</strong><br>
                            Authenticate using the credentials above to log in to your admin panel.
                        </p>

                        <div style="margin-top: 50px; padding-top: 30px; border-top: 1px solid #f5f5f5; text-align: center; font-size: 9px; color: #a8a29e; letter-spacing: 1px; text-transform: uppercase;">
                            Sent by SAZO Automated Security Service. Secure Dispatch.
                        </div>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
        }

        res.json({ message: 'Current credentials have been sent to your email. Please check your inbox.' });
    } catch (error) {
        console.error('Reset Error:', error);
        res.status(500).json({ message: 'Internal Server Error during credentials recovery' });
    }
});

export default router;
