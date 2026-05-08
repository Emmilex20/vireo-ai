import { absoluteUrl } from "@/lib/seo";

export const IMAGE_LICENSE_URL = absoluteUrl("/terms-of-use");
export const IMAGE_ACQUIRE_LICENSE_PAGE_URL = absoluteUrl("/pricing");
export const DEFAULT_IMAGE_CREDIT_TEXT = "Vireon AI";
export const DEFAULT_IMAGE_COPYRIGHT_NOTICE =
  "Copyright Vireon AI and the publishing creator.";

export function getImageLicenseMetadata(creatorName?: string | null) {
  const normalizedCreatorName = creatorName?.trim();

  return {
    license: IMAGE_LICENSE_URL,
    acquireLicensePage: IMAGE_ACQUIRE_LICENSE_PAGE_URL,
    creditText: normalizedCreatorName
      ? `${normalizedCreatorName} via Vireon AI`
      : DEFAULT_IMAGE_CREDIT_TEXT,
    copyrightNotice: normalizedCreatorName
      ? `Copyright ${normalizedCreatorName}. Published with Vireon AI.`
      : DEFAULT_IMAGE_COPYRIGHT_NOTICE,
  };
}
