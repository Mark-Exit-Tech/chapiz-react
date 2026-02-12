import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Resend } from 'resend';

// Initialize Firebase Admin
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
 * Shop Callback - Awards 20 points to the user when their shared link is visited
 * Called via HTTP GET/POST with ?userid=<userId>
 */
export const shopCallback = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  const userid = req.query.userid as string || req.body?.userid;

  if (!userid || typeof userid !== 'string') {
    res.status(400).json({ success: false, error: 'userid is required' });
    return;
  }

  try {
    const POINTS_TO_AWARD = 20;
    const userPointsRef = firestore.collection('userPoints').doc(userid);
    const transactionsRef = firestore.collection('pointsTransactions');

    // Award 20 points using increment (creates doc if doesn't exist)
    await userPointsRef.set({
      userId: userid,
      points: admin.firestore.FieldValue.increment(POINTS_TO_AWARD),
      updatedAt: new Date()
    }, { merge: true });

    // Create transaction record
    const transactionDoc = transactionsRef.doc();
    await transactionDoc.set({
      id: transactionDoc.id,
      userId: userid,
      points: POINTS_TO_AWARD,
      category: 'share_visit',
      description: 'Points awarded for shared link visit',
      createdAt: new Date()
    });

    console.log(`Awarded ${POINTS_TO_AWARD} points to user ${userid}`);
    res.status(200).json({ success: true, points: POINTS_TO_AWARD, userid });
  } catch (error: any) {
    console.error('Error awarding points:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to award points' });
  }
});
