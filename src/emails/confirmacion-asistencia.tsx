import { Section, Text } from "@react-email/components";
import {
  EmailShell,
  LeftBorderBlock,
  Paragraph,
  Title,
  Signature,
  emailColors,
} from "./base";

export type ConfirmacionAsistenciaProps = {
  nombre: string;
};

export default function ConfirmacionAsistencia({
  nombre,
}: ConfirmacionAsistenciaProps) {
  const firstName = (nombre || "").split(" ")[0] || "";
  return (
    <EmailShell preview="Quedaste adentro. Sábado 18/4, 14:30, Alcurnia SMT.">
      <Title>
        {firstName
          ? `${firstName}, quedaste adentro`
          : "Quedaste adentro"}
      </Title>

      <LeftBorderBlock accent="gray">
        <Paragraph>
          Tu inscripción al primer encuentro de CEJOP Tucumán quedó
          confirmada. El cupo es limitado y tu lugar ya está reservado.
        </Paragraph>
      </LeftBorderBlock>

      {/* Event details card */}
      <Section
        style={{
          backgroundColor: "#F3F4F6",
          borderLeft: `3px solid ${emailColors.blue}`,
          padding: "18px 20px",
          margin: "20px 0",
        }}
      >
        <Text
          style={{
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: emailColors.blue,
            margin: "0 0 10px 0",
          }}
        >
          Primer encuentro
        </Text>
        <Text
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: emailColors.textPrimary,
            margin: "0 0 6px 0",
          }}
        >
          Sábado 18 de abril, 14:30 hs
        </Text>
        <Text
          style={{
            fontSize: "14px",
            color: emailColors.textSecondary,
            margin: "0 0 4px 0",
          }}
        >
          Alcurnia — 25 de mayo 760, San Miguel de Tucumán
        </Text>
        <Text
          style={{
            fontSize: "13px",
            color: emailColors.textMuted,
            margin: "6px 0 0 0",
          }}
        >
          Acreditación: 14:30 · Inicio: 15:10
        </Text>
      </Section>

      <Paragraph>
        <strong>Qué hacer:</strong> llegá a las 14:30 para acreditarte.
        Vas a ingresar con el mismo email con el que te inscribiste.
        No necesitás imprimir nada.
      </Paragraph>

      <LeftBorderBlock accent="blue">
        <Paragraph>
          Es una Mesa Panel con cuatro intendentes de Tucumán (San
          Miguel, Concepción, Monteros, Aguilares) respondiendo preguntas
          sobre educación, desarrollo económico y federalismo. Vas a
          poder participar con tus propias preguntas.
        </Paragraph>
      </LeftBorderBlock>

      <Paragraph>Nos vemos el viernes.</Paragraph>

      <Signature />
    </EmailShell>
  );
}
