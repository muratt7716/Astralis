import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // SMTP Configuration from .env.local
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;
    const ADMIN_EMAILS = process.env.ADMIN_EMAILS || EMAIL_USER;

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error("Email credentials missing in env");
      return NextResponse.json({ error: "Mail configuration missing" }, { status: 500 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    const recipients = (ADMIN_EMAILS || EMAIL_USER || "").split(",").map(email => email.trim()).filter(Boolean);

    const mailOptions = {
      from: `"Astralis Newsletter" <${EMAIL_USER}>`,
      to: recipients,
      subject: "🚀 Yeni Astralis Abonesi!",
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #6d28d9;">Harika Haber!</h2>
          <p>Web sitenizden yeni bir bülten aboneliği alındı.</p>
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Abone E-postası:</strong> ${email}<br>
            <strong>Kayıt Tarihi:</strong> ${new Date().toLocaleString('tr-TR')}
          </div>
          <p style="font-size: 12px; color: #666;">Bu mesaj Astralis sistemi tarafından otomatik olarak oluşturulmuştur.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Newsletter email sent successfully:", info.messageId, "Accepted:", info.accepted);

    return NextResponse.json({ success: true, message: "Subscribed successfully" });
  } catch (error: any) {
    console.error("Subscription error:", error);
    
    // Detailed error for Gmail App Password issues
    if (error.message.includes("Invalid login")) {
      return NextResponse.json({ 
        error: "Gmail bağlantısı reddedildi. Lütfen 'Uygulama Şifresi' kullandığınızdan emin olun." 
      }, { status: 500 });
    }

    return NextResponse.json({ error: error.message || "Failed to subscribe" }, { status: 500 });
  }
}
