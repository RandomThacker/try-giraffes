export function IllustrationPanel() {
  return (
    <aside className="relative hidden min-h-svh min-w-0 overflow-hidden bg-[#666CFF] lg:block">
      {/* Purple base floor */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/auth-base.svg"
        alt=""
        width={861}
        height={301}
        className="pointer-events-none absolute bottom-[-2%] left-1/2 z-[1] h-auto w-[120%] max-w-none -translate-x-1/2 select-none"
      />

      {/* Character + cards */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/auth-illustration.svg"
        alt=""
        width={616}
        height={671}
        className="pointer-events-none absolute inset-0 z-[2] h-full w-full object-contain object-center select-none"
      />

      {/* White logo lockup */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo-horizontal-light.svg"
        alt="Try Giraffes"
        width={209}
        height={30}
        className="absolute left-8 top-7 z-[3] h-9 w-auto select-none"
      />
    </aside>
  );
}
