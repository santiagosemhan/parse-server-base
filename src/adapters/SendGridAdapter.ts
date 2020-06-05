import { MailService } from '@sendgrid/mail';

const SimpleSendGridAdapter = (mailOptions: { apiKey: string; fromAddress: string }) => {
  if (!mailOptions || !mailOptions.apiKey || !mailOptions.fromAddress) {
    throw new Error('SimpleSendGridAdapter requires an API Key.');
  }

  const sendgrid = new MailService();

  const sendMail = ({
    to,
    subject,
    text,
    html,
    templateId,
    dynamicTemplateData,
  }: Sensbox.MailTypeRequired): Promise<any> => {
    sendgrid.setApiKey(mailOptions.apiKey);
    const msg = {
      to,
      from: mailOptions.fromAddress,
      subject,
      text,
      html: html || `<div>${text}</div>`,
      templateId,
      dynamicTemplateData,
    };

    return sendgrid.send(msg);
  };

  const sendVerificationEmail = (options: { appName: string; link: string; user: Parse.User }) => {
    const { appName, link, user } = options;

    const nickname = user.get('account')
      ? user.get('account').get('nickname')
      : user.get('username');

    try {
      return sendMail({
        to: user.get('email'),
        subject: 'Account Verification',
        templateId: 'd-29f1f0d1c4644557b243d088b87486c7',
        dynamicTemplateData: {
          appName,
          link,
          username: user.get('username'),
          nickname,
        },
      });
    } catch (error) {
      throw new Error(`Cannot send mail to ${user.get('email')}.`);
    }
  };

  const sendPasswordResetEmail = (options: { appName: string; link: string; user: Parse.User }) => {
    const { appName, link, user } = options;

    const nickname = user.get('account')
      ? user.get('account').get('nickname')
      : user.get('username');

    try {
      return sendMail({
        to: user.get('email'),
        subject: 'Password Reset',
        templateId: 'd-85e4bb8097ee4c7dadcecb6980e7c13c',
        dynamicTemplateData: {
          appName,
          link,
          username: user.get('username'),
          nickname,
        },
      });
    } catch (error) {
      throw new Error(`Cannot send mail to ${user.get('email')}.`);
    }
  };

  return Object.freeze({
    sendMail,
    sendVerificationEmail,
    sendPasswordResetEmail,
  });
};

export default SimpleSendGridAdapter;
