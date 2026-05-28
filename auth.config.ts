import CredentialProvider from "next-auth/providers/credentials";

export default {
    providers: [
        CredentialProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await Promise.resolve({
                    id: 1,
                    email: credentials.email,
                    name: 'John Doe',
                    role: 'USER',
                    access_token: 'fake_access_token',
                    employee_id: 123
                })

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    access_token: user.access_token,
                    employee_id: user.employee_id
                }
            },
        }),
    ]
}