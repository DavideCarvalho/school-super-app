import emailjs from "@emailjs/browser";
import nodemailer from "nodemailer";

export const emailJsClient = emailjs.init(
  process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string,
);
