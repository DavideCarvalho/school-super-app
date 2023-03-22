import { Container } from "@react-email/container";
import { Head } from "@react-email/head";
import { Html } from "@react-email/html";
import { Preview } from "@react-email/preview";
import { Tailwind } from "@react-email/tailwind";
import { Text } from "@react-email/text";

interface ContactUsProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function ContactUs({
  email,
  name,
  phone,
  message,
}: ContactUsProps): JSX.Element {
  return (
    <Html lang="pt-BR">
      <Head>
        <title>Novo contato</title>
      </Head>
      <Tailwind>
        <Container className="bg-white font-sans">
          <Preview>Opa, uma nova pessoa está interessada no Anuá!</Preview>
          <Text className="text-4xl text-black">
            Opa, uma nova pessoa está interessada no Anuá!
          </Text>
          <Text className="text-2xl text-black">Nome: {name}</Text>
          <Text className="text-2xl text-black">Email: {email}</Text>
          <Text className="text-2xl text-black">Telefone: {phone}</Text>
          <Text className="text-2xl text-black">Mensagem: {message}</Text>
        </Container>
      </Tailwind>
    </Html>
  );
}

// Styles for the email template
const main = {
  backgroundColor: "#ffffff",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

const heading = {
  fontSize: "32px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
};

const paragraph = {
  fontSize: "18px",
  lineHeight: "1.4",
  color: "#484848",
};
