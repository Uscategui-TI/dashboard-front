"use client";

import { getFormSummary } from "@/api/services/formService";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { ApexOptions } from "apexcharts";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

export default function FormResults() {
    const params = useParams<{ slug: string }>();

    if (!params) {
    return <div>Error: Parámetro faltante</div>;
    }

    const { slug } = params;

    const [summary, setSummary] = useState<any[]>([]);
    const [totalForms, setTotalForms] = useState(0);

    useEffect(() => {
        if (slug) {
        getFormSummary(slug as string).then((res) => {
            setSummary(res);

            const max = Math.max(
            ...res.map((q: any) =>
                q.answers.reduce((acc: number, curr: any) => acc + curr.count, 0)
            )
            );
            setTotalForms(max);
        });
        }
    }, [slug]);

return (
    <>
        <PageBreadcrumb pageTitle="Estadísticas" />

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-6 py-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-md">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-2">
                Resultados del formulario
            </h1>

            <p className="text-sm text-gray-600 dark:text-white/70 mb-6">
                Total de formularios contestados:{" "}
                <strong>{totalForms || "0"}</strong>
            </p>

            <p className="text-sm text-gray-600 dark:text-white/70 mb-6">
                Nuevos Prospectos:{" "}
                <strong>{totalForms || "0"}</strong>
            </p>

            {summary.length === 0 ? (
            <p className="text-gray-500 dark:text-white/50">
                No hay respuestas aún.
            </p>
            ) : (
            <div className="space-y-10">
                {summary.map((item, idx) => {
                const labels = item.answers.map((a: any) => a.answerText);
                const counts = item.answers.map((a: any) => a.count);

                console.log(labels)

                const isPie = labels.length <= 5;
                const chartType: "pie" | "bar" = isPie ? "pie" : "bar";

                const chartOptions: ApexOptions = {
                    chart: { type: chartType },
                    labels: isPie ? labels : undefined,
                    xaxis: !isPie ? { categories: labels } : undefined,
                    theme: { mode: "dark" },
                    legend: { position: "bottom" },
                    tooltip: {
                    y: {
                        formatter: (val: number) => `${val} respuestas`,
                    },
                    },
                };

                const chartSeries = isPie
                    ? counts // para pie: number[]
                    : [
                        {
                        name: "Respuestas",
                        data: counts, // para bar: [{ name, data: [] }]
                        },
                    ];

                return (
                    <div
                    key={item.questionId}
                    className="rounded-lg border border-gray-200 dark:border-gray-700 p-5 bg-gray-50 dark:bg-gray-900 shadow-sm"
                    >
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-white mb-4">
                        {item.questionText}
                    </h2>

                    {item.answers && item.answers.length > 0 && (
                        <Chart
                            options={chartOptions}
                            series={chartSeries}
                            type={chartType}
                            height={labels.length <= 5 ? 320 : 380}
                        />
                    )}


                    <ul className="mt-4 space-y-1 text-sm text-gray-600 dark:text-white/80">
                        {item.answers.map((a: any, i: number) => (
                        <li key={i}>
                            <span className="font-medium">{a.answerText}</span>:{" "}
                            {a.count} respuesta{a.count !== 1 && "s"}
                        </li>
                        ))}
                    </ul>
                    </div>
                );
                })}
            </div>
            )}
        </div>
    </>
    );
}
