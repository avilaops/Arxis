import { useEffect, useState } from 'react';
import { Project, ProjectStatus, projectService } from '../services/projectService';
import './ProjectList.css';

const ProjectList = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await projectService.getAll();
      setProjects(data);
      setError(null);
    } catch (err) {
      setError('Erro ao carregar projetos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: ProjectStatus): string => {
    const labels = {
      [ProjectStatus.Planning]: 'Planejamento',
      [ProjectStatus.InProgress]: 'Em Andamento',
      [ProjectStatus.OnHold]: 'Pausado',
      [ProjectStatus.Completed]: 'Concluído',
      [ProjectStatus.Archived]: 'Arquivado',
      [ProjectStatus.Cancelled]: 'Cancelado',
    };
    return labels[status] || 'Desconhecido';
  };

  const getStatusClass = (status: ProjectStatus): string => {
    const classes = {
      [ProjectStatus.Planning]: 'status-planning',
      [ProjectStatus.InProgress]: 'status-in-progress',
      [ProjectStatus.OnHold]: 'status-on-hold',
      [ProjectStatus.Completed]: 'status-completed',
      [ProjectStatus.Archived]: 'status-archived',
      [ProjectStatus.Cancelled]: 'status-cancelled',
    };
    return classes[status] || '';
  };

  if (loading) {
    return <div className="project-list-loading">Carregando projetos...</div>;
  }

  if (error) {
    return (
      <div className="project-list-error">
        <p>{error}</p>
        <button onClick={loadProjects}>Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="project-list">
      <div className="project-list-header">
        <h2>Projetos</h2>
        <button className="btn-primary">+ Novo Projeto</button>
      </div>

      {projects.length === 0 ? (
        <div className="project-list-empty">
          <p>Nenhum projeto encontrado</p>
          <button className="btn-primary">Criar primeiro projeto</button>
        </div>
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-card-header">
                <h3>{project.name}</h3>
                <span className={`project-status ${getStatusClass(project.status)}`}>
                  {getStatusLabel(project.status)}
                </span>
              </div>
              
              {project.description && (
                <p className="project-description">{project.description}</p>
              )}

              <div className="project-details">
                {project.client && (
                  <div className="project-detail">
                    <span className="label">Cliente:</span>
                    <span className="value">{project.client}</span>
                  </div>
                )}
                
                {project.city && (
                  <div className="project-detail">
                    <span className="label">Localização:</span>
                    <span className="value">
                      {project.city}{project.state ? `, ${project.state}` : ''}
                    </span>
                  </div>
                )}

                {project.totalBudget && (
                  <div className="project-detail">
                    <span className="label">Orçamento:</span>
                    <span className="value">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: project.currency || 'BRL',
                      }).format(project.totalBudget)}
                    </span>
                  </div>
                )}
              </div>

              {project.tags && project.tags.length > 0 && (
                <div className="project-tags">
                  {project.tags.map((tag, index) => (
                    <span key={index} className="tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="project-card-footer">
                <button className="btn-secondary">Ver detalhes</button>
                <button className="btn-secondary">Editar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectList;
