'use client';

export function BrandLogo({ size = 'md', showGlow }: { size?: 'sm' | 'md' | 'lg'; showGlow?: boolean }) {
  const sizes = {
    sm: { w: 28, h: 28, text: 'text-xs' },
    md: { w: 36, h: 36, text: 'text-sm' },
    lg: { w: 48, h: 48, text: 'text-lg' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2" aria-label="شعار Melina Chic">
      <svg
        width={s.w}
        height={s.h}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Hanger shape */}
        <path
          d="M24 4L24 12"
          stroke="#E91E63"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M12 24L24 12L36 24"
          stroke="#E91E63"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 24C8 24 14 30 24 30C34 30 40 24 40 24"
          stroke="#E91E63"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="24" cy="6" r="2" fill="#E91E63" />
      </svg>
      <div className="flex flex-col leading-none">
        <span className={`font-black ${s.text} tracking-tight text-foreground`}>
          MELINA
        </span>
        <span className="text-[8px] font-bold tracking-[0.2em] text-primary uppercase">
          CHIC
        </span>
      </div>
    </div>
  );
}
