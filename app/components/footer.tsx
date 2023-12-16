export function Footer() {
    return (
      <footer className="flex min-h-[80px] items-center justify-center">
        <div className="flex items-center">
          <p className="flex items-center whitespace-nowrap text-center text-sm font-medium text-gray-600">
            Source code is available on&nbsp;
            <a
              href="https://github.com/dev-xo/remix-auth-totp"
              target="_blank"
              rel="noopener noreferrer"
              className="clickable flex items-center font-semibold text-gray-800 transition duration-200 hover:-translate-y-1">
              Github
            </a>
          </p>
        </div>
      </footer>
    )
  }
  