import * as React from 'react';

interface EmailTemplateProps {
  email: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  email
}) => (
  <div>
    <p>Congratulation to become one of the crew of Elemes University.</p>
    <p>Here are some of the things that you need to do as a new member:</p>
    <p style={{ marginLeft: '20px' }}>1. First you need to login to elemes.site using this email <b>{email}</b></p>
    <p style={{ marginLeft: '20px' }}>2. Type in the default password <b>el3mesdd/mm/yyyy</b></p>
    <p style={{ marginLeft: '20px' }}>3. Don't forget to <b>change your password</b> after first time log in!</p><br/>
    <p>Best Regards,</p><br/>
    <p>Elemes Academy</p>
  </div>
);
