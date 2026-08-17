import { useState, useEffect } from 'react';
import { HabitTemplate } from '../types';

export function useTemplates() {
  const [templates, setTemplates] = useState<HabitTemplate[]>([]);

  useEffect(() => {
    const fetchTemplates = () => {
      const saved = localStorage.getItem('aesthetic-templates');
      if (saved) {
        try {
          setTemplates(JSON.parse(saved));
        } catch (e) {
          setTemplates([]);
        }
      } else {
        // Default templates
        setTemplates([
          { id: '1', name: 'Meditar 10 min', color: 'violet', description: 'Encuentra tu paz interior.' },
          { id: '2', name: 'Beber 2L de agua', color: 'sky', description: 'Mantente hidratado durante el día.' },
          { id: '3', name: 'Leer 20 páginas', color: 'amber', description: 'Alimenta tu mente.' }
        ]);
      }
    };

    fetchTemplates();

    // Listen to storage changes to sync across tabs (like between coach and student view)
    const handleStorageChange = () => {
      fetchTemplates();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const addTemplate = (template: HabitTemplate) => {
    const newTemplates = [...templates, template];
    setTemplates(newTemplates);
    localStorage.setItem('aesthetic-templates', JSON.stringify(newTemplates));
  };

  const deleteTemplate = (id: string) => {
    const newTemplates = templates.filter(t => t.id !== id);
    setTemplates(newTemplates);
    localStorage.setItem('aesthetic-templates', JSON.stringify(newTemplates));
  };

  return {
    templates,
    addTemplate,
    deleteTemplate
  };
}
