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

export default emailService;
