import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/db';
import Message from '../../../models/Message';

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

    // Try storing in database
    try {
      await connectToDatabase();
      const newMessage = await Message.create({ name, email, subject, message });
      return NextResponse.json({ 
        success: true, 
        message: "Message sent successfully!", 
        id: newMessage._id 
      });
    } catch (dbError) {
      console.warn("MongoDB connection omitted or failed. Simulating message reception. Error:", dbError instanceof Error ? dbError.message : dbError);
      
      // Simulate successful save in local development if DB is not active yet
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
