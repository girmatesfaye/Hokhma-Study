/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

interface ScriptureBlockProps {
  text: string;
  reference: string;
  className?: string;
  key?: any;
}

export default function ScriptureBlock({ text, reference, className = '' }: ScriptureBlockProps) {
  return (
    <div className={`my-8 pl-6 pr-4 py-5 border-l-4 border-gold bg-[#FDFAF3] dark:bg-[#1C1A14] rounded-r-md ${className}`}>
      <p className="font-serif italic text-lg leading-relaxed text-nearblack dark:text-gray-100">
        “{text}”
      </p>
      <div className="mt-3.5 flex justify-end">
        <span className="text-xs tracking-wider font-semibold text-gold font-sans">
          — {reference}
        </span>
      </div>
    </div>
  );
}
