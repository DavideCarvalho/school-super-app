import { render } from "@react-email/render";
import nodemailer from "nodemailer";
import { z } from "zod";

import { ContactUs } from "@acme/email";

import { createTRPCRouter, publicProcedure } from "../trpc";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

// Replace with your SMTP credentials
const smtpOptions = {
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER as string,
    pass: process.env.SMTP_PASSWORD as string,
  },
};

const transporter = nodemailer.createTransport({
  ...smtpOptions,
});

export const sendEmail = async (data: EmailPayload) => {
  return await transporter.sendMail({
    from: process.env.SMTP_FROM_EMAIL,
    ...data,
  });
};

export const emailRouter = createTRPCRouter({
  sendContactUsEmail: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email(),
        schoolName: z.string(),
        phone: z.string().optional(),
        message: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        await sendEmail({
          to: "anuaapp@gmail.com",
          subject: "Contato recebido",
          html: render(
            ContactUs({
              email: input.email,
              message: `

                Nome da escola: ${input.schoolName}
                
                ${input.message}
              `,
              name: input.name,
              phone: input.phone,
            }),
          ),
        });
      } catch (e) {
        console.log(e);
      }
    }),
});
