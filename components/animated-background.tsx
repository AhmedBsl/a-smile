export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background">
        {/* Floating gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-primary/20 via-purple-500/20 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Animated SVG mesh gradient - floating elements */}
        <svg className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="4" seed="1" />
              <feDisplacementMap in="SourceGraphic" scale="80" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>
          <rect width="100%" height="100%" fill="url(#gradient)" filter="url(#noise)" />
        </svg>

        {/* Floating particles */}
        <div className="absolute top-0 left-0 w-1 h-1 bg-primary rounded-full animate-float" style={{ animationDelay: '0s', left: '10%', top: '20%' }} />
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-purple-500 rounded-full animate-float" style={{ animationDelay: '0.5s', left: '20%', top: '40%' }} />
        <div className="absolute top-0 left-0 w-1 h-1 bg-cyan-500 rounded-full animate-float" style={{ animationDelay: '1s', left: '30%', top: '30%' }} />
        <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-yellow-500 rounded-full animate-float" style={{ animationDelay: '1.5s', left: '60%', top: '50%' }} />
        <div className="absolute top-0 left-0 w-1 h-1 bg-accent rounded-full animate-float" style={{ animationDelay: '2s', left: '80%', top: '70%' }} />
      </div>

      {/* Additional CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-30px) translateX(10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
