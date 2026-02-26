'use client';

import { useQuery } from '@tanstack/react-query';

async function fetchStatus() {
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

  return isLoading ? <p>Loading...</p> : <p>Updated at: {updatedAt}</p>;
}

function DatabaseStatus() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['status'],
    queryFn: fetchStatus,
    refetchInterval: 2000,
    refetchIntervalInBackground: false,
  });

  if (isLoading) return <p>Loading...</p>;
  if (isError || !data?.dependencies?.database)
    return <p>Erro ao carregar status do banco.</p>;

  const database = data.dependencies.database;

  const databaseVersion = database.version;
  const maxConnections = database.max_connections;
  const openedConnections = database.opened_connections;

  return (
    <div>
      <h2>Database Status</h2>

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
