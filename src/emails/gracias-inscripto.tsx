import {
  EmailShell,
  LeftBorderBlock,
  Paragraph,
  Title,
  Signature,
} from "./base";

export type GraciasInscriptoProps = {
  nombre: string;
};

export default function GraciasInscripto({ nombre }: GraciasInscriptoProps) {
  const firstName = (nombre || "").split(" ")[0] || "";
  return (
    <EmailShell preview="Cuatro intendentes. Dos horas. Preguntas reales. Vos fuiste parte.">
      <Title>
        {firstName ? `${firstName}, hoy empezó algo distinto` : "Hoy empezó algo distinto"}
      </Title>

      <LeftBorderBlock accent="gray">
        <Paragraph>
          Ayer, por primera vez en Tucumán, cuatro intendentes se sentaron a
          responderle a los jóvenes durante dos horas. Sin libreto. Sin
          chicanas. Con preguntas reales.
        </Paragraph>
      </LeftBorderBlock>

      <Paragraph>
        <strong>Vos fuiste parte de eso.</strong>
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
        Queríamos escribirte lo obvio: gracias por estar. Y lo menos obvio:
        quedás conectado. Este espacio también se construye entre encuentros,
        y vos ya sos parte.
      </Paragraph>

      <Paragraph>Nos vemos en mayo.</Paragraph>

      <Signature />
    </EmailShell>
  );
}
