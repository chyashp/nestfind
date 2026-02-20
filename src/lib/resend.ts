import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EnquiryEmailParams {
  ownerName: string;
  ownerEmail: string;
  senderName: string;
  senderPhone: string | null;
  preferredDate: string | null;
  message: string;
  propertyTitle: string;
  propertyId: string;
}

export async function sendEnquiryEmail({
  ownerName,
  ownerEmail,
  senderName,
  senderPhone,
  preferredDate,
  message,
  propertyTitle,
  propertyId,
}: EnquiryEmailParams) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px 0;">
      <h2 style="color: #0f172a; margin: 0 0 8px;">New Enquiry Received</h2>
      <p style="color: #64748b; margin: 0 0 24px; font-size: 14px;">
        Someone is interested in your property listing.
      </p>

      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; font-size: 13px; color: #94a3b8;">Property</p>
        <p style="margin: 0; font-weight: 600; color: #0f172a;">${propertyTitle}</p>
      </div>

      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; font-size: 13px; color: #94a3b8;">From</p>
        <p style="margin: 0 0 12px; font-weight: 600; color: #0f172a;">${senderName}</p>

        ${senderPhone ? `<p style="margin: 0 0 4px; font-size: 13px; color: #94a3b8;">Phone</p><p style="margin: 0 0 12px; color: #0f172a;">${senderPhone}</p>` : ""}
        ${preferredDate ? `<p style="margin: 0 0 4px; font-size: 13px; color: #94a3b8;">Preferred Viewing Date</p><p style="margin: 0 0 12px; color: #0f172a;">${preferredDate}</p>` : ""}

        <p style="margin: 0 0 4px; font-size: 13px; color: #94a3b8;">Message</p>
        <p style="margin: 0; color: #0f172a; white-space: pre-line;">${message}</p>
      </div>

      <a href="${siteUrl}/dashboard/owner/enquiries"
         style="display: inline-block; background: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
        View Enquiry
      </a>

      <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
        This email was sent by NestFind because someone enquired about your property.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: "NestFind <onboarding@resend.dev>",
    to: ownerEmail,
    subject: `New enquiry for "${propertyTitle}"`,
    html,
  });
}
