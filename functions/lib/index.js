"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendInviteEmail = void 0;
const functions = require("firebase-functions");
const resend_1 = require("resend");
const resend = new resend_1.Resend('re_4B3FSDoU_GjgVXh2vLWks6VzuQvfnvaBf');
exports.sendInviteEmail = functions.https.onCall(async (request) => {
    const { email, inviteUrl, locale } = request.data;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }
    const isHebrew = locale === 'he';
    const subject = isHebrew
        ? 'הוזמנת להצטרף ל-Chapiz!'
        : 'You have been invited to join Chapiz!';
    const htmlContent = isHebrew ? `
    <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f97316;">ברוכים הבאים ל-Chapiz!</h1>
      <p>הוזמנת להצטרף לפלטפורמה שלנו.</p>
      <p>לחץ על הכפתור למטה כדי להשלים את ההרשמה:</p>
      <a href="${inviteUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        הצטרף עכשיו
      </a>
      <p style="color: #666; font-size: 14px;">אם לא ביקשת הזמנה זו, תוכל להתעלם מהודעה זו.</p>
    </div>
  ` : `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #f97316;">Welcome to Chapiz!</h1>
      <p>You have been invited to join our platform.</p>
      <p>Click the button below to complete your registration:</p>
      <a href="${inviteUrl}" style="display: inline-block; background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Join Now
      </a>
      <p style="color: #666; font-size: 14px;">If you did not request this invitation, you can ignore this email.</p>
    </div>
  `;
    try {
        const { data, error } = await resend.emails.send({
            from: 'Chapiz <noreply@chapiz.co.il>',
            to: [email],
            subject: subject,
            html: htmlContent,
        });
        if (error) {
            console.error('Resend error:', error);
            throw new functions.https.HttpsError('internal', error.message);
        }
        console.log('Email sent successfully:', data);
        return { success: true, messageId: data === null || data === void 0 ? void 0 : data.id };
    }
    catch (error) {
        console.error('Error sending email:', error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to send email');
    }
});
//# sourceMappingURL=index.js.map