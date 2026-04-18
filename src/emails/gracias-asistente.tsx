import {
  EmailShell,
  LeftBorderBlock,
  Paragraph,
  Title,
  Signature,
} from "./base";

export type GraciasAsistenteProps = {
  nombre: string;
};

export default function GraciasAsistente({ nombre }: GraciasAsistenteProps) {
  const firstName = (nombre || "").split(" ")[0] || "";
  return (
    <EmailShell preview="Cuatro intendentes. Dos horas. Preguntas reales. Vos fuiste parte.">
      <Title>
        {firstName ? `${firstName}, gracias por estar` : "Gracias por estar"}
      </Title>

      <LeftBorderBlock accent="gray">
        <Paragraph>
          Ayer, por primera vez en Tucumán, cuatro intendentes se sentaron a
          responderle a los jóvenes durante dos horas. Sin libreto. Sin
          chicanas. Con preguntas reales.
        </Paragraph>
      </LeftBorderBlock>

      <Paragraph>
        <strong>Vos estuviste. Eso es lo que importa.</strong>
      </Paragraph>

      <LeftBorderBlock accent="blue">
        <Paragraph>
          El CEJOP no es un evento aislado. Es un año entero de encuentros
          como este: en mayo abrimos la cocina del poder con el Ministerio
          del Interior, después vienen la economía, la justicia, el Congreso.
          Nueve meses para entender desde adentro cómo funciona el poder
          real, con la gente que lo ejerce.
        </Paragraph>
      </LeftBorderBlock>

      <Paragraph>
        Para el próximo encuentro el cupo es limitado, así que vamos a abrir
        una inscripción formal en mayo. Te avisamos por este mismo email
        apenas se habilite.
      </Paragraph>

      <Paragraph>
        Quedás conectado. Este espacio también se construye entre encuentros,
        y vos ya sos parte.
      </Paragraph>

      <Paragraph>Nos vemos pronto.</Paragraph>

      <Signature />
    </EmailShell>
  );
}
