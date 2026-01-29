import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import emailService from '../services/emailService';
import './MarketingLanding.css';

interface LeadFormState {
  name: string;
  email: string;
  company: string;
}

const initialFormState: LeadFormState = {
  name: '',
  email: '',
  company: '',
};

export const MarketingLanding: React.FC = () => {
  const [formState, setFormState] = useState<LeadFormState>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'success' | 'error' | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.email || !formState.name) {
      setStatusType('error');
      setStatusMessage('Preencha nome e email para receber o acesso.');
      return;
    }

    try {
      setIsSubmitting(true);
      setStatusMessage(null);
      setStatusType(null);

      await emailService.sendWelcomeEmail(formState.email, formState.name);

      setStatusType('success');
      setStatusMessage('Tudo certo! Enviamos um email com o link de boas-vindas. Confira sua caixa de entrada.');
      setFormState(initialFormState);
    } catch (error) {
      console.error('Falha ao enviar email de boas-vindas', error);
      setStatusType('error');
      setStatusMessage('Não foi possível enviar o email agora. Tente novamente em instantes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="marketing-landing">
      <header className="hero">
        <div className="hero__content">
          <span className="hero__tag">Plataforma SaaS para engenharia e construção</span>
          <h1>Orquestre tarefas, workflows inteligentes e analytics em uma única plataforma.</h1>
          <p>
            O Arxis centraliza operações de obra, automatiza aprovações e entrega indicadores preditivos em tempo real.
            Reduza atrasos, elimine planilhas paralelas e conecte toda a cadeia de projetos em minutos.
          </p>
          <div className="hero__actions">
            <a className="cta" href="#plans">Ver planos</a>
            <a className="cta cta--outline" href="#demo">Receber link de boas-vindas</a>
          </div>
          <div className="hero__social-proof">
            <span>Confiança de squads de engenharia de todo o Brasil</span>
            <div className="hero__avatars">
              <div className="avatar" aria-hidden="true"></div>
              <div className="avatar" aria-hidden="true"></div>
              <div className="avatar" aria-hidden="true"></div>
              <div className="avatar" aria-hidden="true"></div>
            </div>
          </div>
        </div>
        <div className="hero__mockup" aria-hidden="true">
          <div className="mockup__window">
            <div className="mockup__bar">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div className="mockup__body">
              <div className="mockup__column">
                <h4>Workflow inteligente</h4>
                <ul>
                  <li>Registro automático</li>
                  <li>Aprovação multi-nível</li>
                  <li>Execução em campo</li>
                  <li>Insights preditivos</li>
                </ul>
              </div>
              <div className="mockup__column mockup__column--board">
                <span className="badge badge--warning">Sprint atual</span>
                <div className="mockup__card">
                  <strong>Revisar memorial descritivo</strong>
                  <p>Squad PMO • Conclusão prevista em 2d</p>
                </div>
                <div className="mockup__card">
                  <strong>Gerar dashboard stakeholders</strong>
                  <p>Analytics • Status: Em andamento</p>
                </div>
                <div className="mockup__card">
                  <strong>Sincronizar telemetria</strong>
                  <p>IoT • Integração concluída</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="metrics" id="metricas">
        <div className="metric">
          <span className="metric__value">25%</span>
          <span className="metric__label">redução média no ciclo de tarefas</span>
        </div>
        <div className="metric">
          <span className="metric__value">+38%</span>
          <span className="metric__label">de visibilidade financeira em tempo real</span>
        </div>
        <div className="metric">
          <span className="metric__value">12h</span>
          <span className="metric__label">economizadas por squad toda semana</span>
        </div>
      </section>

      <section className="features" id="recursos">
        <h2>Por que times de engenharia escolhem o Arxis</h2>
        <div className="features__grid">
          <article className="feature-card">
            <h3>Orquestração completa</h3>
            <p>Planeje, priorize e monitore todas as frentes em um board visual com automações inteligentes.</p>
            <ul>
              <li>KPI ao vivo e alertas preditivos</li>
              <li>Workflows com SLA e checklists</li>
              <li>Integração nativa com ERP e BIM</li>
            </ul>
          </article>
          <article className="feature-card">
            <h3>Field e stakeholders conectados</h3>
            <p>Apps offline, registro de diário de obra e portais externos em um único fluxo.</p>
            <ul>
              <li>Compartilhamento seguro com parceiros</li>
              <li>Templates de comunicação automática</li>
              <li>Controle granular de permissões</li>
            </ul>
          </article>
          <article className="feature-card">
            <h3>Analytics de 360º</h3>
            <p>Dashboards prontos e camada de dados aberta para BI e inteligência preditiva.</p>
            <ul>
              <li>Projeções financeiras e burn down</li>
              <li>Sensores IoT integrados</li>
              <li>Modelo de maturidade operacional</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="use-cases" id="casos">
        <div className="use-cases__content">
          <h2>Implementação guiada e onboarding em 30 dias</h2>
          <p>
            Nossa equipe acompanha seu squad desde o discovery até o roll-out completo. Disponibilizamos templates prontos, conectores com TOTVS e Power BI, e especialistas para acelerar adoção e governança.
          </p>
          <ul>
            <li>Playbook de rollout por capítulo PMBOK</li>
            <li>Workspace para squads, PMO e diretoria</li>
            <li>Trilha de capacitação com certificação</li>
          </ul>
          <Link className="text-link" to="/login">Já é cliente? Acesse a plataforma</Link>
        </div>
        <div className="use-cases__media" aria-hidden="true">
          <div className="media-card">
            <span className="badge badge--success">Case destaque</span>
            <h4>Construtora Atlas</h4>
            <p>Redução de 32% no ciclo de aprovação financeira e D+1 de visibilidade em analytics.</p>
            <div className="media-card__meta">
              <span>+180 usuários onboard</span>
              <span>6 integrações ERP</span>
            </div>
          </div>
        </div>
      </section>

      <section className="plans" id="plans">
        <h2>Planos flexíveis para cada estágio da sua operação</h2>
        <div className="plans__grid">
          <article className="plan-card">
            <span className="badge badge--neutral">Essencial</span>
            <h3>R$ 1.290/mês</h3>
            <p>Ideal para squads iniciando a digitalização da operação.</p>
            <ul>
              <li>Até 50 usuários ativos</li>
              <li>Board de tarefas + workflows padrão</li>
              <li>Integração ERP unidirecional</li>
              <li>Suporte em horário comercial</li>
            </ul>
            <a className="cta cta--ghost" href="#demo">Começar agora</a>
          </article>

          <article className="plan-card plan-card--highlight">
            <span className="badge badge--warning">Growth</span>
            <h3>R$ 2.990/mês</h3>
            <p>Para operações em expansão buscando automações personalizadas.</p>
            <ul>
              <li>Até 150 usuários ativos</li>
              <li>API aberta e integrações bidirecionais</li>
              <li>Analytics avançados e projeções</li>
              <li>Customer Success dedicado 12x5</li>
            </ul>
            <a className="cta" href="#demo">Agendar demonstração</a>
          </article>

          <article className="plan-card">
            <span className="badge badge--success">Enterprise</span>
            <h3>Sob consulta</h3>
            <p>Quando a operação exige governança corporativa e escala.</p>
            <ul>
              <li>Usuários ilimitados e ambientes dedicados</li>
              <li>IA preditiva customizada</li>
              <li>SSO, SLA 99,9% e suporte 24/7</li>
              <li>Consultoria de rollout e migração</li>
            </ul>
            <a className="cta cta--ghost" href="#demo">Falar com vendas</a>
          </article>
        </div>
      </section>

      <section className="demo" id="demo">
        <div className="demo__content">
          <h2>Receba o link de boas-vindas e explore o Arxis agora mesmo</h2>
          <p>
            Preencha seus dados e enviamos um email com acesso à experiência guiada, incluindo board de tarefas reais,
            workflows e dashboards preconfigurados.
          </p>
          <ul>
            <li>Ambiente demo com dados reais de obra</li>
            <li>Tour interativo + checklist de onboarding</li>
            <li>Suporte humano para dúvidas durante o trial</li>
          </ul>
        </div>

        <form className="demo__form" onSubmit={handleSubmit}>
          <div className="form__field">
            <label htmlFor="name">Nome completo</label>
            <input
              id="name"
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Maria Souza"
              required
            />
          </div>
          <div className="form__field">
            <label htmlFor="email">Email corporativo</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formState.email}
              onChange={handleChange}
              placeholder="seuemail@empresa.com"
              required
            />
          </div>
          <div className="form__field">
            <label htmlFor="company">Empresa</label>
            <input
              id="company"
              name="company"
              value={formState.company}
              onChange={handleChange}
              placeholder="Construtora Atlas"
            />
          </div>
          <button type="submit" className="cta" disabled={isSubmitting}>
            {isSubmitting ? 'Enviando...' : 'Quero meu acesso'}
          </button>
          {statusMessage ? (
            <p className={`form__status form__status--${statusType}`}>{statusMessage}</p>
          ) : null}
          <span className="form__disclaimer">
            Ao enviar, você concorda em receber comunicações do Arxis. Cancelamento a qualquer momento.
          </span>
        </form>
      </section>

      <footer className="footer">
        <div>
          <strong>Arxis</strong>
          <p>Plataforma operacional para engenharia e construção.</p>
        </div>
        <div className="footer__links">
          <a href="#recursos">Recursos</a>
          <a href="#plans">Planos</a>
          <a href="#demo">Demo guiada</a>
        </div>
        <div className="footer__cta">
          <a className="cta cta--outline" href="#demo">Receber boas-vindas</a>
          <Link className="text-link" to="/login">Área do cliente</Link>
        </div>
      </footer>
    </div>
  );
};

export default MarketingLanding;
