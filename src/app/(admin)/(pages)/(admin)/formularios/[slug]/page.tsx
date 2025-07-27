"use client";

import { useEffect, useState } from "react";
import { getFormBySlug, submitResponses } from "@/api/services/formService";
import { useParams } from "next/navigation";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/shared/ui/button/Button";

export default function FillFormPage() {
 const params = useParams<{ slug: string }>();

  if (!params) {
    return <div>Error: Parámetro faltante</div>;
  }

  const { slug } = params;

  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<{ [key: number]: any }>({});

  useEffect(() => {
    if (slug) {
      getFormBySlug(slug as string).then(setQuestions);
    }
  }, [slug]);

  const handleChange = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleCheckboxChange = (questionId: number, optionText: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const updated = current.includes(optionText)
        ? current.filter((v: string) => v !== optionText)
        : [...current, optionText];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleSubmit = async () => {
  const missingRequired = questions.filter((q) => {
    if (!q.required) return false;

    const answer = answers[q.id];

    if (q.questionType === "CHECKBOX") {
      return !answer || answer.length === 0;
    }

    return !answer || answer.trim?.() === "";
  });

  if (missingRequired.length > 0) {
    alert("Por favor responde todas las preguntas obligatorias.");
    return;
  }

  const payload = Object.entries(answers).map(([qId, answer]) => ({
    question: { id: parseInt(qId) },
    answerText: Array.isArray(answer) ? answer.join(", ") : answer,
  }));

  await submitResponses(slug as string, payload);
  alert("¡Gracias por responder!");
};


  return (
    <>
        <PageBreadcrumb pageTitle="Formularios"/>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
          <h1 className="text-2xl font-bold mb-6 text-white">Formulario</h1>
          {questions.map((q) => (
            <div key={q.id} className="mb-6">
              <label className="font-semibold block mb-2 text-white">
                {q.questionText} {q.required && <span className="text-red-500">*</span>}
              </label>

              {q.questionType === "TEXT" && (
                <input
                  type="text"
                  placeholder={q.questionText}
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700" 
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}

              {q.questionType === "NUMBER" && (
                <input
                  type="number"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700" 
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}

              {q.questionType === "DATE" && (
                <input
                  type="date"
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700" 
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                />
              )}

              {q.questionType === "DROPDOWN" && (
                <select
                  className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
                  value={answers[q.id] || ""}
                  onChange={(e) => handleChange(q.id, e.target.value)}
                >
                  <option value="">Seleccione una opción</option>
                  {q.options?.map((opt: any) => (
                    <option key={opt.id} value={opt.optionText}>
                      {opt.optionText}
                    </option>
                  ))}
                </select>
              )}

              {q.questionType === "RADIO" && ( 
                <div className="flex flex-col gap-2">
                  {q.options?.map((opt: any) => (
                    <label key={opt.id} className="flex items-center gap-2 text-white">
                      <input
                        type="radio"
                        name={`question-${q.id}`}
                        value={opt.optionText}
                        checked={answers[q.id] === opt.optionText}
                        onChange={() => handleChange(q.id, opt.optionText)}
                      />
                      {opt.optionText}
                    </label>
                  ))}
                </div>
              )}

              {q.questionType === "CHECKBOX" && (
                <div className="flex flex-col gap-2">
                  {q.options?.map((opt: any) => (
                    <label key={opt.id} className="flex items-center gap-2 text-white">
                      <input
                        type="checkbox"
                        value={opt.optionText}
                        checked={(answers[q.id] || []).includes(opt.optionText)}
                        onChange={() => handleCheckboxChange(q.id, opt.optionText)}
                      />
                      {opt.optionText}
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
          
          <div className="flex justify-end">
            <Button onClick={handleSubmit}>
              Enviar respuestas
            </Button>
          </div>
        </div>
    </>
  );
}
