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
          Estate atento/a a nuestras redes:{" "}
          <strong>@cejoptucuman</strong> en Instagram. Ahí vamos a
          anunciar el próximo encuentro y cuándo se abren las
          inscripciones.
        </Paragraph>
      </LeftBorderBlock>

      <Paragraph>
        Gracias por ser parte del CEJOP. Esto recién arranca.
      </Paragraph>

      <Signature />
    </EmailShell>
  );
}
