"use client";

import FeaturedServices from "@/components/FeaturedServices";
import CustomerReviews from "@/components/CustomerReviews";
import BoutiqueHero from "@/components/BoutiqueHero";
import { useBusinessSettings } from "@/hooks/useBusinessSettings";
import { getPublicBusinessName } from "@/lib/business-config";

export default function HomePage() {
  const { settings, isReady, loadError } = useBusinessSettings();
  const businessName = getPublicBusinessName(settings);
  const displaySettings = { ...settings, businessName };

  if (!isReady) {
    return (
      <div className="page-container flex min-h-[60vh] items-center justify-center py-20">
        <div className="loader-premium" role="status" aria-label="טוען" />
      </div>
    );
  }

  return (
    <>
      {loadError && (
        <div className="page-container pt-4">
          <p className="content-panel border-amber-200/80 bg-amber-50/95 px-4 py-3 text-center text-sm text-amber-900">
            לא ניתן לטעון את פרטי העסק כרגע. מוצגים ערכי ברירת מחדל.
          </p>
        </div>
      )}
      <BoutiqueHero settings={displaySettings} />
      <FeaturedServices />
      <CustomerReviews />
    </>
  );
}
