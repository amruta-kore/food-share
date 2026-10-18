import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async (options: MailOptions) => {
  const fromAddress = process.env.EMAIL_USER || 'notifications@foodshare.org';
  const mailOptions = {
    from: `"FoodShare Platform" <${fromAddress}>`,
    ...options,
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log(`📨 [Simulated Email] To: ${options.to} | Subject: "${options.subject}"`);
      return { messageId: 'simulated-id' };
    }
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Email successfully delivered to ${options.to}:`, info.messageId);
    return info;
  } catch (err: any) {
    console.warn(`⚠️ Email delivery notice for ${options.to} (app continues normally):`, err?.message || err);
    return null;
  }
};

// 1. Email sent upon registration with document submission
export const sendRegistrationPendingEmail = async (email: string, name: string, role: string) => {
  return sendMail({
    to: email,
    subject: `Welcome to FoodShare! Your ${role} verification is under review`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #059669; margin-top: 0;">Welcome to FoodShare, ${name}!</h2>
        <p>Thank you for submitting your legal registration document for the <strong>${role}</strong> role.</p>
        <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <p style="margin: 0; font-weight: bold; color: #065f46;">⏳ Status: Verification Pending</p>
          <p style="margin: 4px 0 0; font-size: 13px; color: #047857;">Our platform administration is verifying your submitted document. You will receive an email as soon as your account is approved.</p>
        </div>
        <p style="font-size: 13px; color: #64748b;">Once verified, you will have full access to create donations, claim food, or take delivery missions.</p>
      </div>
    `,
  });
};

// 2. Email sent when Admin approves & verifies a user
export const sendAccountVerifiedEmail = async (email: string, name: string, role: string) => {
  return sendMail({
    to: email,
    subject: `🎉 Congratulations! Your FoodShare ${role} account is VERIFIED`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #059669; margin-top: 0;">🎉 You're Officially Verified!</h2>
        <p>Dear ${name},</p>
        <p>The FoodShare Platform Administrator has reviewed and approved your legal verification documents for the role of <strong>${role}</strong>.</p>
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <h4 style="margin: 0 0 8px; color: #065f46;">Full Platform Access Granted:</h4>
          <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #047857;">
            ${role === 'DONOR' ? '<li>You can now post edible surplus food donations with live notifications.</li>' : ''}
            ${role === 'NGO' ? '<li>You can now request and claim surplus food donations for your shelter.</li>' : ''}
            ${role === 'VOLUNTEER' ? '<li>You can now pick up and deliver food rescue missions across the city.</li>' : ''}
          </ul>
        </div>
        <a href="http://localhost:3000/login" style="display:inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Log In to Your Dashboard</a>
      </div>
    `,
  });
};

// 3. Email sent to Donor when an NGO requests their food
export const sendClaimRequestedEmailToDonor = async (
  donorEmail: string,
  donorName: string,
  ngoName: string,
  ngoOrg: string,
  foodName: string,
  quantity: number
) => {
  return sendMail({
    to: donorEmail,
    subject: `🔔 New Food Request: ${ngoOrg || ngoName} requested ${foodName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #2563eb; margin-top: 0;">New NGO Claim Request</h2>
        <p>Dear ${donorName},</p>
        <p>A verified NGO has requested your surplus food donation:</p>
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Food Item:</strong> ${foodName}</p>
          <p style="margin: 4px 0;"><strong>Quantity Requested:</strong> ${quantity} kg</p>
          <p style="margin: 4px 0;"><strong>Requesting Organization:</strong> ${ngoOrg || ngoName}</p>
        </div>
        <p>Please log in to your Donor Dashboard to accept or decline this claim.</p>
        <a href="http://localhost:3000/donor" style="display:inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Review Claim Request</a>
      </div>
    `,
  });
};

// 4. Email sent to NGO when Donor accepts their request
export const sendClaimAcceptedEmailToNGO = async (
  ngoEmail: string,
  ngoName: string,
  donorName: string,
  donorOrg: string,
  foodName: string,
  pickupAddress: string
) => {
  return sendMail({
    to: ngoEmail,
    subject: `✅ Claim Approved! ${donorOrg || donorName} accepted your request for ${foodName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #059669; margin-top: 0;">Food Request Accepted!</h2>
        <p>Dear ${ngoName},</p>
        <p>Great news! <strong>${donorOrg || donorName}</strong> has accepted your request for <strong>${foodName}</strong>.</p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Pickup Address:</strong> ${pickupAddress}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> Ready for pickup / awaiting volunteer dispatch.</p>
        </div>
        <a href="http://localhost:3000/ngo" style="display:inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Track in NGO Hub</a>
      </div>
    `,
  });
};

// 5. Broadcast to Volunteers when a delivery mission is available
export const sendNewMissionBroadcastEmailToVolunteers = async (
  volunteerEmails: string[],
  foodName: string,
  donorOrg: string,
  ngoOrg: string,
  city: string
) => {
  if (volunteerEmails.length === 0) return;
  for (const email of volunteerEmails) {
    sendMail({
      to: email,
      subject: `🚴 New Delivery Mission Available in ${city}: ${foodName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h2 style="color: #d97706; margin-top: 0;">New Food Rescue Mission!</h2>
          <p>A confirmed surplus food pickup is ready in <strong>${city}</strong>:</p>
          <div style="background-color: #fffbeb; border: 1px solid #fde68a; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Food:</strong> ${foodName}</p>
            <p style="margin: 4px 0;"><strong>Pickup:</strong> ${donorOrg}</p>
            <p style="margin: 4px 0;"><strong>Destination:</strong> ${ngoOrg}</p>
          </div>
          <p>Log in to claim this delivery mission before another volunteer takes it.</p>
          <a href="http://localhost:3000/volunteer" style="display:inline-block; padding: 12px 24px; background-color: #d97706; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">Claim Mission</a>
        </div>
      `,
    });
  }
};

// 6. Email when Volunteer claims delivery
export const sendVolunteerAssignedEmail = async (
  recipientEmail: string,
  recipientName: string,
  volunteerName: string,
  volunteerPhone: string,
  foodName: string
) => {
  return sendMail({
    to: recipientEmail,
    subject: `🛵 Volunteer Assigned for ${foodName}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #4f46e5; margin-top: 0;">Volunteer Couriers Dispatched</h2>
        <p>Dear ${recipientName},</p>
        <p>Volunteer <strong>${volunteerName}</strong> has claimed the delivery mission for <strong>${foodName}</strong>.</p>
        <div style="background-color: #eef2ff; border: 1px solid #c7d2fe; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>Volunteer Name:</strong> ${volunteerName}</p>
          <p style="margin: 4px 0;"><strong>Phone:</strong> ${volunteerPhone || 'Available in dashboard'}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> Heading to pickup location</p>
        </div>
      </div>
    `,
  });
};

// 7. Status updates (Picked up, Out for delivery, Delivered)
export const sendDeliveryStatusUpdateEmail = async (
  recipientEmail: string,
  recipientName: string,
  foodName: string,
  newStatus: string,
  volunteerName: string
) => {
  const statusLabels: Record<string, string> = {
    PICKED_UP: 'Food Picked Up by Volunteer',
    OUT_FOR_DELIVERY: 'Out for Delivery to Shelter',
    DELIVERED: 'Delivered to NGO Shelter',
    COMPLETED: 'Mission Successfully Completed!',
  };

  const label = statusLabels[newStatus] || newStatus;

  return sendMail({
    to: recipientEmail,
    subject: `📦 Delivery Update: ${label} (${foodName})`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #059669; margin-top: 0;">Status Update: ${label}</h2>
        <p>Dear ${recipientName},</p>
        <p>The status of surplus food item <strong>${foodName}</strong> has been updated by courier <strong>${volunteerName}</strong>:</p>
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <p style="margin: 0; font-size: 16px; font-weight: bold; color: #0f172a;">${label}</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #64748b;">Timestamp: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
  });
};

// Backward-compatible verification/reset stubs
export const sendVerificationEmail = async (email: string, token: string) => {
  const verifyUrl = `http://localhost:3000/verify-email?token=${token}`;
  return sendMail({
    to: email,
    subject: 'Verify your FoodShare Account',
    html: `<p>Verify email by clicking <a href="${verifyUrl}">here</a>.</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  return sendMail({
    to: email,
    subject: 'Reset your FoodShare Password',
    html: `<p>Reset password by clicking <a href="${resetUrl}">here</a>.</p>`,
  });
};

// 8. Forgot password email with newly generated 6-character password
export const sendForgotPasswordEmail = async (email: string, name: string, newPassword: string) => {
  return sendMail({
    to: email,
    subject: `🔐 Your New FoodShare Login Password: ${newPassword}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px;">
        <h2 style="color: #059669; margin-top: 0;">Password Reset Successful</h2>
        <p>Dear <strong>${name}</strong>,</p>
        <p>We received a forgot password request for your FoodShare account (<strong>${email}</strong>).</p>
        <p>Your password has been updated in our system. Here is your new randomly generated 6-character password:</p>
        <div style="background-color: #f8fafc; border: 2px dashed #059669; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
          <span style="font-size: 12px; color: #64748b; display: block; margin-bottom: 8px; text-transform: uppercase; font-weight: bold; letter-spacing: 1px;">Your New Login Password</span>
          <span style="font-family: 'Courier New', monospace; font-size: 32px; font-weight: 800; color: #0f172a; letter-spacing: 6px; background: #ffffff; padding: 8px 24px; border-radius: 8px; border: 1px solid #cbd5e1; display: inline-block;">${newPassword}</span>
        </div>
        <p style="font-size: 14px; color: #334155;">Please enter this 6-character password on the login screen to access your dashboard.</p>
        <div style="margin-top: 24px;">
          <a href="http://localhost:3000/login" style="display:inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">Sign In to FoodShare</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="font-size: 11px; color: #94a3b8; margin: 0;">If you did not initiate this request, please contact FoodShare administration immediately.</p>
      </div>
    `,
  });
};
