'use client';

import type { StatusResponse } from '@/contracts/api/v1/status';
import { useQuery } from '@tanstack/react-query';

async function fetchStatus(): Promise<StatusResponse> {
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

  const updatedAt = new Date(data?.updated_at).toLocaleString('pt-BR');

  return isLoading ? <p>Loading...</p> : <p>Atualizado em: {updatedAt}</p>;
}

function DatabaseStatus() {
  const { data, isLoading } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  });

  const database = data?.dependencies.database;

  const databaseVersion = database?.version;
  const maxConnections = database?.max_connections;
  const openedConnections = database?.opened_connections;

  return (
    <div>
      <h2>Database</h2>

      {isLoading && !data ? (
        <p>Loading...</p>
      ) : (
        <>
          <div>
            <span>Versão:</span>
            <strong>{databaseVersion}</strong>
          </div>

          <div>
            <span>Conexões abertas:</span>
            <strong>{openedConnections}</strong>
          </div>

          <div>
            <span>Máximo de conexões:</span>
            <strong>{maxConnections}</strong>
          </div>
        </>
      )}
    </div>
  );
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdatedAt />
      <DatabaseStatus />
    </>
  );
}
