import type { DefaultSession, NextAuthConfig } from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import type { UserRole, UserStatus } from "~/generated/prisma/client";

import { db } from "~/server/db";
import { verifyPassword } from "./password";
import { auth } from ".";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}
/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface User {
    role: UserRole;
    status: UserStatus;
  }
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
        },
        password: {
          type: "password",
        },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);

        if (!parsed.success) {
          throw new InvalidCredentialsError();
        }

        const email = parsed.data.email.trim().toLowerCase();

        const user = await db.user.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
            email: true,
            passwordHash: true,
            firstName: true,
            lastName: true,
            role: true,
            status: true,
          },
        });

        if (!user || user.status !== "ACTIVE" || !user.passwordHash) {
          throw new InvalidCredentialsError();
        }

        const passwordValid = await verifyPassword(
          user.passwordHash,
          parsed.data.password,
        );

        if (!passwordValid) {
          throw new InvalidCredentialsError();
        }

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          status: user.status,
        };
      },
    }),
  ],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.role = user.role;
        token.status = user.status;
      }

      return token;
    },
    session: ({ session, token }) => ({
      ...session,
      user: {
        ...session.user,
        id: token.sub!,
        role: token.role as UserRole,
        status: token.status as UserStatus,
      },
    }),
  },
} satisfies NextAuthConfig;
