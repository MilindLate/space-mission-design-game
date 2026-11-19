'use client';

interface FormulaCardProps {
  name: string;
  formula: string;
  variables: Array<{ symbol: string; definition: string }>;
  source: string;
  result?: { label: string; value: string; unit: string };
}

export default function FormulaCard({
  name,
  formula,
  variables,
  source,
  result,
}: FormulaCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">{name}</span>
        <span className="text-xs text-slate-600 italic">{source}</span>
      </div>

      {/* Formula */}
      <div className="font-mono text-cyan-300 text-base bg-slate-950/60 rounded px-4 py-3 border border-slate-800 tracking-wide">
        {formula}
      </div>

      {/* Variables */}
      {variables.length > 0 && (
        <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-xs">
          {variables.map((v) => (
            <>
              <span key={v.symbol + '_sym'} className="font-mono text-cyan-500 text-right">{v.symbol}</span>
              <span key={v.symbol + '_def'} className="text-slate-400">{v.definition}</span>
            </>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-1 flex items-center justify-between bg-cyan-900/20 border border-cyan-800/40 rounded px-3 py-2">
          <span className="text-xs text-slate-400">{result.label}</span>
          <span className="font-mono text-cyan-300 font-bold">
            {result.value} <span className="text-slate-500 font-normal">{result.unit}</span>
          </span>
        </div>
      )}
    </div>
  );
}
