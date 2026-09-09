import nodemailer from 'nodemailer';

export interface EmailCheckinData {
  userName: string;
  userEmail: string;
  financialStatus: 'HEALTHY' | 'WATCH' | 'DANGER';
  healthScore: number;
  scoreDelta?: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  essentialExpenses: number;
  discretionaryExpenses: number;
  monthlyEMI: number;
  freeCash: number;
  freeCashDelta?: number;
  emergencyBuffer: number;
  emergencyBufferMonths: number;
  DTI: number;
  dangerDurationDays: number;
  majorRiskFactors: string[];
  recommendedActions: string[];
  appUrl?: string;
}

export interface EmailSendResult {
  success: boolean;
  emailSent: boolean;
  deliveredVia: 'smtp' | 'audit_log';
  message: string;
  previewHtml?: string;
  messageId?: string;
}

/**
 * Creates nodemailer transport if SMTP credentials are in environment
 */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }
  return null;
}

function formatINRNumber(val: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(val).replace('₹', '₹ ');
}

/**
 * Builds responsive dark luxury HTML template for Elevate Financial Intelligence
 */
export function buildWeeklyCheckinEmailHtml(data: EmailCheckinData): string {
  const isDanger = data.financialStatus === 'DANGER';
  const isWatch = data.financialStatus === 'WATCH';
  const statusColor = isDanger ? '#ef4444' : isWatch ? '#f59e0b' : '#10b981';
  const statusBg = isDanger ? 'rgba(239, 68, 68, 0.15)' : isWatch ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
  const statusBorder = isDanger ? '#dc2626' : isWatch ? '#d97706' : '#059669';
  const statusLabel = isDanger 
    ? `DANGER ZONE · ${data.dangerDurationDays > 0 ? `${data.dangerDurationDays} DAYS` : 'CRITICAL'}` 
    : isWatch 
    ? 'WATCH ZONE · PRUDENCE CAUTION' 
    : 'HEALTHY · STABLE EXPANSION';

  const appUrl = data.appUrl || process.env.APP_URL || 'http://localhost:3000';

  const riskFactorsList = (data.majorRiskFactors || [])
    .map(rf => `<li style="margin-bottom: 8px; color: #cbd5e1; font-size: 13px; line-height: 1.5;">${rf}</li>`)
    .join('');

  const recommendedAction = (data.recommendedActions && data.recommendedActions.length > 0)
    ? data.recommendedActions[0]
    : 'Continue maintaining active automated debt commitments and preserve your liquid cash runway.';

  const scoreDeltaText = data.scoreDelta !== undefined && data.scoreDelta !== 0
    ? ` (${data.scoreDelta > 0 ? `+${data.scoreDelta}` : data.scoreDelta} pts from last snapshot)`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Elevate Financial Intelligence Check-In</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; margin: 0 auto; background-color: #0d121d; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.8);">
    <!-- Header -->
    <tr>
      <td style="padding: 28px 32px; background: linear-gradient(180deg, #111827 0%, #0d121d 100%); border-bottom: 1px solid #1e293b;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <span style="font-size: 18px; font-weight: 800; letter-spacing: 0.15em; color: #ffffff; text-transform: uppercase;">ELEVATE</span>
              <span style="display: block; font-size: 11px; color: #94a3b8; letter-spacing: 0.05em; margin-top: 2px;">Private Wealth & Risk Intelligence</span>
            </td>
            <td align="right">
              <span style="display: inline-block; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; color: ${statusColor}; background: ${statusBg}; border: 1px solid ${statusBorder};">
                ${statusLabel}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Salutation & Summary -->
    <tr>
      <td style="padding: 32px 32px 16px 32px;">
        <p style="font-size: 12px; font-family: monospace; color: #10b981; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 6px 0;">WEEKLY FINANCIAL CHECK-IN</p>
        <h1 style="font-size: 22px; font-weight: 700; color: #ffffff; margin: 0 0 12px 0;">Hi ${data.userName || 'Client'}, here is your telemetry report.</h1>
        <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin: 0;">
          Elevate has audited your Firestore financial profile, loan obligations, and cash flow velocity for the past 7 days.
        </p>
      </td>
    </tr>

    <!-- Core Score Hero Box -->
    <tr>
      <td style="padding: 0 32px 24px 32px;">
        <div style="background-color: #080c14; border: 1px solid #1e293b; border-radius: 12px; padding: 20px; text-align: center;">
          <p style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 6px 0;">FINANCIAL HEALTH SCORE</p>
          <div style="font-size: 44px; font-weight: 800; color: ${statusColor}; letter-spacing: -0.02em;">
            ${data.healthScore} <span style="font-size: 16px; color: #64748b; font-weight: 500;">/ 100</span>
          </div>
          <p style="font-size: 12px; color: #94a3b8; margin: 6px 0 0 0;">
            Status: <strong style="color: ${statusColor};">${data.financialStatus}</strong>${scoreDeltaText}
          </p>
        </div>
      </td>
    </tr>

    <!-- Key Metrics 4-Grid -->
    <tr>
      <td style="padding: 0 32px 24px 32px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td width="48%" style="padding: 12px; background-color: #080c14; border: 1px solid #1e293b; border-radius: 8px;">
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase;">MONTHLY FREE CASH</span>
              <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-top: 4px;">${formatINRNumber(data.freeCash)}</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Surplus after living & EMI</div>
            </td>
            <td width="4%"></td>
            <td width="48%" style="padding: 12px; background-color: #080c14; border: 1px solid #1e293b; border-radius: 8px;">
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase;">DEBT RATIO (DTI)</span>
              <div style="font-size: 16px; font-weight: 700; color: ${data.DTI > 45 ? '#ef4444' : '#f8fafc'}; margin-top: 4px;">${data.DTI}%</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Target benchmark &lt;35%</div>
            </td>
          </tr>
          <tr><td height="10"></td></tr>
          <tr>
            <td width="48%" style="padding: 12px; background-color: #080c14; border: 1px solid #1e293b; border-radius: 8px;">
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase;">EMERGENCY BUFFER</span>
              <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-top: 4px;">${data.emergencyBufferMonths} Months</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${formatINRNumber(data.emergencyBuffer)} reserves</div>
            </td>
            <td width="4%"></td>
            <td width="48%" style="padding: 12px; background-color: #080c14; border: 1px solid #1e293b; border-radius: 8px;">
              <span style="font-size: 10px; color: #64748b; text-transform: uppercase;">MONTHLY OBLIGATIONS</span>
              <div style="font-size: 16px; font-weight: 700; color: #f8fafc; margin-top: 4px;">${formatINRNumber(data.monthlyEMI)}</div>
              <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">Active loan EMIs</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Key Risk Telemetry -->
    <tr>
      <td style="padding: 0 32px 24px 32px;">
        <h3 style="font-size: 13px; font-weight: 700; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 10px 0;">
          Key Risk Telemetry
        </h3>
        <ul style="margin: 0; padding-left: 20px;">
          ${riskFactorsList}
        </ul>
      </td>
    </tr>

    <!-- Single Top Strategic Recommendation -->
    <tr>
      <td style="padding: 0 32px 32px 32px;">
        <div style="background-color: ${isDanger ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)'}; border-left: 4px solid ${statusColor}; padding: 16px; border-radius: 4px 8px 8px 4px;">
          <p style="font-size: 11px; font-weight: 700; color: ${statusColor}; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 6px 0;">
            RECOMMENDED ACTION THIS WEEK
          </p>
          <p style="font-size: 13px; color: #e2e8f0; line-height: 1.5; margin: 0;">
            ${recommendedAction}
          </p>
        </div>
      </td>
    </tr>

    <!-- Call to Action -->
    <tr>
      <td align="center" style="padding: 0 32px 36px 32px;">
        <a href="${appUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 10px; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);">
          Open Elevate Terminal &rarr; Review Cash Flow
        </a>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 24px 32px; background-color: #090d15; border-top: 1px solid #1e293b; text-align: center;">
        <p style="font-size: 11px; color: #64748b; margin: 0 0 4px 0;">
          Elevate Private Wealth Intelligence &bull; Strictly Confidential
        </p>
        <p style="font-size: 10px; color: #475569; margin: 0;">
          Calculations are computed deterministically from verified client records in your encrypted Firestore vault.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Builds Danger Zone Alert HTML Email
 */
export function buildDangerAlertEmailHtml(data: EmailCheckinData): string {
  const appUrl = data.appUrl || process.env.APP_URL || 'http://localhost:3000';
  const riskFactorsList = (data.majorRiskFactors || [])
    .map(rf => `<li style="margin-bottom: 8px; color: #fecaca; font-size: 13px; line-height: 1.5;">${rf}</li>`)
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>CRITICAL ALERT: Elevate Financial Health Warning</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #06090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 620px; margin: 0 auto; background-color: #110c0e; border: 1px solid #7f1d1d; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(239,68,68,0.2);">
    <tr>
      <td style="padding: 24px 32px; background: linear-gradient(180deg, #2d0e12 0%, #180a0c 100%); border-bottom: 1px solid #991b1b;">
        <table width="100%">
          <tr>
            <td>
              <span style="font-size: 18px; font-weight: 800; letter-spacing: 0.15em; color: #f87171;">ELEVATE ALERT</span>
              <span style="display: block; font-size: 11px; color: #fca5a5;">Solvency Risk Warning</span>
            </td>
            <td align="right">
              <span style="padding: 5px 12px; background: rgba(239,68,68,0.25); border: 1px solid #ef4444; border-radius: 20px; color: #fecaca; font-size: 11px; font-weight: 800;">
                DANGER ZONE · ${data.dangerDurationDays > 0 ? `${data.dangerDurationDays} DAYS` : 'CRITICAL'}
              </span>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <tr>
      <td style="padding: 32px 32px 20px 32px;">
        <h2 style="font-size: 20px; color: #ffffff; margin: 0 0 10px 0;">Critical Financial Condition Detected</h2>
        <p style="font-size: 14px; color: #e2e8f0; line-height: 1.6; margin: 0 0 20px 0;">
          Elevate's automated risk engine detected that your profile is currently in the <strong>Danger Zone</strong>. 
          Your cash flow reserves or debt service capacity have breached safe thresholds.
        </p>

        <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 16px; margin-bottom: 20px;">
          <p style="font-size: 11px; font-weight: 700; color: #f87171; text-transform: uppercase; margin: 0 0 8px 0;">IMMEDIATE RISK DRIVERS</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${riskFactorsList}
          </ul>
        </div>

        <div style="background-color: #0b0709; border-left: 4px solid #ef4444; padding: 14px 16px; border-radius: 4px; margin-bottom: 28px;">
          <p style="font-size: 11px; font-weight: 700; color: #fca5a5; text-transform: uppercase; margin: 0 0 4px 0;">HIGH IMPACT RECOMMENDED ACTION</p>
          <p style="font-size: 13px; color: #ffffff; margin: 0;">
            ${data.recommendedActions?.[0] || 'Avoid taking any new credit tranches and pause discretionary outflows immediately.'}
          </p>
        </div>

        <div align="center">
          <a href="${appUrl}" target="_blank" style="display: inline-block; background-color: #dc2626; color: #ffffff; font-size: 13px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);">
            Open Elevate Terminal &rarr; Review Health Alerts
          </a>
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding: 20px 32px; background-color: #0c0709; border-top: 1px solid #450a0a; text-align: center; font-size: 11px; color: #991b1b;">
        Elevate Automated Risk Monitoring System &bull; Instant Incident Notification
      </td>
    </tr>
  </table>
</body>
</html>
`;
}

/**
 * Transports an email notification using SMTP if configured, or audit log
 */
export async function sendEmailNotification(
  toEmail: string,
  subject: string,
  htmlContent: string
): Promise<EmailSendResult> {
  const fromEmail = process.env.EMAIL_FROM || '"Elevate Intelligence" <notifications@elevate.internal>';
  const transporter = createTransporter();

  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: fromEmail,
        to: toEmail,
        subject,
        html: htmlContent,
      });

      return {
        success: true,
        emailSent: true,
        deliveredVia: 'smtp',
        message: `Successfully dispatched email to ${toEmail} via SMTP server (Message ID: ${info.messageId}).`,
        messageId: info.messageId,
        previewHtml: htmlContent,
      };
    } catch (err: any) {
      console.error('SMTP sending error:', err);
      // Fallback to audit log delivery if SMTP transport fails
      return {
        success: true,
        emailSent: false,
        deliveredVia: 'audit_log',
        message: `SMTP connection error (${err.message}). Notification saved to Elevate Audit Log.`,
        previewHtml: htmlContent,
      };
    }
  }

  // Graceful audit log delivery when SMTP credentials are not yet configured in .env
  return {
    success: true,
    emailSent: false,
    deliveredVia: 'audit_log',
    message: `SMTP credentials not configured in environment. Full transactional email generated and securely recorded in user's audit log.`,
    previewHtml: htmlContent,
  };
}
