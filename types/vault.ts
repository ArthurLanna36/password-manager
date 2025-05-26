// types/vault.ts
export interface PasswordEntry {
  id: string;
  serviceName: string;
  username?: string;
  passwordEncrypted: string; // A senha DEVE ser armazenada criptografada
  createdAt: string;
  updatedAt: string;
}

// Tipo para os dados do formulário ao criar/editar uma senha
// A senha estará em texto plano aqui, antes de ser criptografada para armazenamento.
export type PasswordFormData = {
  serviceName: string;
  username?: string;
  passwordPlain: string;
};

// Para edição, podemos querer o ID também
export type EditPasswordPayload = PasswordFormData & {
  id: string;
};
