const CINETPAY_SMS_API_URL =
  "https://api-notitia.cinetpay.com/sms/1/text/single";
const CINETPAY_API_KEY = process.env.CINETPAY_API_KEY;

interface SmsPayload {
  from: string;
  to: string[];
  text: string;
}

export const sendSms = async (to: string, text: string) => {
  const payload: SmsPayload = {
    from: "Redacok",
    to: [to],
    text: text,
  };

  try {
    const response = await fetch(CINETPAY_SMS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `App ${CINETPAY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log("Réponse de l'API CinetPay:", result);

    return result;
  } catch (error) {
    console.error("Erreur dans sendSms:", error);
    throw error;
  }
};
