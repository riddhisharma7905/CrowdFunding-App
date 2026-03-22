import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE_NAME = "backit_token";

const PROTECTED_PATHS = ["/dashboard", "/explore", "/create", "/profile/edit"];

export function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;
	const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

	const isProtected = PROTECTED_PATHS.some((path) =>
		pathname.startsWith(path),
	);

	// If trying to access protected route without token, redirect to signin
	if (isProtected && !token) {
		const signinUrl = new URL("/signin", request.url);
		signinUrl.searchParams.set("from", pathname);
		return NextResponse.redirect(signinUrl);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/dashboard",
		"/dashboard/:path*",
		"/explore",
		"/explore/:path*",
		"/create",
		"/create/:path*",
		"/profile/edit",
	],
};
