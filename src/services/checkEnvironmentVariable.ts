export const checkEnvironmentVariable = () => {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error("Variáveis de ambiente não configuradas corretamente.");
    }
}