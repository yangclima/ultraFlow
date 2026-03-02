'use client';

import type { StatusGetResponse } from '@/contracts/api/v1/status';
import { useQuery } from '@tanstack/react-query';

async function fetchStatus(): Promise<StatusGetResponse> {
  const response = await fetch('/api/v1/status');
  const data = await response.json();
  return data;
}

function UpdatedAt() {
  const { data, isLoading } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: 2000,
  });

  if (isLoading || !data) {
    return <p>Loading...</p>;
  }

  const updatedAt = new Date(data.updated_at).toLocaleString('pt-BR');

  return (
    <div>
      <span>Atualizado em: </span>
      <strong>{updatedAt}</strong>
    </div>
  );
}

function DatabaseStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  });

  if (isLoading) {
    return <p>Loading...</p>;
  }

  const database = data?.dependencies.database;

  const databaseVersion = database?.version;
  const maxConnections = database?.max_connections;
  const openedConnections = database?.opened_connections;

  return (
    <div>
      <div>
        <span>Versão: </span>
        <strong>{databaseVersion}</strong>
      </div>

      <div>
        <span>Conexões abertas: </span>
        <strong>{openedConnections}</strong>
      </div>

      <div>
        <span>Máximo de conexões: </span>
        <strong>{maxConnections}</strong>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <h2>Database</h2>
      <DatabaseStatus />
    </>
  );
}
