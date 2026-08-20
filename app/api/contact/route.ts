import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import Message from '../../../models/Message';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Basic Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    let newMessageId = null;
    let savedInDb = false;

    // 1. Try storing in database
    try {
      await connectToDatabase();
      const newMessage = await Message.create({ name, email, subject, message });
      newMessageId = newMessage._id;
      savedInDb = true;
    } catch (dbError) {
      console.warn("MongoDB connection omitted or failed. Simulating message reception. Error:", dbError instanceof Error ? dbError.message : dbError);
    }

    // 2. Try sending email notification via Nodemailer
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const emailTo = process.env.EMAIL_TO;

    if (smtpHost && smtpUser && smtpPass && emailTo) {
      try {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(smtpPort || '465'),
          secure: smtpPort === '465',
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        const mailOptions = {
          from: `"${name} (Portfolio Inquiry)" <${smtpUser}>`,
          replyTo: email,
          to: emailTo,
          subject: `New Portfolio Inquiry: ${subject}`,
          text: `You have received a new inquiry from your portfolio contact form.\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
              <h2 style="color: #0d9488; background-color: #f3f4f6; padding: 15px; border-radius: 6px; margin-top: 0; font-family: sans-serif;">New Portfolio Inquiry</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
              <p><strong>Subject:</strong> ${subject}</p>
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; border-left: 4px solid #0d9488; margin-top: 20px;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Contact form email notification sent successfully to:", emailTo);
      } catch (emailError) {
        console.error("Nodemailer failed to send email:", emailError instanceof Error ? emailError.message : emailError);
      }
    } else {
      console.warn("SMTP settings missing or incomplete in env. Local message saved but email notification skipped.");
    }

    if (savedInDb) {
      return NextResponse.json({ 
        success: true, 
        message: "Message sent successfully!", 
        id: newMessageId 
      });
    } else {
      return NextResponse.json({ 
        success: true, 
        message: "Message received (Development Mode: simulated save)!",
        simulated: true
      });
    }

  } catch (error) {
    console.error("Failed to process message:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
