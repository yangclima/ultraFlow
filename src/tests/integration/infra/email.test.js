import email from '@/infra/email';
import orchestrator from '@/tests/orchestrator';
import { describe, expect, test, beforeAll } from 'vitest';

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});

describe('infra/email.js', () => {
  test('send()', async () => {
    await orchestrator.deleteAllEmails();

    await email.send({
      from: 'UltraFlow <contato@ultraflow.com.br>',
      to: 'user@email.com',
      subject: 'Teste de assunto',
      text: 'Teste de corpo.',
    });

    await email.send({
      from: 'UltraFlow <contato@ultraflow.com.br>',
      to: 'user@email.com',
      subject: 'Último email enviado',
      text: 'Corpo do último email.',
    });

    const lastEmail = await orchestrator.getLastEmail();
    expect(lastEmail.sender).toBe('<contato@ultraflow.com.br>');
    expect(lastEmail.recipients[0]).toBe('<user@email.com>');
    expect(lastEmail.subject).toBe('Último email enviado');
    expect(lastEmail.text).toBe('Corpo do último email.\r\n');
  });
});
