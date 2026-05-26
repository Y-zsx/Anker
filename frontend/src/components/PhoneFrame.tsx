export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />

      {/* Phone mockup - desktop */}
      <div className="relative z-10 hidden sm:block">
        <div
          className="w-[375px] h-[812px] bg-black rounded-[3rem] border-[3px] border-gray-700/60 overflow-hidden relative shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(255,255,255,0.03), 0 25px 50px rgba(0,0,0,0.5)' }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-2xl z-50">
            <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-800" />
          </div>

          {/* Content - full height with padding for notch and home bar */}
          <div className="h-full pt-7 pb-5 overflow-hidden">
            {children}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[120px] h-1 bg-gray-700 rounded-full z-50" />
        </div>

        <div className="absolute -bottom-8 left-4 right-4 h-12 bg-gradient-to-b from-gray-800/10 to-transparent rounded-full blur-xl" />
      </div>

      {/* Mobile viewport */}
      <div className="sm:hidden w-full max-w-[430px] h-[100dvh] overflow-hidden relative z-10">
        {children}
      </div>
    </div>
  );
}
