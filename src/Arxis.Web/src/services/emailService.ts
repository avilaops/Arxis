import axios from 'axios';

const API_BASE_URL = 'http://localhost:5136/api';

// Email API Service
// Inspired by avx-cell email protocols
export const emailService = {
  /**
   * Send a simple email
   */
  async sendEmail(emailData: {
    to: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
    cc?: string[];
    bcc?: string[];
  }) {
    const response = await axios.post(`${API_BASE_URL}/email/send`, emailData);
    return response.data;
  },

  /**
   * Send templated email
   */
  async sendTemplatedEmail(templateName: string, to: string, variables: Record<string, string>) {
    const response = await axios.post(`${API_BASE_URL}/email/send-template`, {
      templateName,
      to,
      variables,
    });
    return response.data;
  },

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, userName: string) {
    const response = await axios.post(`${API_BASE_URL}/email/send-welcome`, {
      to,
      userName,
    });
    return response.data;
  },

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, userName: string, resetLink: string) {
    const response = await axios.post(`${API_BASE_URL}/email/send-password-reset`, {
      to,
      userName,
      resetLink,
    });
    return response.data;
  },

  /**
   * Send notification email
   */
  async sendNotificationEmail(to: string, title: string, message: string, details?: string) {
    const response = await axios.post(`${API_BASE_URL}/email/send-notification`, {
      to,
      title,
      message,
      details,
    });
    return response.data;
  },

  /**
   * Send issue assignment notification
   */
  async sendIssueAssignmentEmail(to: string, userName: string, issueTitle: string, projectName: string) {
    const response = await axios.post(`${API_BASE_URL}/email/send-issue-assignment`, {
      to,
      userName,
      issueTitle,
      projectName,
    });
    return response.data;
  },

  /**
   * Send task deadline reminder
   */
  async sendTaskDeadlineEmail(to: string, userName: string, taskTitle: string, deadline: Date) {
    const response = await axios.post(`${API_BASE_URL}/email/send-task-deadline`, {
      to,
      userName,
      taskTitle,
      deadline: deadline.toISOString(),
    });
    return response.data;
  },

  /**
   * Send batch emails
   */
  async sendBatchEmails(emails: Array<{
    to: string[];
    subject: string;
    body: string;
    isHtml?: boolean;
  }>) {
    const response = await axios.post(`${API_BASE_URL}/email/send-batch`, emails);
    return response.data;
  },

  /**
   * Validate email address
   */
  async validateEmail(email: string): Promise<{ email: string; isValid: boolean }> {
    const response = await axios.get(`${API_BASE_URL}/email/validate`, {
      params: { email },
    });
    return response.data;
  },
};

// React Hook Examples
export function useEmailService() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sendWelcome = async (email: string, userName: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await emailService.sendWelcomeEmail(email, userName);
      return result;
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar email');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendIssueNotification = async (
    email: string,
    userName: string,
    issueTitle: string,
    projectName: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await emailService.sendIssueAssignmentEmail(email, userName, issueTitle, projectName);
      return result;
    } catch (err: any) {
      setError(err.message || 'Falha ao enviar notificação');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendWelcome,
    sendIssueNotification,
  };
}

// Example Component
import React, { useState } from 'react';
import { Button, TextField, Alert, CircularProgress } from '@mui/material';

export function EmailTestComponent() {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const { loading, error, sendWelcome } = useEmailService();
  const [success, setSuccess] = useState(false);

  const handleSendWelcome = async () => {
    try {
      await sendWelcome(email, userName);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px' }}>
      <h2>📧 Teste de Email</h2>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>Email enviado com sucesso!</Alert>}

      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        margin="normal"
        type="email"
      />

      <TextField
        fullWidth
        label="Nome do Usuário"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSendWelcome}
        disabled={loading || !email || !userName}
        sx={{ mt: 2 }}
        fullWidth
      >
        {loading ? <CircularProgress size={24} /> : 'Enviar Email de Boas-vindas'}
      </Button>
    </div>
  );
}

export default emailService;
