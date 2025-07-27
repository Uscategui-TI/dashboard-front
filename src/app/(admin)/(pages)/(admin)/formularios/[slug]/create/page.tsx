"use client";

import { createQuestion, getFormBySlug } from "@/api/services/formService";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import Button from "@/components/shared/ui/button/Button";
import { useParams, useRouter  } from "next/navigation";
import { useEffect, useState } from "react";



export default function AddQuestionPage() {
  const params = useParams<{ slug: string }>();

  if (!params) {
    return <div>Error: Parámetro faltante</div>;
  }

  const { slug } = params;
  
  const router = useRouter();
  const [form, setForm] = useState<any>(null);
  const [text, setText] = useState("");
  const [type, setType] = useState("TEXT");
  const [options, setOptions] = useState<string[]>([""]);
  const [success, setSuccess] = useState(false);
  const [isRequired, setIsRequired] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);


  useEffect(() => {
    if (slug) {
      getFormBySlug(slug as string).then(setForm);
    }
  }, [slug]);

  const handleAddOption = () => setOptions([...options, ""]);
  const handleOptionChange = (i: number, value: string) => {
    const updated = [...options];
    updated[i] = value;
    setOptions(updated);
  };

  const requiresOptions = ["RADIO", "CHECKBOX", "DROPDOWN"].includes(type);

  const handleSubmit = async () => {
    const payload = {
      formId: form.id,
      questionText: text,
      questionType: type,
      isRequired,
      options: requiresOptions
        ? options.filter((o) => o.trim()).map((o) => ({ optionText: o }))
        : [],
    };

    setQuestions([...questions, payload]); // ← aquí
    await createQuestion(payload, slug);
    setText("");
    setOptions([""]);
    setType("TEXT");
    setIsRequired(false);
    setSuccess(true);
    console.log(questions)
  };


  if (!form) return <div>Cargando formulario...</div>;

  return (
    <>
      <PageBreadcrumb pageTitle="Formularios"/>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90 mb-6">Agregar pregunta a: {form.title}</h1>

        <div className="flex flex-col gap-4">
          <input
            className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700" 
            placeholder="Texto de la pregunta"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <label className="inline-flex items-center mt-2">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-white/80">¿Es obligatoria esta pregunta?</span>
          </label>


          <select
            className={`h-11 w-full appearance-none rounded-lg border border-gray-300  px-4 py-2.5 pr-11 text-sm shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800`}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="TEXT">Respuesta corta</option>
            <option value="RADIO">Opción única</option>
            <option value="CHECKBOX">Opción múltiple</option>
            <option value="DROPDOWN">Desplegable</option>
            <option value="NUMBER">Número</option>
            <option value="DATE">Fecha</option>
          </select>

          {requiresOptions &&
            options.map((opt, i) => (
              <>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Opción ${i + 1}
                </label>
                <input
                  key={i}
                  className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700" 
                  placeholder={`Opción ${i + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                />
              </>
            ))}
        </div>

        <div className="flex flex-col gap-4 mt-4">
          {requiresOptions && (
            <Button
              variant="outline"
              onClick={handleAddOption}
            >
              + Agregar opción
            </Button>
          )}

          <div className="flex gap-4 justify-end">
            <Button  onClick={handleSubmit} size="md">Guardar pregunta</Button>
            <Button  onClick={() =>  router.push(`/formularios/${slug}`)} size="md">Ver Formulario</Button>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-white/90">Preguntas agregadas</h2>
            <ul className="mt-2 space-y-2">
              {questions.map((q, idx) => (
                <li key={idx} className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
                  <p className="text-sm text-gray-800 dark:text-white">{q.questionText}</p>
                  <p className="text-xs text-gray-600 dark:text-white/70">Tipo: {q.questionType} | Obligatoria: {q.isRequired ? 'Sí' : 'No'}</p>
                  {q.options?.length > 0 && (
                    <ul className="ml-4 list-disc text-xs text-gray-600 dark:text-white/70">
                      {q.options.map((opt: any, i: number) => (
                        <li key={i}>{opt.optionText}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}


        {success && <p className="mt-4 text-green-600">Pregunta guardada 🎉</p>}
      </div>
    </>
  );
}
