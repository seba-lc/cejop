import {
  EmailShell,
  LeftBorderBlock,
  Paragraph,
  Title,
  Signature,
} from "./base";

export type TestPingProps = {
  timestamp: string;
};

export default function TestPing({ timestamp }: TestPingProps) {
  return (
    <EmailShell preview="Email de prueba del sistema de emails.">
      <Title>Email de prueba</Title>

      <LeftBorderBlock accent="blue">
        <Paragraph>
          Si estás viendo esto, el sistema de emails del CEJOP está
          funcionando correctamente. Remitente, DNS, templates y
          entrega: todo OK.
        </Paragraph>
      </LeftBorderBlock>

      <Paragraph muted>
        <strong>Timestamp:</strong> {timestamp}
      </Paragraph>

      <Paragraph muted>
        Este email no se registra como campaña real. Es un ping técnico.
      </Paragraph>

      <Signature />
    </EmailShell>
  );
}
