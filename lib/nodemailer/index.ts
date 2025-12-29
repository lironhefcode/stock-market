import nodemailer from "nodemailer";
import { WELCOME_EMAIL_TEMPLATE } from "./template";
import { text } from "stream/consumers";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});
export const sendWelcomeEmail = async ({
  email,
  name,
  intro,
}: WelcomeEmailData) => {
  const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace("{{name}}", name).replace(
    "{{intro}}",
    intro
  );
  const mailOptions = {
    from: '"liron stock" <lironstock@liron.com>',
    to: email,
    subject: "Welcome to Liron Stock Market App!",
    text: "thank for joining",
    html: htmlTemplate,
  };
  await transporter.sendMail(mailOptions);
};
