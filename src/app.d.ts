/// <reference types="lucia" />
// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Locals {
			auth: import('lucia').AuthRequest;
			user: import('lucia').User | null;
			session: import('lucia').Session | null;
		}
	}
}

// Lucia type declarations
declare namespace Lucia {
	type Auth = import('./lib/server/lucia').Auth;
	type DatabaseUserAttributes = {
		email: string;
	};
	type DatabaseSessionAttributes = {};
}

export {};
