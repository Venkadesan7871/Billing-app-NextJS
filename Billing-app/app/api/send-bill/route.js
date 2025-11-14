import axios from 'axios';

function dataUrlToBuffer(dataUrl) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) throw new Error('Invalid data URL');
  const mimeType = matches[1];
  const base64 = matches[2];
  return { buffer: Buffer.from(base64, 'base64'), mimeType };
}

export async function POST(req) {
  try {
    const { email, html, pdfDataUrl, filename = 'bill.pdf', attachments, meta } = await req.json();
    console.log(meta, 'metameta');
    const { subtotal, cgst, sgst, total, nowDisplay, uniqueInvoiceId, restaurantDetails } = meta;
    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email' }), { status: 400 });
    }

    const from = process.env.MAIL_FROM;

    // if (!host || !user || !pass) {
    //   return new Response(JSON.stringify({ error: 'SMTP env vars not configured' }), { status: 500 });
    // }

    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'BREVO_API_KEY not configured' }), { status: 500 });
    }

    let brevoAttachments = undefined;
    if (Array.isArray(attachments) && attachments.length > 0) {
      brevoAttachments = attachments.map((a) => {
        let content = a.content || '';
        if (typeof content === 'string' && content.startsWith('data:')) {
          const m = content.match(/^data:(.+);base64,(.+)$/);
          content = m ? m[2] : content;
        }
        return { name: a.name || 'attachment', content };
      });
    } else if (pdfDataUrl) {
      const { buffer } = dataUrlToBuffer(pdfDataUrl);
      brevoAttachments = [{ name: filename, content: buffer.toString('base64') }];
    }

    const res = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: { email: from, name: 'Venky' },
        to: [{ email }],
        subject: 'Your Bill',
        htmlContent: html || `
  <div style="font-family: Arial, sans-serif; padding:20px; color:#333; line-height:1.6;">

    <h2 style="text-align:center; color:#d35400; margin-bottom:5px;">
      🍽️ ${restaurantDetails?.name || "Restaurant Name"}
    </h2>

    <p style="text-align:center; margin:0; color:#666;">
      ${restaurantDetails?.address || ""}
    </p>

    <hr style="margin:20px 0;" />

    <p style="font-size:15px;">
      Hello,<br><br>
      Your bill is ready. Please find the PDF attached below.
    </p>

    <div style="background:#fafafa; padding:15px; border-left:4px solid #d35400; margin:20px 0;">
      <p style="margin:0; font-size:15px;">
        <strong>🧾 Bill Details:</strong><br><br>

        • Bill No: <strong>${uniqueInvoiceId}</strong><br>
        • Date: <strong>${nowDisplay}</strong><br><br>

        <strong>💵 Amount Summary:</strong><br>
        • Subtotal: ₹${subtotal}<br>
        • CGST: ₹${cgst}<br>
        • SGST: ₹${sgst}<br>
        • <strong>Total: ₹${total}</strong><br>
      </p>
    </div>

    <p style="font-size:15px;">
      Thank you for visiting <strong>${restaurantDetails?.name || "our restaurant"}</strong>.
    </p>

    <p style="margin-top:25px; font-size:15px;">
      Regards,<br>
      <strong>${restaurantDetails?.name || "Restaurant"}</strong>
    </p>

    <hr style="margin-top:35px;" />

    <p style="text-align:center; font-size:12px; color:#888;">
      This is an automated bill email. Do not reply.
    </p>

  </div>
`,
        attachment: brevoAttachments,
      },
      {
        headers: {
          accept: 'application/json',
          'api-key': apiKey,
          'content-type': 'application/json',
        },
      }
    );

    return Response.json({ success: true, data: res.data });
  } catch (err) {
    console.log(err.response?.data || err);
    return Response.json({ success: false, error: err.response?.data || 'Failed to send email' });
  }
}

