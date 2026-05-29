import CredentialProvider from "next-auth/providers/credentials";
import { authService } from "@/lib/services/AuthService";
import { loginSchema } from "@/lib/types/auth";

export default {
    providers: [
        CredentialProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                const validatedFields = loginSchema.safeParse(credentials);

                if (validatedFields.success) {
                    try {
                        const user = await authService.login(validatedFields.data);
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            role: user.role,
                            employee_id: user.employeeId,
                            healthCenterHcode: user.healthCenterHcode
                        }
                    } catch (error) {
                        return null;
                    }
                }

                return null;
            },
        }),
    ]
}