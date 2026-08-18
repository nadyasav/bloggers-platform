import { config } from '../config';

export const emailTemplate = {
  registration: (code: string) =>
    `
            <div>
                <h1>Email confirmation</h1>
                <a href='${config.appUrl}/confirm-email?code=${code}'>Confirm email</a>
                <p>Confirmation code: <b>${code}</b></p>
            </div>
        `,

  passwordRecovery: (code: string) =>
    `
            <div>
                <h1>Password recovery</h1>
                <a href='${config.appUrl}/password-recovery?code=${code}'>Recover password</a>
                <p>Recovery code: <b>${code}</b></p>
            </div>
        `,
};
