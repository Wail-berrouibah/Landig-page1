import { CONFIG } from "@/lib/config";

export default function SpecsTable() {
  return (
    <section
      id="specs"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-12 md:py-20"
    >
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
        Fiche technique
      </h2>
      <div className="mt-6 overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm md:text-base">
          <tbody>
            {CONFIG.specs.map((spec, i) => (
              <tr
                key={spec.label}
                className={i % 2 === 0 ? "bg-bg/50" : "bg-surface"}
              >
                <th className="w-2/5 px-5 py-3 text-left font-medium text-muted md:w-1/3">
                  {spec.label}
                </th>
                <td className="px-5 py-3 text-text">{spec.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
