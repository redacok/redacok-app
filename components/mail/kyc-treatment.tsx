import { Kyc } from "@prisma/client";
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

interface KycTreatmentProps {
  kyc: Kyc;
}

const baseUrl = process.env.NEXT_APP_URL
  ? process.env.NEXT_APP_URL
  : "https://redacok.laclass.dev";

export const KycTreatment = ({ kyc }: KycTreatmentProps) => (
  <Html>
    <Head />
    <Preview>Vérification Intermédiaire !</Preview>
    <Body style={main}>
      <Container style={container}>
        <h1 style={{ fontSize: "32px", color: "#0b1330" }}>Redacok.</h1>
        <Heading style={heading}>Statut de votre vérification</Heading>
        <Text style={paragraph}>
          Votre vérification soumise le {kyc.submittedAt.toLocaleDateString()} a
          été <b>{kyc.status === "APPROVED" ? "Approuvée" : "Rejetée"}</b>
        </Text>
        {kyc.status === "REJECTED" && (
          <>
            <code style={code}>Motif du rejet :</code>
            <Text style={paragraph}>{kyc.rejectionReason}</Text>
          </>
        )}
        <Section style={buttonContainer}>
          <Button style={button} href={`${baseUrl}/dashboard`}>
            Me Connecter
          </Button>
        </Section>
        <Hr style={hr} />
        <Link href={baseUrl} style={reportLink}>
          Redacok.
        </Link>
      </Container>
    </Body>
  </Html>
);

KycTreatment.PreviewProps = {
  kyc: {},
} as KycTreatmentProps;

export default KycTreatment;

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
