export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-black to-black" />

      {/* Phone mockup - only visible on larger screens */}
      <div className="relative z-10 hidden sm:block">
        {/* Phone body */}
        <div
          className="w-[375px] h-[812px] bg-gray-950 rounded-[3rem] border-[3px] border-gray-700/60 overflow-hidden relative shadow-2xl"
          style={{ boxShadow: '0 0 60px rgba(255,255,255,0.03), 0 25px 50px rgba(0,0,0,0.5)' }}
        >
          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-black rounded-b-2xl z-50 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gray-800 mr-8" />
          </div>

          {/* Status bar */}
          <div className="relative z-40 flex justify-between items-center px-6 pt-3 text-[10px] text-gray-500 font-medium">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-3.5 h-2 border border-gray-600 rounded-sm relative">
                <div className="absolute inset-0.5 bg-gray-500 rounded-sm" style={{ width: '70%' }} />
              </div>
            </div>
          </div>

          {/* Screen content */}
          <div className="h-[calc(100%-28px)] overflow-y-auto overflow-x-hidden no-scrollbar">
            {children}
          </div>

          {/* Home indicator */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[120px] h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Reflection */}
        <div
          className="absolute -bottom-8 left-4 right-4 h-12 bg-gradient-to-b from-gray-800/10 to-transparent rounded-full blur-xl"
        />
      </div>

      {/* Mobile viewport - full width on small screens */}
      <div className="sm:hidden w-full max-w-[430px] h-[100dvh] overflow-y-auto overflow-x-hidden no-scrollbar relative z-10">
        {children}
      </div>
    </div>
  );
}
