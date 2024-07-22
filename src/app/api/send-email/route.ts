'use server'
import { EmailTemplate } from '../../../components/etc/email-template';
import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend("re_fz4Dy97z_CheV8RYQLaDV7F58hhcwPbxK");

let email: string = 'alfonsus.adrian@elemes.site'

export async function sendEmailNotification() {
  try {
    const { data, error } = await resend.emails.send({
      from: 'noreply@elemes.site',
      to: ['alfonsus131@gmail.com'],
      subject: 'Welcome Aboard!',
      react: EmailTemplate({ email}),
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
