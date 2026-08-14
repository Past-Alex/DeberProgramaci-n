import React from 'react';

// Next.js App Router: Detalle (público, ruta dinámica)
export default function RecursoDetailPage({ params }: { params: { recurso: string, id: string } }) {
  return (
    <div>
      <h1>Detalle del recurso: {params.id}</h1>
    </div>
  );
}
