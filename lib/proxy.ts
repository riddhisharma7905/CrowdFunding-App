import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE_NAME = "backit_token";

const PROTECTED_PATHS = ["/dashboard", "/explore", "/create", "/profile/edit"];
const AUTH_PATHS = ["/signin", "/signup"];

export function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;

	const isProtected = PROTECTED_PATHS.some((path) =>
		pathname.startsWith(path),
	);
	
	const isAuthPath = AUTH_PATHS.some((path) => pathname.startsWith(path));

	// If trying to access protected route without token, redirect to signin
	if (isProtected && !token) {
		const signinUrl = new URL("/signin", request.url);
		signinUrl.searchParams.set("callbackUrl", pathname + search);
		return NextResponse.redirect(signinUrl);
	}
	
	// If logged in user tries to visit auth pages, redirect back to dashboard
	if (isAuthPath && token) {
		return NextResponse.redirect(new URL("/dashboard", request.url));
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
		"/signin",
		"/signup"
	],
};
