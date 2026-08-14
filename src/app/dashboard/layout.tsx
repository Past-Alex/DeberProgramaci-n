import React from 'react';

// Next.js App Router: Layout protegido
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar o Navegación interna del usuario iría aquí */}
      <main>{children}</main>
    </div>
  );
}
