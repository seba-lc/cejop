import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Img,
  Link,
  Preview,
  Hr,
} from "@react-email/components";
import { LOGO_URL, INSTAGRAM_URL, LANDING_URL } from "@/lib/resend";

export const emailColors = {
  dark: "#1A1A2E",
  blue: "#2C46BF",
  textPrimary: "#1A1A2E",
  textSecondary: "#4B5563",
  textMuted: "#6B7280",
  border: "#E5E7EB",
  background: "#F7F7FB",
  cardBackground: "#FFFFFF",
};

export function EmailShell({
  preview,
  children,
}: {
  preview: string;
  children: React.ReactNode;
}) {
  return (
    <Html lang="es">
      <Head />
      <Preview>{preview}</Preview>
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
            {/* Header with logo */}
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
                CEJOP Tucumán
              </Text>
            </Section>

            {/* Body */}
            <Section style={{ padding: "32px 28px" }}>{children}</Section>

            {/* Footer */}
            <Hr
              style={{
                borderColor: emailColors.border,
                margin: 0,
              }}
            />
            <Section
              style={{
                padding: "20px 28px",
                textAlign: "center",
              }}
            >
              <Text
                style={{
                  fontSize: "13px",
                  color: emailColors.textMuted,
                  margin: 0,
                }}
              >
                <Link
                  href={LANDING_URL}
                  style={{ color: emailColors.textMuted, textDecoration: "none" }}
                >
                  cejoptucuman.com
                </Link>
                {"  ·  "}
                <Link
                  href={INSTAGRAM_URL}
                  style={{ color: emailColors.textMuted, textDecoration: "none" }}
                >
                  @cejoptucuman
                </Link>
              </Text>
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
            Recibís este correo porque participaste del primer encuentro CEJOP
            Tucumán.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export function LeftBorderBlock({
  accent,
  children,
}: {
  accent: "blue" | "gray";
  children: React.ReactNode;
}) {
  const color = accent === "blue" ? emailColors.blue : "#D1D5DB";
  return (
    <Section
      style={{
        borderLeft: `3px solid ${color}`,
        paddingLeft: "14px",
        marginBottom: "18px",
      }}
    >
      {children}
    </Section>
  );
}

export function Paragraph({
  children,
  muted,
}: {
  children: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <Text
      style={{
        fontSize: "15px",
        lineHeight: "1.65",
        color: muted ? emailColors.textSecondary : emailColors.textPrimary,
        margin: "0 0 12px 0",
      }}
    >
      {children}
    </Text>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return (
    <Heading
      as="h1"
      style={{
        fontSize: "24px",
        fontWeight: 900,
        lineHeight: "1.2",
        color: emailColors.textPrimary,
        margin: "0 0 20px 0",
      }}
    >
      {children}
    </Heading>
  );
}

export function Signature() {
  return (
    <Text
      style={{
        fontSize: "15px",
        color: emailColors.textPrimary,
        margin: "24px 0 0 0",
        fontWeight: 600,
      }}
    >
      — Equipo CEJOP Tucumán
    </Text>
  );
}
