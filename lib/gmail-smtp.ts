import nodemailer from "nodemailer";
import { buildReplyBody } from "./parse-alert";
export async function sendTeamsReply(
  to: string,
  cid: string,
  message: string
): Promise<void> {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
  }

  const transport = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user, pass },
  });

  await transport.sendMail({
    from: `"Teams Alert Inbox" <${user}>`,
    to,
    subject: "[TEAMS-ALERT]",
    text: buildReplyBody(cid, message),
    textEncoding: "base64",
  });}
