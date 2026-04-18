import {
  EmailShell,
  LeftBorderBlock,
  Paragraph,
  Title,
  Signature,
} from "./base";

export type GraciasFeedbackProps = {
  nombre: string;
};

export default function GraciasFeedback({ nombre }: GraciasFeedbackProps) {
  const firstName = (nombre || "").split(" ")[0] || "";
  return (
    <EmailShell preview="Tu feedback nos ayuda a construir los próximos encuentros.">
      <Title>
        {firstName ? `Gracias, ${firstName}` : "Gracias por tu feedback"}
      </Title>

      <LeftBorderBlock accent="gray">
        <Paragraph>
          Recibimos tus respuestas sobre el primer encuentro. Leer lo
          que escribiste no es un trámite — es literalmente cómo
          decidimos cómo seguimos.
        </Paragraph>
      </LeftBorderBlock>

      <LeftBorderBlock accent="blue">
        <Paragraph>
          En mayo abrimos el segundo encuentro: <strong>la cocina del
          poder con el Ministerio del Interior</strong>. El cupo
          sigue siendo limitado. Te avisamos por este mismo email
          apenas se habilite la inscripción.
        </Paragraph>
      </LeftBorderBlock>

      <Paragraph>
        Gracias por ser parte del CEJOP. Esto recién arranca.
      </Paragraph>

      <Signature />
    </EmailShell>
  );
}
