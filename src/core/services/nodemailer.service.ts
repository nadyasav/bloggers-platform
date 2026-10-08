import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { injectable } from 'inversify';
import { config } from '../config';

const SMTP_SSL_PORT = 465;

@injectable()
export class NodemailerService {
  async sendEmail(email: string, htmlTemplate: string) {
    const port = Number(config.email.port);
    const smtpOptions: SMTPTransport.Options = {
      host: config.email.host,
      port,
      secure: port === SMTP_SSL_PORT,
      auth: {
        user: config.email.address,
        pass: config.email.password,
      },
    };

    const transporter = nodemailer.createTransport(smtpOptions);

    const mailOptions = {
      from: config.email.address,
      to: email,
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
  }
}
