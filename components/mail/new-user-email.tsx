import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  // Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface NewUserEmailProps {
  email: string;
  pin: string;
}

const baseUrl = process.env.NEXT_APP_URL ? process.env.NEXT_APP_URL : "";

export const NewUserEmail = ({ email, pin }: NewUserEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenu sur Redacok. !</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* <Img
          src={`${baseUrl}/static/linear-logo.png`}
          width="42"
          height="42"
          alt="Linear"
          style={logo}
        /> */}
        <h1 style={{ fontSize: "32px", color: "#0b1330" }}>Redacok.</h1>
        <Heading style={heading}>vos identifiants de connexion</Heading>
        <Text style={paragraph}>
          Votre compte Redacok a été crée, ci dessous vos identifiants de
          connexion :
        </Text>
        <Text style={code}>Email : {email}</Text>
        <Text style={code}>PIN : {pin}</Text>
        <Section style={buttonContainer}>
          <Button style={button} href={`${baseUrl}/sign-in`}>
            Me Connecter
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={paragraph}>
          Nous vous recommandons de changer votre mot de passe lors de votre
          première connexion.
        </Text>
        <Link href={baseUrl} style={reportLink}>
          Redacok.
        </Link>
      </Container>
    </Body>
  </Html>
);

NewUserEmail.PreviewProps = {
  email: "no-reply@redacok.laclass.dev",
  pin: "122346",
} as NewUserEmailProps;

export default NewUserEmail;

// const logo = {
//   borderRadius: 21,
//   width: 42,
//   height: 42,
// };

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  maxWidth: "560px",
};

const heading = {
  fontSize: "24px",
  letterSpacing: "-0.5px",
  lineHeight: "1.3",
  fontWeight: "400",
  color: "#484848",
  padding: "17px 0 0",
};

const paragraph = {
  margin: "0 0 15px",
  fontSize: "15px",
  lineHeight: "1.4",
  color: "#3c4149",
};

const buttonContainer = {
  padding: "27px 0 27px",
};

const button = {
  backgroundColor: "#0b1330",
  borderRadius: "5px",
  fontWeight: "600",
  color: "#fff",
  fontSize: "15px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "11px 23px",
};

const reportLink = {
  fontSize: "14px",
  color: "#b4becc",
};

const hr = {
  borderColor: "#dfe1e4",
  margin: "42px 0 26px",
};

const code = {
  fontFamily: "monospace",
  fontWeight: "700",
  padding: "1px 4px",
  backgroundColor: "#dfe1e4",
  letterSpacing: "-0.3px",
  fontSize: "16px",
  borderRadius: "4px",
  color: "#3c4149",
};
