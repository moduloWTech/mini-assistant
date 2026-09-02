export const erroAgente = (error:unknown, agent: string) => {
    console.error(`Erro no ${agent}:`, error);
}