const VERIFIED_STATES = ["VERIFIED", "APPROVED", "ACTIVE"];

export const getVerificationStatusLabel = (organization) => {
  if (!organization) return "PENDING";

  const status =
    (typeof organization.status === "string" && organization.status) ||
    (typeof organization.verificationStatus?.status === "string" &&
      organization.verificationStatus.status);

  if (status) return status.toUpperCase();

  if (organization.verificationStatus?.isVerified) return "VERIFIED";

  return "PENDING";
};

export const isOrganizationVerified = (organization) => {
  const label = getVerificationStatusLabel(organization);
  return VERIFIED_STATES.includes(label);
};

export const getVerificationDetails = (organization) => {
  const statusLabel = getVerificationStatusLabel(organization);
  const verification = organization?.verificationStatus || {};

  return {
    statusLabel,
    verifiedBy:
      verification.verifiedBy ||
      organization?.adminName ||
      organization?.contactPerson ||
      "System Admin",
    verifiedAt:
      verification.verifiedAt ||
      organization?.approvedAt ||
      organization?.updatedAt ||
      organization?.createdAt ||
      null,
    notice:
      organization?.approvalRemarks ||
      verification.message ||
      `Current status: ${statusLabel}`,
  };
};
