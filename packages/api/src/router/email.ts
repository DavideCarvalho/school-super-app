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
        name: z.string().min(1).max(255).optional(),
        email: z.string().email(),
        schoolName: z.string().optional(),
        phone: z.string().optional().optional(),
        message: z.string().optional(),
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

                Nome da escola: ${input.schoolName ?? "Não informado"}
                
                ${input.message ? input.message : ""}
              `,
              name: input.name ?? "Não informado",
              phone: input.phone ?? "Não informado",
            }),
          ),
        });
      } catch (e) {
        console.log(e);
      }
    }),
});
