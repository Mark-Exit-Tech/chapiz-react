import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

admin.initializeApp();
const firestore = admin.firestore();

// Get Resend API key from environment variables or fallback to hardcoded (for development)
const resendApiKey = process.env.RESEND_API_KEY || 're_4B3FSDoU_GjgVXh2vLWks6VzuQvfnvaBf';
const resend = new Resend(resendApiKey);

export const sendInviteEmail = functions.https.onCall(async (data, context) => {
  const { email, inviteUrl, locale } = data;

  // Validate required fields
  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid email format');
  }

  // Validate inviteUrl
  if (!inviteUrl || typeof inviteUrl !== 'string') {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid invite URL');
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
    console.log('Attempting to send email:', { email, locale, inviteUrl: inviteUrl.substring(0, 50) + '...' });

    const { data, error } = await resend.emails.send({
      from: 'Chapiz <noreply@chapiz.co.il>',
      to: [email],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API error:', JSON.stringify(error, null, 2));
      const errorMessage = error.message || 'Failed to send email';
      throw new functions.https.HttpsError('internal', errorMessage);
    }

    console.log('Email sent successfully:', { messageId: data?.id, email });
    return { success: true, messageId: data?.id };
  } catch (error: any) {
    console.error('Error sending email:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    });

    // If it's already a Firebase HttpsError, re-throw it
    if (error?.code && error.code.startsWith('functions/')) {
      throw error;
    }

    // Otherwise, wrap it in an HttpsError
    const errorMessage = error?.message || 'Failed to send email. Please check Resend configuration and verify the sender email is verified.';
    throw new functions.https.HttpsError('internal', errorMessage);
  }
});

/**
 * Server-side shop callback — awards points when called via HTTP GET.
 * Works from WooCommerce server-to-server callbacks (no browser needed).
 * URL: https://tag.chapiz.co.il/api/shop/callback?userid=XXX
 */
export const shopCallback = functions.https.onRequest(async (req, res) => {
  const userid = req.query.userid as string;

  if (!userid) {
    res.status(400).json({ success: false, error: 'Missing userid parameter' });
    return;
  }

  const POINTS_TO_AWARD = 20;
  const CATEGORY = 'share_visit';

  try {
    // Update total points
    const pointsRef = firestore.collection('userPoints').doc(userid);
    await pointsRef.set({
      userId: userid,
      points: admin.firestore.FieldValue.increment(POINTS_TO_AWARD),
      updatedAt: new Date()
    }, { merge: true });

    // Create transaction record
    const transactionRef = firestore.collection('pointsTransactions').doc();
    await transactionRef.set({
      id: transactionRef.id,
      userId: userid,
      points: POINTS_TO_AWARD,
      category: CATEGORY,
      createdAt: new Date()
    });

    console.log(`Awarded ${POINTS_TO_AWARD} points to user ${userid} (server-side callback)`);
    res.status(200).json({ success: true, points: POINTS_TO_AWARD, userId: userid });
  } catch (error: any) {
    console.error('Error awarding points:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal error' });
  }
});
