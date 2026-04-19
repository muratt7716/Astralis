import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Geçerli bir e-posta adresi giriniz." }, { status: 400 });
    }

    // Nodemailer transporter'ını ayarla (Gmail kullanarak)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password kullanılması önerilir
      },
    });

    const mailOptions = {
      from: `"Astralis Portal" <${process.env.EMAIL_USER}>`,
      to: "mmuratb77@gmail.com",
      subject: "🎉 Yeni Bülten Aboneliği! (Astralis)",
      text: `Yeni bir kullanıcı bültene abone oldu!\n\nAbone E-posta: ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #fff; padding: 20px; border-radius: 10px; border: 1px solid #333;">
          <h2 style="color: #c084fc;">🌠 Yeni Kozmik Abone!</h2>
          <p style="font-size: 16px; color: #e5e7eb;">Astralis Portal üzerinden yeni biri bültene abone oldu.</p>
          <div style="background-color: #1a1a1a; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #06b6d4;">
            <p style="margin: 0; font-size: 18px;"><strong>E-posta:</strong> <span style="color: #22d3ee;">${email}</span></p>
          </div>
          <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; text-align: center;">Bu otomatik bir bildirimdir.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: "Abonelik başarılı!" });
  } catch (error) {
    console.error("[Subscribe API] Error:", error);
    return NextResponse.json(
      { error: "Abonelik işlemi sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
