'use server'
import { EmailTemplate } from '../../../components/etc/email-template';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.SENDER_EMAIL || ''
const subject = 'Welcome Aboard!';

export async function sendEmailNotification(emailAddress: string, password: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to: [emailAddress],
      subject: subject,
      react: EmailTemplate({ email: emailAddress, password}),
      text: '',
    });

    console.log(error)
    if (error) {
      return {success: false, error};
    }
    return {success: true, data};
  } catch (error) {
    return {success: false, error};
  }
}
