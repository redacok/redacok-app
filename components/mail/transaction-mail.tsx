import { Transaction } from "@prisma/client";
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

interface TransactionMailProps {
  transaction: Transaction;
}

const baseUrl = process.env.NEXT_APP_URL ? process.env.NEXT_APP_URL : "";

export const TransactionMail = ({ transaction }: TransactionMailProps) => (
  <Html>
    <Head />
    <Preview>Notification de Transactions !</Preview>
    <Body style={main}>
      <Container style={container}>
        <h1 style={{ fontSize: "32px", color: "#0b1330" }}>Redacok.</h1>
        <Heading style={heading}>Statut de votre vérification</Heading>
        {transaction.status === "COMPLETED" && (
          <>
            {transaction.type === "DEPOSIT" ||
              (transaction.type === "TRANSFER" && (
                <Text style={paragraph}>
                  Votre compte a été approvisionné d&apos;un montant de{" "}
                  <code style={code}>{transaction.amount} XAF</code>
                </Text>
              ))}
            {transaction.type === "WITHDRAWAL" && (
              <Text style={paragraph}>
                Votre compte a été débité d&apos;un montant de{" "}
                <code style={code}>{transaction.amount} XAF</code>
              </Text>
            )}
          </>
        )}
        <Section style={buttonContainer}>
          <Button style={button} href={`${baseUrl}/dashboard/transactions`}>
            Voir mes transactions
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

TransactionMail.PreviewProps = {
  transaction: {},
} as TransactionMailProps;

export default TransactionMail;

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
