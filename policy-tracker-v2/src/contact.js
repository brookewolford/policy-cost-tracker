// api/contact.js — Vercel serverless function
// Uses Resend (free tier: 3,000 emails/month, no credit card needed)
// Sign up at resend.com, get an API key, add it as RESEND_API_KEY in Vercel env vars

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required." });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Mail service not configured." });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "UG Contact Form <onboarding@resend.dev>",
        to: ["brookewolford@gmail.com"],
        reply_to: email,
        subject: subject ? `[UG Contact] ${subject}` : `[UG Contact] Message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `
          <div style="font-family: Georgia, serif; max-width: 600px; color: #0a0908;">
            <p style="font-family: monospace; font-size: 11px; letter-spacing: 2px; color: #948c80; text-transform: uppercase;">Uncommon Gathering Group — Contact Form</p>
            <hr style="border: none; border-top: 1px solid #e6e2da; margin: 16px 0;" />
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            ${subject ? `<p><strong>Subject:</strong> ${subject}</p>` : ""}
            <hr style="border: none; border-top: 1px solid #e6e2da; margin: 16px 0;" />
            <p style="white-space: pre-wrap; line-height: 1.8;">${message}</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      console.error("Resend error:", err);
      return res.status(500).json({ error: "Failed to send message. Please try again." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact handler error:", err);
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
