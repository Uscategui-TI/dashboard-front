// services/formService.ts
export async function createForm(data: {
  title: string;
  description: string;
}) {
  const res = await fetch("http://localhost:8080/api/forms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al crear el formulario");
  return await res.json();
};

export async function createQuestion(data: {
  formId: number;
  questionText: string;
  questionType: string; // e.g. TEXT, RADIO, CHECKBOX
  isRequired: boolean;
  options?: { optionText: string }[];
}, slug: string | string[] | undefined) {
    console.log(data)
  const res = await fetch(`http://localhost:8080/api/questions/form/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([data]),
  });

  if (!res.ok) throw new Error("Error al crear la pregunta");
  return await res.json();
}

export async function getFormBySlug(slug: string) {
  const res = await fetch(`http://localhost:8080/api/questions/form/${slug}`);

  if (!res.ok) throw new Error("Formulario no encontrado");
  return await res.json(); // Devuelve las preguntas con sus opciones
}

export async function submitResponses(slug: string, answers: { question: { id: number }, answerText: string }[]) {
  const res = await fetch(`http://localhost:8080/api/responses/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(answers),
  });

  if (!res.ok) throw new Error("Error al enviar respuestas");
}

export async function getFormSummary(slug: string) {
  const res = await fetch(`http://localhost:8080/api/responses/form/${slug}/summary`);
  if (!res.ok) throw new Error("No se pudo obtener el resumen");
  return await res.json();
}
