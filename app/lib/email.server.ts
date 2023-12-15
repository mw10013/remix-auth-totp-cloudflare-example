/**
 * Source: https://github.com/epicweb-dev/epic-stack
 * Source code adapted for this template.
 */
import { z } from "zod";

const ResendErrorSchema = z.union([
  z.object({
    name: z.string(),
    message: z.string(),
    statusCode: z.number(),
  }),
  z.object({
    name: z.literal("UnknownError"),
    message: z.literal("Unknown Error"),
    statusCode: z.literal(500),
    cause: z.any(),
  }),
]);
const ResendSuccessSchema = z.object({
  id: z.string(),
});

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  resendApiKey: string;
};

export async function sendEmail(options: SendEmailOptions) {
  // For development mode, Resend will only accept emails from this domain.
  const from = "onboarding@resend.dev";
  const email = { from, ...options };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${options.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(email),
  });

  const data = await response.json();
  const parsedData = ResendSuccessSchema.safeParse(data);

  if (response.ok && parsedData.success) {
    return { status: "success", data: parsedData } as const;
  } else {
    const parseResult = ResendErrorSchema.safeParse(data);
    if (parseResult.success) {
      console.error(parseResult.data);
      throw new Error("Unable to send email.");
    } else {
      console.error(data);
      throw new Error("Unable to send email.");
    }
  }
}

type AuthEmailOptions = {
  email: string;
  code: string;
  magicLink?: string | null;
  resendApiKey: string;
};

export const sendAuthEmail = async ({
  email,
  code,
  magicLink,
  resendApiKey,
}: AuthEmailOptions) => {
  const subject = "Your verification code for Remix Auth TOTP";
  const html = `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
      </head>
      <body style="max-width: 50%; margin: 0 auto; text-align: center;">
        <h1>Code: ${code}</h1>
        ${
          magicLink &&
          `<p style="font-size: 16px;">
            Alternatively, you can click the Magic Link URL.
            <br />
            <a href="${magicLink}">${magicLink}</a>
          </p>`
        }
      </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject,
    html,
    resendApiKey,
  });
};
