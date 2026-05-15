const nodemailer = require('nodemailer');

function createTransporter() {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-MA', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

async function sendPurchaseConfirmation(user, ticket, event) {
  const transporter = createTransporter();
  if (!transporter) {
    console.log('[Email] GMAIL_USER/GMAIL_APP_PASSWORD manquants — email ignoré');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:30px;font-weight:800;">◆ Fayas</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">Billetterie d'événements au Maroc</p>
        </td>
      </tr>
      <tr>
        <td style="text-align:center;padding:32px 40px 16px;">
          <div style="font-size:48px;margin-bottom:12px;">✅</div>
          <h2 style="color:#111827;margin:0;font-size:22px;font-weight:700;">Réservation confirmée !</h2>
          <p style="color:#6b7280;margin:8px 0 0;font-size:15px;">Bonjour ${user.name}, voici votre billet.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:16px 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;">
            <tr><td style="padding:24px;">
              <h3 style="color:#7c3aed;margin:0 0 16px;font-size:17px;font-weight:700;">${event.title}</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:5px 0;color:#6b7280;font-size:13px;width:22px;">📅</td>
                  <td style="padding:5px 0 5px 8px;color:#374151;font-size:13px;font-weight:500;">${formatDate(event.date)} à ${event.time}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;color:#6b7280;font-size:13px;">📍</td>
                  <td style="padding:5px 0 5px 8px;color:#374151;font-size:13px;font-weight:500;">${event.venue}, ${event.city}</td>
                </tr>
                ${event.dress_code ? `<tr>
                  <td style="padding:5px 0;color:#6b7280;font-size:13px;">👔</td>
                  <td style="padding:5px 0 5px 8px;color:#374151;font-size:13px;font-weight:500;">${event.dress_code}</td>
                </tr>` : ''}
              </table>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border:2px solid #7c3aed;border-radius:12px;overflow:hidden;">
            <tr style="background:#7c3aed;">
              <td style="padding:10px 20px;">
                <p style="color:#fff;margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Détails du billet</p>
              </td>
            </tr>
            <tr><td style="padding:20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">Référence</td>
                  <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;font-family:monospace;">${ticket.id.substring(0,8).toUpperCase()}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">Type</td>
                  <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;">${ticket.ticket_type === 'vip' ? '⭐ VIP' : 'Standard'}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;font-size:13px;padding:4px 0;">Quantité</td>
                  <td style="color:#111827;font-size:13px;font-weight:600;text-align:right;">${ticket.quantity} billet(s)</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding:10px 0 4px;"><hr style="border:none;border-top:1px solid #e5e7eb;margin:0;"></td>
                </tr>
                <tr>
                  <td style="color:#374151;font-size:15px;font-weight:700;padding:4px 0;">Total payé</td>
                  <td style="color:#7c3aed;font-size:18px;font-weight:800;text-align:right;">${ticket.total_price} MAD</td>
                </tr>
              </table>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#ede9fe;border-radius:12px;">
            <tr><td style="padding:14px 20px;">
              <p style="color:#7c3aed;margin:0;font-size:13px;font-weight:600;">💎 FayasCoins gagnés : <strong>+${ticket.points_earned} points</strong></p>
              <p style="color:#6d28d9;margin:4px 0 0;font-size:12px;">Consultez votre solde dans votre tableau de bord.</p>
            </td></tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
          <p style="color:#9ca3af;margin:0;font-size:12px;">Présentez ce billet ou votre QR code à l'entrée de l'événement.</p>
          <p style="color:#9ca3af;margin:6px 0 0;font-size:12px;">© 2025 Fayas — Billetterie d'événements au Maroc</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Fayas Billetterie" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `Votre billet pour ${event.title} — Fayas`,
    html,
  });
  console.log(`[Email] Confirmation envoyée → ${user.email}`);
}

async function sendWelcomeEmail(user) {
  const transporter = createTransporter();
  if (!transporter) return;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:linear-gradient(135deg,#7c3aed,#4f46e5);padding:40px;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:30px;font-weight:800;">◆ Fayas</h1>
          <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:13px;">Billetterie d'événements au Maroc</p>
        </td>
      </tr>
      <tr>
        <td style="padding:40px;text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🎉</div>
          <h2 style="color:#111827;margin:0 0 8px;font-size:22px;font-weight:700;">Bienvenue, ${user.name} !</h2>
          <p style="color:#6b7280;margin:0;font-size:15px;line-height:1.6;">Votre compte Fayas est créé. Découvrez les meilleurs événements du Maroc et réservez vos billets en quelques clics.</p>
        </td>
      </tr>
      <tr>
        <td style="padding:0 40px 40px;text-align:center;">
          <p style="color:#9ca3af;font-size:12px;margin:0;">© 2025 Fayas — Billetterie d'événements au Maroc</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Fayas Billetterie" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `Bienvenue sur Fayas, ${user.name} !`,
    html,
  });
  console.log(`[Email] Bienvenue envoyé → ${user.email}`);
}

module.exports = { sendPurchaseConfirmation, sendWelcomeEmail };
