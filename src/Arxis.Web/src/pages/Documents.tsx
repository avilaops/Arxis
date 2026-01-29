import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Alert,
  Stack,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Delete,
  Image,
  PictureAsPdf,
  InsertDriveFile,
} from '@mui/icons-material';
import documentService, { Document, DocumentCategory } from '../services/documentService';

const categoryLabels: Record<DocumentCategory, string> = {
  [DocumentCategory.Drawing]: 'Plantas',
  [DocumentCategory.Specification]: 'Especificações',
  [DocumentCategory.Contract]: 'Contratos',
  [DocumentCategory.Invoice]: 'Notas Fiscais',
  [DocumentCategory.Photo]: 'Fotos',
  [DocumentCategory.Report]: 'Relatórios',
  [DocumentCategory.Manual]: 'Manuais',
  [DocumentCategory.Certificate]: 'Certificados',
  [DocumentCategory.Permit]: 'Licenças',
  [DocumentCategory.Schedule]: 'Cronogramas',
  [DocumentCategory.Budget]: 'Orçamentos',
  [DocumentCategory.Email]: 'E-mails',
  [DocumentCategory.Other]: 'Outros',
};

const getFileIcon = (extension: string) => {
  const ext = extension.toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return <Image />;
  if (ext === '.pdf') return <PictureAsPdf />;
  return <InsertDriveFile />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

interface DocumentsProps {
  projectId?: string;
}

const Documents: React.FC<DocumentsProps> = ({ projectId }) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | ''>('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>(DocumentCategory.Other);
  const [uploadDescription, setUploadDescription] = useState('');

  useEffect(() => {
    if (projectId) {
      loadDocuments();
    }
  }, [projectId, selectedCategory]);

  const loadDocuments = async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const category = selectedCategory === '' ? undefined : selectedCategory;
      const response = await documentService.getProjectDocuments(projectId, category);
      setDocuments(response);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar documentos');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !projectId) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      await documentService.uploadDocument(
        projectId,
        selectedFile,
        uploadCategory,
        uploadDescription || undefined
      );

      setUploadDialogOpen(false);
      setSelectedFile(null);
      setUploadDescription('');
      setUploadCategory(DocumentCategory.Other);
      loadDocuments();
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload');
      console.error('Error uploading document:', err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      const blob = await documentService.downloadDocument(doc.id);
      const url = window.URL.createObjectURL(blob as Blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.originalFileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Erro ao baixar arquivo');
      console.error('Error downloading document:', err);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Tem certeza que deseja arquivar este documento?')) return;

    try {
      await documentService.deleteDocument(docId, false);
      loadDocuments();
    } catch (err: any) {
      setError('Erro ao deletar documento');
      console.error('Error deleting document:', err);
    }
  };

  if (!projectId) {
    return (
      <Box p={3}>
        <Alert severity="info">Selecione um projeto para ver seus documentos</Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Documentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<CloudUpload />}
          onClick={() => setUploadDialogOpen(true)}
        >
          Upload Documento
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Category Filter */}
      <Box mb={3}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Categoria</InputLabel>
          <Select
            value={selectedCategory}
            label="Categoria"
            onChange={(e) => setSelectedCategory(e.target.value as DocumentCategory | '')}
          >
            <MenuItem value="">Todas</MenuItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <MenuItem key={key} value={parseInt(key)}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <LinearProgress />
      ) : documents.length === 0 ? (
        <Alert severity="info">Nenhum documento encontrado</Alert>
      ) : (
        <Grid container spacing={2}>
          {documents.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    {getFileIcon(doc.fileExtension)}
                    <Box flex={1}>
                      <Typography variant="subtitle1" noWrap title={doc.originalFileName}>
                        {doc.originalFileName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(doc.fileSizeBytes)}
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    label={categoryLabels[doc.category]}
                    size="small"
                    sx={{ mt: 1 }}
                  />

                  {doc.description && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      {doc.description}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                    Enviado por: {doc.uploadedByUser?.firstName} {doc.uploadedByUser?.lastName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => handleDownload(doc)} title="Baixar">
                    <Download />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(doc.id)} title="Arquivar">
                    <Delete />
                  </IconButton>
                  {doc.downloadCount > 0 && (
                    <Typography variant="caption" ml="auto">
                      {doc.downloadCount} downloads
                    </Typography>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Documento</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUpload />}
              fullWidth
            >
              {selectedFile ? selectedFile.name : 'Selecionar Arquivo'}
              <input
                type="file"
                hidden
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </Button>

            {selectedFile && (
              <Typography variant="caption" color="text.secondary">
                Tamanho: {formatFileSize(selectedFile.size)}
              </Typography>
            )}

            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={uploadCategory}
                label="Categoria"
                onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
              >
                {Object.entries(categoryLabels).map(([key, label]) => (
                  <MenuItem key={key} value={parseInt(key)}>
                    {label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Descrição (opcional)"
              multiline
              rows={3}
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              fullWidth
            />

            {uploading && <LinearProgress variant="determinate" value={uploadProgress} />}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)} disabled={uploading}>
            Cancelar
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Enviando...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Documents;
