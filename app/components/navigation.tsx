import { Link, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { Link as RemixLink } from "@remix-run/react";

export function Navigation() {
    return (
      <Navbar>
        <NavbarBrand>
          <Link
            as={RemixLink}
            to="/"
            className="font-bold text-inherit"
            color="foreground"
          >
            Remix Auth TOTP
          </Link>
        </NavbarBrand>
        <NavbarContent justify="end">
          <NavbarItem></NavbarItem>
        </NavbarContent>
      </Navbar>
    );
  }
  