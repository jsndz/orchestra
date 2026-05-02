
export function Footer() {
  const footerLinks = {
    pages: [
      { label: "All Products", href: "#" },
      { label: "Studio", href: "#" },
      { label: "Clients", href: "#" },

      { label: "Blog", href: "#" },
    ],
    socials: [
      { label: "Facebook", href: "#" },
      { label: "Instagram", href: "#" },
      { label: "Twitter", href: "#" },
      { label: "LinkedIn", href: "#" },
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
    ],
    register: [
      { label: "Sign Up", href: "#" },
      { label: "Login", href: "#" },
      { label: "Forgot Password", href: "#" },
    ],
  };

  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-[#111] to-[#0b0b0b]">
      {/* Background decorative text */}
      <div className="absolute bottom-0 left-0 pointer-events-none opacity-5">
        <div className="text-[20rem] font-bold tracking-tighter leading-none text-white whitespace-nowrap">
           Workflows
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Grid Layout */}
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-5 md:gap-8">
            {/* Brand Column */}
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <a
                  href="#"
                  className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black"
                >
                  <img src="./logo.png" alt="logo" width={200} height={220} />
                </a>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                © 2024 Orchestra. All rights reserved.
              </p>
            </div>

            {/* Pages */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-200 mb-4">
                Pages
              </h3>
              <ul className="space-y-3">
                {footerLinks.pages.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Socials */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-200 mb-4">
                Socials
              </h3>
              <ul className="space-y-3">
                {footerLinks.socials.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-200 mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Register */}
            <div className="flex flex-col">
              <h3 className="text-sm font-semibold text-gray-200 mb-4">
                Register
              </h3>
              <ul className="space-y-3">
                {footerLinks.register.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
