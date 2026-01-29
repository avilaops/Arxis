import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import {
  CheckCircleOutline,
  MonetizationOn,
  PeopleOutline,
  CloudDownload,
  Storefront,
} from '@mui/icons-material'

interface PersonaSpace {
  title: string
  description: string
  highlights: string[]
}

interface ProductOffering {
  id: string
  name: string
  audience: string
  description: string
  valueProps: string[]
  pricingNote: string
  isComingSoon?: boolean
}

interface DownloadAsset {
  id: string
  name: string
  description: string
  downloadUrl?: string
  isAvailable: boolean
}

const userSpaces: PersonaSpace[] = [
  {
    title: 'Painel do Usuário',
    description:
      'Uma área dedicada para gestores, engenheiros e coordenadores acompanharem tarefas, indicadores e atividades do dia a dia.',
    highlights: [
      'Visão unificada de projetos em andamento',
      'Alertas de prazos críticos e pendências pessoais',
      'Aplicativos móveis conectados para campo e escritório',
    ],
  },
  {
    title: 'Comunicação & Colaboração',
    description:
      'Espaço para compartilhar atualizações, anexos e decisões com todo o time do projeto.',
    highlights: [
      'Threads por disciplina, frente e empreendimento',
      'Workflow de aprovações com histórico completo',
      'Integração com ARXIS ChatOps (Teams, Slack e e-mail)',
    ],
  },
]

const financeSpaces: PersonaSpace[] = [
  {
    title: 'Centro Financeiro',
    description:
      'Ambiente consolidado para orçamentos, contratos, requisições e cronograma físico-financeiro.',
    highlights: [
      'Monitoramento de CAPEX vs OPEX por empreendimento',
      'Dashboards de fluxo de caixa previstos e realizados',
      'Integração planejada com ERPs líderes do mercado',
    ],
  },
  {
    title: 'Compliance & Auditoria',
    description:
      'Controles para garantir aderência a normas, garantir rastreabilidade e gerar relatórios de auditoria.',
    highlights: [
      'Registro de trilhas e logs de aprovação',
      'Modelos personalizáveis de relatórios financeiros',
      'Plano de contas alinhado ao ERP corporativo',
    ],
  },
]

const productOfferings: ProductOffering[] = [
  {
    id: 'arxis-platform',
    name: 'ARXIS Platform',
    audience: 'Gestão integrada de obras e portfólios',
    description:
      'Suite principal com dashboards 360º, módulos de obra, controles operacionais e integrações abertas.',
    valueProps: [
      'Base única para cronogramas, RFIs, tarefas e qualidade',
      'KPIs em tempo real com alertas inteligentes',
      'Biblioteca de templates para acelerar implantação',
    ],
    pricingNote: 'Licenciamento SaaS por tenant ou obra ativa',
  },
  {
    id: 'arxis-vr',
    name: 'ARXIS VR',
    audience: 'Imersão virtual e validação colaborativa',
    description:
      'Experiência VR para revisões de projeto, simulações de execução e treinamentos imersivos.',
    valueProps: [
      'Passeios virtuais com contexto BIM e dados vinculados',
      'Marcadores colaborativos para revisar interferências',
      'Suporte a óculos Meta Quest e HTC Vive',
    ],
    pricingNote: 'Add-on por estação VR habilitada (coming soon)',
    isComingSoon: true,
  },
  {
    id: 'arxis-project',
    name: 'ARXIS Project',
    audience: 'Planejamento e controle de cronogramas',
    description:
      'Camada avançada de planejamento com análises 4D, curvas S e simulações de produtividade.',
    valueProps: [
      'Sincronização com MS Project, Primavera P6 e Excel',
      'Modelagem de cenários “e se” e replanejamento guiado',
      'Exportação executiva para diretoria e clientes',
    ],
    pricingNote: 'Complemento para equipes de planejamento e PMOs',
  },
  {
    id: 'arxis-structure',
    name: 'ARXIS Structure',
    audience: 'Gestão de estruturas e monitoramento técnico',
    description:
      'Módulo especializado em monitoramento de estruturas, inspeções técnicas e manutenção preventiva.',
    valueProps: [
      'Dashboards de instrumentação estruturais e alarmes',
      'Registro de inspeções conforme normas ABNT/NBR',
      'Integração com sensores IoT e relatórios automatizados',
    ],
    pricingNote: 'Pacote premium para estruturas críticas e infraestrutura',
    isComingSoon: true,
  },
]

const downloadAssets: DownloadAsset[] = [
  {
    id: 'arxis-desktop',
    name: 'ARXIS Desktop',
    description: 'Instalador principal da plataforma para Windows/macOS com acesso offline.',
    downloadUrl: undefined,
    isAvailable: false,
  },
  {
    id: 'arxis-vr-client',
    name: 'ARXIS VR Client',
    description: 'Aplicativo VR com suporte a controllers e sincronização em tempo real.',
    downloadUrl: undefined,
    isAvailable: false,
  },
  {
    id: 'arxis-project-tools',
    name: 'ARXIS Project Tools',
    description: 'Pacote de conectores para MS Project, Primavera e integrações 4D.',
    downloadUrl: undefined,
    isAvailable: false,
  },
  {
    id: 'arxis-structure-suite',
    name: 'ARXIS Structure Suite',
    description: 'Coleção de apps para inspeções estruturais e relatórios técnicos.',
    downloadUrl: undefined,
    isAvailable: false,
  },
]

const SectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
    {icon}
    <Typography variant="h4" component="h2" fontWeight={600}>
      {title}
    </Typography>
  </Stack>
)

const PersonaGrid = ({
  title,
  spaces,
  icon,
  accent,
}: {
  title: string
  spaces: PersonaSpace[]
  icon: React.ReactNode
  accent: 'primary' | 'secondary'
}) => (
  <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
    <SectionTitle title={title} icon={icon} />
    <Grid container spacing={3}>
      {spaces.map((space) => (
        <Grid item xs={12} md={6} key={space.title}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              height: '100%',
              border: (theme) => `1px solid ${alpha(theme.palette[accent].main, 0.24)}`,
              backgroundColor: (theme) => alpha(theme.palette[accent].main, 0.06),
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {space.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {space.description}
            </Typography>
            <List dense>
              {space.highlights.map((highlight) => (
                <ListItem key={highlight} sx={{ p: 0, mb: 1 }}>
                  <ListItemIcon
                    sx={{
                      minWidth: 32,
                      color: (theme) => theme.palette[accent].main,
                    }}
                  >
                    <CheckCircleOutline fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={highlight} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Paper>
)

const ProductCard = ({ offering }: { offering: ProductOffering }) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderRadius: 4,
      borderColor: offering.isComingSoon ? 'warning.light' : 'divider',
    }}
  >
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          {offering.name}
        </Typography>
        {offering.isComingSoon && <Chip label="Em breve" color="warning" size="small" />}
      </Stack>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {offering.audience}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {offering.description}
      </Typography>
      <List dense>
        {offering.valueProps.map((value) => (
          <ListItem key={value} sx={{ p: 0, mb: 1 }}>
            <ListItemIcon sx={{ minWidth: 32, color: 'primary.main' }}>
              <CheckCircleOutline fontSize="small" />
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={value} />
          </ListItem>
        ))}
      </List>
    </CardContent>
    <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
      <Chip label={offering.pricingNote} variant="outlined" color="primary" />
    </CardActions>
  </Card>
)

const DownloadCard = ({ asset }: { asset: DownloadAsset }) => (
  <Card variant="outlined" sx={{ height: '100%', borderRadius: 3 }}>
    <CardContent>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <CloudDownload color={asset.isAvailable ? 'primary' : 'disabled'} />
        <Box>
          <Typography variant="h6" fontWeight={600}>
            {asset.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {asset.description}
          </Typography>
        </Box>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Button
        variant={asset.isAvailable ? 'contained' : 'outlined'}
        color={asset.isAvailable ? 'primary' : 'inherit'}
        component="a"
        href={asset.downloadUrl ?? '#'}
        target={asset.isAvailable ? '_blank' : undefined}
        rel={asset.isAvailable ? 'noopener noreferrer' : undefined}
        disabled={!asset.isAvailable}
        fullWidth
      >
        {asset.isAvailable ? 'Baixar instalador' : 'Link disponível em breve'}
      </Button>
      {!asset.isAvailable && (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          Atualize este cartão com o link final quando o instalador estiver pronto.
        </Typography>
      )}
    </CardContent>
  </Card>
)

export const Marketplace: React.FC = () => (
  <Box sx={{ backgroundColor: 'background.default', minHeight: '100vh', py: { xs: 6, md: 10 } }}>
    <Container maxWidth="lg">
      <Paper
        elevation={0}
        sx={{
          mb: 6,
          p: { xs: 4, md: 6 },
          borderRadius: 5,
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}0D, ${theme.palette.secondary.main}1A)`,
        }}
      >
        <Stack spacing={3}>
          <Chip label="Lançamento" color="primary" sx={{ alignSelf: 'flex-start' }} />
          <Typography variant="h3" component="h1" fontWeight={700}>
            Marketplace ARXIS
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 720 }}>
            Centralize a gestão das soluções ARXIS, descubra complementos para as suas operações e prepare os
            ambientes de usuários e financeiro para a adoção completa da plataforma.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" color="primary" size="large">
              Solicitar proposta completa
            </Button>
            <Button variant="outlined" color="primary" size="large">
              Agendar demonstração
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Stack spacing={6}>
        <PersonaGrid
          title="Espaços pensados para o usuário"
          icon={<PeopleOutline fontSize="large" color="primary" />}
          spaces={userSpaces}
          accent="primary"
        />

        <PersonaGrid
          title="Espaços financeiros e governança"
          icon={<MonetizationOn fontSize="large" color="primary" />}
          spaces={financeSpaces}
          accent="secondary"
        />

        <Box>
          <SectionTitle icon={<Storefront color="primary" />} title="Pacotes e complementos" />
          <Grid container spacing={3}>
            {productOfferings.map((offering) => (
              <Grid item xs={12} md={6} key={offering.id}>
                <ProductCard offering={offering} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box>
          <SectionTitle icon={<CloudDownload color="primary" />} title="Downloads oficiais" />
          <Grid container spacing={3}>
            {downloadAssets.map((asset) => (
              <Grid item xs={12} md={6} key={asset.id}>
                <DownloadCard asset={asset} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Container>
  </Box>
)

export default Marketplace
