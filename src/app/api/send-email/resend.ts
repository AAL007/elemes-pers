'use server'
import { EmailTemplate } from '../../../components/etc/email-template';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmailNotification(emailAddress: string, password: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@elemes.site',
      to: [emailAddress],
      subject: 'Welcome Aboard!',
      react: EmailTemplate({ email: emailAddress, password}),
      text: '',
    });

    console.log(error)
    if (error) {
      return {success: false, error};
    }

    // console.log(data);
    return {success: true, data};
    // return Response.json(data);
  } catch (error) {
    return {success: false, error};
  }
}
