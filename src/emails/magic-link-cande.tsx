import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Img,
  Button,
  Preview,
  Hr,
  Link,
} from "@react-email/components";
import { LOGO_URL } from "@/lib/resend";
import { emailColors, Paragraph, Title, Signature } from "./base";

export default function MagicLinkCande({
  url,
  ttlMinutes,
}: {
  url: string;
  ttlMinutes: number;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu acceso al panel interno de CEJOP</Preview>
      <Body
        style={{
          backgroundColor: emailColors.background,
          margin: 0,
          padding: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: emailColors.textPrimary,
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "32px 16px",
          }}
        >
          <Section
            style={{
              backgroundColor: emailColors.cardBackground,
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            <Section
              style={{
                backgroundColor: emailColors.dark,
                padding: "32px 24px",
                textAlign: "center",
              }}
            >
              <Img
                src={LOGO_URL}
                width="96"
                height="96"
                alt="CEJOP Tucumán"
                style={{
                  display: "block",
                  margin: "0 auto",
                  borderRadius: "16px",
                }}
              />
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: "11px",
                  fontWeight: 600,
                  letterSpacing: "3px",
                  textTransform: "uppercase",
                  marginTop: "16px",
                  marginBottom: 0,
                }}
              >
                CEJOP · Panel interno
              </Text>
            </Section>

            <Section style={{ padding: "32px 28px" }}>
              <Title>Tu acceso al panel</Title>
              <Paragraph>
                Pediste entrar al panel interno de CEJOP. Hacé clic en el botón
                para iniciar sesión. El link vence en {ttlMinutes} minutos y se
                puede usar una sola vez.
              </Paragraph>

              <Section style={{ textAlign: "center", margin: "28px 0" }}>
                <Button
                  href={url}
                  style={{
                    backgroundColor: emailColors.blue,
                    color: "#FFFFFF",
                    fontSize: "15px",
                    fontWeight: 700,
                    padding: "14px 28px",
                    borderRadius: "8px",
                    textDecoration: "none",
                    display: "inline-block",
                  }}
                >
                  Entrar al panel
                </Button>
              </Section>

              <Paragraph muted>
                Si el botón no funciona, copiá y pegá este link en tu navegador:
              </Paragraph>
              <Text
                style={{
                  fontSize: "12px",
                  color: emailColors.textMuted,
                  wordBreak: "break-all",
                  margin: "0 0 16px 0",
                }}
              >
                <Link href={url} style={{ color: emailColors.blue }}>
                  {url}
                </Link>
              </Text>

              <Hr style={{ borderColor: emailColors.border, margin: "20px 0" }} />

              <Paragraph muted>
                Si vos no pediste este acceso, ignorá este correo. Nadie va a
                poder entrar sin el link.
              </Paragraph>

              <Signature />
            </Section>
          </Section>

          <Text
            style={{
              fontSize: "11px",
              color: emailColors.textMuted,
              textAlign: "center",
              marginTop: "16px",
            }}
          >
            Correo automático del panel interno CEJOP. No compartas este link.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
