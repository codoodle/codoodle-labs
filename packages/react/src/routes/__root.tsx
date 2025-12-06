import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

const RootLayout = () => (
  <>
    <div className="min-h-dvh grid grid-cols-1 grid-rows-[auto_1fr]">
      <div className="bg-background border-b border-separator row-[1/2] sticky top-0 z-20">
        <div className="mx-auto max-lg:max-w-2xl max-lg:border-x max-sm:border-x-0 border-separator">
          <div className="p-3 flex items-center gap-4">
            <div>
              <Link to="/" aria-label="홈으로 이동">
                <img
                  alt="Logo"
                  aria-hidden="true"
                  width="24"
                  height="24"
                  className="dark:invert"
                  src="/images/codoodle.png"
                />
                <span className="sr-only">Codoodle</span>
              </Link>
            </div>
            <nav className="ml-auto flex items-center gap-4 text-sm"></nav>
          </div>
        </div>
      </div>
      <div className="self-stretch grid justify-center grid-cols-1 grid-rows-1 lg:grid-cols-[2.5rem_minmax(0,var(--breakpoint-xl))_2.5rem] row-[2/3]">
        <div className="row-[1/2] lg:col-[2/3] border-x max-sm:border-x-0 border-separator">
          <div className="mx-auto max-lg:max-w-2xl p-8">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
    <TanStackRouterDevtools />
  </>
);

export const Route = createRootRoute({ component: RootLayout });
